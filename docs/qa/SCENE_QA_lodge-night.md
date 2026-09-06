# 场景 QA · lodge-night
Venue: lodge-night  Date: 2026-09-06  Reviewer: 实现合稿（导演注）

| ID | 结果 | 备注 |
|---|---|---|
| G1.1–G1.3 | PASS | 双人 bust；`__lodge-right` |
| G2.1 / G2.4 | PASS | 方案 B L/R bust，不踩椅 |
| G2.2 | N/A→PASS | 对话 bust；sit-baked 待美术 |
| G2.3 | DEFER | 同 lab：不以 occluder 为终态 |
| G3.* | PASS | watsonScale≈0.90 |
| G4.* | PASS | `__lodge-right` 吃油灯 |
| G5.* | PASS | 无现代屏；无 P0 台词 |
| G6.* | PASS | 华生 think/追问 + 卢瑟福旁听 |
| G7.* | PASS | namebox「华生」；胸口浮条关 |
| G8.* | PASS | |

**导演注 · G2 现 PASS：** G2.1、G2.2（bust）、G2.4。G2.3 DEFER。

附件：`shots/qa/lodge-night-runtime-{clean,contact}.png`

## 2026-09-06 reject fix
- Path: **bust L/R** (ENABLE_SIT_BAKED=false). sit-baked at bust-slot scale = FAIL (chairs on desk).
- Shot: `shots/qa/lodge-night-runtime-fixed.png` — bust only, namebox on dialogue, no sit-with-chair furniture on desk.

