# 角色一致性约束（美术资源强制 · 2026-09-06）

## 0. 现场问题（审计）

对照 `char-rutherford/sit-chair__speak.png` vs `point-screen__speak.png`：

| 维度 | sit-chair | point-screen | 判定 |
|---|---|---|---|
| 发色 | 深棕，鬓角少许灰 | 灰白、明显后退 | **漂移** |
| 须色 | 深棕浓须 | 灰白须 | **漂移** |
| 年龄感 | 约 38–40 | 明显更老 | **漂移** |
| 道具 | 无 | 手持烟斗 | **违规**（对话指屏不该抽烟斗） |
| 渲染 | 偏照片写实 | 偏照片写实 | 与微光插画同框仍冲突 |

结论：缺 **Canonical Face（唯一准脸）** + **身份块 verbatim** + **参考权重**；每张姿态独立生成 → 脸会漂。

人环比例/动作问题仍在：姿态图自带椅子 vs 背景空椅叠层；指屏手臂透视未对准桌上仪器。

---

## 1. 流水线（锁死）

```
史实肖像 → Canonical Face（唯一准脸，裁正脸）
        → Character Sheet（正/侧/3-4 + 2–3 表情，同一次生成批次）
        → 仅改 pose/scene，**永远回指 Canonical，禁止用上一张姿态当下一张参考**
        → QA checklist ≥2/3 + 脸一致性目检
        → 入库（覆盖须过检）
```

**禁止**：无参考连发多姿态；用姿态 A 作参考生成姿态 B（累积漂移）；同角色混「少年美型 / 老年勋爵」。

---

## 2. 每人必须交付的「角色圣经」目录

```
assets/chars/{id}/
  _canon/
    face.png              # 唯一准脸（从史实裁 + 统一风格加工的一张）
    sheet.png             # turnaround：正/侧/3-4
    identity.txt          # 5–7 条身份短语，英文或中英，**逐字复用**
    checklist.md          # 史料锚点 3 条 + 本角色禁区
  {pose}__{emotion}.png   # 成品；透明底；**不含场景家具**（椅/桌由场景或单独 prop）
```

### Rutherford `_canon/identity.txt` 示例（锁定后禁止改写）
```
Ernest Rutherford circa 1910, age ~39, sturdy build, broad forehead,
thick dark brown walrus mustache with clean-shaven chin,
short dark brown hair lightly greying only at temples NOT full grey,
three-piece dark suit, high collar, watch chain,
illustrated game sprite consistent with canon face, not a photo cutout
```

### 禁区（Rutherford）
- 全白发 / 勋爵老年像
- 美型无胡须少年
- 烟斗（除非内容明确写「休息抽烟」）
- 姿态 PNG 内嵌完整实验室桌椅（避免与 bg 叠家具）

---

## 3. 生成约束（提示词模板）

每张姿态 prompt **结构固定**（只改 Action）：

```
[Identity block — paste verbatim from identity.txt]
+ [Action/pose only]
+ [Framing: waist-up OR full body, solid black or chroma key, NO room furniture]
+ [Style block — same for all Ch1 scientists: "painterly illustrated sprite, soft cel-shade, unified palette, NOT photoreal cutout"]
+ [Quality]
```

**微光**另立 identity（虚构），但 Style block 必须与科学家 **同一句**，避免写实照片 vs 二次元分裂。

---

## 4. 推荐工具（GitHub / 业界）

| 用途 | 项目 | 说明 |
|---|---|---|
| 单图锁脸（首选试） | [InstantID](https://github.com/InstantID/InstantID) | 一张 canonical face → 多姿态，保 ID |
| Face 嵌入 | [IP-Adapter FaceID](https://github.com/tencent-ailab/IP-Adapter) + FaceID-PlusV2 | 与 ControlNet OpenPose 组合控姿势 |
| ComfyUI 节点 | [ComfyUI_IPAdapter_plus](https://github.com/cubiq/ComfyUI_IPAdapter_plus) | FaceID 工作流 |
| 对照实验 | [Lorakszak/avatar_project](https://github.com/Lorakszak/avatar_project) | InstantID vs FaceID 对比 |
| 文本 DNA 法 | [Creepybits/World_weaver](https://github.com/Creepybits/World_weaver) | Prompt Helper 抽 identity 文本 |
| 游戏资产流水线参考 | [ybuild-ai/ai-game-art-pipeline-skill](https://github.com/ybuild-ai/ai-game-art-pipeline-skill) | 规范生成→清理→QA |
| 像素级色板锁（若改像素风） | [sprite-canon](https://github.com/useka12-eng/sprite-canon) | 本项目偏插画，可选 |

**本项目 P0 落地建议**：美术侧用 **InstantID 或 IP-Adapter-FaceID**，参考图固定为 `_canon/face.png`（来自 1908 Nobel 裁脸，风格一次定稿）；姿态用 OpenPose/ControlNet；**禁止**无 FaceID 的纯文生多姿态。

若暂时只能文生：必须 **同一 seed 会话内**出 sheet，再裁；且 identity 块逐字粘贴——仍弱于 FaceID。

---

## 5. QA 门禁（导演/实现拒收标准）

入库前必须：
1. **脸并排**：新姿态与 `_canon/face.png` 缩略并排，发色/须色/年龄一目了然不过关则拒。
2. **史料 checklist ≥2/3**（见审计卡）。
3. **无场景家具**嵌入角色层（椅可分离为 `props/chair.png` 或纯靠 bg）。
4. **同角色同风格句**（禁止一张照片抠图、一张厚涂）。
5. **微光与科学家**同一 Style block；头身比约定：科学家 6.5–7 头，微光同体系略矮。

---

## 6. 人环比例与动作（补约束）

- 角色脚/膝落点对齐 bg 地平；坐姿用「无椅精灵 + bg 椅」或「带椅精灵 + bg 去椅」二选一，**禁止双椅**。
- `point-screen`：食指落点应对准 bg 荧光屏中心；生成时用屏位构图或后期微调偏移。
- 交付尺寸：建议角色图层统一 **高度规范**（如画布内人物占 70% 高），实现用 CSS 常量对齐。

---

## 7. 立刻要美术做的事

1. 从 `rutherford-1908-nobel.jpg` 裁正脸 → 统一插画风格 → `_canon/face.png`
2. 用 InstantID/FaceID **重生** sit / lean / point 三姿态（同一 face）
3. 删 point 里的烟斗；bg 与角色家具去重
4. 盖革同样建 `_canon/`；汤姆孙/玻尔后做但流程相同
