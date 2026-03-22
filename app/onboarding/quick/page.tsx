"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function QuickOnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><p className="text-slate-500">Loading...</p></div>}>
      <QuickOnboardingContent />
    </Suspense>
  );
}

function QuickOnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  
  const [form, setForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    companyName: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = showLogin ? "/api/auth/login" : "/api/auth/signup-quick";
      const body = showLogin
        ? { email: form.email, password: form.password }
        : form;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      // Seed demo data on quick signup
      if (!showLogin && data.org?.onboardingStatus === "demo_active") {
        await fetch("/api/auth/seed-demo", { method: "POST" });
      }

      router.push(redirect || data.redirectTo || "/dashboard");
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              T
            </div>
            <span className="text-2xl font-bold text-slate-900">TRAIBOX</span>
          </div>
          <h1 className="text-xl font-semibold text-slate-800">
            {showLogin ? "Welcome back" : "Get started in 60 seconds"}
          </h1>
          <p className="text-slate-500 mt-1">
            {showLogin
              ? "Sign in to your account"
              : "Explore the trade workspace with demo data"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="you@company.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete={showLogin ? "current-password" : "new-password"}
              minLength={8}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Minimum 8 characters"
            />
          </div>

          {!showLogin && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-1">
                    First name <span className="text-slate-400">(optional)</span>
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-1">
                    Last name <span className="text-slate-400">(optional)</span>
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-slate-700 mb-1">
                  Company name <span className="text-slate-400">(optional)</span>
                </label>
                <input
                  id="companyName"
                  type="text"
                  value={form.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Your company"
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <input
                  type="checkbox"
                  id="demo"
                  defaultChecked
                  disabled
                  className="rounded border-blue-300"
                />
                <label htmlFor="demo" className="text-sm text-blue-800">
                  Explore demo workspace with sample trade data
                </label>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
          >
            {loading
              ? "Please wait..."
              : showLogin
                ? "Sign in"
                : "Start exploring →"}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setShowLogin(!showLogin);
                setError("");
              }}
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
            >
              {showLogin ? "Create a new account" : "Already have an account? Sign in"}
            </button>
          </div>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          By continuing, you agree to TRAIBOX Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
