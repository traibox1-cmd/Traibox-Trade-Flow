import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { TBCard } from "../components/tb/TBCard";
import { TBChip } from "../components/tb/TBChip";
import { useRole } from "@/components/app/role";
import { Settings2, Shield } from "lucide-react";

export default function SettingsPage() {
  const { role, setRole, theme, setTheme } = useRole();

  return (
    <div className="mx-auto w-full max-w-[900px] px-4 py-6 md:px-8 md:py-10">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2">
          <div
            className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-primary/10 border border-primary/15"
            aria-hidden="true"
          >
            <Settings2 className="h-4 w-4 text-primary" />
          </div>
          <h1
            className="font-serif text-2xl tracking-tight md:text-3xl"
            data-testid="text-title-settings"
          >
            Settings
          </h1>
        </div>
        <p className="text-sm text-muted-foreground" data-testid="text-subtitle-settings">
          Preferences for role, privacy posture, and appearance.
        </p>
      </div>

      <div className="mt-5 grid gap-4">
        <TBCard
          title="Role"
          subtitle="Operator vs Financier"
          state="idle"
          icon={<Shield className="h-4 w-4" />}
          dataTestId="card-role"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium" data-testid="text-current-role">
                Current: {role === "financier" ? "Financier" : "Operator"}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                Changes navigation labels + default modules.
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={role === "operator" ? "default" : "secondary"}
                className="h-8"
                onClick={() => setRole("operator")}
                data-testid="button-role-operator"
              >
                Operator
              </Button>
              <Button
                variant={role === "financier" ? "default" : "secondary"}
                className="h-8"
                onClick={() => setRole("financier")}
                data-testid="button-role-financier"
              >
                Financier
              </Button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <TBChip
              tone={role === "operator" ? "success" : "neutral"}
              dataTestId="chip-role-operator"
            >
              Operator-first
            </TBChip>
            <TBChip
              tone={role === "financier" ? "success" : "neutral"}
              dataTestId="chip-role-financier"
            >
              Financier-first
            </TBChip>
          </div>
        </TBCard>

        <TBCard
          title="Appearance"
          subtitle="Light / dark"
          state="idle"
          icon={<Settings2 className="h-4 w-4" />}
          dataTestId="card-appearance"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium" data-testid="text-theme">
                Theme: {theme}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                A calm, trust-first palette.
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={theme === "dark"}
                onCheckedChange={(v) => setTheme(v ? "dark" : "light")}
                data-testid="switch-theme"
              />
              <TBChip tone="neutral" dataTestId="chip-theme">
                {theme}
              </TBChip>
            </div>
          </div>
        </TBCard>
      </div>
    </div>
  );
}
