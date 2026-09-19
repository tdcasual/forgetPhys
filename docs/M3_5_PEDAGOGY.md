# M3.5 — Manchester pedagogy close + Bohr teaser

Status: **Locked · 2026-09-19**  
Exit of Coupland M3 before Chapter 1-4 (Bohr) design/implementation.

## Learning checklist (player-facing)

After Coupland lab + lodge (+ Hard optional), the player should be able to state:

1. Most α paths go nearly straight → atom is mostly empty space (working picture).
2. Rare large-angle / backscatter → charge (and mass) highly concentrated in a tiny region.
3. Plum-pudding / diffuse positive + compound scattering fails those large angles.
4. Period lab speech prefers **central charge**; textbook **nuclear model / 核式结构** is later teaching language.

## Exit quiz (3 questions)

Content: `packages/content/src/data/manchester-exit-quiz.json`  
Optional gate before city shows Bohr teaser as unlocked-for-preview / still locked chapter.

## City teaser

On Manchester city page after quiz pass (or after lodge complete if quiz skipped in soft mode):

- Show locked card: **Next: Copenhagen · Bohr 1912–13** (EN/ZH)
- Must **not** open Bohr venues yet — lock only + short blurb
- Soft mode: show teaser after lodge complete even if quiz deferred

## Owners

- 游戏设计: checklist + quiz JSON + this doc (this commit / PR)
- 游戏架构: city UI teaser + optional quiz overlay wire
- 文案: bilingual teaser blurb if not already in JSON

## Exit criteria

- [x] Checklist doc shipped
- [x] 3-question quiz in content package
- [x] City shows Bohr locked teaser
- [x] No Bohr venue implementation in this step
