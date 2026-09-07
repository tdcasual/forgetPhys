# LabEmbed `postMessage` contract

Status: **Standalone contract** · 2026-09-07  
Extracted from [`DEBATE_ARCHITECTURE.md`](./DEBATE_ARCHITECTURE.md) §16 (EN architecture SoT remains authoritative for surrounding Hard rules).  
Related: [`HARD_EVIDENCE_SLOTS_ALPHA.md`](./HARD_EVIDENCE_SLOTS_ALPHA.md) · [`DEBATE_SCHEME_V3.md`](./DEBATE_SCHEME_V3.md) §3 · [`PROGRESS_SAVE_SCHEMA.md`](./PROGRESS_SAVE_SCHEMA.md)

> Infinitas (or compatible lab) runs in an iframe / embed. Typed JSON crosses the boundary via `window.postMessage`. Only whitelisted origins, kinds, fields, and slot mappings are accepted. **No chronicle rewrite.**

---

## 1. Origin whitelist

Parent (ForgetPhys `apps/web`) listens only for messages whose `event.origin` is on an **allowlist** (config / env — never `*`).

| Context | Example origins (illustrative) |
|---|---|
| Local dev | `http://localhost:5173`, Infinitas local origin as configured |
| Deploy | Production SPA origin + known Infinitas host(s) |

Rules:

- Reject unknown `origin` before parsing payload.
- Prefer explicit list in server-built config or build-time allowlist; do not derive from `document.referrer` alone.
- `event.source` should be the expected iframe `contentWindow` when available.

---

## 2. Payload kinds

| `kind` | Status | Purpose |
|---|---|---|
| `alpha_scatter_summary` | **P1a whitelist** | Coupland α scattering readout → candidate Hard fills |

Unknown `kind` → ignore (may log in dev). Future kinds require an explicit doc + slot-map update before acceptance.

---

## 3. Fields + ranges (`alpha_scatter_summary`)

```json
{
  "kind": "alpha_scatter_summary",
  "angle_deg": 150,
  "fraction_forward": 0.999,
  "large_angle_count": 3
}
```

| Field | Type | Range / constraint |
|---|---|---|
| `kind` | string | Must be `alpha_scatter_summary` |
| `angle_deg` | number? | Finite; large-angle candidate when **above configured threshold** (content/config; typical large-angle band e.g. ≥ ~90° — exact threshold in app config, not invented here) |
| `fraction_forward` | number? | ∈ `[0, 1]` |
| `large_angle_count` | number? | Non-negative integer (`>= 0`, no fraction) |

Out-of-range / non-finite / wrong type → **no fill**; UI may still show an “unverified readout” chip.

Envelope tip (optional, both directions): wrap with `{ "v": 1, "type": "labEmbed", "payload": { ... } }` so non-lab messages do not collide — if used, whitelist both `type` and inner `kind`.

---

## 4. Slot mapping whitelist

Only these labEmbed signals may propose fills (after CriticPolicy). Slot ids match Coupland α SoT.

| labEmbed signal | Candidate slot id |
|---|---|
| `large_angle_count > 0` **or** `angle_deg` above large-angle threshold | `slot-large-angle-exists` |
| `fraction_forward` in configured “majority forward” band | `slot-forward-majority` |

**FactStore-cite only** (no labEmbed auto-map unless a future kind is whitelisted):

- `slot-foil-extremely-thin`
- `slot-charge-mass-concentrated`
- `slot-plum-pudding-fails`
- `slot-experimental-method`

free mode: labEmbed may show **ghost** candidates only — never mutate durable fills.

---

## 5. Security

| Rule | Detail |
|---|---|
| **No chronicle rewrite** | labEmbed / postMessage **never** edits chroniclePlate copy, fate text, or scripted beat prose |
| **Critic before fill** | CriticPolicy validates kind whitelist, ranges, and slot↔signal legality **before** `EvidenceBoard.tryFill` |
| **Origin + kind** | Both must pass; payload is untrusted data |
| **No keys** | Never send `LITELLM_*` / vendor keys through postMessage |
| **Hard only durable fills** | Durable board writes only when `debateMode === hard` and session policy allows |

---

## 6. Example `postMessage` (both directions)

### Embed → parent (readout)

```js
// inside Infinitas iframe
parent.postMessage(
  {
    v: 1,
    type: "labEmbed",
    payload: {
      kind: "alpha_scatter_summary",
      angle_deg: 150,
      fraction_forward: 0.999,
      large_angle_count: 3
    }
  },
  "https://forgetphys.example" // targetOrigin = parent allowlisted origin
);
```

### Parent → embed (optional ack / handshake)

```js
// ForgetPhys parent
iframe.contentWindow.postMessage(
  {
    v: 1,
    type: "labEmbed",
    payload: {
      kind: "host_hello",
      venueId: "lab-coupland",
      acceptKinds: ["alpha_scatter_summary"]
    }
  },
  "https://infinitas.example" // targetOrigin = embed origin
);
```

`host_hello` / ack kinds are **control-only** (not slot fillers). Parent on message:

1. Check `event.origin` ∈ whitelist  
2. Parse JSON; require `kind === "alpha_scatter_summary"` (or unwrap envelope)  
3. Range-check fields  
4. Map → candidate slots (§4)  
5. CriticPolicy → `tryFill` (hard) or ghost preview (free)

---

## 7. Pointers

| Doc | Role |
|---|---|
| `DEBATE_ARCHITECTURE.md` §16 | Original contract home |
| `HARD_EVIDENCE_SLOTS_ALPHA.md` | Slot definitions · win rule |
| `GROUNDED_REPLY_PROMPTS.md` | LLM cites — separate from lab measurements |
| `PROGRESS_SAVE_SCHEMA.md` | Persist `labEmbedVisit` unlock + fills |
