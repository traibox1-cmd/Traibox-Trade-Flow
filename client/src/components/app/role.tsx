import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type TBRole = "operator" | "financier";
export type TBTheme = "light" | "dark";

type RoleCtx = {
  role: TBRole;
  setRole: (r: TBRole) => void;
  theme: TBTheme;
  setTheme: (t: TBTheme) => void;
};

const Ctx = createContext<RoleCtx | null>(null);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<TBRole>("operator");
  const [theme, setTheme] = useState<TBTheme>("light");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const value = useMemo(() => ({ role, setRole, theme, setTheme }), [role, theme]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useRole() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
}
