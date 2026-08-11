"use client";

import React, { useState } from "react";

type Props = {
  issueTitle: string;
  employeeName: string;
  onClose: () => void;
  onConfirm: (note: string) => void;
  loading?: boolean;
};

const ResolveIssueModal: React.FC<Props> = ({ issueTitle, employeeName, onClose, onConfirm, loading }) => {
  const [note, setNote] = useState("");

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "13px 16px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    fontSize: "14px",
    outline: "none",
    transition: "border 0.2s",
    boxSizing: "border-box" as const,
    resize: "vertical" as const,
    lineHeight: 1.5,
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999, backdropFilter: "blur(6px)" }} onClick={onClose}>
      <div style={{
        width: "95%", maxWidth: "460px", background: "#fff", borderRadius: "24px", padding: "0",
        boxShadow: "0 25px 60px rgba(0,0,0,0.25)", overflow: "hidden", animation: "slideUp 0.3s ease",
        maxHeight: "90vh", overflowY: "auto",
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: "28px 28px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "linear-gradient(135deg, #10b981, #059669)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", boxShadow: "0 4px 12px rgba(16,185,129,0.3)" }}>✅</div>
              <div>
                <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: "#1e293b" }}>Resolve Issue</h2>
                <p style={{ margin: "2px 0 0", color: "#64748b", fontSize: "13px" }}>{issueTitle} — {employeeName}</p>
              </div>
            </div>
            <button onClick={onClose} style={{ border: "none", background: "#f1f5f9", width: "36px", height: "36px", borderRadius: "10px", cursor: "pointer", fontSize: "16px", color: "#64748b", transition: "0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#e2e8f0")} onMouseLeave={(e) => (e.currentTarget.style.background = "#f1f5f9")}>✕</button>
          </div>
        </div>

        <div style={{ padding: "24px 28px 28px" }}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ fontWeight: 600, fontSize: "13px", color: "#374151", display: "block", marginBottom: "6px" }}>Resolution Note</label>
            <textarea
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Describe how this issue was resolved, e.g. attendance adjusted for 3 days..."
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#10b981")}
              onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
            />
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button type="button" onClick={onClose} style={{ flex: 1, border: "none", padding: "13px 18px", borderRadius: "12px", fontWeight: 600, cursor: "pointer", background: "#f1f5f9", color: "#475569", fontSize: "14px", transition: "0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#e2e8f0")} onMouseLeave={(e) => (e.currentTarget.style.background = "#f1f5f9")}>Cancel</button>
            <button
              type="button"
              disabled={loading}
              onClick={() => onConfirm(note)}
              style={{ flex: 1, border: "none", padding: "13px 18px", borderRadius: "12px", fontWeight: 600, cursor: "pointer", background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff", fontSize: "14px", boxShadow: "0 4px 12px rgba(16,185,129,0.3)", transition: "all 0.2s" }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
            >
              {loading ? "Resolving..." : "Resolve Issue"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResolveIssueModal;
