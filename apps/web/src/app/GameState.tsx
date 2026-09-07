import {
  manchester,
  venueById,
  type DebateMode,
  type VenueContent,
} from "@physics-chronicle/content";
import type { LabEmbedReadout } from "@physics-chronicle/debate";
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
import {
  loadProgress,
  markLabEmbedVisit as markVisitOnProgress,
  saveProgress,
  setDebateModeLast,
  type ChapterProgress,
} from "../progress";

export type DebateSessionFlag = "off" | "active";

export type GameApi = {
  mode: GameMode;
  cutPhase: CutPhase;
  chapter: typeof manchester;
  venue: VenueContent | null;
  pendingVenueId: string | null;
  cityId: string | null;
  dialogueIndex: number;
  dialogueOpen: boolean;
  /** Orthogonal to GameMode — scripted | free | hard */
  debateMode: DebateMode;
  /** Overlay flag — off | active (does not replace debateMode) */
  debateSession: DebateSessionFlag;
  progress: ChapterProgress;
  pendingLabEmbed: LabEmbedReadout | null;
  /** WorldMap → ChroniclePlate (after Manchester / city chosen). */
  selectDestiny: (venueId: string, cityId?: string) => void;
  /** ChroniclePlate → CityPage (80 Days structure). */
  continueToCity: () => void;
  /** @deprecated Prefer continueToCity; kept for call-site migration. */
  continueToVenue: () => void;
  /** CityPage → Venue dialogue (lab or lodge). Optional debate entry. */
  enterVenue: (
    venueId: string,
    opts?: { debate?: "free" | "hard" },
  ) => void;
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
  /** Enter DebateSession overlay (pauses scripted beats). */
  enterDebate: (mode: "free" | "hard") => { ok: true } | { ok: false; reason: string };
  /** Exit overlay; resume scripted beatIndex by default. */
  exitDebate: (
    action?: "resume" | "jump",
    reason?: string,
  ) => void;
  setProgress: (p: ChapterProgress) => void;
  recordLabEmbedVisit: () => void;
  setPendingLabEmbed: (r: LabEmbedReadout | null) => void;
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
  const [debateMode, setDebateMode] = useState<DebateMode>("scripted");
  const [debateSession, setDebateSession] =
    useState<DebateSessionFlag>("off");
  const [pendingDebate, setPendingDebate] = useState<"free" | "hard" | null>(
    null,
  );
  const [progress, setProgressState] = useState<ChapterProgress>(() =>
    loadProgress(),
  );
  const [pendingLabEmbed, setPendingLabEmbed] =
    useState<LabEmbedReadout | null>(null);
  const busy = useRef(false);
  /** Frozen while debateSession active — resume keeps this index. */
  const frozenBeatRef = useRef<number | null>(null);

  const setProgress = useCallback((p: ChapterProgress) => {
    setProgressState(p);
  }, []);

  // QA / screenshot deep-link:
  // ?mode=worldMap|chroniclePlate|cityPage|venue|labEmbed&venue=coupland-lab&line=0
  // &debate=free|hard
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const m = q.get("mode");
    const v = q.get("venue") || "coupland-lab";
    const lineRaw = q.get("line");
    const debateQ = q.get("debate");
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
      if (debateQ === "free" || debateQ === "hard") {
        // QA deep-link: unlock debate gates so screenshots/acceptance work
        setProgressState((prev) => {
          const next = markVisitOnProgress(prev);
          saveProgress(next);
          return next;
        });
        setPendingDebate(debateQ);
      }
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

  const clearDebate = useCallback(() => {
    setDebateMode("scripted");
    setDebateSession("off");
    setPendingDebate(null);
    frozenBeatRef.current = null;
  }, []);

  const selectDestiny = useCallback(
    (id: string, city = "manchester") => {
      clearDebate();
      cutTo("chroniclePlate", () => {
        setPendingVenueId(id);
        setCityId(city);
        setVenueId(null);
        setDialogueOpen(false);
        setDialogueIndex(0);
      });
    },
    [cutTo, clearDebate],
  );

  const continueToCity = useCallback(() => {
    clearDebate();
    cutTo("cityPage", () => {
      setVenueId(null);
      setDialogueOpen(false);
      setDialogueIndex(0);
    });
  }, [cutTo, clearDebate]);

  const continueToVenue = continueToCity;

  const enterVenue = useCallback(
    (id: string, opts?: { debate?: "free" | "hard" }) => {
      cutTo("venue", () => {
        setVenueId(id);
        setPendingVenueId(id);
        setDialogueIndex(0);
        setDialogueOpen(true);
        setDebateMode("scripted");
        setDebateSession("off");
        setPendingDebate(opts?.debate ?? null);
      });
    },
    [cutTo],
  );

  const openLab = useCallback(() => {
    cutTo("labEmbed", () => {
      /* keep venueId + dialogue + debate state */
    });
  }, [cutTo]);

  const closeLab = useCallback(() => {
    cutTo("venue", () => {
      setDialogueOpen(true);
    });
  }, [cutTo]);

  const returnToCity = useCallback(() => {
    clearDebate();
    cutTo("cityPage", () => {
      setVenueId(null);
      setDialogueOpen(false);
      setDialogueIndex(0);
    });
  }, [cutTo, clearDebate]);

  const returnToPlate = useCallback(() => {
    clearDebate();
    cutTo("chroniclePlate", () => {
      setVenueId(null);
      setDialogueOpen(false);
      setDialogueIndex(0);
    });
  }, [cutTo, clearDebate]);

  const returnToWorldMap = useCallback(() => {
    clearDebate();
    cutTo("worldMap", () => {
      setVenueId(null);
      setPendingVenueId(null);
      setCityId(null);
      setDialogueOpen(false);
      setDialogueIndex(0);
    });
  }, [cutTo, clearDebate]);

  const venue = venueId ? (venueById(manchester, venueId) ?? null) : null;

  const enterDebate = useCallback(
    (dm: "free" | "hard") => {
      if (dm === "free" && !progress.unlock.freeUnlocked) {
        return {
          ok: false as const,
          reason: "完成一次散射实验以解锁自由辩论",
        };
      }
      if (dm === "hard" && !progress.unlock.hardUnlocked) {
        return {
          ok: false as const,
          reason: "完成一次散射实验以解锁 Hard",
        };
      }
      frozenBeatRef.current = dialogueIndex;
      setDebateMode(dm);
      setDebateSession("active");
      const next = setDebateModeLast(progress, dm);
      setProgressState(next);
      saveProgress(next);
      return { ok: true as const };
    },
    [progress, dialogueIndex],
  );

  const exitDebate = useCallback(
    (_action: "resume" | "jump" = "resume", _reason?: string) => {
      if (frozenBeatRef.current != null) {
        setDialogueIndex(frozenBeatRef.current);
      }
      frozenBeatRef.current = null;
      setDebateMode("scripted");
      setDebateSession("off");
      setDialogueOpen(true);
    },
    [],
  );

  // Apply pending debate entry once venue is ready
  useEffect(() => {
    if (mode !== "venue" || !pendingDebate || !venue) return;
    const dm = pendingDebate;
    setPendingDebate(null);
    enterDebate(dm);
  }, [mode, pendingDebate, venue, enterDebate]);

  const advanceDialogue = useCallback(() => {
    if (!venue) return;
    // Pause scripted beats while DebateSession overlay is active
    if (debateSession === "active") return;
    if (dialogueIndex >= venue.dialogue.length - 1) {
      setDialogueOpen(false);
      return;
    }
    setDialogueIndex((i) => i + 1);
  }, [dialogueIndex, venue, debateSession]);

  const recordLabEmbedVisit = useCallback(() => {
    setProgressState((prev) => {
      const next = markVisitOnProgress(prev);
      saveProgress(next);
      return next;
    });
  }, []);

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
      debateMode,
      debateSession,
      progress,
      pendingLabEmbed,
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
      enterDebate,
      exitDebate,
      setProgress,
      recordLabEmbedVisit,
      setPendingLabEmbed,
    }),
    [
      mode,
      cutPhase,
      venue,
      pendingVenueId,
      cityId,
      dialogueIndex,
      dialogueOpen,
      debateMode,
      debateSession,
      progress,
      pendingLabEmbed,
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
      enterDebate,
      exitDebate,
      setProgress,
      recordLabEmbedVisit,
    ],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameApi {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
