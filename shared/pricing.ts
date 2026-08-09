export type PlanKey = "basic" | "pro" | "coaching";

export interface PlanConfig {
  key: PlanKey;
  name: string;
  priceExVatMonthly: number | null;
  affiliateAmount: number | null;
}

export const PRICING: Record<PlanKey, PlanConfig> = {
  basic: {
    key: "basic",
    name: "Basis",
    priceExVatMonthly: 12.95,
    affiliateAmount: 4.95,
  },
  pro: {
    key: "pro",
    name: "Pro",
    priceExVatMonthly: 24,
    affiliateAmount: 9,
  },
  coaching: {
    key: "coaching",
    name: "1-op-1 coaching",
    priceExVatMonthly: null,
    affiliateAmount: null,
  },
};

export function calculateAffiliatePayout(plan: PlanKey) {
  const config = PRICING[plan];
  return {
    plan,
    monthlyPriceExVat: config.priceExVatMonthly,
    affiliateAmount: config.affiliateAmount,
    totalPayoutExVat: config.affiliateAmount,
  };
}

export function getPlanPrice(plan: PlanKey | string): string {
  if (plan === "pro") return "24.00";
  if (plan === "basic") return "12.95";
  return "0.00";
}

export function getPlanDisplayName(plan: string): string {
  if (plan === "pro") return "Pro";
  if (plan === "coaching") return "1-op-1 coaching";
  return "Basis";
}

export function addVat(amountExVat: number, vatRate = 21): number {
  return Number((amountExVat * (1 + vatRate / 100)).toFixed(2));
}

export const PLAN_DISPLAY: Record<PlanKey, { label: string; priceLabel: string; affiliateLabel: string }> = {
  basic:    { label: "Basis",           priceLabel: "€12,95 excl. btw/maand", affiliateLabel: "€4,95 per nieuwe klant" },
  pro:      { label: "Pro",             priceLabel: "€24 excl. btw/maand",    affiliateLabel: "€9 per nieuwe klant" },
  coaching: { label: "1-op-1 coaching", priceLabel: "Prijs op aanvraag",      affiliateLabel: "" },
};
