import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Shield, FileText, Download, CheckCircle, Lock } from "lucide-react";

type Tab = "checks" | "reports" | "proofs" | "anchoring";

export default function Assurance() {
  const [location] = useLocation();
  const queryParams = new URLSearchParams(location.split("?")[1] || "");
  const tabParam = queryParams.get("tab") as Tab | null;
  const [activeTab, setActiveTab] = useState<Tab>(tabParam || "checks");

  useEffect(() => {
    if (tabParam && ["checks", "reports", "proofs", "anchoring"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  return (
    <div className="h-full flex flex-col">
      <div className="px-8 py-6 border-b border-border">
        <h1 className="text-2xl font-light tracking-tight">Compliance & Proofs</h1>
        <p className="text-sm text-muted-foreground mt-1">Compliance, verification, and proof management</p>
      </div>

      <div className="border-b border-border">
        <div className="px-8 flex gap-6">
          <button
            data-testid="tab-checks"
            onClick={() => setActiveTab("checks")}
            className={`py-3 border-b-2 transition-colors text-sm ${
              activeTab === "checks"
                ? "border-blue-500 text-foreground"
                : "border-transparent text-muted-foreground hover:text-muted-foreground"
            }`}
          >
            Checks & Findings
          </button>
          <button
            data-testid="tab-reports"
            onClick={() => setActiveTab("reports")}
            className={`py-3 border-b-2 transition-colors text-sm ${
              activeTab === "reports"
                ? "border-blue-500 text-foreground"
                : "border-transparent text-muted-foreground hover:text-muted-foreground"
            }`}
          >
            Reports
          </button>
          <button
            data-testid="tab-proofs"
            onClick={() => setActiveTab("proofs")}
            className={`py-3 border-b-2 transition-colors text-sm ${
              activeTab === "proofs"
                ? "border-blue-500 text-foreground"
                : "border-transparent text-muted-foreground hover:text-muted-foreground"
            }`}
          >
            Proof Packs
          </button>
          <button
            data-testid="tab-anchoring"
            onClick={() => setActiveTab("anchoring")}
            className={`py-3 border-b-2 transition-colors text-sm ${
              activeTab === "anchoring"
                ? "border-blue-500 text-foreground"
                : "border-transparent text-muted-foreground hover:text-muted-foreground"
            }`}
          >
            Verification & Anchoring
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8">
        {activeTab === "checks" && (
          <div className="space-y-4">
            <h2 className="text-lg font-light text-foreground">Compliance Checks</h2>
            {[
              { name: "Sanctions Screening", status: "Passed", date: "Today" },
              { name: "KYC Verification", status: "Passed", date: "2 days ago" },
              { name: "Document Review", status: "In Progress", date: "1 day ago" },
            ].map((check, i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="text-foreground font-light">{check.name}</div>
                      <div className="text-sm text-muted-foreground mt-1">{check.date}</div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs ${
                    check.status === "Passed" ? "bg-green-500/20 text-green-400" :
                    "bg-yellow-500/20 text-yellow-400"
                  }`}>
                    {check.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "reports" && (
          <div className="space-y-4">
            <h2 className="text-lg font-light text-foreground">Compliance Reports</h2>
            {[
              { title: "Q4 2025 Compliance Summary", date: "Dec 31, 2025", size: "2.4 MB" },
              { title: "Trade #1045 Audit Trail", date: "Jan 15, 2026", size: "1.8 MB" },
            ].map((report, i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="text-foreground font-light">{report.title}</div>
                      <div className="text-sm text-muted-foreground mt-1">{report.date} • {report.size}</div>
                    </div>
                  </div>
                  <button
                    data-testid={`button-download-report-${i}`}
                    className="p-2 bg-card border border-border rounded-lg hover:bg-accent transition-colors"
                  >
                    <Download className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "proofs" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-light text-foreground">Proof Packs</h2>
              <button
                data-testid="button-generate-proof"
                className="px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors text-sm"
              >
                Generate Proof Pack
              </button>
            </div>
            {[
              { title: "Trade #1045 Evidence Pack", items: 12, verified: true },
              { title: "Shipment #2891 Documents", items: 8, verified: true },
            ].map((pack, i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <div>
                      <div className="text-foreground font-light">{pack.title}</div>
                      <div className="text-sm text-muted-foreground mt-1">{pack.items} items • Verified</div>
                    </div>
                  </div>
                  <button
                    data-testid={`button-export-proof-${i}`}
                    className="px-3 py-1.5 bg-card border border-border rounded-lg hover:bg-accent transition-colors text-sm text-muted-foreground"
                  >
                    Export
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "anchoring" && (
          <div className="space-y-6">
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-blue-400 mt-1" />
                <div>
                  <h3 className="text-foreground font-light mb-2">Integrity Anchoring</h3>
                  <p className="text-sm text-white/60 mb-4">
                    Optionally anchor critical evidence to a distributed ledger for tamper-proof verification. 
                    This creates an immutable receipt of your compliance data without exposing sensitive information.
                  </p>
                  <button
                    data-testid="button-anchor-evidence"
                    className="px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors text-sm"
                  >
                    Anchor Current Evidence
                  </button>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-light text-foreground mb-4">Anchoring History</h3>
              <div className="space-y-3">
                {[
                  { record: "Trade #1045 Compliance Pack", hash: "0x8f3a2...9d4c", date: "Jan 20, 2026" },
                  { record: "Q4 2025 Audit Records", hash: "0x2b7e1...4fa8", date: "Jan 5, 2026" },
                ].map((anchor, i) => (
                  <div key={i} className="bg-card border border-border rounded-lg p-4">
                    <div className="text-foreground font-light mb-1">{anchor.record}</div>
                    <div className="text-xs text-muted-foreground font-mono">{anchor.hash}</div>
                    <div className="text-sm text-muted-foreground mt-2">{anchor.date}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
