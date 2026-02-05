import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { MapPin, Users, Lightbulb, Settings, Target, MessageCircle, Check, Mail, Phone, MapPinned } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ background: "#f5f7fb", color: "#0f172a" }}>
      {/* Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-lg border-b" style={{ background: "rgba(255,255,255,.92)", borderColor: "#e6ebf2" }} data-testid="nav-main">
        <div className="max-w-[1120px] mx-auto px-4">
          <div className="flex items-center justify-between py-3.5 gap-3">
            <Link href="/" className="flex items-center gap-3 font-black" data-testid="link-home-logo">
              <div 
                className="w-9 h-9 rounded-xl relative"
                style={{ 
                  background: "conic-gradient(from 200deg, #1f5fae, #3aa0ff, #f28a1a, #5ccf8a, #1f5fae)",
                  boxShadow: "0 8px 22px rgba(15,23,42,.08)"
                }}
              >
                <div className="absolute rounded-lg border" style={{ inset: "11px", borderColor: "rgba(255,255,255,.6)" }} />
              </div>
              <span>OpenRegio</span>
            </Link>

            <nav className="hidden md:flex items-center gap-2.5 font-extrabold" style={{ color: "#0f172a" }}>
              <a href="#home" className="px-3 py-2.5 rounded-xl hover:bg-[#eef3fb]" data-testid="link-nav-home">Home</a>
              <a href="#diensten" className="px-3 py-2.5 rounded-xl hover:bg-[#eef3fb]" data-testid="link-nav-diensten">Diensten</a>
              <a href="#cases" className="px-3 py-2.5 rounded-xl hover:bg-[#eef3fb]" data-testid="link-nav-cases">Cases</a>
              <a href="#over" className="px-3 py-2.5 rounded-xl hover:bg-[#eef3fb]" data-testid="link-nav-over">Over ons</a>
              <a href="#contact" className="px-3 py-2.5 rounded-xl hover:bg-[#eef3fb]" data-testid="link-nav-contact">Contact</a>
            </nav>

            <div className="flex items-center gap-2.5">
              <Link href="/login">
                <Button variant="ghost" size="sm" data-testid="button-nav-login">Inloggen</Button>
              </Link>
              <a 
                href="#member"
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-full font-black text-white text-sm"
                style={{ background: "#1f5fae", boxShadow: "0 14px 40px rgba(31,95,174,.25)" }}
                data-testid="button-nav-info"
              >
                Meer informatie
              </a>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section 
          id="home"
          className="relative"
          style={{
            background: "linear-gradient(90deg, rgba(14,63,134,.88), rgba(14,63,134,.55)), url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=2400&q=70')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            color: "#fff"
          }}
          data-testid="section-hero"
        >
          <div className="max-w-[1120px] mx-auto px-4">
            <div className="grid md:grid-cols-[1.2fr_.8fr] gap-4 py-14 md:py-16 items-stretch">
              <div>
                <h1 
                  className="font-black leading-[1.05] mb-2.5"
                  style={{ fontSize: "clamp(30px, 4.4vw, 54px)", letterSpacing: "-0.6px" }}
                  data-testid="text-hero-title"
                >
                  Samen bouwen<br/>aan een sterke regio
                </h1>
                <p 
                  className="mb-4"
                  style={{ color: "rgba(255,255,255,.90)", fontSize: "clamp(15px, 1.7vw, 18px)", maxWidth: "68ch" }}
                  data-testid="text-hero-subtitle"
                >
                  Oplossingen voor regionale samenwerking en innovatie. Minder praat, meer uitvoering.
                </p>
                <div className="flex flex-wrap gap-2.5">
                  <a 
                    href="#member"
                    className="inline-flex items-center justify-center px-4 py-3 rounded-full font-black text-sm"
                    style={{ background: "#f28a1a", color: "#1b1307", boxShadow: "0 14px 40px rgba(242,138,26,.25)" }}
                    data-testid="button-hero-lid"
                  >
                    Word lid
                  </a>
                  <a 
                    href="#cases"
                    className="inline-flex items-center justify-center px-4 py-3 rounded-full font-black text-sm"
                    style={{ background: "rgba(255,255,255,.12)", color: "#fff", border: "1px solid rgba(255,255,255,.25)" }}
                    data-testid="button-hero-discover"
                  >
                    Ontdek meer
                  </a>
                </div>
              </div>

              <aside 
                className="rounded-[18px] p-4"
                style={{ 
                  background: "rgba(255,255,255,.12)",
                  border: "1px solid rgba(255,255,255,.18)",
                  backdropFilter: "blur(8px)"
                }}
                data-testid="card-hero-kpis"
              >
                <strong>Focus (2030/2050)</strong>
                <div style={{ color: "rgba(255,255,255,.82)", fontSize: "13px", marginTop: "6px" }}>
                  Meetbaar. Praktisch. Geen ruis.
                </div>

                <div className="grid grid-cols-2 gap-2.5 mt-2.5">
                  {[
                    { label: "Woningbouw", val: "22.000+/jaar", hint: "Talentretentie" },
                    { label: "Werkgelegenheid", val: "> 80%", hint: "Slagkracht" },
                    { label: "R&D", val: "≥ 4,5%", hint: "Voorsprong" },
                    { label: "Breedband", val: "100%", hint: "Continuïteit" },
                  ].map((kpi, i) => (
                    <div 
                      key={i}
                      className="rounded-[14px] p-3"
                      style={{ 
                        border: "1px solid rgba(255,255,255,.20)",
                        background: "rgba(255,255,255,.10)"
                      }}
                      data-testid={`kpi-hero-${i}`}
                    >
                      <div style={{ fontSize: "12px", color: "rgba(255,255,255,.78)", fontWeight: 900 }}>{kpi.label}</div>
                      <div style={{ fontSize: "18px", fontWeight: 1000, marginTop: "4px" }}>{kpi.val}</div>
                      <div style={{ fontSize: "12px", color: "rgba(255,255,255,.78)", marginTop: "6px" }}>{kpi.hint}</div>
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* Strip Icons */}
        <div id="diensten" className="border-b" style={{ background: "#fff", borderColor: "#e6ebf2" }} data-testid="section-diensten">
          <div className="max-w-[1120px] mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-3.5 py-4">
              {[
                { icon: MapPin, title: "Regio analyse", desc: "Korte scan: wat blokkeert groei, waar zit je leverage." },
                { icon: Users, title: "Samenwerking", desc: "Structuur + afspraken die werken (geen netwerkpraat)." },
                { icon: Lightbulb, title: "Innovatie", desc: "Van idee naar pilot naar omzet. In de regio." },
              ].map((item, i) => (
                <div 
                  key={i}
                  className="rounded-[18px] p-4 flex gap-3 items-start"
                  style={{ 
                    background: "#ffffff",
                    border: "1px solid #e6ebf2",
                    boxShadow: "0 6px 18px rgba(15,23,42,.06)"
                  }}
                  data-testid={`card-dienst-${i}`}
                >
                  <div 
                    className="w-[46px] h-[46px] rounded-[16px] flex items-center justify-center flex-shrink-0"
                    style={{ 
                      background: "rgba(31,95,174,.10)",
                      color: "#1f5fae",
                      border: "1px solid rgba(31,95,174,.18)"
                    }}
                  >
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold" style={{ margin: 0, fontSize: "16px" }}>{item.title}</h3>
                    <p style={{ margin: "6px 0 0", color: "#5b677a", fontSize: "13px" }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Projects Section */}
        <section id="cases" className="py-8" data-testid="section-cases">
          <div className="max-w-[1120px] mx-auto px-4">
            <h2 className="font-bold mb-2" style={{ fontSize: "28px", letterSpacing: "-0.3px" }} data-testid="text-cases-title">Onze Projecten</h2>
            <p style={{ color: "#5b677a", marginBottom: "18px", maxWidth: "78ch" }} data-testid="text-cases-lead">Een kijkje in onze succesvolle cases.</p>

            <div className="grid md:grid-cols-3 gap-3.5">
              {[
                { img: "/img/regiomarkt.png?v=3", title: "RegioMarkt", desc: "Regionale werkverdeling tussen ondernemers." },
                { img: "/img/regiobot.png?v=3", title: "RegioBot", desc: "WOO-documenten en beleidsregels overzichtelijk." },
                { img: "/img/zichtbaarheid.png?v=3", title: "Zichtbaarheid", desc: "Lokale vindbaarheid op orde." },
              ].map((project, i) => (
                <article 
                  key={i}
                  className="rounded-[18px] overflow-hidden"
                  style={{ 
                    border: "1px solid #e6ebf2",
                    background: "#ffffff",
                    boxShadow: "0 8px 22px rgba(15,23,42,.08)"
                  }}
                  data-testid={`card-project-${i}`}
                >
                  <div 
                    className="h-40 bg-cover bg-center"
                    style={{ backgroundImage: `url('${project.img}')` }}
                  />
                  <div className="p-3.5">
                    <h4 className="font-bold mb-1.5">{project.title}</h4>
                    <p style={{ color: "#5b677a", fontSize: "13px", margin: 0 }}>{project.desc}</p>
                    <div className="mt-3">
                      <a 
                        href="#member"
                        className="inline-flex items-center justify-center px-3.5 py-2.5 rounded-full font-black text-white text-sm"
                        style={{ background: "#1f5fae", boxShadow: "0 14px 40px rgba(31,95,174,.25)" }}
                      >
                        Lees meer
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Why OpenRegio */}
        <section id="over" className="py-8 border-t border-b" style={{ background: "#fff", borderColor: "#e6ebf2" }} data-testid="section-why">
          <div className="max-w-[1120px] mx-auto px-4">
            <h2 className="font-bold mb-2" style={{ fontSize: "28px", letterSpacing: "-0.3px" }} data-testid="text-why-title">Waarom OpenRegio?</h2>
            <p style={{ color: "#5b677a", marginBottom: "18px", maxWidth: "78ch" }} data-testid="text-why-lead">Heldere waarde. Geen gedoe. Gewoon: regio sterker maken en ondernemers laten draaien.</p>

            <div className="grid md:grid-cols-3 gap-3.5 mt-3">
              {[
                { icon: Settings, title: "Deskundige aanpak", desc: "Structuur, uitvoering, meetbaar resultaat." },
                { icon: Target, title: "Heldere strategie", desc: "KPI's + prioriteiten, geen eindeloze plannen." },
                { icon: MessageCircle, title: "Persoonlijke service", desc: "Snel schakelen, korte lijnen." },
              ].map((item, i) => (
                <div 
                  key={i}
                  className="rounded-[18px] p-4 flex gap-3 items-start"
                  style={{ 
                    border: "1px solid #e6ebf2",
                    background: "#ffffff",
                    boxShadow: "0 8px 22px rgba(15,23,42,.08)"
                  }}
                  data-testid={`card-why-${i}`}
                >
                  <div 
                    className="w-[46px] h-[46px] rounded-[16px] flex items-center justify-center flex-shrink-0"
                    style={{ 
                      background: "rgba(242,138,26,.12)",
                      color: "#f28a1a",
                      border: "1px solid rgba(242,138,26,.22)"
                    }}
                  >
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold" style={{ margin: 0, fontSize: "16px" }}>{item.title}</h3>
                    <p style={{ margin: "6px 0 0", color: "#5b677a", fontSize: "13px" }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Membership Section */}
        <section 
          id="member" 
          className="py-8"
          style={{
            background: "radial-gradient(800px 500px at 10% 0%, rgba(31,95,174,.10), transparent 60%), radial-gradient(800px 500px at 90% 0%, rgba(242,138,26,.10), transparent 60%), #f5f7fb"
          }}
          data-testid="section-member"
        >
          <div className="max-w-[1120px] mx-auto px-4">
            <div className="text-center pb-2.5">
              <h2 className="font-bold mb-2" style={{ fontSize: "clamp(28px, 3.6vw, 44px)" }} data-testid="text-member-title">Word lid van OpenRegio</h2>
              <p style={{ color: "#5b677a", margin: 0 }} data-testid="text-member-lead">Kies een plan dat bij jouw onderneming past en start vandaag nog met lokale samenwerking.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-3.5 mt-5">
              {/* Basis Plan */}
              <div 
                className="rounded-[22px] p-4 relative overflow-hidden"
                style={{ 
                  background: "#ffffff",
                  border: "2px solid rgba(31,95,174,.35)",
                  boxShadow: "0 16px 40px rgba(15,23,42,.10)"
                }}
                data-testid="card-plan-basis"
              >
                <h3 className="font-bold" style={{ fontSize: "20px", marginBottom: "6px" }}>Basis-lid</h3>
                <p style={{ color: "#5b677a", fontSize: "13px", marginBottom: "10px" }}>Volwaardig lid van de coöperatie</p>
                <div style={{ fontSize: "34px", fontWeight: 1000, letterSpacing: "-0.4px", marginBottom: "10px" }}>
                  €12,95 <span style={{ fontSize: "14px", color: "#5b677a", fontWeight: 900 }}>excl. BTW / maand</span>
                </div>

                <div 
                  className="w-full rounded-[14px] p-3 text-center font-black mb-3"
                  style={{ 
                    background: "linear-gradient(180deg, rgba(31,95,174,.08), rgba(31,95,174,.02))",
                    border: "1px solid rgba(31,95,174,.25)"
                  }}
                >
                  Geselecteerd
                </div>

                <ul className="space-y-0">
                  {[
                    "Bedrijfsprofiel in lokaal netwerk",
                    "Ontdek en ontmoet ondernemers",
                    "Volledige stemrecht in de coöperatie",
                    "Basischeck & weerbaarheidsbadges",
                    "RegioBot & WOO-bibliotheek",
                    "Printbare overzichten",
                  ].map((feature, i) => (
                    <li 
                      key={i}
                      className="flex gap-2.5 items-start py-2.5 font-bold"
                      style={{ borderTop: i > 0 ? "1px solid #e6ebf2" : "none" }}
                    >
                      <span 
                        className="w-[22px] h-[22px] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ 
                          background: "rgba(31,95,174,.12)",
                          color: "#1f5fae",
                          border: "1px solid rgba(31,95,174,.18)"
                        }}
                      >
                        <Check className="w-3 h-3" />
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pro Plan */}
              <div 
                className="rounded-[22px] p-4 relative overflow-hidden"
                style={{ 
                  background: "#ffffff",
                  border: "2px solid rgba(242,138,26,.40)",
                  boxShadow: "0 16px 40px rgba(15,23,42,.10)"
                }}
                data-testid="card-plan-pro"
              >
                <div 
                  className="absolute top-3.5 right-3.5 px-3 py-2 rounded-full text-white font-black text-xs"
                  style={{ background: "#1f5fae", boxShadow: "0 12px 30px rgba(31,95,174,.20)" }}
                >
                  Populair
                </div>

                <h3 className="font-bold" style={{ fontSize: "20px", marginBottom: "6px" }}>Pro-bijdrager</h3>
                <p style={{ color: "#5b677a", fontSize: "13px", marginBottom: "10px" }}>Draag extra bij en krijg krachtige tools</p>
                <div style={{ fontSize: "34px", fontWeight: 1000, letterSpacing: "-0.4px", marginBottom: "10px" }}>
                  €24 <span style={{ fontSize: "14px", color: "#5b677a", fontWeight: 900 }}>excl. BTW / maand</span>
                </div>

                <div 
                  className="w-full rounded-[14px] p-3 text-center font-black mb-3"
                  style={{ 
                    background: "linear-gradient(180deg, rgba(242,138,26,.10), rgba(242,138,26,.02))",
                    border: "1px solid rgba(242,138,26,.28)"
                  }}
                >
                  Selecteer dit plan
                </div>

                <ul className="space-y-0">
                  {[
                    "Alles van Basis-lid",
                    "RegioBot: WOO & regelgeving AI",
                    "Persoonlijke WOO-bibliotheek",
                    "Printbare overzichten",
                    "Prioriteit ondersteuning",
                    "Bouw mee aan nieuwe features",
                  ].map((feature, i) => (
                    <li 
                      key={i}
                      className="flex gap-2.5 items-start py-2.5 font-bold"
                      style={{ borderTop: i > 0 ? "1px solid #e6ebf2" : "none" }}
                    >
                      <span 
                        className="w-[22px] h-[22px] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ 
                          background: "rgba(242,138,26,.14)",
                          color: "#f28a1a",
                          border: "1px solid rgba(242,138,26,.22)"
                        }}
                      >
                        <Check className="w-3 h-3" />
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* CTA Strip */}
            <div 
              id="contact"
              className="mt-5 rounded-[28px] overflow-hidden grid md:grid-cols-[1.4fr_.6fr]"
              style={{ 
                background: "radial-gradient(900px 400px at 20% 20%, rgba(255,255,255,.22), transparent 60%), linear-gradient(135deg, #0e3f86, #1f5fae)",
                boxShadow: "0 16px 40px rgba(15,23,42,.10)",
                border: "1px solid rgba(15,23,42,.06)",
                color: "#fff"
              }}
              data-testid="section-cta"
            >
              <div className="p-6">
                <h3 className="font-bold" style={{ fontSize: "30px", letterSpacing: "-0.4px", marginBottom: "8px" }} data-testid="text-cta-title">Zet de eerste stap!</h3>
                <p style={{ color: "rgba(255,255,255,.86)", marginBottom: "14px", maxWidth: "70ch" }}>
                  Start meteen met lokale samenwerking. Vul je e-mailadres in en ga door naar betaling.
                </p>

                <form className="flex flex-wrap gap-2.5 items-center mt-2.5" onSubmit={(e) => { e.preventDefault(); window.location.href = "/start?plan=basic"; }}>
                  <input 
                    type="email" 
                    required 
                    placeholder="E-mailadres"
                    className="flex-1 min-w-[260px] px-3.5 py-3.5 rounded-[14px] text-sm outline-none"
                    style={{ border: "1px solid rgba(255,255,255,.25)", background: "#fff", color: "#0f172a" }}
                    data-testid="input-cta-email"
                  />
                  <button 
                    type="submit"
                    className="inline-flex items-center justify-center px-4 py-3.5 rounded-full font-black text-sm"
                    style={{ background: "#f28a1a", color: "#1b1307", boxShadow: "0 14px 40px rgba(242,138,26,.25)" }}
                    data-testid="button-cta-submit"
                  >
                    Lidmaatschap starten
                  </button>
                </form>

                <div style={{ marginTop: "10px", color: "rgba(255,255,255,.78)", fontSize: "12px" }}>
                  Direct door naar onboarding en betaling.
                </div>
              </div>

              <div 
                className="p-6 flex flex-col justify-center gap-2.5"
                style={{ 
                  background: "radial-gradient(700px 300px at 40% 40%, rgba(255,255,255,.14), transparent 60%), linear-gradient(135deg, rgba(242,138,26,.95), rgba(255,159,45,.92))",
                  color: "#1b1307"
                }}
              >
                <h4 className="font-bold" style={{ fontSize: "22px", margin: 0 }}>Neem contact op</h4>
                <ul className="font-black pl-4 space-y-1.5">
                  <li className="flex items-center gap-2"><MapPinned className="w-4 h-4" /> Nederland</li>
                  <li className="flex items-center gap-2"><Phone className="w-4 h-4" /> +31 (0) ...</li>
                  <li className="flex items-center gap-2"><Mail className="w-4 h-4" /> info@openregio.nl</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-7 py-7" style={{ background: "#0b1020", color: "#e5e7eb" }} data-testid="footer">
        <div className="max-w-[1120px] mx-auto px-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex gap-3 items-center">
              <div 
                className="w-9 h-9 rounded-xl relative"
                style={{ 
                  background: "conic-gradient(from 200deg, #1f5fae, #3aa0ff, #f28a1a, #5ccf8a, #1f5fae)",
                  boxShadow: "0 8px 22px rgba(15,23,42,.08)"
                }}
              >
                <div className="absolute rounded-lg border" style={{ inset: "11px", borderColor: "rgba(255,255,255,.6)" }} />
              </div>
              <div>
                <div className="font-black">OpenRegio</div>
                <div style={{ fontSize: "12px", color: "rgba(229,231,235,.70)" }}>Samen bouwen aan een sterke regio</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <a href="#home" className="opacity-90 hover:opacity-100 hover:underline">Home</a>
              <span className="opacity-50">·</span>
              <a href="#cases" className="opacity-90 hover:opacity-100 hover:underline">Cases</a>
              <span className="opacity-50">·</span>
              <a href="#member" className="opacity-90 hover:opacity-100 hover:underline">Word lid</a>
              <span className="opacity-50">·</span>
              <a href="#contact" className="opacity-90 hover:opacity-100 hover:underline">Contact</a>
            </div>
          </div>
          <div className="h-px my-3.5" style={{ background: "rgba(255,255,255,.12)" }} />
          <div style={{ fontSize: "12px", color: "rgba(229,231,235,.70)" }}>
            © {new Date().getFullYear()} OpenRegio — Alle rechten voorbehouden. · Privacybeleid · Disclaimer
          </div>
        </div>
      </footer>
    </div>
  );
}
