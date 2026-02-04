import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Check, Minus, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import heroImage from "@assets/ChatGPT_Image_5_jan_2026,_10_22_40_1768374708257.png";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-background to-white">
      {/* Decorative gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-[20%] w-[800px] h-[500px] bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-[10%] right-[10%] w-[900px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-lg backdrop-saturate-150 bg-white/70 border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16 gap-4">
            <Link href="/" className="flex items-center gap-2.5" data-testid="link-home-logo">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/25 flex items-center justify-center text-white font-black text-sm">
                OR
              </div>
              <span className="font-bold tracking-tight">OpenRegio</span>
            </Link>

            <nav className="hidden md:flex items-center gap-4 text-sm font-semibold text-muted-foreground">
              <a href="#pijlers" className="px-3 py-2 rounded-xl hover:bg-primary/5 hover:text-foreground transition-colors">Pijlers</a>
              <a href="#hoehetwerkt" className="px-3 py-2 rounded-xl hover:bg-primary/5 hover:text-foreground transition-colors">Hoe werkt het</a>
              <a href="#lidmaatschap" className="px-3 py-2 rounded-xl hover:bg-primary/5 hover:text-foreground transition-colors">Lidmaatschap</a>
              <a href="#scope" className="px-3 py-2 rounded-xl hover:bg-primary/5 hover:text-foreground transition-colors">Scope</a>
            </nav>

            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm" data-testid="button-nav-login">
                  Inloggen
                </Button>
              </Link>
              <Link href="/start?plan=basic">
                <Button size="sm" data-testid="button-nav-start">
                  Word lid
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-14 md:py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-border bg-white/70 text-muted-foreground text-xs font-bold mb-4">
                <span className="w-2 h-2 rounded-full bg-primary shadow-lg shadow-primary/30" />
                Regionale infrastructuur voor ondernemers (in opbouw)
              </div>

              <h1 className="font-accent text-4xl md:text-5xl lg:text-[54px] font-bold leading-[1.03] tracking-tight mb-4" data-testid="text-hero-title">
                Meer werk uit je regio.<br/>Meer grip op regels.
              </h1>

              <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-4 max-w-xl" data-testid="text-hero-subtitle">
                OpenRegio organiseert werkverdeling, openbare documenten en betrouwbaarheid <strong className="text-foreground">per regio</strong>.
                Geen advertenties. Geen algoritmes. Geen ruis.
              </p>

              <div className="flex flex-wrap gap-3 mb-4">
                <Link href="#hoehetwerkt">
                  <Button data-testid="button-hero-howworks">
                    Bekijk hoe het werkt
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <a href="#pijlers">
                  <Button variant="outline" data-testid="button-hero-pijlers">
                    Bekijk de 4 pijlers
                  </Button>
                </a>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {["Werk-signalen & doorverwijzing", "WOO-documenten & beleid", "Zichtbaarheid basics", "Basischeck betrouwbaarheid"].map((tag, i) => (
                  <span key={i} className="px-3 py-2 rounded-full border border-border bg-white/70 text-muted-foreground text-xs font-bold">
                    {tag}
                  </span>
                ))}
              </div>

              <p className="text-muted-foreground text-xs leading-relaxed">
                Elke regio die dit niet organiseert, verliest werk en grip zonder het te merken.
              </p>
            </div>

            <div className="relative">
              <Card className="overflow-hidden shadow-xl shadow-black/5">
                <img 
                  src={heroImage} 
                  alt="OpenRegio — overzicht van werk en documenten in de regio" 
                  className="w-full h-auto"
                  data-testid="img-hero"
                />
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Waarom OpenRegio nodig is */}
      <section className="relative py-12 px-4" id="hoehetwerkt">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-accent text-xl md:text-2xl font-bold mb-2">Waarom OpenRegio nodig is</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl leading-relaxed">
            Ondernemen wordt onvoorspelbaar wanneer werk versnipperd raakt, regels ondoorzichtig zijn en besluiten niet vindbaar zijn.
            OpenRegio brengt structuur met regionale afspraken en openbare documenten.
          </p>

          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            {[
              { title: "Werk verdwijnt uit de regio", desc: "Wanneer ondernemers elkaar niet kennen of niet kunnen doorverwijzen, gaat werk onnodig buiten de regio terechtkomen." },
              { title: "Regels zijn ondoorzichtig", desc: "Brieven, beleidsregels en besluiten zijn vaak verspreid. Dat kost tijd en vergroot risico." },
              { title: "Betrouwbaarheid is onzichtbaar", desc: "Als systemen haperen (apps, pin, bereikbaarheid), valt werk stil. Zonder basisafspraken is er geen continuïteit." },
            ].map((item, i) => (
              <Card key={i} className="bg-white/90">
                <CardContent className="p-5">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black mb-3">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold mb-2 tracking-tight">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="h-px bg-border my-6" />

          <p className="text-muted-foreground leading-relaxed">
            OpenRegio is geen adviesloket. Het organiseert <strong className="text-foreground">wat er al is</strong>: werk, documenten en basiscondities — regionaal.
          </p>
        </div>
      </section>

      {/* De 4 pijlers */}
      <section className="relative py-12 px-4" id="pijlers">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-accent text-xl md:text-2xl font-bold mb-2">De 4 pijlers</h2>
          <p className="text-muted-foreground mb-6">Kort, scanbaar, zonder marketingcircus.</p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                img: "/img/regiomarkt.png",
                title: "RegioMarkt",
                badge: "Werk blijft lokaal",
                desc: "Regionale werkverdeling: ondernemers kunnen werk doorzetten wanneer zij het niet uitvoeren. Vaste regio-indeling. Geen advertenties. Geen algoritmische selectie.",
                effect: "Effect: werk kan binnen de regio worden herverdeeld."
              },
              {
                img: "/img/regiobot.png",
                title: "RegioBot",
                badge: "WOO & beleid",
                desc: "Document-gedreven overzicht van WOO-verzoeken, antwoorden, besluiten, mandaten en beleidsregels. Geen interpretaties, alleen wat er is — en wat ontbreekt.",
                effect: "Effect: regelgeving wordt inzichtelijk op documentniveau."
              },
              {
                img: "/img/zichtbaarheid.png",
                title: "Zichtbaarheid",
                badge: "Vindbaar waar het telt",
                desc: "Lokale basis op orde: bedrijfsvermelding, reviews en regionale vindbaarheid. Geen contentstrategie en geen advertenties.",
                effect: "Effect: bedrijven zijn vindbaar binnen hun regio."
              },
              {
                img: "/img/basischeck.png",
                title: "Basischeck",
                badge: "Betrouwbaarheid",
                desc: "Registratie van basiscondities: bereikbaarheid, offline functioneren en basisbetalingen. Dit wordt gebruikt binnen het netwerk.",
                effect: "Effect: betrouwbaarheid is inzichtelijk binnen de regio."
              },
            ].map((pijler, i) => (
              <Card key={i} className="bg-white/90 overflow-hidden flex flex-col" data-testid={`card-pijler-${i}`}>
                <img src={pijler.img} alt={pijler.title} className="w-full h-auto" />
                <CardContent className="p-4 flex-1 flex flex-col">
                  <div className="flex items-baseline justify-between gap-2 mb-2 flex-wrap">
                    <h3 className="font-semibold tracking-tight">{pijler.title}</h3>
                    <span className="text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-1.5 rounded-full whitespace-nowrap">
                      {pijler.badge}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-3 flex-1">{pijler.desc}</p>
                  <div className="text-xs font-bold text-foreground/80 bg-primary/5 border border-dashed border-primary/30 rounded-xl px-3 py-2.5">
                    {pijler.effect}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Scope - Wat OpenRegio wel en niet doet */}
      <section className="relative py-12 px-4" id="scope">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-accent text-xl md:text-2xl font-bold mb-6">Wat OpenRegio wel en niet doet</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-white/90">
              <CardContent className="p-5">
                <h3 className="font-semibold mb-4">OpenRegio doet wél</h3>
                <ul className="space-y-3">
                  {[
                    "Regionale werkverdeling faciliteren via werk-signalen en doorverwijzing.",
                    "Openbare documenten verzamelen en ordenen (WOO, besluiten, mandaten, beleidsregels).",
                    "Basiscondities zichtbaar maken (bereikbaarheid, offline werken, basisbetalingen).",
                    "Lokale vindbaarheid structureren (vermelding, reviews, regio-zoekresultaten).",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-muted-foreground text-sm font-medium leading-relaxed">
                      <span className="w-5 h-5 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white/90">
              <CardContent className="p-5">
                <h3 className="font-semibold mb-4">OpenRegio doet níet</h3>
                <ul className="space-y-3">
                  {[
                    "Geen juridisch advies en geen beoordeling van individuele dossiers.",
                    "Geen behandeling van persoonlijke boetes of verkeerszaken.",
                    "Geen advertenties, geen algoritmische feeds, geen \"growth hacks\".",
                    "Geen partij bij transacties tussen ondernemers en hun klanten.",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-muted-foreground text-sm font-medium leading-relaxed">
                      <span className="w-5 h-5 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
                        <Minus className="w-3 h-3" />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-muted-foreground text-xs mt-4 leading-relaxed">
                  RegioBot is document-gedreven: het helpt bij <strong className="text-foreground">vinden, ordenen en zichtbaar maken</strong> van openbare informatie.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Lidmaatschap */}
      <section className="relative py-12 px-4" id="lidmaatschap">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-accent text-xl md:text-2xl font-bold mb-2">Lidmaatschap</h2>
          <p className="text-muted-foreground mb-6">Hou het simpel: Basis om mee te doen, Pro voor serieuze inzet.</p>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Basis */}
            <Card className="bg-white/95">
              <CardContent className="p-5">
                <div className="font-black tracking-tight mb-1">Basis</div>
                <p className="text-muted-foreground text-sm mb-3 leading-relaxed">
                  Voor ondernemers die willen instappen, zichtbaar worden en meedoen in de regio.
                </p>
                <div className="bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-muted-foreground text-xs font-bold mb-4">
                  Toegang tot: RegioMarkt + Zichtbaarheid + Basischeck (basis)
                </div>
                <ul className="space-y-2 mb-5">
                  {[
                    "Profiel + regio-indeling",
                    "Werk-signalen bekijken / reageren",
                    "Zichtbaarheid-basis (checklist)",
                    "Basischeck invullen",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-muted-foreground text-sm font-medium">
                      <span className="w-5 h-5 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                        <Check className="w-3 h-3" />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-3 items-center">
                  <Link href="/start?plan=basic">
                    <Button data-testid="button-start-basis">Start Basis</Button>
                  </Link>
                  <a href="#pijlers">
                    <Button variant="outline">Bekijk pijlers</Button>
                  </a>
                </div>
                <p className="text-muted-foreground text-xs mt-3">Prijs: gratis tijdens opbouw. Geen belofte, wel toegang.</p>
              </CardContent>
            </Card>

            {/* Pro */}
            <Card className="bg-white/95 border-primary/30 shadow-lg shadow-primary/10">
              <CardContent className="p-5">
                <div className="font-black tracking-tight mb-1">Pro</div>
                <p className="text-muted-foreground text-sm mb-3 leading-relaxed">
                  Voor ondernemers die structureel willen doorverwijzen en RegioBot/WOO actief gebruiken.
                </p>
                <div className="bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-muted-foreground text-xs font-bold mb-4">
                  Extra: RegioBot + WOO-bibliotheek (opbouw) + hogere positie op betrouwbaarheid
                </div>
                <ul className="space-y-2 mb-5">
                  {[
                    "RegioBot gebruiken voor document-overzicht",
                    "WOO-bibliotheek bijdragen / hergebruiken",
                    "Doorverwijzing-logging (bewijs van verwijzing)",
                    "Basischeck-score telt zwaarder in netwerkpositie",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-muted-foreground text-sm font-medium">
                      <span className="w-5 h-5 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                        <Check className="w-3 h-3" />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-3 items-center">
                  <Link href="/start?plan=pro">
                    <Button data-testid="button-start-pro">Start Pro</Button>
                  </Link>
                  <a href="#scope">
                    <Button variant="outline">Bekijk scope</Button>
                  </a>
                </div>
                <p className="text-muted-foreground text-xs mt-3">OpenRegio is in opbouw: Pro groeit mee met regio's en documentsets.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="relative py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <Card className="bg-white/90">
            <CardContent className="p-5 flex flex-wrap items-start justify-between gap-6">
              <div className="max-w-xl">
                <h2 className="font-accent text-xl md:text-2xl font-bold mb-2">Organiseer jouw regio</h2>
                <p className="text-muted-foreground leading-relaxed">
                  OpenRegio is geen hype. Het is structuur. Als je regio meedoet, ontstaat er voorspelbaarheid.
                </p>
                <p className="text-muted-foreground text-xs mt-2">
                  Toegang kan regionaal worden gefaseerd. Meld je aan om op de hoogte te blijven.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/start?plan=basic">
                  <Button data-testid="button-cta-start">Word lid</Button>
                </Link>
                <a href="#lidmaatschap">
                  <Button variant="outline">Bekijk lidmaatschap</Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-border py-8 px-4 text-muted-foreground text-sm">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div><strong className="text-foreground">OpenRegio</strong> — regionale infrastructuur (in opbouw)</div>
            <div className="flex flex-wrap gap-4">
              <a href="#pijlers" className="hover:text-foreground transition-colors">Pijlers</a>
              <a href="#scope" className="hover:text-foreground transition-colors">Scope</a>
              <a href="#lidmaatschap" className="hover:text-foreground transition-colors">Lidmaatschap</a>
              <Link href="/login" className="hover:text-foreground transition-colors">Inloggen</Link>
            </div>
          </div>
          <p className="text-xs mt-4 leading-relaxed">
            WOO = Wet open overheid (openbare overheidsinformatie). OpenRegio gebruikt openbare bronnen en organiseert die per regio.
          </p>
        </div>
      </footer>
    </div>
  );
}
