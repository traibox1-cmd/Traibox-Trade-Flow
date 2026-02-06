import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

interface ActionDrawerProps {
  children: ReactNode;
  title?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ActionDrawer({ children, title, open = true, onOpenChange }: ActionDrawerProps) {
  const isDesktop = useMediaQuery("(min-width: 1280px)");
  const isTablet = useMediaQuery("(min-width: 1024px)");

  if (isDesktop) {
    return (
      <motion.aside
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="w-80 border-l border-border/40 bg-sidebar/40 backdrop-blur-sm flex flex-col"
      >
        {title && (
          <div className="h-14 border-b border-border/30 flex items-center px-5">
            <h2 className="font-semibold text-[13px] tracking-tight text-muted-foreground uppercase">{title}</h2>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>
      </motion.aside>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className={cn(
          "rounded-t-2xl",
          isTablet ? "max-h-[60vh]" : "max-h-[80vh]"
        )}
      >
        {title && (
          <SheetHeader className="pb-4">
            <SheetTitle className="text-[13px] uppercase tracking-tight text-muted-foreground">{title}</SheetTitle>
          </SheetHeader>
        )}
        <div className="overflow-y-auto">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}
