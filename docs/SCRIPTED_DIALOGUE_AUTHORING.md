# Scripted dialogue authoring — `manchester.json`

Status: **Thin authoring guide** · 2026-09-07  
SoT file: `packages/content/src/data/manchester.json`  
Zod (already): `packages/content/src/schema.ts` (`dialogueLineSchema`, `claimMetaSchema`, `sourceTierSchema`)  
Related: [`DEBATE_SCHEME_V3.md`](./DEBATE_SCHEME_V3.md) (scripted mode) · [`DEBATE_CONTENT_SCHEMA.md`](./DEBATE_CONTENT_SCHEMA.md) (debate cards — separate) · UI gate U4 (InterpretationBadge)

---

## 1. Who edits what

| Role | Edits | Does not |
|---|---|---|
| **Content / 史料** | `venues[].dialogue[]` lines, `claim`, citations, interpretation flags | Invent lab numbers past 考证 |
| **Narrative / UX** | Speaker, emotion, pose, beat order | Change `source_tier` without 史料 OK |
| **Engineering** | Zod schema, loader, badge UI | Rewrite historical claims casually |

Chapter1 Manchester venues today: `coupland-lab`, `coupland-lodge` (ids in file).

Scripted mode (`debateMode: scripted`) **plays these lines** — no Retriever / GroundedReply / Judge.

---

## 2. Line shape (essentials)

```json
{
  "id": "mcr-1",
  "speaker": "华生",
  "speakerRole": "companion",
  "charId": "char-watson",
  "emotion": "think",
  "pose": "stand",
  "text": "…",
  "claim": {
    "source_tier": "primary",
    "citation": "H. Geiger & E. Marsden, Proc. R. Soc. A 82 (1909) 495–500",
    "notes": "optional"
  },
  "interpretation": false
}
```

Required by Zod: `id`, `speaker`, `text`, `claim` (with `source_tier` + `citation`).

---

## 3. Claim badges (`source_tier`)

| `source_tier` | Badge intent | Use when |
|---|---|---|
| **`primary`** | 一手 / 论文 | Direct paper or apparatus claim (Geiger–Marsden 1909, Rutherford 1911 wording) |
| **`secondary`** | 二手 | Reliable secondary synthesis; not the primary page |
| **`textbook`** | 教材 | Classroom wording (e.g. 核式结构) — OK in narrator / settlement voice |
| **`interpretation`** | 演绎 | Drama, late metaphor, lodge compression, non-1909 quotation |

Rules of thumb:

- Measurable fractions / thicknesses → prefer **primary** Fact-aligned wording; do not invent.
- Famous “15-inch shell / tissue paper” → **`interpretation`** (late recollection), never as 1909 dark-room fact.
- Era-faithful speech prefers “中心电荷”; narrator may say “核式结构” under **textbook**.

---

## 4. `interpretation` flag (U4)

| `interpretation` | UI |
|---|---|
| `true` | Show **InterpretationBadge** / 「演绎」 |
| `false` / omitted | No 演绎 badge (textbook / primary stay clean) |

Lodge night beats that compress history should set `"interpretation": true` even when `source_tier` is already `interpretation`.

Example ids: `lodge-1`, `lodge-2` (`interpretation: true`); `mcr-4` uses `source_tier: "interpretation"` for the shell metaphor.

---

## 5. Alignment with debate cards

- Scripted claims should **not contradict** FactStore ids in `packages/content/src/debate/facts-*.json`.
- Free/Hard cite those Fact / EraOpinion cards; scripted stays on manchester lines.
- Do **not** put `fills_slots` on manchester lines — that field is EraOpinion-only.

---

## 6. Checklist before merge

- [ ] Zod passes (`dialogueLineSchema`)
- [ ] Every line has `claim.citation`
- [ ] `source_tier` honest; late rhetoric → interpretation
- [ ] `interpretation: true` when U4 badge required
- [ ] `charId` / `pose` / `emotion` match available assets
- [ ] No invented scintillation counts or foil thicknesses
