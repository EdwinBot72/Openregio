import { useState, useEffect } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Link, useSearch } from "wouter";

const MOLLIE_BASIC_LINK =
  (import.meta.env.VITE_MOLLIE_BASIC_PAYMENT_LINK as string) ||
  "https://payment-links.mollie.com/payment/FNnWr8uofpfEd6PJQMWHk";
const MOLLIE_PRO_LINK =
  (import.meta.env.VITE_MOLLIE_PRO_PAYMENT_LINK as string) ||
  "https://payment-links.mollie.com/payment/nEdtEni7GkJG7rHHetyBs";

type PlanId = "basic" | "pro";

const PLANS = {
  basic: {
    id: "basic" as PlanId,
    name: "Basis-lid",
    price: "€19",
    period: "excl. BTW per maand",
    tagline: "Volwaardig lid van de coöperatie",
    benefitsTitle: "Wat krijg je",
    benefits: [
      "Bedrijfsprofiel in lokaal netwerk",
      "Ontdek en ontmoet ondernemers",
      "Volledig stemrecht in de coöperatie",
      "Basischeck & weerbaarheidsbadges",
    ],
    paymentLink: MOLLIE_BASIC_LINK,
    badge: "Basis",
  },
  pro: {
    id: "pro" as PlanId,
    name: "Pro-bijdrager",
    price: "€49",
    period: "excl. BTW per maand",
    tagline: "Draag extra bij en krijg krachtige tools",
    benefitsTitle: "Alles van Basis, plus",
    benefits: [
      "RegioBot: WOO & regelgeving AI",
      "Persoonlijke WOO-bibliotheek",
      "Printbare overzichten",
      "Prioriteit ondersteuning",
      "Bouw mee aan nieuwe features",
    ],
    paymentLink: MOLLIE_PRO_LINK,
    badge: "Pro",
  },
};

export default function LidmaatschapPage() {
  usePageTitle("Lidmaatschap");
  const searchParams = useSearch();
  const params = new URLSearchParams(searchParams);
  const urlPlan = params.get("plan");
  const [selected, setSelected] = useState<PlanId>(urlPlan === "pro" ? "pro" : "basic");

  useEffect(() => {
    if (urlPlan === "pro" || urlPlan === "basic") setSelected(urlPlan);
  }, [urlPlan]);

  const active = PLANS[selected];

  return (
    <div className="bg-[#f4f6fb]">
      <div className="openregio-upgrade" data-testid="page-lidmaatschap">
        <h1 data-testid="text-page-title">Word lid van OpenRegio</h1>
        <p className="openregio-subtitle">
          Kies een plan dat bij jouw onderneming past en start vandaag nog met lokale samenwerking.
        </p>

        {/* Plan-toggle */}
        <div
          className="openregio-form-actions"
          style={{ justifyContent: "center", marginBottom: 18 }}
          role="tablist"
          aria-label="Kies plan"
        >
          {(Object.keys(PLANS) as PlanId[]).map((id) => {
            const isActive = selected === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setSelected(id)}
                role="tab"
                aria-selected={isActive}
                data-testid={`button-select-${id}`}
                className={`openregio-button openregio-button-small ${
                  isActive
                    ? id === "pro"
                      ? "openregio-button-pro"
                      : "openregio-button-basic"
                    : "openregio-button-outline"
                }`}
              >
                {PLANS[id].name}
              </button>
            );
          })}
        </div>

        {/* Upgrade-kaart */}
        <div className="openregio-upgrade-card" data-testid={`card-upgrade-${active.id}`}>
          <span className="openregio-upgrade-badge" data-testid="badge-plan">
            {active.badge}
          </span>

          <h2 data-testid="text-plan-name">{active.name}</h2>
          <p className="openregio-upgrade-tagline" data-testid="text-plan-tagline">
            {active.tagline}
          </p>

          <div className="openregio-upgrade-benefits">
            <h3>{active.benefitsTitle}</h3>
            <ul>
              {active.benefits.map((b, i) => (
                <li key={i} data-testid={`text-benefit-${active.id}-${i}`}>
                  {b}
                </li>
              ))}
            </ul>
          </div>

          <div className="openregio-upgrade-price">
            <p className="openregio-price-amount" data-testid="text-plan-price">
              {active.price}
            </p>
            <span className="openregio-price-period">{active.period}</span>
          </div>

          <a
            href={active.paymentLink}
            target="_blank"
            rel="noopener noreferrer"
            className={`openregio-button ${
              active.id === "pro" ? "openregio-button-pro" : "openregio-button-basic"
            }`}
            data-testid="button-payment-link"
          >
            Ga naar betaling ({active.price}/mnd)
          </a>

          <p className="openregio-upgrade-note">
            Veilige betaling via Mollie · opzegbaar per maand
          </p>
        </div>

        <div className="openregio-back-link">
          <Link href="/" data-testid="link-back-home">
            ← Terug naar home
          </Link>
        </div>
      </div>
    </div>
  );
}
