import { Redirect, Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "./lib/queryClient";
import NotFound from "@/pages/not-found";
import { AppShell } from "@/components/shell/AppShell";
import { RoleProvider } from "@/components/app/role";

import MySpacePage from "@/pages/MySpacePage";
import TradeIntelligencePage from "@/pages/TradeIntelligencePage";
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
            {/* Main Routes */}
            <Route path="/space" component={MySpacePage} />
            <Route path="/trade" component={TradeIntelligencePage} />
            <Route path="/trade/:tradeId" component={TradeIntelligencePage} />
            
            {/* Settings */}
            <Route path="/settings" component={Settings} />
            
            {/* Legacy redirects */}
            <Route path="/dashboard">
              <Redirect to="/space" />
            </Route>
            <Route path="/trade-intelligence">
              <Redirect to="/trade" />
            </Route>
            
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
