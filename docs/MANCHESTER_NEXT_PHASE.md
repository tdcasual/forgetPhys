# Manchester next phase plan (Coupland only)

Status: **In progress · M3.1 started 2026-09-17**  
Scope: **当前曼城** — do not start Bohr (1-4) until M3 exit criteria below.  
SoT pointer: product still `ch1-manchester` / Coupland lab + lodge.

## Where we are (done)

| Layer | State |
|-------|--------|
| Shell | worldMap → plate → city → lab / lodge → labEmbed |
| Scripted EN | 16 beats (lab 7 + afterLab 4 + lodge 5) |
| Debate P1a/P1b | Rules + dossier UI + era Critic |
| P2 LLM | DeepSeek BFF SSE merged (`8b8b39e`) |
| i18n | `en` default; `zh-Hans` speaker/UI; **ZH dialogue still falls back to EN** |
| Art | Gates + Coupland assets; FaceID / polish still uneven |

## Goals for this phase

1. Make Manchester **feel like a game**, not only a slide deck + chat.
2. Make Free/Hard **reliably playable** with DeepSeek (cite-or-retry, unlock, quotas).
3. **Bite** experiment numbers into narrative + Hard slots.
4. Ship a **Chinese dialogue track** (rewrite, not calque) so locale switch is real for Coupland.
5. Leave Manchester with a clear **exit to Bohr** (content hook only — implementation is next chapter).

## Phase M3 — Coupland “playable chapter”

### M3.1 Playtest & harden Free/Hard (1–2 weeks equivalent)

**Owner:** 游戏架构 (+ 游戏设计验收)  
**Do:**
- Local smoke: unlock Free/Hard after first labEmbed; one Free turn + one Hard fill path with live DeepSeek.
- Surface errors in-UI (no silent stub); respect `DEBATE_BFF_MOCK` for offline.
- Lock student quota numbers (draft in `STUDENT_LLM_QUOTA.md` → Accepted caps).
- Fix known small debts: `scientist` role → Rutherford-only fallback; ensure GroundedReply never invents numbers.

**Exit:** Director can finish lab → Free reply cites a Fact → Hard reaches persuaded without console hacks.

### M3.2 Experiment ↔ story ↔ Hard coupling (core gameplay)

**Owner:** 游戏设计 + 架构 + 文案  
**Do:**
- Define 2–3 **lab readout contracts** that unlock or pre-fill Hard slots (e.g. large-angle seen / forward majority).
- Scripted path: 2–3 **player choices** with soft consequences (wrong model pushback, shell-metaphor accept/reject) — still EN SoT.
- Hard: at least one Critic challenge that **requires** a labEmbed-backed cite.
- Optional short “return to foil thickness” loop from lodge → lab (already hinted in lodge copy).

**Exit:** Skipping the experiment leaves Free/Hard clearly weaker; doing the experiment changes available cards/slots.

### M3.3 Coupland zh-Hans dialogue (parallel OK)

**Owner:** 文案叙事 (+ 史料考证 VoiceSource ZH notes if needed)  
**Do:**
- Rewrite all 16 beats (+ any new choice lines) as `{ en, zh-Hans }` — **另写**, ban translationese.
- VoiceCards ZH for Watson / Rutherford / Narrator.
- Locale chip must show Chinese body text, not EN fallback.

**Exit:** Switch EN↔中文 on city chip; both readable; forgetphys-ai on ZH.

### M3.4 Manchester art & venue QA pass

**Owner:** 美术资源 (+ 设计截图验收)  
**Do:**
- SCENE_QA / BACKGROUND / INSTRUMENT gates for lab + lodge to Conditional Pass or better.
- Props deskY/slots + α geometry stay audit-green.
- No Geiger speaker art in dialogue path.

**Exit:** Side-by-side QA pack for Coupland venues attached in chat (no hand-test required).

### M3.5 Pedagogy light close

**Owner:** 游戏设计  
**Do:**
- One-page learning checklist for Manchester (4 bullets already in director notes: empty atom / concentrated charge / plum pudding fails / lexicon central charge vs nucleus).
- Optional 3-question exit quiz (content JSON) before city unlocks “leave Manchester” hook — **no teacher dashboard yet**.

**Exit:** Player can state the four conclusions; city shows “next: Copenhagen / Bohr (locked)” teaser.

## Explicitly out of scope (this phase)

- Bohr apartment full chapter implementation  
- Multi-chapter FactStore continuity  
- Named era-peer skins (Fajans etc.)  
- Spending on FaceID cloud if free path still works  

## Suggested order

```
M3.1 harden Free/Hard  →  M3.2 coupling  →  M3.5 pedagogy close
         ↘ parallel: M3.3 ZH copy
         ↘ parallel: M3.4 art QA
```

## Success bar (Manchester “done enough”)

- [ ] Scripted + lab + lodge loop completable in EN without debug URL
- [ ] Free and Hard each completable once with live DeepSeek
- [ ] Lab readout affects Hard (or Critic) at least once
- [ ] zh-Hans Coupland dialogue shipped
- [ ] Art QA Conditional+ for lab & lodge
- [ ] Clear teaser / lock to Bohr — then open Chapter 1-4 design

## First concrete dispatch (if approved)

1. 架构: M3.1 smoke checklist + quota lock PR  
2. 设计+架构: M3.2 readout→slot ADR/thin spec  
3. 文案: start M3.3 ZH VoiceCards + first venue (lab open)

## Active track

- **Now:** M3.1 Playtest & harden Free/Hard (派 游戏架构)
- Next: M3.2 coupling → M3.5 pedagogy; M3.3/M3.4 parallel after 3.1 lands
