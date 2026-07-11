"use client";

import React, { useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { toast } from "react-toastify";
import MyResignationCard from "./components/MyResignationCard";
import SubmitResignationModal from "./components/SubmitResignationModal";
import ResignationDetailModal from "./components/ResignationDetailModal";
import ConfirmModal from "@/components/shared/ConfirmModal";

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

const statusConfig: Record<string, { gradient: string; color: string; label: string; icon: string }> = {
  PENDING: { gradient: "linear-gradient(135deg, #f59e0b, #ea580c)", color: "#b45309", label: "Pending", icon: "⏳" },
  APPROVED: { gradient: "linear-gradient(135deg, #10b981, #059669)", color: "#047857", label: "Approved", icon: "✅" },
  REJECTED: { gradient: "linear-gradient(135deg, #ef4444, #dc2626)", color: "#b91c1c", label: "Rejected", icon: "❌" },
  CANCELLED: { gradient: "linear-gradient(135deg, #9ca3af, #6b7280)", color: "#4b5563", label: "Cancelled", icon: "🚫" },
};

const MyResignationPage: React.FC = () => {
  const [resignations, setResignations] = useState<Resignation[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedResignation, setSelectedResignation] = useState<Resignation | null>(null);
  const [cancelTarget, setCancelTarget] = useState<number | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const fetchMyResignations = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/resignation/my");
      setResignations(res.data.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyResignations();
  }, []);

  const handleCancel = (id: number) => {
    setCancelTarget(id);
  };

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    try {
      setCancelLoading(true);
      await axiosInstance.delete(`/resignation/${cancelTarget}`);
      setCancelTarget(null);
      toast.success("Resignation cancelled");
      fetchMyResignations();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Cancel failed");
    } finally {
      setCancelLoading(false);
    }
  };

  const activeResignation = resignations.find((r) => r.status === "PENDING" || r.status === "APPROVED") || null;
  const historyResignations = resignations.filter((r) => r.id !== activeResignation?.id);
  const canSubmitNew = !activeResignation;

  return (
    <div className="page-wrapper">
      <div className="content">
        <div style={{ padding: "24px", background: "linear-gradient(135deg, #fdf2f8 0%, #f0f9ff 50%, #ecfdf5 100%)", minHeight: "100vh" }}>
          {/* Header */}
          <div style={{
            background: "rgba(255,255,255,0.8)",
            backdropFilter: "blur(20px)",
            borderRadius: "24px",
            padding: "28px 32px",
            border: "1px solid rgba(255,255,255,0.6)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
            marginBottom: "28px",
          }} className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#111827", marginBottom: "6px" }}>My Resignation</h1>
              <p style={{ color: "#6b7280", fontSize: "15px" }}>View and manage your resignation requests</p>
            </div>
            {canSubmitNew && (
              <button onClick={() => setShowModal(true)} style={{
                border: "none",
                borderRadius: "14px",
                padding: "14px 28px",
                fontWeight: 700,
                fontSize: "14px",
                color: "white",
                background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                transition: "all 0.3s",
                boxShadow: "0 4px 16px rgba(99,102,241,0.4)",
              }} onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(99,102,241,0.5)"; }} onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(99,102,241,0.4)"; }} className="d-flex align-items-center">
                <span style={{ marginRight: "8px", fontSize: "18px" }}>+</span> Submit Resignation
              </button>
            )}
          </div>

          {/* Content */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "80px", background: "rgba(255,255,255,0.7)", borderRadius: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
              <div style={{ width: 48, height: 48, border: "4px solid #e5e7eb", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
              <p style={{ color: "#9ca3af", fontSize: "14px" }}>Loading...</p>
            </div>
          ) : resignations.length === 0 ? (
            <div style={{
              background: "rgba(255,255,255,0.8)",
              backdropFilter: "blur(20px)",
              borderRadius: "28px",
              padding: "80px 40px",
              textAlign: "center",
              boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
              border: "1px solid rgba(255,255,255,0.5)",
            }}>
              <div style={{ fontSize: "72px", marginBottom: "24px" }}>📋</div>
              <h3 style={{ fontWeight: 700, fontSize: "22px", color: "#1e293b", marginBottom: "10px" }}>No Resignation Found</h3>
              <p style={{ color: "#9ca3af", marginBottom: "32px", fontSize: "15px", maxWidth: "400px", margin: "0 auto 32px" }}>You haven&apos;t submitted a resignation request yet. Click below to submit one.</p>
              <button onClick={() => setShowModal(true)} style={{
                border: "none",
                borderRadius: "14px",
                padding: "14px 32px",
                fontWeight: 700,
                fontSize: "15px",
                color: "white",
                background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                cursor: "pointer",
                boxShadow: "0 4px 16px rgba(99,102,241,0.4)",
                transition: "all 0.3s",
              }} onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }} onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}>
                Submit Resignation
              </button>
            </div>
          ) : (
            <>
              {activeResignation && (
                <MyResignationCard
                  resignation={activeResignation}
                  onCancel={() => handleCancel(activeResignation.id)}
                  onNewResignation={() => setShowModal(true)}
                />
              )}

              {/* History */}
              {historyResignations.length > 0 && (
                <div style={{ marginTop: activeResignation ? "32px" : "0" }}>
                  <h3 style={{ fontWeight: 700, fontSize: "18px", color: "#374151", marginBottom: "16px" }}>
                    {activeResignation ? "Previous Resignations" : "All Resignations"}
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {historyResignations.map((r) => {
                      const st = statusConfig[r.status] || statusConfig.PENDING;
                      return (
                        <div key={r.id} onClick={() => setSelectedResignation(r)} style={{
                          background: "rgba(255,255,255,0.8)",
                          backdropFilter: "blur(20px)",
                          borderRadius: "16px",
                          padding: "20px 24px",
                          border: "1px solid rgba(255,255,255,0.5)",
                          boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          flexWrap: "wrap",
                          gap: "12px",
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }} onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)"; e.currentTarget.style.transform = "translateY(-2px)"; }} onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.04)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                          <div className="d-flex align-items-center gap-3">
                            <div style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "12px",
                              background: st.gradient,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "18px",
                              flexShrink: 0,
                            }}>
                              {st.icon}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: "14px", color: "#1e293b" }}>
                                Resignation — {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                              </div>
                              <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "2px" }}>
                                Last Working Day: {r.lastWorkingDay
                                  ? new Date(r.lastWorkingDay).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                                  : "TBD"}
                                {r.rejectionReason && <span style={{ marginLeft: "12px", color: "#dc2626" }}>Reason: {r.rejectionReason}</span>}
                              </div>
                            </div>
                          </div>
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
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {showModal && (
        <SubmitResignationModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            fetchMyResignations();
            toast.success("Resignation submitted");
          }}
        />
      )}
      {selectedResignation && (
        <ResignationDetailModal
          resignation={selectedResignation}
          onClose={() => setSelectedResignation(null)}
        />
      )}
      {cancelTarget && (
        <ConfirmModal
          title="Cancel Resignation?"
          message="Are you sure you want to cancel your resignation request? This cannot be undone."
          icon="🚫"
          iconBg="linear-gradient(135deg, #ef4444, #dc2626)"
          iconShadow="0 4px 12px rgba(239,68,68,0.3)"
          confirmLabel="Cancel Resignation"
          confirmBg="linear-gradient(135deg, #ef4444, #dc2626)"
          confirmShadow="0 4px 12px rgba(239,68,68,0.3)"
          onClose={() => setCancelTarget(null)}
          onConfirm={handleConfirmCancel}
          loading={cancelLoading}
        />
      )}
    </div>
  );
};

export default MyResignationPage;
