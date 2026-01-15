import { Switch, Route, useRoute } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ErrorBoundary } from "@/components/error-boundary";
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
import RegioCrewPage from "@/pages/regiocrew";
import BlogDetailPage from "@/pages/blog-detail";
import BlogsPage from "@/pages/blogs";
import AdminBlogsPage from "@/pages/admin/blogs";

// Routes that should NOT have the sidebar/header layout
const PUBLIC_ROUTES = ["/", "/login", "/register", "/start", "/lidmaatschap", "/betaling-geslaagd", "/first-login", "/privacy", "/voorwaarden", "/basischeck", "/blog/:slug", "/blogs"];

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
      <Route component={NotFound} />
    </Switch>
  );
}

function AuthenticatedRouter() {
  return (
    <Switch>
      <Route path="/onboarding" component={OnboardingPage} />
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
      <Route path="/regiocrew" component={RegioCrewPage} />
      <Route path="/admin/blogs" component={AdminBlogsPage} />
      <Route component={NotFound} />
    </Switch>
  );
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
  
  const isPublicRoute = isHomePage || isLoginPage || isRegisterPage || isStartPage || isLidmaatschapPage || isPaymentSuccessPage || isFirstLoginPage || isPrivacyPage || isVoorwaardenPage || isBasischeckPage || isBlogDetailPage || isBlogsPage;

  if (isPublicRoute) {
    return <PublicRouter />;
  }

  const style = {
    "--sidebar-width": "16rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between p-4 border-b shrink-0">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-y-auto p-8">
            <AuthenticatedRouter />
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
