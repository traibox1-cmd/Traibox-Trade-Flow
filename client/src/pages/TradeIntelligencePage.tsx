import { useState, useCallback } from "react";
import { useRoute } from "wouter";
import { TradeContextBar } from "@/components/trade/TradeContextBar";
import { TradeChat, type ChatMessage, type ActionCard } from "@/components/trade/TradeChat";
import { Composer } from "@/components/trade/Composer";
import { StepsTimeline } from "@/components/trade/StepsTimeline";
import { ActionDrawer } from "@/components/shell/ActionDrawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useAppStore, type TradeTimelineStep } from "@/lib/store";

function generateMockResponse(userMessage: string): { content: string; actions: ActionCard[] } {
  const lowerMsg = userMessage.toLowerCase();
  
  if (lowerMsg.includes("plan") || lowerMsg.includes("start")) {
    return {
      content: "I've analyzed your trade and prepared a comprehensive plan. Here's what I recommend:",
      actions: [{
        type: "plan",
        data: {
          summary: "Coffee import from Ethiopia to Italy - 40 tons FOB",
          bullets: [
            "Source verified supplier from Addis Ababa region",
            "Arrange quality inspection before shipment",
            "Set up FOB terms with port of Djibouti",
            "Schedule compliance check for EU food safety",
            "Request LC from your preferred financier",
            "Book container and arrange logistics"
          ]
        },
        traceId: `trace-${Date.now()}`
      }]
    };
  }
  
  if (lowerMsg.includes("compliance") || lowerMsg.includes("check")) {
    return {
      content: "Running compliance checks for your trade. I'll verify sanctions, AML requirements, and document verification.",
      actions: [{
        type: "plan",
        data: {
          summary: "Compliance check initiated",
          bullets: [
            "Sanctions screening: Clear",
            "AML verification: Passed",
            "Document verification: 3/5 complete",
            "Missing: Certificate of Origin, Phytosanitary Certificate"
          ]
        },
        traceId: `trace-${Date.now()}`
      }]
    };
  }
  
  if (lowerMsg.includes("fund") || lowerMsg.includes("financ")) {
    return {
      content: "I can help you request funding for this trade. Based on the trade value and corridor, here are your options:",
      actions: [{
        type: "plan",
        data: {
          summary: "Funding options available",
          bullets: [
            "Letter of Credit: Recommended for this trade size",
            "Factoring: Available at competitive rates",
            "Supply Chain Finance: Partners available in this corridor"
          ]
        },
        traceId: `trace-${Date.now()}`
      }]
    };
  }
  
  return {
    content: "I understand. Let me help you with that. Could you provide more details about what you'd like to accomplish with this trade?",
    actions: []
  };
}

export default function TradeIntelligencePage() {
  const [, params] = useRoute("/trade/:tradeId");
  const tradeId = params?.tradeId;
  
  const { trades, updateTrade } = useAppStore();
  const trade = trades.find(t => t.id === tradeId) || null;
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(true);
  
  const isDesktop = useMediaQuery("(min-width: 1280px)");

  const handleSend = useCallback((message: string, mode: "explore" | "execute") => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: message
    };
    
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const response = generateMockResponse(message);
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: response.content,
        actions: response.actions
      };
      
      setMessages(prev => [...prev, assistantMsg]);
      setLoading(false);
    }, 1000 + Math.random() * 500);
  }, []);

  const handleActionClick = useCallback((action: ActionCard) => {
    if (action.type === "plan" && trade) {
      updateTrade(trade.id, { timelineStep: "compliance" });
      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: "Great! Plan confirmed. Moving to the verification stage. I'll now run compliance checks on your trade."
      }]);
    }
  }, [trade, updateTrade]);

  const handleStepAction = useCallback((step: TradeTimelineStep) => {
    const stepMessages: Record<TradeTimelineStep, string> = {
      plan: "Let me generate a comprehensive trade plan for you.",
      compliance: "Running compliance and verification checks now.",
      funding: "I'll help you request funding offers from available financiers.",
      payments: "Let's set up the payment for this trade.",
      "proof-pack": "Generating a verifiable proof pack for this trade."
    };
    
    handleSend(stepMessages[step], "execute");
  }, [handleSend]);

  return (
    <div className="flex h-full">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TradeContextBar trade={trade} />
        
        <TradeChat
          messages={messages}
          loading={loading}
          onActionClick={handleActionClick}
        />
        
        <Composer
          onSend={handleSend}
          disabled={loading}
        />
      </div>

      {/* Right Drawer with Steps Timeline */}
      {isDesktop ? (
        <ActionDrawer title="Trade Steps">
          <StepsTimeline trade={trade} onStepAction={handleStepAction} />
        </ActionDrawer>
      ) : (
        <ActionDrawer
          title="Trade Steps"
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
        >
          <StepsTimeline trade={trade} onStepAction={handleStepAction} />
        </ActionDrawer>
      )}
    </div>
  );
}
