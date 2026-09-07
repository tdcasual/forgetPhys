# ForgetPhys 辩论方案 · Spec v3（导演行动稿）

Status: **Spec v3** · 2026-09-07  
Blockers: **B1 + B2 已锁定** · BFF ADR **Accepted**（`apps/web` internal proxy）→ 可细设 P1a（**勿 code-dump** 至独立运行时 PR）  
英文架构 SoT：[`DEBATE_ARCHITECTURE.md`](./DEBATE_ARCHITECTURE.md)（Status Spec v3）  
前版导演摘要：[`DEBATE_SCHEME_REFINED.md`](./DEBATE_SCHEME_REFINED.md)（指向本文为现行导演 SoT）  
α Hard 槽：[`HARD_EVIDENCE_SLOTS_ALPHA.md`](./HARD_EVIDENCE_SLOTS_ALPHA.md)  
Critic 可驳斥主张映射：[`HARD_CRITIC_CLAIMS_ALPHA.md`](./HARD_CRITIC_CLAIMS_ALPHA.md)  
审计：[`DEBATE_AUDIT_2026-09-07.md`](./DEBATE_AUDIT_2026-09-07.md)

> 本文 = **CN 导演行动稿**：角色矩阵、玩家填槽 UX、BFF 草约、Session 生命周期、P1a 验收。实现细节仍以英文架构为准。

---

## 0. Status

| 项 | 值 |
|---|---|
| Spec | **v3** · 2026-09-07 |
| B1 | **LOCKED** — 密钥永不进浏览器；SPA → BFF/debate-proxy → LiteLLM（或学校 session/token） |
| B2 | **LOCKED = A** — Hard 胜 = 说服 **时代主流理解（stance Critic）/ 证据板**（命名同行可选）；**不是** Rutherford |
| stance-critic | **LOCKED** — 默认 `form: stance` / 时代主流理解；具名皮肤（Fajans·Thomson·Crowther）可选 P2+ 加分 |
| H1 | **设计锁定** — Hard 允许玩家 propose-fill；EraPeer 可挑战不可否决合法 Fact |
| 下一刀 | **细设 P1a**（壳 / 双库 / 板 / Critic / 玩家填槽）— **不写运行时代码**（BFF 落点已 Accepted：`apps/web`） |
| 不改 | chroniclePlate / 命运结局文案；不 fork SillyTavern |

---

## 1. Locked stack（一页）

| 维度 | 锁定 |
|---|---|
| **debateMode** | `scripted` \| `free` \| `hard`（勿与壳模式 `worldMap2d` / `venue2d` 撞名） |
| **debateSession** | `off` \| `active`（Venue 叠层；**不**替代 `debateMode`；壳 GameMode 仍仅空间） |
| **双库** | FactStore（可填槽）· EraOpinionStore（仅染语气，**绝不填槽**） |
| **Judge** | **规则引擎**；非 LLM 嘴仗分 |
| **壳** | ForgetPhys 内 `DebateSession` 叠 Venue2D；**不 ST fork** |
| **LLM** | LiteLLM 统一网关 + **BFF**（钥服务端；同族酒馆 Node 持钥） |
| **Hard 胜** | 填满 **≥4 / 6** 槽 ∧ CriticPolicy ≥1 次通过 → 说服 **时代主流理解 / era peers / board** |
| **Rutherford ≠ 说服对象** | 卢瑟福 = 实验室主任 / 主对话者，可接受证据，**不是**胜负对象 |
| **角色** | Rutherford（lab chief）· Watson（ally；Hard 长文反驳口）· **Era Critic = stance 默认**（`persona-era-peer-1909` / 时代主流理解；命名同行可选 P2+）· Judge=rules |

共享底线：禁编造实验数字；时代观点可说须贴标；Hard **不**改写图志结局。

---

## 2. Role matrix

| 角色 | scripted | free | hard | 可填槽？ | 可挑战？ | 判胜？ |
|---|---|---|---|---|---|---|
| **Player** | 选对白 / 推进 | 发言 | 发言 + **propose-fill**（H1） | ✅ 经 CriticPolicy | — | ❌ |
| **Rutherford** | 既有对白 | Persona 对话 | 主任对话 / 可接受证据 | ✅ NPC cite 路径 | 可质疑口吻 | ❌ **非**胜负对象 |
| **Watson** | 既有对白 | 盟友澄清 | 盟友；**长文反驳口**；可点空槽 / essay propose-fill | ✅ NPC cite / essay | 弱挑战 / 提示 | ❌ |
| **Era Critic**（默认 stance） | — | — | **Hard 对手** = **时代主流理解**（可无脸/剪影） | ❌ 不可用 era_opinion 填槽 | ✅ `era_opinion` 挑战行 | ❌ **不可否决**合法 Fact 填；**不可**判胜 |
| **Named peer**（可选 P2+） | — | — | 考证后可选具名同行 | 同左 | 同左 | 同左；非 P1a blocker |
| **Judge** | — | — | 规则引擎 | — | — | ✅ `filled≥4/6` ∧ Critic pass → `persuaded` |
| **CriticPolicy** | — | cite 校验（P2） | 填槽合法性（**P1a 必有**） | 校验 | 拒非法填 | 配合 Judge，本身不说话 |

**谁可占位**：Rutherford / Watson 用现有 `char-*`；Hard 默认 Critic = `persona-era-peer-1909`（概念上 = **stance Critic / 时代主流理解**；**不必**具名历史人物；无考证勿造人名）。具名当代同行 = **可选风味**，非 P1a blocker。

---

## 3. Player propose-fill（H1 · 设计锁定）

Hard 下玩家**不必**等 NPC 同意才能填槽。UX：

1. **打开** EvidenceBoard 空槽（羊皮纸侧栏）。
2. **选取** Fact 卡：Retriever 命中列表 **或** 挂载最近一次 `labEmbed` 读数（白名单 kind + 范围）。
3. **CriticPolicy** 校验（cite ⊆ 检索 / 数字对卡 / tier≠era_opinion / 槽↔`linked_fact_ids`）→ **fill**。
4. **Era Critic**（stance 默认）可发 `era_opinion` **挑战行**（P2 = LLM；**P1a** 可用脚本挑战模板）。
5. Era Critic **不能否决**已通过 Critic 的合法 Fact 填。

**备选路径**：NPC cite → `EvidenceBoard.tryFill`（与玩家 propose-fill 并列；同一 Critic / Judge）。

free：**永不**写真实 fills（仅 ghost 预览）。

---

## 4. BFF contract sketch

```
POST /api/debate/complete
  （或 POST /api/llm/chat — 二选一由 ADR 定）
```

| 项 | 约定 |
|---|---|
| **Body** | `{ messages, modelAlias: "forgetphys-debate", debateSessionId, mode }`（`mode` 镜像 `debateMode`；叠层用 `debateSession: off|active`，勿混） |
| **Server** | 注入 `LITELLM_API_KEY` → 调 LiteLLM → **SSE** 流回客户端 |
| **禁止** | 任何响应/错误体把上游 key / master token 回给浏览器 |
| **限流** | hooks 占位（学生预算 / 回合帽；P1b 可 no-op） |
| **P1b** | mock handler 返回罐头 `GroundedReply` JSON（含 `cite[]`）；可假流式 |
| **落点** | **Accepted** — `apps/web` internal proxy（[`adr/0003-debate-bff.md`](./adr/0003-debate-bff.md)）；`apps/debate-proxy` 延后至独立限流/多端需要 |

密钥 / 别名见 `LLM_KEY_PATH.md`、架构 §12。SPA **永不**持 `LITELLM_API_KEY` / `VITE_*` 钥。

---

## 5. DebateSession lifecycle

```
Venue2D
  └── DebateSession = modal overlay
        enter free|hard  →  pause scripted beatIndex
        exit             →  resume | jump postDebateBeat
```

| 规则 | 说明 |
|---|---|
| **debateSession** | `off` \| `active` — 叠在 Venue 上；**不**替换 `debateMode` |
| **进入** | 城市页模式选择 / 场所 ⋯ → `debateSession: active`；Hard 建议 ≥1 次 Infinitas |
| **暂停** | free/hard 进入时冻结 scripted `beatIndex` |
| **退出** | `resume` 原拍 **或** `jump` 到 `postDebateBeat`（内容 flag） |
| **free** | 证据板 **ghost only**；不写 fills |
| **hard** | 真实 fills；Judge → `persuaded` / `budget_exhausted` / `aborted` |
| **持久化** | 解锁 flags → progress；board fills **按场所保留至章节完成/重置**（L3 默认） |
| **禁写** | chroniclePlate / 命运文案；编造 cite |

状态机：`idle_scripted` ↔ `debate_free` / `debate_hard` → `persuaded` \| `budget_exhausted` \| `aborted`。

---

## 6. P1a acceptance criteria（可测 · **仅 Coupland**）

Done-when（全部满足才算 P1a）：

- [ ] Venue2D 可切 `debateMode: scripted | free | hard`（命名无撞壳模式）
- [ ] DebateSession **modal**；进 free/hard **暂停** scripted beat；退出 resume 或 jump
- [ ] 加载 `packages/content/src/debate/*` → FactStore / EraOpinionStore；双语关键词 Retriever 有命中
- [ ] EvidenceBoard 六槽 UI；Judge：`filled_count >= 4` ∧ Critic ≥1 次通过 → `persuaded`
- [ ] **CriticPolicy** 对 Fact / labEmbed 填槽生效（**无 live LLM**）
- [ ] **玩家 propose-fill**（H1）：选 Fact 或挂 labEmbed → Critic → fill
- [ ] Era Critic（stance）**脚本挑战模板**可显示；**不能**否决合法 fill
- [ ] Watson **长文反驳**路径：Hard UI 有 multiline 输入；单次 essay submit 可 propose 多槽 fill（Critic 逐槽过）；推荐计 **1 回合**（产品可改为 1–N）
- [ ] free = ghost 预览 only（断言：free 路径不 mutate fills）
- [ ] Infinitas `postMessage` 合约（见 [`LABEMBED_POSTMESSAGE.md`](./LABEMBED_POSTMESSAGE.md)）→ 候选填槽
- [ ] Zod 校验卡片加载失败可见
- [ ] 解锁 flag + fills 按场所 persist（[`PROGRESS_SAVE_SCHEMA.md`](./PROGRESS_SAVE_SCHEMA.md)；章节重置可清）
- [ ] **无**浏览器侧 LiteLLM key；**无** chronicle 结局改写
- [ ] **不**要求 live LLM / 完整 cite-or-retry（属 P1b/P2）

---

## 7. P1b / P2 gates

| 阶段 | 解锁条件 | 交付 |
|---|---|---|
| **P1b** | P1a Coupland 验收通过；BFF ADR **已 Accepted**（`apps/web`） | mock `POST /api/debate/complete` → 罐头 GroundedReply + cites；LiteLLM sidecar 冒烟；钥只在服务端 |
| **P2** | P1b 冒烟绿；可选 考证 shortlist 具名同行（**非 blocker**——默认 stance 已够）；学生预算见 [`STUDENT_LLM_QUOTA.md`](./STUDENT_LLM_QUOTA.md)（仍待锁数字） | Live GroundedReply + **完整 cite-or-retry**；Era Critic LLM 挑战行；多 NPC；可选具名 peer 风味；可选 embedding Retriever |

---

## 8. Open remaining（非 blocker）

| 项 | 备注 |
|---|---|
| LiteLLM 别名背后的**上游型号** | 配置-only，非 app 决策 |
| **学生成本** / 配额数字锁 | 策略草稿已写 → [`STUDENT_LLM_QUOTA.md`](./STUDENT_LLM_QUOTA.md)（**Draft · not locked**）；回合帽 / BYOK 待导演锁 |
| **free 精确解锁拍** | 首次 labEmbed vs 旅舍拍 |
| **多章节辩论** | 仍开；P1a 仅 Coupland — 见 [`DESIGN_GAPS.md`](./DESIGN_GAPS.md) |
| **教学评估 / pedagogy assessment** | 仍开；尚无学习目标量规 / 教师看板 |
| **可选具名 era-peer** | 见 §9·§10；默认 stance 已锁；考证 shortlist **Fajans / Thomson / Crowther** = 加分可选 |
| **可驳斥主张清单 → 板映射** | **已回传** → [`HARD_CRITIC_CLAIMS_ALPHA.md`](./HARD_CRITIC_CLAIMS_ALPHA.md)（C1–C10 全可用；era-opinions JSON 共 12 卡，含 C4/C5/C6/C8） |
| ~~PRODUCT_FLOW M4~~ | **已清理** → [`PRODUCT_FLOW.md`](./PRODUCT_FLOW.md)（pure-2D 默认） |
| BFF 包布局 | **Accepted** — [`adr/0003-debate-bff.md`](./adr/0003-debate-bff.md)（`apps/web`；独立 `debate-proxy` 延后） |

---

## 9. Era Critic forms（导演锁 · 2026-09-07 · stance-critic LOCKED）

**Hard antagonist need NOT be a named historical person.**  
**LOCKED**：默认 = 抽象 **时代主流理解（era-mainstream stance）**；`form: stance` · `identity_locked: false` · `charId: null`。  
玩家通过 **Watson** 以 **substantial written input（长文反驳）** 反驳。EvidenceBoard + 规则 Judge 仍判胜。具名当代同行 = **可选风味 / 加分**，**非** P1a blocker。

### Era Critic forms

| Form | Shape | Player rebuttal |
|---|---|---|
| **stance Critic（default · LOCKED P1）** | 无脸 / 或通用剪影；说 EraOpinionStore 台词 | **Watson 长文反驳** + propose-fill 槽 |
| **Named peer（optional P2+ · 加分）** | 考证 shortlist 可选具名皮肤；**不要求** | 同板规则（CriticPolicy + Judge） |

**可选具名皮肤（考证 shortlist · 加分，非必需）**：Fajans（首选圈内）· Thomson（范式对手）· Crowther（实验侧技术杠）— 见 `kaozheng/ch1-ForgetPhys-Hard质疑者短名单.md`。无脸「主流冷淡」复合体仍可作氛围。**禁止编造人名。**

### Watson essay path（长文反驳）

- **Hard UI**：multiline 输入（不只短聊回合）；Watson 可提交 **long rebuttal essay**
- Critic 以 `era_opinion` 挑战行回应；**CriticPolicy** 仍要求 cites / slot fills — **长文 alone 不胜**
- **建议**：一次 essay submit 若 cites 干净映射，可 **propose 多槽 fill**；回合预算按产品计 **1–N**（**推荐：1 essay submit = 1 turn**，但若 Critic 逐槽通过可填多槽）
- Judge / EvidenceBoard 判胜；Era Critic **不可否决**合法 Fact 填

默认 Persona：`packages/content/src/debate/persona-era-peer-1909.json`（id 保持；概念名 = stance Critic / `persona-era-stance-1909`；`optional_named_skins_ref` → 考证短名单）

---

## 10. 史料考证回传（shortlist + 主张映射已到）

**已回传（2026-09-07）**：具名同行 **shortlist** → `kaozheng/ch1-ForgetPhys-Hard质疑者短名单.md`  
→ 可选皮肤：**Fajans / Thomson / Crowther**（加分，非 P1a / 非必选用）；默认仍 stance。

**已回传（2026-09-07）**：可驳斥主张清单 → EvidenceBoard 映射 → [`HARD_CRITIC_CLAIMS_ALPHA.md`](./HARD_CRITIC_CLAIMS_ALPHA.md)  
（考证源：`kaozheng/ch1-ForgetPhys-Critic可驳斥主张清单.md`）

- **P1a ready**：C1 / C2 / C3 / C7 / C9 / C10（EraOpinion 已在 `era-opinions-1909-atomic.json`）
- **已落地**：C4 / C5 / C6 / C8 已入 `era-opinions-1909-atomic.json`；P1a Critic 可用 C1–C10
- EraOpinion **绝不**填槽；Watson essay / Fact cites 填槽；stance Critic 用上表作挑战行

约束：

- **无考证勿造人名**；P1 默认用抽象「时代主流理解」，**不要求**定名
- 角色定位：**Hard 对手（antagonist stance）**；**非** win-veto；**非** Judge
- 若日后启用具名 peer 皮肤，写回可选 Persona + 本 Spec §2 矩阵；**不得**把具名当成 P1a 门槛
- **勿自编 claim list** — 新主张只经史料考证回传

默认：`packages/content/src/debate/persona-era-peer-1909.json`

---

## 相关路径

| 路径 | 角色 |
|---|---|
| `docs/DEBATE_SCHEME_V3.md` | **现行导演 SoT（本文）** |
| `docs/DEBATE_SCHEME_REFINED.md` | v2 摘要 → 指向 V3 |
| `docs/DEBATE_ARCHITECTURE.md` | 英文完整架构 Spec v3 |
| `docs/DEBATE_AUDIT_2026-09-07.md` | B1/B2 锁后自检 · H1–L3 |
| `docs/DEBATE_CONTENT_SCHEMA.md` | Persona / Fact / EraOpinion / HardSlots JSON 形（Zod P1a） |
| `docs/DEBATE_PACKAGE_API.md` | `packages/debate` TS 接口草图（仅类型） |
| `docs/SCRIPTED_DIALOGUE_AUTHORING.md` | `manchester.json` 编剧 / claim 徽章 / 演绎旗 |
| `docs/STUDENT_LLM_QUOTA.md` | 学生配额 / 成本策略（**Draft · not locked**） |
| `docs/DESIGN_GAPS.md` | 已填 vs 仍开设计缺口清单 |
| `docs/PRODUCT_FLOW.md` | 纯 2D 壳流程 + 辩论叠层（M4 已清） |
| `docs/HARD_EVIDENCE_SLOTS_ALPHA.md` | Coupland 六槽 · 胜 = era understanding / peers / board |
| `docs/HARD_CRITIC_CLAIMS_ALPHA.md` | stance Critic 可驳斥主张 → 槽映射（考证 SoT） |
| `docs/LLM_KEY_PATH.md` | B1 密钥路径 |
| `docs/DEBATE_UX.md` | DebateSession UX 线框 / 组件清单（Venue2D） |
| `docs/adr/0003-debate-bff.md` | BFF 落点 **Accepted**（`apps/web` internal proxy；游戏架构 + 游戏设计） |
| `docs/GROUNDED_REPLY_PROMPTS.md` | P2 GroundedReply 提示组装 + JSON cite 契约 |
| `docs/LABEMBED_POSTMESSAGE.md` | Infinitas postMessage 独立合约（架构 §16） |
| `docs/PROGRESS_SAVE_SCHEMA.md` | 解锁 / debateSession / EvidenceBoard 存档草图 |
| `docs/DOCS_INDEX.md` | 全 docs 目录（Debate SoT → V3） |
| `packages/content/src/debate/` | 卡片 JSON SoT（含 stance Critic persona） |
| `packages/content/src/data/manchester.json` | 常规模式对白 SoT |
| `packages/debate/` | 运行时桩（P1a 前空；接口见 DEBATE_PACKAGE_API） |
| `kaozheng/ch1-ForgetPhys-Hard质疑者短名单.md` | 可选具名皮肤 shortlist（Fajans / Thomson / Crowther） |
| `kaozheng/ch1-ForgetPhys-Critic可驳斥主张清单.md` | Critic 可驳斥主张考证源（映射见 HARD_CRITIC_CLAIMS_ALPHA） |
