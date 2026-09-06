# 华生时代换装门禁（Watson Era Outfit Gate）

Status: **Mandatory · 2026-09-06**  
华生是跨编年跟班：**脸/身份固定，服装随时代变**——从古代主题到近现代原子章，一路跟到「今」。

## 0. 原则

| 锁死 | 可变 |
|---|---|
| `_canon/face.png` + identity（气质：记录者/追问者） | `outfits/{era-slug}/` 整套服装 |
| 体型、发型轮廓（除非史料级「蓄须」等显式例外） | 外套、领型、帽、靴、配件 |
| 与科学家同一 Style block | 色板随年代（维多利亚棕黑 → 爱德华 → …） |

**禁止**：换装换脸；一装打天下；某影视华生演员可识别脸。

## 1. 目录与命名

```
assets/chars/char-watson/
  _canon/
    face.png
    sheet.png
    identity.txt
    checklist.md
  outfits/
    {era-slug}/
      stand__idle.png
      stand__speak.png
      stand__think.png
      stand__surprise.png   # 最少四表情
      provenance.md
      checklist.md          # 含「该年代服饰锚点」
```

`era-slug` 示例（随章节扩展，**不是**只有 1909）：

| era-slug | 年代约 | 服饰锚点（示意） | 首用章节 |
|---|---|---|---|
| `classical-mediterranean` | 古典/希腊化等 | 简袍/斗篷类跟班装，非戏仿卡通 | 若有古代光学/原子萌芽主题 |
| `early-modern-eu` | 16–17c | 欧洲近代学者随从：披肩、宽檐或无帽务实装 | 若有伽利略等章 |
| `victorian-1890s` | ~1897 | 高领、深色西装/大衣 | 剑桥 Thomson |
| `edwardian-1909` | ~1909–11 | 三件套/马甲、怀表链感、曼城灰雾实用 | **P0 曼城 Rutherford** |
| `belle-epoque-1913` | ~1912–13 | 北欧城市中产便装/西装 | 哥本哈根 Bohr |
| `interwar` | 1920–30s | 更利落西装、略短领 | 后续核/量子章 |
| `midcentury` | 1940–60s | 战时/实验室工作外套或夹克 | 核裂变等 |
| `contemporary-lab` | 2000s–今 | 现代但克制的实验室随员装（仍插画风） | 当代收束 |

未开章的 era **可先占位 slug + 服饰锚点卡**，不强制出图；**已开章缺对应 outfit = 拒收该城对话**。

## 2. 门禁条目

| ID | 标准 | 拒收 |
|---|---|---|
| W1 | 该城/该章 content 声明 `watsonOutfit: {era-slug}`，运行时只载入该目录 | 曼城仍穿 contemporary |
| W2 | 同 era 四表情脸锁 canon（并排 QA） | 换装后面孔漂成另一人 |
| W3 | 服饰有 `_refs` 或文字锚点（时尚史/年代照片类型，非演员照） | 凭空赛博夹克进 1909 |
| W4 | 与同场科学家 Style block 一致 | 华生二次元、卢瑟福照片 |
| W5 | 跨章可辨认为同一人（剪影+脸） | 每章换一个路人 |
| W6 | provenance 每套 outfit 齐全 | 无授权说明 |

## 3. 内容接线

```json
"companion": {
  "charId": "char-watson",
  "outfit": "edwardian-1909"
}
```

城市页或 venue JSON 必须带 `outfit`；缺省时 **开发期可回退** `edwardian-1909`，但 checklist 记 WARN，发版前清零。

## 4. P0 最低集

- [x] 规划本表 slug  
- [ ] `edwardian-1909` 四表情 bust（曼城）— 统一插画风重烤  
- [ ] `victorian-1890s`（剑桥）  
- [ ] `belle-epoque-1913`（哥本哈根）  
- 更早/更晚章：开章前 1 周出对应 outfit

## 5. 与名牌

名牌文案固定「华生」；换装不改名。UI 服从 `UI_GATE.md` U3。
