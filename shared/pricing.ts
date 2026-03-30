export type PlanKey = "basis" | "pro";

export interface PlanConfig {
  key: PlanKey;
  name: string;
  priceExVatMonthly: number;
  affiliatePercent: number;
  affiliateMonths: number;
}

export const PRICING: Record<PlanKey, PlanConfig> = {
  basis: {
    key: "basis",
    name: "Basis",
    priceExVatMonthly: 19,
    affiliatePercent: 25,
    affiliateMonths: 3,
  },
  pro: {
    key: "pro",
    name: "Pro",
    priceExVatMonthly: 49,
    affiliatePercent: 35,
    affiliateMonths: 3,
  },
};

export function calculateAffiliatePayout(plan: PlanKey) {
  const config = PRICING[plan];
  const payoutPerMonthExVat = (config.priceExVatMonthly * config.affiliatePercent) / 100;
  const totalPayoutExVat = payoutPerMonthExVat * config.affiliateMonths;
  return {
    plan,
    monthlyPriceExVat: config.priceExVatMonthly,
    affiliatePercent: config.affiliatePercent,
    affiliateMonths: config.affiliateMonths,
    payoutPerMonthExVat: Number(payoutPerMonthExVat.toFixed(2)),
    totalPayoutExVat: Number(totalPayoutExVat.toFixed(2)),
  };
}

export function getPlanPrice(plan: PlanKey): number {
  return PRICING[plan].priceExVatMonthly;
}

export function addVat(amountExVat: number, vatRate = 21): number {
  return Number((amountExVat * (1 + vatRate / 100)).toFixed(2));
}

export const PLAN_DISPLAY: Record<PlanKey, { label: string; priceLabel: string }> = {
  basis: { label: "Basis-lid", priceLabel: "€19 ex btw/maand" },
  pro: { label: "Pro-bijdrager", priceLabel: "€49 ex btw/maand" },
};
