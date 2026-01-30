import { Redirect, Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "./lib/queryClient";
import NotFound from "@/pages/not-found";
import { AppShell } from "@/components/app/AppShell";
import { RoleProvider } from "@/components/app/role";

import MySpace from "@/pages/MySpace";
import TradeIntelligence from "@/pages/TradeIntelligence";
import MyNetwork from "@/pages/MyNetwork";
import Finance from "@/pages/Finance";
import ComplianceAndProofs from "@/pages/Assurance";
import Settings from "@/pages/Settings";

function Router() {
  return (
    <Switch>
      <Route path="/">
        <Redirect to="/space" />
      </Route>

      <Route>
        <AppShell>
          <Switch>
            <Route path="/space" component={MySpace} />
            <Route path="/intelligence" component={TradeIntelligence} />
            <Route path="/network" component={MyNetwork} />
            <Route path="/finance" component={Finance} />
            <Route path="/compliance-proofs" component={ComplianceAndProofs} />
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
        </RoleProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
