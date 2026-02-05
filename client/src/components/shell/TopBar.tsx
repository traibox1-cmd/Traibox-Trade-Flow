import { Search, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TopBarProps {
  title?: string;
}

export function TopBar({ title }: TopBarProps) {
  return (
    <header className="h-14 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4">
      {/* Left: Page title */}
      <div className="flex items-center gap-4">
        {title && <h1 className="text-lg font-semibold">{title}</h1>}
      </div>

      {/* Center: Search (placeholder) */}
      <div className="flex-1 max-w-md mx-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search trades, partners, documents..."
            className="w-full pl-9 pr-4 py-2 bg-muted/50 border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            data-testid="global-search"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative" data-testid="btn-notifications">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
        </Button>
        <Button variant="ghost" size="icon" data-testid="btn-profile">
          <User className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
}
