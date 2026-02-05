import { ReactNode, useState } from "react";
import { useLocation } from "wouter";
import { LeftRail } from "./LeftRail";
import { TopBar } from "./TopBar";
import { useMediaQuery } from "@/hooks/use-media-query";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [, setLocation] = useLocation();
  const isMobile = useMediaQuery("(max-width: 767px)");

  const handleNewTrade = () => {
    setLocation("/space");
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Left Rail - hidden on mobile */}
      {!isMobile && (
        <LeftRail onNewTrade={handleNewTrade} />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
