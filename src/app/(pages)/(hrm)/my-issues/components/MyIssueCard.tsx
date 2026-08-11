"use client";

import React from "react";
import type { Issue } from "../../issues/types";

type Props = {
  issue: Issue;
  onCancel: (id: number) => void;
  onView: (issue: Issue) => void;
};

const statusConfig: Record<string, { gradient: string; color: string; label: string; icon: string; bg: string }> = {
  OPEN: { gradient: "linear-gradient(135deg, #f59e0b, #ea580c)", color: "#b45309", label: "Open", icon: "🆕", bg: "#fffbeb" },
  IN_PROGRESS: { gradient: "linear-gradient(135deg, #3b82f6, #2563eb)", color: "#2563eb", label: "In Progress", icon: "🔧", bg: "#eff6ff" },
  RESOLVED: { gradient: "linear-gradient(135deg, #10b981, #059669)", color: "#047857", label: "Resolved", icon: "✅", bg: "#ecfdf5" },
  REJECTED: { gradient: "linear-gradient(135deg, #ef4444, #dc2626)", color: "#b91c1c", label: "Rejected", icon: "❌", bg: "#fef2f2" },
  CANCELLED: { gradient: "linear-gradient(135deg, #9ca3af, #6b7280)", color: "#4b5563", label: "Cancelled", icon: "🚫", bg: "#f9fafb" },
};

const MyIssueCard: React.FC<Props> = ({ issue, onCancel, onView }) => {
  const st = statusConfig[issue.status] || statusConfig.OPEN;

  return (
    <div
      onClick={() => onView(issue)}
      style={{
        background: "rgba(255,255,255,0.8)",
        backdropFilter: "blur(20px)",
        borderRadius: "18px",
        padding: "22px 24px",
        border: "1px solid rgba(255,255,255,0.5)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
        cursor: "pointer",
        transition: "all 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.04)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", flexWrap: "wrap" }}>
        <div className="d-flex align-items-center gap-3">
          <div style={{
            width: "44px",
            height: "44px",
            borderRadius: "12px",
            background: st.gradient,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
            flexShrink: 0,
          }}>
            {st.icon}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: "15px", color: "#1e293b" }}>{issue.title}</div>
            <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "2px" }}>
              {new Date(issue.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{
            padding: "5px 14px",
            borderRadius: "20px",
            fontSize: "12px",
            fontWeight: 700,
            background: `${st.color}15`,
            color: st.color,
            border: `1px solid ${st.color}30`,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}>
            {st.label}
          </span>
          {issue.status === "OPEN" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCancel(issue.id);
              }}
              style={{
                border: "1px solid #fecaca",
                background: "#fef2f2",
                color: "#dc2626",
                borderRadius: "10px",
                padding: "6px 12px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#fee2e2"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#fef2f2"; }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <p style={{ margin: "14px 0 0", fontSize: "13px", color: "#6b7280", lineHeight: 1.5 }}>
        {issue.description.length > 160 ? issue.description.slice(0, 160) + "..." : issue.description}
      </p>

      {issue.rejectedReason && (
        <div style={{ marginTop: "12px", padding: "10px 14px", background: "#fef2f2", borderRadius: "12px", border: "1px solid #fecaca", fontSize: "13px", color: "#991b1b" }}>
          <strong>Reason: </strong>{issue.rejectedReason}
        </div>
      )}
      {issue.resolutionNote && (
        <div style={{ marginTop: "12px", padding: "10px 14px", background: "#ecfdf5", borderRadius: "12px", border: "1px solid #a7f3d0", fontSize: "13px", color: "#065f46" }}>
          <strong>Resolved: </strong>{issue.resolutionNote}
          {issue.resolver && <span style={{ color: "#94a3b8" }}> — {issue.resolver.name}</span>}
        </div>
      )}
    </div>
  );
};

export default MyIssueCard;
