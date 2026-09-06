type Variant = "chip" | "corner" | "asset";

export function InterpretationBadge({
  variant = "chip",
  assetSrc = "/assets/ui/badge-interpretation.svg",
}: {
  variant?: Variant;
  assetSrc?: string;
}) {
  if (variant === "corner") {
    return (
      <span className="pc-badge-corner" role="img" aria-label="演绎">
        <span>演绎</span>
      </span>
    );
  }
  if (variant === "asset") {
    return (
      <img
        className="pc-badge-img"
        src={assetSrc}
        alt="演绎"
        title="戏剧许可（D）：非现场史实记录"
      />
    );
  }
  return (
    <span className="pc-badge-chip" role="img" aria-label="演绎" title="戏剧许可（D）">
      <i className="pc-badge-tab" />
      演绎
    </span>
  );
}

export function isInterpretation(tier: string): boolean {
  return tier === "interpretation";
}
