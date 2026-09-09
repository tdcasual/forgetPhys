# ADR-0006: Locale / dialogue language switch

Status: **Accepted** · 2026-09-09  
Deciders: 游戏设计 (director) + user

## Context

Chinese Coupland lines suffered translationese and theatrical padding when calqued from English VoiceSources. User locked: **English dialogue as SoT first**; **UI + dialogue must be switchable** to `zh-Hans` later (rewritten, not calqued).

## Decision

1. `progress.settings.locale` ∈ `en` | `zh-Hans` (single switch for UI + dialogue v1).
2. Dialogue lines carry bilingual map: `text: { "en": "...", "zh-Hans"?: "..." }` (**string legacy = `en`** — Coupland EN SoT landed on PR #5; do not treat bare strings as zh-Hans).
3. Runtime helper `lineText(line, locale)` falls back: requested → `en` → first available.
4. Missing `zh-Hans` shows `en` (or a discreet “ZH pending” only in dev harness — not player-facing banner).
5. Historical speech VoiceCards: EN primary; ZH VoiceCard later, **rewrite rules**, ban calque.
6. Narrator/textbook may prefer ZH when that locale ships; until then EN teaching lines OK.

## Non-goals (v1)

- Separate `uiLocale` vs `dialogueLocale` (defer).
- Full Hard-card i18n in same PR (follow-up OK).
- Machine translation pipeline.

## Consequences

Copy delivers Coupland **EN** on PR #5 or successor; architecture ships locale setting + resolver before/with that content.

Speaker **display names** resolve via charId/role locale table (Watson/Rutherford/Narrator ↔ 华生/卢瑟福/旁白); do not leave Chinese nameplates when `locale=en`.
