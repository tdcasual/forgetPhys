import { useEffect, useState } from "react";
import {
  manchesterExitQuiz,
  resolveLocalized,
  type Locale,
} from "@physics-chronicle/content";
import { useGame } from "../../app/GameState";
import { ExitQuizOverlay } from "../../quiz";

export function CityPage() {
  const {
    mode,
    chapter,
    enterVenue,
    returnToWorldMap,
    returnToPlate,
    progress,
    setLocale,
    markQuizPassed,
    markTeaserSeen,
  } = useGame();
  const [debatePick, setDebatePick] = useState<"scripted" | "free" | "hard">(
    "scripted",
  );
  const [lockHint, setLockHint] = useState<string | null>(null);
  const [quizOpen, setQuizOpen] = useState(false);

  const freeOk = progress.unlock.freeUnlocked;
  const hardOk = progress.unlock.hardUnlocked;
  const lodgeComplete = Boolean(progress.unlock.lodgeComplete);
  const quizPassed = Boolean(progress.unlock.quizPassed);
  const locale: Locale = progress.settings?.locale ?? "en";

  // Soft: lodge alone can show teaser; quiz pass also unlocks preview.
  const showTeaser = lodgeComplete || quizPassed;
  const teaser = manchesterExitQuiz.teaser;

  useEffect(() => {
    if (mode !== "cityPage" || !showTeaser) return;
    if (progress.unlock.teaserSeen) return;
    markTeaserSeen();
  }, [mode, showTeaser, progress.unlock.teaserSeen, markTeaserSeen]);

  if (mode !== "cityPage") return null;

  const enterLab = () => {
    setLockHint(null);
    if (debatePick === "free" && !freeOk) {
      setLockHint(
        locale === "en"
          ? "Finish one scattering run to unlock free debate"
          : "完成一次散射实验以解锁自由辩论",
      );
      return;
    }
    if (debatePick === "hard" && !hardOk) {
      setLockHint(
        locale === "en"
          ? "Finish one scattering run to unlock Hard"
          : "完成一次散射实验以解锁 Hard",
      );
      return;
    }
    if (debatePick === "scripted") {
      enterVenue("coupland-lab");
    } else {
      enterVenue("coupland-lab", { debate: debatePick });
    }
  };

  const quizCta =
    locale === "zh-Hans"
      ? quizPassed
        ? "出口测验已通过"
        : "Coupland 出口测验"
      : quizPassed
        ? "Exit quiz passed"
        : "Coupland exit quiz";

  return (
    <div className="city-page" role="main" aria-label="曼彻斯特 Coupland">
      <div className="city-page-skyline" aria-hidden>
        <img
          className="city-page-bg"
          src="/assets/bg/city-manchester.png"
          alt=""
          draggable={false}
        />
      </div>
      <div className="city-page-panel parchment-panel">
        <div className="city-locale-chip" role="group" aria-label="Locale">
          <span className="city-locale-chip__label">
            {locale === "zh-Hans" ? "语言" : "Locale"}
          </span>
          <button
            type="button"
            className={`paper-btn city-locale-chip__btn${locale === "en" ? " city-locale-chip__btn--on" : ""}`}
            aria-pressed={locale === "en"}
            onClick={() => setLocale("en")}
          >
            EN
          </button>
          <button
            type="button"
            className={`paper-btn city-locale-chip__btn${locale === "zh-Hans" ? " city-locale-chip__btn--on" : ""}`}
            aria-pressed={locale === "zh-Hans"}
            onClick={() => setLocale("zh-Hans")}
          >
            中文
          </button>
        </div>

        <p className="city-kicker">城市页 · 80 Days 结构</p>
        <h1>{chapter.atlas.title}</h1>
        <p className="city-street">Coupland Street · {chapter.era}</p>
        <p className="city-caption">{chapter.atlas.caption}</p>

        <div className="city-debate-picker" role="group" aria-label="辩论模式">
          <p className="city-debate-picker__label">辩论模式</p>
          <div className="city-debate-picker__row">
            <button
              type="button"
              className={`paper-btn city-debate-btn${debatePick === "scripted" ? " city-debate-btn--on" : ""}`}
              onClick={() => setDebatePick("scripted")}
            >
              常规
              <span className="city-debate-btn__sub">scripted</span>
            </button>
            <button
              type="button"
              className={`paper-btn city-debate-btn${debatePick === "free" ? " city-debate-btn--on" : ""}`}
              onClick={() => setDebatePick("free")}
              title={freeOk ? "自由辩论" : "锁定"}
            >
              自由 {freeOk ? "✓" : "🔒"}
              <span className="city-debate-btn__sub">free</span>
            </button>
            <button
              type="button"
              className={`paper-btn city-debate-btn${debatePick === "hard" ? " city-debate-btn--on" : ""}`}
              onClick={() => setDebatePick("hard")}
              title={hardOk ? "Hard 证据槽" : "完成散射实验解锁"}
            >
              Hard {hardOk ? "✓" : "🔒"}
              <span className="city-debate-btn__sub">证据槽</span>
            </button>
          </div>
          {lockHint ? (
            <p className="city-debate-picker__hint" role="status">
              {lockHint}
            </p>
          ) : null}
        </div>

        <div className="city-actions">
          <button
            type="button"
            className="paper-btn city-btn"
            onClick={enterLab}
          >
            实验室
          </button>
          <button
            type="button"
            className="paper-btn city-btn"
            onClick={() => enterVenue("coupland-lodge")}
          >
            租屋
          </button>
          <button type="button" className="paper-btn city-btn" disabled title="后做">
            街巷
          </button>
          <button
            type="button"
            className="paper-btn city-btn"
            onClick={() => setQuizOpen(true)}
            disabled={quizPassed}
            title={
              locale === "zh-Hans"
                ? "可选出口测验；可软跳过"
                : "Optional exit quiz; soft skip allowed"
            }
          >
            {quizCta}
          </button>
        </div>

        {showTeaser ? (
          <aside
            className="city-teaser city-teaser--locked parchment-panel"
            aria-label={resolveLocalized(teaser.title, locale)}
            data-teaser-id={teaser.id}
            data-locked={teaser.locked ? "true" : "false"}
          >
            <p className="city-teaser__lock">
              {locale === "zh-Hans" ? "🔒 锁定预告" : "🔒 Locked teaser"}
            </p>
            <h2 className="city-teaser__title">
              {resolveLocalized(teaser.title, locale)}
            </h2>
            <p className="city-teaser__blurb">
              {resolveLocalized(teaser.blurb, locale)}
            </p>
            <p className="city-teaser__note">
              {locale === "zh-Hans"
                ? "玻尔场所尚未实现 — 仅预告卡。"
                : "Bohr venues are not implemented — teaser card only."}
            </p>
          </aside>
        ) : null}

        <div className="city-nav">
          <button type="button" className="paper-btn ghost" onClick={returnToPlate}>
            回图志
          </button>
          <button type="button" className="paper-btn ghost" onClick={returnToWorldMap}>
            回地图
          </button>
        </div>
      </div>

      <ExitQuizOverlay
        locale={locale}
        open={quizOpen}
        onPass={() => {
          markQuizPassed();
          setQuizOpen(false);
        }}
        onSkip={() => setQuizOpen(false)}
        onClose={() => setQuizOpen(false)}
      />
    </div>
  );
}
