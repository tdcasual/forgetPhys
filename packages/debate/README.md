# `@physics-chronicle/debate` (stub)

Runtime package **not implemented yet** (docs + content JSON only).

## Read first

- Architecture (three modes, dual stores, module map, data flow, P0–P2):  
  [`docs/DEBATE_ARCHITECTURE.md`](../../docs/DEBATE_ARCHITECTURE.md)
- TypeScript interface sketch (types only):  
  [`docs/DEBATE_PACKAGE_API.md`](../../docs/DEBATE_PACKAGE_API.md)
- Card JSON shapes:  
  [`docs/DEBATE_CONTENT_SCHEMA.md`](../../docs/DEBATE_CONTENT_SCHEMA.md)
- Hard evidence slots (Coupland α):  
  [`docs/HARD_EVIDENCE_SLOTS_ALPHA.md`](../../docs/HARD_EVIDENCE_SLOTS_ALPHA.md)
- BFF ADR (Accepted): [`docs/adr/0003-debate-bff.md`](../../docs/adr/0003-debate-bff.md)
- GroundedReply prompts: [`docs/GROUNDED_REPLY_PROMPTS.md`](../../docs/GROUNDED_REPLY_PROMPTS.md)
- LabEmbed postMessage: [`docs/LABEMBED_POSTMESSAGE.md`](../../docs/LABEMBED_POSTMESSAGE.md)
- Progress save: [`docs/PROGRESS_SAVE_SCHEMA.md`](../../docs/PROGRESS_SAVE_SCHEMA.md)
- Student quota (draft): [`docs/STUDENT_LLM_QUOTA.md`](../../docs/STUDENT_LLM_QUOTA.md)
- Persona / fact / era-opinion / hard-slot JSON:  
  [`packages/content/src/debate/`](../content/src/debate/)

## Planned modules

`PersonaCard` · `FactStore` · `EraOpinionStore` · `Retriever` · `GroundedReply` · `EvidenceBoard` · `CriticPolicy` · `Judge` · `DebateSession`

Stay inside the ForgetPhys shell (`DebateSession` on Venue2D). Do not fork SillyTavern.
