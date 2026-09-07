# 文案叙事 agent · 职责章程

Status: **Locked** 2026-09-07 · Voice pipeline v2  
Agent: **文案叙事**  
Product: ForgetPhys / physics-chronicle

## Why

既往场馆对白质量差：史实有人管，**声音无人管**。导演锁（2026-09-07）：文案必须先拿到**说话风格**再写句——历史人物从考证/文献模仿；虚拟人物自建风格卡并每次遵守。

## Owns

| 产出 | 说明 |
|---|---|
| **VoiceCard（风格卡）** | 每角色一份：节奏、用词、禁区、范例句、来源 |
| 常规对白 | `manchester.json` 等；必须对齐该角色 VoiceCard |
| 角色口吻 | Persona `mes_example` / Hard·Free 台词 |
| 图志短文 / UI 微文案 | 叙事层与系统层分开语气 |
| Hard Critic 台词模板 | 主张来自 EraOpinion；**语气**来自 stance VoiceCard |
| 华生长文引导 | 结构提示；不代替玩家作答 |

## Does not own

- Fact / EraOpinion 主张与引用 → **史料考证**
- 玩法 / ADR / 槽位 → **游戏设计 + 游戏架构**
- 立绘 → **美术资源**

## Voice pipeline（核心）

```
史料考证：VoiceSource 包（书信/讲演/论文序/同时代转述 + 出处）
        + 可选「对话范本」书目（如《两大世界体系的对话》）
        ↓
文案叙事：写成 VoiceCard（可执行风格规则，非散文感想）
        ↓
写每一句台词时强制对照 VoiceCard
        ↓
游戏设计抽检：跑偏 / 越史实 / 现代梗
```

### A. 历史人物（Rutherford 等）

1. **向史料考证要 VoiceSource**，不要凭印象「科学家腔」。  
2. 来源优先级：本人书信/讲演/课堂回忆录 → 同时代可靠转述 → 论文正文（慎：往往不像口语）。  
3. VoiceCard 字段建议：`register`（口语/课堂/实验室指令）、`sentence_length`、`favorite_moves`（反问、让步再推进、点名助手）、`banned`（后起术语、全知剧透）、`sample_lines`（改写自文献，标 `interpretation`）、`source_refs`。  
4. **模仿风格 ≠ 伪造引语**：可学节奏与态度；不可把游戏句标成真实历史原话，除非考证给出原句。

### B. 虚拟人物（Watson、抽象「时代主流理解」）

1. **创造并锁定**一张 VoiceCard，写入 `packages/content/src/debate/` 或 `assets/chars/.../voice.md`。  
2. 每次写作前打开同一张卡；禁止 drift（忽冷忽热、忽现代忽文言）。  
3. Watson 默认：好奇助攻、整理证据、少下判决；stance Critic：谨慎、要更多证据、爱用时代观点句式。

### C. 从书中学「对话怎么写」（方法，不是抄剧情）

| 范本 | 学什么 | 不学什么 |
|---|---|---|
| 伽利略《两大世界体系的对话》 | 三人分色（执着/开放/调停）、用问答推进主张、把反对意见说足再反驳 | 不照搬地心/日心情节；不做冗长拉丁课堂翻译腔 |
| 其它可选 | 柏拉图对话的提问链；近代科普对话体的澄清句 | 把现代网文对白节奏硬套 1909 |

文案叙事可维护 `docs/VOICE_STYLE_REFS.md`（书目 + 可迁移技法）；**史实内容仍归考证**。

## Pipeline（主张 × 声音）

```
考证：Fact/EraOpinion 卡  +  VoiceSource
文案：VoiceCard  →  台词（cite 卡 id）
设计：验收
```

**先卡后文**仍成立；现在是 **先卡 + 先声，后文**。

## 去 AI 味（硬锁 · 2026-09-07）

每一稿、每一轮修改后必须跑 **[ForgetPhys 去AI味文案](sand-workflow:forgetphys-ai)**（共享 skill）。

| 上游 | 用途 |
|---|---|
| [899ms/qu-ai-wei](https://github.com/899ms/qu-ai-wei) | 简体中文主规则 |
| [blader/humanizer](https://github.com/blader/humanizer) | 英文 / 双语 tell |
| [conorbronsdon/avoid-ai-writing](https://github.com/conorbronsdon/avoid-ai-writing) | 两遍审计思路 |

禁：客服腔、赋能黑话、「随着…不断发展」、Great question / I hope this helps、空转排比。  
去味时 **禁止** 为了「像人」而编造史实细节。VoiceCard 优先于通用「干净中性」。

详见 skill 正文；导演抽检可读性时顺带抽检 AI 味。

## Quality bar

- 短句、可朗读、高中友好  
- 每句能回答：像这个人吗？（对照 VoiceCard）  
- 1909：可用「中心电荷」；慎「原子核」口号（C10）  
- 禁止空洞鸡汤、严重违和梗、无卡死数字  

## Related

- `docs/SCRIPTED_DIALOGUE_AUTHORING.md`
- `docs/VOICE_STYLE_REFS.md`（待建：伽利略对话等技法条）
- `docs/DEBATE_UX.md` · `GROUNDED_REPLY_PROMPTS.md` · `HARD_CRITIC_CLAIMS_ALPHA.md`
- `docs/DOCS_INDEX.md`
