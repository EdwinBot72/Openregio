import React from 'react';
import { 
  Gavel, Globe, FileText, Search, UserCircle, Settings,
  AlertCircle, Clock, EyeOff, XOctagon, CheckCircle2, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export function TwoPillars() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* 1. Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-[#1f5fae] flex items-center justify-center text-white font-bold text-lg">
            O
          </div>
          <span className="font-bold text-xl text-slate-900 tracking-tight">OpenRegio</span>
        </div>
        
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <a href="#" className="hover:text-[#1f5fae] transition-colors">Diensten</a>
          <a href="#" className="hover:text-[#1f5fae] transition-colors">Prijzen</a>
          <a href="#" className="hover:text-[#1f5fae] transition-colors">Over ons</a>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="hidden sm:flex text-slate-600 hover:text-slate-900" data-testid="nav-login-btn">
            Inloggen
          </Button>
          <Button className="bg-[#f28a1a] hover:bg-[#d97712] text-white" data-testid="nav-signup-btn">
            Word lid
          </Button>
        </div>
      </nav>

      {/* 2. Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0e3f86] to-[#1a5db5] pt-20 pb-24 md:pt-32 md:pb-36 px-6">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left text-white">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
              Grip op regels én zichtbaarheid.<br />
              <span className="text-[#f28a1a]">Voor ondernemers in je regio.</span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              OpenRegio helpt je bij twee dingen: begrijpen wat de overheid doet (WOO, brieven, regelgeving) én zorgen dat je online zichtbaar bent in je regio.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Button size="lg" className="w-full sm:w-auto bg-[#f28a1a] hover:bg-[#d97712] text-white text-base font-semibold px-8 h-14" data-testid="hero-dashboard-btn">
                Bekijk dashboard
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-blue-300/30 bg-white/10 hover:bg-white/20 text-white text-base font-semibold px-8 h-14 backdrop-blur-sm transition-all" data-testid="hero-discover-btn">
                Ontdek meer
              </Button>
            </div>
          </div>
          
          <div className="flex-1 w-full max-w-md">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
              <CardHeader className="border-b border-white/10 pb-4">
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  Jouw Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="bg-white rounded-lg p-3 flex items-center gap-3 shadow-sm hover:scale-[1.02] transition-transform cursor-pointer">
                  <div className="bg-blue-50 p-2 rounded-md"><FileText className="w-5 h-5 text-[#1f5fae]" /></div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-semibold text-slate-800">Brief analyse</div>
                    <div className="text-xs text-slate-500">Gemeente brief ontcijferen</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
                
                <div className="bg-white rounded-lg p-3 flex items-center gap-3 shadow-sm hover:scale-[1.02] transition-transform cursor-pointer">
                  <div className="bg-blue-50 p-2 rounded-md"><Gavel className="w-5 h-5 text-[#1f5fae]" /></div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-semibold text-slate-800">Woo-verzoek</div>
                    <div className="text-xs text-slate-500">Nieuw dossier openen</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>

                <div className="bg-white rounded-lg p-3 flex items-center gap-3 shadow-sm hover:scale-[1.02] transition-transform cursor-pointer">
                  <div className="bg-orange-50 p-2 rounded-md"><UserCircle className="w-5 h-5 text-[#f28a1a]" /></div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-semibold text-slate-800">Bedrijfsprofiel</div>
                    <div className="text-xs text-slate-500">Zichtbaarheid in de regio</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>

                <div className="bg-white rounded-lg p-3 flex items-center gap-3 shadow-sm hover:scale-[1.02] transition-transform cursor-pointer">
                  <div className="bg-orange-50 p-2 rounded-md"><Globe className="w-5 h-5 text-[#f28a1a]" /></div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-semibold text-slate-800">Website</div>
                    <div className="text-xs text-slate-500">Onderhoud en prestaties</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 3. Twee-pijler sectie */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Twee diensten. Één platform.</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Alles wat je nodig hebt om met vertrouwen zaken te doen en nieuwe klanten te bereiken.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            {/* Pijler 1: Blauw */}
            <Card className="border-0 shadow-xl overflow-hidden group">
              <div className="h-2 w-full bg-[#1f5fae]"></div>
              <CardHeader className="pb-4 pt-8 px-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-4 bg-blue-50 text-[#1f5fae] rounded-2xl group-hover:scale-110 transition-transform">
                    <Gavel className="w-10 h-10" />
                  </div>
                  <Badge className="bg-blue-100 text-[#1f5fae] hover:bg-blue-200 border-none font-semibold px-3 py-1">Vrij te gebruiken / Pro</Badge>
                </div>
                <CardTitle className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">WOO & Regelgeving</CardTitle>
                <CardDescription className="text-base text-slate-600 leading-relaxed">
                  Krijg grip op wat de overheid besluit en ontcijfer complexe ambtelijke taal binnen seconden.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <ul className="space-y-5">
                  <li className="flex items-start gap-4">
                    <div className="mt-1 bg-blue-50 p-1 rounded-full"><CheckCircle2 className="w-5 h-5 text-[#1f5fae]" /></div>
                    <span className="text-slate-700 text-[15px] leading-relaxed"><strong>Brieven en besluiten begrijpen:</strong> Upload een onduidelijke brief en krijg direct een heldere samenvatting.</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="mt-1 bg-blue-50 p-1 rounded-full"><CheckCircle2 className="w-5 h-5 text-[#1f5fae]" /></div>
                    <span className="text-slate-700 text-[15px] leading-relaxed"><strong>Woo-verzoeken opstellen:</strong> Maak in een paar stappen een waterdicht verzoek om informatie op te vragen.</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="mt-1 bg-blue-50 p-1 rounded-full"><CheckCircle2 className="w-5 h-5 text-[#1f5fae]" /></div>
                    <span className="text-slate-700 text-[15px] leading-relaxed"><strong>Regelgeving volgen:</strong> Blijf op de hoogte van wijzigingen die jouw sector direct raken.</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="px-8 pb-8 pt-0">
                <Button variant="ghost" className="text-[#1f5fae] hover:text-blue-800 hover:bg-blue-50 px-4 py-6 h-auto font-semibold text-base -ml-4" data-testid="more-woo-btn">
                  Meer over WOO <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </CardFooter>
            </Card>

            {/* Pijler 2: Oranje */}
            <Card className="border-0 shadow-xl overflow-hidden group">
              <div className="h-2 w-full bg-[#f28a1a]"></div>
              <CardHeader className="pb-4 pt-8 px-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-4 bg-orange-50 text-[#f28a1a] rounded-2xl group-hover:scale-110 transition-transform">
                    <Globe className="w-10 h-10" />
                  </div>
                  <Badge className="bg-orange-100 text-[#f28a1a] hover:bg-orange-200 border-none font-semibold px-3 py-1">Pro</Badge>
                </div>
                <CardTitle className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">Websites & Zichtbaarheid</CardTitle>
                <CardDescription className="text-base text-slate-600 leading-relaxed">
                  Zorg dat potentiële klanten uit de regio je moeiteloos online kunnen vinden.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <ul className="space-y-5">
                  <li className="flex items-start gap-4">
                    <div className="mt-1 bg-orange-50 p-1 rounded-full"><CheckCircle2 className="w-5 h-5 text-[#f28a1a]" /></div>
                    <span className="text-slate-700 text-[15px] leading-relaxed"><strong>Bedrijfsprofiel beheren:</strong> Eén centrale plek voor je openingstijden, contactgegevens en aanbod.</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="mt-1 bg-orange-50 p-1 rounded-full"><CheckCircle2 className="w-5 h-5 text-[#f28a1a]" /></div>
                    <span className="text-slate-700 text-[15px] leading-relaxed"><strong>Website onderhoud:</strong> Wij zorgen dat je site snel, veilig en altijd up-to-date is.</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="mt-1 bg-orange-50 p-1 rounded-full"><CheckCircle2 className="w-5 h-5 text-[#f28a1a]" /></div>
                    <span className="text-slate-700 text-[15px] leading-relaxed"><strong>Online zichtbaar zijn in de regio:</strong> Word lokaal sneller gevonden door nieuwe klanten.</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="px-8 pb-8 pt-0">
                <Button variant="ghost" className="text-[#f28a1a] hover:text-orange-700 hover:bg-orange-50 px-4 py-6 h-auto font-semibold text-base -ml-4" data-testid="more-web-btn">
                  Meer over websites <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* 4. Probleem */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Herken je dit?</h2>
            <p className="text-slate-600 text-lg">Waarom OpenRegio is gebouwd.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-50 p-8 rounded-2xl flex items-start gap-5 hover:bg-slate-100 transition-colors">
              <div className="bg-white p-4 rounded-xl shadow-sm shrink-0">
                <AlertCircle className="w-8 h-8 text-[#1f5fae]" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">Overheidsbrieven zijn onleesbaar</h3>
                <p className="text-slate-600 leading-relaxed">Vol met jargon en juridische termen waardoor je uren kwijt bent aan het ontcijferen van de echte betekenis.</p>
              </div>
            </div>

            <div className="bg-slate-50 p-8 rounded-2xl flex items-start gap-5 hover:bg-slate-100 transition-colors">
              <div className="bg-white p-4 rounded-xl shadow-sm shrink-0">
                <Clock className="w-8 h-8 text-[#1f5fae]" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">WOO-verzoeken zijn tijdrovend</h3>
                <p className="text-slate-600 leading-relaxed">Het proces is traag, formulieren zijn complex en je weet vaak niet precies waar je wettelijk recht op hebt.</p>
              </div>
            </div>

            <div className="bg-slate-50 p-8 rounded-2xl flex items-start gap-5 hover:bg-slate-100 transition-colors">
              <div className="bg-white p-4 rounded-xl shadow-sm shrink-0">
                <XOctagon className="w-8 h-8 text-[#f28a1a]" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">Je website staat al jaren niet meer bij</h3>
                <p className="text-slate-600 leading-relaxed">Verouderde informatie en een trage laadtijd zorgen ongemerkt voor een onprofessionele uitstraling.</p>
              </div>
            </div>

            <div className="bg-slate-50 p-8 rounded-2xl flex items-start gap-5 hover:bg-slate-100 transition-colors">
              <div className="bg-white p-4 rounded-xl shadow-sm shrink-0">
                <EyeOff className="w-8 h-8 text-[#f28a1a]" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">Klanten vinden je niet online</h3>
                <p className="text-slate-600 leading-relaxed">Je concurrenten staan bovenaan in de zoekresultaten, terwijl jouw bedrijf onzichtbaar blijft in de eigen regio.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Tools */}
      <section className="py-24 px-6 bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Vier tools die het verschil maken</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-slate-800 border-l-4 border-l-[#1f5fae] border-y-0 border-r-0 rounded-r-2xl">
              <CardContent className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-900/50 rounded-lg">
                      <FileText className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="font-bold text-xl text-white">Brief analyse</h3>
                  </div>
                  <Badge variant="outline" className="text-slate-300 border-slate-600">Gratis te proberen</Badge>
                </div>
                <p className="text-slate-400 text-base leading-relaxed pl-[68px]">Upload een pdf en krijg direct een begrijpelijke samenvatting in Jip-en-Janneke taal.</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-l-4 border-l-[#1f5fae] border-y-0 border-r-0 rounded-r-2xl">
              <CardContent className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-900/50 rounded-lg">
                      <Gavel className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="font-bold text-xl text-white">Woo-verzoek</h3>
                  </div>
                  <Badge className="bg-blue-500/20 text-blue-300 hover:bg-blue-500/30">Pro</Badge>
                </div>
                <p className="text-slate-400 text-base leading-relaxed pl-[68px]">Genereer met onze intelligente wizard binnen 5 minuten een juridisch kloppend Woo-verzoek.</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-l-4 border-l-[#f28a1a] border-y-0 border-r-0 rounded-r-2xl">
              <CardContent className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-900/50 rounded-lg">
                      <UserCircle className="w-6 h-6 text-orange-400" />
                    </div>
                    <h3 className="font-bold text-xl text-white">Bedrijfsprofiel</h3>
                  </div>
                  <Badge variant="outline" className="text-slate-300 border-slate-600">Basis</Badge>
                </div>
                <p className="text-slate-400 text-base leading-relaxed pl-[68px]">Beheer je bedrijfsgegevens centraal en straal vertrouwen uit naar de lokale overheid en klanten.</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-l-4 border-l-[#f28a1a] border-y-0 border-r-0 rounded-r-2xl">
              <CardContent className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-900/50 rounded-lg">
                      <Settings className="w-6 h-6 text-orange-400" />
                    </div>
                    <h3 className="font-bold text-xl text-white">Website onderhoud</h3>
                  </div>
                  <Badge className="bg-orange-500/20 text-orange-300 hover:bg-orange-500/30">Pro</Badge>
                </div>
                <p className="text-slate-400 text-base leading-relaxed pl-[68px]">Wij updaten plugins, maken back-ups en monitoren uptime zodat jij je geen zorgen hoeft te maken.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 6. Voor wie */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Voor wie is OpenRegio?</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-white border-slate-100 shadow-md hover:-translate-y-1 transition-transform">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
                  <UserCircle className="w-10 h-10 text-slate-700" />
                </div>
                <h3 className="font-bold text-xl mb-4 text-slate-900">Zelfstandigen</h3>
                <p className="text-slate-600 leading-relaxed">Je hebt geen tijd voor rompslomp. Focus op je vak, wij maken de regels behapbaar en je vindbaar.</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-100 shadow-md hover:-translate-y-1 transition-transform">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-orange-100">
                  <Globe className="w-10 h-10 text-[#f28a1a]" />
                </div>
                <h3 className="font-bold text-xl mb-4 text-slate-900">Lokale ondernemers</h3>
                <p className="text-slate-600 leading-relaxed">Van winkelier tot horeca. Weet wat er in de gemeente speelt en zorg dat klanten je online weten te vinden.</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-100 shadow-md hover:-translate-y-1 transition-transform">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-blue-100">
                  <Search className="w-10 h-10 text-[#1f5fae]" />
                </div>
                <h3 className="font-bold text-xl mb-4 text-slate-900">MKB</h3>
                <p className="text-slate-600 leading-relaxed">Versterk je positie, doe professioneel mee aan lokale aanbestedingen en hou concurrenten nauw in de gaten.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 7. Prijskaarten */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">Transparante tarieven</h2>
            <p className="text-slate-600 text-lg">Kies het abonnement dat bij jouw ambitie past.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="bg-white border-slate-200 text-slate-900 flex flex-col shadow-lg">
              <CardHeader className="pb-8 pt-10 px-10">
                <CardTitle className="text-2xl mb-2 text-slate-900">Basis-lid</CardTitle>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-slate-900">€12,95</span>
                  <span className="text-slate-500 font-medium">/maand</span>
                </div>
                <CardDescription className="text-slate-500 mt-3 text-base">Voor de basisbehoefte aan overzicht en zichtbaarheid.</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 px-10">
                <ul className="space-y-5">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span className="text-slate-700">Basis regelgeving inzichten</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span className="text-slate-700">OpenRegio Bedrijfsprofiel</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span className="text-slate-700">Maandelijks 3 brieven analyseren</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="px-10 pb-10">
                <Button variant="outline" className="w-full border-slate-300 hover:bg-slate-50 text-slate-800 font-bold h-12" data-testid="pricing-basic-btn">Kies Basis</Button>
              </CardFooter>
            </Card>

            <Card className="bg-gradient-to-br from-[#1f5fae] to-[#123e75] border-transparent text-white flex flex-col relative shadow-2xl scale-105 z-10">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#f28a1a] text-white text-sm font-bold px-6 py-2 rounded-full uppercase tracking-wider shadow-md">
                Meest gekozen
              </div>
              <CardHeader className="pb-8 pt-12 px-10">
                <CardTitle className="text-2xl mb-2 text-white">Pro-bijdrager</CardTitle>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">€24</span>
                  <span className="text-blue-200 font-medium">/maand</span>
                </div>
                <CardDescription className="text-blue-100 mt-3 text-base">Alles erop en eraan voor de proactieve ondernemer.</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 px-10">
                <ul className="space-y-5">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#f28a1a] shrink-0" />
                    <span className="text-white"><strong>Alles in Basis</strong></span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#f28a1a] shrink-0" />
                    <span className="text-white">Onbeperkt brieven analyseren</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#f28a1a] shrink-0" />
                    <span className="text-white">Woo-verzoeken module</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#f28a1a] shrink-0" />
                    <span className="text-white">Uitgebreid website onderhoud</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="px-10 pb-10">
                <Button className="w-full bg-[#f28a1a] hover:bg-[#d97712] text-white font-bold h-12 shadow-md" data-testid="pricing-pro-btn">Word Pro-bijdrager</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* 8. CTA */}
      <section className="py-24 px-6 bg-slate-900 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Klaar om te groeien in jouw regio?</h2>
          <p className="text-slate-300 text-lg mb-10 max-w-2xl mx-auto">Sluit je aan bij honderden andere ondernemers en krijg direct grip op regels en je online zichtbaarheid.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <Input type="email" placeholder="Jouw e-mailadres" className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 h-14 px-4 text-base focus-visible:ring-[#f28a1a]" data-testid="cta-email-input" />
            <Button size="lg" className="w-full sm:w-auto h-14 px-8 bg-[#f28a1a] hover:bg-[#d97712] text-white font-bold whitespace-nowrap text-base" data-testid="cta-submit-btn">
              Start met OpenRegio
            </Button>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 text-center text-slate-500 bg-slate-950 border-t border-slate-800 text-sm">
        <p>&copy; {new Date().getFullYear()} OpenRegio. Alle rechten voorbehouden.</p>
      </footer>
    </div>
  );
}
