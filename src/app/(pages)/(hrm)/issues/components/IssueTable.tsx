"use client";

import React from "react";
import type { Issue } from "../types";
import { SkeletonTable } from "@/core/common/Skeleton";

type Props = {
  issues: Issue[];
  loading: boolean;
  onResolve: (i: Issue) => void;
  onReject: (i: Issue) => void;
  onView: (i: Issue) => void;
};

const statusConfig: Record<string, { bg: string; color: string; dot: string; label: string }> = {
  OPEN: { bg: "#fffbeb", color: "#b45309", dot: "#f59e0b", label: "Open" },
  IN_PROGRESS: { bg: "#eff6ff", color: "#2563eb", dot: "#3b82f6", label: "In Progress" },
  RESOLVED: { bg: "#ecfdf5", color: "#047857", dot: "#10b981", label: "Resolved" },
  REJECTED: { bg: "#fef2f2", color: "#b91c1c", dot: "#ef4444", label: "Rejected" },
  CANCELLED: { bg: "#f9fafb", color: "#6b7280", dot: "#9ca3af", label: "Cancelled" },
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const IssueTable: React.FC<Props> = ({ issues, loading, onResolve, onReject, onView }) => {
  if (loading) {
    return <SkeletonTable rows={5} columns={5} />;
  }

  if (issues.length === 0) {
    return (
      <div
        style={{
          background: "rgba(255,255,255,0.8)",
          backdropFilter: "blur(20px)",
          borderRadius: "24px",
          padding: "80px 40px",
          textAlign: "center",
          boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
          border: "1px solid rgba(255,255,255,0.5)",
        }}
      >
        <div style={{ fontSize: "64px", marginBottom: "20px" }}>📭</div>
        <h3 style={{ fontWeight: 700, fontSize: "20px", color: "#374151", marginBottom: "8px" }}>
          No Issues Found
        </h3>
        <p style={{ color: "#9ca3af", fontSize: "15px" }}>
          No issues match the current filter
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.8)",
        backdropFilter: "blur(20px)",
        borderRadius: "24px",
        padding: "0",
        border: "1px solid rgba(255,255,255,0.5)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
        overflow: "hidden",
      }}
    >
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Employee", "Issue", "Date", "Status", "Actions"].map((h) => (
                <th
                  key={h}
                  style={{
                    background: "linear-gradient(135deg, #f8fafc, #f1f5f9)",
                    padding: "16px 18px",
                    textAlign: "left",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    borderBottom: "2px solid #e2e8f0",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {issues.map((issue, idx) => {
              const st = statusConfig[issue.status] || statusConfig.OPEN;
              return (
                <tr
                  key={issue.id}
                  style={{
                    borderBottom: idx < issues.length - 1 ? "1px solid #f1f5f9" : "none",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "16px 18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "12px",
                          background: "linear-gradient(135deg, #667eea, #764ba2)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "14px",
                          fontWeight: 700,
                          color: "#fff",
                          flexShrink: 0,
                        }}
                      >
                        {getInitials(issue.employee.name)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "14px", color: "#1e293b" }}>
                          {issue.employee.name}
                        </div>
                        <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                          {issue.employee.designation?.title ||
                            issue.employee.department?.title ||
                            "-"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "16px 18px", maxWidth: "380px" }}>
                    <div style={{ fontWeight: 600, fontSize: "14px", color: "#1e293b" }}>
                      {issue.title}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#94a3b8",
                        marginTop: "2px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: "340px",
                      }}
                    >
                      {issue.description}
                    </div>
                  </td>
                  <td style={{ padding: "16px 18px", fontSize: "14px", color: "#475569" }}>
                    {new Date(issue.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td style={{ padding: "16px 18px" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "6px 14px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: 700,
                        background: st.bg,
                        color: st.color,
                        border: `1px solid ${st.dot}20`,
                      }}
                    >
                      <span
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          background: st.dot,
                          flexShrink: 0,
                        }}
                      />
                      {st.label}
                    </span>
                    {issue.resolver && (
                      <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
                        by {issue.resolver.name}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: "16px 18px" }}>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      {(issue.status === "OPEN" || issue.status === "IN_PROGRESS") && (
                        <>
                          <button
                            onClick={() => onResolve(issue)}
                            style={{
                              border: "none",
                              padding: "8px 14px",
                              borderRadius: "10px",
                              cursor: "pointer",
                              fontSize: "12px",
                              fontWeight: 600,
                              background: "linear-gradient(135deg, #10b981, #059669)",
                              color: "white",
                              transition: "all 0.2s",
                              boxShadow: "0 2px 8px rgba(16,185,129,0.3)",
                            }}
                          >
                            Resolve
                          </button>
                          <button
                            onClick={() => onReject(issue)}
                            style={{
                              border: "none",
                              padding: "8px 14px",
                              borderRadius: "10px",
                              cursor: "pointer",
                              fontSize: "12px",
                              fontWeight: 600,
                              background: "linear-gradient(135deg, #ef4444, #dc2626)",
                              color: "white",
                              transition: "all 0.2s",
                              boxShadow: "0 2px 8px rgba(239,68,68,0.3)",
                            }}
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => onView(issue)}
                        style={{
                          border: "1px solid #e2e8f0",
                          padding: "8px 14px",
                          borderRadius: "10px",
                          cursor: "pointer",
                          fontSize: "12px",
                          fontWeight: 600,
                          background: "#f8fafc",
                          color: "#475569",
                          transition: "all 0.2s",
                        }}
                      >
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IssueTable;
