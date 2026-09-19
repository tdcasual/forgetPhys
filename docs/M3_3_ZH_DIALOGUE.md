# M3.3 — Coupland zh-Hans dialogue (rewrite, not calque)

Status: **Locked · 2026-09-19**  
Locale SoT: EN remains authoritative for historical register; ZH is a **parallel rewrite**.

## Scope

1. All Coupland scripted beats → `text: { "en": "...", "zh-Hans": "..." }`
   - lab `dialogue` (7)
   - `dialogueAfterLab` (4)
   - lodge `dialogue` (5)
2. Soft choices in `manchester-choices.json`: prompts, option labels, consequence lines → bilingual same shape.
3. ZH VoiceCards: Watson / Rutherford / Narrator — 口语/讲演中文另建，禁止英译腔。

## Hard locks

- No Geiger speaker
- Period: 漫反射、中心电荷；旁白可用教材「核式结构」
- Shell / 炮弹薄纸 = 事后回忆（interpretation）
- forgetphys-ai on every ZH line
- Do **not** calque EN sentence rhythm into Chinese

## Delivered (copy)

- `packages/content/src/data/manchester.json` — 16 beats bilingual
- `packages/content/src/data/manchester-choices.json` — 3 choices bilingual
- ZH VoiceCards: `voice-watson.zh-Hans.md`, `voice-rutherford-1909.zh-Hans.md`, `voice-narrator.zh-Hans.md`

## Exit

- Locale chip EN↔中文 shows Chinese body for all 16 beats + 3 choices
- PR via `gh`; director review before merge
