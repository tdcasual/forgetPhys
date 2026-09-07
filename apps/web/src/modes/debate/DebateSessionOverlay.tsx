import {
  type CriticChallengeTemplate,
  type SlotDef,
} from "@physics-chronicle/content";
import type {
  EvidenceBoardSnapshot,
  JudgeOutcome,
  LabEmbedReadout,
  SlotId,
} from "@physics-chronicle/debate";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useGame } from "../../app/GameState";
import {
  getVenueBoard,
  saveProgress,
  saveVenueFills,
  setDebateModeLast,
} from "../../progress";
import { ChallengeCard } from "./components/ChallengeCard";
import { DossierBoard } from "./components/DossierBoard";
import {
  decodeHandCite,
  HandRail,
  type HandCite,
} from "./components/HandRail";
import { CriticToast, pickCriticTemplate, type CriticToastState } from "./CriticToast";
import { ProposeFillSheet } from "./ProposeFillSheet";
import { getCouplandDebateRuntime } from "./runtime";
import "./era-1909-lab.css";

const OUTCOME_COPY: Record<
  Exclude<JudgeOutcome, "continue">,
  string
> = {
  persuaded: "案卷已说服时代主流理解。",
  budget_exhausted: "回合用尽，今日未能压过时代成见。",
  aborted: "辩论中止。",
};

export function DebateSessionOverlay() {
  const {
    mode,
    venue,
    debateMode,
    debateSession,
    exitDebate,
    progress,
    setProgress,
    pendingLabEmbed,
    setPendingLabEmbed,
    openLab,
  } = useGame();

  const runtime = getCouplandDebateRuntime();

  const [snap, setSnap] = useState<EvidenceBoardSnapshot | null>(null);
  const [ghostSlots, setGhostSlots] = useState<SlotId[]>([]);
  const [proposeSlot, setProposeSlot] = useState<SlotDef | null>(null);
  const [proposeError, setProposeError] = useState<string | null>(null);
  const [criticToast, setCriticToast] = useState<CriticToastState | null>(null);
  const [challenge, setChallenge] = useState<CriticChallengeTemplate | null>(
    null,
  );
  const [essay, setEssay] = useState("");
  const [lastReply, setLastReply] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<JudgeOutcome | null>(null);
  const [busy, setBusy] = useState(false);
  const [picked, setPicked] = useState<HandCite | null>(null);
  const [dropHoverSlotId, setDropHoverSlotId] = useState<string | null>(null);
  const [rejectSlotId, setRejectSlotId] = useState<string | null>(null);
  const [returningId, setReturningId] = useState<string | null>(null);
  const [turnsUsed, setTurnsUsed] = useState(0);
  const rejectTimer = useRef<number | null>(null);

  const debateLive =
    debateSession === "active" &&
    (debateMode === "free" || debateMode === "hard");

  /** Modal chrome only on venue (labEmbed keeps session via singleton). */
  const active = debateLive && mode === "venue" && Boolean(venue);

  const templates: CriticChallengeTemplate[] =
    runtime.pack.criticTemplates.templates;
  const facts = runtime.pack.facts.cards;
  const hardSlots = runtime.pack.hardSlots;
  const turnBudget =
    hardSlots.win.suggested_turn_budget ?? 12;

  const refresh = useCallback(() => {
    setSnap(runtime.session.boardSnapshot());
  }, [runtime.session]);

  /** True after session.enter for this debate episode; cleared on exit/off. */
  const episodeEnteredRef = useRef(false);

  const flashReject = useCallback((slotId: string, citeKey: string) => {
    setRejectSlotId(slotId);
    setReturningId(citeKey);
    if (rejectTimer.current) window.clearTimeout(rejectTimer.current);
    rejectTimer.current = window.setTimeout(() => {
      setRejectSlotId(null);
      setReturningId(null);
    }, 700);
  }, []);

  // Enter once per debate episode (survives venue↔labEmbed without reset)
  useEffect(() => {
    if (!debateLive) {
      episodeEnteredRef.current = false;
      return;
    }
    if (episodeEnteredRef.current) {
      refresh();
      return;
    }
    episodeEnteredRef.current = true;
    const dm = debateMode as "free" | "hard";
    runtime.session.enter(dm, {
      venueId: runtime.venueId,
      mode: dm,
      hardSlots,
    });

    // Restore durable fills for hard from progress
    if (dm === "hard") {
      const saved = getVenueBoard(progress, runtime.venueId);
      if (saved) {
        for (const [slotId, fill] of Object.entries(saved.fills)) {
          if (fill.cite[0]) {
            runtime.session.proposeFill(slotId, fill.cite[0]);
          } else if (fill.source === "labEmbed") {
            const base = {
              kind: (fill.kind ?? "alpha_scatter_summary") as string,
              ...(fill.measurement ?? {}),
            };
            // Minimal valid readout if measurement was not persisted
            if (slotId === "slot-large-angle-exists") {
              if (base.angle_deg == null && base.large_angle_count == null) {
                base.large_angle_count = 1;
                base.angle_deg = 150;
              }
            }
            if (slotId === "slot-forward-majority") {
              if (base.fraction_forward == null) {
                base.fraction_forward = 0.999;
              }
            }
            runtime.session.proposeFill(slotId, { labEmbed: base });
          }
        }
      }
    }

    setOutcome(null);
    setLastReply(null);
    setProposeSlot(null);
    setProposeError(null);
    setEssay("");
    setPicked(null);
    setTurnsUsed(0);
    refresh();

    // Opening hard: challenge card + demoted toast (P1a)
    if (dm === "hard") {
      const tmpl = pickCriticTemplate(templates);
      if (tmpl) {
        setChallenge(tmpl);
        setCriticToast({ template: tmpl, shownAt: Date.now() });
      }
    } else {
      setChallenge(null);
      setCriticToast(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per episode
  }, [debateLive, debateMode]);

  useEffect(() => {
    return () => {
      if (rejectTimer.current) window.clearTimeout(rejectTimer.current);
    };
  }, []);

  // Ghost preview from pending lab in free mode
  useEffect(() => {
    if (!active || debateMode !== "free") {
      setGhostSlots([]);
      return;
    }
    if (pendingLabEmbed) {
      const cites = hardSlots.slots
        .filter((s) => s.accepts_lab_embed)
        .map((s) => s.id);
      const fromFacts = runtime.session.ghostPreview([]);
      setGhostSlots([...new Set([...fromFacts, ...cites])]);
    } else {
      setGhostSlots(runtime.session.ghostPreview([]));
    }
  }, [active, debateMode, pendingLabEmbed, hardSlots, runtime.session]);

  const persistHardBoard = useCallback(() => {
    if (debateMode !== "hard") return;
    const board = runtime.session.boardSnapshot();
    const measurements: Record<string, Partial<LabEmbedReadout>> = {};
    if (pendingLabEmbed) {
      for (const f of board.fills) {
        if (f.source === "labEmbed") {
          measurements[f.slotId] = {
            angle_deg: pendingLabEmbed.angle_deg,
            fraction_forward: pendingLabEmbed.fraction_forward,
            large_angle_count: pendingLabEmbed.large_angle_count,
          };
        }
      }
    }
    const next = setDebateModeLast(
      saveVenueFills(
        progress,
        runtime.venueId,
        board.fills,
        board.criticPassCount,
        measurements,
      ),
      "hard",
    );
    setProgress(next);
    saveProgress(next);
  }, [debateMode, progress, runtime, setProgress, pendingLabEmbed]);

  const showCriticForSlot = useCallback(
    (slotId: string) => {
      const t = pickCriticTemplate(templates, slotId);
      if (t) {
        setChallenge(t);
        setCriticToast({ template: t, shownAt: Date.now() });
      }
    },
    [templates],
  );

  const applyCiteToSlot = useCallback(
    (slot: SlotDef, cite: HandCite): boolean => {
      if (debateMode !== "hard") return false;
      const already = snap?.fills.some((f) => f.slotId === slot.id);
      if (already) return false;

      let verdict;
      const citeKey = cite.kind === "lab" ? "lab" : cite.factId;
      if (cite.kind === "lab") {
        if (!pendingLabEmbed) {
          setProposeError("尚无实验读数 — 先去实验台。");
          flashReject(slot.id, citeKey);
          return false;
        }
        verdict = runtime.session.proposeFill(slot.id, {
          labEmbed: pendingLabEmbed,
        });
      } else {
        verdict = runtime.session.proposeFill(slot.id, cite.factId);
      }

      if (!verdict.ok) {
        setProposeError(verdict.reasons.join("；"));
        flashReject(slot.id, citeKey);
        return false;
      }

      setProposeSlot(null);
      setProposeError(null);
      setPicked(null);
      refresh();
      showCriticForSlot(slot.id);
      persistHardBoard();
      const phase = runtime.session.phase;
      if (phase === "persuaded" || phase === "budget_exhausted") {
        setOutcome(phase);
      }
      return true;
    },
    [
      debateMode,
      snap,
      pendingLabEmbed,
      runtime.session,
      flashReject,
      refresh,
      showCriticForSlot,
      persistHardBoard,
    ],
  );

  const onSelectSlot = useCallback(
    (slot: SlotDef) => {
      if (debateMode === "free") {
        setGhostSlots(runtime.session.ghostPreview(slot.linked_fact_ids));
        setProposeSlot(null);
        return;
      }
      const already = snap?.fills.some((f) => f.slotId === slot.id);
      if (already) return;

      // Click-pick → click-slot fallback
      if (picked) {
        applyCiteToSlot(slot, picked);
        return;
      }

      setProposeError(null);
      setProposeSlot(slot);
    },
    [debateMode, runtime.session, snap, picked, applyCiteToSlot],
  );

  const onDropCite = useCallback(
    (slot: SlotDef, payload: string) => {
      setDropHoverSlotId(null);
      const cite = decodeHandCite(payload);
      if (!cite) return;
      applyCiteToSlot(slot, cite);
    },
    [applyCiteToSlot],
  );

  const onProposeFact = useCallback(
    (factId: string) => {
      if (!proposeSlot) return;
      applyCiteToSlot(proposeSlot, { kind: "fact", factId });
    },
    [proposeSlot, applyCiteToSlot],
  );

  const onProposeLab = useCallback(() => {
    if (!proposeSlot) return;
    applyCiteToSlot(proposeSlot, { kind: "lab" });
  }, [proposeSlot, applyCiteToSlot]);

  /** Called from LabEmbed path when hard session is already active. */
  const tryFillFromLabEmbed = useCallback(
    (readout: LabEmbedReadout, slotIds: SlotId[]) => {
      if (!debateLive || debateMode !== "hard") return;
      for (const slotId of slotIds) {
        const already = runtime.session
          .boardSnapshot()
          .fills.some((f) => f.slotId === slotId);
        if (already) continue;
        const verdict = runtime.session.proposeFill(slotId, {
          labEmbed: readout,
        });
        if (verdict.ok) {
          showCriticForSlot(slotId);
        }
      }
      refresh();
      persistHardBoard();
      const phase = runtime.session.phase;
      if (phase === "persuaded" || phase === "budget_exhausted") {
        setOutcome(phase);
      }
    },
    [
      debateLive,
      debateMode,
      runtime.session,
      refresh,
      persistHardBoard,
      showCriticForSlot,
    ],
  );

  // LabEmbed → session fill/ghost (works while iframe open; session is singleton)
  useEffect(() => {
    const handler = (ev: Event) => {
      const detail = (
        ev as CustomEvent<{ readout: LabEmbedReadout; slots: SlotId[] }>
      ).detail;
      if (!detail?.readout || !detail.slots) return;
      setPendingLabEmbed(detail.readout);
      if (!debateLive) return;
      if (debateMode === "free") {
        setGhostSlots(detail.slots);
        return;
      }
      tryFillFromLabEmbed(detail.readout, detail.slots);
    };
    window.addEventListener("forgetphys:labEmbed-fill", handler);
    return () => window.removeEventListener("forgetphys:labEmbed-fill", handler);
  }, [tryFillFromLabEmbed, debateMode, debateLive, setPendingLabEmbed]);

  const onSubmitEssay = useCallback(async () => {
    if (!essay.trim() || busy) return;
    setBusy(true);
    try {
      const result = await runtime.session.submitUserTurn(essay.trim(), {
        essay: true,
      });
      setTurnsUsed((n) => n + 1);
      setLastReply(result.reply.text || "（P1a stub · 无 live LLM）");
      if (result.reply.cite.length && debateMode === "free") {
        setGhostSlots(runtime.session.ghostPreview(result.reply.cite));
      }
      refresh();
      if (result.outcome !== "continue") {
        setOutcome(result.outcome);
        if (result.outcome === "persuaded" || debateMode === "hard") {
          persistHardBoard();
        }
      }
      if (debateMode === "hard") {
        const t = pickCriticTemplate(templates);
        if (t) {
          setChallenge(t);
          setCriticToast({ template: t, shownAt: Date.now() });
        }
      }
    } finally {
      setBusy(false);
    }
  }, [
    essay,
    busy,
    runtime.session,
    debateMode,
    refresh,
    persistHardBoard,
    templates,
  ]);

  const onExit = useCallback(
    (action: "resume" | "jump", reason?: JudgeOutcome) => {
      if (debateMode === "hard") persistHardBoard();
      episodeEnteredRef.current = false;
      runtime.session.exit(action);
      const next = setDebateModeLast(progress, "scripted");
      setProgress(next);
      saveProgress(next);
      setOutcome(null);
      setCriticToast(null);
      setChallenge(null);
      setPicked(null);
      exitDebate(action, reason && reason !== "continue" ? reason : undefined);
    },
    [
      debateMode,
      persistHardBoard,
      runtime.session,
      progress,
      setProgress,
      exitDebate,
    ],
  );

  const modeLabel = useMemo(() => {
    if (debateMode === "hard") return "硬案 · 拖牌入档";
    if (debateMode === "free") return "自由 · 案卷预览";
    return "常规";
  }, [debateMode]);

  // Track drop hover via document-level dragover on slots (set in board via class).
  // Lightweight: clear hover when drag ends.
  useEffect(() => {
    const clear = () => setDropHoverSlotId(null);
    window.addEventListener("dragend", clear);
    return () => window.removeEventListener("dragend", clear);
  }, []);

  if (!active) return null;

  const terminal =
    outcome === "persuaded" ||
    outcome === "budget_exhausted" ||
    outcome === "aborted";

  const filed = snap?.fills.length ?? 0;

  return (
    <div
      className="debate-overlay era-1909-lab"
      role="dialog"
      aria-modal="true"
      aria-label="α散射案卷辩论"
    >
      <div className="debate-overlay__dim" aria-hidden />
      <div className="debate-dossier-shell">
        <header className="debate-topbar">
          <div className="debate-topbar__left">
            <span className="debate-topbar__turn">
              回合 {Math.min(turnsUsed, turnBudget)}/{turnBudget}
            </span>
            <span className="debate-topbar__target">
              说服对象: 时代主流理解
            </span>
            <span className="debate-topbar__meta">
              {modeLabel}
              {debateMode === "hard" ? ` · 入档 ${filed}/${hardSlots.win.M}` : ""}
            </span>
          </div>
          <div className="debate-topbar__right">
            <div className="debate-topbar__actions">
              <button
                type="button"
                className="paper-btn ghost"
                onClick={openLab}
                title="会话保持；读数经质疑规则回填"
              >
                去实验台
              </button>
              <button
                type="button"
                className="paper-btn"
                onClick={() => onExit("resume", "aborted")}
              >
                退出 · 恢复剧本
              </button>
            </div>
          </div>
        </header>

        <div className="debate-desk">
          <ChallengeCard
            template={challenge}
            visible={debateMode === "hard"}
          />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.45rem",
              minWidth: 0,
              minHeight: 0,
            }}
          >
            <DossierBoard
              hardSlots={hardSlots}
              mode={debateMode}
              snap={snap}
              ghostSlots={ghostSlots}
              onSelectSlot={onSelectSlot}
              onDropCite={onDropCite}
              selectedSlotId={proposeSlot?.id ?? null}
              dropHoverSlotId={dropHoverSlotId}
              rejectSlotId={rejectSlotId}
              titleZh="α 散射案卷"
            />

            <div className="debate-dossier-extras">
              {lastReply ? (
                <div className="debate-dialogue-strip parchment">
                  <p className="debate-dialogue-strip__name">华生 · 回声</p>
                  <p className="debate-dialogue-strip__text">{lastReply}</p>
                </div>
              ) : null}

              {debateMode === "hard" && !terminal ? (
                <div className="debate-essay debate-essay--compact">
                  <textarea
                    className="debate-essay__input"
                    rows={3}
                    value={essay}
                    placeholder="以实验读数与事实卡反驳时代主流理解…"
                    onChange={(e) => setEssay(e.target.value)}
                  />
                  <div className="debate-essay__actions">
                    <button
                      type="button"
                      className="paper-btn"
                      disabled={busy || !essay.trim()}
                      onClick={() => void onSubmitEssay()}
                    >
                      提交长文
                    </button>
                  </div>
                </div>
              ) : null}

              {terminal && outcome ? (
                <div className="debate-outcome era-outcome" role="status">
                  {outcome === "persuaded" ? (
                    <span className="debate-outcome__stamp">说服</span>
                  ) : null}
                  <p>{OUTCOME_COPY[outcome]}</p>
                  <button
                    type="button"
                    className="paper-btn"
                    onClick={() => onExit("resume", outcome)}
                  >
                    关闭并恢复剧本
                  </button>
                </div>
              ) : null}

              {proposeSlot && debateMode === "hard" && !terminal && !picked ? (
                <ProposeFillSheet
                  slot={proposeSlot}
                  facts={facts}
                  pendingLab={pendingLabEmbed}
                  acceptsLab={proposeSlot.accepts_lab_embed}
                  onCancel={() => {
                    setProposeSlot(null);
                    setProposeError(null);
                  }}
                  onProposeFact={onProposeFact}
                  onProposeLab={onProposeLab}
                  lastError={proposeError}
                />
              ) : null}

              {proposeError && !proposeSlot ? (
                <p className="debate-propose__error" role="alert">
                  {proposeError}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <HandRail
          facts={facts}
          pendingLab={pendingLabEmbed}
          picked={picked}
          onPick={(c) => {
            setPicked(c);
            setProposeSlot(null);
            setProposeError(null);
          }}
          visible={debateMode === "hard" && !terminal}
          returningId={returningId}
        />

        <CriticToast
          toast={debateMode === "hard" ? criticToast : null}
          onDismiss={() => setCriticToast(null)}
          demoted
        />
      </div>
    </div>
  );
}
