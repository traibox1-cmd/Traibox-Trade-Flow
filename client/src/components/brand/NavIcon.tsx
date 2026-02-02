import React from "react";
import { cn } from "@/lib/utils";

interface NavIconProps {
  icon: React.ElementType;
  active?: boolean;
  notificationCount?: number;
  className?: string;
}

export function NavIcon({ icon: Icon, active = false, notificationCount, className }: NavIconProps) {
  return (
    <span
      className={cn(
        "relative inline-flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-200 ease-out",
        active
          ? "border-primary/40 bg-primary/10 text-primary shadow-sm"
          : "border-border/50 bg-background/40 text-muted-foreground hover:bg-accent/40 hover:text-foreground hover:border-border",
        className
      )}
      aria-hidden="true"
    >
      <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
      {notificationCount !== undefined && notificationCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground shadow-sm">
          {notificationCount > 9 ? '9+' : notificationCount}
        </span>
      )}
    </span>
  );
}
