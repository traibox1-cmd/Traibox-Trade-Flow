"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Step = "company" | "profile" | "preferences" | "invite" | "review";
const STEPS: Step[] = ["company", "profile", "preferences", "invite", "review"];
const STEP_LABELS: Record<Step, string> = {
  company: "Company Details",
  profile: "Your Profile",
  preferences: "Preferences",
  invite: "Invite Finance User",
  review: "Review & Complete",
};

interface FormData {
  legalName: string;
  country: string;
  street: string;
  city: string;
  postalCode: string;
  taxId: string;
  industry: string;
  fullName: string;
  jobTitle: string;
  phone: string;
  defaultCurrency: string;
  corridorsOfInterest: string[];
  inviteEmail: string;
  inviteName: string;
}

export default function FullOnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>("company");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [session, setSession] = useState<any>(null);

  const [form, setForm] = useState<FormData>({
    legalName: "",
    country: "",
    street: "",
    city: "",
    postalCode: "",
    taxId: "",
    industry: "",
    fullName: "",
    jobTitle: "",
    phone: "",
    defaultCurrency: "USD",
    corridorsOfInterest: [],
    inviteEmail: "",
    inviteName: "",
  });

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setSession(data);
          if (data.user.name) setForm((f) => ({ ...f, fullName: data.user.name }));
        }
      })
      .catch(() => {});
  }, []);

  const stepIndex = STEPS.indexOf(currentStep);
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === STEPS.length - 1;

  const goNext = () => {
    if (!isLast) setCurrentStep(STEPS[stepIndex + 1]);
  };
  const goBack = () => {
    if (!isFirst) setCurrentStep(STEPS[stepIndex - 1]);
  };

  const handleInvite = async () => {
    if (!form.inviteEmail) return;
    setError("");
    try {
      const res = await fetch("/api/auth/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.inviteEmail,
          role: "finance",
          name: form.inviteName || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send invite");
        return;
      }
      setInviteLink(data.inviteLink);
    } catch {
      setError("Network error");
    }
  };

  const handleComplete = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/complete-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          legalName: form.legalName,
          country: form.country,
          address: {
            street: form.street,
            city: form.city,
            postalCode: form.postalCode,
            country: form.country,
          },
          taxId: form.taxId || undefined,
          industry: form.industry || undefined,
          fullName: form.fullName,
          jobTitle: form.jobTitle || undefined,
          phone: form.phone || undefined,
          defaultCurrency: form.defaultCurrency,
          corridorsOfInterest: form.corridorsOfInterest,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to complete onboarding");
        setLoading(false);
        return;
      }

      router.push(data.redirectTo || "/dashboard");
    } catch {
      setError("Network error");
      setLoading(false);
    }
  };

  const updateField = (field: keyof FormData, value: string | string[]) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const inputClass = "w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              T
            </div>
            <span className="text-2xl font-bold text-slate-900">TRAIBOX</span>
          </div>
          <h1 className="text-xl font-semibold text-slate-800">Complete your onboarding</h1>
          <p className="text-slate-500 text-sm mt-1">
            Fill in your organization details to unlock full operations
          </p>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-1 mb-6">
          {STEPS.map((step, i) => (
            <div key={step} className="flex-1">
              <div
                className={`h-1.5 rounded-full transition-colors ${
                  i <= stepIndex ? "bg-blue-600" : "bg-slate-200"
                }`}
              />
              <p
                className={`text-xs mt-1 ${
                  step === currentStep ? "text-blue-600 font-medium" : "text-slate-400"
                }`}
              >
                {STEP_LABELS[step]}
              </p>
            </div>
          ))}
        </div>

        {/* Form card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          {/* Step: Company */}
          {currentStep === "company" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-800">Company Information</h2>
              <div>
                <label className={labelClass}>Legal name *</label>
                <input className={inputClass} value={form.legalName} onChange={(e) => updateField("legalName", e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Country *</label>
                  <input className={inputClass} value={form.country} onChange={(e) => updateField("country", e.target.value)} required />
                </div>
                <div>
                  <label className={labelClass}>Tax ID</label>
                  <input className={inputClass} value={form.taxId} onChange={(e) => updateField("taxId", e.target.value)} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Street address</label>
                <input className={inputClass} value={form.street} onChange={(e) => updateField("street", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>City</label>
                  <input className={inputClass} value={form.city} onChange={(e) => updateField("city", e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Postal code</label>
                  <input className={inputClass} value={form.postalCode} onChange={(e) => updateField("postalCode", e.target.value)} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Industry</label>
                <input className={inputClass} value={form.industry} onChange={(e) => updateField("industry", e.target.value)} placeholder="e.g., Agriculture, Manufacturing" />
              </div>
            </div>
          )}

          {/* Step: Profile */}
          {currentStep === "profile" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-800">Your Profile</h2>
              <div>
                <label className={labelClass}>Full name *</label>
                <input className={inputClass} value={form.fullName} onChange={(e) => updateField("fullName", e.target.value)} required />
              </div>
              <div>
                <label className={labelClass}>Job title</label>
                <input className={inputClass} value={form.jobTitle} onChange={(e) => updateField("jobTitle", e.target.value)} placeholder="e.g., Trade Operations Manager" />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input className={inputClass} value={form.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder="+1 234 567 8900" />
              </div>
            </div>
          )}

          {/* Step: Preferences */}
          {currentStep === "preferences" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-800">Operational Preferences</h2>
              <div>
                <label className={labelClass}>Default currency</label>
                <select
                  className={inputClass}
                  value={form.defaultCurrency}
                  onChange={(e) => updateField("defaultCurrency", e.target.value)}
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="CHF">CHF - Swiss Franc</option>
                  <option value="JPY">JPY - Japanese Yen</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Corridors of interest</label>
                <p className="text-xs text-slate-500 mb-2">Select trade corridors relevant to your business</p>
                <div className="grid grid-cols-2 gap-2">
                  {["Africa ↔ Europe", "Asia ↔ Americas", "Middle East ↔ Asia", "Latin America ↔ Europe", "Intra-Africa", "Global"].map((corridor) => (
                    <label key={corridor} className="flex items-center gap-2 p-2 rounded border border-slate-200 hover:bg-slate-50 cursor-pointer text-sm">
                      <input
                        type="checkbox"
                        checked={form.corridorsOfInterest.includes(corridor)}
                        onChange={(e) => {
                          const updated = e.target.checked
                            ? [...form.corridorsOfInterest, corridor]
                            : form.corridorsOfInterest.filter((c) => c !== corridor);
                          updateField("corridorsOfInterest", updated);
                        }}
                        className="rounded border-slate-300"
                      />
                      {corridor}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step: Invite */}
          {currentStep === "invite" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-800">Invite Finance User</h2>
              <p className="text-sm text-slate-500">
                Optionally invite a finance user who can approve payments and set negotiation limits.
              </p>
              <div>
                <label className={labelClass}>Finance user email</label>
                <input className={inputClass} type="email" value={form.inviteEmail} onChange={(e) => updateField("inviteEmail", e.target.value)} placeholder="finance@company.com" />
              </div>
              <div>
                <label className={labelClass}>Name (optional)</label>
                <input className={inputClass} value={form.inviteName} onChange={(e) => updateField("inviteName", e.target.value)} />
              </div>
              <button
                type="button"
                onClick={handleInvite}
                disabled={!form.inviteEmail}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send Invite
              </button>
              {inviteLink && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-green-800 mb-1">Invite created!</p>
                  <p className="text-xs text-green-700 mb-2">Share this link with the finance user:</p>
                  <code className="block p-2 bg-white rounded border border-green-300 text-xs break-all text-green-900">
                    {inviteLink}
                  </code>
                </div>
              )}
              <p className="text-xs text-slate-400">
                You can skip this step and invite users later from Settings.
              </p>
            </div>
          )}

          {/* Step: Review */}
          {currentStep === "review" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-800">Review & Complete</h2>
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Company</p>
                  <p className="font-medium">{form.legalName}</p>
                  <p className="text-sm text-slate-600">{form.country} {form.taxId && `· Tax ID: ${form.taxId}`}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Profile</p>
                  <p className="font-medium">{form.fullName}</p>
                  <p className="text-sm text-slate-600">{[form.jobTitle, form.phone].filter(Boolean).join(" · ") || "No additional details"}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Preferences</p>
                  <p className="text-sm text-slate-600">
                    Currency: {form.defaultCurrency}
                    {form.corridorsOfInterest.length > 0 && ` · Corridors: ${form.corridorsOfInterest.join(", ")}`}
                  </p>
                </div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm text-blue-800">
                  After completing onboarding, your organization will switch to <strong>Production Mode</strong>.
                  You will be able to run formal operations including real payments and trade execution.
                </p>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between mt-6 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={goBack}
              disabled={isFirst}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ← Back
            </button>
            {isLast ? (
              <button
                type="button"
                onClick={handleComplete}
                disabled={loading || !form.legalName || !form.country || !form.fullName}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Completing..." : "Complete Onboarding ✓"}
              </button>
            ) : (
              <button
                type="button"
                onClick={goNext}
                className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
              >
                Next →
              </button>
            )}
          </div>
        </div>

        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="text-sm text-slate-400 hover:text-slate-600"
          >
            Skip for now (stay in demo mode)
          </button>
        </div>
      </div>
    </div>
  );
}
