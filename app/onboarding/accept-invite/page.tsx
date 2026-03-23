"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><p className="text-slate-500">Loading...</p></div>}>
      <AcceptInviteContent />
    </Suspense>
  );
}

function AcceptInviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [form, setForm] = useState({ password: "", name: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/accept-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password: form.password,
          name: form.name || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to accept invite");
        setLoading(false);
        return;
      }

      router.push(data.redirectTo || "/dashboard");
    } catch {
      setError("Network error");
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-w-md w-full text-center">
          <h1 className="text-lg font-semibold text-slate-800 mb-2">Invalid Invite</h1>
          <p className="text-sm text-slate-500">This invite link is missing or invalid. Please ask your organization admin for a new invite.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              T
            </div>
            <span className="text-2xl font-bold text-slate-900">TRAIBOX</span>
          </div>
          <h1 className="text-xl font-semibold text-slate-800">Join your team</h1>
          <p className="text-slate-500 text-sm mt-1">Set up your account to start collaborating</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Your name</label>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">Create a password</label>
            <input
              id="password"
              type="password"
              required
              autoComplete="new-password"
              minLength={8}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Minimum 8 characters"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
          >
            {loading ? "Setting up..." : "Accept Invite & Join"}
          </button>
        </form>
      </div>
    </div>
  );
}
