import type { RiskLevel } from "@/lib/flow-engine/types";

interface Props {
  level: RiskLevel;
  label: string;
}

export function RiskBadge({ level, label }: Props) {
  return (
    <span
      className={`flow-risk-badge flow-risk-badge--${level}`}
      data-testid={`risk-badge-${level}`}
    >
      <span className="flow-risk-dot" />
      {label}
    </span>
  );
}
