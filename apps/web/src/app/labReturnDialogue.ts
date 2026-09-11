/**
 * Lab-return dialogue convention (VN-lab-03).
 * Coupland return beats use ids prefixed `mcr-ret-` (copy owns text).
 * Optional labEmbed.returnLineId / returnLineIdPrefix override the defaults.
 */

import type { DialogueLine, LabEmbed } from "@physics-chronicle/content";

/** Default id prefix for post–labEmbed return beats. */
export const DEFAULT_LAB_RETURN_LINE_ID_PREFIX = "mcr-ret-";

export type LabReturnEmbedHints = Pick<
  LabEmbed,
  "returnLineId" | "returnLineIdPrefix"
>;

/**
 * Find the first lab-return line index in `lines`.
 * Prefers exact `returnLineId` when set and present; else first id with prefix.
 * Returns null when copy has not landed return beats yet (caller keeps index).
 */
export function findLabReturnDialogueIndex(
  lines: readonly Pick<DialogueLine, "id">[],
  embed?: LabReturnEmbedHints | null,
): number | null {
  const exact = embed?.returnLineId;
  if (exact) {
    const byExact = lines.findIndex((l) => l.id === exact);
    if (byExact >= 0) return byExact;
  }
  const prefix = embed?.returnLineIdPrefix ?? DEFAULT_LAB_RETURN_LINE_ID_PREFIX;
  const byPrefix = lines.findIndex((l) => l.id.startsWith(prefix));
  return byPrefix >= 0 ? byPrefix : null;
}

/** True when `lineRaw` is a non-negative integer index (not a line id). */
export function isNumericDialogueLineParam(lineRaw: string): boolean {
  return /^\d+$/.test(lineRaw);
}
