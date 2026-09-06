import {
  manchester,
  venueById,
  type VenueContent,
} from "@physics-chronicle/content";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  CUT_COVER_MS,
  CUT_HOLD_MS,
  CUT_REVEAL_MS,
  type CutPhase,
  type GameMode,
} from "../camera/CameraDirector";

export type GameApi = {
  mode: GameMode;
  cutPhase: CutPhase;
  chapter: typeof manchester;
  venue: VenueContent | null;
  dialogueIndex: number;
  dialogueOpen: boolean;
  enterNode: (venueId: string) => void;
  returnToAtlas: () => void;
  advanceDialogue: () => void;
  openDialogue: () => void;
};

const GameContext = createContext<GameApi | null>(null);

/** Call outside the canvas, wrap children inside it. R3F has its own reconciler. */
export function CanvasGameBridge({
  value,
  children,
}: {
  value: GameApi;
  children: ReactNode;
}) {
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<GameMode>("atlas");
  const [cutPhase, setCutPhase] = useState<CutPhase>("idle");
  const [venueId, setVenueId] = useState<string | null>(null);
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [dialogueOpen, setDialogueOpen] = useState(false);
  const busy = useRef(false);

  const cutTo = useCallback((next: GameMode, afterHold?: () => void) => {
    if (busy.current) return;
    busy.current = true;
    setCutPhase("cover");
    window.setTimeout(() => {
      afterHold?.();
      setMode(next);
      setCutPhase("hold");
      window.setTimeout(() => {
        setCutPhase("reveal");
        window.setTimeout(() => {
          setCutPhase("idle");
          busy.current = false;
        }, CUT_REVEAL_MS);
      }, CUT_HOLD_MS);
    }, CUT_COVER_MS);
  }, []);

  const enterNode = useCallback(
    (id: string) => {
      cutTo("venue", () => {
        setVenueId(id);
        setDialogueIndex(0);
        setDialogueOpen(true);
      });
    },
    [cutTo],
  );

  const returnToAtlas = useCallback(() => {
    cutTo("atlas", () => {
      setVenueId(null);
      setDialogueOpen(false);
      setDialogueIndex(0);
    });
  }, [cutTo]);

  const venue = venueId ? (venueById(manchester, venueId) ?? null) : null;

  const advanceDialogue = useCallback(() => {
    if (!venue) return;
    if (dialogueIndex >= venue.dialogue.length - 1) {
      setDialogueOpen(false);
      return;
    }
    setDialogueIndex((i) => i + 1);
  }, [dialogueIndex, venue]);

  const value = useMemo<GameApi>(
    () => ({
      mode,
      cutPhase,
      chapter: manchester,
      venue,
      dialogueIndex,
      dialogueOpen,
      enterNode,
      returnToAtlas,
      advanceDialogue,
      openDialogue: () => setDialogueOpen(true),
    }),
    [
      mode,
      cutPhase,
      venue,
      dialogueIndex,
      dialogueOpen,
      enterNode,
      returnToAtlas,
      advanceDialogue,
    ],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameApi {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
