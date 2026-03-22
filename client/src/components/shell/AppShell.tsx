import { ReactNode } from "react";
import { useLocation } from "wouter";
import { LeftRail } from "./LeftRail";
import { TopBar } from "./TopBar";
import { MobileNav } from "./MobileNav";
import { motion } from "framer-motion";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [, setLocation] = useLocation();

  const handleNewTrade = () => {
    setLocation("/space");
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <LeftRail onNewTrade={handleNewTrade} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-hidden relative">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="h-full overflow-y-auto"
          >
            {children}
          </motion.div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
