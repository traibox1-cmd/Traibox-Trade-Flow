import { useLocation } from "wouter";
import { CreditCard, ChevronRight, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";

export function PaymentsWidget() {
  const [, setLocation] = useLocation();
  const { payments } = useAppStore();

  const pending = payments.filter((p) => p.status === "pending");
  const completed = payments.filter((p) => p.status === "completed");

  return (
    <div className="bg-card border border-border/40 rounded-2xl p-5 shadow-xs h-full">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-violet-500" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">Payments</h3>
          <p className="text-xs text-muted-foreground/70">Payment instructions</p>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="text-center">
          <p className="text-2xl font-semibold tabular-nums text-amber-500">{pending.length}</p>
          <p className="text-[11px] text-muted-foreground/60">Pending</p>
        </div>
        <div className="h-8 w-px bg-border/40" />
        <div className="text-center">
          <p className="text-2xl font-semibold tabular-nums text-emerald-500">{completed.length}</p>
          <p className="text-[11px] text-muted-foreground/60">Completed</p>
        </div>
      </div>

      {payments.length === 0 ? (
        <p className="text-[12px] text-muted-foreground/50 text-center py-2">
          No payments yet
        </p>
      ) : (
        payments.slice(0, 3).map((payment) => (
          <div
            key={payment.id}
            className="flex items-center gap-2.5 py-2 border-t border-border/20"
          >
            <div className="w-7 h-7 rounded-lg bg-muted/40 flex items-center justify-center flex-shrink-0">
              {payment.status === "completed" ? (
                <ArrowDownRight className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <ArrowUpRight className="w-3.5 h-3.5 text-amber-500" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-medium truncate">{payment.beneficiary}</p>
              <p className="text-[10px] text-muted-foreground/50">{payment.rail.toUpperCase()}</p>
            </div>
            <span className="text-[12px] font-semibold tabular-nums flex-shrink-0">
              {payment.currency} {payment.amount.toLocaleString()}
            </span>
          </div>
        ))
      )}

      <Button
        variant="outline"
        size="sm"
        className="w-full gap-2 rounded-xl mt-3"
        onClick={() => setLocation("/finance")}
        data-testid="widget-btn-open-payments"
      >
        View Payments
        <ChevronRight className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}
