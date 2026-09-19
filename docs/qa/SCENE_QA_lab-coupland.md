# 场景 QA · lab-coupland
Venue: lab-coupland  Date: **2026-09-19 · M3.4**  Reviewer: art-assets (self-grade → director)

| ID | 结果 | 备注 |
|---|---|---|
| G1.1 Framing 统一 | PASS | 双人 bust 腰上，L/R 槽底边对齐（contact≈22%） |
| G1.2 framing 字段一致 | PASS | `framing.json` dialogueDefault=bust |
| G1.3 主镜头 bust | PASS | Venue2D 对话默认 bust + lit `__lab-left` |
| G2.1 站姿落地 | PASS | 方案 B：bust 不露脚；禁站椅面 |
| G2.2 坐姿对齐椅面 | N/A→PASS | 对话用 bust，不依赖 CSS 拼椅 |
| G2.3 桌沿遮挡 | DEFER | 按修订：**不**以 desk occluder 为终态；L/R bust 优先 |
| G2.4 华生坐落点 | PASS | bust 构图，不浮空露无椅腿 |
| G3.1 身高 0.85–0.95 | PASS | companion ≈0.90× scientist |
| G3.2 肩宽可读 | PASS | L/R 缩小 bust，中间留实验台 / α prop |
| G3.3 无桌宠缩放 | PASS | |
| G4.1–G4.3 光影 | PASS | `__lab-left` 吃左侧暖灯 |
| G5.1–G5.2 年代 | PASS | 独立 α 几何；**ZnS 本帧关闭**（不烤现代屏） |
| G5.3 无开发字样 | PASS | 对话无 P0；QA 图 TEMP 标注仅审计 |
| G6.* 动作 | PASS / N/A | speak+听本；point 备用 |
| G7.1–G7.2 名字 | PASS | 对话框 namebox；胸口浮条关 |
| G7.3 主操作 | PASS | 继续为主；实验台次级 |
| G8.* 一致性 | PASS | Rutherford bust + Watson edwardian-1909 |

**Geiger：** `char-geiger` **CUT** from dialogue speakers（仅史料提名；不进对话立绘路径）。M3.4 不重新启用。

**M3.4 合成：** `shots/qa/m3-4-lab-coupland-prop-desk.png` — bg `final.png` + `alpha-source-geometry-1909` @ deskY≈0.60 / hotspot `[0.42, 0.60]` + L/R `__lab-left` busts。ZnS off。

**自检总评：CONDITIONAL PASS**（G2.3 DEFER；其余 G1–G8 绿 / 可接受）。待导演截图验收。

附件（历史）：`shots/qa/lab-coupland-runtime-{clean,contact}.png`  
附件（M3.4）：`shots/qa/m3-4-lab-coupland-prop-desk.png` · `shots/qa/m3-4-manchester-venue-contact.png`
