import { Link } from "wouter";
import {
  Shield,
  Bell,
  FileSearch,
  ChevronRight,
  Scale,
  Upload,
  HelpCircle,
  BookOpen,
  Newspaper,
  ArrowLeft,
} from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";

const NAV_CARDS = [
  {
    id: "sectorregels",
    href: "/regels/sectorregels",
    icon: BookOpen,
    title: "Sectorregels",
    description: "Welke regels gelden voor jouw sector en gemeente?",
  },
  {
    id: "updates",
    href: "/regels/updates",
    icon: Newspaper,
    title: "Regelgeving Updates",
    description: "Volg aankomende wetswijzigingen en gemeentelijke besluiten.",
  },
  {
    id: "documenten",
    href: "/regels/documenten",
    icon: FileSearch,
    title: "Document analyseren",
    description: "Upload een brief of besluit — de AI doet de rest.",
  },
  {
    id: "check",
    href: "/regels/check",
    icon: Scale,
    title: "Raakt dit mij?",
    description: "Check snel of een wet of wijziging op jouw bedrijf van toepassing is.",
  },
  {
    id: "help",
    href: "/regels/help",
    icon: HelpCircle,
    title: "Hulp bij regels",
    description: "Drie korte hulplijnen voor brieven, vergunningen en boetes.",
  },
  {
    id: "woo",
    href: "/regels/woo",
    icon: Upload,
    title: "WOO-verzoek",
    description: "Vraag overheidsdocumenten op via een WOO-verzoek met conceptbrief.",
  },
];

export default function RegelsOverzichtPage() {
  usePageTitle("Grip op Regels – OpenRegio");

  return (
    <div style={{ background: "#f4f7fc", minHeight: "100vh", padding: "28px 20px 60px" }} data-testid="page-regels-overzicht">
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        <Link href="/vandaag">
          <div style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 600, color: "#64748b", marginBottom: 18, cursor: "pointer" }}>
            <ArrowLeft style={{ width: 15, height: 15 }} />
            Terug naar dashboard
          </div>
        </Link>

        <div style={{ marginBottom: 28, display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: "#f3e8ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Shield style={{ width: 24, height: 24, color: "#6d28d9" }} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#0b2240" }} data-testid="text-page-title">Regels & Gemeente</h1>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: "#64748b" }}>
              Begrijp brieven, check vergunningen en volg wat er verandert.
            </p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16, marginBottom: 32 }}>
          {NAV_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.id} href={card.href}>
                <div
                  style={{ background: "#ffffff", border: "1px solid #dce6f0", borderRadius: 16, padding: "20px 22px", cursor: "pointer", display: "flex", flexDirection: "column", gap: 12 }}
                  data-testid={`card-regels-${card.id}`}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: "#f3e8ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon style={{ width: 20, height: 20, color: "#6d28d9" }} />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 15, color: "#0b2240" }}>{card.title}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: "#64748b", lineHeight: 1.5 }}>{card.description}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 600, color: "#6d28d9" }}>
                    Bekijk <ChevronRight style={{ width: 15, height: 15 }} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </div>
  );
}
