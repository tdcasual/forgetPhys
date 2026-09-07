# Debate UI Redesign — 案卷拖牌（Hard / Coupland）

**Status:** P1b implementing (派 游戏架构) · moodboard locked · mock copy illustrative only  
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
