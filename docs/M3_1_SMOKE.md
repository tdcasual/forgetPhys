# M3.1 Smoke — Free / Hard (Coupland)

Status: **M3.1** · 2026-09-17  
Related: [`MANCHESTER_NEXT_PHASE.md`](./MANCHESTER_NEXT_PHASE.md) §M3.1 · [`STUDENT_LLM_QUOTA.md`](./STUDENT_LLM_QUOTA.md) · [`DEBATE_BFF_SSE.md`](./DEBATE_BFF_SSE.md)

Director path: **no console hacks**. Local key only in gitignored `.env` (`DEEPSEEK_API_KEY=`). Never commit real keys. Offline: `DEBATE_BFF_MOCK=1`.

## Prerequisites

```bash
cp .env.example .env   # fill DEEPSEEK_API_KEY locally, or set DEBATE_BFF_MOCK=1
pnpm install
pnpm --filter @physics-chronicle/web dev
```

## URLs / modes

| Step | URL / action |
|------|----------------|
| Deep-link lab venue | `/?mode=venue&venue=lab-coupland` |
| Free debate | `/?mode=venue&venue=lab-coupland&debate=free` |
| Hard debate | `/?mode=venue&venue=lab-coupland&debate=hard` |
| Lab embed | Open lab from venue (or `/?mode=labEmbed&venue=lab-coupland`) |
| Close lab → return beats | Close lab chrome → jumps to `mcr-ret-*` when copy present |

QA unlock (optional screenshots): deep-link with debate still respects progress unlock after one labEmbed **visit** (mount), not only postMessage.

## Checklist

1. **Unlock** — Open labEmbed once (visit). Return to venue. Free + Hard controls unlocked (no console).
2. **Free** — Enter Free. Submit one short turn. Overlay shows GroundedReply **text** + **cite** (Fact id). SSE `final` arrives (or mock). Errors (missing key / 401 / timeout / budget) show in-overlay alert — never blank stub.
3. **Hard** — Enter Hard. Fill slots (facts and/or lab readout via “模拟读数” / postMessage) until **persuaded** (N/M + critic pass). Turn meter uses Hard cap (12).
4. **Quota** — BFF enforces free≤20 / hard≤12 / scripted=0 LLM turns per DebateSession. Critic retries (K≤2) reuse `playerTurnId` and do **not** burn extra turns. Over-limit → `budget_exhausted` player-readable copy; degrade offline/scripted — never invent cites.
5. **Secrets** — `pnpm --filter @physics-chronicle/web test` keeps `no-client-secrets` green.

## Leftovers (not M3.1)

- M3.2 lab readout → Hard slot coupling contracts
- M3.3 zh-Hans Coupland dialogue rewrite
- M3.4 art QA / M3.5 pedagogy close
- Bohr chapter
