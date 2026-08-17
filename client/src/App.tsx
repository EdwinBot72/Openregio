import { Switch, Route, useRoute, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { OpenRegioTopNav } from "@/components/OpenRegioTopNav";
import { OpenRegioShell } from "@/components/OpenRegioShell";
import { ErrorBoundary } from "@/components/error-boundary";
import { useAuth } from "@/hooks/useAuth";
import { useContentProtection } from "@/hooks/useContentProtection";
import { Skeleton } from "@/components/ui/skeleton";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home";
import LandingPage from "@/pages/landing";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import BrievenagentPage from "@/pages/agents/brievenagent";
import ContractagentPage from "@/pages/agents/contractagent";
import SecretaressePage from "@/pages/agents/secretaresse";
import VandaagPage from "@/pages/vandaag";
import NetworkPage from "@/pages/network";
import CommunityPage from "@/pages/community";
import RegioBotPage from "@/pages/regiobot";
import CooperativePage from "@/pages/cooperative";
import ChatPage from "@/pages/chat";
import OnboardingPage from "@/pages/onboarding";
import LidmaatschapPage from "@/pages/lidmaatschap";
import BedrijfsprofielPage from "@/pages/bedrijfsprofiel";
import BetalingGeslaagdPage from "@/pages/betaling-geslaagd";
import FirstLoginPage from "@/pages/first-login";
import PrivacyPage from "@/pages/privacy";
import VoorwaardenPage from "@/pages/voorwaarden";
import StartPage from "@/pages/start";
import BasischeckPage from "@/pages/basischeck";
import PrivacyDashboardPage from "@/pages/privacy-dashboard";
import ProVisibilitySettingsPage from "@/pages/pro-visibility-settings";
import RegioCrewPage from "@/pages/regiocrew";
import BlogDetailPage from "@/pages/blog-detail";
import BlogsPage from "@/pages/blogs";
import AdminBlogsPage from "@/pages/admin/blogs";
import AdminCommissionsPage from "@/pages/admin/commissions";
import AdminUsersPage from "@/pages/admin/users";
import AdminIndexPage from "@/pages/admin/index";
import AdminWooPage from "@/pages/admin/woo";
import AdminRegiosPage from "@/pages/admin/regios";
import AdminInzichtPage from "@/pages/admin/inzicht";
import { AdminGate } from "@/components/AdminGate";
import AffiliatePage from "@/pages/affiliate";
import LedenPage from "@/pages/leden";
import ForgotPasswordPage from "@/pages/forgot-password";
import ResetPasswordPage from "@/pages/reset-password";
import DisclaimerPage from "@/pages/disclaimer";
import CookiebeleidPage from "@/pages/cookiebeleid";
import RegioAnalysePage from "@/pages/regio-analyse";
import BeleidsmonitorPage from "@/pages/beleidsmonitor";
import AanbestedingenPage from "@/pages/aanbestedingen";
import GemeenteUpdatesPage from "@/pages/gemeente-updates";
import FinancieringPage from "@/pages/financiering";
import RegiodealsPage from "@/pages/regio-deals";
import RegiodealsAdminPage from "@/pages/admin/regio-deals-admin";
import AdminOndernemersPage from "@/pages/admin/ondernemers";
import AdminIntelPage from "@/pages/admin/intel";
import AdviseurPage from "@/pages/admin/adviseur";
import DoeEnLeerPage from "@/pages/doe-en-leer";
import WebsiteOnderhoudPage from "@/pages/zichtbaarheid/website-onderhoud";
import RegelkaartPage from "@/pages/informatie/regelkaart";
import CheckSituatiePage from "@/pages/actie/check-situatie";
import KennisbankPage from "@/pages/informatie/kennisbank";
import BriefAnalysePage from "@/pages/tools/brief-analyse";
import ControlePage from "@/pages/tools/controle";
import WebsiteScanPage from "@/pages/tools/website-scan";
import RegelgevingVerkennerPage from "@/pages/regelgeving-verkenner";
import IntelPage from "@/pages/intel";
import AanDeSlagPage from "@/pages/aan-de-slag";
import KoopLokaalPage from "@/pages/koop-lokaal";
import LokaleBasischeckPage from "@/pages/lokale-basischeck";
import LokaalMarktplaatsPage from "@/pages/lokaal-marktplaats";
import KansenInDeBuurtPage from "@/pages/kansen-in-de-buurt";
import KansenMarktPage from "@/pages/kansen-markt";
import KansenMarktanalysePage from "@/pages/kansen-marktanalyse";
import WetgevingIndienenPage from "@/pages/wetgeving-indienen";
import WetgevingPublicatiesPage from "@/pages/wetgeving/publicaties";
import AdminWetgevingPage from "@/pages/admin/wetgeving";
import CursussenPage from "@/pages/cursussen";
import AdminCursussenPage from "@/pages/admin/cursussen";
import AdminBetalingenPage from "@/pages/admin/betalingen";
import BinnenkortPage from "@/pages/binnenkort";
import NieuwsPage from "@/pages/nieuws";
import SamenAanpakkenPage from "@/pages/samen-aanpakken";
import RegelsHelpPage from "@/pages/regels-help";
import RegelsHelpFlowPage from "@/pages/regels-help-flow";
import RegelsOverzichtPage from "@/pages/regels-overzicht";
import RegelsSectorregelPage from "@/pages/regels-sectorregels";
import RegelsOntwikkelingenPage from "@/pages/regels-ontwikkelingen";
import GezondPijlerPage from "@/pages/gezond-pijler";
import RegioScanProPage from "@/pages/pro/regioscan";
import LokaleActiesPage from "@/pages/lokale-acties";
import LokaleActieDetailPage from "@/pages/lokale-actie-detail";
import PubliekeLokaleActiePage from "@/pages/publieke-lokale-actie";
import AdminLokaleActiesPage from "@/pages/admin/lokale-acties";
import ActiesPage from "@/pages/acties";
import ActieDetailPage from "@/pages/actie-detail";
import LedenUpdatesPage from "@/pages/leden-updates";
import PijlerGripPage from "@/pages/pijler-grip";
import PijlerZichtbaarheidPage from "@/pages/pijler-zichtbaarheid";
import PijlerKrachtPage from "@/pages/pijler-kracht";

// Routes that should NOT have the sidebar/header layout
const PUBLIC_ROUTES = ["/", "/landing", "/login", "/register", "/start", "/lidmaatschap", "/betaling-geslaagd", "/first-login", "/privacy", "/voorwaarden", "/basischeck", "/blog/:slug", "/blogs", "/forgot-password", "/reset-password", "/disclaimer", "/cookiebeleid", "/regio-analyse", "/koop-lokaal", "/doe-en-leer", "/gezond/:slug", "/acties", "/acties/:id", "/p/lokale-acties/:id"];

function PublicRouter() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/landing" component={LandingPage} />
      <Route path="/doe-en-leer" component={DoeEnLeerPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/start" component={StartPage} />
      <Route path="/lidmaatschap" component={LidmaatschapPage} />
      <Route path="/betaling-geslaagd" component={BetalingGeslaagdPage} />
      <Route path="/first-login" component={FirstLoginPage} />
      <Route path="/privacy" component={PrivacyPage} />
      <Route path="/voorwaarden" component={VoorwaardenPage} />
      <Route path="/basischeck" component={BasischeckPage} />
      <Route path="/blog/:slug" component={BlogDetailPage} />
      <Route path="/blogs" component={BlogsPage} />
      <Route path="/forgot-password" component={ForgotPasswordPage} />
      <Route path="/reset-password" component={ResetPasswordPage} />
      <Route path="/disclaimer" component={DisclaimerPage} />
      <Route path="/cookiebeleid" component={CookiebeleidPage} />
      <Route path="/regio-analyse" component={RegioAnalysePage} />
      <Route path="/koop-lokaal" component={KoopLokaalPage} />
      <Route path="/gezond/:slug" component={GezondPijlerPage} />
      <Route path="/acties" component={ActiesPage} />
      <Route path="/acties/:id" component={ActieDetailPage} />
      <Route path="/p/lokale-acties/:id" component={PubliekeLokaleActiePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AuthenticatedRouter() {
  return (
    <Switch>
      {/* ── Redirects: legacy → nieuwe URLs ─────────────────────────────── */}
      <Route path="/dashboard">
        <Redirect to="/vandaag" />
      </Route>
      <Route path="/intel">
        <Redirect to="/regels/updates" />
      </Route>
      <Route path="/kansen/aanbestedingen">
        <Redirect to="/kansen/opdrachten" />
      </Route>
      <Route path="/kansen-in-de-buurt">
        <Redirect to="/kansen/in-de-buurt" />
      </Route>
      <Route path="/affiliate">
        <Redirect to="/account/affiliate" />
      </Route>
      <Route path="/bedrijfsprofiel">
        <Redirect to="/groei/profiel" />
      </Route>
      <Route path="/privacy-dashboard">
        <Redirect to="/account/instellingen" />
      </Route>
      <Route path="/pro/visibility-settings">
        <Redirect to="/groei/zichtbaarheid" />
      </Route>
      <Route path="/tools/website-scan">
        <Redirect to="/groei/website-check" />
      </Route>
      <Route path="/tools/brief-analyse">
        <Redirect to="/regels/documenten" />
      </Route>
      <Route path="/actie/check">
        <Redirect to="/regels/check" />
      </Route>
      <Route path="/woo-bibliotheek">
        <Redirect to="/regiobot" />
      </Route>
      <Route path="/regels/woo">
        <Redirect to="/regiobot" />
      </Route>
      <Route path="/cursussen">
        <Redirect to="/vandaag/acties" />
      </Route>
      <Route path="/kansen/financiering">
        <Redirect to="/kansen/opdrachten" />
      </Route>

      {/* ── Basis-sectie redirects ────────────────────────────────────────── */}
      <Route path="/kansen">
        <Redirect to="/kansen/opdrachten" />
      </Route>
      <Route path="/groei">
        <Redirect to="/groei/profiel" />
      </Route>
      <Route path="/account">
        <Redirect to="/account/instellingen" />
      </Route>

      {/* ── Vandaag (Sectie 1) — alles op één overzichtspagina ─────────── */}
      <Route path="/vandaag" component={VandaagPage} />
      <Route path="/lokale-acties" component={LokaleActiesPage} />
      <Route path="/lokale-acties/:id" component={LokaleActieDetailPage} />
      <Route path="/nieuws" component={NieuwsPage} />
      <Route path="/leden-updates" component={LedenUpdatesPage} />
      <Route path="/leden-updates/:slug">
        {(params) => <Redirect to={`/blog/${params.slug}`} />}
      </Route>
      <Route path="/vandaag/updates">
        <Redirect to="/regels/updates" />
      </Route>
      <Route path="/vandaag/acties">
        <Redirect to="/vandaag" />
      </Route>
      <Route path="/vandaag/samen">
        <Redirect to="/vandaag" />
      </Route>
      <Route path="/vandaag/nieuws">
        <Redirect to="/nieuws" />
      </Route>
      {/* Diepe links blijven werken */}
      <Route path="/cursussen-volledig" component={CursussenPage} />
      <Route path="/samen-aanpakken" component={SamenAanpakkenPage} />

      {/* ── Kansen (Sectie 2) ─────────────────────────────────────────────── */}
      <Route path="/kansen/opdrachten" component={AanbestedingenPage} />
      <Route path="/kansen/subsidies">
        <Redirect to="/kansen/opdrachten" />
      </Route>
      <Route path="/kansen/in-de-buurt" component={KansenInDeBuurtPage} />
      <Route path="/kansen/marktanalyse" component={KansenMarktanalysePage} />
      <Route path="/kansen/samenwerkingen">
        <Redirect to="/network" />
      </Route>

      {/* ── Regels (Sectie 3) — sub-routes eerst, overzicht als laatste ────── */}
      <Route path="/regels/sectorregels" component={RegelsSectorregelPage} />
      <Route path="/regels/ontwikkelingen" component={RegelsOntwikkelingenPage} />
      <Route path="/regels/updates" component={IntelPage} />
      <Route path="/regels/help" component={RegelsHelpPage} />
      <Route path="/regels/help/:flowId" component={RegelsHelpFlowPage} />
      <Route path="/regels/check" component={CheckSituatiePage} />
      <Route path="/regels/documenten" component={BriefAnalysePage} />
      <Route path="/regels/controle" component={ControlePage} />
      <Route path="/regels" component={RegelsOverzichtPage} />

      {/* ── Groei (Sectie 4) ──────────────────────────────────────────────── */}
      <Route path="/groei/zichtbaarheid" component={ProVisibilitySettingsPage} />
      <Route path="/groei/profiel" component={BedrijfsprofielPage} />
      <Route path="/groei/website-check" component={WebsiteScanPage} />

      {/* ── Pijler-landingspagina's ───────────────────────────────────────── */}
      <Route path="/pijler/grip" component={PijlerGripPage} />
      <Route path="/pijler/zichtbaarheid" component={PijlerZichtbaarheidPage} />
      <Route path="/pijler/kracht" component={PijlerKrachtPage} />

      {/* ── Pro tools ─────────────────────────────────────────────────────── */}
      <Route path="/pro/regioscan" component={RegioScanProPage} />

      {/* ── Mijn account (Sectie 5) ───────────────────────────────────────── */}
      <Route path="/account/voortgang">
        <BinnenkortPage titel="Voortgang" />
      </Route>
      <Route path="/account/instellingen" component={PrivacyDashboardPage} />
      <Route path="/account/affiliate" component={AffiliatePage} />

      {/* ── Beheer (admin) ────────────────────────────────────────────────── */}
      <Route path="/admin"><AdminGate><AdminIndexPage /></AdminGate></Route>
      <Route path="/admin/adviseur"><AdminGate><AdviseurPage /></AdminGate></Route>
      <Route path="/admin/woo"><AdminGate><AdminWooPage /></AdminGate></Route>
      <Route path="/admin/regios"><AdminGate><AdminRegiosPage /></AdminGate></Route>
      <Route path="/admin/inzicht"><AdminGate><AdminInzichtPage /></AdminGate></Route>
      <Route path="/admin/blogs"><AdminGate><AdminBlogsPage /></AdminGate></Route>
      <Route path="/admin/commissions"><AdminGate><AdminCommissionsPage /></AdminGate></Route>
      <Route path="/admin/users"><AdminGate><AdminUsersPage /></AdminGate></Route>
      <Route path="/admin/regio-deals"><AdminGate><RegiodealsAdminPage /></AdminGate></Route>
      <Route path="/admin/ondernemers"><AdminGate><AdminOndernemersPage /></AdminGate></Route>
      <Route path="/admin/intel"><AdminGate><AdminIntelPage /></AdminGate></Route>
      <Route path="/admin/wetgeving"><AdminGate><AdminWetgevingPage /></AdminGate></Route>
      <Route path="/admin/cursussen"><AdminGate><AdminCursussenPage /></AdminGate></Route>
      <Route path="/admin/betalingen"><AdminGate><AdminBetalingenPage /></AdminGate></Route>
      <Route path="/admin/lokale-acties"><AdminGate><AdminLokaleActiesPage /></AdminGate></Route>

      {/* ── Overige authenticeerde routes (intern / deeplink) ─────────────── */}
      <Route path="/onboarding" component={OnboardingPage} />
      <Route path="/aan-de-slag" component={AanDeSlagPage} />
      <Route path="/network" component={NetworkPage} />
      <Route path="/community" component={CommunityPage} />
      <Route path="/chat" component={ChatPage} />
      <Route path="/regiobot" component={RegioBotPage} />
      <Route path="/cooperative" component={CooperativePage} />
      <Route path="/woo-bot"><Redirect to="/regiobot" /></Route>
      <Route path="/woo-wizard"><Redirect to="/regiobot" /></Route>
      <Route path="/agents/brievenagent" component={BrievenagentPage} />
      <Route path="/agents/contractagent" component={ContractagentPage} />
      <Route path="/agents/secretaresse" component={SecretaressePage} />
      <Route path="/regiocrew" component={RegioCrewPage} />
      <Route path="/leden" component={LedenPage} />
      <Route path="/beleidsmonitor" component={BeleidsmonitorPage} />
      <Route path="/lokale-basischeck" component={LokaleBasischeckPage} />
      <Route path="/kansen-markt" component={KansenMarktPage} />
      <Route path="/kansen/gemeente-updates" component={GemeenteUpdatesPage} />
      <Route path="/kansen/regio-deals" component={RegiodealsPage} />
      <Route path="/informatie/regelkaart" component={RegelkaartPage} />
      <Route path="/informatie/kennisbank" component={KennisbankPage} />
      <Route path="/regelgeving-verkenner" component={RegelgevingVerkennerPage} />
      <Route path="/zichtbaarheid/website-onderhoud" component={WebsiteOnderhoudPage} />
      <Route path="/lokaal-marktplaats" component={LokaalMarktplaatsPage} />
      <Route path="/wetgeving-indienen" component={WetgevingIndienenPage} />
      <Route path="/wetgeving/publicaties" component={WetgevingPublicatiesPage} />

      <Route component={NotFound} />
    </Switch>
  );
}

// Central guard: shows loading, redirects to /login or /first-login when needed
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="flex-1 p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!user) {
    setLocation("/login");
    return null;
  }

  if (user.mustCompleteOnboarding) {
    setLocation("/first-login");
    return null;
  }

  return <>{children}</>;
}

function AppContent() {
  useContentProtection();
  const [isHomePage] = useRoute("/");
  const [isLoginPage] = useRoute("/login");
  const [isRegisterPage] = useRoute("/register");
  const [isStartPage] = useRoute("/start");
  const [isLidmaatschapPage] = useRoute("/lidmaatschap");
  const [isPaymentSuccessPage] = useRoute("/betaling-geslaagd");
  const [isFirstLoginPage] = useRoute("/first-login");
  const [isPrivacyPage] = useRoute("/privacy");
  const [isVoorwaardenPage] = useRoute("/voorwaarden");
  const [isBasischeckPage] = useRoute("/basischeck");
  const [isBlogDetailPage] = useRoute("/blog/:slug");
  const [isBlogsPage] = useRoute("/blogs");
  const [isForgotPasswordPage] = useRoute("/forgot-password");
  const [isResetPasswordPage] = useRoute("/reset-password");
  const [isDisclaimerPage] = useRoute("/disclaimer");
  const [isCookiebeleidPage] = useRoute("/cookiebeleid");
  const [isRegioAnalysePage] = useRoute("/regio-analyse");
  const [isKoopLokaalPage] = useRoute("/koop-lokaal");
  const [isGezondPijlerPage] = useRoute("/gezond/:slug");
  const [isActiesPage] = useRoute("/acties");
  const [isActieDetailPage] = useRoute("/acties/:id");
  const [isPubLokaleActiePage] = useRoute("/p/lokale-acties/:id");

  // /lidmaatschap krijgt de top-nav, maar blijft publiek bereikbaar.
  // Daarom NIET in PUBLIC_ROUTES en NIET in AuthGuard, maar in een eigen
  // layout-tak hieronder.
  const isPublicRoute = isHomePage || isLoginPage || isRegisterPage || isStartPage || isPaymentSuccessPage || isFirstLoginPage || isPrivacyPage || isVoorwaardenPage || isBasischeckPage || isBlogDetailPage || isBlogsPage || isForgotPasswordPage || isResetPasswordPage || isDisclaimerPage || isCookiebeleidPage || isRegioAnalysePage || isKoopLokaalPage || isGezondPijlerPage || isActiesPage || isActieDetailPage || isPubLokaleActiePage;

  if (isPublicRoute) {
    return <PublicRouter />;
  }

  // /lidmaatschap: publieke pagina met OpenRegio top-nav (top-nav past zich
  // aan op basis van of de gebruiker is ingelogd)
  if (isLidmaatschapPage) {
    return (
      <div className="openregio-page" data-testid="layout-openregio-topnav-public">
        <OpenRegioTopNav />
        <main className="flex-1 protected-content">
          <LidmaatschapPage />
        </main>
      </div>
    );
  }

  // Alle ingelogde pagina's krijgen de nieuwe OpenRegio shell (topbar + sidebar + footer)
  return (
    <AuthGuard>
      <OpenRegioShell>
        <AuthenticatedRouter />
      </OpenRegioShell>
    </AuthGuard>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
