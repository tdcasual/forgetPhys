/**
 * Visual harness for P1b screenshots — does not alter P1a rules runtime.
 * Open: /?harness=debate-ui&state=empty|filed2|persuaded
 */
import { loadCouplandDebatePack } from "@physics-chronicle/content";
import type { EvidenceBoardSnapshot, SlotFill } from "@physics-chronicle/debate";
import { useMemo } from "react";
import { ChallengeCard } from "../components/ChallengeCard";
import { DossierBoard } from "../components/DossierBoard";
import { HandRail } from "../components/HandRail";
import "../era-1909-lab.css";

type HarnessState = "empty" | "filed2" | "persuaded";

function parseState(): HarnessState {
  const q = new URLSearchParams(window.location.search);
  const s = q.get("state");
  if (s === "filed2" || s === "persuaded") return s;
  return "empty";
}

function buildSnap(
  venueId: string,
  fills: SlotFill[],
): EvidenceBoardSnapshot {
  return {
    venueId,
    fills,
    filledCount: fills.length,
    criticPassCount: fills.length >= 4 ? 1 : 0,
  };
}

export function DebateUiHarness() {
  const state = parseState();
  const pack = useMemo(() => loadCouplandDebatePack(), []);
  const hardSlots = pack.hardSlots;
  const facts = pack.facts.cards;
  const template =
    pack.criticTemplates.templates.find((t) => t.claimId === "C2") ??
    pack.criticTemplates.templates[0] ??
    null;

  const fills: SlotFill[] = useMemo(() => {
    if (state === "empty") return [];
    const two: SlotFill[] = [
      {
        slotId: "slot-forward-majority",
        factId: "fact-gm1909-forward-majority",
        source: "fact",
        turnIndex: 0,
      },
      {
        slotId: "slot-large-angle-exists",
        factId: "fact-gm1909-diffuse-reflection",
        source: "fact",
        turnIndex: 1,
      },
    ];
    if (state === "filed2") return two;
    return [
      ...two,
      {
        slotId: "slot-experimental-method",
        factId: "fact-gm1909-zns-method",
        source: "fact",
        turnIndex: 2,
      },
      {
        slotId: "slot-plum-pudding-fails",
        factId: "fact-ruth1911-plum-pudding-fails-large-angle",
        source: "fact",
        turnIndex: 3,
      },
    ];
  }, [state]);

  const snap = buildSnap(hardSlots.venue_id, fills);
  const turnBudget = hardSlots.win.suggested_turn_budget ?? 12;
  const turnsUsed = state === "empty" ? 0 : state === "filed2" ? 2 : 5;
  const terminal = state === "persuaded";

  return (
    <div
      className="debate-overlay era-1909-lab"
      style={{
        position: "fixed",
        inset: 0,
        background:
          "#1a120c url(/assets/bg/lab-coupland.png) center/cover no-repeat",
      }}
      data-harness-state={state}
    >
      <div className="debate-overlay__dim" aria-hidden />
      <div className="debate-dossier-shell">
        <header className="debate-topbar">
          <div className="debate-topbar__left">
            <span className="debate-topbar__turn">
              回合 {turnsUsed}/{turnBudget}
            </span>
            <span className="debate-topbar__target">
              说服对象: 时代主流理解
            </span>
            <span className="debate-topbar__meta">
              硬案 · 拖牌入档 · 入档 {fills.length}/{hardSlots.win.M}
            </span>
          </div>
        </header>

        <div className="debate-desk">
          <ChallengeCard template={template} visible />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.45rem",
              minWidth: 0,
            }}
          >
            <DossierBoard
              hardSlots={hardSlots}
              mode="hard"
              snap={snap}
              ghostSlots={[]}
              onSelectSlot={() => {}}
              onDropCite={() => {}}
              selectedSlotId={null}
              dropHoverSlotId={null}
              rejectSlotId={null}
              titleZh="α 散射案卷"
              facts={facts}
            />
            {terminal ? (
              <div className="debate-outcome era-outcome" role="status">
                <span className="debate-outcome__stamp">说服</span>
                <p>案卷已说服时代主流理解。</p>
              </div>
            ) : null}
          </div>
        </div>

        <HandRail
          facts={facts.slice(0, 6)}
          pendingLab={null}
          picked={null}
          onPick={() => {}}
          visible={!terminal}
          returningId={null}
        />
      </div>
    </div>
  );
}
