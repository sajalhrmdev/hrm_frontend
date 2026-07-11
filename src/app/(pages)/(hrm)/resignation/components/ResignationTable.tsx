"use client";

import React from "react";
import type { Resignation } from "../types";

type Props = {
  resignations: Resignation[];
  loading: boolean;
  onApprove: (r: Resignation) => void;
  onReject: (r: Resignation) => void;
  onMarkInactive: (id: number) => void;
  onRevert: (id: number) => void;
};

const statusConfig: Record<string, { bg: string; color: string; dot: string }> =
  {
    PENDING: { bg: "#fffbeb", color: "#b45309", dot: "#f59e0b" },
    APPROVED: { bg: "#ecfdf5", color: "#047857", dot: "#10b981" },
    REJECTED: { bg: "#fef2f2", color: "#b91c1c", dot: "#ef4444" },
    CANCELLED: { bg: "#f9fafb", color: "#6b7280", dot: "#9ca3af" },
  };

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const ResignationTable: React.FC<Props> = ({
  resignations,
  loading,
  onApprove,
  onReject,
  onMarkInactive,
  onRevert,
}) => {
  if (loading) {
    return (
      <div
        style={{
          background: "rgba(255,255,255,0.8)",
          backdropFilter: "blur(20px)",
          borderRadius: "24px",
          padding: "80px",
          textAlign: "center",
          boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
          border: "1px solid rgba(255,255,255,0.5)",
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            border: "4px solid #e5e7eb",
            borderTopColor: "#4f46e5",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 16px",
          }}
        />
        <p style={{ color: "#9ca3af", fontSize: "14px" }}>
          Loading resignations...
        </p>
      </div>
    );
  }

  if (resignations.length === 0) {
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
        <h3
          style={{
            fontWeight: 700,
            fontSize: "20px",
            color: "#374151",
            marginBottom: "8px",
          }}
        >
          No Resignations Found
        </h3>
        <p style={{ color: "#9ca3af", fontSize: "15px" }}>
          No resignation requests match the current filter
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
              {[
                "Employee",
                "Resignation Date",
                "Last Working Day",
                "Notice Period",
                "Status",
                "Actions",
              ].map((h) => (
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
            {resignations.map((r, idx) => {
              const st = statusConfig[r.status] || statusConfig.PENDING;
              return (
                <tr
                  key={r.id}
                  style={{
                    borderBottom:
                      idx < resignations.length - 1
                        ? "1px solid #f1f5f9"
                        : "none",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#f8fafc")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <td style={{ padding: "16px 18px" }}>
                    <div
                      style={{
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
                          background:
                            "linear-gradient(135deg, #667eea, #764ba2)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "14px",
                          fontWeight: 700,
                          color: "#fff",
                          flexShrink: 0,
                        }}
                      >
                        {getInitials(r.employee.name)}
                      </div>
                      <div>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: "14px",
                            color: "#1e293b",
                          }}
                        >
                          {r.employee.name}
                        </div>
                        <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                          {r.employee.designation?.title ||
                            r.employee.department?.title ||
                            "-"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "16px 18px",
                      fontSize: "14px",
                      color: "#475569",
                    }}
                  >
                    {new Date(r.resignationDate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td
                    style={{
                      padding: "16px 18px",
                      fontSize: "14px",
                      color: r.lastWorkingDay ? "#dc2626" : "#9ca3af",
                      fontWeight: r.lastWorkingDay ? 600 : 400,
                    }}
                  >
                    {r.lastWorkingDay
                      ? new Date(r.lastWorkingDay).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "TBD"}
                  </td>
                  <td style={{ padding: "16px 18px" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "13px",
                        fontWeight: 600,
                        background:
                          r.noticePeriodDays > 0 ? "#eff6ff" : "#f9fafb",
                        color: r.noticePeriodDays > 0 ? "#2563eb" : "#9ca3af",
                      }}
                    >
                      {r.noticePeriodDays > 0
                        ? `${r.noticePeriodDays}d`
                        : "TBD"}
                    </span>
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
                      {r.status}
                    </span>
                    {r.rejectionReason && (
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#b91c1c",
                          marginTop: "4px",
                          maxWidth: "180px",
                        }}
                        title={r.rejectionReason}
                      >
                        {r.rejectionReason.length > 30
                          ? r.rejectionReason.slice(0, 30) + "..."
                          : r.rejectionReason}
                      </div>
                    )}
                    {r.approver && (
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#94a3b8",
                          marginTop: "4px",
                        }}
                      >
                        by {r.approver.name}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: "16px 18px" }}>
                    <div
                      style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}
                    >
                      {r.status === "PENDING" && (
                        <>
                          <button
                            onClick={() => onApprove(r)}
                            style={{
                              border: "none",
                              padding: "8px 14px",
                              borderRadius: "10px",
                              cursor: "pointer",
                              fontSize: "12px",
                              fontWeight: 600,
                              background:
                                "linear-gradient(135deg, #10b981, #059669)",
                              color: "white",
                              transition: "all 0.2s",
                              boxShadow: "0 2px 8px rgba(16,185,129,0.3)",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.transform =
                                "translateY(-1px)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.transform =
                                "translateY(0)")
                            }
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => onReject(r)}
                            style={{
                              border: "none",
                              padding: "8px 14px",
                              borderRadius: "10px",
                              cursor: "pointer",
                              fontSize: "12px",
                              fontWeight: 600,
                              background:
                                "linear-gradient(135deg, #ef4444, #dc2626)",
                              color: "white",
                              transition: "all 0.2s",
                              boxShadow: "0 2px 8px rgba(239,68,68,0.3)",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.transform =
                                "translateY(-1px)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.transform =
                                "translateY(0)")
                            }
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {r.status === "APPROVED" &&
                        r.employee.status !== "INACTIVE" && (
                          <>
                            <button
                              onClick={() => onMarkInactive(r.id)}
                              style={{
                                border: "none",
                                padding: "7px 12px",
                                borderRadius: "10px",
                                cursor: "pointer",
                                fontSize: "11px",
                                fontWeight: 600,
                                background:
                                  "linear-gradient(135deg, #f97316, #ea580c)",
                                color: "white",
                                transition: "all 0.2s",
                                boxShadow: "0 2px 8px rgba(249,115,22,0.3)",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.transform =
                                  "translateY(-1px)")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.transform =
                                  "translateY(0)")
                              }
                            >
                              Mark Inactive
                            </button>
                            <button
                              onClick={() => onRevert(r.id)}
                              style={{
                                border: "none",
                                padding: "7px 12px",
                                borderRadius: "10px",
                                cursor: "pointer",
                                fontSize: "11px",
                                fontWeight: 600,
                                background:
                                  "linear-gradient(135deg, #8b5cf6, #7c3aed)",
                                color: "white",
                                transition: "all 0.2s",
                                boxShadow: "0 2px 8px rgba(139,92,246,0.3)",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.transform =
                                  "translateY(-1px)")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.transform =
                                  "translateY(0)")
                              }
                            >
                              Revert
                            </button>
                          </>
                        )}
                      {r.status === "APPROVED" &&
                        r.employee.status === "INACTIVE" && (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              fontSize: "12px",
                              fontWeight: 600,
                              color: "#059669",
                              background: "#ecfdf5",
                              padding: "6px 12px",
                              borderRadius: "10px",
                            }}
                          >
                            Inactive
                          </span>
                        )}
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

export default ResignationTable;
