import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Bot, ShieldCheck, Lock, Cookie, Store, Eye, ClipboardCheck } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Blog } from "@shared/schema";
import heroImage from "@assets/ChatGPT_Image_5_jan_2026,_10_22_40_1768374708257.png";

export default function HomePage() {
  const { data: blogs = [] } = useQuery<Blog[]>({
    queryKey: ["/api/blogs/public"],
  });

  const formatDate = (date: string | Date | null) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link 
            href="/" 
            className="font-accent text-2xl font-bold text-primary" 
            data-testid="link-home-logo"
          >
            OpenRegio
          </Link>
          <div className="flex items-center gap-4">
            <Link 
              href="/lidmaatschap" 
              className="text-sm font-medium hover:text-primary transition-colors" 
              data-testid="link-membership"
            >
              Lidmaatschap
            </Link>
            <Link 
              href="/blogs" 
              className="text-sm font-medium hover:text-primary transition-colors" 
              data-testid="link-blogs"
            >
              Blogs
            </Link>
            <Link 
              href="/login" 
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors hover-elevate active-elevate-2 h-8 px-3 py-2" 
              data-testid="button-nav-login"
            >
              Inloggen
            </Link>
            <Link 
              href="/start?plan=basic" 
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors hover-elevate active-elevate-2 h-8 px-3 py-2 bg-primary text-primary-foreground border border-primary-border" 
              data-testid="button-nav-start"
            >
              Word lid
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 px-4 bg-background">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-5 gap-10 items-center">
            <div className="md:col-span-3">
              <h1 className="font-accent text-2xl md:text-4xl font-semibold mb-4 leading-snug text-foreground" data-testid="text-hero-title">
                Meer werk uit je regio.<br />Meer grip op regels, mandaten en besluiten.
              </h1>
              <p className="text-base md:text-lg text-muted-foreground mb-6 leading-relaxed max-w-xl" data-testid="text-hero-subtitle">
                OpenRegio is infrastructuur voor lokale ondernemers: een regionaal netwerk + een gezamenlijke WOO-bibliotheek. RegioBot maakt beleid, mandaten en uitvoering doorzichtig.
              </p>
              <div className="flex flex-wrap gap-3 mb-4">
                <Link href="/start?plan=basic">
                  <Button data-testid="button-hero-basic">
                    Word lid
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/regiobot">
                  <Button variant="outline" data-testid="button-hero-basischeck">
                    RegioBot proberen
                  </Button>
                </Link>
              </div>
              <p className="text-xs text-muted-foreground" data-testid="text-hero-scope">
                Alleen wet- en regelgeving voor ondernemers. Geen verkeerszaken of persoonlijke boetes.
              </p>
            </div>
            <div className="md:col-span-2">
              <img 
                src={heroImage} 
                alt="Lokale ondernemer in Nederland" 
                className="rounded-md w-full h-auto"
                data-testid="img-hero"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pijnpunten Section */}
      <section className="py-12 px-4 border-b">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-accent text-lg md:text-xl font-medium mb-6 text-center">
            Waarom ondernemers zich aansluiten
          </h2>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            {[
              "Onvoorspelbare omzet en losse aanvragen",
              "Beleid en brieven zonder duidelijke grondslag",
              "Onduidelijke mandaten: wie mag eigenlijk wat?",
            ].map((pijnpunt, idx) => (
              <div key={idx} className="p-4 rounded-md bg-muted/50 text-muted-foreground">
                {pijnpunt}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* De 4 pijlers van OpenRegio */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-accent text-lg md:text-xl font-medium mb-8 text-center">
            Wat OpenRegio biedt
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div data-testid="card-feature-regiomarkt" className="p-5 rounded-md border bg-background">
              <div className="flex items-start gap-3">
                <Store className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-sm mb-1">RegioMarkt</h3>
                  <p className="text-sm text-muted-foreground">
                    Gesloten netwerk voor doorverwijzingen en werk verdelen. Geen algoritmes, wel korte lijnen.
                  </p>
                </div>
              </div>
            </div>

            <div data-testid="card-feature-regiobot" className="p-5 rounded-md border bg-background">
              <div className="flex items-start gap-3">
                <Bot className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-sm mb-1">RegioBot</h3>
                  <p className="text-sm text-muted-foreground">
                    WOO-verzoeken, mandaten en beleidsregels analyseren. Dossier-gedreven, geen loket-praat.
                  </p>
                </div>
              </div>
            </div>

            <div data-testid="card-feature-zichtbaarheid" className="p-5 rounded-md border bg-background">
              <div className="flex items-start gap-3">
                <Eye className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-sm mb-1">Zichtbaarheid</h3>
                  <p className="text-sm text-muted-foreground">
                    Google bedrijfsprofiel, reviews en lokale vindbaarheid. Praktisch, geen marketing-gedoe.
                  </p>
                </div>
              </div>
            </div>

            <div data-testid="card-feature-basischeck" className="p-5 rounded-md border bg-background">
              <div className="flex items-start gap-3">
                <ClipboardCheck className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-sm mb-1">Basischeck</h3>
                  <p className="text-sm text-muted-foreground">
                    Check op cash, bonnen, bereikbaarheid en offline werken. Score bepaalt positie in netwerk.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Zo werkt OpenRegio */}
      <section className="py-12 px-4 border-t">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-accent text-lg md:text-xl font-medium mb-6 text-center">
            Zo werkt het
          </h2>
          <div className="flex justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">1</span>
              <span>Profiel aanmaken</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">2</span>
              <span>Basischeck doen</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">3</span>
              <span>RegioMarkt + RegioBot gebruiken</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-12 px-4 border-t">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-accent text-lg md:text-xl font-medium mb-6 text-center">
            Lidmaatschap
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Basis Plan */}
            <div data-testid="card-plan-basic" className="p-5 rounded-md border bg-background">
              <div className="flex items-baseline justify-between mb-4">
                <h3 className="font-medium">Basis</h3>
                <span className="text-lg font-semibold">€12,95<span className="text-sm text-muted-foreground font-normal">/mnd</span></span>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                {[
                  "Profiel in lokaal netwerk",
                  "Ledenlijst met contactgegevens",
                  "Basischeck + weerbaarheidsbadges",
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/start?plan=basic">
                <Button variant="outline" className="w-full" data-testid="button-plan-basic">
                  Kies Basis
                </Button>
              </Link>
            </div>

            {/* Pro Plan */}
            <div data-testid="card-plan-pro" className="p-5 rounded-md border border-primary bg-background">
              <div className="flex items-baseline justify-between mb-4">
                <h3 className="font-medium">Pro</h3>
                <span className="text-lg font-semibold">€24,00<span className="text-sm text-muted-foreground font-normal">/mnd</span></span>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                {[
                  "Alles van Basis",
                  "RegioBot (WOO & mandaat-checks)",
                  "Dossier-modus + bronverwijzingen",
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/start?plan=pro">
                <Button className="w-full" data-testid="button-plan-pro">
                  Kies Pro
                </Button>
              </Link>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-4">
            Maandelijks opzegbaar
          </p>
        </div>
      </section>

      {/* Blog Section */}
      {blogs.length > 0 && (
        <section className="py-12 px-4 border-t" data-testid="section-blogs">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-accent text-lg md:text-xl font-medium mb-6 text-center">
              Nieuws
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {blogs.slice(0, 3).map((blog) => (
                <Link key={blog.id} href={`/blog/${blog.slug}`}>
                  <div 
                    className="p-4 rounded-md border bg-background hover-elevate cursor-pointer" 
                    data-testid={`card-blog-${blog.id}`}
                  >
                    <p className="text-xs text-muted-foreground mb-1">
                      {formatDate(blog.publishedAt)}
                    </p>
                    <h3 className="font-medium text-sm line-clamp-2">
                      {blog.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Privacy Section - Compact */}
      <section className="py-8 px-4 border-t" data-testid="section-privacy">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-wrap justify-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              <span>Geen trackers</span>
            </div>
            <div className="flex items-center gap-2">
              <Cookie className="h-4 w-4" />
              <span>Alleen functionele cookies</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <span>Documenten privé</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap justify-between items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <Link href="/" className="font-accent font-semibold text-foreground" data-testid="link-footer-logo">
                OpenRegio
              </Link>
              <Link href="/privacy" className="hover:text-foreground" data-testid="link-footer-privacy">Privacy</Link>
              <Link href="/voorwaarden" className="hover:text-foreground" data-testid="link-footer-terms">Voorwaarden</Link>
            </div>
            <a href="mailto:info@openregio.nl" className="hover:text-foreground" data-testid="link-footer-email">
              info@openregio.nl
            </a>
          </div>
          <p className="w-full text-center text-xs text-muted-foreground mt-4">
            © 2026 OpenRegio
          </p>
        </div>
      </footer>
    </div>
  );
}
