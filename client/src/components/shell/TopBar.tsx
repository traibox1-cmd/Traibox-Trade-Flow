import { Search, Bell, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRole } from "@/components/app/role";

export function TopBar() {
  const { role, setRole, theme, setTheme } = useRole();

  return (
    <header className="h-14 border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4 z-30">
      {/* Left: Brand + search */}
      <div className="flex items-center gap-4 flex-1">
        {/* Mobile brand */}
        <div className="flex items-center gap-2 md:hidden">
          <img src="/traibox-logo.png" alt="TRAIBOX" className="h-5 w-auto" />
          <span className="font-semibold text-sm tracking-tight">TRAIBOX</span>
        </div>

        {/* Search */}
        <div className="hidden sm:block flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
            <input
              type="text"
              placeholder="Search trades, partners, documents..."
              className="w-full pl-9 pr-4 py-2 bg-muted/30 border border-border/40 rounded-xl text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
              data-testid="global-search"
            />
          </div>
        </div>
      </div>

      {/* Right: Role switcher + theme + actions */}
      <div className="flex items-center gap-3">
        {/* Role Switcher */}
        <Tabs value={role} onValueChange={(v) => setRole(v as any)} data-testid="tabs-role">
          <TabsList className="h-9 bg-muted/40 border border-border/30" data-testid="tabslist-role">
            <TabsTrigger
              value="operator"
              className="text-xs px-3 data-[state=active]:shadow-sm"
              data-testid="tab-role-operator"
            >
              Operator
            </TabsTrigger>
            <TabsTrigger
              value="financier"
              className="text-xs px-3 data-[state=active]:shadow-sm"
              data-testid="tab-role-financier"
            >
              Financier
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-xl"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          data-testid="button-toggle-theme"
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-xl" data-testid="btn-notifications">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
        </Button>
      </div>
    </header>
  );
}
