"use client";

import React, { useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { toast } from "react-toastify";
import ResignationStats from "./components/ResignationStats";
import ResignationTable from "./components/ResignationTable";
import AddResignationModal from "./components/AddResignationModal";
import ApproveResignationModal from "./components/ApproveResignationModal";
import RejectResignationModal from "@/components/shared/RejectResignationModal";
import ConfirmModal from "@/components/shared/ConfirmModal";

type Employee = {
  id: number;
  name: string;
  email: string;
  status?: string;
  employeeCode?: string;
  department?: { title: string } | null;
  designation?: { title: string } | null;
};

type Resignation = {
  id: number;
  companyId: number;
  employeeId: number;
  resignationDate: string;
  lastWorkingDay: string;
  noticePeriodDays: number;
  reason?: string;
  handoverTo?: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  approvedBy?: number;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  employee: Employee;
  approver?: { id: number; name: string } | null;
};

const ResignationPage: React.FC = () => {
  const [resignations, setResignations] = useState<Resignation[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  const [approveTarget, setApproveTarget] = useState<Resignation | null>(null);
  const [approveLoading, setApproveLoading] = useState(false);

  const [rejectTarget, setRejectTarget] = useState<Resignation | null>(null);
  const [rejectLoading, setRejectLoading] = useState(false);

  const [confirmTarget, setConfirmTarget] = useState<{ type: "markInactive" | "revert"; id: number } | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const fetchResignations = async () => {
    try {
      setLoading(true);
      const params = filter !== "ALL" ? `?status=${filter}` : "";
      const res = await axiosInstance.get(`/resignation${params}`);
      setResignations(res.data.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResignations();
  }, [filter]);

  const handleApprove = (r: Resignation) => setApproveTarget(r);

  const handleConfirmApprove = async (id: number, noticePeriodDays: number, lastWorkingDay: string | null) => {
    try {
      setApproveLoading(true);
      await axiosInstance.patch(`/resignation/${id}/approve`, { noticePeriodDays, lastWorkingDay });
      setApproveTarget(null);
      toast.success("Resignation approved");
      fetchResignations();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Approve failed");
    } finally {
      setApproveLoading(false);
    }
  };

  const handleReject = (r: Resignation) => setRejectTarget(r);

  const handleConfirmReject = async (reason: string) => {
    if (!rejectTarget) return;
    try {
      setRejectLoading(true);
      await axiosInstance.patch(`/resignation/${rejectTarget.id}/reject`, { rejectionReason: reason });
      setRejectTarget(null);
      toast.success("Resignation rejected");
      fetchResignations();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Reject failed");
    } finally {
      setRejectLoading(false);
    }
  };

  const handleMarkInactive = (id: number) => {
    setConfirmTarget({ type: "markInactive", id });
  };

  const handleRevert = (id: number) => {
    setConfirmTarget({ type: "revert", id });
  };

  const handleConfirmAction = async () => {
    if (!confirmTarget) return;
    try {
      setConfirmLoading(true);
      if (confirmTarget.type === "markInactive") {
        await axiosInstance.patch(`/resignation/${confirmTarget.id}/mark-inactive`);
        toast.success("Employee marked inactive");
      } else {
        await axiosInstance.patch(`/resignation/${confirmTarget.id}/revert`);
        toast.success("Reverted to pending");
      }
      setConfirmTarget(null);
      fetchResignations();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed");
    } finally {
      setConfirmLoading(false);
    }
  };

  const searchLower = search.toLowerCase();
  const filteredResignations = resignations
    .filter((r) => filter === "ALL" || r.status === filter)
    .filter((r) => !search || r.employee.name.toLowerCase().includes(searchLower) || (r.employee.department?.title || "").toLowerCase().includes(searchLower));

  const stats = {
    total: resignations.length,
    pending: resignations.filter((r) => r.status === "PENDING").length,
    approved: resignations.filter((r) => r.status === "APPROVED").length,
    rejected: resignations.filter((r) => r.status === "REJECTED").length,
  };

  return (
    <div className="page-wrapper">
      <div className="content">
        <div style={{ padding: "24px", background: "linear-gradient(135deg, #eef2ff 0%, #f8fafc 50%, #dbeafe 100%)", minHeight: "100vh" }}>
          {/* Header */}
          <div style={{
            background: "rgba(255,255,255,0.8)", backdropFilter: "blur(20px)", borderRadius: "24px",
            padding: "28px 32px", border: "1px solid rgba(255,255,255,0.6)", boxShadow: "0 8px 32px rgba(0,0,0,0.06)", marginBottom: "28px",
          }} className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#111827", marginBottom: "6px" }}>Resignation Management</h1>
              <p style={{ color: "#6b7280", fontSize: "15px" }}>Manage employee resignation requests</p>
            </div>
            <button onClick={() => setShowModal(true)} style={{
              border: "none", borderRadius: "14px", padding: "14px 28px", fontWeight: 700, fontSize: "14px",
              color: "white", background: "linear-gradient(135deg, #6366f1, #4f46e5)", transition: "all 0.3s", boxShadow: "0 4px 16px rgba(99,102,241,0.4)",
            }} onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(99,102,241,0.5)"; }} onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(99,102,241,0.4)"; }} className="d-flex align-items-center">
              <span style={{ marginRight: "8px", fontSize: "18px" }}>+</span> Add Resignation
            </button>
          </div>

          <ResignationStats stats={stats} filter={filter} setFilter={setFilter} />

          <div style={{ marginBottom: "20px", maxWidth: "400px" }}>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: "16px" }}>🔍</span>
              <input type="text" placeholder="Search by name or department..." value={search} onChange={(e) => setSearch(e.target.value)} style={{
                width: "100%", padding: "12px 16px 12px 42px", borderRadius: "14px", border: "1px solid #e5e7eb", fontSize: "14px",
                background: "rgba(255,255,255,0.8)", backdropFilter: "blur(10px)", outline: "none", transition: "border 0.2s, box-shadow 0.2s",
                boxSizing: "border-box", boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }} onFocus={(e) => { e.target.style.borderColor = "#4f46e5"; e.target.style.boxShadow = "0 0 0 3px rgba(79,70,229,0.1)"; }} onBlur={(e) => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)"; }} />
            </div>
          </div>

          <ResignationTable resignations={filteredResignations} loading={loading} onApprove={handleApprove} onReject={handleReject} onMarkInactive={handleMarkInactive} onRevert={handleRevert} />
        </div>
      </div>

      {showModal && (
        <AddResignationModal onClose={() => setShowModal(false)} onSuccess={() => { setShowModal(false); fetchResignations(); toast.success("Resignation submitted"); }} />
      )}
      {approveTarget && (
        <ApproveResignationModal resignation={approveTarget} onClose={() => setApproveTarget(null)} onConfirm={handleConfirmApprove} loading={approveLoading} />
      )}
      {rejectTarget && (
        <RejectResignationModal employeeName={rejectTarget.employee.name} onClose={() => setRejectTarget(null)} onConfirm={handleConfirmReject} loading={rejectLoading} />
      )}
      {confirmTarget && (
        <ConfirmModal
          title={confirmTarget.type === "markInactive" ? "Mark Employee Inactive" : "Revert to Pending"}
          message={confirmTarget.type === "markInactive" ? "This will mark the employee as INACTIVE. Continue?" : "This will revert the approved resignation back to PENDING. Continue?"}
          icon={confirmTarget.type === "markInactive" ? "🚫" : "🔄"}
          iconBg={confirmTarget.type === "markInactive" ? "linear-gradient(135deg, #ef4444, #dc2626)" : "linear-gradient(135deg, #f59e0b, #ea580c)"}
          iconShadow={confirmTarget.type === "markInactive" ? "0 4px 12px rgba(239,68,68,0.3)" : "0 4px 12px rgba(245,158,11,0.3)"}
          confirmLabel={confirmTarget.type === "markInactive" ? "Mark Inactive" : "Revert"}
          confirmBg={confirmTarget.type === "markInactive" ? "linear-gradient(135deg, #ef4444, #dc2626)" : "linear-gradient(135deg, #f59e0b, #ea580c)"}
          confirmShadow={confirmTarget.type === "markInactive" ? "0 4px 12px rgba(239,68,68,0.3)" : "0 4px 12px rgba(245,158,11,0.3)"}
          onClose={() => setConfirmTarget(null)} onConfirm={handleConfirmAction} loading={confirmLoading}
        />
      )}
    </div>
  );
};

export default ResignationPage;
