# M3.2 — Experiment ↔ story ↔ Hard coupling

Status: **Locked for implementation · 2026-09-17**  
Chapter: Coupland / Manchester only  
Related: `MANCHESTER_NEXT_PHASE.md` · `LABEMBED_POSTMESSAGE.md` · `HARD_EVIDENCE_SLOTS_ALPHA.md`

## Goal

Skipping the α bench must leave Free/Hard **weaker**; doing it must change available fills / Critic pressure.

## A. Lab readout contracts (2–3)

Whitelist kind remains `alpha_scatter_summary`. Map to Hard slots that already set `accepts_lab_embed: true`:

| Contract id | When valid | Effect |
|-------------|------------|--------|
| `readout-large-angle` | `large_angle_count > 0` **or** `angle_deg ≥ threshold` (~90°) | Unlock / allow labEmbed fill for `slot-large-angle-exists`; Critic may demand this cite once |
| `readout-forward-majority` | `fraction_forward ≥ forwardMajorityMin` (existing default) | Unlock / allow labEmbed fill for `slot-forward-majority` |
| `readout-weak` (optional 3rd) | message received but neither threshold met | Show “unverified / weak readout” chip; **no** auto-fill; Critic may still ask for a bench cite |

**Product rules:**
1. Without any valid labEmbed this session, Hard may still win on Fact cards alone — but **at least one scripted Critic challenge** in Coupland Hard must refuse pass unless a labEmbed-backed cite (or Fact equivalent) is present for large-angle **or** forward-majority.
2. Persist last valid readout on progress for the venue (see `PROGRESS_SAVE_SCHEMA` — extend thinly if needed).
3. Mock / “模拟读数” still OK for QA; mark `source: lab_embed` vs simulated in fill metadata if not already.

## B. Scripted player choices (2–3, EN SoT)

Add optional choice beats in `coupland-lab` (or afterLab) — soft consequences only:

| Choice id | Prompt (EN gist) | Soft effect |
|-----------|------------------|-------------|
| `choice-model-push` | Prefer plum-pudding vs central-charge framing | Wrong push → Watson/Rutherford one-line pushback; does not soft-lock Hard |
| `choice-shell-metaphor` | Treat fifteen-inch shell as lab fact vs late story | Accept-as-fact → InterpretationBadge warning / lodge tag; reject → cleaner lexicon |
| `choice-return-bench` | After lodge, return to foil thickness? | Yes → deep-link lab; No → stay city |

Copy: 文案写 EN options + consequences lines; schema needs `choices[]` or reuse existing branch fields if any.

## C. Critic requires bench once

Coupland Hard: add / enable one Critic template that fires when board lacks labEmbed fill on large-angle **and** forward-majority while player claims concentration — must be answerable by running labEmbed or citing Fact cards that already encode the observation.

## Exit criteria

- [ ] Valid readout can fill the two `accepts_lab_embed` slots without inventing numbers
- [ ] One Critic path requires bench-or-Fact observation cite
- [ ] ≥2 scripted choices live in EN
- [ ] Smoke note appended to `M3_1_SMOKE.md` or new `M3_2_SMOKE.md`
- [ ] No Bohr / no ZH in this PR unless trivial hooks

## Owners

- **游戏架构:** contracts, persist, Critic gate, choice runtime
- **文案叙事:** EN choice lines + consequence beats (separate PR OK)
