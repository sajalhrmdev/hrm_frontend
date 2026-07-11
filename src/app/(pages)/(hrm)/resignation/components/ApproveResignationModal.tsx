"use client";

import React, { useState, useEffect } from "react";
import type { Resignation } from "../types";

type Props = {
  resignation: Resignation;
  onClose: () => void;
  onConfirm: (
    id: number,
    noticePeriodDays: number,
    lastWorkingDay: string | null,
  ) => void;
  loading: boolean;
};

const ApproveResignationModal: React.FC<Props> = ({
  resignation,
  onClose,
  onConfirm,
  loading,
}) => {
  const [noticePeriodDays, setNoticePeriodDays] = useState<number>(
    resignation.noticePeriodDays || 30,
  );
  const [lastWorkingDay, setLastWorkingDay] = useState<string>("");

  useEffect(() => {
    if (resignation.resignationDate && noticePeriodDays > 0) {
      const d = new Date(resignation.resignationDate);
      d.setDate(d.getDate() + noticePeriodDays);
      setLastWorkingDay(d.toISOString().split("T")[0]);
    }
  }, [resignation.resignationDate, noticePeriodDays]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(resignation.id, noticePeriodDays, lastWorkingDay || null);
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
    >
      <div
        style={{
          width: "95%",
          maxWidth: "480px",
          background: "#fff",
          borderRadius: "24px",
          padding: "0",
          boxShadow: "0 25px 60px rgba(0,0,0,0.25)",
          overflow: "hidden",
          animation: "slideUp 0.3s ease",
        }}
      >
        {/* Header */}
        <div style={{ padding: "28px 28px 0" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "14px",
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "22px",
                  boxShadow: "0 4px 12px rgba(16,185,129,0.3)",
                }}
              >
                ✅
              </div>
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "20px",
                    fontWeight: 700,
                    color: "#1e293b",
                  }}
                >
                  Approve Resignation
                </h2>
                <p
                  style={{
                    margin: "2px 0 0",
                    color: "#64748b",
                    fontSize: "13px",
                  }}
                >
                  Set notice period for this employee
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                border: "none",
                background: "#f1f5f9",
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                cursor: "pointer",
                fontSize: "16px",
                color: "#64748b",
                transition: "0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#e2e8f0";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#f1f5f9";
              }}
            >
              ✕
            </button>
          </div>

          {/* Employee Info */}
          <div
            style={{
              marginTop: "20px",
              padding: "14px 16px",
              background: "#f8fafc",
              borderRadius: "14px",
              border: "1px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
                fontWeight: 700,
                color: "#fff",
              }}
            >
              {resignation.employee.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div>
              <div
                style={{ fontWeight: 600, fontSize: "14px", color: "#1e293b" }}
              >
                {resignation.employee.name}
              </div>
              <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                {resignation.employee.department?.title || "-"}
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: "24px 28px 28px" }}>
          {/* Notice Period */}
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                fontWeight: 600,
                fontSize: "13px",
                color: "#374151",
                display: "block",
                marginBottom: "6px",
              }}
            >
              Notice Period (days)
            </label>
            <div
              style={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
                marginBottom: "8px",
              }}
            >
              {[15, 30, 60, 90].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setNoticePeriodDays(d)}
                  style={{
                    border:
                      noticePeriodDays === d
                        ? "2px solid #4f46e5"
                        : "1px solid #e5e7eb",
                    padding: "8px 16px",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: 600,
                    background: noticePeriodDays === d ? "#eef2ff" : "#fff",
                    color: noticePeriodDays === d ? "#4f46e5" : "#6b7280",
                    transition: "all 0.2s",
                  }}
                >
                  {d}d
                </button>
              ))}
            </div>
            <input
              type="number"
              min={1}
              max={365}
              value={noticePeriodDays}
              onChange={(e) => setNoticePeriodDays(Number(e.target.value))}
              required
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
                fontSize: "14px",
                outline: "none",
                transition: "border 0.2s",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#4f46e5")}
              onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
            />
          </div>

          {/* Last Working Day */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                fontWeight: 600,
                fontSize: "13px",
                color: "#374151",
                display: "block",
                marginBottom: "6px",
              }}
            >
              Last Working Day
            </label>
            <div
              style={{
                padding: "12px 14px",
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
                background: "#f8fafc",
                fontSize: "14px",
                color: "#1e293b",
                fontWeight: 500,
              }}
            >
              {lastWorkingDay
                ? new Date(lastWorkingDay).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "-"}
            </div>
            <p
              style={{ margin: "6px 0 0", fontSize: "11px", color: "#94a3b8" }}
            >
              Auto-calculated from resignation date + notice period
            </p>
          </div>

          {/* Warning */}
          <div
            style={{
              background: "#fffbeb",
              border: "1px solid #fde68a",
              borderRadius: "12px",
              padding: "12px 16px",
              marginBottom: "24px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span style={{ fontSize: "16px" }}>⚠️</span>
            <p style={{ margin: 0, fontSize: "12px", color: "#92400e" }}>
              On approval, employee will be marked as <strong>INACTIVE</strong>{" "}
              when you click &quot;Mark Inactive&quot;.
            </p>
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                border: "none",
                padding: "13px 18px",
                borderRadius: "12px",
                fontWeight: 600,
                cursor: "pointer",
                background: "#f1f5f9",
                color: "#475569",
                fontSize: "14px",
                transition: "0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#e2e8f0")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#f1f5f9")
              }
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                border: "none",
                padding: "13px 18px",
                borderRadius: "12px",
                fontWeight: 600,
                cursor: "pointer",
                background: "linear-gradient(135deg, #10b981, #059669)",
                color: "#fff",
                fontSize: "14px",
                boxShadow: "0 4px 12px rgba(16,185,129,0.3)",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!loading)
                  e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {loading ? "Approving..." : "Confirm Approval"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApproveResignationModal;
