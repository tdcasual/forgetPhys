# ADR 0001 — P0 可执行架构（采纳，game design 附注）

Status: Accepted (2026-09-06)
Author: 游戏架构；reviewed by game design

## Decision
Web monorepo（Vite+React+TS + R3F）；lab-core 纯 TS 自研 MC 散射；图志正交与场所透视同 Canvas，P0 遮罩硬切；content 带 source_tier/citation。

## Tree
见 agent 交付：apps/web/{modes/atlas,modes/venue,camera,dialogue,characters} + packages/{lab-core,content,ui} + docs/adr

## Interfaces
LabPlugin: setup / step / measure / conclude / dispose
VenueSession: enter / exit / tick / dispose；lab 可空
ClaimMeta: textbook | primary | secondary | interpretation

## P0 scope
做：图志壳一节点、Manchester mc-scattering、短对话、CameraDirector 遮罩切、zod 校验
不做：Rapier 教散射、Coulomb/Lorentz 玩法、VRM 完整表演、多 Venue 逛街、跨投影相机飞行、硬编码 nucleus 史实结论

## Game design notes
1. `interpretation` ≡ 项目约定的 D 级戏剧许可；对话 UI 应对 interpretation claim 显示「演绎」角标。
2. P0 英雄台对应 Coupland Street 实验室 Venue；租屋复盘可作无 lab 的 study（只对话），仍算同章、可不进 P0。
3. 接口名 measure 可保留；若实现侧更想 readout，属重命名不改语义。

## Amendment (2026-09-06) — mode rename
Product modes renamed per ADR-002: `worldMap` | `chroniclePlate` | `venue`. Former `atlas` mode id is **deprecated** (opening stage is WorldMap; 图志 = ChroniclePlate illustration, not map cover). Tree path `modes/atlas/` may remain as WorldMap implementation folder until a rename pass.
