"use client";

import React from "react";
import type { Issue } from "../types";

type Props = {
  issue: Issue;
  onClose: () => void;
};

const statusConfig: Record<string, { gradient: string; color: string; label: string; icon: string }> = {
  OPEN: { gradient: "linear-gradient(135deg, #f59e0b, #ea580c)", color: "#b45309", label: "Open", icon: "🆕" },
  IN_PROGRESS: { gradient: "linear-gradient(135deg, #3b82f6, #2563eb)", color: "#2563eb", label: "In Progress", icon: "🔧" },
  RESOLVED: { gradient: "linear-gradient(135deg, #10b981, #059669)", color: "#047857", label: "Resolved", icon: "✅" },
  REJECTED: { gradient: "linear-gradient(135deg, #ef4444, #dc2626)", color: "#b91c1c", label: "Rejected", icon: "❌" },
  CANCELLED: { gradient: "linear-gradient(135deg, #9ca3af, #6b7280)", color: "#4b5563", label: "Cancelled", icon: "🚫" },
};

const IssueDetailModal: React.FC<Props> = ({ issue, onClose }) => {
  const st = statusConfig[issue.status] || statusConfig.OPEN;

  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "24px",
          maxWidth: "680px",
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: "0 24px 80px rgba(0,0,0,0.25)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div
          style={{
            background: st.gradient,
            borderRadius: "24px 24px 0 0",
            padding: "28px 32px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
          <div style={{ position: "absolute", bottom: -40, right: 40, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative", zIndex: 1 }}>
            <div className="d-flex align-items-center gap-3">
              <div
                style={{
                  width: "52px", height: "52px", borderRadius: "16px",
                  background: "rgba(255,255,255,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px",
                }}
              >
                {st.icon}
              </div>
              <div>
                <h3 style={{ margin: 0, color: "#fff", fontWeight: 700, fontSize: "20px" }}>{st.label}</h3>
                <p style={{ margin: "4px 0 0", color: "rgba(255,255,255,0.85)", fontSize: "13px" }}>
                  {new Date(issue.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric", month: "long", year: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,0.2)",
                border: "none",
                borderRadius: "10px",
                width: "36px", height: "36px",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
                fontSize: "18px",
                color: "#fff",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.35)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.2)"; }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "28px 32px 32px" }}>
          <h4 style={{ fontWeight: 700, fontSize: "18px", color: "#1e293b", marginBottom: "6px" }}>{issue.title}</h4>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "14px", marginTop: "20px" }}>
            {[
              { label: "Employee", value: issue.employee.name },
              { label: "Department", value: issue.employee.department?.title || "-" },
              { label: "Employee Code", value: issue.employee.employeeCode || "-" },
              { label: "Status", value: st.label },
              { label: "Submitted On", value: new Date(issue.createdAt).toLocaleString("en-IN", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) },
              ...(issue.resolvedAt
                ? [{ label: "Resolved On", value: new Date(issue.resolvedAt).toLocaleString("en-IN", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) }]
                : []),
              ...(issue.resolver ? [{ label: "Handled By", value: issue.resolver.name }] : []),
            ].map((item) => (
              <div key={item.label} style={{ padding: "14px 16px", background: "#f8fafc", borderRadius: "14px", border: "1px solid #f1f5f9" }}>
                <p style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "6px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.3px" }}>{item.label}</p>
                <p style={{ fontWeight: 600, margin: 0, fontSize: "14px", color: "#1e293b" }}>{item.value}</p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "20px", padding: "18px 20px", background: "linear-gradient(135deg, #f8fafc, #f1f5f9)", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
            <p style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "8px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.3px" }}>Description</p>
            <p style={{ margin: 0, fontSize: "14px", color: "#475569", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{issue.description}</p>
          </div>

          {issue.resolutionNote && (
            <div style={{ marginTop: "16px", padding: "18px 20px", background: "#ecfdf5", borderRadius: "16px", border: "1px solid #a7f3d0" }}>
              <p style={{ fontSize: "11px", color: "#047857", marginBottom: "8px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.3px" }}>Resolution Note</p>
              <p style={{ margin: 0, fontSize: "14px", color: "#065f46", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{issue.resolutionNote}</p>
            </div>
          )}

          {issue.rejectedReason && (
            <div style={{ marginTop: "16px", padding: "18px 20px", background: "#fef2f2", borderRadius: "16px", border: "1px solid #fecaca" }}>
              <p style={{ fontSize: "11px", color: "#b91c1c", marginBottom: "8px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.3px" }}>Rejection Reason</p>
              <p style={{ margin: 0, fontSize: "14px", color: "#991b1b", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{issue.rejectedReason}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IssueDetailModal;
