# 美术资源规范审计（2026-09-06）

结论摘要：**规范框架已够用（甚至偏密），落地仍不齐；最大风险是「文档过关、运行时/跨层皮未过关」。**

## 合理之处
- 门禁分层正确：脸 / 建筑 / 仪器 / 服装 / 场景合成 / UI / 地图 / 授权
- 流水线同构：史料卡 → _refs → final → 并排 QA → checklist
- 华生跨时代 slug、仪器分卡（ZnS / α 源）决策正确
- P0 曼城仪器两端已导演 PASS；lab 去烤屏改独立 prop 方向对

## 主要缺点
1. **规范 > 执行**：UI_GATE / MAP_GATE / STYLE_UNIFY 多半仍是纸面；namebox 与胸牌 CSS 并存
2. **角色成熟度断层**：卢瑟福+华生 1909 相对齐；汤姆孙/玻尔仅 idle；盖革半成品；旧 companion 未清
3. **跨层风格未过 S**：bg 偏写实插画、立绘批次不一，缺四格同帧 STYLE QA
4. **内容未接线**：JSON 有 char-watson，缺 `outfit` / props 热区；仪器 PASS ≠ 进游戏
5. **华生换装只有 1/8 有图**：其余 slug 空壳，开章会卡 W1
6. **地图 M 门禁几乎未验**：map-europe 仍是早稿
7. **仓库噪音**：draft/REJECT/ARCHIVED/3D gold-foil gltf 混在资产根
8. **自动化为零**：全靠人目检，回归贵
9. **双树同步**：physics-chronicle vs physics-game 易漂

## 改进优先级
P0 执行：namebox 实装、outfit+prop 接线、STYLE 四格、清归档、汤姆孙/玻尔 _canon
P1 补齐：华生 victorian/belle-epoque；命运地图过 M；lodge B2；云母窗 polish
P2 系统：脸相似度脚本、debug=contact、单一 monorepo 资产源


## 修复状态 · 2026-09-06 14:09

| 项 | 状态 |
|---|---|
| namebox / outfit+props / archive / validate+debug | 工程 DONE |
| STYLE 四格 | P0 CONDITIONAL PASS |
| Thomson/Bohr _canon | CONDITIONAL PASS（无 FaceID） |
| 华生各时代 | victorian/belle 四表情；其余 idle 占位 |
| map-europe M1–M4 | PASS |
| lodge B2 + 云母窗 | PASS |
