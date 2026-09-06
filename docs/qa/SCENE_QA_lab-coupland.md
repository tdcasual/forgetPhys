# 场景 QA · lab-coupland
Venue: lab-coupland  Date: 2026-09-06  Reviewer: 实现合稿（导演注）

| ID | 结果 | 备注 |
|---|---|---|
| G1.1 Framing 统一 | PASS | 双人 bust 腰上，L/R 槽底边对齐 |
| G1.2 framing 字段一致 | PASS | `framing.json` dialogueDefault=bust |
| G1.3 主镜头 bust | PASS | Venue2D 对话默认 bust + lit `__lab-left` |
| G2.1 站姿落地 | PASS | 方案 B：bust 不露脚；禁站椅面 |
| G2.2 坐姿对齐椅面 | N/A→PASS | 对话用 bust，不依赖 CSS 拼椅；sit-baked 待美术 |
| G2.3 桌沿遮挡 | DEFER | 按修订：**不**以 desk occluder 为终态；L/R bust 优先 |
| G2.4 华生坐落点 | PASS | bust 构图，不浮空露无椅腿 |
| G3.1 身高 0.85–0.95 | PASS | runtime contact watsonScale≈0.90 |
| G3.2 肩宽可读 | PASS | L/R 缩小 bust，中间留实验台 |
| G3.3 无桌宠缩放 | PASS | |
| G4.1–G4.3 光影 | PASS | `__lab-left` |
| G5.1–G5.2 年代 | PASS | 磷光屏；家具不诱导踩踏 |
| G5.3 无开发字样 | PASS | 对话无 P0 |
| G6.* 动作 | PASS / N/A | speak+听本；point 备用 |
| G7.1–G7.2 名字 | PASS | **对话框 namebox**（卢瑟福）；胸口浮条已关 |
| G7.3 主操作 | PASS | 继续为主；实验台次级 |
| G8.* 一致性 | PASS | 刷新 bust（少鬓灰） |

**导演注 · G2 现 PASS：** G2.1、G2.2（bust 路径）、G2.4。  
G2.3 desk occluder **刻意 DEFER**（SPRITE_PIPELINE_REVISED：禁止 CSS 拼椅终态；待 sit-with-chair 或维持 L/R bust）。

附件：`shots/qa/lab-coupland-runtime-{clean,contact}.png`
