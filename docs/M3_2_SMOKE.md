# M3.2 Smoke — Experiment ↔ Hard coupling (Coupland)

Status: **M3.2** · 2026-09-17  
Related: [`M3_2_COUPLING.md`](./M3_2_COUPLING.md) · [`LABEMBED_POSTMESSAGE.md`](./LABEMBED_POSTMESSAGE.md) · [`M3_1_SMOKE.md`](./M3_1_SMOKE.md)

Director path: **no console hacks**. Local key only in gitignored `.env`. Never commit secrets. Offline: `DEBATE_BFF_MOCK=1`.

## Prerequisites

```bash
cp .env.example .env   # optional DEEPSEEK_API_KEY, or DEBATE_BFF_MOCK=1
pnpm install
pnpm --filter @physics-chronicle/web dev
pnpm --filter @physics-chronicle/debate test   # includes M3.2 contract + C11 gate
```

## Contract table (readout → slot)

| Contract id | When valid | Effect |
|-------------|------------|--------|
| `readout-large-angle` | `large_angle_count > 0` **or** `angle_deg ≥ 90` (CriticPolicy default) | Allow labEmbed fill for `slot-large-angle-exists` |
| `readout-forward-majority` | `fraction_forward ≥ 0.5` (default `forwardMajorityMin`) | Allow labEmbed fill for `slot-forward-majority` |
| `readout-weak` | Message received but neither threshold | Weak chip only — **no** auto-fill |

## Checklist

1. **Strong readout → fills** — Open `/?mode=labEmbed&venue=lab-coupland`. Click **模拟读数（QA）**. Close lab. Enter Hard (`&debate=hard` after unlock). Hand shows fillable lab card; large-angle + forward-majority can be filled from labEmbed without inventing numbers.
2. **Weak readout → chip only** — In labEmbed click **模拟弱读数（chip）**. Hand shows “弱读数 / 未达阈值” chip; Hard does **not** auto-fill labEmbed slots.
3. **Persist / restore** — After a strong or weak readout, leave venue and re-enter. Pending readout restores from progress (`debateSession.durable.byVenue[lab-coupland].lastLabReadout`).
4. **C11 bench gate** — In Hard, fill `slot-charge-mass-concentrated` **without** large-angle or forward-majority (Fact or lab). Challenge **C11** surfaces; Judge stays `continue` (not persuaded) until you cite `fact-gm1909-diffuse-reflection` / `fact-gm1909-forward-majority` **or** run a valid labEmbed fill on either observation slot.
5. **Fact-only still wins** — Skip labEmbed entirely; fill observation via Fact cards + other slots to N=4 with Critic passes → persuaded (bench gate satisfied by Fact).
6. **Soft choices (runtime stub)** — End of lab main dialogue → `choice-shell-metaphor`; afterLab lane end → `choice-model-push`; lodge end → `choice-return-bench` (Yes deep-links lab). Soft tags only; Hard not soft-locked. EN copy lives in `manchester-choices.json`.

## Leftovers (not this architecture PR)

- Further EN polish / ZH for choice consequence beats (文案 PR OK)
- Bohr chapter
- M3.3 zh-Hans Coupland dialogue rewrite
