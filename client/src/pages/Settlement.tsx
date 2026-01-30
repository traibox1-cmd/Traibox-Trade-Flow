import { useState } from "react";
import { Coins, CheckCircle2, Clock, XCircle } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TBChip } from "@/components/tb/TBChip";

type SettlementStatus = 'pending' | 'settled';
type SettlementNote = {
  message: string;
  timestamp: Date;
  author: string;
};

export default function Settlement() {
  const { payments, updatePayment } = useAppStore();
  const [notes, setNotes] = useState<Record<string, SettlementNote[]>>({});
  const [noteInput, setNoteInput] = useState<Record<string, string>>({});

  const handleMarkSettled = (paymentId: string) => {
    updatePayment(paymentId, { status: 'completed' });
  };

  const handleMarkPending = (paymentId: string) => {
    updatePayment(paymentId, { status: 'pending' });
  };

  const handleAddNote = (paymentId: string) => {
    const message = noteInput[paymentId]?.trim();
    if (!message) return;

    const newNote: SettlementNote = {
      message,
      timestamp: new Date(),
      author: 'Financier - Settlement Team',
    };

    setNotes({
      ...notes,
      [paymentId]: [...(notes[paymentId] || []), newNote],
    });

    setNoteInput({ ...noteInput, [paymentId]: '' });
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  const getStatusTone = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'failed': return 'error';
      case 'pending': return 'warn';
      default: return 'neutral';
    }
  };

  const pendingPayments = payments.filter(p => p.status === 'pending' || p.status === 'draft');
  const settledPayments = payments.filter(p => p.status === 'completed');

  return (
    <div className="h-full flex flex-col">
      <div className="px-8 py-6 border-b border-border">
        <div className="flex items-center gap-2">
          <Coins className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-semibold tracking-tight" data-testid="text-title-settlement">
            Settlement
          </h1>
        </div>
        <p className="text-sm text-muted-foreground mt-1">Track and manage payment settlements</p>
      </div>

      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Coins className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No payment intents found</p>
              <p className="text-sm text-muted-foreground">Payments created by operators will appear here</p>
            </div>
          ) : (
            <>
              {pendingPayments.length > 0 && (
                <div>
                  <h2 className="font-semibold text-lg mb-4">Pending Settlement ({pendingPayments.length})</h2>
                  <div className="space-y-4">
                    {pendingPayments.map((payment) => (
                      <div key={payment.id} className="rounded-2xl border bg-card p-6" data-testid={`payment-${payment.id}`}>
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">Payment to {payment.beneficiary}</h3>
                              <TBChip tone={getStatusTone(payment.status)} dataTestId={`chip-status-${payment.id}`}>
                                {payment.status}
                              </TBChip>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {formatAmount(payment.amount, payment.currency)} • {payment.rail.toUpperCase()} • {new Date(payment.createdAt).toLocaleDateString()}
                            </p>
                            {payment.notes && (
                              <p className="mt-2 text-sm">{payment.notes}</p>
                            )}
                          </div>
                        </div>

                        {notes[payment.id] && notes[payment.id].length > 0 && (
                          <div className="mb-4 p-3 rounded-xl bg-muted/50">
                            <div className="text-xs font-medium text-muted-foreground mb-2">Settlement Notes</div>
                            <div className="space-y-2">
                              {notes[payment.id].map((note, idx) => (
                                <div key={idx} className="text-sm">
                                  <div className="font-medium text-xs text-muted-foreground">{note.author} • {note.timestamp.toLocaleString()}</div>
                                  <div className="mt-1">{note.message}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="space-y-3 pt-4 border-t">
                          <Textarea
                            placeholder="Add settlement note..."
                            value={noteInput[payment.id] || ''}
                            onChange={(e) => setNoteInput({ ...noteInput, [payment.id]: e.target.value })}
                            className="min-h-[60px]"
                            data-testid={`textarea-note-${payment.id}`}
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleAddNote(payment.id)}
                              data-testid={`add-note-${payment.id}`}
                            >
                              Add Note
                            </Button>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleMarkSettled(payment.id)}
                              data-testid={`mark-settled-${payment.id}`}
                            >
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Mark Settled
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {settledPayments.length > 0 && (
                <div>
                  <h2 className="font-semibold text-lg mb-4">Settled ({settledPayments.length})</h2>
                  <div className="space-y-4">
                    {settledPayments.map((payment) => (
                      <div key={payment.id} className="rounded-2xl border bg-muted/50 p-6 opacity-75">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                              <h3 className="font-semibold">{payment.beneficiary}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {formatAmount(payment.amount, payment.currency)} • {payment.rail.toUpperCase()}
                            </p>
                          </div>
                          <TBChip tone="success" dataTestId={`chip-settled-${payment.id}`}>
                            settled
                          </TBChip>
                        </div>
                        {notes[payment.id] && notes[payment.id].length > 0 && (
                          <div className="mt-3 text-xs text-muted-foreground">
                            {notes[payment.id].length} settlement note(s)
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
