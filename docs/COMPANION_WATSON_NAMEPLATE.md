# 需求拆解：胸口小名牌 + 华生式伴灵（时代换装）

## A. 你在要什么（释义）

### 1. 名字 UI
- **位置**：贴在角色**胸口**附近（立绘上），不是脚下整条、不是对话框独占一行外的第二大条。
- **体量**：字号小、背景弱（半透明小胶囊即可），不抢表情和场景。
- **仍默认显示**（可关），但视觉权重 ↓↓。
- 对话框里的说话人名可保留更小字，或仅在换人时闪一下——P0 建议：**胸口小牌为主，对话框 speaker 缩成一行小字**。

### 2. 伴灵人设：固定「华生」
- **固定的是角色功能与气质**，不是某一版影视版权脸：
  - 福尔摩斯侧的 **Watson**：记录者、提问者、跟班、务实、偶尔吐槽天才
  - 映射到本游戏：跟科学家进实验室、帮玩家问「为什么」、把现象写成可懂的话
- **脸与身份锁定一套 `_canon/`**（不再漂成美少女助手 / 派蒙 / 微光工装）
- **禁止**直接复刻某演员（Jude Law / Martin Freeman 等）的可识别肖像；用「维多利亚军医跟班」原型自创脸

### 3. 穿着随时代变
- **脸/发型/体型不变**；只换 **outfit 层**（或整身换装图但脸用 FaceID 锁死）
- 随章节年代（教材编年）切换服装包，而不是每句对话乱换

---

## B. 和现状冲突

| 现状 | 冲突 |
|---|---|
| 名牌在立绘下方大黑条 | 占位大、像字幕条 |
| 伴灵 id=`char-weiguang` 微光工装女 | 非华生原型 |
| 服装一套打天下 | 不满足「随时代」 |
| 科学家与伴灵风格不齐 | 华生应与科学家同 Style block |

---

## C. 落地方案

### C1. 名牌（工程 · 半天）
```
.portrait-wrap { position: relative }
.nameplate-chest {
  position: absolute;
  left: 50%; top: 52%–58%; /* 胸口 */
  transform: translate(-50%, 0);
  font-size: 11–12px;
  padding: 2px 6px;
  background: rgba(20,16,12,.55);
  border-radius: 3px;
  pointer-events: none;
  white-space: nowrap;
  max-width: 40% of portrait;
}
```
- 去掉脚下大 nameplate 行
- `showNameplates` 仍默认 true
- 验收：名牌面积 ≪ 脸面积；不挡眼睛

### C2. 伴灵身份（内容 + 美术）
- 游戏名建议直接 **「华生」**（玩家秒懂职能）；英文 id `char-watson`
- 简介文案：玩家侧的「记录与追问同伴」，不是福尔摩斯本尊
- 作废/归档：`char-weiguang`、`char-companion`（可留档）
- `_canon/`：华生准脸 + identity + sheet（与科学家同一插画 Style 句）

**气质锚点（identity 示例）**
```
Watson-archetype companion for science chronicle, adult man ~30–35,
steady practical face, short neat brown hair, light mustache optional,
loyal recorder/sidekick energy (asks clarifying questions),
NOT Sherlock, NOT a fairy, NOT chibi
```

### C3. 时代换装（数据驱动）
内容 JSON：
```json
"companionOutfitByEra": {
  "1897": "cambridge-lounge",
  "1909": "manchester-tweed",
  "1913": "edwardian-morning"
}
```
或按 venue：`outfitId` 由 `venue.years` 解析。

资产：
```
chars/char-watson/
  _canon/face.png
  outfits/
    1897-cambridge/   stand__idle, sit__think, ...
    1909-manchester/  ...
    1913-copenhagen/  ...
```

| 年代 | 场所 | 华生着装方向（史实感，非影星复刻） |
|---|---|---|
| ~1897 | 剑桥 | 深色 frock/lounge + 硬领，学院跟班 |
| ~1909–11 | 曼城 | 粗花呢三件套 / 实用外套（工业城） |
| ~1913 | 哥本哈根 | 爱德华时期 morning coat / 整洁西装 |

**生成约束**：换装时 **FaceID/InstantID 锁 `_canon/face.png`**；只改衣服提示词；并排 QA 必过。

### C4. 对话职能（写作）
华生台词模板：追问实验细节、转述计数、质疑模型——对应原著「记录与追问」，不是主角下结论（结论仍归科学家）。

---

## D. 实施顺序

1. **P0 工程**：胸口小名牌 CSS（科学家+伴灵一起改）  
2. **P0 内容**：speaker「微光」→「华生」；id 切 `char-watson`  
3. **P0 美术**：华生 `_canon` + **1909 曼城一套**姿态（先够第一章）  
4. **P1**：1897 / 1913 换装包  
5. 比例：华生与卢瑟福同头身体系（华生可略矮），禁止站椅面缩小

## E. 风险
- 「华生」商标/形象：用角色名致敬可，**不要**抄特定影视造型与脸  
- 换装若无 FaceID，脸又会漂 → 必须走已定 CHAR_CONSISTENCY 流程  


---

## F. 跨时代换装（强制 · 2026-09-06）

华生跟玩家 **从古至今** 走过整部编年：每一历史层用不同 `outfits/{era-slug}/`，脸始终 `_canon/face`。

正式门禁：[`WATSON_ERA_OUTFIT_GATE.md`](./WATSON_ERA_OUTFIT_GATE.md)（W1–W6）。  
名牌/UI：[`UI_GATE.md`](./UI_GATE.md) U3（主用 Ren'Py namebox）。

P0 先交 `edwardian-1909`；剑桥 `victorian-1890s`；玻尔 `belle-epoque-1913`；更早/更晚章开章前补齐。
