import { lazy, Suspense } from "react";
import { Redirect, Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "./lib/queryClient";
import { AppShell } from "@/components/shell/AppShell";
import { RoleProvider } from "@/components/app/role";

import NotFound from "@/pages/not-found";
import MySpacePage from "@/pages/MySpacePage";
import TradeIntelligencePage from "@/pages/TradeIntelligencePage";
import Settings from "@/pages/Settings";
import MyNetwork from "@/pages/MyNetwork";
import Finance from "@/pages/Finance";
import Compliance from "@/pages/compliance";
import Trades from "@/pages/Trades";
import TradeWorkspace from "@/pages/TradeWorkspace";
import TradePassport from "@/pages/TradePassport";
import TradeTrends from "@/pages/TradeTrends";
import RiskAssessment from "@/pages/RiskAssessment";
import Assurance from "@/pages/Assurance";
import CapitalConsole from "@/pages/CapitalConsole";
import FundingDesk from "@/pages/FundingDesk";
import DealAssistant from "@/pages/DealAssistant";
import Counterparties from "@/pages/Counterparties";
import RiskPolicy from "@/pages/RiskPolicy";
import Settlement from "@/pages/Settlement";
import Evidence from "@/pages/Evidence";

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/">
        <Redirect to="/space" />
      </Route>

      <Route>
        <AppShell>
          <Suspense fallback={<PageLoader />}>
            <Switch>
              {/* Operator Routes */}
              <Route path="/space" component={MySpacePage} />
              <Route path="/trade" component={TradeIntelligencePage} />
              <Route path="/trade/:tradeId" component={TradeIntelligencePage} />
              <Route path="/network" component={MyNetwork} />
              <Route path="/finance" component={Finance} />
              <Route path="/compliance" component={Compliance} />
              <Route path="/trades" component={Trades} />
              <Route path="/trade-workspace/:tradeId" component={TradeWorkspace} />
              <Route path="/trade-passport" component={TradePassport} />
              <Route path="/trade-trends" component={TradeTrends} />
              <Route path="/risk-assessment" component={RiskAssessment} />
              <Route path="/assurance" component={Assurance} />

              {/* Financier Routes */}
              <Route path="/capital-console" component={CapitalConsole} />
              <Route path="/funding-desk" component={FundingDesk} />
              <Route path="/deal-assistant" component={DealAssistant} />
              <Route path="/counterparties" component={Counterparties} />
              <Route path="/risk-policy" component={RiskPolicy} />
              <Route path="/settlement" component={Settlement} />
              <Route path="/evidence" component={Evidence} />

              {/* Settings */}
              <Route path="/settings" component={Settings} />

              {/* Legacy redirects */}
              <Route path="/dashboard">
                <Redirect to="/space" />
              </Route>
              <Route path="/trade-intelligence">
                <Redirect to="/trade" />
              </Route>
              <Route path="/my-space">
                <Redirect to="/space" />
              </Route>

              <Route component={NotFound} />
            </Switch>
          </Suspense>
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
