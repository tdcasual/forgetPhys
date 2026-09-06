import {
  manchester,
  venueById,
  type VenueContent,
} from "@physics-chronicle/content";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
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
  pendingVenueId: string | null;
  cityId: string | null;
  dialogueIndex: number;
  dialogueOpen: boolean;
  /** WorldMap → ChroniclePlate (after Manchester / city chosen). */
  selectDestiny: (venueId: string, cityId?: string) => void;
  /** ChroniclePlate → CityPage (80 Days structure). */
  continueToCity: () => void;
  /** @deprecated Prefer continueToCity; kept for call-site migration. */
  continueToVenue: () => void;
  /** CityPage → Venue dialogue (lab or lodge). */
  enterVenue: (venueId: string) => void;
  /** Venue → LabEmbed iframe. */
  openLab: () => void;
  /** LabEmbed → Venue dialogue. */
  closeLab: () => void;
  /** Venue → CityPage. */
  returnToCity: () => void;
  /** CityPage / Venue → ChroniclePlate. */
  returnToPlate: () => void;
  /** ChroniclePlate / CityPage → WorldMap. */
  returnToWorldMap: () => void;
  /** @deprecated Prefer returnToPlate. */
  returnToAtlas: () => void;
  advanceDialogue: () => void;
  openDialogue: () => void;
};

const GameContext = createContext<GameApi | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<GameMode>("worldMap");
  const [cutPhase, setCutPhase] = useState<CutPhase>("idle");
  const [venueId, setVenueId] = useState<string | null>(null);
  const [pendingVenueId, setPendingVenueId] = useState<string | null>(null);
  const [cityId, setCityId] = useState<string | null>(null);
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [dialogueOpen, setDialogueOpen] = useState(false);
  const busy = useRef(false);

  // QA / screenshot deep-link:
  // ?mode=worldMap|chroniclePlate|cityPage|venue|labEmbed&venue=coupland-lab&line=0
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const m = q.get("mode");
    const v = q.get("venue") || "coupland-lab";
    const lineRaw = q.get("line");
    const lineIdx =
      lineRaw != null && lineRaw !== "" && !Number.isNaN(Number(lineRaw))
        ? Math.max(0, Math.floor(Number(lineRaw)))
        : null;
    if (m === "chroniclePlate") {
      setMode("chroniclePlate");
      setPendingVenueId(v);
      setCityId("manchester");
    } else if (m === "cityPage") {
      setMode("cityPage");
      setPendingVenueId(v);
      setCityId("manchester");
    } else if (m === "venue") {
      setMode("venue");
      setPendingVenueId(v);
      setVenueId(v);
      setCityId("manchester");
      setDialogueOpen(true);
      if (lineIdx != null) setDialogueIndex(lineIdx);
    } else if (m === "labEmbed") {
      setMode("labEmbed");
      setPendingVenueId(v);
      setVenueId(v);
      setCityId("manchester");
      setDialogueOpen(true);
      if (lineIdx != null) setDialogueIndex(lineIdx);
    } else if (m === "worldMap") {
      setMode("worldMap");
    }
  }, []);

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

  const selectDestiny = useCallback(
    (id: string, city = "manchester") => {
      cutTo("chroniclePlate", () => {
        setPendingVenueId(id);
        setCityId(city);
        setVenueId(null);
        setDialogueOpen(false);
        setDialogueIndex(0);
      });
    },
    [cutTo],
  );

  const continueToCity = useCallback(() => {
    cutTo("cityPage", () => {
      setVenueId(null);
      setDialogueOpen(false);
      setDialogueIndex(0);
    });
  }, [cutTo]);

  const continueToVenue = continueToCity;

  const enterVenue = useCallback(
    (id: string) => {
      cutTo("venue", () => {
        setVenueId(id);
        setPendingVenueId(id);
        setDialogueIndex(0);
        setDialogueOpen(true);
      });
    },
    [cutTo],
  );

  const openLab = useCallback(() => {
    cutTo("labEmbed", () => {
      /* keep venueId + dialogue state */
    });
  }, [cutTo]);

  const closeLab = useCallback(() => {
    cutTo("venue", () => {
      setDialogueOpen(true);
    });
  }, [cutTo]);

  const returnToCity = useCallback(() => {
    cutTo("cityPage", () => {
      setVenueId(null);
      setDialogueOpen(false);
      setDialogueIndex(0);
    });
  }, [cutTo]);

  const returnToPlate = useCallback(() => {
    cutTo("chroniclePlate", () => {
      setVenueId(null);
      setDialogueOpen(false);
      setDialogueIndex(0);
    });
  }, [cutTo]);

  const returnToWorldMap = useCallback(() => {
    cutTo("worldMap", () => {
      setVenueId(null);
      setPendingVenueId(null);
      setCityId(null);
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
      pendingVenueId,
      cityId,
      dialogueIndex,
      dialogueOpen,
      selectDestiny,
      continueToCity,
      continueToVenue,
      enterVenue,
      openLab,
      closeLab,
      returnToCity,
      returnToPlate,
      returnToWorldMap,
      returnToAtlas: returnToPlate,
      advanceDialogue,
      openDialogue: () => setDialogueOpen(true),
    }),
    [
      mode,
      cutPhase,
      venue,
      pendingVenueId,
      cityId,
      dialogueIndex,
      dialogueOpen,
      selectDestiny,
      continueToCity,
      continueToVenue,
      enterVenue,
      openLab,
      closeLab,
      returnToCity,
      returnToPlate,
      returnToWorldMap,
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
