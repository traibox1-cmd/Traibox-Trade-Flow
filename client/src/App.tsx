import { Redirect, Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "./lib/queryClient";
import NotFound from "@/pages/not-found";
import { AppShell } from "@/components/app/AppShell";
import { RoleProvider } from "@/components/app/role";

import SpacePage from "@/pages/space";
import AssistantPage from "@/pages/assistant";
import TradeWorkspacePage from "@/pages/trade";
import NetworkPage from "@/pages/network";
import CompliancePage from "@/pages/compliance";
import FinancePage from "@/pages/finance";
import PaymentsPage from "@/pages/payments";
import ProofsPage from "@/pages/proofs";
import SettingsPage from "@/pages/settings";

function Router() {
  return (
    <Switch>
      <Route path="/">
        <Redirect to="/space" />
      </Route>

      <Route>
        <AppShell>
          <Switch>
            <Route path="/space" component={SpacePage} />
            <Route path="/assistant" component={AssistantPage} />
            <Route path="/trade/:id" component={TradeWorkspacePage} />
            <Route path="/network" component={NetworkPage} />
            <Route path="/compliance" component={CompliancePage} />
            <Route path="/finance" component={FinancePage} />
            <Route path="/payments" component={PaymentsPage} />
            <Route path="/proofs" component={ProofsPage} />
            <Route path="/settings" component={SettingsPage} />
            <Route component={NotFound} />
          </Switch>
        </AppShell>
      </Route>
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <RoleProvider>
          <Router />
        </RoleProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
