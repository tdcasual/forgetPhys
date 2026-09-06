# 场景合成强制验收门禁（Venue 2D）

Status: **Mandatory · 2026-09-06**  
适用范围：所有场所静帧（实验室 / 租屋 / 日后书房沙龙）；美术交稿 + 实现合稿后，**导演过检，不达标拒收重做**。  
对照问题来源：`shots/41` / `42` 专业审计。

---

## 0. 总原则

静帧必须让未玩过的人一眼读出：

> 「两个真实比例的人，站/坐在同一间有年代感的房间里说话。」

做不到 = **未过关**，不得标 P0 done、不得进下一城。

---

## 1. 门禁条目（全部必过）

### G1 · Framing 统一（裁切语言）

| ID | 标准 | 拒收例子 |
|---|---|---|
| G1.1 | 同屏角色必须同一 framing：**同为腰上半身** *或* **同为膝上/全身** | 左半身大特写 + 右全身小人 |
| G1.2 | 华生与科学家资产目录声明 `framing: bust|knee|full`，混用禁止入库 | 科学家 bust、华生 full |
| G1.3 | 对话主镜头默认 **bust（腰上）**；需要全身仅限过场/独自行走 | 主对话用全身站椅面 |

**过检法**：截图上画两条水平线（头顶线、裁切底边），两角色底边高度差 ≤ 画面高度的 8%。

### G2 · 落地与接触（Contact）

| ID | 标准 | 拒收例子 |
|---|---|---|
| G2.1 | 站姿：脚底咬地板地平，禁止浮空、禁止站在椅面/桌面 | 华生站在椅座上 |
| G2.2 | 坐姿：臀/膝对齐场景椅面；**角色层禁止自带椅子**；bg 椅被占用时不得再显「空椅错位」 | 悬空坐；双椅 |
| G2.3 | 桌后人物必须被桌沿遮挡（desk occluder 层），读得出前后关系 | 人像贴在桌前或桌后无遮挡 |
| G2.4 | 华生 sit 必须落在可用椅上，或改为 bust 坐姿构图不暴露无椅腿 | 坐姿浮在灯前 |

**过检法**：开启开发叠层 `?debug=contact`（实现必做）：地平线、椅面线、脚/臀锚点十字；锚点落在线上 ±4px（1080p）。

### G3 · 人环比例（Scale）

| ID | 标准 | 拒收例子 |
|---|---|---|
| G3.1 | 同 framing 下，华生身高 = 科学家的 **0.85–0.95** | 玩偶感 <0.7 或高过科学家 |
| G3.2 | 角色肩宽与门框/桌面进深可读；半身 bust 肩宽约占画面宽度 18–28%（单人） | 脸占半屏而桌面玩具化 |
| G3.3 | 禁止用 `max-width` 把全身图压成桌宠 | 全身被压成椅上小人 |

**过检法**：debug 比例尺；双人头顶差符合 0.85–0.95。

### G4 · 光影吃景（Lighting）

| ID | 标准 | 拒收例子 |
|---|---|---|
| G4.1 | 立绘必须吃场景 key light（实验室左侧暖灯 / 租屋油灯侧） | 棚拍正面光贴纸 |
| G4.2 | 可用：按场景烘的变体 **或** 统一色级/暗角 LUT 压进底片 | 无处理原图直贴 |
| G4.3 | 禁止角色自带强描边白边、发光外轮廓 | 剪贴感描边 |

**过检法**：侧光场景中，角色亮面朝向与灯方向一致；直方图不过曝成贴纸。

### G5 · 年代与道具（Period）

| ID | 标准 | 拒收例子 |
|---|---|---|
| G5.1 | 1909 实验室荧光屏不得像现代液晶显示器；可用磷光斑点/暗框 | 现代 monitor UI |
| G5.2 | bg 可坐可靠家具必须被占用或明确空置（构图不诱导踩踏） | 空椅成错误站台 |
| G5.3 | 玩家可见文案禁止开发字样（`P0`、`TODO`、`debug`） | 对话出现「· P0」 |

### G6 · 动作与视线（Acting）

| ID | 标准 | 拒收例子 |
|---|---|---|
| G6.1 | 双人戏至少一方与实验/道具有视线或手势联系 | 两人只对镜头站桩 |
| G6.2 | `point-screen` 食指落点应对准屏/仪器（允许 ±5% 画面） | 指天花板 |
| G6.3 | 华生默认职责动作：记录/追问（本/笔/看向说话者） | 无互动 idle |

### G7 · 名牌与 UI

| ID | 标准 | 拒收例子 |
|---|---|---|
| G7.1 | 名牌仅胸口小胶囊，面积 ≪ 脸面积；不占整行 | 脚下大黑条 |
| G7.2 | 名牌不挡五官；字号约 11–12px @1080p | 名牌盖住眼睛 |
| G7.3 | 主操作唯一突出（继续 / 去实验台择一主视觉） | 两颗同级大按钮抢戏 |

### G8 · 角色一致性（复用 CHAR_CONSISTENCY）

| ID | 标准 | 拒收例子 |
|---|---|---|
| G8.1 | 每人 `_canon/face` + identity 逐字；姿态并排 QA 过检 | 同人发色须色漂 |
| G8.2 | 华生换装只许改衣服，脸锁 canon | 换装换脸 |
| G8.3 | 科学家与华生同一 Style 中句 | 照片抠图 vs 薄平插画 |

---

## 2. 过检流程（强制）

1. 美术交：`_canon/qa-face-row.png` + 场景合成预览（或实现截图）  
2. 实现开：`?debug=contact` 截图一张  
3. 导演按 G1–G8 勾选；**任一条 ✗ = 整包拒收**  
4. 拒收写明条目 ID（如 G2.1）；通过后标记 `SCENE_QA: PASS` 于 PR/交接

### 静帧最低交付（每场所）

- `shots/qa/{venue}-clean.png`（无 debug）  
- `shots/qa/{venue}-contact.png`（有锚点）  
- 勾选表：`docs/qa/SCENE_QA_CHECKLIST.md` 复制填

---

## 3. P0 立刻达标包（本周必须）

针对曼城实验室 + 租屋：

1. **资产**：卢瑟福 / 华生 **统一 bust** 对话套（idle/speak/think）；全身仅备用  
2. **实现**：desk occluder；坐姿锚点对齐 bg 椅；禁站椅面逻辑  
3. **光**：两场景各一版「吃灯光」色罩或重烘  
4. **文案**：去掉一切 `P0` 玩家可见字样  
5. **绿屏**：改成暗室磷光斑样式（非现代显示器）

未完成前：**不得宣称场景 P0 完成**。

---

## 4. 与既有文档关系

- 本文件 **高于** 临时审美偏好  
- 脸一致性细节仍服从 `CHAR_CONSISTENCY_CONSTRAINTS.md`  
- 华生换装服从 `COMPANION_WATSON_NAMEPLATE.md`  


---

## 5. 修订补丁（2026-09-06 晚 · 强制）

详见 `SPRITE_PIPELINE_REVISED.md`。

### G2 修订
- **允许** sit 资产烘焙椅子（方案 A）；此时 bg **不得**再放同位置空椅。  
- **允许** 对话布局改为左右分列 bust（方案 B），人物缩小分居两侧。  
- **禁止** 无椅悬空坐 + 长期靠 CSS 硬对齐作为最终态。

### G7 修订
- **主名字**：对话框 namebox（Ren'Py 式），非大块胸口浮字。  
- **胸微标**（可选）：≤ 立绘宽 18%，仿胸牌，锚点=角色不透明 bbox 胸口；当前 CSS `top:55%` 浮条 **判定 FAIL**。

### 布局修订
- 推荐默认：**左右槽 + 统一 bust**；中间留给实验台/灯光。


## 6. 姊妹门禁
见 [`ART_GATES_INDEX.md`](./ART_GATES_INDEX.md)（含 UI / 地图 / 华生换装）。

---

## 7. Debug overlay · `?debug=contact`

Venue2D (`apps/web/src/modes/venue2d/Venue2D.tsx`) supports a contact QA overlay:

```
http://localhost:5173/?debug=contact
```

(Also works with any route that mounts Venue2D; append `&debug=contact`.)

| Guide | Meaning |
|---|---|
| **Horizon** (cyan dashed) | Approx upper-third vanishing / room horizon |
| **Seat / contact** (gold dashed) | Shared L/R bust bottom contact line (`--contact-line`) |
| **Desk top** | Desk occluder top (config / `?desk=NN`) |
| **Foot crosshairs** (green) | Portrait-wrap bottoms |
| **Hip crosshairs** (pink) | ~55% height of each portrait wrap |

Use with SCENE_QA G1 (aligned bottoms) and G2 (no float / wrong chair scale). Overlay is CSS/SVG only — no gameplay effect.

