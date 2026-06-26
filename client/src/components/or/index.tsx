import type { CSSProperties, ReactNode } from "react";
import { Link } from "wouter";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { OR } from "@/lib/or-tokens";

// ── PageShell ────────────────────────────────────────────────────────────────
export function PageShell({
  children,
  maxWidth = 900,
  style = {},
}: {
  children: ReactNode;
  maxWidth?: number;
  style?: CSSProperties;
}) {
  return (
    <div style={{ background: OR.bg, minHeight: "100vh", padding: "28px 20px 60px", ...style }}>
      <div style={{ maxWidth, margin: "0 auto" }}>
        {children}
      </div>
    </div>
  );
}

// ── BackLink ─────────────────────────────────────────────────────────────────
export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontSize: 13,
        fontWeight: 600,
        color: OR.zacht,
        textDecoration: "none",
        marginBottom: 18,
      }}
    >
      <ArrowLeft size={13} />
      {label}
    </Link>
  );
}

// ── PageHeader ───────────────────────────────────────────────────────────────
export function PageHeader({
  icon,
  iconBg,
  title,
  subtitle,
  badge,
  actions,
  backHref,
  backLabel,
}: {
  icon?: ReactNode;
  iconBg?: string;
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  actions?: ReactNode;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div style={{ marginBottom: 28 }}>
      {backHref && <BackLink href={backHref} label={backLabel ?? "Terug"} />}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {icon && (
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: iconBg ?? OR.bgBlauw,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {icon}
            </div>
          )}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: OR.blauw, lineHeight: 1.2 }}>
                {title}
              </h1>
              {badge}
            </div>
            {subtitle && (
              <p style={{ margin: "5px 0 0", fontSize: 14, color: OR.zacht, lineHeight: 1.5, maxWidth: 600 }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {actions && <div style={{ flexShrink: 0 }}>{actions}</div>}
      </div>
    </div>
  );
}

// ── SectionLabel ─────────────────────────────────────────────────────────────
export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: OR.zacht, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>
      {children}
    </div>
  );
}

// ── ORCard ───────────────────────────────────────────────────────────────────
export function ORCard({
  children,
  style = {},
}: {
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        background: OR.bgCard,
        border: `1px solid ${OR.border}`,
        borderRadius: OR.rLg,
        overflow: "hidden",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── CardHeader ───────────────────────────────────────────────────────────────
export function CardHeader({
  color,
  iconBg,
  icon,
  title,
  subtitle,
}: {
  color: string;
  iconBg?: string;
  icon?: ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div style={{ background: color, padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
      {icon && (
        <div style={{ width: 36, height: 36, borderRadius: 10, background: iconBg ?? "rgba(255,255,255,.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {icon}
        </div>
      )}
      <div>
        <div style={{ fontWeight: 800, fontSize: 14, color: "white" }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11, color: "rgba(255,255,255,.7)" }}>{subtitle}</div>}
      </div>
    </div>
  );
}

// ── NavLink ──────────────────────────────────────────────────────────────────
export function NavLink({
  href,
  icon,
  label,
  subtitle,
  chip,
}: {
  href: string;
  icon?: ReactNode;
  label: string;
  subtitle?: string;
  chip?: ReactNode;
}) {
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "11px 16px",
        background: OR.bgCard,
        border: `1px solid ${OR.border}`,
        borderRadius: OR.r,
        textDecoration: "none",
        marginBottom: 8,
      }}
    >
      {icon && (
        <div style={{ width: 32, height: 32, borderRadius: 8, background: OR.bgBlauw, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {icon}
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: OR.blauw }}>{label}</div>
        {subtitle && <div style={{ fontSize: 12, color: OR.zacht }}>{subtitle}</div>}
      </div>
      {chip && <div style={{ flexShrink: 0 }}>{chip}</div>}
      <ChevronRight size={14} style={{ color: OR.subtiel, flexShrink: 0 }} />
    </Link>
  );
}

// ── StatBadge ────────────────────────────────────────────────────────────────
export function StatBadge({ number, label }: { number: string | number; label: string }) {
  return (
    <div style={{ textAlign: "center", padding: "16px 20px" }}>
      <div style={{ fontSize: 28, fontWeight: 900, color: OR.blauw }}>{number}</div>
      <div style={{ fontSize: 12, color: OR.zacht, marginTop: 2 }}>{label}</div>
    </div>
  );
}

// ── InfoBanner ───────────────────────────────────────────────────────────────
export function InfoBanner({
  icon,
  bg,
  border,
  textColor,
  children,
}: {
  icon: ReactNode;
  bg: string;
  border: string;
  textColor: string;
  children: ReactNode;
}) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, background: bg, border: `1px solid ${border}`, borderRadius: OR.r, padding: "14px 16px" }}>
      <div style={{ flexShrink: 0, marginTop: 1 }}>{icon}</div>
      <div style={{ fontSize: 13, color: textColor, lineHeight: 1.6 }}>{children}</div>
    </div>
  );
}

// ── ORButton ─────────────────────────────────────────────────────────────────
export function ORButton({
  href,
  onClick,
  variant = "solid",
  size = "md",
  color,
  children,
  style = {},
  disabled,
  type,
  "data-testid": testId,
}: {
  href?: string;
  onClick?: () => void;
  variant?: "solid" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  color?: string;
  children: ReactNode;
  style?: CSSProperties;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  "data-testid"?: string;
}) {
  const c = color ?? OR.blauwMid;
  const padding = size === "sm" ? "7px 14px" : size === "lg" ? "13px 24px" : "10px 20px";
  const fontSize = size === "sm" ? 12 : size === "lg" ? 15 : 13;
  const baseStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    fontWeight: 700,
    fontSize,
    borderRadius: OR.rSm,
    padding,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
    textDecoration: "none",
    border: "none",
    ...style,
  };

  const variantStyle: CSSProperties =
    variant === "solid"
      ? { background: c, color: "white" }
      : variant === "outline"
      ? { background: "transparent", color: c, border: `1.5px solid ${c}` }
      : { background: "transparent", color: c };

  const finalStyle = { ...baseStyle, ...variantStyle };

  if (href) {
    return (
      <Link href={href} style={finalStyle} data-testid={testId}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type ?? "button"} onClick={onClick} style={finalStyle} disabled={disabled} data-testid={testId}>
      {children}
    </button>
  );
}

// ── EmptyState ───────────────────────────────────────────────────────────────
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div style={{ textAlign: "center", padding: "48px 24px" }}>
      <div style={{ width: 56, height: 56, borderRadius: "50%", background: OR.bgBlauw, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
        {icon}
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, color: OR.blauw, marginBottom: 6 }}>{title}</div>
      {description && <div style={{ fontSize: 13, color: OR.zacht, maxWidth: 360, margin: "0 auto 16px" }}>{description}</div>}
      {action}
    </div>
  );
}
