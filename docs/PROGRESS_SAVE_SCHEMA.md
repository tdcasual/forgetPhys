# Progress / save schema (debate + unlocks)

Status: **JSON schema sketch** · 2026-09-07 · design only  
Related: [`DEBATE_ARCHITECTURE.md`](./DEBATE_ARCHITECTURE.md) §14 · [`DEBATE_SCHEME_V3.md`](./DEBATE_SCHEME_V3.md) §5 · [`adr/0003-debate-bff.md`](./adr/0003-debate-bff.md) · [`LABEMBED_POSTMESSAGE.md`](./LABEMBED_POSTMESSAGE.md)

> Persist unlock gates, last-used debate mode, and Hard EvidenceBoard fills. **Never** persist invented cites. Shell `GameMode` is spatial-only and is **not** replaced by debate fields.

---

## 1. Top-level sketch

```json
{
  "v": 1,
  "chapterId": "ch1",
  "unlock": {
    "labEmbedVisit": false,
    "freeUnlocked": false,
    "hardUnlocked": false
  },
  "debateModeLast": "scripted",
  "debateSession": {
    "scratch": null,
    "durable": {
      "byVenue": {}
    }
  },
  "evidenceBoard": {
    "byVenue": {
      "lab-coupland": {
        "fills": {},
        "criticPassCount": 0,
        "updatedAt": "2026-09-07T00:00:00.000Z"
      }
    }
  }
}
```

---

## 2. Unlock flags

| Flag | Meaning | Typical set when |
|---|---|---|
| `labEmbedVisit` | Player returned from ≥1 Infinitas / labEmbed | First successful embed session / readout ack |
| `freeUnlocked` | `debateMode: free` available | First labEmbed **or** lodge beat (content flag — exact beat still open in V3 §8) |
| `hardUnlocked` | `debateMode: hard` available | Recommend after `labEmbedVisit === true` |

Unlocks are **durable progress** (survive venue exit). Clearing them only on chapter reset (§5).

---

## 3. `debateSession`: scratch vs durable

Orthogonal to `debateMode` (`scripted` \| `free` \| `hard`) and to shell `GameMode`.

| Layer | Field | Lifetime | Contents |
|---|---|---|---|
| **Overlay flag** | runtime `debateSession: off \| active` | Memory / optional scratch | Open modal on venue; does **not** replace `debateMode` |
| **Scratch** | `debateSession.scratch` | Cleared on `persuaded` / `aborted` / navigation policy | Mid-run turn count, open transcript buffer, ghost board preview, pending labEmbed candidate |
| **Durable** | `debateSession.durable.byVenue[venueId]` | Until chapter complete / reset | Last exit reason, optional resume beat hint — **not** full chat logs by default |

Scratch example:

```json
{
  "venueId": "lab-coupland",
  "debateMode": "hard",
  "debateSession": "active",
  "turnCount": 3,
  "ghostFills": {},
  "pendingLabEmbed": null
}
```

---

## 4. EvidenceBoard fills per `venueId`

```json
{
  "fills": {
    "slot-large-angle-exists": {
      "source": "labEmbed",
      "kind": "alpha_scatter_summary",
      "cite": [],
      "measurement": { "large_angle_count": 3, "angle_deg": 150 },
      "filledAt": "2026-09-07T00:00:00.000Z"
    },
    "slot-forward-majority": {
      "source": "fact",
      "cite": ["fact-alpha-forward-majority-1909"],
      "filledAt": "2026-09-07T00:00:00.000Z"
    }
  },
  "criticPassCount": 1,
  "updatedAt": "2026-09-07T00:00:00.000Z"
}
```

| Rule | Detail |
|---|---|
| Key | `evidenceBoard.byVenue[venueId]` |
| free | **No** durable fills — ghost only in scratch |
| hard | Only Critic-validated fills; `source`: `fact` \| `labEmbed` \| `npc_cite` \| `player_propose` |
| era_opinion | **Never** stored as a fill |
| L3 default | Keep fills **per venue** until chapter complete or reset (V3 §5) |

---

## 5. `debateMode` last used + chapter reset

| Field | Values | Notes |
|---|---|---|
| `debateModeLast` | `scripted` \| `free` \| `hard` | Last selected ruleset (for UI remember); independent of `debateSession` off/active |

**Chapter reset** (player or debug):

1. Clear `evidenceBoard.byVenue` for that chapter's venues (or whole `chapterId` blob).  
2. Clear `debateSession.scratch` and durable-by-venue resume hints.  
3. Optionally reset unlock flags (`labEmbedVisit` / `freeUnlocked` / `hardUnlocked`) — product default: **reset unlocks on full chapter reset**; keep unlocks on soft "clear board only" if offered.  
4. Never rewrite chronicle plate / fate strings as part of save clear.

---

## 6. `localStorage` key naming + future cloud

### Local (P1 default)

| Key pattern | Value |
|---|---|
| `forgetphys:progress:v1:{chapterId}` | Full chapter progress JSON (§1) |
| `forgetphys:debate:scratch:v1:{chapterId}:{venueId}` | Optional split scratch blob |

- Prefix `forgetphys:` avoids collisions.  
- Include `v1` for migrations.  
- Do not store API keys, LiteLLM tokens, or raw SSE secrets in these keys.

### Future cloud (optional)

- Same JSON shape as §1 under a user / class save slot.  
- Server auth separate from LiteLLM BFF; **do not** reuse `LITELLM_API_KEY` as save credential.  
- Merge policy TBD (last-write-wins vs unlock OR / fills union) — out of P1a scope.

---

## 7. Pointers

| Doc | Role |
|---|---|
| `DEBATE_ARCHITECTURE.md` §14 | Session SM · persistence blurb |
| `adr/0003-debate-bff.md` | `debateMode` vs `debateSession` lock |
| `LABEMBED_POSTMESSAGE.md` | `labEmbedVisit` / measurement fills |
| `GROUNDED_REPLY_PROMPTS.md` | Do not persist rejected / invented cites |
