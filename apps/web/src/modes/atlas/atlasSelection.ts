export type AtlasSelection = {
  id: string;
  name: string;
  venueId: string;
  unlocked: boolean;
} | null;

let selectionListener: ((s: AtlasSelection) => void) | null = null;
let currentSelection: AtlasSelection = null;

export function setAtlasSelection(s: AtlasSelection) {
  currentSelection = s;
  selectionListener?.(s);
}

export function subscribeAtlasSelection(fn: (s: AtlasSelection) => void) {
  selectionListener = fn;
  fn(currentSelection);
  return () => {
    if (selectionListener === fn) selectionListener = null;
  };
}
