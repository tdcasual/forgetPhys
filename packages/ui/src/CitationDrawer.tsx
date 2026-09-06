import {
  SOURCE_TIER_LABEL,
  type ClaimMeta,
} from "@physics-chronicle/content";

export function CitationDrawer({ claim }: { claim: ClaimMeta }) {
  const label = SOURCE_TIER_LABEL[claim.source_tier];
  return (
    <details className="pc-cite">
      <summary>
        <span className={`pc-tier pc-tier-${claim.source_tier}`}>{label}</span>
        引用
      </summary>
      <div className="pc-cite-body">
        <div>{claim.citation}</div>
        {claim.locator ? <div>{claim.locator}</div> : null}
        {claim.notes ? <div>{claim.notes}</div> : null}
      </div>
    </details>
  );
}
