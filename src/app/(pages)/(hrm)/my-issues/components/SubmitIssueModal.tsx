"use client";

import React, { useState } from "react";
import axiosInstance from "@/utils/axiosInstance";

type Props = {
  onClose: () => void;
  onSuccess: () => void;
};

const SubmitIssueModal: React.FC<Props> = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axiosInstance.post("/issue", {
        title: form.title,
        description: form.description,
      });
      onSuccess();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Submit failed");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "13px 16px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    fontSize: "14px",
    outline: "none",
    transition: "border 0.2s",
    boxSizing: "border-box",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        backdropFilter: "blur(6px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "95%",
          maxWidth: "520px",
          background: "#fff",
          borderRadius: "24px",
          padding: "0",
          boxShadow: "0 25px 60px rgba(0,0,0,0.25)",
          overflow: "hidden",
          animation: "slideUp 0.3s ease",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: "28px 28px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "linear-gradient(135deg, #667eea, #764ba2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", boxShadow: "0 4px 12px rgba(102,126,234,0.3)" }}>🆕</div>
              <div>
                <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: "#1e293b" }}>Raise an Issue</h2>
                <p style={{ margin: "2px 0 0", color: "#64748b", fontSize: "13px" }}>Tell us what you need help with</p>
              </div>
            </div>
            <button onClick={onClose} style={{ border: "none", background: "#f1f5f9", width: "36px", height: "36px", borderRadius: "10px", cursor: "pointer", fontSize: "16px", color: "#64748b", transition: "0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#e2e8f0")} onMouseLeave={(e) => (e.currentTarget.style.background = "#f1f5f9")}>✕</button>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "24px 28px 28px" }}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontWeight: 600, fontSize: "13px", color: "#374151", display: "block", marginBottom: "6px" }}>Title *</label>
            <input type="text" name="title" value={form.title} onChange={handleChange} required placeholder="e.g. Forgot to check in" style={inputStyle} onFocus={(e) => (e.target.style.borderColor = "#4f46e5")} onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")} />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{ fontWeight: 600, fontSize: "13px", color: "#374151", display: "block", marginBottom: "6px" }}>Description *</label>
            <textarea name="description" value={form.description} onChange={handleChange} required rows={4} placeholder="Describe your issue, e.g. ami checkin korte vule gechi, ektu attendance adjust kore din..." style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }} onFocus={(e) => (e.target.style.borderColor = "#4f46e5")} onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")} />
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button type="button" onClick={onClose} style={{ flex: 1, border: "none", padding: "13px 18px", borderRadius: "12px", fontWeight: 600, cursor: "pointer", background: "#f1f5f9", color: "#475569", fontSize: "14px", transition: "0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#e2e8f0")} onMouseLeave={(e) => (e.currentTarget.style.background = "#f1f5f9")}>Cancel</button>
            <button type="submit" disabled={loading} style={{ flex: 1, border: "none", padding: "13px 18px", borderRadius: "12px", fontWeight: 600, cursor: "pointer", background: "linear-gradient(135deg, #6366f1, #4f46e5)", color: "#fff", fontSize: "14px", boxShadow: "0 4px 12px rgba(99,102,241,0.3)", transition: "all 0.2s" }} onMouseEnter={(e) => { if (!loading) e.currentTarget.style.transform = "translateY(-1px)"; }} onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}>
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitIssueModal;
