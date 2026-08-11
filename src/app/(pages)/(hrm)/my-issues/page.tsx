"use client";

import React, { useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { toast } from "react-toastify";
import MyIssueCard from "./components/MyIssueCard";
import SubmitIssueModal from "./components/SubmitIssueModal";
import IssueDetailModal from "../issues/components/IssueDetailModal";
import ConfirmModal from "@/components/shared/ConfirmModal";
import { SkeletonCard } from "@/core/common/Skeleton";
import type { Issue } from "../issues/types";

const MyIssuesPage: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [cancelTarget, setCancelTarget] = useState<number | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const fetchMyIssues = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/issue/my");
      setIssues(res.data.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyIssues();
  }, []);

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    try {
      setCancelLoading(true);
      await axiosInstance.delete(`/issue/${cancelTarget}`);
      setCancelTarget(null);
      toast.success("Issue cancelled");
      fetchMyIssues();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Cancel failed");
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="content">
        <div style={{ padding: "24px", background: "linear-gradient(135deg, #fdf2f8 0%, #f0f9ff 50%, #ecfdf5 100%)", minHeight: "100vh" }}>
          {/* Header */}
          <div
            style={{
              background: "rgba(255,255,255,0.8)",
              backdropFilter: "blur(20px)",
              borderRadius: "24px",
              padding: "28px 32px",
              border: "1px solid rgba(255,255,255,0.6)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
              marginBottom: "28px",
            }}
            className="d-flex justify-content-between align-items-center flex-wrap gap-3"
          >
            <div>
              <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#111827", marginBottom: "6px" }}>My Issues</h1>
              <p style={{ color: "#6b7280", fontSize: "15px" }}>Raise and track your issues and requests</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              style={{
                border: "none",
                borderRadius: "14px",
                padding: "14px 28px",
                fontWeight: 700,
                fontSize: "14px",
                color: "white",
                background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                transition: "all 0.3s",
                boxShadow: "0 4px 16px rgba(99,102,241,0.4)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(99,102,241,0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 16px rgba(99,102,241,0.4)";
              }}
              className="d-flex align-items-center"
            >
              <span style={{ marginRight: "8px", fontSize: "18px" }}>+</span> Raise Issue
            </button>
          </div>

          {/* Content */}
          {loading ? (
            <SkeletonCard />
          ) : issues.length === 0 ? (
            <div
              style={{
                background: "rgba(255,255,255,0.8)",
                backdropFilter: "blur(20px)",
                borderRadius: "28px",
                padding: "80px 40px",
                textAlign: "center",
                boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
                border: "1px solid rgba(255,255,255,0.5)",
              }}
            >
              <div style={{ fontSize: "72px", marginBottom: "24px" }}>📭</div>
              <h3 style={{ fontWeight: 700, fontSize: "22px", color: "#1e293b", marginBottom: "10px" }}>No Issues Found</h3>
              <p style={{ color: "#9ca3af", marginBottom: "32px", fontSize: "15px", maxWidth: "400px", margin: "0 auto 32px" }}>
                You haven&apos;t raised any issues yet. Need attendance adjusted or something else? Raise an issue below.
              </p>
              <button
                onClick={() => setShowModal(true)}
                style={{
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
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
              >
                Raise Issue
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {issues.map((issue) => (
                <MyIssueCard
                  key={issue.id}
                  issue={issue}
                  onCancel={(id) => setCancelTarget(id)}
                  onView={(i) => setSelectedIssue(i)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showModal && (
        <SubmitIssueModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            fetchMyIssues();
            toast.success("Issue submitted");
          }}
        />
      )}
      {selectedIssue && (
        <IssueDetailModal
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
        />
      )}
      {cancelTarget && (
        <ConfirmModal
          title="Cancel Issue?"
          message="Are you sure you want to cancel this issue? This cannot be undone."
          icon="🚫"
          iconBg="linear-gradient(135deg, #ef4444, #dc2626)"
          iconShadow="0 4px 12px rgba(239,68,68,0.3)"
          confirmLabel="Cancel Issue"
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

export default MyIssuesPage;
