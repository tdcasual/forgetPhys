# Hard evidence slots — Coupland α scattering (persuade win)

Status: Spec v3 aligned (2026-09-07) · win = era peers / board 4/6  
Mode: **Hard** (证据槽)  
Venue: `coupland-lab` / Manchester chapter 《窥见原子》  
SoT cards: `packages/content/src/debate/facts-alpha-scattering-1909.json`  
Architecture: `docs/DEBATE_ARCHITECTURE.md`

Hard mode fills slots from **FactStore** (and CriticPolicy-approved Infinitas `labEmbed` measurements).  
**EraOpinionStore does not fill slots.**  
**Hard does not rewrite chronicle plate / fate ending** — win = EvidenceBoard + Judge only.  
**B2 LOCKED = A (2026-09-07; clarified):** win = convince **era understanding（时代主流理解） / optional named peers / board** — **not Rutherford**. Stance Critic is default (named historical person **not** required). Rutherford remains lab chief / interlocutor. Player rebuts via Watson essay path; Judge still = rules + slots.

---

## Win rule

```
persuaded  iff  filled_count >= N
                AND  CriticPolicy.pass_once === true
                AND  persuade_target = era peers / EvidenceBoard
```

**Win wording (B2=A):** persuade **era peers / board** — fill **≥4 of 6** slots + ≥1 CriticPolicy pass. Rutherford is **not** the win object.

| Parameter | Value | Notes |
|---|---|---|
| **M** (total slots) | 6 | Listed below |
| **N** (min required) | **4** | Fill any 4 of 6 |
| **Persuade target** | **era peers / board** | Contemporaries grounded in historical fact (B2=A); **not Rutherford** |
| **CriticPolicy** | ≥1 pass on a filling turn | Cites present; no invented numbers; slot↔fact id legal; era opinions not used as fills |
| **Judge** | Rules engine | Not an LLM eloquence score; EraPeer cannot award win or veto legal Fact fills |
| **Budget** (suggested) | 12 player turns or session exit | Soft fail → return to Venue2D without fate rewrite |
| **Persuade object** | Era understanding / peers / board | Default antagonist = stance Critic（时代主流理解）; named peer optional; **not** Rutherford |

Optional JSON mirror of this table: same directory / future `hard-slots-alpha-1909.json` if loaders prefer data — this Markdown is the human SoT for P0.

---

## Slots

### 1. `slot-large-angle-exists`

| Field | Value |
|---|---|
| **label_zh** | 存在大角偏转 / 漫反射 |
| **what counts as filling** | Player or grounded NPC cites that some α are turned through large angles (including source-side / “reflected” paths under 1909 geometry), with a FactStore cite — not merely “atoms are empty.” |
| **linked_fact_ids** | `fact-gm1909-diffuse-reflection`, `fact-gm1909-paper` |
| **labEmbed** | Optional: Infinitas run showing rare large deflection events (typed readout validated by CriticPolicy) |

### 2. `slot-forward-majority`

| Field | Value |
|---|---|
| **label_zh** | 绝大多数几乎沿直线前进 |
| **what counts as filling** | Cite that most traversing α continue nearly forward; large-angle events are rare. Contrast with slot 1 required for good pedagogy but not for this slot alone. |
| **linked_fact_ids** | `fact-gm1909-forward-majority` |
| **labEmbed** | Optional: majority forward histogram / fraction from embed |

### 3. `slot-foil-extremely-thin`

| Field | Value |
|---|---|
| **label_zh** | 箔极薄仍可大角偏转（体积/薄层效应） |
| **what counts as filling** | Cite thin gold layer scale (e.g. ~6×10^{-5} cm class from 1909) or 1911 gold thickness quote — numbers only from cards; argue that large angles occur despite extreme thinness / volume effect, not thick-target storytelling. |
| **linked_fact_ids** | `fact-gm1909-thin-gold-layer`, `fact-ruth1911-gold-1-in-20000` |

### 4. `slot-charge-mass-concentrated`

| Field | Value |
|---|---|
| **label_zh** | 电荷/质量高度集中（中心电荷） |
| **what counts as filling** | Cite Rutherford 1911 central-charge / single-scattering framing (or textbook 核式结构 with textbook tier labeled). Prefer “中心电荷” in era speech. |
| **linked_fact_ids** | `fact-ruth1911-central-charge`, `fact-textbook-nuclear-model`, `fact-ruth1911-paper` |

### 5. `slot-plum-pudding-fails`

| Field | Value |
|---|---|
| **label_zh** | 枣糕 / 弥散正电 + 多次散射解释失败 |
| **what counts as filling** | Cite that diffuse positive sphere + compound-scattering expectations fail to match rare large-angle probabilities without extreme concentration. Era opinions may *color* the dialogue but the **fill cite must be FactStore**. |
| **linked_fact_ids** | `fact-ruth1911-plum-pudding-fails-large-angle`, `fact-textbook-nuclear-model` |

### 6. `slot-experimental-method`

| Field | Value |
|---|---|
| **label_zh** | 实验方法：ZnS 闪烁 + 几何屏蔽 |
| **what counts as filling** | Cite ZnS scintillation counting and/or 1909 geometry (mica window, lead block, reflector, microscope). Roles card may support but does not replace method. |
| **linked_fact_ids** | `fact-gm1909-zns-method`, `fact-gm1909-geometry`, `fact-roles-geiger-marsden-rutherford` |

---

## CriticPolicy checks (Hard fill)

1. **Cite present** — filling utterance includes ≥1 `linked_fact_ids` for that slot (or approved labEmbed measurement id).
2. **No invent** — numeric tokens must match a retrieved fact card (or labEmbed schema); else reject.
3. **Tier gate** — `era_opinion` cites never call `EvidenceBoard.fill`.
4. **One pass** — at least one turn in the session must pass CriticPolicy while attempting a fill (blocks win-by-spam empty rhetoric).
5. **Chronicle freeze** — Judge must not mutate `chroniclePlate` copy or chapter ending flags.

---

## Example persuade path (4 of 6)

1. Fill `slot-experimental-method` (ZnS + geometry)  
2. Fill `slot-forward-majority`  
3. Fill `slot-large-angle-exists`  
4. Fill `slot-plum-pudding-fails` **or** `slot-charge-mass-concentrated`  
→ CriticPolicy passed on a fill turn → **persuaded** vs **era understanding / peers / board** (Watson ally / essay mouthpiece may highlight remaining empty slots but win already stands).

---

## Related

- Director SoT: `docs/DEBATE_SCHEME_V3.md`
- Critic rebuttable-claims map: [`HARD_CRITIC_CLAIMS_ALPHA.md`](./HARD_CRITIC_CLAIMS_ALPHA.md)（stance challenge lines → slots；考证 SoT）
- Personas: `packages/content/src/debate/persona-rutherford-1909.json`, `persona-watson.json`, `persona-era-peer-1909.json`
- Era opinions (speech only): `era-opinions-1909-atomic.json`
- Facts: `facts-alpha-scattering-1909.json`
- Scripted baseline: `packages/content/src/data/manchester.json`
