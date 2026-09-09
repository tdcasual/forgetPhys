import type {
  DialogueLine,
  Locale,
  PropLayout,
  VenueProp,
} from "@physics-chronicle/content";
import { DEFAULT_LOCALE, speakerDisplayName } from "@physics-chronicle/content";
import { DialoguePanel } from "@physics-chronicle/ui";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
  type SyntheticEvent,
} from "react";
import { useGame } from "../../app/GameState";

/**
 * Dialogue framing (G1): default L/R bust (waist-up) for BOTH lab and lodge.
 * Lit variants (G4): lab → *__lab-left, lodge → *__lodge-right.
 * Paths:
 *   Rutherford bust: /assets/chars/char-rutherford/bust/{emotion}[__lit].png
 *   Rutherford sit:  /assets/chars/char-rutherford/sit-with-chair/sit__think.png
 *   Watson stand:    /assets/chars/char-watson/outfits/{outfit}/stand__{emotion}.png
 *   Watson bust:     /assets/chars/char-watson/outfits/{outfit}/bust/...
 *   Watson sit:      /assets/chars/char-watson/outfits/{outfit}/sit-with-chair/sit__think.png
 * sit-baked requires scene-matched scale; wrong scale FAIL (chairs look like
 * giant furniture on the desk). Until art delivers room-scale sit-with-chair,
 * keep lodge on bust L/R — never place full sit sprites at bust-slot height.
 * Full-body outfit packs remain backup only (not main dialogue).
 */

const CHAR = {
  rutherford: "char-rutherford",
  watson: "char-watson",
  weiguang: "char-weiguang",
  companion: "char-companion",
  /** Legacy id only — Geiger is CUT from release dialogue; assets archived as char-geiger-ARCHIVED. */
  geiger: "char-geiger",
  thomson: "char-thomson",
  bohr: "char-bohr",
} as const;

/** Default Watson era when venue.companion.outfit / watsonOutfit omitted. */
const DEFAULT_WATSON_OUTFIT = "edwardian-1909";

/**
 * Nameplates (G7 / UI_GATE U3): primary = Ren'Py dialogue namebox.
 * Chest overlay OFF by default — never substitutes for namebox.
 */
const SHOW_NAMEPLATES = { chest: false } as const;

/** Desk occluder is NOT the final contact strategy — prefer L/R bust or sit-baked. */
const ENABLE_DESK_OCCLUDER = false;

type Emotion = "idle" | "speak" | "surprise" | "tease" | "think";
type BustEmotion = "idle" | "speak" | "think";
type LitSuffix = "lab-left" | "lodge-right";
type Framing = "bust" | "sit-baked" | "full";

type PortraitInfo = {
  charId: string;
  src: string;
  candidates: string[];
  alt: string;
  name: string;
  role: "scientist" | "companion" | "other";
  framing: Framing;
};

type VenueLayout = {
  /** Desk/table occluder height as % of stage viewport (from bottom). */
  deskOccluderPct: number;
  /** Contact line = desk top; bust bottoms sit here (same %). */
  contactLinePct: number;
  lit: LitSuffix;
  slug: string;
};

const VENUE_LAYOUT: Record<string, VenueLayout> = {
  // 方案 B: L/R bust bottoms share lower ~1/3 contact line (not CSS chair compositing)
  lab: {
    deskOccluderPct: 22,  // unused unless ENABLE_DESK_OCCLUDER
    contactLinePct: 22,
    lit: "lab-left",
    slug: "lab-coupland",
  },
  lodge: {
    deskOccluderPct: 22,
    contactLinePct: 22,
    lit: "lodge-right",
    slug: "lodge-night",
  },
};

function isCompanionChar(charId: string | null | undefined): boolean {
  return (
    charId === CHAR.watson ||
    charId === CHAR.weiguang ||
    charId === CHAR.companion
  );
}

function toBustEmotion(emotion: Emotion | string | undefined): BustEmotion {
  if (emotion === "speak" || emotion === "think") return emotion;
  return "idle";
}

function venueLayout(kind: string): VenueLayout {
  return kind === "lodge" ? VENUE_LAYOUT.lodge : VENUE_LAYOUT.lab;
}

/** Parse optional ?desk=NN override (percent) for tuning occluder height. */
function deskPctOverride(): number | null {
  try {
    const raw = new URLSearchParams(window.location.search).get("desk");
    if (raw == null || raw === "") return null;
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 8 || n > 60) return null;
    return n;
  } catch {
    return null;
  }
}

function useContactDebug(): boolean {
  return useMemo(() => {
    try {
      return new URLSearchParams(window.location.search).get("debug") === "contact";
    } catch {
      return false;
    }
  }, []);
}

function resolveWatsonOutfit(venue?: {
  companion?: { outfit?: string } | null;
  watsonOutfit?: string | null;
} | null): string {
  return (
    venue?.companion?.outfit ||
    venue?.watsonOutfit ||
    DEFAULT_WATSON_OUTFIT
  );
}

function watsonOutfitRoot(outfit: string): string {
  return `/assets/chars/${CHAR.watson}/outfits/${outfit}`;
}

function bustRoot(charId: string, outfit: string = DEFAULT_WATSON_OUTFIT): string | null {
  if (charId === CHAR.rutherford) {
    return `/assets/chars/${CHAR.rutherford}/bust`;
  }
  if (charId === CHAR.watson || charId === CHAR.weiguang) {
    return `${watsonOutfitRoot(outfit)}/bust`;
  }
  return null;
}

/** Baked person+chair pack (方案 A). Unused while preferSitBaked is off (scale FAIL). */
function sitWithChairRoot(charId: string, outfit: string = DEFAULT_WATSON_OUTFIT): string | null {
  if (charId === CHAR.rutherford) {
    return `/assets/chars/${CHAR.rutherford}/sit-with-chair`;
  }
  if (charId === CHAR.watson || charId === CHAR.weiguang) {
    return `${watsonOutfitRoot(outfit)}/sit-with-chair`;
  }
  return null;
}

function isSitPose(pose: string | null | undefined): boolean {
  return typeof pose === "string" && pose.startsWith("sit");
}

/**
 * sit-baked requires scene-matched scale; wrong scale FAIL
 * (full sit-with-chair at bust-slot height → chairs ON the desk).
 * P0: ENABLE_SIT_BAKED=false → bust L/R for all venues until art ships
 * room-scale sit packs with feet/legs on floor BELOW desk top.
 */
const ENABLE_SIT_BAKED = false;

function preferSitBaked(
  venueKind: string,
  pose?: string | null,
  emotion?: string | null,
): boolean {
  if (!ENABLE_SIT_BAKED) return false;
  if (venueKind !== "lodge") return false;
  if (isSitPose(pose)) return true;
  if (emotion === "think") return true;
  return false;
}

/** Sit-with-chair candidates, then fall back to bust chain. */
function sitBakedCandidates(
  charId: string,
  emotion: Emotion,
  lit: LitSuffix,
  outfit: string = DEFAULT_WATSON_OUTFIT,
): string[] {
  if (charId === CHAR.geiger) {
    return sitBakedCandidates(CHAR.rutherford, emotion, lit, outfit);
  }
  const urls: string[] = [];
  const root = sitWithChairRoot(charId, outfit);
  if (root) {
    // Delivered pack stem is sit__think (person+chair). Soft-fill variants.
    urls.push(`${root}/sit__think.png`);
    urls.push(`${root}/sit__${toBustEmotion(emotion)}.png`);
    urls.push(`${root}/sit__idle.png`);
  }
  // Legacy outfit-root baked names (pre sit-with-chair folder)
  if (charId === CHAR.rutherford) {
    urls.push(`/assets/chars/${CHAR.rutherford}/sit-chair__think-baked.png`);
  }
  if (isCompanionChar(charId)) {
    const era = watsonOutfitRoot(outfit);
    urls.push(`${era}/sit__think-baked.png`, `${era}/sit__think.png`);
  }
  urls.push(...bustCandidates(charId, emotion, lit, outfit));
  return [...new Set(urls.filter(Boolean))];
}

/**
 * Bust candidate chain: lit emotion → plain emotion → idle lit → idle.
 * Geiger is cut from release dialogue — remap to Rutherford so missing
 * char-geiger / char-geiger-ARCHIVED assets never break portrait load.
 * Other stubs fall back to char-root stills (no bust pack yet).
 */
function bustCandidates(
  charId: string,
  emotion: Emotion,
  lit: LitSuffix,
  outfit: string = DEFAULT_WATSON_OUTFIT,
): string[] {
  // Active cast excludes Geiger; legacy dialogue ids fall back to Rutherford.
  if (charId === CHAR.geiger) {
    return bustCandidates(CHAR.rutherford, emotion, lit, outfit);
  }
  const bust = toBustEmotion(emotion);
  const urls: string[] = [];

  // Watson: outfit stand__{emotion} first, then bust/, then legacy
  if (isCompanionChar(charId)) {
    const era = watsonOutfitRoot(outfit);
    urls.push(`${era}/stand__${emotion}.png`);
    urls.push(`${era}/stand__${emotion}__${lit}.png`);
    urls.push(`${era}/stand__${bust}.png`);
    urls.push(`${era}/stand__${bust}__${lit}.png`);
    if (emotion !== "idle") {
      urls.push(`${era}/stand__idle.png`, `${era}/stand__idle__${lit}.png`);
    }
  }

  const root = bustRoot(charId, outfit);
  if (root) {
    urls.push(`${root}/${bust}__${lit}.png`);
    urls.push(`${root}/${bust}.png`);
    if (bust !== "idle") {
      urls.push(`${root}/idle__${lit}.png`);
      urls.push(`${root}/idle.png`);
    }
    // Soft fill of delivered bust pack
    for (const e of ["idle", "speak", "think"] as const) {
      urls.push(`${root}/${e}__${lit}.png`);
      urls.push(`${root}/${e}.png`);
    }
  }

  // Char-root / legacy backup
  const charRoot = `/assets/chars/${charId}`;
  urls.push(`${charRoot}/${emotion}.png`, `${charRoot}/idle.png`);
  if (isCompanionChar(charId)) {
    urls.push(`/assets/chars/${CHAR.watson}/stand__idle.png`);
    urls.push(`/assets/chars/${CHAR.watson}/idle.png`);
  }

  if (charId === CHAR.watson) {
    for (const fb of [CHAR.weiguang, "char-weiguang-ARCHIVED"] as const) {
      urls.push(`/assets/chars/${fb}/idle.png`);
    }
  }

  return [...new Set(urls.filter(Boolean))];
}

function defaultCharForRole(role?: string): string | null {
  if (role === "scientist") return CHAR.rutherford;
  if (role === "companion") return CHAR.watson;
  return null;
}

function defaultEmotion(
  role: string | undefined,
  explicit?: Emotion,
  speaking = false,
): Emotion {
  if (explicit) return explicit;
  if (role === "scientist") return speaking ? "speak" : "idle";
  if (role === "companion") return speaking ? "speak" : "idle";
  return "idle";
}

function displayName(
  charId: string,
  locale: Locale,
  speakerFallback?: DialogueLine["speaker"],
  speakerRole?: DialogueLine["speakerRole"],
): string {
  return speakerDisplayName(
    { charId, speaker: speakerFallback, speakerRole },
    locale,
  );
}

function portraitRole(
  charId: string,
  speakerRole?: string,
): PortraitInfo["role"] {
  if (isCompanionChar(charId)) return "companion";
  if (speakerRole === "scientist" || charId === CHAR.rutherford) return "scientist";
  if (speakerRole === "companion") return "companion";
  return "other";
}

function resolvePortrait(
  line: DialogueLine | undefined,
  opts: {
    speaking: boolean;
    lit: LitSuffix;
    venueKind: string;
    outfit: string;
    locale: Locale;
    framing?: Framing;
  },
): PortraitInfo | null {
  if (!line) return null;
  let charId = line.charId ?? defaultCharForRole(line.speakerRole);
  if (!charId) return null;
  // Geiger cut from release dialogue — never require char-geiger assets.
  if (charId === CHAR.geiger) charId = CHAR.rutherford;
  const emotion = defaultEmotion(
    line.speakerRole,
    line.emotion as Emotion | undefined,
    opts.speaking,
  );
  const framing: Framing =
    opts.framing ??
    (preferSitBaked(opts.venueKind, line.pose, emotion) ? "sit-baked" : "bust");
  const candidates =
    framing === "sit-baked"
      ? sitBakedCandidates(charId, emotion, opts.lit, opts.outfit)
      : bustCandidates(charId, emotion, opts.lit, opts.outfit);
  return {
    charId,
    src: candidates[0],
    candidates,
    alt: displayName(charId, opts.locale, line.speaker, line.speakerRole),
    name: displayName(charId, opts.locale, line.speaker, line.speakerRole),
    role: portraitRole(charId, line.speakerRole),
    framing,
  };
}

/**
 * Secondary (listener) portrait — L/R bust for lab and lodge (P0).
 * sit-baked requires scene-matched scale; wrong scale FAIL — do not force
 * sit-with-chair on seatmates until room-scale art is verified.
 */
function secondaryPortrait(
  line: DialogueLine | undefined,
  venueKind: string,
  lit: LitSuffix,
  outfit: string,
  locale: Locale = DEFAULT_LOCALE,
): PortraitInfo | null {
  if (!line) return null;
  const primaryId = line.charId ?? defaultCharForRole(line.speakerRole);
  const make = (
    charId: string,
    name: string,
    role: PortraitInfo["role"],
    emotion: Emotion = "idle",
    poseHint?: string | null,
  ): PortraitInfo => {
    const framing: Framing = preferSitBaked(venueKind, poseHint, emotion)
      ? "sit-baked"
      : "bust";
    const candidates =
      framing === "sit-baked"
        ? sitBakedCandidates(charId, emotion, lit, outfit)
        : bustCandidates(charId, emotion, lit, outfit);
    return {
      charId,
      src: candidates[0],
      candidates,
      alt: name,
      name,
      role,
      framing,
    };
  };

  const ruthName = displayName(CHAR.rutherford, locale);
  const watsonName = displayName(CHAR.watson, locale);
  if (venueKind === "lodge") {
    if (isCompanionChar(primaryId)) {
      return make(CHAR.rutherford, ruthName, "scientist", "think");
    }
    // CHAR.geiger kept for legacy ids only (cut from release dialogue).
    if (primaryId === CHAR.geiger || primaryId === CHAR.rutherford) {
      return make(CHAR.watson, watsonName, "companion", "idle");
    }
  }
  if (line.speakerRole === "scientist" && !isCompanionChar(primaryId)) {
    return make(CHAR.watson, watsonName, "companion", "idle");
  }
  if (line.speakerRole === "companion") {
    return make(CHAR.rutherford, ruthName, "scientist", "idle");
  }
  if (line.speakerRole === "narrator") {
    return make(CHAR.rutherford, ruthName, "scientist", "idle");
  }
  return null;
}

function handlePortraitError(
  e: SyntheticEvent<HTMLImageElement>,
  candidates: string[],
) {
  const img = e.currentTarget;
  const idx = Number(img.dataset.candIdx || "0") + 1;
  if (idx < candidates.length) {
    img.dataset.candIdx = String(idx);
    img.src = candidates[idx];
    return;
  }
  const src = img.src;
  if (
    (src.includes("/char-watson/") || src.includes("/char-weiguang")) &&
    !img.dataset.fellCompanion
  ) {
    img.dataset.fellCompanion = "1";
    // char-companion archived; last-resort watson root idle
    img.src = `/assets/chars/${CHAR.watson}/idle.png`;
    return;
  }
  // Geiger cut from release dialogue; archived assets must not break portraits.
  if (
    (src.includes("/char-geiger") || src.includes("char-geiger-ARCHIVED")) &&
    !img.dataset.fellGeiger
  ) {
    img.dataset.fellGeiger = "1";
    img.src = `/assets/chars/${CHAR.rutherford}/idle.png`;
  }
}

function PortraitSlot({
  info,
  secondary,
  slot,
  speaking,
  wrapRef,
}: {
  info: PortraitInfo;
  secondary?: boolean;
  slot?: "left" | "right";
  speaking?: boolean;
  wrapRef?: (el: HTMLElement | null) => void;
}) {
  const roleClass =
    info.role === "companion"
      ? "venue2d-portrait-wrap--companion"
      : info.role === "scientist"
        ? "venue2d-portrait-wrap--scientist"
        : "venue2d-portrait-wrap--other";
  const slotClass = slot ? ` venue2d-portrait-wrap--${slot}` : "";
  const speakClass = speaking ? " venue2d-portrait-wrap--speaking" : "";
  const framingClass =
    info.framing === "sit-baked" ? " venue2d-portrait-wrap--sit-baked" : "";

  return (
    <figure
      ref={wrapRef}
      className={`venue2d-portrait-wrap ${roleClass}${slotClass}${speakClass}${framingClass}${secondary ? " venue2d-portrait-wrap--secondary" : ""}`}
      data-role={info.role}
      data-char={info.charId}
      data-slot={slot ?? ""}
      data-framing={info.framing}
    >
      <img
        key={info.src + (secondary ? "-sec" : "")}
        className={`venue2d-portrait${secondary ? " venue2d-portrait--secondary" : ""}`}
        src={info.src}
        alt={info.alt}
        data-cand-idx="0"
        draggable={false}
        onError={(e) => handlePortraitError(e, info.candidates)}
      />
      {SHOW_NAMEPLATES.chest ? (
        <figcaption className="venue2d-nameplate venue2d-nameplate--chest">
          {info.name}
        </figcaption>
      ) : null}
    </figure>
  );
}

type VenuePropRef = {
  id: string;
  /** Resolved stage coords [x, y] in 0–1 (from slot+propLayout or hotspot). */
  hotspot: [number, number];
  state?: string;
  label?: string;
  slot?: string;
  /** Optional scale from propLayout.slots[slot].scale */
  scale?: number;
};

type PropLayoutRef = {
  deskY: number;
  slots: Record<
    string,
    { x: number; yOffset?: number; scale?: number }
  >;
};

/**
 * Resolve prop stage position: slot + propLayout → [x, deskY+yOffset],
 * else legacy hotspot. Backward compatible when only hotspot is set.
 */
function resolvePropPlacement(
  prop: VenueProp,
  propLayout?: PropLayoutRef | PropLayout | null,
): VenuePropRef {
  const slotId = prop.slot;
  const slot =
    slotId && propLayout?.slots
      ? propLayout.slots[slotId]
      : undefined;
  if (slot && propLayout) {
    const y = propLayout.deskY + (slot.yOffset ?? 0);
    return {
      id: prop.id,
      hotspot: [slot.x, y],
      state: prop.state,
      label: prop.label,
      slot: slotId,
      scale: slot.scale,
    };
  }
  if (prop.hotspot) {
    return {
      id: prop.id,
      hotspot: prop.hotspot,
      state: prop.state,
      label: prop.label,
      slot: prop.slot,
    };
  }
  // Schema should prevent this; keep stage center fallback for resilience.
  return {
    id: prop.id,
    hotspot: [0.5, 0.5],
    state: prop.state,
    label: prop.label,
    slot: prop.slot,
  };
}

type ContactMetrics = {
  bottomDeltaPx: number;
  bottomDeltaPct: number;
  watsonScale: number;
  headY: number;
  contactY: number;
  leftX: number;
  rightX: number;
  aligned: boolean;
};

function ContactDebugOverlay({
  slug,
  rootRef,
  leftRef,
  rightRef,
  contactLinePct,
  deskPct,
  deskY,
  props: venueProps = [],
}: {
  slug: string;
  rootRef: RefObject<HTMLElement | null>;
  leftRef: RefObject<HTMLElement | null>;
  rightRef: RefObject<HTMLElement | null>;
  contactLinePct: number;
  deskPct: number;
  /** Normalized 0–1 desk surface from propLayout (when present). */
  deskY?: number | null;
  props?: VenuePropRef[];
}) {
  const [m, setM] = useState<ContactMetrics | null>(null);

  const measure = useCallback(() => {
    const root = rootRef.current;
    const left = leftRef.current;
    const right = rightRef.current;
    if (!root || !left || !right) return;
    const v = root.getBoundingClientRect();
    const L = left.getBoundingClientRect();
    const R = right.getBoundingClientRect();
    // Bust bottoms in venue space
    const leftBottomY = L.bottom - v.top;
    const rightBottomY = R.bottom - v.top;
    const delta = Math.abs(leftBottomY - rightBottomY);
    const headY = Math.min(L.top, R.top) - v.top;
    // Shared contact line + desk top (config), in venue px from top
    const contactY = v.height * (1 - contactLinePct / 100);
    const deskTopY = v.height * (1 - deskPct / 100);
    const hL = L.height;
    const hR = R.height;
    const watsonScale =
      Math.max(hL, hR) > 0 ? Math.min(hL, hR) / Math.max(hL, hR) : 0.9;
    setM({
      bottomDeltaPx: delta,
      bottomDeltaPct: v.height > 0 ? (delta / v.height) * 100 : 0,
      watsonScale,
      headY,
      contactY,
      leftX: L.left + L.width / 2 - v.left,
      rightX: R.left + R.width / 2 - v.left,
      aligned:
        delta <= 4 || (v.height > 0 && delta / v.height <= 0.08),
    });
    // stash desk top for render via dataset on root
    root.dataset.deskTopY = String(deskTopY);
  }, [rootRef, leftRef, rightRef, contactLinePct, deskPct]);

  useLayoutEffect(() => {
    measure();
    const ro = new ResizeObserver(() => measure());
    if (rootRef.current) ro.observe(rootRef.current);
    window.addEventListener("resize", measure);
    const t = window.setTimeout(measure, 120);
    const t2 = window.setTimeout(measure, 450);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      window.clearTimeout(t);
      window.clearTimeout(t2);
    };
  }, [measure, rootRef]);

  if (!m) return null;
  const deskTopY = Number(rootRef.current?.dataset.deskTopY ?? m.contactY);

  const rootTop = rootRef.current?.getBoundingClientRect().top ?? 0;
  const leftRect = leftRef.current?.getBoundingClientRect();
  const rightRect = rightRef.current?.getBoundingClientRect();
  const leftFootY = (leftRect?.bottom ?? 0) - rootTop;
  const rightFootY = (rightRect?.bottom ?? 0) - rootTop;
  const leftHipY = leftRect
    ? leftRect.top + leftRect.height * 0.55 - rootTop
    : m.contactY;
  const rightHipY = rightRect
    ? rightRect.top + rightRect.height * 0.55 - rootTop
    : m.contactY;
  // Horizon ≈ upper third of stage; seat ≈ contact / chair line
  const horizonY = (rootRef.current?.getBoundingClientRect().height ?? 0) * 0.32;
  const seatY = m.contactY;

  return (
    <div className="venue2d-debug-contact" aria-hidden>
      <svg className="venue2d-debug-contact__svg" width="100%" height="100%">
        <line
          className="venue2d-debug-contact__svg-horizon"
          x1="0"
          y1={horizonY}
          x2="100%"
          y2={horizonY}
        />
        <line
          className="venue2d-debug-contact__svg-seat"
          x1="0"
          y1={seatY}
          x2="100%"
          y2={seatY}
        />
      </svg>
      <div className="venue2d-debug-contact__label">
        <div>
          {slug} · debug=contact · G1 bottoms{" "}
          {m.aligned ? "aligned" : "MISALIGNED"}
        </div>
        <div>
          bottomΔ={m.bottomDeltaPx.toFixed(0)}px ({m.bottomDeltaPct.toFixed(1)}%
          H) watsonScale≈{m.watsonScale.toFixed(2)}
        </div>
        <div>
          horizon / seat / desk
          {deskY != null ? ` / deskY=${deskY.toFixed(2)}` : ""} / foot+hip
          xhairs
        </div>
      </div>
      <div
        className="venue2d-debug-contact__line venue2d-debug-contact__line--horizon"
        style={{ top: horizonY }}
        title="horizon"
      />
      <div
        className="venue2d-debug-contact__line venue2d-debug-contact__line--seat"
        style={{ top: seatY }}
        title="seat / contact"
      />
      <div
        className="venue2d-debug-contact__line venue2d-debug-contact__line--head"
        style={{ top: m.headY }}
      />
      <div
        className="venue2d-debug-contact__line venue2d-debug-contact__line--desk"
        style={{ top: deskTopY }}
        title="desk top"
      />
      {deskY != null && Number.isFinite(deskY) ? (
        <div
          className="venue2d-debug-contact__line venue2d-debug-contact__line--desky"
          style={{ top: `${deskY * 100}%` }}
          title={`propLayout.deskY=${deskY}`}
        />
      ) : null}
      <div
        className="venue2d-debug-contact__line venue2d-debug-contact__line--contact"
        style={{ top: m.contactY }}
      />
      <div
        className="venue2d-debug-contact__line venue2d-debug-contact__line--ground"
        style={{ top: "92%" }}
      />
      {/* Foot crosshairs */}
      <div
        className="venue2d-debug-contact__xhair venue2d-debug-contact__xhair--left venue2d-debug-contact__xhair--foot"
        style={{ left: m.leftX, top: leftFootY }}
        title="left foot"
      />
      <div
        className="venue2d-debug-contact__xhair venue2d-debug-contact__xhair--right venue2d-debug-contact__xhair--foot"
        style={{ left: m.rightX, top: rightFootY }}
        title="right foot"
      />
      {/* Hip crosshairs */}
      <div
        className="venue2d-debug-contact__xhair venue2d-debug-contact__xhair--left venue2d-debug-contact__xhair--hip"
        style={{ left: m.leftX, top: leftHipY }}
        title="left hip"
      />
      <div
        className="venue2d-debug-contact__xhair venue2d-debug-contact__xhair--right venue2d-debug-contact__xhair--hip"
        style={{ left: m.rightX, top: rightHipY }}
        title="right hip"
      />
      {/* Prop hotspot crosshairs + ids (I6) */}
      {venueProps.map((prop) => {
        const [hx, hy] = prop.hotspot;
        return (
          <div
            key={`prop-xhair-${prop.id}`}
            className="venue2d-debug-contact__xhair venue2d-debug-contact__xhair--prop"
            style={{ left: `${hx * 100}%`, top: `${hy * 100}%` }}
            title={prop.id}
          >
            <span className="venue2d-debug-contact__prop-id">{prop.id}</span>
          </div>
        );
      })}
    </div>
  );
}


function propAssetCandidates(prop: VenuePropRef): string[] {
  const root = `/assets/props/${prop.id}`;
  const urls: string[] = [];
  if (prop.state) {
    urls.push(`${root}/states/${prop.state}.png`);
  }
  urls.push(`${root}/final.png`, `${root}/idle.png`);
  return urls;
}

const PROP_LABELS: Record<string, string> = {
  "znS-scintillation-screen-1909": "硫化锌闪烁屏",
  "alpha-source-geometry-1909": "α 放射源",
  "gold-foil-stage": "金箔靶台",
};

/** Humanize prop id when schema label omitted. */
function humanizePropId(id: string): string {
  if (PROP_LABELS[id]) return PROP_LABELS[id];
  return id
    .replace(/-\d{4}$/, "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .replace(/\bzns\b/gi, "ZnS")
    .replace(/\balpha\b/gi, "α")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function PropLayers({
  props,
  selectedId,
  onSelect,
}: {
  props: VenuePropRef[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  if (!props.length) return null;
  return (
    <div className="venue2d-props">
      {props.map((prop) => {
        const [hx, hy] = prop.hotspot;
        const candidates = propAssetCandidates(prop);
        const label = prop.label ?? humanizePropId(prop.id);
        const selected = selectedId === prop.id;
        return (
          <button
            key={prop.id}
            type="button"
            className={`venue2d-prop${selected ? " venue2d-prop--selected" : ""}`}
            data-prop={prop.id}
            data-state={prop.state ?? "final"}
            aria-label={label}
            aria-pressed={selected}
            style={
              {
                left: `${hx * 100}%`,
                top: `${hy * 100}%`,
                "--prop-scale": prop.scale != null ? String(prop.scale) : "1",
              } as CSSProperties
            }
            onClick={(e) => {
              e.stopPropagation();
              onSelect(selected ? null : prop.id);
            }}
          >
            <img
              className="venue2d-prop-img"
              src={candidates[0]}
              alt=""
              draggable={false}
              data-cand-idx="0"
              onError={(e) => {
                const img = e.currentTarget;
                const idx = Number(img.dataset.candIdx || "0") + 1;
                if (idx < candidates.length) {
                  img.dataset.candIdx = String(idx);
                  img.src = candidates[idx];
                } else {
                  img.style.display = "none";
                }
              }}
            />
            {selected ? (
              <span className="venue2d-prop-label" role="status">
                {label}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export function Venue2D() {
  const {
    mode,
    venue,
    dialogueIndex,
    dialogueOpen,
    advanceDialogue,
    openDialogue,
    openLab,
    returnToCity,
    returnToPlate,
    returnToWorldMap,
    enterDebate,
    progress,
    debateSession,
    setLocale,
  } = useGame();
  const locale: Locale = progress.settings?.locale ?? DEFAULT_LOCALE;
  const [debateLockHint, setDebateLockHint] = useState<string | null>(null);

  const debugContact = useContactDebug();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const leftWrapRef = useRef<HTMLElement | null>(null);
  const rightWrapRef = useRef<HTMLElement | null>(null);

  const [menuOpen, setMenuOpen] = useState(() => {
    try {
      return new URLSearchParams(window.location.search).get("nav") === "1";
    } catch {
      return false;
    }
  });
  const [selectedPropId, setSelectedPropId] = useState<string | null>(null);

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const onSelectProp = useCallback((id: string | null) => {
    setSelectedPropId(id);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") {
        ev.preventDefault();
        closeMenu();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen, closeMenu]);

  if (mode !== "venue" || !venue) return null;

  const layout = venueLayout(venue.kind);
  const deskOverride = deskPctOverride();
  const deskPct = deskOverride ?? layout.deskOccluderPct;
  // Contact sits just above desk top; when ?desk= overrides, keep ~3pp sink into wood
  const contactPct =
    deskOverride != null
      ? Math.max(8, deskOverride - 3)
      : layout.contactLinePct;
  const lit = layout.lit;
  const line = venue.dialogue[dialogueIndex];
  const watsonOutfit = resolveWatsonOutfit(venue);
  const propLayout = venue.propLayout;
  const venueProps: VenuePropRef[] = Array.isArray(venue.props)
    ? venue.props.map((p) => resolvePropPlacement(p, propLayout ?? null))
    : [];

  const primary = dialogueOpen
    ? resolvePortrait(line, {
        speaking: true,
        lit,
        venueKind: venue.kind,
        outfit: watsonOutfit,
        locale,
      })
    : {
        charId: CHAR.rutherford,
        src: bustCandidates(CHAR.rutherford, "idle", lit, watsonOutfit)[0],
        candidates: bustCandidates(CHAR.rutherford, "idle", lit, watsonOutfit),
        alt: displayName(CHAR.rutherford, locale),
        name: displayName(CHAR.rutherford, locale),
        role: "scientist" as const,
        framing: "bust" as const,
      };

  const secondary = dialogueOpen
    ? secondaryPortrait(line, venue.kind, lit, watsonOutfit, locale)
    : {
        charId: CHAR.watson,
        src: bustCandidates(CHAR.watson, "idle", lit, watsonOutfit)[0],
        candidates: bustCandidates(CHAR.watson, "idle", lit, watsonOutfit),
        alt: displayName(CHAR.watson, locale),
        name: displayName(CHAR.watson, locale),
        role: "companion" as const,
        framing: "bust" as const,
      };

  // Left = scientist-ish, right = companion-ish for debug crosshairs
  const leftInfo =
    primary?.role === "companion" && secondary ? secondary : primary;
  const rightInfo =
    primary?.role === "companion" && secondary ? primary : secondary;

  const canOpenLab = Boolean(venue.labEmbed) || venue.labId === "mc-scattering";
  const placeCaption = `${venue.place} · ${venue.years}`;
  const bgUrl = venueBgUrl(venue);

  const stageStyle = {
    "--desk-occluder-h": `${deskPct}%`,
    "--contact-line": `${contactPct}%`,
  } as CSSProperties;

  return (
    <div
      ref={rootRef}
      className={`venue2d venue2d--${venue.kind}${debugContact ? " venue2d--debug-contact" : ""}${debateSession === "active" ? " venue2d--debate-dim" : ""}`}
      role="main"
      aria-label={venue.name}
      data-emotion={line?.emotion ?? "idle"}
      data-pose={line?.pose ?? ""}
      data-char={line?.charId ?? ""}
      data-line={line?.id ?? ""}
      data-framing={primary?.framing ?? "bust"}
      data-lit={lit}
      data-outfit={watsonOutfit}
      style={stageStyle}
    >
      <div className="venue2d-bg" aria-hidden>
        <img
          className="venue2d-bg-img"
          src={bgUrl}
          alt=""
          draggable={false}
        />
      </div>

      {/* Independent prop layers (not baked into bg) — desk instruments */}
      {venue.kind === "lab" || venueProps.length > 0 ? (
        <PropLayers
          props={venueProps}
          selectedId={selectedPropId}
          onSelect={onSelectProp}
        />
      ) : null}

      <div className="venue2d-nav">
        <button
          type="button"
          className="venue2d-nav-toggle"
          aria-label="场所菜单"
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          onClick={() => setMenuOpen((o) => !o)}
        >
          ⋯
        </button>
        {menuOpen ? (
          <div className="venue2d-nav-menu parchment" role="menu">
            <button
              type="button"
              role="menuitem"
              className="venue2d-nav-item"
              onClick={() => {
                closeMenu();
                returnToCity();
              }}
            >
              城市页
            </button>
            <button
              type="button"
              role="menuitem"
              className="venue2d-nav-item"
              onClick={() => {
                closeMenu();
                returnToPlate();
              }}
            >
              图志
            </button>
            <button
              type="button"
              role="menuitem"
              className="venue2d-nav-item"
              onClick={() => {
                closeMenu();
                returnToWorldMap();
              }}
            >
              地图
            </button>
            <hr className="venue2d-nav-sep" />
            <button
              type="button"
              role="menuitem"
              className="venue2d-nav-item"
              disabled={debateSession === "active"}
              onClick={() => {
                const r = enterDebate("free");
                if (!r.ok) {
                  setDebateLockHint(r.reason);
                  return;
                }
                setDebateLockHint(null);
                closeMenu();
              }}
            >
              辩论 · 自由 {progress.unlock.freeUnlocked ? "✓" : "🔒"}
            </button>
            <button
              type="button"
              role="menuitem"
              className="venue2d-nav-item"
              disabled={debateSession === "active"}
              onClick={() => {
                const r = enterDebate("hard");
                if (!r.ok) {
                  setDebateLockHint(r.reason);
                  return;
                }
                setDebateLockHint(null);
                closeMenu();
              }}
            >
              辩论 · Hard {progress.unlock.hardUnlocked ? "✓" : "🔒"}
            </button>
            {debateLockHint ? (
              <p className="venue2d-nav-hint" role="status">
                {debateLockHint}
              </p>
            ) : null}
            <hr className="venue2d-nav-sep" />
            <div className="venue2d-locale" role="group" aria-label="Locale">
              <span className="venue2d-locale__label">
                {locale === "zh-Hans" ? "语言" : "Locale"}
              </span>
              <button
                type="button"
                role="menuitem"
                className={`venue2d-nav-item venue2d-locale__btn${locale === "en" ? " venue2d-locale__btn--on" : ""}`}
                aria-pressed={locale === "en"}
                onClick={() => setLocale("en")}
              >
                EN
              </button>
              <button
                type="button"
                role="menuitem"
                className={`venue2d-nav-item venue2d-locale__btn${locale === "zh-Hans" ? " venue2d-locale__btn--on" : ""}`}
                aria-pressed={locale === "zh-Hans"}
                onClick={() => setLocale("zh-Hans")}
              >
                中文
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="venue2d-stage venue2d-stage--lr" ref={stageRef}>
        {leftInfo ? (
          <PortraitSlot
            info={leftInfo}
            slot="left"
            speaking={primary != null && leftInfo.charId === primary.charId}
            secondary={leftInfo !== primary}
            wrapRef={(el) => {
              leftWrapRef.current = el;
            }}
          />
        ) : (
          <div className="venue2d-portrait venue2d-portrait--empty" aria-hidden />
        )}
        {rightInfo ? (
          <PortraitSlot
            info={rightInfo}
            slot="right"
            speaking={primary != null && rightInfo.charId === primary.charId}
            secondary={rightInfo !== primary}
            wrapRef={(el) => {
              rightWrapRef.current = el;
            }}
          />
        ) : null}
      </div>

      {/* Desk occluder optional only — not final G2 strategy (see SPRITE_PIPELINE_REVISED) */}
      {ENABLE_DESK_OCCLUDER ? (
        <div className="venue2d-desk-occluder" aria-hidden>
          <img
            className="venue2d-desk-occluder-img"
            src={bgUrl}
            alt=""
            draggable={false}
          />
          <div className="venue2d-desk-occluder-shade" />
        </div>
      ) : null}

      {debugContact ? (
        <ContactDebugOverlay
          slug={layout.slug}
          rootRef={rootRef}
          leftRef={leftWrapRef}
          rightRef={rightWrapRef}
          contactLinePct={contactPct}
          deskPct={deskPct}
          deskY={propLayout?.deskY ?? null}
          props={venueProps}
        />
      ) : null}

      {dialogueOpen && line ? (
        <div className="venue2d-dialogue">
          <p className="venue2d-place-caption">{placeCaption}</p>
          <DialoguePanel
            line={line}
            locale={locale}
            onAdvance={
              debateSession === "active" ? () => undefined : advanceDialogue
            }
            isLast={dialogueIndex >= venue.dialogue.length - 1}
          />
        </div>
      ) : (
        <div className="venue2d-actions">
          <p className="venue2d-place-caption venue2d-place-caption--solo">
            {placeCaption}
          </p>
          <button type="button" className="paper-btn" onClick={openDialogue}>
            继续对话
          </button>
          {canOpenLab ? (
            <button type="button" className="paper-btn" onClick={openLab}>
              去实验台
            </button>
          ) : null}
        </div>
      )}

      {dialogueOpen && canOpenLab ? (
        <div className="venue2d-lab-cta">
          <button type="button" className="paper-btn" onClick={openLab}>
            去实验台 · Infinitas
          </button>
        </div>
      ) : null}

    </div>
  );
}

/** Scene backdrop from venue kind / id (lab vs lodge night). */
function venueBgUrl(venue: { id: string; kind: string }): string {
  const id = venue.id.toLowerCase();
  const kind = venue.kind.toLowerCase();
  if (kind === "lodge" || id.includes("lodge")) {
    return "/assets/bg/lodge-night.png";
  }
  return "/assets/bg/lab-coupland.png";
}
