# 仪器史实卡 · ZnS 闪烁屏读斑（prop-id: `znS-scintillation-screen-1909`）

- **年代 / 场所 / 关联人物与实验**：约 **1909**（Geiger & Marsden 大角「漫反射」报告）／曼彻斯特 Coupland Street 物理实验室／Hans Geiger、Ernest Marsden（操作计数），Ernest Rutherford（指导与理论引用）。用途：观测金属反射体返回的 α 粒子在 **硫化锌屏**上产生的闪烁，用显微镜点数。
- **教材/课程锚点（A）**：人教版选必三 §3 α 粒子散射实验——荧光屏闪烁计数的教学叙事（不替代一手装置细节）。
- **外形硬特征（3–5）**：
  1. **ZnS（硫化锌）荧光屏**：平板/小屏，接闪烁处有可见微光斑（非液晶像素）。
  2. **低倍显微镜**：对准屏面数单位面积闪烁；读斑为肉眼+镜筒，非电子学示波。
  3. **铅板遮挡几何**：屏置于铅挡板之后，使直达 α 打不到屏（与放射源光路配套；源本体见姊妹卡）。
  4. **桌面装配气质**：玻璃/金属支架 + 小显微镜，尺度属实验台道具，非落地机柜。
  5. （可选态）暗室语境下屏面闪烁更醒目；勿画成常亮 LED 面板。
- **工作原理一句话（教学用）**：α 打在 ZnS 上产生可见闪烁，显微镜点数以统计偏转方向上的粒子数。
- **史实图 URL + license 备注**：
  | 文件（建议入 `_refs/`） | URL | license | 用途 |
  |---|---|---|---|
  | `GM-1909-1.gif` | https://upload.wikimedia.org/wikipedia/commons/6/6a/GM-1909-1.gif | Public domain | **B** 论文装置图（屏 S、铅板 P、显微镜语境） |
  | `Geiger-Marsden_diagram.gif` | https://upload.wikimedia.org/wikipedia/commons/e/e4/Geiger-Marsden_diagram.gif | Public domain | **B/C** 装置关系示意 |
  | `Geiger-Marsden_apparatus_CGI_mock-up.png` | https://upload.wikimedia.org/wikipedia/commons/9/93/Geiger-Marsden_apparatus_CGI_mock-up.png | CC BY 3.0 | **C** 三维复原，仅外形可读性；**BY 不进发布包**（I8），可仅审计 |
- **游戏中允许的简化**：
  - 合并支架细节、省略部分夹具螺丝；显微镜可略放大便于点击热区。
  - 闪烁用短促磷光粒子特效（I7），勿做成 UI 进度条。
  - 放射源锥管/云母窗/箔片可放到姊妹 prop `alpha-source-geometry-1909`，本卡以 **屏+显微镜+铅挡后侧** 为识别核。
- **明确禁止的现代形**：
  - LCD／OLED 屏、七段数码管、示波器、半导体探测器阵列、塑料注塑壳电源、USB、霓虹灯管冒充闪烁。
  - 「巨大金箔舞台」而无显微镜读斑；闪烁屏画成电脑显示器。
- **源层级**：
  - **A** 教材：选必三 §3 闪烁观察叙事  
  - **B** 一手：Geiger & Marsden, “On a Diffuse Reflection of the α-Particles,” *Proc. R. Soc. A* **82** (1909) 495–500（屏 S、铅板 P、低倍显微镜、ZnS；考证库已有 PDF）  
  - **C** CGI/教科书示意图（可审计，非发布母版）

## 与 `alpha-source-geometry-1909` 的关系（预告）

| | `znS-scintillation-screen-1909`（本卡） | `alpha-source-geometry-1909`（建议**分卡**） |
|---|---|---|
| 识别核 | ZnS 屏 + 显微镜 + 铅挡后侧 | 锥形玻璃源管、云母窗、反射箔几何、与屏的距离关系 |
| 门禁清单 | INSTRUMENT_AUTH_GATE §3 已单列 | 已单列 P0 |
| 建议 | **分卡**，同场景组装；本卡先解锁 lab 读斑皮 | 另出卡后再画源管/箔，避免一张卡绑死两套轮廓 |

一手装置是「源—箔—铅挡—ZnS—显微镜」一条光路；美术资产按两个 prop-id 拆，便于独立层与热区。
