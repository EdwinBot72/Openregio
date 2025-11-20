import { Switch, Route, useRoute } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
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
import PaymentSuccessPage from "@/pages/payment-success";
import FirstLoginPage from "@/pages/first-login";

// Routes that should NOT have the sidebar/header layout
const PUBLIC_ROUTES = ["/", "/login", "/register", "/lidmaatschap", "/betaling-geslaagd", "/first-login"];

function PublicRouter() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/lidmaatschap" component={LidmaatschapPage} />
      <Route path="/betaling-geslaagd" component={PaymentSuccessPage} />
      <Route path="/first-login" component={FirstLoginPage} />
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
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const [isHomePage] = useRoute("/");
  const [isLoginPage] = useRoute("/login");
  const [isRegisterPage] = useRoute("/register");
  const [isLidmaatschapPage] = useRoute("/lidmaatschap");
  const [isPaymentSuccessPage] = useRoute("/betaling-geslaagd");
  const [isFirstLoginPage] = useRoute("/first-login");
  
  const isPublicRoute = isHomePage || isLoginPage || isRegisterPage || isLidmaatschapPage || isPaymentSuccessPage || isFirstLoginPage;

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
        <AppContent />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
