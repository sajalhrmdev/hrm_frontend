"use client";

import React from "react";

type Resignation = {
  id: number;
  resignationDate: string;
  lastWorkingDay: string;
  noticePeriodDays: number;
  reason?: string;
  handoverTo?: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  rejectionReason?: string;
  approvedAt?: string;
  createdAt: string;
  employee: { id: number; name: string; department?: { title: string } | null };
  approver?: { id: number; name: string } | null;
};

type Props = {
  resignation: Resignation;
  onCancel: () => void;
  onNewResignation: () => void;
};

const statusConfig: Record<string, { gradient: string; color: string; label: string; icon: string; bg: string }> = {
  PENDING: { gradient: "linear-gradient(135deg, #f59e0b, #ea580c)", color: "#b45309", label: "Pending Approval", icon: "⏳", bg: "#fffbeb" },
  APPROVED: { gradient: "linear-gradient(135deg, #10b981, #059669)", color: "#047857", label: "Approved", icon: "✅", bg: "#ecfdf5" },
  REJECTED: { gradient: "linear-gradient(135deg, #ef4444, #dc2626)", color: "#b91c1c", label: "Rejected", icon: "❌", bg: "#fef2f2" },
  CANCELLED: { gradient: "linear-gradient(135deg, #9ca3af, #6b7280)", color: "#4b5563", label: "Cancelled", icon: "🚫", bg: "#f9fafb" },
};

const steps = ["Submitted", "Under Review", "Approved", "Completed"];
const stepIcons = ["📝", "🔍", "✅", "🎉"];

const MyResignationCard: React.FC<Props> = ({ resignation, onCancel, onNewResignation }) => {
  const st = statusConfig[resignation.status] || statusConfig.PENDING;

  const currentStep = resignation.status === "PENDING" ? 1 : resignation.status === "APPROVED" ? 2 : resignation.status === "REJECTED" ? 2 : 0;

  return (
    <div style={{ maxWidth: "720px", margin: "0 auto" }}>
      {/* Status Banner */}
      <div style={{
        background: st.gradient,
        borderRadius: "24px",
        padding: "32px",
        marginBottom: "24px",
        position: "relative",
        overflow: "hidden",
        boxShadow: `0 16px 40px ${st.color}25`,
      }}>
        <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
        <div style={{ position: "absolute", bottom: -40, right: 40, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: "16px", position: "relative", zIndex: 1 }}>
          <div style={{
            width: "56px",
            height: "56px",
            borderRadius: "16px",
            background: "rgba(255,255,255,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "28px",
          }}>
            {st.icon}
          </div>
          <div>
            <h3 style={{ margin: 0, color: "#fff", fontWeight: 700, fontSize: "22px" }}>{st.label}</h3>
            <p style={{ margin: "4px 0 0", color: "rgba(255,255,255,0.85)", fontSize: "14px" }}>
              Submitted on {new Date(resignation.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        </div>
        {resignation.rejectionReason && (
          <div style={{ marginTop: "16px", padding: "12px 16px", background: "rgba(255,255,255,0.15)", borderRadius: "14px", backdropFilter: "blur(10px)", position: "relative", zIndex: 1 }}>
            <strong style={{ fontSize: "12px", color: "rgba(255,255,255,0.9)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Rejection Reason</strong>
            <p style={{ margin: "4px 0 0", fontSize: "14px", color: "#fff" }}>{resignation.rejectionReason}</p>
          </div>
        )}
      </div>

      {/* Progress Timeline */}
      <div style={{
        background: "rgba(255,255,255,0.8)",
        backdropFilter: "blur(20px)",
        borderRadius: "20px",
        padding: "28px 32px",
        marginBottom: "24px",
        border: "1px solid rgba(255,255,255,0.5)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
      }}>
        <h4 style={{ fontWeight: 700, fontSize: "16px", color: "#374151", marginBottom: "24px" }}>Progress</h4>
        <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
          <div style={{ position: "absolute", top: "20px", left: "40px", right: "40px", height: "3px", background: "#e5e7eb", zIndex: 0 }} />
          <div style={{ position: "absolute", top: "20px", left: "40px", width: `${Math.min((currentStep / (steps.length - 1)) * 100, 100)}%`, height: "3px", background: st.gradient, zIndex: 1, transition: "width 0.5s ease" }} />
          {steps.map((step, i) => {
            const done = i <= currentStep && resignation.status !== "REJECTED" && resignation.status !== "CANCELLED";
            return (
              <div key={step} style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 2, flex: 1 }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: done ? st.gradient : "#f3f4f6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                  boxShadow: done ? `0 4px 12px ${st.color}30` : "none",
                  border: done ? "none" : "2px solid #e5e7eb",
                  transition: "all 0.3s",
                }}>
                  {done ? stepIcons[i] : <span style={{ fontSize: "12px", color: "#9ca3af" }}>{i + 1}</span>}
                </div>
                <span style={{ marginTop: "10px", fontSize: "12px", fontWeight: done ? 600 : 400, color: done ? "#374151" : "#9ca3af", textAlign: "center" }}>{step}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Details Card */}
      <div style={{ background: "rgba(255,255,255,0.8)", backdropFilter: "blur(20px)", borderRadius: "24px", padding: "32px", border: "1px solid rgba(255,255,255,0.5)", boxShadow: "0 8px 32px rgba(0,0,0,0.06)" }}>
        <h4 style={{ fontWeight: 700, marginBottom: "24px", fontSize: "18px", color: "#1e293b" }}>Resignation Details</h4>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "20px" }}>
          {[
            { label: "Employee", value: resignation.employee.name },
            { label: "Department", value: resignation.employee.department?.title || "-" },
            { label: "Resignation Date", value: new Date(resignation.resignationDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) },
            { label: "Last Working Day", value: resignation.lastWorkingDay ? new Date(resignation.lastWorkingDay).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "TBD by HR", highlight: !!resignation.lastWorkingDay },
            { label: "Notice Period", value: resignation.noticePeriodDays > 0 ? `${resignation.noticePeriodDays} days` : "TBD by HR" },
            ...(resignation.handoverTo ? [{ label: "Handover To", value: resignation.handoverTo }] : []),
            ...(resignation.approver ? [{ label: resignation.status === "APPROVED" ? "Approved By" : "Reviewed By", value: resignation.approver.name }] : []),
          ].map((item) => (
            <div key={item.label} style={{ padding: "14px 16px", background: "#f8fafc", borderRadius: "14px", border: "1px solid #f1f5f9" }}>
              <p style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "6px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.3px" }}>{item.label}</p>
              <p style={{ fontWeight: 600, margin: 0, fontSize: "15px", color: item.highlight ? "#dc2626" : "#1e293b" }}>{item.value}</p>
            </div>
          ))}
        </div>

        {resignation.reason && (
          <div style={{ marginTop: "20px", padding: "18px 20px", background: "linear-gradient(135deg, #f8fafc, #f1f5f9)", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
            <p style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "8px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.3px" }}>Reason</p>
            <p style={{ margin: 0, fontSize: "14px", color: "#475569", lineHeight: 1.6 }}>{resignation.reason}</p>
          </div>
        )}

        {/* Action Buttons */}
        {(resignation.status === "PENDING" || resignation.status === "REJECTED" || resignation.status === "CANCELLED") && (
          <div style={{ marginTop: "28px", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
            {resignation.status === "PENDING" && (
              <button onClick={onCancel} style={{
                border: "1px solid #fecaca",
                padding: "12px 24px",
                borderRadius: "14px",
                fontWeight: 600,
                cursor: "pointer",
                background: "#fef2f2",
                color: "#dc2626",
                fontSize: "14px",
                transition: "all 0.2s",
              }} onMouseEnter={(e) => { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.borderColor = "#fca5a5"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "#fef2f2"; e.currentTarget.style.borderColor = "#fecaca"; }}>
                Cancel Resignation
              </button>
            )}
            {(resignation.status === "REJECTED" || resignation.status === "CANCELLED") && (
              <button onClick={onNewResignation} style={{
                border: "none",
                padding: "12px 24px",
                borderRadius: "14px",
                fontWeight: 600,
                cursor: "pointer",
                background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                color: "#fff",
                fontSize: "14px",
                transition: "all 0.2s",
                boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
              }} onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(99,102,241,0.4)"; }} onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(99,102,241,0.3)"; }}>
                Submit New Resignation
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyResignationCard;
