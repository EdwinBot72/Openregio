import {
  Gavel, Globe, FileText, Search, UserCircle,
  AlertCircle, Clock, EyeOff, CheckCircle2, ChevronRight,
  ScanText, Activity, Bot, BarChart2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export function TwoPillars() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-[#1f5fae] flex items-center justify-center text-white font-bold text-lg">O</div>
          <span className="font-bold text-xl text-slate-900 tracking-tight">OpenRegio</span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <a href="#diensten" className="hover:text-[#1f5fae] transition-colors">Diensten</a>
          <a href="#prijzen" className="hover:text-[#1f5fae] transition-colors">Abonnementen</a>
          <a href="#voor-wie" className="hover:text-[#1f5fae] transition-colors">Voor wie</a>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="hidden sm:flex text-slate-600" data-testid="nav-login-btn">Inloggen</Button>
          <a href="/lidmaatschap">
            <Button className="bg-[#f28a1a] hover:bg-[#d97712] text-white font-bold" data-testid="nav-wordlid-btn">Word lid</Button>
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#0e3f86] to-[#1a5db5] pt-20 pb-24 px-6">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-white">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 leading-tight">
              Grip op regels én<br />
              <span className="text-[#f28a1a]">zichtbaarheid in je regio.</span>
            </h1>
            <p className="text-lg text-blue-100 mb-8 max-w-xl leading-relaxed">
              OpenRegio helpt ondernemers bij twee dingen: begrijpen wat de overheid doet — WOO, brieven, regelgeving — én controleren hoe zichtbaar je bent voor klanten in je regio.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="/lidmaatschap">
                <Button size="lg" className="bg-[#f28a1a] hover:bg-[#d97712] text-white font-bold px-8" data-testid="hero-lid-btn">
                  Bekijk abonnementen
                </Button>
              </a>
              <a href="#diensten">
                <Button size="lg" variant="outline" className="border-white/30 bg-white/10 hover:bg-white/20 text-white font-bold px-8" data-testid="hero-discover-btn">
                  Ontdek meer
                </Button>
              </a>
            </div>
          </div>

          {/* Dashboard preview */}
          <div className="flex-1 w-full max-w-md">
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <div className="px-4 py-3 flex items-center gap-2" style={{ background: "#1a3c6e" }}>
                <div className="flex gap-1.5">
                  {["#ff5f57","#febc2e","#28c840"].map((c, i) => (
                    <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
                  ))}
                </div>
                <span className="text-white/70 text-xs font-bold ml-1">OpenRegio Dashboard</span>
              </div>
              <div className="p-4 space-y-2" style={{ background: "#f0f4f8" }}>
                {[
                  { icon: ScanText, label: "Brief analyse", hint: "Begrijp overheidsbrieven direct", bg: "#2563eb" },
                  { icon: Gavel, label: "Woo-verzoek", hint: "Vraag informatie op bij overheid", bg: "#1f5fae" },
                  { icon: BarChart2, label: "Zichtbaarheid check", hint: "Hoe vindbaar ben je in de regio?", bg: "#059669" },
                  { icon: Bot, label: "RegioBot", hint: "Stel vragen over regelgeving", bg: "#7c3aed" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: "#fff", border: "1px solid #e2e8f0" }}>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-white" style={{ background: item.bg }}>
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{item.label}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{item.hint}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Twee-pijler sectie */}
      <section id="diensten" className="py-24 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Twee diensten. Één platform.</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Wij helpen je grip krijgen op de overheid — én controleren hoe goed klanten jou online vinden.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Pijler 1: WOO & Regelgeving */}
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="h-2 w-full bg-[#1f5fae]" />
              <CardHeader className="pb-4 pt-8 px-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-4 bg-blue-50 text-[#1f5fae] rounded-2xl">
                    <Gavel className="w-10 h-10" />
                  </div>
                  <Badge className="bg-blue-100 text-[#1f5fae] border-none font-semibold">Basis + Pro</Badge>
                </div>
                <CardTitle className="text-2xl font-bold text-slate-900 mb-3">WOO & Regelgeving</CardTitle>
                <CardDescription className="text-base text-slate-600 leading-relaxed">
                  Grip op wat de overheid besluit. Brieven begrijpen, informatie opvragen, beleid volgen.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-8 pb-6">
                <ul className="space-y-4">
                  {[
                    { label: "Brieven en besluiten begrijpen", desc: "Upload een onduidelijke brief — je krijgt direct een heldere uitleg." },
                    { label: "Woo-verzoeken opstellen", desc: "Maak in een paar stappen een waterdicht verzoek om overheidsinformatie." },
                    { label: "Beleid en regelgeving volgen", desc: "Blijf op de hoogte van wijzigingen die jouw sector direct raken." },
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#1f5fae] flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700 text-sm leading-relaxed">
                        <strong className="font-semibold">{item.label}</strong> — {item.desc}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="px-8 pb-8 pt-2">
                <a href="/lidmaatschap" className="w-full">
                  <Button className="w-full bg-[#1f5fae] hover:bg-[#174e92] text-white font-bold" data-testid="woo-lid-btn">
                    Bekijk abonnementen <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </a>
              </CardFooter>
            </Card>

            {/* Pijler 2: Zichtbaarheid checks */}
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="h-2 w-full bg-[#f28a1a]" />
              <CardHeader className="pb-4 pt-8 px-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-4 bg-orange-50 text-[#f28a1a] rounded-2xl">
                    <Activity className="w-10 h-10" />
                  </div>
                  <Badge className="bg-orange-100 text-[#c07010] border-none font-semibold">Basis + Pro</Badge>
                </div>
                <CardTitle className="text-2xl font-bold text-slate-900 mb-3">Zichtbaarheid checks</CardTitle>
                <CardDescription className="text-base text-slate-600 leading-relaxed">
                  Wij controleren hoe vindbaar jij bent in je regio — zodat je weet waar je staat.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-8 pb-6">
                <ul className="space-y-4">
                  {[
                    { label: "Online zichtbaarheid meten", desc: "Hoe goed vinden klanten jou via Google, kaarten en lokale platforms?" },
                    { label: "Bedrijfsprofiel beoordelen", desc: "Check of je gegevens kloppen en compleet zijn op alle relevante plekken." },
                    { label: "Regio-analyse opvragen", desc: "Zie hoe je presteert ten opzichte van concurrenten in jouw gemeente." },
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#f28a1a] flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700 text-sm leading-relaxed">
                        <strong className="font-semibold">{item.label}</strong> — {item.desc}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="px-8 pb-8 pt-2">
                <a href="/lidmaatschap" className="w-full">
                  <Button className="w-full bg-[#f28a1a] hover:bg-[#d97712] text-white font-bold" data-testid="zichtbaarheid-lid-btn">
                    Bekijk abonnementen <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </a>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* Probleem */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Herken je dit?</h2>
            <p className="text-slate-500 text-lg">Dit zijn de problemen waarvoor OpenRegio is gebouwd.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: AlertCircle, color: "#1f5fae", bg: "bg-blue-50", title: "Overheidsbrieven zijn onleesbaar", desc: "Vol jargon en juridische termen — je weet niet wat je ermee moet." },
              { icon: Clock, color: "#1f5fae", bg: "bg-blue-50", title: "Woo-verzoeken zijn tijdrovend", desc: "Het proces is ingewikkeld en je weet niet precies waar je recht op hebt." },
              { icon: EyeOff, color: "#f28a1a", bg: "bg-orange-50", title: "Klanten vinden je niet online", desc: "Je bent actief in de regio, maar online ben je nauwelijks zichtbaar." },
              { icon: Search, color: "#f28a1a", bg: "bg-orange-50", title: "Je weet niet hoe je scoort", desc: "Geen idee hoe je bedrijfsprofiel eruitziet voor klanten die naar je zoeken." },
            ].map((item, i) => (
              <div key={i} className="bg-slate-50 p-8 rounded-2xl flex items-start gap-5">
                <div className={`${item.bg} p-4 rounded-xl shrink-0`}>
                  <item.icon className="w-7 h-7" style={{ color: item.color }} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tools */}
      <section className="py-24 px-6" style={{ background: "#0e3f86" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-3">Vier tools die het verschil maken</h2>
            <p className="text-blue-200">Direct inzetbaar via je dashboard.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: ScanText, label: "Brief analyse", badge: "Gratis te proberen", badgeBg: "bg-blue-800", desc: "Upload een brief — krijg direct begrijpelijke uitleg en aanbevolen actie.", borderColor: "#1f5fae" },
              { icon: Gavel, label: "Woo-verzoek", badge: "Pro", badgeBg: "bg-[#f28a1a]", desc: "Genereer een compleet, juridisch kloppend Woo-verzoek in enkele stappen.", borderColor: "#1f5fae" },
              { icon: Activity, label: "Zichtbaarheid check", badge: "Basis", badgeBg: "bg-green-700", desc: "Controleer direct hoe goed klanten jou vinden op Google en lokale platforms.", borderColor: "#f28a1a" },
              { icon: Bot, label: "RegioBot", badge: "Basis + Pro", badgeBg: "bg-purple-700", desc: "Stel vragen over regels, beleid en besluiten — RegioBot antwoordt direct.", borderColor: "#7c3aed" },
            ].map((item, i) => (
              <div key={i} className="rounded-2xl p-6 flex items-start gap-5" style={{ background: "rgba(255,255,255,0.07)", borderLeft: `4px solid ${item.borderColor}` }}>
                <div className="p-3 rounded-xl flex-shrink-0" style={{ background: "rgba(255,255,255,0.10)" }}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="font-bold text-white text-base">{item.label}</span>
                    <span className={`text-xs font-bold text-white px-2 py-0.5 rounded-full ${item.badgeBg}`}>{item.badge}</span>
                  </div>
                  <p className="text-blue-200 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Voor wie */}
      <section id="voor-wie" className="py-24 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Voor ondernemers die grip willen houden.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: UserCircle, color: "#1f5fae", bg: "bg-blue-50", titel: "Zelfstandigen", tekst: "Je werkt alleen en hebt geen juridisch team. Wij helpen je de weg vinden in regels, brieven én je zichtbaarheid." },
              { icon: Globe, color: "#f28a1a", bg: "bg-orange-50", titel: "Lokale ondernemers", tekst: "Je bent geworteld in de regio. Weet wat er in de gemeente speelt en zorg dat klanten je online weten te vinden." },
              { icon: Search, color: "#059669", bg: "bg-green-50", titel: "MKB-bedrijven", tekst: "Je groeit. Hou grip op regelgeving terwijl je team uitbreidt — en check regelmatig hoe vindbaar je bent." },
            ].map((item, i) => (
              <Card key={i} className="bg-white border-slate-100 shadow-md">
                <CardContent className="p-8 text-center">
                  <div className={`w-16 h-16 ${item.bg} rounded-2xl flex items-center justify-center mx-auto mb-5`}>
                    <item.icon className="w-8 h-8" style={{ color: item.color }} />
                  </div>
                  <h3 className="font-bold text-xl mb-3 text-slate-900">{item.titel}</h3>
                  <p className="text-slate-600 leading-relaxed text-sm">{item.tekst}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Prijskaarten */}
      <section id="prijzen" className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">Kies jouw abonnement</h2>
            <p className="text-slate-500 text-lg">Transparante tarieven, geen verrassingen.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="bg-white border-slate-200 shadow-lg flex flex-col">
              <CardHeader className="pb-6 pt-10 px-10">
                <CardTitle className="text-2xl mb-2">Basis-lid</CardTitle>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">€12,95</span>
                  <span className="text-slate-400 font-medium">/maand</span>
                </div>
                <CardDescription className="text-slate-500 mt-3">Volwaardig lid van de coöperatie</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 px-10">
                <ul className="space-y-4">
                  {["Regio-inzicht (gemeente-updates, beleid)", "Brief analyse (beperkt)", "RegioBot (beperkt)", "Zichtbaarheid check", "Bedrijfsprofiel"].map((f, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#1f5fae] shrink-0" />
                      <span className="text-slate-700 text-sm">{f}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="px-10 pb-10">
                <a href="/lidmaatschap?plan=basic" className="w-full">
                  <Button variant="outline" className="w-full border-slate-300 text-slate-800 font-bold h-12" data-testid="pricing-basic-btn">Kies Basis-lid</Button>
                </a>
              </CardFooter>
            </Card>

            <Card className="flex flex-col relative shadow-2xl scale-105 z-10 text-white border-0" style={{ background: "linear-gradient(135deg, #1f5fae, #123e75)" }}>
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#f28a1a] text-white text-xs font-black px-6 py-2 rounded-full uppercase tracking-wider">
                Meest gekozen
              </div>
              <CardHeader className="pb-6 pt-12 px-10">
                <CardTitle className="text-2xl mb-2 text-white">Pro-bijdrager</CardTitle>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">€24</span>
                  <span className="text-blue-200 font-medium">/maand</span>
                </div>
                <CardDescription className="text-blue-100 mt-3">Alle tools, volledige toegang</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 px-10">
                <ul className="space-y-4">
                  {["Alles van Basis", "Brief analyse (onbeperkt)", "RegioBot onbeperkt", "Woo-verzoek genereren", "Dossiers bouwen & beheren", "Uitgebreide zichtbaarheid check", "Projecten starten in RegioCrew"].map((f, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#f28a1a] shrink-0" />
                      <span className="text-white text-sm">{f}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="px-10 pb-10">
                <a href="/lidmaatschap?plan=pro" className="w-full">
                  <Button className="w-full bg-[#f28a1a] hover:bg-[#d97712] text-white font-bold h-12" data-testid="pricing-pro-btn">Kies Pro-bijdrager</Button>
                </a>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center" style={{ background: "linear-gradient(135deg, #0e3f86, #1a5db5)" }}>
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Start met OpenRegio.</h2>
          <p className="text-blue-100 text-lg mb-10">Begrijp wat de overheid doet — en weet hoe goed klanten jou vinden.</p>
          <form onSubmit={(e) => { e.preventDefault(); window.location.href = '/lidmaatschap'; }} className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
            <Input type="email" required placeholder="E-mailadres" className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50" data-testid="cta-email-input" />
            <Button type="submit" className="h-12 px-8 bg-[#f28a1a] hover:bg-[#d97712] text-white font-bold whitespace-nowrap" data-testid="cta-submit-btn">
              Start met OpenRegio
            </Button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-slate-400 bg-slate-950 border-t border-slate-800 text-sm">
        <p>© {new Date().getFullYear()} OpenRegio · <a href="/privacy" className="hover:text-white">Privacybeleid</a> · <a href="/disclaimer" className="hover:text-white">Disclaimer</a></p>
      </footer>
    </div>
  );
}
