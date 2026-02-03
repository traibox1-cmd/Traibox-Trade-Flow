import { Redirect, Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "./lib/queryClient";
import NotFound from "@/pages/not-found";
import { AppShell } from "@/components/app/AppShell";
import { RoleProvider } from "@/components/app/role";
import TutorialOverlay from "@/components/app/TutorialOverlay";

import MySpace from "@/pages/MySpace";
import TradeIntelligence from "@/pages/TradeIntelligence";
import MyNetwork from "@/pages/MyNetwork";
import Finance from "@/pages/Finance";
import CompliancePage from "@/pages/compliance";
import Settings from "@/pages/Settings";

import CapitalConsole from "@/pages/CapitalConsole";
import FundingDesk from "@/pages/FundingDesk";
import DealAssistant from "@/pages/DealAssistant";
import Counterparties from "@/pages/Counterparties";
import RiskPolicy from "@/pages/RiskPolicy";
import Settlement from "@/pages/Settlement";
import Evidence from "@/pages/Evidence";
import TradeWorkspace from "@/pages/TradeWorkspace";
import TradeTrends from "@/pages/TradeTrends";
// Dashboard merged into MySpace

function Router() {
  return (
    <Switch>
      <Route path="/">
        <Redirect to="/space" />
      </Route>

      <Route>
        <AppShell>
          <Switch>
            {/* Operator Routes */}
            {/* Dashboard merged into My Space */}
            <Route path="/dashboard">
              <Redirect to="/space" />
            </Route>
            <Route path="/space" component={MySpace} />
            <Route path="/intelligence" component={TradeIntelligence} />
            <Route path="/trade/:id" component={TradeWorkspace} />
            <Route path="/network" component={MyNetwork} />
            <Route path="/finance" component={Finance} />
            {/* Canonical compliance route */}
            <Route path="/compliance" component={CompliancePage} />
            {/* Legacy redirect - preserve query params */}
            <Route path="/compliance-proofs">
              {() => {
                const search = window.location.search;
                return <Redirect to={`/compliance${search}`} />;
              }}
            </Route>
            <Route path="/trade-passport">
              <Redirect to="/compliance?tab=passport" />
            </Route>
            {/* Risk Assessment standalone route */}
            <Route path="/risk">
              <Redirect to="/compliance?tab=risk" />
            </Route>
            <Route path="/risk-assessment">
              <Redirect to="/compliance?tab=risk" />
            </Route>
            <Route path="/trends" component={TradeTrends} />
            
            {/* Financier Routes */}
            <Route path="/capital-console" component={CapitalConsole} />
            <Route path="/funding-desk" component={FundingDesk} />
            <Route path="/deal-assistant" component={DealAssistant} />
            <Route path="/counterparties" component={Counterparties} />
            <Route path="/risk-policy" component={RiskPolicy} />
            <Route path="/settlement" component={Settlement} />
            <Route path="/evidence" component={Evidence} />
            
            {/* Shared Routes */}
            <Route path="/settings" component={Settings} />
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
          <TutorialOverlay />
        </RoleProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
