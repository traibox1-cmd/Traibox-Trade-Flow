import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Sparkles, MessageSquare, Users, ShieldCheck, Wallet, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";

type TutorialStep = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  targetRoute?: string;
  targetSelector?: string;
  position: "center" | "bottom-right" | "top-left" | "bottom-left";
};

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: "welcome",
    title: "Welcome to TRAIBOX",
    description: "Your AI-first trade workspace for managing international trade operations. Let's take a quick tour of the key features.",
    icon: <Sparkles className="w-6 h-6" />,
    position: "center",
  },
  {
    id: "trade-intelligence",
    title: "Trade Intelligence",
    description: "Chat with AI to plan trades, run compliance checks, and get insights. Use Explore Mode for general questions or Trade Mode to work on a specific trade.",
    icon: <MessageSquare className="w-6 h-6" />,
    targetRoute: "/trade-intelligence",
    targetSelector: "[data-testid='nav-intelligence']",
    position: "bottom-right",
  },
  {
    id: "my-network",
    title: "My Network",
    description: "Manage your trade partners, invite new connections, and discover potential matches for your trading needs.",
    icon: <Users className="w-6 h-6" />,
    targetRoute: "/network",
    targetSelector: "[data-testid='nav-network']",
    position: "bottom-right",
  },
  {
    id: "compliance",
    title: "Compliance & Proofs",
    description: "Run KYC/AML checks, generate proof packs, and maintain your Trade Passport for identity verification.",
    icon: <ShieldCheck className="w-6 h-6" />,
    targetRoute: "/compliance",
    targetSelector: "[data-testid='nav-compliance']",
    position: "bottom-right",
  },
  {
    id: "finance",
    title: "Finance Hub",
    description: "Manage payments, request funding, and track all financial aspects of your trades in one place.",
    icon: <Wallet className="w-6 h-6" />,
    targetRoute: "/finance",
    targetSelector: "[data-testid='nav-finance']",
    position: "bottom-right",
  },
  {
    id: "complete",
    title: "You're All Set!",
    description: "You can restart this tutorial anytime from Settings. Now let's start trading!",
    icon: <HelpCircle className="w-6 h-6" />,
    position: "center",
  },
];

export default function TutorialOverlay() {
  const [, setLocation] = useLocation();
  const { tutorialActive, tutorialStep, nextTutorialStep, prevTutorialStep, skipTutorial } = useAppStore();
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);

  const currentStep = TUTORIAL_STEPS[tutorialStep];
  const isFirstStep = tutorialStep === 0;
  const isLastStep = tutorialStep === TUTORIAL_STEPS.length - 1;

  useEffect(() => {
    if (!tutorialActive || !currentStep?.targetSelector) {
      setSpotlightRect(null);
      return;
    }

    if (currentStep.targetRoute) {
      setLocation(currentStep.targetRoute);
    }

    const timeout = setTimeout(() => {
      const element = document.querySelector(currentStep.targetSelector!);
      if (element) {
        const rect = element.getBoundingClientRect();
        setSpotlightRect(rect);
      } else {
        setSpotlightRect(null);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [tutorialActive, tutorialStep, currentStep, setLocation]);

  if (!tutorialActive) return null;

  const getTooltipPosition = () => {
    if (!spotlightRect || currentStep?.position === "center") {
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
    }

    switch (currentStep?.position) {
      case "bottom-right":
        return {
          top: `${spotlightRect.bottom + 16}px`,
          left: `${spotlightRect.left}px`,
        };
      case "top-left":
        return {
          top: `${spotlightRect.top - 16}px`,
          left: `${spotlightRect.left}px`,
          transform: "translateY(-100%)",
        };
      case "bottom-left":
        return {
          top: `${spotlightRect.bottom + 16}px`,
          right: `${window.innerWidth - spotlightRect.right}px`,
        };
      default:
        return {
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        };
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100]"
        data-testid="tutorial-overlay"
      >
        {/* Backdrop with spotlight cutout */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm">
          {spotlightRect && (
            <div
              className="absolute bg-transparent ring-4 ring-primary ring-offset-4 ring-offset-transparent rounded-lg transition-all duration-300"
              style={{
                top: spotlightRect.top - 8,
                left: spotlightRect.left - 8,
                width: spotlightRect.width + 16,
                height: spotlightRect.height + 16,
                boxShadow: `0 0 0 9999px rgba(0, 0, 0, 0.6)`,
              }}
            />
          )}
        </div>

        {/* Tooltip */}
        <motion.div
          key={tutorialStep}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="absolute z-10 w-[360px] bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
          style={getTooltipPosition()}
          data-testid="tutorial-tooltip"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-muted/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                {currentStep?.icon}
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{currentStep?.title}</h3>
                <p className="text-xs text-muted-foreground">
                  Step {tutorialStep + 1} of {TUTORIAL_STEPS.length}
                </p>
              </div>
            </div>
            <button
              onClick={skipTutorial}
              className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              data-testid="tutorial-skip"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {currentStep?.description}
            </p>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-1.5 pb-3">
            {TUTORIAL_STEPS.map((_, idx) => (
              <div
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  idx === tutorialStep ? "bg-primary" : "bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between p-4 border-t border-border bg-muted/30">
            <Button
              variant="ghost"
              size="sm"
              onClick={prevTutorialStep}
              disabled={isFirstStep}
              className="gap-1"
              data-testid="tutorial-prev"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={skipTutorial}
                data-testid="tutorial-skip-btn"
              >
                Skip Tutorial
              </Button>
              <Button
                size="sm"
                onClick={nextTutorialStep}
                className="gap-1"
                data-testid="tutorial-next"
              >
                {isLastStep ? "Get Started" : "Next"}
                {!isLastStep && <ChevronRight className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
