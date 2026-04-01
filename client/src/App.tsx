import type { CSSProperties } from "react";
import { Switch, Route, useRoute, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ErrorBoundary } from "@/components/error-boundary";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import DashboardPage from "@/pages/dashboard";
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
import WooBotPage from "@/pages/woo-bot";
import WooWizardPage from "@/pages/woo-wizard";
import WooBibliotheekPage from "@/pages/woo-bibliotheek";
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
import AffiliatePage from "@/pages/affiliate";
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
import WebsiteOnderhoudPage from "@/pages/zichtbaarheid/website-onderhoud";
import RegelkaartPage from "@/pages/informatie/regelkaart";
import CheckSituatiePage from "@/pages/actie/check-situatie";
import KennisbankPage from "@/pages/informatie/kennisbank";
import BriefAnalysePage from "@/pages/tools/brief-analyse";
import WebsiteScanPage from "@/pages/tools/website-scan";
import RegelgevingVerkennerPage from "@/pages/regelgeving-verkenner";
import IntelPage from "@/pages/intel";
import AanDeSlagPage from "@/pages/aan-de-slag";
import KoopLokaalPage from "@/pages/koop-lokaal";
import LokaalMarktplaatsPage from "@/pages/lokaal-marktplaats";
import KansenInDeBuurtPage from "@/pages/kansen-in-de-buurt";
import WetgevingIndienenPage from "@/pages/wetgeving-indienen";
import WetgevingPublicatiesPage from "@/pages/wetgeving/publicaties";
import AdminWetgevingPage from "@/pages/admin/wetgeving";

// Routes that should NOT have the sidebar/header layout
const PUBLIC_ROUTES = ["/", "/login", "/register", "/start", "/lidmaatschap", "/betaling-geslaagd", "/first-login", "/privacy", "/voorwaarden", "/basischeck", "/blog/:slug", "/blogs", "/forgot-password", "/reset-password", "/disclaimer", "/cookiebeleid", "/regio-analyse", "/koop-lokaal"];

function PublicRouter() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
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
      <Route component={NotFound} />
    </Switch>
  );
}

function AuthenticatedRouter() {
  return (
    <Switch>
      <Route path="/onboarding" component={OnboardingPage} />
      <Route path="/aan-de-slag" component={AanDeSlagPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/bedrijfsprofiel" component={BedrijfsprofielPage} />
      <Route path="/network" component={NetworkPage} />
      <Route path="/community" component={CommunityPage} />
      <Route path="/chat" component={ChatPage} />
      <Route path="/regiobot" component={RegioBotPage} />
      <Route path="/cooperative" component={CooperativePage} />
      <Route path="/privacy-dashboard" component={PrivacyDashboardPage} />
      <Route path="/pro/visibility-settings" component={ProVisibilitySettingsPage} />
      <Route path="/woo-bot" component={WooBotPage} />
      <Route path="/woo-wizard" component={WooWizardPage} />
      <Route path="/woo-bibliotheek" component={WooBibliotheekPage} />
      <Route path="/regiocrew" component={RegioCrewPage} />
      <Route path="/affiliate" component={AffiliatePage} />
      <Route path="/beleidsmonitor" component={BeleidsmonitorPage} />
      <Route path="/intel" component={IntelPage} />
      <Route path="/admin" component={AdminIndexPage} />
      <Route path="/admin/woo" component={AdminWooPage} />
      <Route path="/admin/regios" component={AdminRegiosPage} />
      <Route path="/admin/inzicht" component={AdminInzichtPage} />
      <Route path="/admin/blogs" component={AdminBlogsPage} />
      <Route path="/admin/commissions" component={AdminCommissionsPage} />
      <Route path="/admin/users" component={AdminUsersPage} />
      <Route path="/admin/regio-deals" component={RegiodealsAdminPage} />
      <Route path="/admin/ondernemers" component={AdminOndernemersPage} />
      <Route path="/admin/intel" component={AdminIntelPage} />

      {/* Kansen / Informatie */}
      <Route path="/kansen-in-de-buurt" component={KansenInDeBuurtPage} />
      <Route path="/kansen/aanbestedingen" component={AanbestedingenPage} />
      <Route path="/kansen/gemeente-updates" component={GemeenteUpdatesPage} />
      <Route path="/kansen/regio-deals" component={RegiodealsPage} />
      <Route path="/kansen/financiering" component={FinancieringPage} />
      <Route path="/informatie/regelkaart" component={RegelkaartPage} />
      <Route path="/informatie/kennisbank" component={KennisbankPage} />

      {/* Actie */}
      <Route path="/actie/check" component={CheckSituatiePage} />

      {/* Tools */}
      <Route path="/tools/brief-analyse" component={BriefAnalysePage} />
      <Route path="/tools/website-scan" component={WebsiteScanPage} />
      <Route path="/regelgeving-verkenner" component={RegelgevingVerkennerPage} />

      {/* Zichtbaarheid */}
      <Route path="/zichtbaarheid/website-onderhoud" component={WebsiteOnderhoudPage} />

      {/* Lokale marktplaats */}
      <Route path="/lokaal-marktplaats" component={LokaalMarktplaatsPage} />

      {/* Wetgeving indienen & publicaties */}
      <Route path="/wetgeving-indienen" component={WetgevingIndienenPage} />
      <Route path="/wetgeving/publicaties" component={WetgevingPublicatiesPage} />
      <Route path="/admin/wetgeving" component={AdminWetgevingPage} />

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
    // Not authenticated — redirect to login
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

  const isPublicRoute = isHomePage || isLoginPage || isRegisterPage || isStartPage || isLidmaatschapPage || isPaymentSuccessPage || isFirstLoginPage || isPrivacyPage || isVoorwaardenPage || isBasischeckPage || isBlogDetailPage || isBlogsPage || isForgotPasswordPage || isResetPasswordPage || isDisclaimerPage || isCookiebeleidPage || isRegioAnalysePage;

  if (isPublicRoute) {
    return <PublicRouter />;
  }

  const style = {
    "--sidebar-width": "16rem",
  };

  return (
    <SidebarProvider style={style as CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden bg-regio-base dark:bg-background">
          <header className="flex items-center justify-between p-4 border-b shrink-0 bg-background">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-y-auto p-6">
            <AuthGuard>
              <AuthenticatedRouter />
            </AuthGuard>
          </main>
        </div>
      </div>
    </SidebarProvider>
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
