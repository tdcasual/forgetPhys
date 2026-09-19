# INSTRUMENT_AUTH · alpha-source-geometry-1909

Date: **2026-09-19 · M3.4**（I3 P0 基线 2026-09-06）

| ID | 结果 | 备注 |
|---|---|---|
| I1 | PASS | card.md 定稿 |
| I2 | PASS | 与 ZnS 共用 GM1909 PD figs |
| I3 | **PASS** | 锥管+薄箔+铅挡；**云母窗 polish** 保持；拓扑：源管 → 箔 → 铅挡 可读（史实 GM 关系） |
| I4 | PASS | 无现代铅罐源/厚金砖/辐射贴纸 |
| I5 | PASS / CONDITIONAL | 台面尺度；lab 合成 `@ deskY≈0.60` / hotspot `[0.42, 0.60]`（content 仍用 legacy hotspot；propLayout.slots 可选后续接线） |
| I6 | WIP | 热区：云母窗/箔/铅挡交实现（非本 PR 阻断） |
| I7 | N/A | 源端无发光态（读斑在 ZnS） |
| I8 | PASS | provenance + auth QA；CGI 仅审计 |

**云母 polish（2026-09-06）**：`final.png` / `states/idle.png` 管端尖口可见半透明云母封口；黑底；无辐射贴纸。QA：`shots/qa/prop-alpha-mica-polish-qa.png`

**M3.4 desk 舞台：** lab-coupland 桌面 **仅** 本 prop（**ZnS off**）。合成：`shots/qa/m3-4-lab-coupland-prop-desk.png`。不把 ZnS 与源几何叠成双仪器抢戏。

**拓扑 QA（保留准确）：** 游戏皮可读出锥形氡管（云母窗端）→ 金属箔反射体 → 铅挡板；与 card 特征条一致。I3 维持导演 PASS。

**总评：I3 PASS（P0）· INSTRUMENT 整体 CONDITIONAL PASS**（I6 WIP；deskY 几何在 QA 合成已对齐 hotspot）。入库状态不变。
