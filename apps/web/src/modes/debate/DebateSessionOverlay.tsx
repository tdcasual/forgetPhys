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
import { CriticToast, pickCriticTemplate, type CriticToastState } from "./CriticToast";
import { EvidenceBoardPanel } from "./EvidenceBoardPanel";
import { ProposeFillSheet } from "./ProposeFillSheet";
import { getCouplandDebateRuntime } from "./runtime";

const OUTCOME_COPY: Record<
  Exclude<JudgeOutcome, "continue">,
  string
> = {
  persuaded: "证据板已说服时代主流理解。",
  budget_exhausted: "回合（或预算）用尽，今日未能压过时代成见。",
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
  const [essay, setEssay] = useState("");
  const [lastReply, setLastReply] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<JudgeOutcome | null>(null);
  const [busy, setBusy] = useState(false);

  const debateLive =
    debateSession === "active" &&
    (debateMode === "free" || debateMode === "hard");

  /** Modal chrome only on venue (labEmbed keeps session via singleton). */
  const active = debateLive && mode === "venue" && Boolean(venue);

  const templates: CriticChallengeTemplate[] =
    runtime.pack.criticTemplates.templates;
  const facts = runtime.pack.facts.cards;
  const hardSlots = runtime.pack.hardSlots;

  const refresh = useCallback(() => {
    setSnap(runtime.session.boardSnapshot());
  }, [runtime.session]);

  /** True after session.enter for this debate episode; cleared on exit/off. */
  const episodeEnteredRef = useRef(false);

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
    refresh();

    // Opening hard: show one stance challenge toast (P1a)
    if (dm === "hard") {
      const tmpl = pickCriticTemplate(templates);
      if (tmpl) setCriticToast({ template: tmpl, shownAt: Date.now() });
    } else {
      setCriticToast(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per episode
  }, [debateLive, debateMode]);

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
      // Use session ghost via linked facts if any; also mark lab-accepting empty slots
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
      if (t) setCriticToast({ template: t, shownAt: Date.now() });
    },
    [templates],
  );

  const onSelectSlot = useCallback(
    (slot: SlotDef) => {
      if (debateMode === "free") {
        // ghost: preview linked facts as ghost slots
        setGhostSlots(runtime.session.ghostPreview(slot.linked_fact_ids));
        setProposeSlot(null);
        return;
      }
      const already = snap?.fills.some((f) => f.slotId === slot.id);
      if (already) return;
      setProposeError(null);
      setProposeSlot(slot);
    },
    [debateMode, runtime.session, snap],
  );

  const onProposeFact = useCallback(
    (factId: string) => {
      if (!proposeSlot) return;
      const verdict = runtime.session.proposeFill(proposeSlot.id, factId);
      if (!verdict.ok) {
        setProposeError(verdict.reasons.join("；"));
        return;
      }
      setProposeSlot(null);
      setProposeError(null);
      refresh();
      showCriticForSlot(proposeSlot.id);
      persistHardBoard();
      const phase = runtime.session.phase;
      if (phase === "persuaded" || phase === "budget_exhausted") {
        setOutcome(phase);
      }
    },
    [proposeSlot, runtime.session, refresh, showCriticForSlot, persistHardBoard],
  );

  const onProposeLab = useCallback(() => {
    if (!proposeSlot || !pendingLabEmbed) return;
    const verdict = runtime.session.proposeFill(proposeSlot.id, {
      labEmbed: pendingLabEmbed,
    });
    if (!verdict.ok) {
      setProposeError(verdict.reasons.join("；"));
      return;
    }
    setProposeSlot(null);
    setProposeError(null);
    refresh();
    showCriticForSlot(proposeSlot.id);
    persistHardBoard();
    const phase = runtime.session.phase;
    if (phase === "persuaded" || phase === "budget_exhausted") {
      setOutcome(phase);
    }
  }, [
    proposeSlot,
    pendingLabEmbed,
    runtime.session,
    refresh,
    showCriticForSlot,
    persistHardBoard,
  ]);

  /** Called from LabEmbed path when hard session is already active. */
  const tryFillFromLabEmbed = useCallback(
    (readout: LabEmbedReadout, slotIds: SlotId[]) => {
      if (!debateLive || debateMode !== "hard") return;
      for (const slotId of slotIds) {
        const already = runtime.session
          .boardSnapshot()
          .fills.some((f) => f.slotId === slotId);
        if (already) continue;
        const verdict = runtime.session.proposeFill(slotId, { labEmbed: readout });
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
      const detail = (ev as CustomEvent<{ readout: LabEmbedReadout; slots: SlotId[] }>)
        .detail;
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
      // Stance challenge after essay turn in hard
      if (debateMode === "hard") {
        const t = pickCriticTemplate(templates);
        if (t) setCriticToast({ template: t, shownAt: Date.now() });
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
    if (debateMode === "hard") return "Hard · 证据槽";
    if (debateMode === "free") return "自由辩论 · 预览板";
    return "常规";
  }, [debateMode]);

  if (!active) return null;

  const terminal =
    outcome === "persuaded" ||
    outcome === "budget_exhausted" ||
    outcome === "aborted";

  return (
    <div className="debate-overlay" role="dialog" aria-modal="true" aria-label="辩论会话">
      <div className="debate-overlay__dim" aria-hidden />
      <div className="debate-session parchment-panel">
        <header className="debate-session__chrome">
          <div>
            <p className="debate-session__kicker">DebateSession · {modeLabel}</p>
            <h1>Coupland · 证据对话</h1>
          </div>
          <div className="debate-session__actions">
            <button
              type="button"
              className="paper-btn ghost"
              onClick={openLab}
              title="会话保持；读数经 CriticPolicy 回填"
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
        </header>

        <div className="debate-session__body">
          <div className="debate-session__main">
            <div className="debate-dialogue-strip parchment">
              <p className="debate-dialogue-strip__name">
                {debateMode === "hard" ? "华生 · 长文反驳" : "自由发言"}
              </p>
              {lastReply ? (
                <p className="debate-dialogue-strip__text">{lastReply}</p>
              ) : (
                <p className="debate-dialogue-strip__text debate-dialogue-strip__text--muted">
                  {debateMode === "hard"
                    ? "以实验读数与事实卡反驳时代主流理解。长文 alone 不胜 — 须经 CriticPolicy + 板 fills。"
                    : "自由模式：cite 只做幽灵预览，永不写入耐久 fills。"}
                </p>
              )}
            </div>

            {debateMode === "hard" && !terminal ? (
              <div className="debate-essay">
                <textarea
                  className="debate-essay__input"
                  rows={5}
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
                    提交 essay
                  </button>
                </div>
              </div>
            ) : null}

            {terminal && outcome ? (
              <div className="debate-outcome parchment" role="status">
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

            {proposeSlot && debateMode === "hard" && !terminal ? (
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
          </div>

          <EvidenceBoardPanel
            hardSlots={hardSlots}
            mode={debateMode}
            snap={snap}
            ghostSlots={ghostSlots}
            onSelectSlot={onSelectSlot}
            selectedSlotId={proposeSlot?.id ?? null}
          />
        </div>

        <CriticToast
          toast={debateMode === "hard" ? criticToast : null}
          onDismiss={() => setCriticToast(null)}
        />
      </div>
    </div>
  );
}
