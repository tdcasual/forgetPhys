# Hard Critic · rebuttable-claims map (α Coupland)

Status: Spec v3 aligned (2026-09-07) · mapped from 史料考证  
Source SoT (考证): `kaozheng/ch1-ForgetPhys-Critic可驳斥主张清单.md`  
Mode: **Hard** (stance Critic challenge lines)  
Venue: `coupland-lab` / Manchester chapter 《窥见原子》  
EraOpinion cards: `packages/content/src/debate/era-opinions-1909-atomic.json`  
Hard slots: [`HARD_EVIDENCE_SLOTS_ALPHA.md`](./HARD_EVIDENCE_SLOTS_ALPHA.md)  
Director: [`DEBATE_SCHEME_V3.md`](./DEBATE_SCHEME_V3.md)

**Rules (locked):**

- **EraOpinion never fills slots** — challenge lines only; `EvidenceBoard.fill` requires FactStore / approved labEmbed.
- **Watson essay / Fact cites** fill the aimed Hard slots (via CriticPolicy).
- **Stance Critic** uses the rows below as `era_opinion` challenge lines (P1a = scripted templates OK).
- **Do not invent claims** — new rows only via 史料考证; do not invent EraOpinion card bodies outside 考证 drafts.

Six Hard slots (remind): `slot-large-angle-exists` · `slot-forward-majority` · `slot-foil-extremely-thin` · `slot-charge-mass-concentrated` · `slot-plum-pudding-fails` · `slot-experimental-method`

---

## P1a ready (priority Critic speech subset)

| # | Critic claim (one line) | EraOpinion id(s) | Aim Hard slot(s) | Rebut Fact (player / Watson) | JSON |
|---|---|---|---|---|---|
| **C1** | Large angles are only the **compound-scattering tail** inside a diffuse positive sphere — no need for concentrated charge. | `era-op-compound-scattering-default` · `era-op-thomson-uniform-sphere` | `slot-plum-pudding-fails` (aux: `slot-charge-mass-concentrated`) | `fact-ruth1911-plum-pudding-fails-large-angle` (also `fact-ruth1911-central-charge`) | ✅ present |
| **C2** | Atom = Thomson **uniform positive sphere + corpuscles** — 1909–10 classroom mainstream. | `era-op-thomson-uniform-sphere` | `slot-plum-pudding-fails` | same as C1 + `fact-textbook-nuclear-model` (label textbook) | ✅ present |
| **C3** | Even with “diffuse reflection,” **do not rush a structure verdict**; central charge is only a working hypothesis. | `era-op-caution-before-central-charge` | `slot-large-angle-exists` → then `slot-charge-mass-concentrated` | first `fact-gm1909-diffuse-reflection` / `fact-gm1909-paper`, then `fact-ruth1911-central-charge` | ✅ present |
| **C7** | Most α go nearly straight — “coming back” is **rare noise / spot-reading error**. | (stack) `era-op-caution-before-central-charge` | `slot-forward-majority` **+** `slot-large-angle-exists` | `fact-gm1909-forward-majority` + `fact-gm1909-diffuse-reflection` (or `fact-gm1909-platinum-1-in-8000`) | ✅ present (via caution) |
| **C9** | Even with “central charge,” **sign may be ±** — do not treat as settled. | `era-op-sign-of-central-charge-open` | `slot-charge-mass-concentrated` (fill “concentrated”; do not lock sign) | `fact-ruth1911-central-charge` (±Ne in-paper) | ✅ present |
| **C10** | Opening with “nucleus / planetary atom” is **anachronism**. | `era-op-nucleus-word-anachronism` | *(speech color only — fills use central-charge Facts)* | cite `fact-ruth1911-central-charge` wording; avoid forcing “nucleus” banner | ✅ present |

P1a Critic speech templates should prefer **C1 · C2 · C3 · C7 · C9 · C10**.

---

## Extended (C4–C8 · 考证 drafted into era-opinions JSON)

| # | Critic claim (one line) | EraOpinion id | Aim Hard slot(s) | Rebut Fact | JSON |
|---|---|---|---|---|---|
| **C4** | α leave / scatter from the atom’s **outer layer** — does not support a concentrated-core story. | `era-op-alpha-outer-layer` | `slot-charge-mass-concentrated` | `fact-ruth1911-central-charge` · `fact-ruth1911-plum-pudding-fails-large-angle` | ✅ present |
| **C5** | Central-charge hypothesis **barely addresses electrons / chemistry** — not a complete atomic theory. | `era-op-incomplete-without-electrons` | `slot-charge-mass-concentrated` (tone; **does not** require an electron-model fill) | bound scope with `fact-ruth1911-central-charge` (“explains large angles” ≠ “full chemical atom”); no forged pre-Bohr electron solution | ✅ present |
| **C6** | If foil is thin enough, large angles should not occur; if they do, prefer **thick-target / surface / impurity** stories. | `era-op-thick-target-suspicion` | `slot-foil-extremely-thin` | `fact-gm1909-thin-gold-layer` · `fact-ruth1911-gold-1-in-20000` | ✅ present |
| **C8** | ZnS scintillation / dark-room geometry is unreliable — not true “reflection.” | `era-op-method-doubt-zns` | `slot-experimental-method` | `fact-gm1909-zns-method` · `fact-gm1909-geometry` | ✅ present |

P1 speech priority remains the P1a subset above; C4/C5/C6/C8 are available once templates want fuller Critic coverage (考证 shortlist skins optional P2+).

Named-peer flavor (optional P2+): `kaozheng/ch1-ForgetPhys-Hard质疑者短名单.md` (Fajans / Thomson / Crowther) — not a P1a blocker.

---

## EraOpinion presence check (2026-09-07)

Verified against `packages/content/src/debate/era-opinions-1909-atomic.json`:

| EraOpinion id | Used by | In JSON? |
|---|---|---|
| `era-op-compound-scattering-default` | C1 | ✅ |
| `era-op-thomson-uniform-sphere` | C1, C2 | ✅ |
| `era-op-caution-before-central-charge` | C3, C7 | ✅ |
| `era-op-sign-of-central-charge-open` | C9 | ✅ |
| `era-op-nucleus-word-anachronism` | C10 | ✅ |
| `era-op-alpha-outer-layer` | C4 | ✅ |
| `era-op-incomplete-without-electrons` | C5 | ✅ |
| `era-op-thick-target-suspicion` | C6 | ✅ |
| `era-op-method-doubt-zns` | C8 | ✅ |

**Gaps:** none for C1–C10 mapped ids (all present). Extra era-opinion cards in the same file (not in this Critic map): `era-op-shell-metaphor-late`, `era-op-who-reported-backscattering`, `era-op-nagaoka-aside`.

---

## Related

- Architecture: `docs/DEBATE_ARCHITECTURE.md`
- Debate content pointer: `docs/debate/README.md`
- Facts: `packages/content/src/debate/facts-alpha-scattering-1909.json`
- Stance Critic persona: `packages/content/src/debate/persona-era-peer-1909.json`
