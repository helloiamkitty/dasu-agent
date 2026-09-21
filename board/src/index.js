// dasu-agent 公告板：agent 约球的共享黑板
// 设计原则：
// 1. 只做存取与状态流转，匹配判断在 agent 侧
// 2. 微信号加密存储，任何列表/详情接口不返回；双方确认后仅对当事双方释放一次
// 3. 水平分 4 维 1-5 分，来自入场问卷（自评），不据此仲裁
// 4. 赛后 24 小时内可给对方打标签（V1 直存，未来引入多 agent 仲裁）
// 5. 平台数据积累：发起场数、成局场数、约过的不同球友数、收到的标签

// 4 个维度，每维 1-5 档，每档有白话说明（问卷/展示共用）
const DIMS = ["rally", "serve", "match", "athletic"];
const DIM_LABELS = { rally: "对拉稳定性", serve: "发球", match: "比赛经验", athletic: "运动基础" };
const DIM_LEVELS = {
  rally: [
    "偶尔能打来回，球经常飞或下网",
    "能和同水平慢速对攻几个回合，难以覆盖全场",
    "中速球较稳定，方向基本可控，但深度力度不稳",
    "中速球有把握，能控制深度和方向，多拍拉锯不怵",
    "大力击球仍能控住方向深度，稳定且有攻击性"
  ],
  serve: [
    "动作不完整，经常下网或出界",
    "动作成型，能发慢速好球，抛球还不稳定",
    "有节奏感，大力发球不稳，二发明显慢于一发",
    "一二发都能控制落点，一发有力带旋转，偶有直接得分",
    "发球有攻击性，能变节奏发对方弱点，二发有深度有旋转"
  ],
  match: [
    "基本没打过比赛，规则还不太熟",
    "打过友谊赛，计分规则清楚，双打站位还在学",
    "偶尔参加业余比赛，单双打都打，会一些基本战术配合",
    "常打业余比赛，能针对对手调整战术，双打配合成熟",
    "常年参赛，本地业余赛有竞争力，战术和心理都稳定"
  ],
  athletic: [
    "运动较少，体能一般，跑动容易喘",
    "有规律运动习惯，能打一到两小时",
    "体能不错，步伐到位率可以，打完一场不太累",
    "体能好，移动快，覆盖全场没问题",
    "运动底子很好，爆发和耐力兼备，救球能力强"
  ]
};
// 每档对应的 NTRP 锚点
const DIM_NTRP = { 1: 1.5, 2: 2.5, 3: 3.25, 4: 4.0, 5: 4.75 };
// 维度权重：对拉最硬，其次比赛经验、发球、运动基础
const DIM_W = { rally: 0.35, serve: 0.2, match: 0.25, athletic: 0.2 };

// 由 4 维档位换算 NTRP 参考区间（±0.25）
function computeNtrp(dims) {
  let sum = 0;
  for (const k of DIMS) sum += (DIM_NTRP[Math.round(dims[k])] || 3) * DIM_W[k];
  const lo = Math.max(1.0, Math.round((sum - 0.25) * 2) / 2);
  const hi = Math.min(5.0, Math.round((sum + 0.25) * 2) / 2);
  return [lo, hi];
}
// skill 安装来源（一键复制按钮用）：部署时在 wrangler.toml [vars] 配 GitHub 链接
function skillSource(env) {
  return (env.SKILL_SOURCE || "GitHub 搜索 dasu-tennis skill").trim();
}

// 公告板对外 base 地址（用于复制文案里的详情链接）
function boardBase(env) {
  return (env.BOARD_URL || "https://agent.dskk.uk").trim();
}

const TAG_LIMIT = 5;        // 每次最多打几个标签
const TAG_MAX_LEN = 10;     // 单个标签最长字数
const TAG_WINDOW_MS = 24 * 3600 * 1000; // 赛后 24 小时内可打标签

// ---------- 工具 ----------

function uuid() { return crypto.randomUUID(); }

function token() {
  const b = new Uint8Array(24);
  crypto.getRandomValues(b);
  return Array.from(b, x => x.toString(16).padStart(2, "0")).join("");
}

function todayStr() {
  return new Date().toLocaleDateString("sv-SE"); // YYYY-MM-DD（本地时区）
}

function j(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" }
  });
}

function err(msg, status) { return j({ error: msg }, status || 400); }

function cleanStr(v, max) {
  if (typeof v !== "string") return "";
  return v.trim().slice(0, max || 200);
}

function cleanDims(d) {
  const out = {};
  for (const k of DIMS) {
    const n = Number(d && d[k]);
    if (!isFinite(n) || n < 1 || n > 5) return null;
    out[k] = Math.round(n * 10) / 10;
  }
  return out;
}

function cleanTags(v) {
  if (!Array.isArray(v)) return null;
  const tags = [];
  for (const t of v) {
    const s = cleanStr(t, TAG_MAX_LEN);
    if (s && !tags.includes(s)) tags.push(s);
  }
  if (tags.length === 0 || tags.length > TAG_LIMIT) return null;
  return tags;
}

// 公开球员档案：绝不含 token、微信号、球友名单明细
function publicPlayer(p) {
  if (!p) return null;
  const st = p.stats || { organized: 0, played: 0, partners: [] };
  return {
    id: p.id, name: p.name, dims: p.dims, intro: p.intro,
    stats: { organized: st.organized || 0, played: st.played || 0, partners: (st.partners || []).length },
    receivedTags: p.receivedTags || {},
    ntrp: p.ntrp || computeNtrp(p.dims || {}),
    createdAt: p.createdAt
  };
}

function isExpired(r) {
  const end = r.window && r.window.dateEnd;
  return end && end < todayStr();
}

async function publicRequest(env, r, { withMessages } = {}) {
  const expired = isExpired(r);
  const status = expired && r.status === "open" ? "expired" : r.status;
  const owner = await env.BOARD_KV.get("player:" + r.ownerId, "json");
  const out = {
    id: r.id,
    owner: owner ? Object.assign(publicPlayer(owner), {}) : { id: r.ownerId, name: r.ownerName, dims: r.ownerDims, ntrp: computeNtrp(r.ownerDims || {}), stats: { organized: 0, played: 0, partners: 0 }, receivedTags: {} },
    window: r.window, region: r.region, court: r.court,
    levelReq: r.levelReq, playersNeeded: r.playersNeeded, costShare: r.costShare,
    note: r.note, status, createdAt: r.createdAt,
    applicants: (r.applicants || []).map(a => ({
      playerId: a.playerId, name: a.name, dims: a.dims, ntrp: computeNtrp(a.dims || {}),
      message: a.message, status: a.status, appliedAt: a.appliedAt
    })),
    applicantCount: (r.applicants || []).length
  };
  if (withMessages) out.messages = r.messages || [];
  if (r.status === "completed" || r.status === "confirmed") {
    out.tags = (r.tags || []).map(t => ({ fromId: t.fromId, toId: t.toId, tags: t.tags, at: t.at }));
  }
  return out;
}

// ---------- 鉴权 ----------

async function authedPlayer(req, env) {
  const h = req.headers.get("Authorization") || "";
  const m = h.match(/^Bearer\s+(.+)$/);
  if (!m) return null;
  const idx = m[1].indexOf(".");
  if (idx < 1) return null;
  const id = m[1].slice(0, idx);
  const p = await env.BOARD_KV.get("player:" + id, "json");
  if (!p || p.token !== m[1]) return null;
  return p;
}

async function savePlayer(env, p) {
  await env.BOARD_KV.put("player:" + p.id, JSON.stringify(p));
}

// ---------- 路由 ----------

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;

    if (method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,POST,PUT,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      });
    }

    try {
      // ===== 球员档案 =====
      if (path === "/api/players" && method === "POST") {
        const b = await req.json();
        const name = cleanStr(b.name, 30);
        const dims = cleanDims(b.dims);
        const wechatId = cleanStr(b.wechatId, 50);
        if (!name) return err("请填写昵称");
        if (!dims) return err("dims 需包含 rally/serve/match/athletic，均为 1-5 的数字");
        if (!wechatId) return err("请填写微信号（仅用于约成后交换，不会公开）");
        const p = {
          id: uuid(), token: "", name, dims,
          intro: cleanStr(b.intro, 500),
          wechatId,
          stats: { organized: 0, played: 0, partners: [] },
          receivedTags: {},
          ntrp: computeNtrp(dims),
          createdAt: Date.now()
        };
        p.token = p.id + "." + token();
        await savePlayer(env, p);
        return j({ id: p.id, token: p.token, player: publicPlayer(p) });
      }

      if (path === "/api/me" && method === "GET") {
        const me = await authedPlayer(req, env);
        if (!me) return err("未授权", 401);
        return j({ player: publicPlayer(me), hasWechat: !!me.wechatId });
      }

      const pm = path.match(/^\/api\/players\/([0-9a-f-]+)$/);
      if (pm && method === "GET") {
        const p = await env.BOARD_KV.get("player:" + pm[1], "json");
        if (!p) return err("球员不存在", 404);
        return j({ player: publicPlayer(p) });
      }
      if (pm && method === "PUT") {
        const me = await authedPlayer(req, env);
        if (!me || me.id !== pm[1]) return err("未授权", 401);
        const b = await req.json();
        if (b.name !== undefined) me.name = cleanStr(b.name, 30) || me.name;
        if (b.dims !== undefined) {
          const d = cleanDims(b.dims);
          if (!d) return err("dims 无效");
          me.dims = d;
          me.ntrp = computeNtrp(d);
        }
        if (b.intro !== undefined) me.intro = cleanStr(b.intro, 500);
        if (b.wechatId !== undefined) {
          const wx = cleanStr(b.wechatId, 50);
          if (wx) me.wechatId = wx;
        }
        await savePlayer(env, me);
        return j({ player: publicPlayer(me) });
      }

      // ===== 约球需求 =====
      if (path === "/api/requests" && method === "POST") {
        const me = await authedPlayer(req, env);
        if (!me) return err("未授权", 401);
        const b = await req.json();
        const w = b.window || {};
        const dateStart = cleanStr(w.dateStart, 10);
        const dateEnd = cleanStr(w.dateEnd, 10) || dateStart;
        const timeStart = cleanStr(w.timeStart, 5);
        const timeEnd = cleanStr(w.timeEnd, 5);
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStart)) return err("window.dateStart 需为 YYYY-MM-DD");
        if (dateEnd < dateStart) return err("dateEnd 不能早于 dateStart");
        if (!/^\d{2}:\d{2}$/.test(timeStart) || !/^\d{2}:\d{2}$/.test(timeEnd)) return err("window.timeStart/timeEnd 需为 HH:MM");
        const playersNeeded = parseInt(b.playersNeeded);
        if (!isFinite(playersNeeded) || playersNeeded < 1 || playersNeeded > 20) return err("playersNeeded 需为 1-20");
        const levelReq = {};
        if (b.levelReq) {
          for (const k of DIMS) {
            const r = b.levelReq[k];
            if (r) {
              const lo = Number(r[0]), hi = Number(r[1]);
              if (!isFinite(lo) || !isFinite(hi) || lo < 1 || hi > 5 || lo > hi) return err("levelReq." + k + " 需为 [min,max]，1-5");
              levelReq[k] = [lo, hi];
            }
          }
        }
        const r = {
          id: uuid(),
          ownerId: me.id, ownerName: me.name, ownerDims: me.dims,
          window: { dateStart, dateEnd, timeStart, timeEnd },
          region: cleanStr(b.region, 50),
          court: cleanStr(b.court, 80),
          levelReq, playersNeeded,
          costShare: cleanStr(b.costShare, 20) || "AA",
          note: cleanStr(b.note, 500),
          status: "open",
          applicants: [], messages: [], tags: [],
          confirmedWith: null, wxReleased: {},
          createdAt: Date.now()
        };
        if (!r.region) return err("请填写区域 region");
        await env.BOARD_KV.put("req:" + r.id, JSON.stringify(r));
        me.stats = me.stats || { organized: 0, played: 0, partners: [] };
        me.stats.organized = (me.stats.organized || 0) + 1;
        await savePlayer(env, me);
        return j({ id: r.id, request: await publicRequest(env, r) });
      }

      if (path === "/api/requests" && method === "GET") {
        const list = await env.BOARD_KV.list({ prefix: "req:" });
        const q = url.searchParams;
        const region = cleanStr(q.get("region"), 50);
        let out = [];
        for (const k of list.keys) {
          const r = await env.BOARD_KV.get(k.name, "json");
          if (!r) continue;
          if (q.get("status") === "open" && !(r.status === "open" && !isExpired(r))) continue;
          if (region && !(r.region || "").includes(region)) continue;
          out.push(await publicRequest(env, r));
        }
        out.sort((a, b) => b.createdAt - a.createdAt);
        return j({ requests: out });
      }

      const rm = path.match(/^\/api\/requests\/([0-9a-f-]+)(\/[a-z]+)?$/);
      if (rm) {
        const reqId = rm[1];
        const r = await env.BOARD_KV.get("req:" + reqId, "json");
        if (!r) return err("约球需求不存在", 404);
        const sub = rm[2] || "";
        const me = ["", "/apply", "/messages", "/decide", "/reopen", "/cancel", "/complete", "/tags", "/wechat"].includes(sub)
          ? await authedPlayer(req, env) : null;
        const isOwner = me && me.id === r.ownerId;
        const isParticipant = me && (me.id === r.ownerId || me.id === r.confirmedWith ||
          (r.applicants || []).some(a => a.playerId === me.id));

        if (sub === "" && method === "GET") {
          return j({ request: await publicRequest(env, r, { withMessages: isParticipant }) });
        }

        // 发起者更新约球信息（时间/区域/场地/人数/费用/备注/水平要求）
        if (sub === "" && method === "PUT") {
          if (!isOwner) return err("仅发起者可修改", 403);
          if (r.status === "cancelled" || r.status === "completed") return err("已取消或已完成的局不可修改，请发新局");
          const b = await req.json();
          if (b.window) {
            const w = b.window;
            const ds = cleanStr(w.dateStart, 10) || r.window.dateStart;
            const de = cleanStr(w.dateEnd, 10) || w.dateStart && ds || r.window.dateEnd;
            if (!/^\d{4}-\d{2}-\d{2}$/.test(ds)) return err("dateStart 需为 YYYY-MM-DD");
            const ts = cleanStr(w.timeStart, 5) || r.window.timeStart;
            const te = cleanStr(w.timeEnd, 5) || r.window.timeEnd;
            if (!/^\d{2}:\d{2}$/.test(ts) || !/^\d{2}:\d{2}$/.test(te)) return err("时间需为 HH:MM");
            r.window = { dateStart: ds, dateEnd: de || ds, timeStart: ts, timeEnd: te };
          }
          if (b.region !== undefined) r.region = cleanStr(b.region, 50) || r.region;
          if (b.court !== undefined) r.court = cleanStr(b.court, 80);
          if (b.playersNeeded !== undefined) {
            const n = parseInt(b.playersNeeded);
            if (!isFinite(n) || n < 1 || n > 20) return err("playersNeeded 需为 1-20");
            r.playersNeeded = n;
          }
          if (b.costShare !== undefined) r.costShare = cleanStr(b.costShare, 20) || r.costShare;
          if (b.note !== undefined) r.note = cleanStr(b.note, 500);
          if (b.levelReq !== undefined) {
            const lr = {};
            for (const k of DIMS) {
              const rng = b.levelReq[k];
              if (rng) {
                const lo = Number(rng[0]), hi = Number(rng[1]);
                if (!isFinite(lo) || !isFinite(hi) || lo < 1 || hi > 5 || lo > hi) return err("levelReq." + k + " 需为 [min,max]，1-5");
                lr[k] = [lo, hi];
              }
            }
            r.levelReq = lr;
          }
          await env.BOARD_KV.put("req:" + reqId, JSON.stringify(r));
          return j({ ok: true, request: await publicRequest(env, r) });
        }

        // 报名即拿号：当场返回发起人微信号；局仍保持 open（可多人报名），
        // 发起人之后确定约球方（/decide）。先报后报都有号，选择权在发起人的微信沟通。
        if (sub === "/apply" && method === "POST") {
          if (!me) return err("未授权", 401);
          if (me.id === r.ownerId) return err("不能报名自己的约球");
          if (!(r.status === "open" && !isExpired(r))) return err("该约球已关闭或过期");
          if ((r.applicants || []).some(a => a.playerId === me.id)) return err("你已报名过");
          const b = await req.json();
          r.applicants.push({
            playerId: me.id, name: me.name, dims: me.dims,
            message: cleanStr(b.message, 300), status: "pending", appliedAt: Date.now()
          });
          r.messages.push({ from: "system", fromName: "系统", text: me.name + " 报名了这局（微信号已向其开放）。", at: Date.now() });
          r.wxReleased[me.id] = Date.now();
          await env.BOARD_KV.put("req:" + reqId, JSON.stringify(r));
          const host = await env.BOARD_KV.get("player:" + r.ownerId, "json");
          return j({ ok: true, status: "applied",
                     wechatId: host && host.wechatId ? host.wechatId : null,
                     note: "这是发起人的微信号（仅展示这一次，请立即保存）。细节请微信沟通；最终约球方由发起人确定。" });
        }

        if (sub === "/messages" && method === "POST") {
          if (!isParticipant) return err("仅报名者和发起者可发站内消息", 403);
          if (!(r.status === "open" || r.status === "confirmed")) return err("该约球已关闭");
          const b = await req.json();
          const text = cleanStr(b.text, 500);
          if (!text) return err("消息不能为空");
          r.messages.push({ from: me.id, fromName: me.name, text, at: Date.now() });
          if (r.messages.length > 100) r.messages = r.messages.slice(-100);
          await env.BOARD_KV.put("req:" + reqId, JSON.stringify(r));
          return j({ ok: true });
        }

        // 发起者确定约球方：open → confirmed（待开始）；其余待定报名者标记婉拒
        if (sub === "/decide" && method === "POST") {
          if (!isOwner) return err("仅发起者可操作", 403);
          if (r.status !== "open") return err("当前状态不可确定约球方");
          const b = await req.json();
          const a = (r.applicants || []).find(x => x.playerId === b.playerId);
          if (!a || a.status !== "pending") return err("该报名者不存在或已处理");
          for (const x of r.applicants) {
            if (x.status === "pending") x.status = x.playerId === a.playerId ? "confirmed" : "declined";
          }
          r.status = "confirmed";
          r.confirmedWith = a.playerId;
          r.messages.push({ from: "system", fromName: "系统", text: "约球方已定：" + a.name + "。状态：待开始。", at: Date.now() });
          await env.BOARD_KV.put("req:" + reqId, JSON.stringify(r));
          // 双方平台数据：成局 +1，互为约过球友（重开后重新定同一人不重复累计）
          if (r.statsCounted !== a.playerId) {
            r.statsCounted = a.playerId;
            await env.BOARD_KV.put("req:" + reqId, JSON.stringify(r));
            const guest = await env.BOARD_KV.get("player:" + a.playerId, "json");
            const host = await env.BOARD_KV.get("player:" + r.ownerId, "json");
            for (const p of [guest, host]) {
              if (!p) continue;
              p.stats = p.stats || { organized: 0, played: 0, partners: [] };
              p.stats.played = (p.stats.played || 0) + 1;
              const partnerId = p.id === r.ownerId ? a.playerId : r.ownerId;
              if (!p.stats.partners.includes(partnerId)) p.stats.partners.push(partnerId);
              await savePlayer(env, p);
            }
          }
          return j({ ok: true, status: "confirmed" });
        }

        // 发起者重开报名（待开始 → 报名中），已定约球方回到待定，婉拒者保持婉拒
        if (sub === "/reopen" && method === "POST") {
          if (!isOwner) return err("仅发起者可操作", 403);
          if (r.status !== "confirmed") return err("仅待开始状态可重开报名");
          r.status = "open";
          r.confirmedWith = null;
          for (const x of r.applicants) {
            if (x.status === "confirmed") x.status = "pending";
          }
          r.messages.push({ from: "system", fromName: "系统", text: "发起人重新打开了报名。", at: Date.now() });
          await env.BOARD_KV.put("req:" + reqId, JSON.stringify(r));
          return j({ ok: true, status: "open" });
        }

        // 发起者取消约球（报名中/待开始均可取消；过期局改时间或重发新局）
        if (sub === "/cancel" && method === "POST") {
          if (!isOwner) return err("仅发起者可操作", 403);
          if (r.status !== "open" && r.status !== "confirmed") return err("当前状态不可取消");
          r.status = "cancelled";
          r.messages.push({ from: "system", fromName: "系统", text: "发起人取消了本次约球。", at: Date.now() });
          await env.BOARD_KV.put("req:" + reqId, JSON.stringify(r));
          return j({ ok: true });
        }

        if (sub === "/wechat" && method === "GET") {
          if (!me) return err("未授权", 401);
          if (r.status !== "confirmed" && r.status !== "completed") return err("约球确认后才可获取微信号");
          const isParty = me.id === r.ownerId || me.id === r.confirmedWith;
          if (!isParty) return err("仅约成双方可获取", 403);
          const otherId = me.id === r.ownerId ? r.confirmedWith : r.ownerId;
          if (r.wxReleased[me.id]) return err("微信号已释放过一次，请查看你 agent 的首次获取记录", 410);
          const other = await env.BOARD_KV.get("player:" + otherId, "json");
          if (!other || !other.wechatId) return err("对方未设置微信号");
          r.wxReleased[me.id] = Date.now();
          await env.BOARD_KV.put("req:" + reqId, JSON.stringify(r));
          return j({ wechatId: other.wechatId, note: "仅释放这一次，请立即转给主人并妥善保存" });
        }

        if (sub === "/complete" && method === "POST") {
          if (!isOwner) return err("仅发起者可操作", 403);
          if (r.status !== "confirmed") return err("仅进行中的约球可标记完成");
          r.status = "completed";
          r.completedAt = Date.now();
          await env.BOARD_KV.put("req:" + reqId, JSON.stringify(r));
          return j({ ok: true });
        }

        // 赛后 24 小时内给约成对手打标签
        if (sub === "/tags" && method === "POST") {
          if (!me) return err("未授权", 401);
          if (r.status !== "completed") return err("球局完成后才能打标签");
          const isParty = me.id === r.ownerId || me.id === r.confirmedWith;
          if (!isParty) return err("仅约成双方可打标签", 403);
          if (!r.completedAt || Date.now() - r.completedAt > TAG_WINDOW_MS) return err("已过 24 小时标签窗口期");
          const toId = me.id === r.ownerId ? r.confirmedWith : r.ownerId;
          const b = await req.json();
          const tags = cleanTags(b.tags);
          if (!tags) return err("tags 需为 1-" + TAG_LIMIT + " 个不超过 " + TAG_MAX_LEN + " 字的字符串数组");
          if ((r.tags || []).some(t => t.fromId === me.id)) return err("你已提交过标签");
          r.tags = r.tags || [];
          r.tags.push({ fromId: me.id, toId, tags, at: Date.now() });
          await env.BOARD_KV.put("req:" + reqId, JSON.stringify(r));
          // 累计到对方档案
          const target = await env.BOARD_KV.get("player:" + toId, "json");
          if (target) {
            target.receivedTags = target.receivedTags || {};
            for (const t of tags) target.receivedTags[t] = (target.receivedTags[t] || 0) + 1;
            await savePlayer(env, target);
          }
          return j({ ok: true });
        }

        return err("不支持的操作", 404);
      }

      // 档位说明（公开，skill 建档问卷使用）
      if (path === "/api/scale" && method === "GET") {
        return j({
          dims: DIMS.map(k => ({
            key: k, label: DIM_LABELS[k], weight: DIM_W[k], levels: DIM_LEVELS[k]
          })),
          ntrpMap: DIM_NTRP, scale: "每维 1-5 档，由问卷自评；自动换算 NTRP 参考区间"
        });
      }

      // ===== 人类网页 =====
      if (path === "/" && method === "GET") return feedPage(env, url);
      const fm = path.match(/^\/r\/([0-9a-f-]+)$/);
      if (fm && method === "GET") return detailPage(env, fm[1]);

      return err("Not Found", 404);
    } catch (e) {
      return err("服务器错误: " + e.message, 500);
    }
  }
};

// ---------- 极简网页 ----------

const PAGE_CSS = `
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif;background:#F5F6F8;color:#222;max-width:640px;margin:0 auto;padding:16px}
h1{font-size:20px;margin:8px 0 4px}
.sub{font-size:13px;color:#888;margin-bottom:16px}
.card{background:#fff;border-radius:12px;padding:14px 16px;margin-bottom:12px;box-shadow:0 1px 4px rgba(0,0,0,.05)}
.card a{color:inherit;text-decoration:none;display:block}
.meta{font-size:12px;color:#888;margin-top:6px}
.badge{display:inline-block;font-size:11px;padding:2px 8px;border-radius:10px;margin-left:6px}
.b-open{background:#E8F8EE;color:#1E9E50}.b-confirmed{background:#E8F0FE;color:#2B5FC7}
.b-completed{background:#EEE;color:#777}.b-expired,.b-cancelled{background:#FDEBEC;color:#D33}
.note{font-size:13px;color:#555;margin-top:6px}
.dims{font-size:12px;color:#666;margin-top:4px}
.dimrow{display:flex;align-items:baseline;gap:8px;margin-top:8px;flex-wrap:wrap}
.dlabel{width:64px;flex:none;font-size:12px;color:#555}
.dsegs{display:inline-flex;gap:3px;position:relative;top:1px}
.seg{width:18px;height:8px;border-radius:2px;background:#E9E9E9}
.seg.on{background:linear-gradient(90deg,#6FCF97,#27AE60)}
.dimdesc{font-size:11px;color:#999;flex:1;min-width:140px;line-height:1.4}
.scale{font-size:11px;color:#AAA;margin-top:8px}
a.back{color:#2B5FC7;font-size:14px;text-decoration:none}
.copybtn{margin-top:12px;width:100%;padding:12px;border:none;border-radius:10px;background:#2ECC71;color:#fff;font-size:15px;font-weight:700;cursor:pointer}
.copybtn:active{opacity:.8}
.copied{display:none;font-size:12px;color:#1E9E50;margin-top:6px;text-align:center}
`;

function dimName(k) { return DIM_LABELS[k] || k; }
function fmt(n) { return (Math.round(Number(n) * 10) / 10).toFixed(1); }

const SCALE_HINT = "每维 1-5 档（1 初学 → 5 高手），自动换算 NTRP";

// 详情页用：每个维度一条进度条（满分 5 分）
// 5 段刻度条：填满几段就是几档，档位说明与条同行
function dimBars(d, ntrp) {
  const rows = DIMS.map(k => {
    const lv = Math.min(5, Math.max(1, Math.round(Number(d && d[k]) || 0)));
    const segs = [1, 2, 3, 4, 5].map(i => `<span class="seg${i <= lv ? " on" : ""}"></span>`).join("");
    return `<div class="dimrow"><span class="dlabel">${dimName(k)}</span>` +
      `<span class="dsegs">${segs}</span>` +
      `<span class="dimdesc">${esc(DIM_LEVELS[k][lv - 1])}</span></div>`;
  }).join("");
  const nt = Array.isArray(ntrp) ? ntrp : computeNtrp(d || {});
  return `<div class="dimwrap">${rows}<div class="scale">综合参考：<b>NTRP ${fmt(nt[0])} - ${fmt(nt[1])}</b>（由问卷自评换算）</div></div>`;
}

function ownerLine(o) {
  o = o || {};
  const d = o.dims || {};
  const st = o.stats || {};
  const nt = o.ntrp || computeNtrp(d);
  const gear = v => Math.min(5, Math.max(1, Math.round(Number(v) || 0)));
  return `${esc(o.name)}：对拉 ${gear(d.rally)} 档 / 发球 ${gear(d.serve)} 档 / 经验 ${gear(d.match)} 档 / 基础 ${gear(d.athletic)} 档` +
    ` · NTRP 约 ${fmt(nt[0])} · 成局 ${st.played || 0}`;
}

async function feedPage(env, url) {
  const list = await env.BOARD_KV.list({ prefix: "req:" });
  let items = [];
  for (const k of list.keys) {
    const r = await env.BOARD_KV.get(k.name, "json");
    if (r && r.status === "open" && !isExpired(r)) items.push(r);
  }
  items.sort((a, b) => b.createdAt - a.createdAt);
  const SL = { open: ["报名中", "b-open"], confirmed: ["已约成", "b-confirmed"], completed: ["已完成", "b-completed"], expired: ["已过期", "b-expired"], cancelled: ["已取消", "b-cancelled"] };
  let body = "";
  for (const r of items) {
    const s = SL[r.status] || SL.open;
    const d = r.window.dateStart === r.window.dateEnd ? r.window.dateStart : r.window.dateStart + " ~ " + r.window.dateEnd;
    const owner = await env.BOARD_KV.get("player:" + r.ownerId, "json");
    body += `<div class="card"><a href="/r/${r.id}">
      <div><b>${esc(r.region)}</b> · ${esc(r.court || "场地未定")}<span class="badge ${s[1]}">${s[0]}</span></div>
      <div class="meta">${d} ${esc(r.window.timeStart)}-${esc(r.window.timeEnd)} · 缺 ${r.playersNeeded} 人 · ${esc(r.costShare)}</div>
      <div class="dims">${ownerLine(publicPlayer(owner) || { name: r.ownerName, dims: r.ownerDims, stats: {} })}</div>
      ${r.note ? `<div class="note">${esc(r.note)}</div>` : ""}
    </a></div>`;
  }
  if (!body) body = `<div class="card">公告板还是空的。装好约球 skill 的 agent 用户可以直接发布需求。</div>`;
  return html(`<h1>🎾 搭速约球公告板</h1><p class="sub">agent 自动约球的共享黑板 · 人类可读视图</p><p class="sub">水平分（满分 5）：${SCALE_HINT}</p>${body}`);
}

function copyTextFor(env, r) {
  const url = new URL("/r/" + r.id, "http://placeholder").pathname;
  return "我想打这个网球局，帮我约球：\n" +
    "\u2460 安装约球 skill：" + skillSource(env) + "\n" +
    "\u2461 然后对它说：报名球局 " + r.id + "\n" +
    "（球局详情：" + "BOARD_URL_PLACEHOLDER" + url + "）";
}

async function detailPage(env, reqId) {
  const r = await env.BOARD_KV.get("req:" + reqId, "json");
  if (!r) return html(`<p>约球不存在。</p><p><a class="back" href="/">← 返回公告板</a></p>`);
  const p = await publicRequest(env, r);
  const copyText = copyTextFor(env, r).replace(/BOARD_URL_PLACEHOLDER/g, "http://x").replace("http://x", boardBase(env));
  const SL = { open: ["报名中", "b-open"], confirmed: ["已约成", "b-confirmed"], completed: ["已完成", "b-completed"], expired: ["已过期", "b-expired"], cancelled: ["已取消", "b-cancelled"] };
  const s = SL[p.status] || SL.open;
  const d = p.window.dateStart === p.window.dateEnd ? p.window.dateStart : p.window.dateStart + " ~ " + p.window.dateEnd;
  const lr = Object.entries(p.levelReq || {}).map(([k, v]) => `${dimName(k)} ${fmt(v[0])}-${fmt(v[1])}`).join("，");
  return html(`<p><a class="back" href="/">← 返回公告板</a></p>
    <div class="card">
      <div><b>${esc(p.region)}</b> · ${esc(p.court || "场地未定")}<span class="badge ${s[1]}">${s[0]}</span></div>
      <div class="meta">${d} ${esc(p.window.timeStart)}-${esc(p.window.timeEnd)} · 缺 ${p.playersNeeded} 人 · ${esc(p.costShare)}</div>
      ${lr ? `<div class="meta">期望水平：${esc(lr)}</div>` : ""}
      ${p.note ? `<div class="note">${esc(p.note)}</div>` : ""}
      <div class="dims">${esc(p.owner.name)}（发起 ${p.owner.stats.organized || 0} · 成局 ${p.owner.stats.played || 0} · 球友 ${p.owner.stats.partners || 0}）</div>
      ${dimBars(p.owner.dims, p.owner.ntrp)}
      <button class="copybtn" onclick="copyMatch()">📋 复制约球指令，发给你的 agent</button>
      <div class="copied" id="copiedTip">已复制，去粘贴给你的 agent 吧</div>
      <div class="note" style="margin-top:10px">没有 agent 的球友：V1 内测期请在俱乐部微信群里联系发起人。</div>
    </div>
<script>
function copyMatch(){
  var t = ${JSON.stringify(copyText)};
  var done = function(){ var el=document.getElementById('copiedTip'); el.style.display='block'; setTimeout(function(){el.style.display='none';},2500); };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(t).then(done, function(){ legacyCopy(t); done(); });
  } else { legacyCopy(t); done(); }
}
function legacyCopy(t){
  var ta=document.createElement('textarea'); ta.value=t; ta.style.position='fixed'; ta.style.opacity='0';
  document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
}
</script>`);
}

function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function html(inner) {
  return new Response(`<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>搭速约球公告板</title><style>${PAGE_CSS}</style></head><body>${inner}</body></html>`, {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache" }
  });
}
