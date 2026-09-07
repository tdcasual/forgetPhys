# Codex / Cloud audit brief — ForgetPhys debate scheme

Status: **Dispatch package** · 2026-09-07  
Auditor: Cursor Cloud / Codex-class coding agent  
Owner: 游戏设计 (director)  
Repo: `tdcasual/forgetPhys` (SoT tree often named `physics-chronicle` locally)

## Goal

**Read-only architecture audit** of the debate / LLM / Hard-mode design.  
Find contradictions, underspecification, and P1a blockers.  
**Do not implement runtime.** Doc-only PR fixes are OK if clearly labeled; prefer an **audit report markdown** over drive-by rewrites.

## In scope (must read)

### Director / architecture
- `docs/DEBATE_SCHEME_V3.md` — current CN SoT
- `docs/DEBATE_ARCHITECTURE.md`
- `docs/DEBATE_AUDIT_2026-09-07.md`
- `docs/DEBATE_SCHEME_REFINED.md` (pointer; V3 wins on conflict)
- `docs/DESIGN_GAPS.md`
- `docs/DOCS_INDEX.md`

### Decisions / contracts
- `docs/adr/0003-debate-bff.md` — Accepted: BFF in `apps/web`; `debateMode` vs `debateSession`
- `docs/LLM_KEY_PATH.md`
- `docs/LABEMBED_POSTMESSAGE.md`
- `docs/PROGRESS_SAVE_SCHEMA.md`
- `docs/GROUNDED_REPLY_PROMPTS.md`
- `docs/STUDENT_LLM_QUOTA.md` (draft)

### Hard mode content
- `docs/HARD_EVIDENCE_SLOTS_ALPHA.md`
- `docs/HARD_CRITIC_CLAIMS_ALPHA.md`
- `packages/content/src/debate/*.json` (personas, facts, era-opinions, hard-slots)

### UX / copy pipeline (rules only)
- `docs/DEBATE_UX.md`
- `docs/DEBATE_CONTENT_SCHEMA.md`
- `docs/DEBATE_PACKAGE_API.md`
- `docs/COPY_AGENT_CHARTER.md`
- `docs/COPY_DEAI_SOURCES.md`
- `docs/PRODUCT_FLOW.md` (shell modes + debate overlay)

### LiteLLM stub
- `tools/litellm/README.md` + `litellm_config.yaml`

## Out of scope

- Art gates / FaceID / sprite pipelines (unless debate UX contradicts UI_GATE)
- Implementing `packages/debate` runtime or BFF code
- Choosing upstream model / locking quota numbers
- Rewriting manchester.json dialogue copy quality

## Locked decisions (do not “fix” by reversing)

1. No SillyTavern fork — DebateSession on Venue2D  
2. `debateMode`: `scripted | free | hard`  
3. `debateSession`: `off | active` overlay on venue (not a GameMode)  
4. Dual stores; era_opinion never fills Hard slots; Judge = rules  
5. Hard win = persuade **era mainstream stance / board** (4/6), **not** Rutherford  
6. BFF = `apps/web` internal proxy; keys never in browser; LiteLLM gateway  
7. Stance Critic default; named peers optional  
8. Watson long-form essay path; player propose-fill allowed  

## Audit questions (answer explicitly)

1. **Consistency:** Any conflict between V3, Architecture, ADR-0003, Hard slots, Critic claims, JSON cards?  
2. **P1a readiness:** What is still missing before coding Session shell (no live LLM)? List blockers vs nice-to-haves.  
3. **Naming:** `debateMode` / `debateSession` / shell `worldMap2d|venue2d` — collision risks in code/docs?  
4. **BFF:** Is ADR-0003 enough for implementers? Gaps in SSE, auth, rate limit hooks?  
5. **labEmbed:** Is postMessage contract implementable and secure enough for iframe?  
6. **Save schema:** Contradictions with session state machine?  
7. **Content JSON:** Missing ids referenced by Critic claims / hard slots? Schema holes?  
8. **Copy pipeline:** VoiceCard + de-AI rules conflict with GroundedReply prompts?  
9. **PRODUCT_FLOW:** Stale 3D residue still misleading?  
10. **Over-spec / under-spec:** What should be cut vs what must be added before P1a?

## Deliverable

Write **`docs/AUDIT_REPORT_CODEX_DEBATE.md`** with:

| Section | Content |
|---|---|
| Verdict | Ready / Ready with fixes / Not ready for P1a |
| Critical findings | Severity Blocker / High / Med / Low |
| Doc contradictions | Table: doc A vs doc B vs recommended resolution |
| Missing docs or ADRs | Ranked |
| JSON / id integrity | Broken refs |
| Recommended P1a checklist | Ordered, testable |
| Explicit non-issues | What looked scary but is fine |

Optional: tiny doc patches that fix clear contradictions (same PR), listed in the report.

## Success criteria

- Report exists and answers all 10 audit questions  
- No runtime code required  
- Does not reverse locked decisions without labeling as “challenge to lock” (director decides)

## Note on trees

Local workspace may also mirror docs under `physics-game/docs/`. Prefer **`physics-chronicle`-shaped paths** in the GitHub repo (`docs/…`, `packages/content/src/debate/…`). If a listed file is missing on the branch, say so — do not invent contents.
