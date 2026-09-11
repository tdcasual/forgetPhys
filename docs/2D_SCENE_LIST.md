# 第一章 2D 场景清单（P0）

> 结构：80 Days（地图→城市页→按钮→过场）  
> 皮肤：Pentiment（纸质图志 / 对话框 / 演绎角标）  
> 实验：iframe 嵌 Infinitas（外壳羊皮纸窗；仿真本身不改画风）  
> 角色：科学家 **漫画立绘** + 伴灵立绘（非 3D VRM）

实验宿主：
- `https://x.infinitas.fun/`
- `https://z.infinitas.fun/`
（复杂实验由用户在站内追加；游戏只换 URL。）

---

## A. 世界地图 WorldMap

| ID | 场景 | 玩家动作 | 画面要点 | 出口 |
|---|---|---|---|---|
| WM-01 | 命运地图开场 | 浏览欧洲 | 插画欧洲；曼城金点脉冲；剑桥/哥本哈根墨灰 | — |
| WM-02 | 悬停曼城 | hover | 浮卡「1909–1911 · Coupland Street · α 散射」 | — |
| WM-03 | 选定曼城 | click | 金点确认；短过渡到图志扉页 | → PL-01 |

## B. 章节图志 ChroniclePlate

| ID | 场景 | 玩家动作 | 画面要点 | 出口 |
|---|---|---|---|---|
| PL-01 | 《窥见原子》扉页 | 阅读 | 木刻/羊皮纸；金箔台+α纹；页边「人教选必三 §4」 | Continue |
| PL-02 | 进入场所确认 | 点「进入曼彻斯特」 | 册页掀角动效（可先静态） | → CY-01 |

## C. 城市页 CityPage（80 Days 结构）

| ID | 场景 | 玩家动作 | 画面要点 | 出口 |
|---|---|---|---|---|
| CY-01 | 曼城 Coupland | 选地点 | 煤烟天际线；街牌；按钮：实验室 / 租屋 / 街巷(后做) | → VN-lab / VN-lodge |
| CY-02 | 剑桥（锁） | 查看 | 同版式全灰；「完成散射后方可前往」 | 回地图 |
| CY-03 | 哥本哈根（锁） | 查看 | 同版式；玻尔钩子文案 | 回地图 |

## D. 场所 Venue + 对话

| ID | 场景 | 角色立绘 | 要点 | 出口 |
|---|---|---|---|---|
| VN-lab-01 | 实验室日·开场 | Rutherford + 伴灵 | 2D 实验室背景；荧光屏；派蒙式吐槽 | 选项 |
| VN-lab-02 | 去实验台 | — | 打开 Infinitas 羊皮纸窗 | → LAB-01 |
| VN-lab-03 | 实验结果回灌 | Rutherford | 对话写入本次大角/计数（来自 iframe postMessage 或占位） | 续谈 |
| VN-lodge-01 | 租屋夜·复盘 | Rutherford / Geiger stub + 伴灵 | 煤气灯；枣糕 vs 核式；演绎角标+引用抽屉 | 回城市页 |
| VN-cam-01 | 剑桥阴极射线（P1） | Thomson | 锁至 P1 | — |
| VN-cph-01 | 哥本哈根书房（P1） | Bohr | 锁至 P1 | — |

## E. 实验窗 LabEmbed

| ID | 场景 | URL | 外壳 |
|---|---|---|---|
| LAB-01 | α 散射台 | 优先 `https://x.infinitas.fun/`（若路径需细分由内容 JSON 配） | 标题「α 粒子散射 · 实验台」；关闭回对话 |
| LAB-02 | 备用/复杂实验 | `https://z.infinitas.fun/` | 同外壳，只换 src |

## F. 过场 Travel

| ID | 场景 | 要点 |
|---|---|---|
| TR-01 | 曼城→哥本哈根 | 红线+日期 1913；旁注玻尔 |
| TR-02 | Ch5 核预告邮票条 | 质子/中子剪影；「第五章预告」 |

---

## 角色立绘需求（漫画形象）

| id | 角色 | P0 | 表情最少集 | 备注 |
|---|---|---|---|---|
| char-rutherford | 卢瑟福 | **必须** | idle / speak / surprise | 1909 曼城实验室主轴 |
| char-companion | 科学伴灵 | **必须** | idle / tease / think | 派蒙气质，原创，禁原神资产 |
| char-thomson | 汤姆孙 | P0 stub / P1 | idle / speak | 剑桥关 |
| char-bohr | 玻尔 | P0 stub / P1 | idle / speak | 哥本哈根关 |
| char-geiger | 盖革 | P0 stub | idle | 租屋复盘可出 |

路径约定：`assets/chars/{id}/{emotion}.png`（透明底立绘）  
背景约定：`assets/bg/map-europe.png` · `bg/city-manchester.png` · `bg/lab-coupland.png` · `bg/lodge-night.png` · `bg/plate-glimpse-atom.png`

---

## P0 可玩切片（本迭代要实现）

1. WM-01 → PL-01 → CY-01 → VN-lab-01 → LAB-01（Infinitas）→ 关闭回对话  
2. 立绘至少 Rutherford + Companion（可用占位漫画风，后替换精修）  
3. 不再依赖 Three.js 命运地图作为主路径（可保留旧码但默认进 2D）

## Dialogue beat targets (2026-09-11)

Coupland scripted beats: see `MANCHESTER_DIALOGUE_TARGETS.md` (lab 6–8 + return 3–4 + lodge 4–6).
