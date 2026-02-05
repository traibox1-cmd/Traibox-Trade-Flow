import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Plus, Upload, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";

export function NewTradeComposer() {
  const [, setLocation] = useLocation();
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { addTrade } = useAppStore();

  const handleCreate = () => {
    const tradeId = addTrade({
      title: input.trim() || "New Trade",
      corridor: "TBD",
      status: "planning",
      value: 0,
      currency: "USD",
      goods: "",
      incoterms: "",
      parties: [],
      linkedParties: [],
      documents: [],
      uploadedDocuments: [],
      logisticsMilestones: [],
      logisticsEvents: [],
      logisticsVisibility: "internal",
      timelineStep: "plan",
    });
    setLocation(`/trade/${tradeId}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl p-6 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="font-semibold text-lg">Start a new trade</h2>
          <p className="text-sm text-muted-foreground">Describe your trade or create from a template</p>
        </div>
      </div>

      <div className="relative">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="e.g. Coffee import from Ethiopia to Italy, 40 tons, FOB Addis..."
          className={`w-full resize-none bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
            focused ? "min-h-[100px]" : "min-h-[48px]"
          }`}
          data-testid="input-new-trade"
        />
      </div>

      <div className="flex items-center gap-3 mt-4">
        <Button onClick={handleCreate} className="gap-2" data-testid="btn-create-trade">
          <Plus className="w-4 h-4" />
          Create Trade
        </Button>
        <Button variant="outline" className="gap-2" disabled data-testid="btn-upload-docs">
          <Upload className="w-4 h-4" />
          Upload Docs
        </Button>
        <Button variant="outline" className="gap-2" disabled data-testid="btn-from-template">
          <FileText className="w-4 h-4" />
          From Template
        </Button>
      </div>
    </motion.div>
  );
}
