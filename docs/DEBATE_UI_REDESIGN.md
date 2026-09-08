# Debate UI Redesign — 案卷拖牌（Hard / Coupland）

**Status:** P1b done (派 游戏架构) · dossier shell shipped · moodboard locked · mock copy illustrative only  
**Persuade target:** 时代主流理解（era Critic stance）— not Rutherford  
**Non-goals:** HP / cost / rarity / combo deckbuilder

## Direction

Desktop metaphor over Coupland lab (half overlay, venue still readable):

| Zone | Role |
|------|------|
| Top bar | turn budget · persuade target label |
| Left table | Critic challenge card (era opinion) |
| Center-right | α散射案卷 — 6 evidence slots |
| Bottom hand | Fact / lab-readout cards; drag → slot |

Valid fill → red **入档** stamp. Invalid / CriticPolicy reject → ink blot, card returns. Challenge card on table can be overridden by matching fill (scripted P1a lines).

## Moodboard files

| File | Use |
|------|-----|
| `docs/refs/debate-ui/moodboard-coupland-slots.png` | **Primary** Coupland slot layout target |
| `docs/refs/debate-ui/moodboard-dossier-desk.png` | Desk / hand / dossier atmosphere (style only; ignore wrong city/claims) |
| `docs/refs/debate-ui/moodboard-present-card.png` | Wax-seal「出示」emphasis (optional secondary beat) |
| `docs/refs/debate-ui/ace-attorney-court-record.png` | External ref: Ace Attorney court-record strip (fair use, design only) |

## Slot map (SoT = `hard-slots-alpha-1909.json`)

Mocks show illustrative Chinese labels. Implement from JSON `slots[]`, not from mock copy.

## Implementation notes (for 游戏架构)

1. Replace full-screen `DebateSessionOverlay` engineer panel with dossier + hand + challenge card.
2. Keep P1a logic: ProposeFill → CriticPolicy → Judge; only restyle shell.
3. Drag-and-drop preferred; click-pick → click-slot OK as fallback (a11y).
4. Copy: no `filledCount`/`criticPass` engineer strings in player chrome — use 入档 / 质疑 / 回合.

## Open for director sign-off

- [x] Prefer **拖牌入档** as default interaction (vs present-from-record strip only)
- [x] Coupland mock as visual north star for P1b UI pass

## Color palettes (exploratory; not locked)

Director returned to warm dossier shell + **era skins** (see below).

Rejected baseline: warm sepia / brown leather / lamplight (previous moodboards).

| ID | Name | Refs | Tokens (approx) | Mood |
|----|------|------|-----------------|------|
| A | Court Blue | Ace Attorney court record | cobalt `#1B3A8C`, white paper, chrome yellow `#F5C518`, cool gray desk | crisp courtroom |
| B | Ink & Pigment | Pentiment / woodcut chronicle | cream vellum `#F4EBD8`, charcoal ink, vermillion `#C23B22`, ultramarine `#2F4CB0` | bright manuscript |
| C | Bureaucracy Olive | Papers, Please | olive `#3C4135`, manila `#E8E3C7`, cold gray metal, stamp red | institutional desk |
| D | Lab Phosphor | scintillation / dark lab HUD | slate `#1A1F26`, cyan `#3DFFC8`, ZnS green glow, violet challenge | night instrument |

Mocks: `docs/refs/debate-ui/palette-A-court-blue.png` … `palette-D-lab-phosphor.png`. Layout illustrative; lock palette only.

## Palette decision (2026-09-07)

**Locked:** keep warm dossier/parchment **shell** (previous Coupland moodboard), not A–D flat alternatives.

**Era skins (合理且推荐):** same interaction layout; swap background plate + accent pigments by chronicle era so not every venue looks identical.

| Era skin id | When | Plate / paper | Accent | Avoid |
|-------------|------|---------------|--------|-------|
| `era-1909-lab` | Coupland / Manchester α (P1) | warm manila + gaslight brown | ZnS phosphor green + wax-seal red | neon HUD, pure cobalt court |
| `era-galileo-ink` | early modern / dialogue chronicles | cream vellum + charcoal woodcut | vermillion / ultramarine sparingly | leather-steampunk sludge |
| `era-industrial-print` | late 19c cities | cooler newsprint gray-cream | iron-blue ink | fantasy gold leaf overload |

Director rule: **shell constant, skin per chapter/venue**. Content SoT unchanged. Coupland ships `era-1909-lab` first.


## P1b ship notes

- Skin: `era-1909-lab` CSS tokens (`--era-paper`, `--era-ink`, `--era-seal`, `--era-zns`, …)
- Components: `DossierBoard`, `HandRail`, `ChallengeCard` under `apps/web/src/modes/debate/`
- Interaction: drag-into-slot default; click-pick → click-slot + ProposeFillSheet fallback
- Player chrome: 入档 / 质疑 / 回合 (no `filledCount` / `criticPass` strings)
- Screenshots: `shots/debate-ui/` (+ harness `/?harness=debate-ui&state=empty|filed2|persuaded`)

## P1b.1 visual polish (2026-09-07 director)

User: 字体偏小、主体不够突出。Harness shots confirm flat equal-weight panels.

### Hierarchy (must)

1. **Hero = 案卷** (~55–65% visual weight): thicker leather frame, deeper drop shadow, larger title (`h2` ≥1.4rem), slot labels ≥0.95–1.05rem, empty slots with stronger dashed ink (not hairline).
2. **Secondary = 挑战卡**: narrower or shorter; kicker small; title ≤1rem; body max 3 lines + “展开”; seal OK but don’t compete with dossier.
3. **Tertiary = 手牌**: card **title** ≥0.9rem; **hide citation/body by default** (show 1-line on hover/picked only). Hand rail darker so cream cards pop.
4. **Top bar**: one line, ≤0.85rem; no competing “第二案卷”.

### Anti-patterns to kill

- Six panels same cream = no subject
- Slot claim text wrapping 3+ lines at 0.78rem
- Hand cards wall-of-text citations
- Engineer progress strings dominating header

### Acceptance

New shots under `shots/debate-ui/`: `11-hierarchy-empty.png`, `12-hierarchy-filed2.png` — dossier clearly dominant; titles readable at 1280×800 without squint.


## P1b.2 visual polish (2026-09-08 director)

PR #4 held (不合). User still blocked on: **字太小** · **案卷不够主角** · **手牌太扁/信息不够**.

### Must

1. **Type scale up again (1280×800 readable without squint)**
   - Dossier title ≥ **1.75rem**
   - Slot claim labels ≥ **1.15rem** (line-clamp 2; prefer short_label if present)
   - Hand card title ≥ **1.05rem**
   - Hand card body: show **1–2 short lines** always (not hidden-only-on-hover); citations stay optional/hover
   - Top bar / challenge kicker stay small (≤0.75rem) so hero type wins

2. **Dossier = unmistakable hero**
   - Occupy ~**70%** of overlay width (challenge ≤22% or collapse to chip until expand)
   - Stronger leather frame (border ≥4px), deeper multi-layer shadow, slight scale/z above challenge
   - Dim challenge + desk chrome (~0.75 opacity) when not hovered; dossier stays full opacity
   - Optional: soft vignette outside dossier so eye locks center

3. **Hand rail = thicker, more info**
   - Card min-height ≥ **96px** (not flat stamps)
   - Layout: tag + **title** + **1–2 line gist** (from content_zh truncated ~40–56 chars)
   - Fewer cards visible OK (horizontal scroll) — prefer readable cards over cramming 6 tiny ones
   - Rail height ~**120–140px**; cream cards on darker desk so they pop

### Acceptance shots
`shots/debate-ui/21-p1b2-empty.png`, `22-p1b2-filed2.png` at 1280×800.
Push onto PR #4 branch (or new PR if cleaner); still no merge until director says.

