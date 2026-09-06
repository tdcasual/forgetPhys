# Rutherford canon checklist

## 史料锚点（须 ≥2/3）
1. 1908 Nobel 肖像：浓深棕海象须、光下巴、宽额、深棕发鬓角少灰 — PASS（face.png）
2. ~1910 曼彻斯特：三件套深色西装、高领、表链 — PASS
3. 年龄感约 38–40，非勋爵白发老年、非美型无胡少年 — PASS（v3 并排）

## 禁区
- 全白发 / 全灰须 / 烟斗雪茄烟
- 姿态 PNG 内嵌完整桌椅
- 用上一张姿态当下一张 Face 参考
- 照片抠图风格（须与微光同 Style block）

## QA 入库门（2026-09-06 v3）
- [x] 脸并排 vs face.png：发色/须色/年龄一致（见 qa-face-row.png）
- [x] checklist ≥2/3
- [x] 无家具嵌入
- [x] 无烟斗
- [!] 本机无 GPU：未跑 InstantID；文生+canon 双参考。若导演仍见漂，需上 FaceID 机

## 交付路径
- `_canon/{face,sheet,identity,checklist,qa-face-row}.png|.txt|.md`
- `sit-chair__idle.png` / `sit-chair__speak.png`
- `lean-bench__idle.png`
- `point-screen__speak.png`
- 旧漂脸版：`_rejected_face_drift/`
