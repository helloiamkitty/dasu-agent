var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-pTzx3h/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// src/index.js
var DIMS = ["rally", "serve", "match", "athletic"];
var DIM_LABELS = { rally: "\u5BF9\u62C9\u7A33\u5B9A\u6027", serve: "\u53D1\u7403", match: "\u6BD4\u8D5B\u7ECF\u9A8C", athletic: "\u8FD0\u52A8\u57FA\u7840" };
var DIM_LEVELS = {
  rally: [
    "\u5076\u5C14\u80FD\u6253\u6765\u56DE\uFF0C\u7403\u7ECF\u5E38\u98DE\u6216\u4E0B\u7F51",
    "\u80FD\u548C\u540C\u6C34\u5E73\u6162\u901F\u5BF9\u653B\u51E0\u4E2A\u56DE\u5408\uFF0C\u96BE\u4EE5\u8986\u76D6\u5168\u573A",
    "\u4E2D\u901F\u7403\u8F83\u7A33\u5B9A\uFF0C\u65B9\u5411\u57FA\u672C\u53EF\u63A7\uFF0C\u4F46\u6DF1\u5EA6\u529B\u5EA6\u4E0D\u7A33",
    "\u4E2D\u901F\u7403\u6709\u628A\u63E1\uFF0C\u80FD\u63A7\u5236\u6DF1\u5EA6\u548C\u65B9\u5411\uFF0C\u591A\u62CD\u62C9\u952F\u4E0D\u6035",
    "\u5927\u529B\u51FB\u7403\u4ECD\u80FD\u63A7\u4F4F\u65B9\u5411\u6DF1\u5EA6\uFF0C\u7A33\u5B9A\u4E14\u6709\u653B\u51FB\u6027"
  ],
  serve: [
    "\u52A8\u4F5C\u4E0D\u5B8C\u6574\uFF0C\u7ECF\u5E38\u4E0B\u7F51\u6216\u51FA\u754C",
    "\u52A8\u4F5C\u6210\u578B\uFF0C\u80FD\u53D1\u6162\u901F\u597D\u7403\uFF0C\u629B\u7403\u8FD8\u4E0D\u7A33\u5B9A",
    "\u6709\u8282\u594F\u611F\uFF0C\u5927\u529B\u53D1\u7403\u4E0D\u7A33\uFF0C\u4E8C\u53D1\u660E\u663E\u6162\u4E8E\u4E00\u53D1",
    "\u4E00\u4E8C\u53D1\u90FD\u80FD\u63A7\u5236\u843D\u70B9\uFF0C\u4E00\u53D1\u6709\u529B\u5E26\u65CB\u8F6C\uFF0C\u5076\u6709\u76F4\u63A5\u5F97\u5206",
    "\u53D1\u7403\u6709\u653B\u51FB\u6027\uFF0C\u80FD\u53D8\u8282\u594F\u53D1\u5BF9\u65B9\u5F31\u70B9\uFF0C\u4E8C\u53D1\u6709\u6DF1\u5EA6\u6709\u65CB\u8F6C"
  ],
  match: [
    "\u57FA\u672C\u6CA1\u6253\u8FC7\u6BD4\u8D5B\uFF0C\u89C4\u5219\u8FD8\u4E0D\u592A\u719F",
    "\u6253\u8FC7\u53CB\u8C0A\u8D5B\uFF0C\u8BA1\u5206\u89C4\u5219\u6E05\u695A\uFF0C\u53CC\u6253\u7AD9\u4F4D\u8FD8\u5728\u5B66",
    "\u5076\u5C14\u53C2\u52A0\u4E1A\u4F59\u6BD4\u8D5B\uFF0C\u5355\u53CC\u6253\u90FD\u6253\uFF0C\u4F1A\u4E00\u4E9B\u57FA\u672C\u6218\u672F\u914D\u5408",
    "\u5E38\u6253\u4E1A\u4F59\u6BD4\u8D5B\uFF0C\u80FD\u9488\u5BF9\u5BF9\u624B\u8C03\u6574\u6218\u672F\uFF0C\u53CC\u6253\u914D\u5408\u6210\u719F",
    "\u5E38\u5E74\u53C2\u8D5B\uFF0C\u672C\u5730\u4E1A\u4F59\u8D5B\u6709\u7ADE\u4E89\u529B\uFF0C\u6218\u672F\u548C\u5FC3\u7406\u90FD\u7A33\u5B9A"
  ],
  athletic: [
    "\u8FD0\u52A8\u8F83\u5C11\uFF0C\u4F53\u80FD\u4E00\u822C\uFF0C\u8DD1\u52A8\u5BB9\u6613\u5598",
    "\u6709\u89C4\u5F8B\u8FD0\u52A8\u4E60\u60EF\uFF0C\u80FD\u6253\u4E00\u5230\u4E24\u5C0F\u65F6",
    "\u4F53\u80FD\u4E0D\u9519\uFF0C\u6B65\u4F10\u5230\u4F4D\u7387\u53EF\u4EE5\uFF0C\u6253\u5B8C\u4E00\u573A\u4E0D\u592A\u7D2F",
    "\u4F53\u80FD\u597D\uFF0C\u79FB\u52A8\u5FEB\uFF0C\u8986\u76D6\u5168\u573A\u6CA1\u95EE\u9898",
    "\u8FD0\u52A8\u5E95\u5B50\u5F88\u597D\uFF0C\u7206\u53D1\u548C\u8010\u529B\u517C\u5907\uFF0C\u6551\u7403\u80FD\u529B\u5F3A"
  ]
};
var DIM_NTRP = { 1: 1.5, 2: 2.5, 3: 3.25, 4: 4, 5: 4.75 };
var DIM_W = { rally: 0.35, serve: 0.2, match: 0.25, athletic: 0.2 };
function computeNtrp(dims) {
  let sum = 0;
  for (const k of DIMS) sum += (DIM_NTRP[Math.round(dims[k])] || 3) * DIM_W[k];
  const lo = Math.max(1, Math.round((sum - 0.25) * 2) / 2);
  const hi = Math.min(5, Math.round((sum + 0.25) * 2) / 2);
  return [lo, hi];
}
__name(computeNtrp, "computeNtrp");
function skillSource(env) {
  return (env.SKILL_SOURCE || "GitHub \u641C\u7D22 dasu-tennis skill").trim();
}
__name(skillSource, "skillSource");
function boardBase(env) {
  return (env.BOARD_URL || "https://agent.dskk.uk").trim();
}
__name(boardBase, "boardBase");
var TAG_LIMIT = 5;
var TAG_MAX_LEN = 10;
var TAG_WINDOW_MS = 24 * 3600 * 1e3;
function uuid() {
  return crypto.randomUUID();
}
__name(uuid, "uuid");
function token() {
  const b = new Uint8Array(24);
  crypto.getRandomValues(b);
  return Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
}
__name(token, "token");
function todayStr() {
  return (/* @__PURE__ */ new Date()).toLocaleDateString("sv-SE");
}
__name(todayStr, "todayStr");
function j(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" }
  });
}
__name(j, "j");
function err(msg, status) {
  return j({ error: msg }, status || 400);
}
__name(err, "err");
function cleanStr(v, max) {
  if (typeof v !== "string") return "";
  return v.trim().slice(0, max || 200);
}
__name(cleanStr, "cleanStr");
function cleanDims(d) {
  const out = {};
  for (const k of DIMS) {
    const n = Number(d && d[k]);
    if (!isFinite(n) || n < 1 || n > 5) return null;
    out[k] = Math.round(n * 10) / 10;
  }
  return out;
}
__name(cleanDims, "cleanDims");
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
__name(cleanTags, "cleanTags");
function publicPlayer(p) {
  if (!p) return null;
  const st = p.stats || { organized: 0, played: 0, partners: [] };
  return {
    id: p.id,
    name: p.name,
    dims: p.dims,
    intro: p.intro,
    stats: { organized: st.organized || 0, played: st.played || 0, partners: (st.partners || []).length },
    receivedTags: p.receivedTags || {},
    ntrp: p.ntrp || computeNtrp(p.dims || {}),
    createdAt: p.createdAt
  };
}
__name(publicPlayer, "publicPlayer");
function isExpired(r) {
  const end = r.window && r.window.dateEnd;
  return end && end < todayStr();
}
__name(isExpired, "isExpired");
async function publicRequest(env, r, { withMessages } = {}) {
  const expired = isExpired(r);
  const status = expired && r.status === "open" ? "expired" : r.status;
  const owner = await env.BOARD_KV.get("player:" + r.ownerId, "json");
  const out = {
    id: r.id,
    owner: owner ? Object.assign(publicPlayer(owner), {}) : { id: r.ownerId, name: r.ownerName, dims: r.ownerDims, ntrp: computeNtrp(r.ownerDims || {}), stats: { organized: 0, played: 0, partners: 0 }, receivedTags: {} },
    window: r.window,
    region: r.region,
    court: r.court,
    levelReq: r.levelReq,
    playersNeeded: r.playersNeeded,
    costShare: r.costShare,
    note: r.note,
    status,
    createdAt: r.createdAt,
    applicants: (r.applicants || []).map((a) => ({
      playerId: a.playerId,
      name: a.name,
      dims: a.dims,
      ntrp: computeNtrp(a.dims || {}),
      message: a.message,
      status: a.status,
      appliedAt: a.appliedAt
    })),
    applicantCount: (r.applicants || []).length
  };
  if (withMessages) out.messages = r.messages || [];
  if (r.status === "completed" || r.status === "confirmed") {
    out.tags = (r.tags || []).map((t) => ({ fromId: t.fromId, toId: t.toId, tags: t.tags, at: t.at }));
  }
  return out;
}
__name(publicRequest, "publicRequest");
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
__name(authedPlayer, "authedPlayer");
async function savePlayer(env, p) {
  await env.BOARD_KV.put("player:" + p.id, JSON.stringify(p));
}
__name(savePlayer, "savePlayer");
var src_default = {
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
      if (path === "/api/players" && method === "POST") {
        const b = await req.json();
        const name = cleanStr(b.name, 30);
        const dims = cleanDims(b.dims);
        const wechatId = cleanStr(b.wechatId, 50);
        if (!name) return err("\u8BF7\u586B\u5199\u6635\u79F0");
        if (!dims) return err("dims \u9700\u5305\u542B rally/serve/match/athletic\uFF0C\u5747\u4E3A 1-5 \u7684\u6570\u5B57");
        if (!wechatId) return err("\u8BF7\u586B\u5199\u5FAE\u4FE1\u53F7\uFF08\u4EC5\u7528\u4E8E\u7EA6\u6210\u540E\u4EA4\u6362\uFF0C\u4E0D\u4F1A\u516C\u5F00\uFF09");
        const p = {
          id: uuid(),
          token: "",
          name,
          dims,
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
        if (!me) return err("\u672A\u6388\u6743", 401);
        return j({ player: publicPlayer(me), hasWechat: !!me.wechatId });
      }
      const pm = path.match(/^\/api\/players\/([0-9a-f-]+)$/);
      if (pm && method === "GET") {
        const p = await env.BOARD_KV.get("player:" + pm[1], "json");
        if (!p) return err("\u7403\u5458\u4E0D\u5B58\u5728", 404);
        return j({ player: publicPlayer(p) });
      }
      if (pm && method === "PUT") {
        const me = await authedPlayer(req, env);
        if (!me || me.id !== pm[1]) return err("\u672A\u6388\u6743", 401);
        const b = await req.json();
        if (b.name !== void 0) me.name = cleanStr(b.name, 30) || me.name;
        if (b.dims !== void 0) {
          const d = cleanDims(b.dims);
          if (!d) return err("dims \u65E0\u6548");
          me.dims = d;
          me.ntrp = computeNtrp(d);
        }
        if (b.intro !== void 0) me.intro = cleanStr(b.intro, 500);
        if (b.wechatId !== void 0) {
          const wx = cleanStr(b.wechatId, 50);
          if (wx) me.wechatId = wx;
        }
        await savePlayer(env, me);
        return j({ player: publicPlayer(me) });
      }
      if (path === "/api/requests" && method === "POST") {
        const me = await authedPlayer(req, env);
        if (!me) return err("\u672A\u6388\u6743", 401);
        const b = await req.json();
        const w = b.window || {};
        const dateStart = cleanStr(w.dateStart, 10);
        const dateEnd = cleanStr(w.dateEnd, 10) || dateStart;
        const timeStart = cleanStr(w.timeStart, 5);
        const timeEnd = cleanStr(w.timeEnd, 5);
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStart)) return err("window.dateStart \u9700\u4E3A YYYY-MM-DD");
        if (dateEnd < dateStart) return err("dateEnd \u4E0D\u80FD\u65E9\u4E8E dateStart");
        if (!/^\d{2}:\d{2}$/.test(timeStart) || !/^\d{2}:\d{2}$/.test(timeEnd)) return err("window.timeStart/timeEnd \u9700\u4E3A HH:MM");
        const playersNeeded = parseInt(b.playersNeeded);
        if (!isFinite(playersNeeded) || playersNeeded < 1 || playersNeeded > 20) return err("playersNeeded \u9700\u4E3A 1-20");
        const levelReq = {};
        if (b.levelReq) {
          for (const k of DIMS) {
            const r2 = b.levelReq[k];
            if (r2) {
              const lo = Number(r2[0]), hi = Number(r2[1]);
              if (!isFinite(lo) || !isFinite(hi) || lo < 1 || hi > 5 || lo > hi) return err("levelReq." + k + " \u9700\u4E3A [min,max]\uFF0C1-5");
              levelReq[k] = [lo, hi];
            }
          }
        }
        const r = {
          id: uuid(),
          ownerId: me.id,
          ownerName: me.name,
          ownerDims: me.dims,
          window: { dateStart, dateEnd, timeStart, timeEnd },
          region: cleanStr(b.region, 50),
          court: cleanStr(b.court, 80),
          levelReq,
          playersNeeded,
          costShare: cleanStr(b.costShare, 20) || "AA",
          note: cleanStr(b.note, 500),
          status: "open",
          applicants: [],
          messages: [],
          tags: [],
          confirmedWith: null,
          wxReleased: {},
          createdAt: Date.now()
        };
        if (!r.region) return err("\u8BF7\u586B\u5199\u533A\u57DF region");
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
        if (!r) return err("\u7EA6\u7403\u9700\u6C42\u4E0D\u5B58\u5728", 404);
        const sub = rm[2] || "";
        const me = ["", "/apply", "/messages", "/decide", "/reopen", "/cancel", "/complete", "/tags", "/wechat"].includes(sub) ? await authedPlayer(req, env) : null;
        const isOwner = me && me.id === r.ownerId;
        const isParticipant = me && (me.id === r.ownerId || me.id === r.confirmedWith || (r.applicants || []).some((a) => a.playerId === me.id));
        if (sub === "" && method === "GET") {
          return j({ request: await publicRequest(env, r, { withMessages: isParticipant }) });
        }
        if (sub === "" && method === "PUT") {
          if (!isOwner) return err("\u4EC5\u53D1\u8D77\u8005\u53EF\u4FEE\u6539", 403);
          if (r.status === "cancelled" || r.status === "completed") return err("\u5DF2\u53D6\u6D88\u6216\u5DF2\u5B8C\u6210\u7684\u5C40\u4E0D\u53EF\u4FEE\u6539\uFF0C\u8BF7\u53D1\u65B0\u5C40");
          const b = await req.json();
          if (b.window) {
            const w = b.window;
            const ds = cleanStr(w.dateStart, 10) || r.window.dateStart;
            const de = cleanStr(w.dateEnd, 10) || w.dateStart && ds || r.window.dateEnd;
            if (!/^\d{4}-\d{2}-\d{2}$/.test(ds)) return err("dateStart \u9700\u4E3A YYYY-MM-DD");
            const ts = cleanStr(w.timeStart, 5) || r.window.timeStart;
            const te = cleanStr(w.timeEnd, 5) || r.window.timeEnd;
            if (!/^\d{2}:\d{2}$/.test(ts) || !/^\d{2}:\d{2}$/.test(te)) return err("\u65F6\u95F4\u9700\u4E3A HH:MM");
            r.window = { dateStart: ds, dateEnd: de || ds, timeStart: ts, timeEnd: te };
          }
          if (b.region !== void 0) r.region = cleanStr(b.region, 50) || r.region;
          if (b.court !== void 0) r.court = cleanStr(b.court, 80);
          if (b.playersNeeded !== void 0) {
            const n = parseInt(b.playersNeeded);
            if (!isFinite(n) || n < 1 || n > 20) return err("playersNeeded \u9700\u4E3A 1-20");
            r.playersNeeded = n;
          }
          if (b.costShare !== void 0) r.costShare = cleanStr(b.costShare, 20) || r.costShare;
          if (b.note !== void 0) r.note = cleanStr(b.note, 500);
          if (b.levelReq !== void 0) {
            const lr = {};
            for (const k of DIMS) {
              const rng = b.levelReq[k];
              if (rng) {
                const lo = Number(rng[0]), hi = Number(rng[1]);
                if (!isFinite(lo) || !isFinite(hi) || lo < 1 || hi > 5 || lo > hi) return err("levelReq." + k + " \u9700\u4E3A [min,max]\uFF0C1-5");
                lr[k] = [lo, hi];
              }
            }
            r.levelReq = lr;
          }
          await env.BOARD_KV.put("req:" + reqId, JSON.stringify(r));
          return j({ ok: true, request: await publicRequest(env, r) });
        }
        if (sub === "/apply" && method === "POST") {
          if (!me) return err("\u672A\u6388\u6743", 401);
          if (me.id === r.ownerId) return err("\u4E0D\u80FD\u62A5\u540D\u81EA\u5DF1\u7684\u7EA6\u7403");
          if (!(r.status === "open" && !isExpired(r))) return err("\u8BE5\u7EA6\u7403\u5DF2\u5173\u95ED\u6216\u8FC7\u671F");
          if ((r.applicants || []).some((a) => a.playerId === me.id)) return err("\u4F60\u5DF2\u62A5\u540D\u8FC7");
          const b = await req.json();
          r.applicants.push({
            playerId: me.id,
            name: me.name,
            dims: me.dims,
            message: cleanStr(b.message, 300),
            status: "pending",
            appliedAt: Date.now()
          });
          r.messages.push({ from: "system", fromName: "\u7CFB\u7EDF", text: me.name + " \u62A5\u540D\u4E86\u8FD9\u5C40\uFF08\u5FAE\u4FE1\u53F7\u5DF2\u5411\u5176\u5F00\u653E\uFF09\u3002", at: Date.now() });
          r.wxReleased[me.id] = Date.now();
          await env.BOARD_KV.put("req:" + reqId, JSON.stringify(r));
          const host = await env.BOARD_KV.get("player:" + r.ownerId, "json");
          return j({
            ok: true,
            status: "applied",
            wechatId: host && host.wechatId ? host.wechatId : null,
            note: "\u8FD9\u662F\u53D1\u8D77\u4EBA\u7684\u5FAE\u4FE1\u53F7\uFF08\u4EC5\u5C55\u793A\u8FD9\u4E00\u6B21\uFF0C\u8BF7\u7ACB\u5373\u4FDD\u5B58\uFF09\u3002\u7EC6\u8282\u8BF7\u5FAE\u4FE1\u6C9F\u901A\uFF1B\u6700\u7EC8\u7EA6\u7403\u65B9\u7531\u53D1\u8D77\u4EBA\u786E\u5B9A\u3002"
          });
        }
        if (sub === "/messages" && method === "POST") {
          if (!isParticipant) return err("\u4EC5\u62A5\u540D\u8005\u548C\u53D1\u8D77\u8005\u53EF\u53D1\u7AD9\u5185\u6D88\u606F", 403);
          if (!(r.status === "open" || r.status === "confirmed")) return err("\u8BE5\u7EA6\u7403\u5DF2\u5173\u95ED");
          const b = await req.json();
          const text = cleanStr(b.text, 500);
          if (!text) return err("\u6D88\u606F\u4E0D\u80FD\u4E3A\u7A7A");
          r.messages.push({ from: me.id, fromName: me.name, text, at: Date.now() });
          if (r.messages.length > 100) r.messages = r.messages.slice(-100);
          await env.BOARD_KV.put("req:" + reqId, JSON.stringify(r));
          return j({ ok: true });
        }
        if (sub === "/decide" && method === "POST") {
          if (!isOwner) return err("\u4EC5\u53D1\u8D77\u8005\u53EF\u64CD\u4F5C", 403);
          if (r.status !== "open") return err("\u5F53\u524D\u72B6\u6001\u4E0D\u53EF\u786E\u5B9A\u7EA6\u7403\u65B9");
          const b = await req.json();
          const a = (r.applicants || []).find((x) => x.playerId === b.playerId);
          if (!a || a.status !== "pending") return err("\u8BE5\u62A5\u540D\u8005\u4E0D\u5B58\u5728\u6216\u5DF2\u5904\u7406");
          for (const x of r.applicants) {
            if (x.status === "pending") x.status = x.playerId === a.playerId ? "confirmed" : "declined";
          }
          r.status = "confirmed";
          r.confirmedWith = a.playerId;
          r.messages.push({ from: "system", fromName: "\u7CFB\u7EDF", text: "\u7EA6\u7403\u65B9\u5DF2\u5B9A\uFF1A" + a.name + "\u3002\u72B6\u6001\uFF1A\u5F85\u5F00\u59CB\u3002", at: Date.now() });
          await env.BOARD_KV.put("req:" + reqId, JSON.stringify(r));
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
        if (sub === "/reopen" && method === "POST") {
          if (!isOwner) return err("\u4EC5\u53D1\u8D77\u8005\u53EF\u64CD\u4F5C", 403);
          if (r.status !== "confirmed") return err("\u4EC5\u5F85\u5F00\u59CB\u72B6\u6001\u53EF\u91CD\u5F00\u62A5\u540D");
          r.status = "open";
          r.confirmedWith = null;
          for (const x of r.applicants) {
            if (x.status === "confirmed") x.status = "pending";
          }
          r.messages.push({ from: "system", fromName: "\u7CFB\u7EDF", text: "\u53D1\u8D77\u4EBA\u91CD\u65B0\u6253\u5F00\u4E86\u62A5\u540D\u3002", at: Date.now() });
          await env.BOARD_KV.put("req:" + reqId, JSON.stringify(r));
          return j({ ok: true, status: "open" });
        }
        if (sub === "/cancel" && method === "POST") {
          if (!isOwner) return err("\u4EC5\u53D1\u8D77\u8005\u53EF\u64CD\u4F5C", 403);
          if (r.status !== "open" && r.status !== "confirmed") return err("\u5F53\u524D\u72B6\u6001\u4E0D\u53EF\u53D6\u6D88");
          r.status = "cancelled";
          r.messages.push({ from: "system", fromName: "\u7CFB\u7EDF", text: "\u53D1\u8D77\u4EBA\u53D6\u6D88\u4E86\u672C\u6B21\u7EA6\u7403\u3002", at: Date.now() });
          await env.BOARD_KV.put("req:" + reqId, JSON.stringify(r));
          return j({ ok: true });
        }
        if (sub === "/wechat" && method === "GET") {
          if (!me) return err("\u672A\u6388\u6743", 401);
          if (r.status !== "confirmed" && r.status !== "completed") return err("\u7EA6\u7403\u786E\u8BA4\u540E\u624D\u53EF\u83B7\u53D6\u5FAE\u4FE1\u53F7");
          const isParty = me.id === r.ownerId || me.id === r.confirmedWith;
          if (!isParty) return err("\u4EC5\u7EA6\u6210\u53CC\u65B9\u53EF\u83B7\u53D6", 403);
          const otherId = me.id === r.ownerId ? r.confirmedWith : r.ownerId;
          if (r.wxReleased[me.id]) return err("\u5FAE\u4FE1\u53F7\u5DF2\u91CA\u653E\u8FC7\u4E00\u6B21\uFF0C\u8BF7\u67E5\u770B\u4F60 agent \u7684\u9996\u6B21\u83B7\u53D6\u8BB0\u5F55", 410);
          const other = await env.BOARD_KV.get("player:" + otherId, "json");
          if (!other || !other.wechatId) return err("\u5BF9\u65B9\u672A\u8BBE\u7F6E\u5FAE\u4FE1\u53F7");
          r.wxReleased[me.id] = Date.now();
          await env.BOARD_KV.put("req:" + reqId, JSON.stringify(r));
          return j({ wechatId: other.wechatId, note: "\u4EC5\u91CA\u653E\u8FD9\u4E00\u6B21\uFF0C\u8BF7\u7ACB\u5373\u8F6C\u7ED9\u4E3B\u4EBA\u5E76\u59A5\u5584\u4FDD\u5B58" });
        }
        if (sub === "/complete" && method === "POST") {
          if (!isOwner) return err("\u4EC5\u53D1\u8D77\u8005\u53EF\u64CD\u4F5C", 403);
          if (r.status !== "confirmed") return err("\u4EC5\u8FDB\u884C\u4E2D\u7684\u7EA6\u7403\u53EF\u6807\u8BB0\u5B8C\u6210");
          r.status = "completed";
          r.completedAt = Date.now();
          await env.BOARD_KV.put("req:" + reqId, JSON.stringify(r));
          return j({ ok: true });
        }
        if (sub === "/tags" && method === "POST") {
          if (!me) return err("\u672A\u6388\u6743", 401);
          if (r.status !== "completed") return err("\u7403\u5C40\u5B8C\u6210\u540E\u624D\u80FD\u6253\u6807\u7B7E");
          const isParty = me.id === r.ownerId || me.id === r.confirmedWith;
          if (!isParty) return err("\u4EC5\u7EA6\u6210\u53CC\u65B9\u53EF\u6253\u6807\u7B7E", 403);
          if (!r.completedAt || Date.now() - r.completedAt > TAG_WINDOW_MS) return err("\u5DF2\u8FC7 24 \u5C0F\u65F6\u6807\u7B7E\u7A97\u53E3\u671F");
          const toId = me.id === r.ownerId ? r.confirmedWith : r.ownerId;
          const b = await req.json();
          const tags = cleanTags(b.tags);
          if (!tags) return err("tags \u9700\u4E3A 1-" + TAG_LIMIT + " \u4E2A\u4E0D\u8D85\u8FC7 " + TAG_MAX_LEN + " \u5B57\u7684\u5B57\u7B26\u4E32\u6570\u7EC4");
          if ((r.tags || []).some((t) => t.fromId === me.id)) return err("\u4F60\u5DF2\u63D0\u4EA4\u8FC7\u6807\u7B7E");
          r.tags = r.tags || [];
          r.tags.push({ fromId: me.id, toId, tags, at: Date.now() });
          await env.BOARD_KV.put("req:" + reqId, JSON.stringify(r));
          const target = await env.BOARD_KV.get("player:" + toId, "json");
          if (target) {
            target.receivedTags = target.receivedTags || {};
            for (const t of tags) target.receivedTags[t] = (target.receivedTags[t] || 0) + 1;
            await savePlayer(env, target);
          }
          return j({ ok: true });
        }
        return err("\u4E0D\u652F\u6301\u7684\u64CD\u4F5C", 404);
      }
      if (path === "/api/scale" && method === "GET") {
        return j({
          dims: DIMS.map((k) => ({
            key: k,
            label: DIM_LABELS[k],
            weight: DIM_W[k],
            levels: DIM_LEVELS[k]
          })),
          ntrpMap: DIM_NTRP,
          scale: "\u6BCF\u7EF4 1-5 \u6863\uFF0C\u7531\u95EE\u5377\u81EA\u8BC4\uFF1B\u81EA\u52A8\u6362\u7B97 NTRP \u53C2\u8003\u533A\u95F4"
        });
      }
      if (path === "/" && method === "GET") return feedPage(env, url);
      const fm = path.match(/^\/r\/([0-9a-f-]+)$/);
      if (fm && method === "GET") return detailPage(env, fm[1]);
      return err("Not Found", 404);
    } catch (e) {
      return err("\u670D\u52A1\u5668\u9519\u8BEF: " + e.message, 500);
    }
  }
};
var PAGE_CSS = `
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
function dimName(k) {
  return DIM_LABELS[k] || k;
}
__name(dimName, "dimName");
function fmt(n) {
  return (Math.round(Number(n) * 10) / 10).toFixed(1);
}
__name(fmt, "fmt");
var SCALE_HINT = "\u6BCF\u7EF4 1-5 \u6863\uFF081 \u521D\u5B66 \u2192 5 \u9AD8\u624B\uFF09\uFF0C\u81EA\u52A8\u6362\u7B97 NTRP";
function dimBars(d, ntrp) {
  const rows = DIMS.map((k) => {
    const lv = Math.min(5, Math.max(1, Math.round(Number(d && d[k]) || 0)));
    const segs = [1, 2, 3, 4, 5].map((i) => `<span class="seg${i <= lv ? " on" : ""}"></span>`).join("");
    return `<div class="dimrow"><span class="dlabel">${dimName(k)}</span><span class="dsegs">${segs}</span><span class="dimdesc">${esc(DIM_LEVELS[k][lv - 1])}</span></div>`;
  }).join("");
  const nt = Array.isArray(ntrp) ? ntrp : computeNtrp(d || {});
  return `<div class="dimwrap">${rows}<div class="scale">\u7EFC\u5408\u53C2\u8003\uFF1A<b>NTRP ${fmt(nt[0])} - ${fmt(nt[1])}</b>\uFF08\u7531\u95EE\u5377\u81EA\u8BC4\u6362\u7B97\uFF09</div></div>`;
}
__name(dimBars, "dimBars");
function ownerLine(o) {
  o = o || {};
  const d = o.dims || {};
  const st = o.stats || {};
  const nt = o.ntrp || computeNtrp(d);
  const gear = /* @__PURE__ */ __name((v) => Math.min(5, Math.max(1, Math.round(Number(v) || 0))), "gear");
  return `${esc(o.name)}\uFF1A\u5BF9\u62C9 ${gear(d.rally)} \u6863 / \u53D1\u7403 ${gear(d.serve)} \u6863 / \u7ECF\u9A8C ${gear(d.match)} \u6863 / \u57FA\u7840 ${gear(d.athletic)} \u6863 \xB7 NTRP \u7EA6 ${fmt(nt[0])} \xB7 \u6210\u5C40 ${st.played || 0}`;
}
__name(ownerLine, "ownerLine");
async function feedPage(env, url) {
  const list = await env.BOARD_KV.list({ prefix: "req:" });
  let items = [];
  for (const k of list.keys) {
    const r = await env.BOARD_KV.get(k.name, "json");
    if (r && r.status === "open" && !isExpired(r)) items.push(r);
  }
  items.sort((a, b) => b.createdAt - a.createdAt);
  const SL = { open: ["\u62A5\u540D\u4E2D", "b-open"], confirmed: ["\u5DF2\u7EA6\u6210", "b-confirmed"], completed: ["\u5DF2\u5B8C\u6210", "b-completed"], expired: ["\u5DF2\u8FC7\u671F", "b-expired"], cancelled: ["\u5DF2\u53D6\u6D88", "b-cancelled"] };
  let body = "";
  for (const r of items) {
    const s = SL[r.status] || SL.open;
    const d = r.window.dateStart === r.window.dateEnd ? r.window.dateStart : r.window.dateStart + " ~ " + r.window.dateEnd;
    const owner = await env.BOARD_KV.get("player:" + r.ownerId, "json");
    body += `<div class="card"><a href="/r/${r.id}">
      <div><b>${esc(r.region)}</b> \xB7 ${esc(r.court || "\u573A\u5730\u672A\u5B9A")}<span class="badge ${s[1]}">${s[0]}</span></div>
      <div class="meta">${d} ${esc(r.window.timeStart)}-${esc(r.window.timeEnd)} \xB7 \u7F3A ${r.playersNeeded} \u4EBA \xB7 ${esc(r.costShare)}</div>
      <div class="dims">${ownerLine(publicPlayer(owner) || { name: r.ownerName, dims: r.ownerDims, stats: {} })}</div>
      ${r.note ? `<div class="note">${esc(r.note)}</div>` : ""}
    </a></div>`;
  }
  if (!body) body = `<div class="card">\u516C\u544A\u677F\u8FD8\u662F\u7A7A\u7684\u3002\u88C5\u597D\u7EA6\u7403 skill \u7684 agent \u7528\u6237\u53EF\u4EE5\u76F4\u63A5\u53D1\u5E03\u9700\u6C42\u3002</div>`;
  return html(`<h1>\u{1F3BE} \u642D\u901F\u7EA6\u7403\u516C\u544A\u677F</h1><p class="sub">agent \u81EA\u52A8\u7EA6\u7403\u7684\u5171\u4EAB\u9ED1\u677F \xB7 \u4EBA\u7C7B\u53EF\u8BFB\u89C6\u56FE</p><p class="sub">\u6C34\u5E73\u5206\uFF08\u6EE1\u5206 5\uFF09\uFF1A${SCALE_HINT}</p>${body}`);
}
__name(feedPage, "feedPage");
function copyTextFor(env, r) {
  const url = new URL("/r/" + r.id, "http://placeholder").pathname;
  return "\u6211\u60F3\u6253\u8FD9\u4E2A\u7F51\u7403\u5C40\uFF0C\u5E2E\u6211\u7EA6\u7403\uFF1A\n\u2460 \u5B89\u88C5\u7EA6\u7403 skill\uFF1A" + skillSource(env) + "\n\u2461 \u7136\u540E\u5BF9\u5B83\u8BF4\uFF1A\u62A5\u540D\u7403\u5C40 " + r.id + "\n\uFF08\u7403\u5C40\u8BE6\u60C5\uFF1ABOARD_URL_PLACEHOLDER" + url + "\uFF09";
}
__name(copyTextFor, "copyTextFor");
async function detailPage(env, reqId) {
  const r = await env.BOARD_KV.get("req:" + reqId, "json");
  if (!r) return html(`<p>\u7EA6\u7403\u4E0D\u5B58\u5728\u3002</p><p><a class="back" href="/">\u2190 \u8FD4\u56DE\u516C\u544A\u677F</a></p>`);
  const p = await publicRequest(env, r);
  const copyText = copyTextFor(env, r).replace(/BOARD_URL_PLACEHOLDER/g, "http://x").replace("http://x", boardBase(env));
  const SL = { open: ["\u62A5\u540D\u4E2D", "b-open"], confirmed: ["\u5DF2\u7EA6\u6210", "b-confirmed"], completed: ["\u5DF2\u5B8C\u6210", "b-completed"], expired: ["\u5DF2\u8FC7\u671F", "b-expired"], cancelled: ["\u5DF2\u53D6\u6D88", "b-cancelled"] };
  const s = SL[p.status] || SL.open;
  const d = p.window.dateStart === p.window.dateEnd ? p.window.dateStart : p.window.dateStart + " ~ " + p.window.dateEnd;
  const lr = Object.entries(p.levelReq || {}).map(([k, v]) => `${dimName(k)} ${fmt(v[0])}-${fmt(v[1])}`).join("\uFF0C");
  return html(`<p><a class="back" href="/">\u2190 \u8FD4\u56DE\u516C\u544A\u677F</a></p>
    <div class="card">
      <div><b>${esc(p.region)}</b> \xB7 ${esc(p.court || "\u573A\u5730\u672A\u5B9A")}<span class="badge ${s[1]}">${s[0]}</span></div>
      <div class="meta">${d} ${esc(p.window.timeStart)}-${esc(p.window.timeEnd)} \xB7 \u7F3A ${p.playersNeeded} \u4EBA \xB7 ${esc(p.costShare)}</div>
      ${lr ? `<div class="meta">\u671F\u671B\u6C34\u5E73\uFF1A${esc(lr)}</div>` : ""}
      ${p.note ? `<div class="note">${esc(p.note)}</div>` : ""}
      <div class="dims">${esc(p.owner.name)}\uFF08\u53D1\u8D77 ${p.owner.stats.organized || 0} \xB7 \u6210\u5C40 ${p.owner.stats.played || 0} \xB7 \u7403\u53CB ${p.owner.stats.partners || 0}\uFF09</div>
      ${dimBars(p.owner.dims, p.owner.ntrp)}
      <button class="copybtn" onclick="copyMatch()">\u{1F4CB} \u590D\u5236\u7EA6\u7403\u6307\u4EE4\uFF0C\u53D1\u7ED9\u4F60\u7684 agent</button>
      <div class="copied" id="copiedTip">\u5DF2\u590D\u5236\uFF0C\u53BB\u7C98\u8D34\u7ED9\u4F60\u7684 agent \u5427</div>
      <div class="note" style="margin-top:10px">\u6CA1\u6709 agent \u7684\u7403\u53CB\uFF1AV1 \u5185\u6D4B\u671F\u8BF7\u5728\u4FF1\u4E50\u90E8\u5FAE\u4FE1\u7FA4\u91CC\u8054\u7CFB\u53D1\u8D77\u4EBA\u3002</div>
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
<\/script>`);
}
__name(detailPage, "detailPage");
function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}
__name(esc, "esc");
function html(inner) {
  return new Response(`<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>\u642D\u901F\u7EA6\u7403\u516C\u544A\u677F</title><style>${PAGE_CSS}</style></head><body>${inner}</body></html>`, {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache" }
  });
}
__name(html, "html");

// ../../../../../../../opt/homebrew/lib/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../../../../../../opt/homebrew/lib/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    const body = JSON.stringify(error);
    const headers = {
      "Content-Type": "application/json",
      "MF-Experimental-Error-Stack": "true"
    };
    const encoded = encodeURIComponent(body);
    if (encoded.length <= 8192) {
      headers["MF-Experimental-Error-Stack-Payload"] = encoded;
    }
    return new Response(body, { status: 500, headers });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-pTzx3h/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// ../../../../../../../opt/homebrew/lib/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-pTzx3h/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  scheduledTime;
  cron;
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
