# 实验仪器史实门禁（Instrument Auth Gate）

Status: **Mandatory · 2026-09-06**  
适用范围：bg 烤入、独立道具层、立绘手持、实验过场插画、UI 图标——**凡出现实验仪器，一律先考证再画，最后审计**。  
与 `BACKGROUND_AUTH_GATE`（建筑）、`WATSON_ERA_OUTFIT_GATE`（服装）同级。

---

## 0. 原则

> 玩家看到的仪器，必须能回答：  
> 「这是不是 **那一年、那个实验室、那种实验** 里真实用过/同型的东西？」

允许插画简化与夸张可读性；**不允许**用现代示波器、LCD、塑料壳电源、乐高感「科幻管」冒充。

流水线（强制）：
```
史料考证：仪器史实卡（特征 + 史实图 URL）
  → assets/props/_refs/{prop-id}/ 入库史实图（可仅审计）
  → 美术按特征生成/改装 final（独立层优先）
  → 并排 QA（史实 | 游戏皮）
  → 导演按 I1–I8 过检 → 入库
```

**未出史实卡 = 不得画该仪器进发布皮。**  
**未过并排审计 = 不得标场景完成。**

---

## 1. 目录与命名

```
assets/props/{prop-id}/
  _refs/                 # 史实照片/图纸（provenance 逐张）
  final.png              # 游戏皮（透明底优先，可多层）
  states/                # 可选：idle / glow / off …
  checklist.md           # I1–I8
  provenance.md
  card.md                # 或链到考证库仪器卡 ID

shots/qa/prop-{prop-id}-auth-qa.png   # 并排：史实 vs final
```

`prop-id` 建议：`znS-scintillation-screen-1909`、`crt-cathode-thomson-1897`、`coil-magnet-pair-1897` …

内容 JSON 引用：
```json
"props": [
  { "id": "znS-scintillation-screen-1909", "hotspot": [0.62, 0.55], "state": "glow" }
]
```

---

## 2. 门禁条目（全部必过）

| ID | 标准 | 拒收例子 |
|---|---|---|
| **I1** | 有史料卡：名称、年代、场所、实验用途、特征 3–5 条、出处层级 | 「随便画个黑盒子」 |
| **I2** | `_refs/` ≥1 张可对照史实图（年代与类型匹配；授权可仅审计） | 只有现代网图无年代 |
| **I3** | 游戏皮外形与史实 **基本一致**：轮廓、主要部件、材质暗示对得上 | 现代示波器冒充闪烁屏 |
| **I4** | 年代错误件清零：LCD、七段数码管、注塑壳、USB、霓虹实验室灯 | 1909 桌面笔记本电脑 |
| **I5** | 与场所 bg 尺度匹配（SCENE_QA 桌面高度）；独立层优先于烤死在 bg | 屏比人还大或贴纸感错位 |
| **I6** | 若可交互/可指：热区与华生/科学家 `point` 落点对齐（G6.2） | 指天花板 |
| **I7** | 发光/读数态符合物理直觉（磷光斑、荧光，非 UI 进度条） | 绿屏 Windows 桌面 |
| **I8** | provenance + 并排 QA 归档；BY-SA 原图不进发布包 | 无 QA、无来源 |

**「基本一致」操作定义**：未玩过的人对照史实图，能在 5 秒内认出是同类仪器；专家抽查特征条命中 ≥2/3。

---


## 3. 第一章仪器锚点（史料已锁 · 2026-09-06）

来源：考证库 `ch1-仪器史实卡.md`。

### P0 · α 散射闪烁读斑 · 1909 曼城 · `znS-scintillation-screen-1909`（及配套几何）

| 项 | 硬锚点 |
|---|---|
| 装置链 | **锥形氡管 + 云母窗** → **铅挡板** → **金属箔反射体** → **ZnS 屏** → **低倍显微镜** 点数闪烁 |
| 史实图 | https://upload.wikimedia.org/wikipedia/commons/6/6a/GM-1909-1.gif |
| | https://upload.wikimedia.org/wikipedia/commons/e/e4/Geiger-Marsden_diagram.gif |
| | CGI 复原标 C（仅示意，不作唯一外形依据） |
| **禁** | 示波器、半导体探测器、现代计数箱、LCD 绿屏 |

游戏皮须能读出：暗室里看 ZnS 闪烁 + 显微镜/屏，而非电脑显示器。



### P0 · α 源几何 · `alpha-source-geometry-1909`（已锁分卡）

锥形氡管 AB + 云母窗（~1 cm 空气当量）+ 铅板 P + 反射体 RR（金/铂，距管口 ~1 cm）；与 ZnS+显微镜同光路。禁现代铅罐源/厚金砖靶/辐射贴纸器物。交叉引用 ZnS 屏卡。

### P1 可选 · Geiger 早期电学计数 · `geiger-counter-early`

| 项 | 硬锚点 |
|---|---|
| 语境 | 1908 Rutherford–Geiger **电离计数**，**非** 1928 手持 GM 笔管 |
| 主线 | **可不出现**；出现则必过 I 门禁 |
| 史实图 | https://upload.wikimedia.org/wikipedia/commons/9/95/PSM_V87_D120_Apparatus_for_counting_alpha_particles.png |
| | 1932 实物仅审计 |
| **禁** | 黄壳玩具盖革计数器 |

### P0 · Thomson 阴极射线管 · 1897 剑桥 · `crt-cathode-thomson-1897`

| 项 | 硬锚点 |
|---|---|
| 特征 | **双狭缝准直**、**平行板铝电极**、**磁偏转**、管端 **磷光斑 + 刻度尺**；可配感应线圈 |
| 史实图 | https://upload.wikimedia.org/wikipedia/commons/9/97/Cathode_Rays_Figure_2.jpg |
| | https://upload.wikimedia.org/wikipedia/commons/b/b3/J_J_Thomsons_cathode_ray_tube_with_magnet_coils%2C_1897._%289663807404%29.jpg |
| **禁** | 电视机 CRT 壳、示波器方箱 |

### Bohr · 光谱仪 · 弱出场或不出

| 项 | 硬锚点 |
|---|---|
| 关卡 | **不宜作 1913 写作关卡主操作** |
| 可弱出场 | 氢管 + 直视分光镜，作「已知 Balmer 事实」氛围 |
| **禁** | 把发现巴耳末安到 Bohr；现代 CCD 光谱仪 |


## 4. 史料卡模板（考证库 / `card.md`）

```markdown
# 仪器史实卡 · {名称}

- 年代 / 场所 / 关联人物与实验：
- 教材/课程锚点：（选必三 …）
- 外形硬特征（3–5）：
- 工作原理一句话（教学用）：
- 史实图 URL + license 备注：
- 游戏中允许的简化：
- 明确禁止的现代形：
- 源层级：A 教材 / B 一手 / C 二手 / D 演绎
```

---

## 5. 与实验窗（Infinitas）

- iframe **内** UI 不走本门禁（现代仿真允许）。
- 外框与场所里「看得见的实体仪器」**走本门禁**。
- 若 iframe 封面/入口图画了历史仪器，同样 I1–I8。

---

## 6. 过检流程

1. 史料交卡 → 导演确认特征条  
2. 美术 `_refs` + final + `prop-*-auth-qa.png`  
3. 勾选 `docs/qa/INSTRUMENT_QA_CHECKLIST.md`  
4. 任一条 ✗ = 整包拒收，写明 ID（如 I3）

---

## 7. 姊妹文件

- 索引：`ART_GATES_INDEX.md`  
- 建筑：`BACKGROUND_AUTH_GATE.md`  
- 场景合成：`SCENE_QA_GATE.md`  
