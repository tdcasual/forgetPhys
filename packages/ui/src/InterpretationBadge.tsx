type Variant = "chip" | "corner" | "asset";

const CHIP_SRC = "/assets/ui/badge-interpretation.svg";
const CORNER_SRC = "/assets/ui/badge-interpretation-corner.svg";

export function InterpretationBadge({
  variant = "chip",
  assetSrc,
}: {
  variant?: Variant;
  assetSrc?: string;
}) {
  if (variant === "corner") {
    return (
      <span className="pc-badge-corner" role="img" aria-label="演绎">
        <img
          className="pc-badge-corner-img"
          src={assetSrc ?? CORNER_SRC}
          alt="演绎"
          title="戏剧许可（D）：非现场史实记录"
        />
      </span>
    );
  }
  if (variant === "asset" || variant === "chip") {
    return (
      <img
        className={variant === "chip" ? "pc-badge-img pc-badge-chip-img" : "pc-badge-img"}
        src={assetSrc ?? CHIP_SRC}
        alt="演绎"
        title="戏剧许可（D）：非现场史实记录"
        role="img"
      />
    );
  }
  return null;
}

export function isInterpretation(tier: string): boolean {
  return tier === "interpretation";
}
