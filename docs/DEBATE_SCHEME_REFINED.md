# ForgetPhys 辩论方案 · 导演摘要（v2 → 指向 V3）

Status: **Superseded as director SoT by Spec v3** · 2026-09-07 · B1 + B2 + stance-critic locked  
**现行导演行动稿** → [`DEBATE_SCHEME_V3.md`](./DEBATE_SCHEME_V3.md)  
完整英文架构 SoT：[`DEBATE_ARCHITECTURE.md`](./DEBATE_ARCHITECTURE.md)（Status Spec v3）  
α Hard 槽位：[`HARD_EVIDENCE_SLOTS_ALPHA.md`](./HARD_EVIDENCE_SLOTS_ALPHA.md)

本文保留为 **v2 短摘要 / 历史入口**；新设计与 P1a 验收以 **V3** 为准。

---

## 三模式

| 模式 | 说明 | 胜负 |
|---|---|---|
| **常规** scripted | `manchester.json` 既有对白 + 主张徽章 | 推进节拍，无自由 LLM |
| **自由** free | Persona LLM + 检索双库；必须 cite-or-retry | 软退出 / 回合预算；可选预览证据板 |
| **Hard** 证据槽 | 同上 + EvidenceBoard + CriticPolicy | **填满 N/M 槽且规则裁判通过**；不改图志结局 |

共享底线：禁止编造实验数字；时代观点可说但必须贴标，且**不能填槽**。

---

## 双库

| 库 | 用途 | 能否填 Hard 槽 |
|---|---|---|
| **FactStore** | 事实 / 原始文献 / 教材锚点 | ✅ |
| **EraOpinionStore** | 1909 主流时代观点（可能以今度之偏） | ❌ 仅染语气 |

Cite 芯片徽章：**事实** · **时代观点** · **演绎**（演绎不填槽）。

---

## 为何不酒馆（SillyTavern）

- ST = 外部 **Chat Completions 客户端**参考（`/v1`），不是产品壳；与 LiteLLM 同属 Completions 协议族。
- ForgetPhys 自有 **`DebateSession`**，叠在 Venue2D 上；角色/服装/场所继续用现有资产。
- **已拍板（2026-09-07）**：用 **LiteLLM** 统一网关（OpenAI-compatible、供应商无关）+ **Vercel AI SDK 只打一个端点**，应用内不接各家 vendor SDK。
- **B1 已锁定 · 密钥永不进浏览器**（与酒馆同族）：ST = Node 服务端持钥；ForgetPhys = SPA → **BFF / debate-proxy**（持 `LITELLM_API_KEY`）→ LiteLLM；**或**学校 LiteLLM 用 session / 学生 token 鉴权（SPA 仍无厂商钥）。详见 `LLM_KEY_PATH.md`、架构 §12。
- 部署：本地 sidecar（Docker/进程）或学校/学生已有的远程 LiteLLM URL。
- 密钥 / 别名：`LITELLM_BASE_URL`（或 `OPENAI_COMPATIBLE_BASE_URL` 指向同一网关）、`LITELLM_API_KEY` / `OPENAI_API_KEY`（**仅服务端**）、`LITELLM_MODEL`（如 `forgetphys-debate`）；**永不进仓库 / 永不进 SPA**。上游模型在 `litellm_config.yaml` 里换，应用只认别名。
- 流式输出进 DialoguePanel 同类 UI。

---

## 接入（壳内位置）

```
worldMap2d → chroniclePlate → cityPage → venue2d → labEmbed(Infinitas)
                                         └── DebateSession（面板/覆盖层）
```

- **入口**：城市页选模式，或场所 ⋯ 菜单（Coupland / lodge）。
- **解锁**：常规常驻；自由 ≈ 首次 labEmbed 或旅舍节拍后；**Hard 建议至少去过一次 Infinitas**。
- **证据板 UI**：羊皮纸侧栏，6 槽，填满打勾。
- **状态机**：`idle_scripted` ↔ `debate_free` / `debate_hard` → `persuaded` | `budget_exhausted` | `aborted`；进度用 content flags + `localStorage`。

---

## 分期

| 期 | 交付 |
|---|---|
| **P0** | 文档 + Persona / 事实 / 时代观点 / Hard 槽 JSON（已落） |
| **P1a** | DebateSession 壳（字段名 **`debateMode`**）、双库 + 双语关键词 Retriever、EvidenceBoard + Judge、labEmbed 合约；**CriticPolicy 管填槽**（无 live LLM 也必须有——Hard + labEmbed 依赖）；Zod 卡片校验；**玩家 propose-fill（H1）** — 详见 V3 §3·§6 |
| **P1b** | Stub GroundedReply + LiteLLM sidecar 冒烟；密钥只走 **server proxy**，浏览器不持 `LITELLM_API_KEY` |
| **P2** | Live GroundedReply + **完整 cite-or-retry**；多 NPC（Rutherford 主任 + Watson 盟友长文反驳；Hard **stance Critic / 时代主流理解** 默认；可选皮肤 Fajans·Thomson·Crowther 加分）— **Judge 仍是规则** |

---

## α Hard 胜负（Coupland）

```
persuaded  ⟺  filled_count ≥ 4（共 6 槽）  ∧  CriticPolicy 至少一次通过
```

- **B2 已锁定 = A（澄清 2026-09-07）**：Hard 说服对象 = **时代主流理解（stance Critic）/ 证据板**；**不必**具名历史人物。可选皮肤（考证 shortlist **加分**）：**Fajans / Thomson / Crowther** — 非 P1a blocker。**不是 Rutherford**。卢瑟福 = 实验室主任 / 对话者。默认人格：`persona-era-peer-1909`（`form: stance`；`name_zh`「时代主流理解」；勿造假人名）。**可驳斥主张清单 → 板映射** = pending 考证（勿自编）。
- Judge = **规则引擎**，不是「谁嘴仗赢了」；胜 = 证据板 + 反驳时代主流理解 / 可选同行。玩家经 **Watson 长文**反驳；长文 alone 不胜（仍要 cite / 填槽）。
- **不改写** chroniclePlate / 命运结局文案。
- Critic 清单（确定性）：cite ⊆ 本轮检索；数字必须对得上卡片；`era_opinion` 不填槽；禁语；最多重试 **K=2**；失败则说不确定模板。
- labEmbed：`postMessage` 类型化 JSON（`kind` / `angle_deg?` / `fraction_forward?` / `large_angle_count?`）→ 白名单映射到槽；Critic 校验数值范围。

六槽标题：大角存在 · 绝大多数前进 · 箔极薄 · 电荷/质量集中 · 枣糕失败 · ZnS+几何方法。详见 Hard 槽文档。

---

## 下一刀（转 V3）

P1a 细设、角色矩阵、玩家填槽 UX、BFF 草约、验收清单 → **[`DEBATE_SCHEME_V3.md`](./DEBATE_SCHEME_V3.md)**。  
**勿 code-dump** 直至游戏架构 ADR 选定 BFF 路由。

---

## 已锁定 vs 仍开放

**锁定**：不进酒馆壳；三模式；双库；规则 Judge；Hard 4/6；**LiteLLM 统一网关**；Hard 建议 Infinitas 后解锁。

- **B1（2026-09-07）**：密钥永不进浏览器 — SPA → BFF/debate-proxy → LiteLLM（或学校 LiteLLM + session/学生 token）。同族于酒馆 Node 持钥。见 `LLM_KEY_PATH.md`。  
- **B2 = A（2026-09-07）**：Hard 说服 **时代主流理解 / era understanding**（板即胜；命名同行可选）；**不是** Rutherford。卢瑟福 = 实验室主任。**无考证勿造人名**；默认 stance `persona-era-peer-1909`。
- **stance-critic LOCKED（2026-09-07 · 考证后）**：默认抽象 stance；可选具名皮肤 **Fajans / Thomson / Crowther**（`kaozheng/ch1-ForgetPhys-Hard质疑者短名单.md`）= P2+ 加分。
- **H1（设计锁定 · V3）**：Hard 玩家 propose-fill；Era Critic 可挑战不可否决合法 Fact；Watson 长文反驳路径见 V3 §9。

**开放**：LiteLLM 别名背后的上游型号；每名学生成本/配额；自由模式精确解锁节拍；跨次进入是否保留半填证据板（审计默认：按场所保留至章节完成/重置）；BFF 落在 Vite 路由还是独立 `apps/debate-proxy`（模式已锁，包布局未锁）；**可驳斥主张清单 → EvidenceBoard 映射（pending 史料考证 — 勿自编）**。

**建议尽快拍板**：

- **`debateMode` 命名（H3）**：辩论模式字段统一 `debateMode`，勿与 PRODUCT_FLOW 壳模式（`worldMap2d` / `venue2d`）撞名。

---

## 相关路径

| 路径 | 角色 |
|---|---|
| `docs/DEBATE_SCHEME_V3.md` | **现行导演 SoT（Spec v3）** |
| `docs/DEBATE_ARCHITECTURE.md` | 英文完整架构（含 §12–18） |
| `docs/DEBATE_AUDIT_2026-09-07.md` | 下阶段 + 模式锁定后自检（Blocker / P1a·P1b·P2） |
| `docs/HARD_EVIDENCE_SLOTS_ALPHA.md` | α 六槽 + 胜负 |
| `docs/PRODUCT_FLOW.md` | 产品三阶段 + 辩论指针 |
| `packages/content/src/debate/` | 卡片 JSON SoT |
| `packages/debate/` | 运行时桩（尚未实现） |
