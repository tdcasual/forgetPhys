# 背景建筑史实门禁（Background Auth Gate）

Status: **Mandatory · 2026-09-06**  
与 `SCENE_QA_GATE.md` 并列：人物场景合成过关不够，**场所 bg 还必须对上「年代 × 地点 × 人物」**。

---

## 0. 原则

每个 Venue bg 必须能回答：

> 「这是不是 **那一年、那座城、那个人实际工作/居住类型** 的建筑与室内？」

允许 stylize，**不允许**时代错乱道具（现代显示器、北美郊区窗、现代办公吊顶）。

流水线（与立绘同构）：
```
史实照片/图纸锚点 → 建筑特征 checklist → 生成/改装 bg → 并排对照史实图 QA → 入库
```

---

## 1. 第一章场所锚点（史料已锁 · 2026-09-06）

来源：史料考证 `ch1-场所建筑史实卡.md`（已入考证库）。

### V1 · 曼城 Coupland Street 物理楼 · ~1909（卢瑟福）

| 项 | 硬锚点 |
|---|---|
| 建筑 | 今 Rutherford Building；Beaumont / Schuster，约 1900 启用 |
| 外立面 | 砖石 + **石门廊纹章** |
| 室内 | **釉面砖 lining**：腰线橙褐 + 上奶油色；走廊 **terrazzo** + **蓝釉砖墙裙** |
| 卢瑟福私室 | 地面层西北角一带私人实验室 |
| 公有域外立面照 | https://upload.wikimedia.org/wikipedia/commons/0/07/Front_Entrance_of_the_Rutherford_building.jpg |
| | https://upload.wikimedia.org/wikipedia/commons/b/b7/Rutherford_Building.jpg |
| 装置/人物环境 | https://upload.wikimedia.org/wikipedia/commons/3/37/Geiger-Rutherford.jpg（注意构图用途） |
| 禁 | 现代 LCD、全玻璃幕、北美教室白板 |

**当前 `lab-coupland.png`**：红砖方向对；须补 **釉面砖腰线（橙褐+奶油）**、走廊感 **terrazzo / 蓝釉砖裙**，勿做成普通木板房。

### V2 · 剑桥 Cavendish · ~1897（汤姆孙）

| 项 | 硬锚点 |
|---|---|
| 建筑 | **Free School Lane** 窄巷旧实验室（1874），非 West Cambridge 新楼 |
| 材料 | 红砖 / 石材学院楼 |
| 内景命题 | 阴极射线管 + 线圈/磁铁 + **磷光屏读斑**，偏暗 |
| 外立面照 | https://upload.wikimedia.org/wikipedia/commons/5/5d/Cavendish_Laboratory_-_Free_School_Lane_Cambridge_CB2_3QA.jpg |
| | https://upload.wikimedia.org/wikipedia/commons/1/12/Cavendish_Laboratory_1874-1974.jpg |
| | https://upload.wikimedia.org/wikipedia/commons/6/6a/Cavendish_Laboratory_door.jpg |
| 注意 | CUDL 装置照需核授权后再入发布包；可先作 `_refs/` |

### V3 · 哥本哈根 · 1912–13（玻尔）

| 项 | 硬锚点 |
|---|---|
| **排除** | 嘉士伯荣誉宅（1932 后） |
| 可核住址 | 婚前长期 **Bredgade 62**（教授宅）；母亲通信 **Stockholmsgade 37**（家族圈） |
| 夫妻独立门牌 | **待考** — 场景用中产书房 / 口述誊写，**勿伪造门牌旅游点** |
| 参照 | NBA Physical Tourist PDF |
| 室内 | 北欧中产书房气质，非英式红砖暗室 |

### V4 · 曼城租屋 · 1909–11

| 项 | 要求 |
|---|---|
| 类型 | 工业城市职员/助教联排租屋：窄窗、砖街、煤气灯、简陋床桌 |
| 禁 | 豪华旅馆、现代落地窗 |

## 2. 背景 QA 条目（全部必过）

| ID | 标准 |
|---|---|
| B1 | 有 `_refs/` 史实照片 ≥1 张（可公开或仅审计用），并写清年代地点 |
| B2 | 外立面/室内材料与锚点一致（砖种、木作、窗型） |
| B3 | 灯具与年代匹配（煤气灯 / 早期白炽） |
| B4 | 无时代错误道具（现代屏、塑料椅、LED） |
| B5 | 与人物比例同用 SCENE_QA 尺度（地平、家具高度） |
| B6 | provenance：license + URL；公有域/CC 可入包，仅审计用版权图不得进发布包 |

---

## 3. 开源 / 可复用资源（有，但不能「一包搞定真实曼城楼」）

### A. 史实参考（优先）
- **Wikimedia Commons**：建筑外立面、部分实验室历史照（逐张查 license）  
- **University of Manchester Library / Luna**：物理系历史照片  
- **Wellcome Collection**：部分曼大物理群像（注意条款）  
- **Niels Bohr Archive / NBI 历史地点页**：哥本哈根建筑说明（Bredgade 62 等）

这些是「像不像」的金标准；很多 **不能直接当游戏贴图发布**，只作 `_refs/` 审计。

### B. CC0 / 开源游戏资产（搭积木，需改装）
| 资源 | License | 用途 |
|---|---|---|
| [Kenney Building Kit](https://opengameart.org/content/building-kit) | CC0 | 墙窗门模块（需贴成红砖学院风） |
| [Kenney 已有 lab/venue kit](https://kenney.nl) | CC0 | 道具拼装 |
| [Lab Assets CC0](https://opengameart.org/content/lab-assets) | CC0 | 玻璃器皿/台面（偏现代 lowpoly，慎用） |
| OpenGameArt「Victorian desk」等 | 多为 CC0/CC-BY | 家具 |
| Poly Haven / ambientCG 材质 | CC0 | 砖、木、沥青街（贴到正确比例模型上） |

**结论**：有开源积木与材质，**没有**「曼城 Coupland 1909 实验室现成一键包」。正确做法是：**史实照片审计 + CC0 材质/模块拼装或 AI 按锚点生成**，再过 B1–B6。

### C. 地图层
- Natural Earth（已在用）  
- 年代城市肌理仍靠插画约束，勿用当代卫星当最终皮

---

## 4. 交付目录

```
assets/bg/{venue}/
  final.png
  _refs/          # 史实对照（可 git-lfs 或不发布）
  checklist.md    # B1–B6
  provenance.md
```

---

## 5. 与当前资产

| 资产 | 状态 |
|---|---|
| `lab-coupland.png` | 方向接近曼城红砖暗室；继续压史实内景，禁现代感回潮 |
| `lodge-night.png` | 工业城租屋方向对；核对联排窗型与煤气灯 |
| `city-manchester.png` | 需对照 Coupland 街红砖联排/学院楼，减「奇幻脏」 |
| 剑桥/哥本哈根 bg | 未做；先等史料建筑卡 |

