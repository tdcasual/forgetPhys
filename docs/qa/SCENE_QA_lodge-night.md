# 场景 QA · lodge-night
Venue: lodge-night  Date: **2026-09-19 · M3.4**  Reviewer: art-assets (self-grade → director)

| ID | 结果 | 备注 |
|---|---|---|
| G1.1–G1.3 | PASS | 双人 bust；lit `__lodge-right`（油灯 key） |
| G2.1 / G2.4 | PASS | 方案 B L/R bust，不踩椅；无底边裁切 |
| G2.2 | N/A→PASS | 对话 bust；sit-baked 仍非终态 |
| G2.3 | DEFER | 同 lab：不以 occluder 为终态 |
| G3.* | PASS | companion ≈0.90× |
| G4.* | PASS | `__lodge-right` 吃油灯侧光 |
| G5.* | PASS | 无现代屏；无 P0 台词；联排雨夜窗 |
| G6.* | PASS | 华生追问 / 卢瑟福旁听构图可读 |
| G7.* | PASS | namebox；胸口浮条关 |
| G8.* | PASS | Rutherford + Watson edwardian-1909 |

**Geiger：** `char-geiger` **CUT** from dialogue speakers。Lodge 桥接已用 Narrator 取代旧 Geiger stub（见 manchester.json notes）。M3.4 不重新启用。

**M3.4 合成：** `shots/qa/m3-4-lodge-night-busts.png` — bg `final.png` + L Rutherford `idle__lodge-right` + R Watson `stand__idle__lodge-right`；无 clipping。  
（说明：资产 lit 变体仅有 `__lodge-right` / `__lab-left`；「lodge-left/right」指 L/R 槽位，非第二套 lit 文件名。）

**自检总评：CONDITIONAL PASS**（G2.3 DEFER；其余 PASS）。待导演截图验收。

附件（历史）：`shots/qa/lodge-night-runtime-{clean,contact,fixed}.png`  
附件（M3.4）：`shots/qa/m3-4-lodge-night-busts.png` · `shots/qa/m3-4-manchester-venue-contact.png`

## 2026-09-06 reject fix（保留）
- Path: **bust L/R** (ENABLE_SIT_BAKED=false). sit-baked at bust-slot scale = FAIL (chairs on desk).
- Shot: `shots/qa/lodge-night-runtime-fixed.png` — bust only, namebox on dialogue, no sit-with-chair furniture on desk.
