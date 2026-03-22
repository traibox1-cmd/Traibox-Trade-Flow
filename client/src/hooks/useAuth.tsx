"use client";

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";

interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  onboardingStatus: string;
  lastLoginAt: string | null;
}

interface AuthOrg {
  id: string;
  name: string;
  onboardingStatus: string;
  demoSeeded: boolean;
  financePolicyJson: any;
}

interface AuthContextValue {
  user: AuthUser | null;
  org: AuthOrg | null;
  loading: boolean;
  isDemoMode: boolean;
  isFullyOnboarded: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [org, setOrg] = useState<AuthOrg | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setOrg(data.org);
      } else {
        setUser(null);
        setOrg(null);
      }
    } catch {
      setUser(null);
      setOrg(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setOrg(null);
    window.location.href = "/onboarding/quick";
  }, []);

  const isDemoMode = org?.onboardingStatus === "demo_active";
  const isFullyOnboarded = org?.onboardingStatus === "full_complete";

  const value = useMemo(() => ({
    user,
    org,
    loading,
    isDemoMode,
    isFullyOnboarded,
    refresh,
    logout,
  }), [user, org, loading, isDemoMode, isFullyOnboarded, refresh, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
