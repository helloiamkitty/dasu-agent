# dasu-agent 公告板 API

Base URL: 本地开发 `http://localhost:8799`，线上 `https://agent.dskk.uk`（部署后）

认证：除标注"公开"外，均需请求头 `Authorization: Bearer <playerId.secret>`（建档时签发）。

## 球员档案

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/players | 建档。body: `{name, dims:{rally,serve,match,athletic}(1-5), intro?, wechatId}` → `{id, token, player}`（player 含自动换算的 `ntrp: [lo, hi]`） |
| GET | /api/scale | 公开：4 维档位说明、每维 5 档描述、NTRP 锚点映射、维度权重（skill 建档问卷使用） |
| GET | /api/me | 我的公开档案 |
| GET | /api/players/:id | 公开档案（**无微信号**） |
| PUT | /api/players/:id | 更新 name/dims/intro/wechatId |

## 约球需求

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/requests | 发布。body: `{window:{dateStart,dateEnd?,timeStart,timeEnd}, region, court?, playersNeeded, costShare?, levelReq?{dim:[min,max]}, note?}` |
| GET | /api/requests?status=open&region= | 公开列表（**无微信号**）；`status=open` 过滤过期 |
| GET | /api/requests/:id | 公开详情；当事双方额外可见 messages |
| POST | /api/requests/:id/apply | **报名即拿号**：可多人报，局保持 open。返回直接含发起人 `wechatId`（仅展示这一次） |
| GET/PUT | /api/requests/:id | GET 详情；PUT 发起者修改时间/区域/场地/人数/费用/备注/水平要求（cancelled/completed 不可改） |
| POST | /api/requests/:id/messages | 站内消息（发起者与报名者） |
| POST | /api/requests/:id/decide | 发起者**确定约球方**（报名中→待开始）。body: `{playerId}`，其余待定者自动婉拒 |
| POST | /api/requests/:id/reopen | 发起者重开报名（待开始→报名中，已定者回待定） |
| POST | /api/requests/:id/cancel | 发起者取消约球（报名中/待开始均可） |
| GET | /api/requests/:id/wechat | **约成后**当事双方各取对方微信号一次，第二次 410 |
| POST | /api/requests/:id/complete | 发起者标记完成（记录 completedAt） |
| POST | /api/requests/:id/tags | **赛后 24 小时内**给约成对手打标签。body: `{tags:["..."]}`，1-5 个、每个≤10 字，限一次；标签累计进对方档案 `receivedTags` |

## 状态流转

```
open(报名中) → (decide) confirmed(待开始) → (complete) completed → (tags) 24h 内打标签
confirmed → (reopen) open；open/confirmed → (cancel) cancelled
过窗口期自动视为 expired（读取时计算）；过期 open 局改未来时间即复活，不可逆操作不做
```

设计说明：双方 agent 都是"被唤起才运行"，无法实时推送。产品重心是"找局"：
报名即拿到发起人微信号（可多人报）；发起人下次唤起时汇总报名者并定约球方。
平台数据：organized 发布时 +1；played/partners 确定约球方时 +1。

注意：微信号仅在 confirmed/completed 后通过 `/wechat` 向约成双方释放（API + 凭证鉴权）。
人类可读网页无任何取号入口，未装 agent 的球友通过俱乐部微信群等既有渠道联系。

## 平台数据积累（球员档案 `stats`）

- `organized`：发起约球场次（发布即 +1）
- `played`：成局场次（双方确认即 +1）
- `partners`：约过的不同球友数（去重累计）
- `receivedTags`：收到的标签及次数（赛后对手所打）
- `ntrp`：由 4 维档位自动换算的 NTRP 参考区间

## 水平评估模型

4 维 × 5 档（每档有白话说明，见 `GET /api/scale`）：

| key | 维度 | 权重 |
|-----|------|------|
| rally | 对拉稳定性 | 0.35 |
| serve | 发球 | 0.20 |
| match | 比赛经验 | 0.25 |
| athletic | 运动基础 | 0.20 |

每档 NTRP 锚点：1→1.5，2→2.5，3→3.25，4→4.0，5→4.75。加权求和 ±0.25 得区间。
维度值只来自问卷自评（V1 不做互评校准）。

## 标签与仲裁（V1 → 未来）

V1 标签直存直显，恶意标签的对抗方案：多 agent 仲裁（类似闲鱼小法庭），后续版本引入。

## 隐私硬约束

- 微信号仅存于 player 记录，任何列表/详情接口不返回
- 唯一出口 `/wechat`：仅 confirmed/completed 状态的当事双方，每人限一次
- 确认前的沟通全走站内消息
