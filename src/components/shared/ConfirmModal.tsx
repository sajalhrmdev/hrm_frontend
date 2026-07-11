"use client";

import React from "react";

type Props = {
  title: string;
  message: string;
  icon?: string;
  iconBg?: string;
  iconShadow?: string;
  confirmLabel?: string;
  confirmBg?: string;
  confirmShadow?: string;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
};

const ConfirmModal: React.FC<Props> = ({
  title,
  message,
  icon = "⚠️",
  iconBg = "linear-gradient(135deg, #f59e0b, #ea580c)",
  iconShadow = "0 4px 12px rgba(245,158,11,0.3)",
  confirmLabel = "Confirm",
  confirmBg = "linear-gradient(135deg, #f59e0b, #ea580c)",
  confirmShadow = "0 4px 12px rgba(245,158,11,0.3)",
  onClose,
  onConfirm,
  loading,
}) => {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999, backdropFilter: "blur(6px)" }} onClick={onClose}>
      <div style={{
        width: "95%", maxWidth: "420px", background: "#fff", borderRadius: "24px", padding: "0",
        boxShadow: "0 25px 60px rgba(0,0,0,0.25)", overflow: "hidden", animation: "slideUp 0.3s ease",
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: "32px 28px 28px", textAlign: "center" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", margin: "0 auto 16px", boxShadow: iconShadow }}>{icon}</div>
          <h2 style={{ margin: "0 0 8px", fontSize: "20px", fontWeight: 700, color: "#1e293b" }}>{title}</h2>
          <p style={{ margin: "0 0 28px", color: "#64748b", fontSize: "14px", lineHeight: 1.5 }}>{message}</p>

          <div style={{ display: "flex", gap: "10px" }}>
            <button type="button" onClick={onClose} style={{ flex: 1, border: "none", padding: "13px 18px", borderRadius: "12px", fontWeight: 600, cursor: "pointer", background: "#f1f5f9", color: "#475569", fontSize: "14px", transition: "0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#e2e8f0")} onMouseLeave={(e) => (e.currentTarget.style.background = "#f1f5f9")}>Cancel</button>
            <button
              type="button"
              disabled={loading}
              onClick={onConfirm}
              style={{ flex: 1, border: "none", padding: "13px 18px", borderRadius: "12px", fontWeight: 600, cursor: "pointer", background: confirmBg, color: "#fff", fontSize: "14px", boxShadow: confirmShadow, transition: "all 0.2s" }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
            >
              {loading ? "Processing..." : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
