type DecisionPanelProps = {
  title?: string;
  context: string;
  evidence: string;
  recommendation: string;
  fallback: string;
  fromWeight?: number;
  nextWeight?: number;
  applied?: boolean;
  onApply?: () => void;
  actionLabel?: string;
  compact?: boolean;
};

export function ModeBadges({ ruleLabel = "RULE GUARD" }: { ruleLabel?: string }) {
  return (
    <div className="mode-badges" aria-label="决策模式">
      <span className="mode-chip ai">AI MODE</span>
      <span className="mode-chip rule">{ruleLabel}</span>
    </div>
  );
}

export function DecisionPanel({
  title = "决策依据",
  context,
  evidence,
  recommendation,
  fallback,
  fromWeight,
  nextWeight,
  applied = false,
  onApply,
  actionLabel = "应用调整",
  compact = false,
}: DecisionPanelProps) {
  return (
    <aside className={compact ? "decision-panel compact" : "decision-panel"} aria-label={title}>
      <ModeBadges ruleLabel="RULE CHECK" />
      <h2>{title}</h2>
      <div className="decision-steps">
        <article><span>01</span><div><strong>使用的上下文</strong><p>{context}</p></div></article>
        <article><span>02</span><div><strong>判断依据</strong><p>{evidence}</p></div></article>
        <article className="recommendation"><span>03</span><div><strong>建议调整</strong><p>{recommendation}</p></div></article>
        <article className="fallback"><span>04</span><div><strong>安全降级</strong><p>{fallback}</p></div></article>
      </div>
      {typeof fromWeight === "number" && typeof nextWeight === "number" ? (
        <div className="weight-change" aria-label="建议负荷变化"><strong>{fromWeight} kg</strong><span>→</span><strong>{nextWeight} kg</strong></div>
      ) : null}
      {onApply ? <button className="primary-action decision-apply" type="button" onClick={onApply}>{applied ? "已应用到训练计划" : actionLabel}</button> : null}
    </aside>
  );
}
