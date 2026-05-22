export type PlanKey = "basis" | "pro" | "coaching";

export interface PlanConfig {
  key: PlanKey;
  name: string;
  priceExVatMonthly: number | null;
  affiliateAmount: number | null;
}

export const PRICING: Record<PlanKey, PlanConfig> = {
  basis: {
    key: "basis",
    name: "Basis",
    priceExVatMonthly: 14.95,
    affiliateAmount: 4.95,
  },
  pro: {
    key: "pro",
    name: "Pro",
    priceExVatMonthly: 59,
    affiliateAmount: 9,
  },
  coaching: {
    key: "coaching",
    name: "Coaching",
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
  if (plan === "pro") return "59.00";
  if (plan === "basic" || plan === "basis") return "14.95";
  return "0.00";
}

export function getPlanDisplayName(plan: string): string {
  if (plan === "pro") return "Pro";
  if (plan === "coaching") return "Coaching";
  return "Basis";
}

export function addVat(amountExVat: number, vatRate = 21): number {
  return Number((amountExVat * (1 + vatRate / 100)).toFixed(2));
}

export const PLAN_DISPLAY: Record<PlanKey, { label: string; priceLabel: string; affiliateLabel: string }> = {
  basis:    { label: "Basis",    priceLabel: "€14,95 ex. btw/maand", affiliateLabel: "€4,95 per nieuwe klant" },
  pro:      { label: "Pro",      priceLabel: "€59 ex. btw/maand",    affiliateLabel: "€9 per nieuwe klant" },
  coaching: { label: "Coaching", priceLabel: "Op maat",              affiliateLabel: "" },
};
