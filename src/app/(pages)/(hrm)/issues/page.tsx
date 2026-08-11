"use client";

import React, { useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { toast } from "react-toastify";
import IssueStats from "./components/IssueStats";
import IssueTable from "./components/IssueTable";
import AddIssueModal from "./components/AddIssueModal";
import ResolveIssueModal from "./components/ResolveIssueModal";
import RejectIssueModal from "./components/RejectIssueModal";
import IssueDetailModal from "./components/IssueDetailModal";
import type { Issue } from "./types";

const IssuePage: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  const [viewTarget, setViewTarget] = useState<Issue | null>(null);
  const [resolveTarget, setResolveTarget] = useState<Issue | null>(null);
  const [resolveLoading, setResolveLoading] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<Issue | null>(null);
  const [rejectLoading, setRejectLoading] = useState(false);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== "ALL") params.set("status", filter);
      if (search.trim()) params.set("search", search.trim());
      const qs = params.toString();
      const res = await axiosInstance.get(`/issue${qs ? `?${qs}` : ""}`);
      setIssues(res.data.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchIssues();
    }, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, search]);

  const handleResolve = (issue: Issue) => setResolveTarget(issue);

  const handleConfirmResolve = async (note: string) => {
    if (!resolveTarget) return;
    try {
      setResolveLoading(true);
      await axiosInstance.patch(`/issue/${resolveTarget.id}/status`, {
        status: "RESOLVED",
        resolutionNote: note,
      });
      setResolveTarget(null);
      toast.success("Issue resolved");
      fetchIssues();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Resolve failed");
    } finally {
      setResolveLoading(false);
    }
  };

  const handleReject = (issue: Issue) => setRejectTarget(issue);

  const handleConfirmReject = async (reason: string) => {
    if (!rejectTarget) return;
    try {
      setRejectLoading(true);
      await axiosInstance.patch(`/issue/${rejectTarget.id}/status`, {
        status: "REJECTED",
        rejectedReason: reason,
      });
      setRejectTarget(null);
      toast.success("Issue rejected");
      fetchIssues();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Reject failed");
    } finally {
      setRejectLoading(false);
    }
  };

  const stats = {
    total: issues.length,
    open: issues.filter((i) => i.status === "OPEN").length,
    inProgress: issues.filter((i) => i.status === "IN_PROGRESS").length,
    resolved: issues.filter((i) => i.status === "RESOLVED").length,
    rejected: issues.filter((i) => i.status === "REJECTED").length,
  };

  return (
    <div className="page-wrapper">
      <div className="content">
        <div
          style={{
            padding: "24px",
            background: "linear-gradient(135deg, #eef2ff 0%, #f8fafc 50%, #dbeafe 100%)",
            minHeight: "100vh",
          }}
        >
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
              <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#111827", marginBottom: "6px" }}>
                Issue Management
              </h1>
              <p style={{ color: "#6b7280", fontSize: "15px" }}>
                View and resolve employee issues and requests
              </p>
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
              <span style={{ marginRight: "8px", fontSize: "18px" }}>+</span> Add Issue
            </button>
          </div>

          <IssueStats stats={stats} filter={filter} setFilter={setFilter} />

          <div style={{ marginBottom: "20px", maxWidth: "400px" }}>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: "16px" }}>
                🔍
              </span>
              <input
                type="text"
                placeholder="Search by title, description or employee..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px 12px 42px",
                  borderRadius: "14px",
                  border: "1px solid #e5e7eb",
                  fontSize: "14px",
                  background: "rgba(255,255,255,0.8)",
                  backdropFilter: "blur(10px)",
                  outline: "none",
                  transition: "border 0.2s, box-shadow 0.2s",
                  boxSizing: "border-box",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#4f46e5";
                  e.target.style.boxShadow = "0 0 0 3px rgba(79,70,229,0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e5e7eb";
                  e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
                }}
              />
            </div>
          </div>

          <IssueTable
            issues={issues}
            loading={loading}
            onResolve={handleResolve}
            onReject={handleReject}
            onView={(i) => setViewTarget(i)}
          />
        </div>
      </div>

      {showModal && (
        <AddIssueModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            fetchIssues();
            toast.success("Issue submitted");
          }}
        />
      )}
      {resolveTarget && (
        <ResolveIssueModal
          issueTitle={resolveTarget.title}
          employeeName={resolveTarget.employee.name}
          onClose={() => setResolveTarget(null)}
          onConfirm={handleConfirmResolve}
          loading={resolveLoading}
        />
      )}
      {rejectTarget && (
        <RejectIssueModal
          issueTitle={rejectTarget.title}
          employeeName={rejectTarget.employee.name}
          onClose={() => setRejectTarget(null)}
          onConfirm={handleConfirmReject}
          loading={rejectLoading}
        />
      )}
      {viewTarget && (
        <IssueDetailModal issue={viewTarget} onClose={() => setViewTarget(null)} />
      )}
    </div>
  );
};

export default IssuePage;
