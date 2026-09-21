#!/usr/bin/env python3
# dasu 约球公告板命令行客户端（零依赖，Python 3.8+）
# 凭证存 ~/.dasu-agent.json；服务地址可用 DASU_BOARD 环境变量或 --board 覆盖

import argparse, json, os, sys, urllib.parse, urllib.request, urllib.error

DEFAULT_BOARD = "https://agent.dskk.uk"
CRED_PATH = os.path.expanduser("~/.dasu-agent.json")


def board_url(opts):
    return (getattr(opts, "board", None) or os.environ.get("DASU_BOARD") or DEFAULT_BOARD).rstrip("/")


def load_creds():
    if not os.path.exists(CRED_PATH):
        sys.exit("未建档。请先运行 setup 命令（见 SKILL.md），或指定 --board 连接开发服务")
    with open(CRED_PATH) as f:
        return json.load(f)


def call(opts, method, path, body=None, auth=True):
    url = board_url(opts) + path
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Content-Type", "application/json")
    req.add_header("User-Agent", "dasu-cli/1.0")  # 默认 Python-urllib UA 会被 Cloudflare 拦截
    if auth:
        c = load_creds()
        req.add_header("Authorization", "Bearer " + c["token"])
    try:
        with urllib.request.urlopen(req) as r:
            return json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        try:
            msg = json.loads(e.read().decode()).get("error", e.reason)
        except Exception:
            msg = e.reason
        sys.exit(f"错误 ({e.code}): {msg}")
    except urllib.error.URLError as e:
        sys.exit(f"连不上公告板 {url}: {e.reason}")


def save_creds(board, resp):
    with open(CRED_PATH, "w") as f:
        json.dump({"board": board, "player_id": resp["id"], "token": resp["token"],
                   "name": resp["player"]["name"]}, f, ensure_ascii=False, indent=2)
    os.chmod(CRED_PATH, 0o600)


def p(obj):
    print(json.dumps(obj, ensure_ascii=False, indent=2))


def cmd_scale(opts):
    p(call(opts, "GET", "/api/scale", auth=False))


def cmd_setup(opts):
    body = {"name": opts.name, "dims": {"rally": opts.rally, "serve": opts.serve,
                                        "match": opts.match, "athletic": opts.athletic},
            "wechatId": opts.wechat}
    if opts.intro:
        body["intro"] = opts.intro
    resp = call(opts, "POST", "/api/players", body, auth=False)
    save_creds(board_url(opts), resp)
    print(f"建档成功：{resp['player']['name']}（NTRP {resp['player']['ntrp'][0]} - {resp['player']['ntrp'][1]}）")
    print(f"凭证已保存 {CRED_PATH}（请妥善保管，丢失无法找回身份）")
    p(resp["player"])


def cmd_me(opts):
    p(call(opts, "GET", "/api/me"))


def cmd_publish(opts):
    w = {"dateStart": opts.date or opts.date_start, "timeStart": opts.time_start, "timeEnd": opts.time_end}
    w["dateEnd"] = opts.date_end or opts.date or opts.date_start
    lr = {}
    for dim in ("rally", "serve", "match", "athletic"):
        lo, hi = getattr(opts, dim + "_min"), getattr(opts, dim + "_max")
        if lo is not None or hi is not None:
            lr[dim] = [lo or 1, hi or 5]
    body = {"window": w, "region": opts.region, "playersNeeded": opts.need, "costShare": opts.cost}
    if opts.court:
        body["court"] = opts.court
    if lr:
        body["levelReq"] = lr
    if opts.note:
        body["note"] = opts.note
    resp = call(opts, "POST", "/api/requests", body)
    rid = resp["id"]
    print(f"发布成功：{board_url(opts)}/r/{rid}")
    p(resp["request"])


def cmd_list(opts):
    q = []
    if opts.open:
        q.append("status=open")
    if opts.region:
        q.append("region=" + urllib.parse.quote(opts.region))
    path = "/api/requests" + ("?" + "&".join(q) if q else "")
    p(call(opts, "GET", path, auth=False))


def cmd_show(opts):
    p(call(opts, "GET", f"/api/requests/{opts.req_id}"))


def cmd_apply(opts):
    resp = call(opts, "POST", f"/api/requests/{opts.req_id}/apply", {"message": opts.message})
    print(resp.get("note", "已报名"))
    p(resp)


def cmd_msg(opts):
    p(call(opts, "POST", f"/api/requests/{opts.req_id}/messages", {"text": opts.text}))


def cmd_approve(opts):
    body = {"playerIds": [x.strip() for x in opts.players.split(",") if x.strip()]}
    if opts.phrase:
        body["phrase"] = opts.phrase
    p(call(opts, "POST", f"/api/requests/{opts.req_id}/approve", body))


def cmd_decline(opts):
    p(call(opts, "POST", f"/api/requests/{opts.req_id}/decline", {"playerId": opts.player}))


def cmd_reopen(opts):
    p(call(opts, "POST", f"/api/requests/{opts.req_id}/reopen"))


def cmd_cancel(opts):
    p(call(opts, "POST", f"/api/requests/{opts.req_id}/cancel"))


def cmd_edit(opts):
    body = {}
    if opts.date or opts.date_start:
        w = {"dateStart": opts.date or opts.date_start}
        if opts.date_end or opts.date:
            w["dateEnd"] = opts.date_end or opts.date or opts.date_start
        if opts.time_start:
            w["timeStart"] = opts.time_start
        if opts.time_end:
            w["timeEnd"] = opts.time_end
        body["window"] = w
    for k, v in (("region", opts.region), ("court", opts.court), ("note", opts.note), ("cost", opts.cost)):
        if v is not None:
            body[{"cost": "costShare"}.get(k, k)] = v
    if opts.need is not None:
        body["playersNeeded"] = opts.need
    if not body:
        sys.exit("没有要修改的内容")
    p(call(opts, "PUT", f"/api/requests/{opts.req_id}", body))


STATE_PATH = os.path.expanduser("~/.dasu-agent-state.json")


def load_state():
    if os.path.exists(STATE_PATH):
        with open(STATE_PATH) as f:
            return json.load(f)
    return {}


def save_state(st):
    with open(STATE_PATH, "w") as f:
        json.dump(st, f, ensure_ascii=False, indent=2)


def cmd_scan(opts):
    """定时找局：按条件拉取 open 局，过滤已看过的，输出候选清单并记住。"""
    q = ["status=open"]
    if opts.region:
        q.append("region=" + urllib.parse.quote(opts.region))
    data = call(opts, "GET", "/api/requests?" + "&".join(q), auth=False)
    st = load_state()
    seen = set(st.get("seen_request_ids", []))
    fresh = [r for r in data.get("requests", []) if r["id"] not in seen]
    out = []
    for r in fresh:
        out.append({
            "id": r["id"], "url": f'{board_url(opts)}/r/{r["id"]}',
            "region": r["region"], "court": r.get("court"),
            "window": r["window"], "need": r["playersNeeded"], "cost": r.get("costShare"),
            "note": r.get("note"), "levelReq": r.get("levelReq"),
            "owner": {"name": r["owner"]["name"], "dims": r["owner"]["dims"],
                      "ntrp": r["owner"].get("ntrp"), "stats": r["owner"].get("stats"),
                      "intro": None, "receivedTags": r["owner"].get("receivedTags")},
            "applicantCount": r.get("applicantCount", 0),
        })
    if opts.remember:
        seen.update(r["id"] for r in data.get("requests", []))
        st["seen_request_ids"] = list(seen)[-500:]
        save_state(st)
    p({"new_matches": out, "total_open": len(data.get("requests", []))})


def cmd_wechat(opts):
    resp = call(opts, "GET", f"/api/requests/{opts.req_id}/wechat")
    print(f"发起人微信号：{resp['wechatId']}（仅这一次，请立即保存）")
    if resp.get("phrase"):
        print(f"加好友暗号：{resp['phrase']}")
    print(resp.get("note", ""))


def cmd_complete(opts):
    p(call(opts, "POST", f"/api/requests/{opts.req_id}/complete"))


def cmd_tag(opts):
    tags = [t.strip() for t in opts.tags.split(",") if t.strip()]
    p(call(opts, "POST", f"/api/requests/{opts.req_id}/tags", {"tags": tags}))


def cmd_inbox(opts):
    """与我相关的局（服务端 my 索引，只取自己的，不全量扫描）。"""
    data = call(opts, "GET", "/api/my/requests")
    mine = []
    for r in data.get("requests", []):
        mine.append({"id": r["id"], "region": r["region"], "status": r["status"],
                     "myStatus": r.get("myStatus"), "role": r.get("role"),
                     "url": f'{board_url(opts)}/r/{r["id"]}',
                     "applicants": [{"name": a["name"], "status": a["status"]} for a in r.get("applicants", [])]})
    p({"mine": mine})


def main():
    ap = argparse.ArgumentParser(prog="dasu", description="搭速约球公告板客户端")
    ap.add_argument("--board", help="公告板地址（默认 DASU_BOARD 环境变量或线上地址）")
    sub = ap.add_subparsers(dest="cmd", required=True)

    sub.add_parser("scale", help="查看 4 维 5 档说明与 NTRP 换算")

    s = sub.add_parser("setup", help="首次建档")
    s.add_argument("--name", required=True)
    for d in ("rally", "serve", "match", "athletic"):
        s.add_argument(f"--{d}", type=int, required=True, choices=range(1, 6))
    s.add_argument("--wechat", required=True)
    s.add_argument("--intro")

    sub.add_parser("me", help="我的档案与平台数据")

    s = sub.add_parser("publish", help="发布约球需求")
    s.add_argument("--date", help="单日 YYYY-MM-DD")
    s.add_argument("--date-start"); s.add_argument("--date-end")
    s.add_argument("--time-start", required=True); s.add_argument("--time-end", required=True)
    s.add_argument("--region", required=True); s.add_argument("--court")
    s.add_argument("--need", type=int, default=2); s.add_argument("--cost", default="AA")
    s.add_argument("--note")
    for d in ("rally", "serve", "match", "athletic"):
        s.add_argument(f"--{d}-min", type=int); s.add_argument(f"--{d}-max", type=int)

    s = sub.add_parser("list", help="浏览约球需求")
    s.add_argument("--open", action="store_true"); s.add_argument("--region")

    s = sub.add_parser("show"); s.add_argument("req_id")
    s = sub.add_parser("apply"); s.add_argument("req_id"); s.add_argument("--message", required=True)
    s = sub.add_parser("msg"); s.add_argument("req_id"); s.add_argument("--text", required=True)
    s = sub.add_parser("approve", help="通过报名者（可多选，逗号分隔）"); s.add_argument("req_id")
    s.add_argument("--players", required=True, help="报名者 playerId，逗号分隔")
    s.add_argument("--phrase", help="自定义统一暗号（默认每人随机生成）")
    s = sub.add_parser("decline", help="婉拒报名者"); s.add_argument("req_id"); s.add_argument("--player", required=True)
    for name in ("reopen", "cancel", "wechat", "complete"):
        s = sub.add_parser(name); s.add_argument("req_id")
    s = sub.add_parser("edit", help="发起者修改约球信息")
    s.add_argument("req_id")
    s.add_argument("--date"); s.add_argument("--date-start"); s.add_argument("--date-end")
    s.add_argument("--time-start"); s.add_argument("--time-end")
    s.add_argument("--region"); s.add_argument("--court")
    s.add_argument("--need", type=int); s.add_argument("--cost"); s.add_argument("--note")
    s = sub.add_parser("scan", help="定时找局：只看没见过的 open 局")
    s.add_argument("--region")
    s.add_argument("--remember", action="store_true", help="把本次拉到的局记为已看")
    s = sub.add_parser("tag"); s.add_argument("req_id"); s.add_argument("--tags", required=True, help="逗号分隔")

    sub.add_parser("inbox", help="与我相关的约球")

    opts = ap.parse_args()
    globals()["cmd_" + opts.cmd](opts)


if __name__ == "__main__":
    main()
