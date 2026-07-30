"use client";

import React, { useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { SkeletonTable } from "@/core/common/Skeleton";

interface Goal {
  id: number;
  title: string;
  description?: string;
  targetValue: number;
  targetUnit: string;
  achievedValue?: number;
  rating?: number;
  startDate: string;
  endDate: string;
  status: string;
  incentiveType: string;
  incentiveValue: number;
  calculatedAmount?: number;
  incentiveMonth?: number;
  incentiveYear?: number;
}

const STATUS_BADGE: Record<string, string> = {
  PENDING: "badge-soft-secondary",
  IN_PROGRESS: "badge-soft-primary",
  SUBMITTED: "badge-soft-warning",
  APPROVED: "badge-soft-success",
  CANCELLED: "badge-soft-danger",
};

const progressBarColor = (rating: number) => {
  if (rating >= 80) return "bg-success";
  if (rating >= 50) return "bg-warning";
  return "bg-danger";
};

const fmtUnit = (u: string) => u === "INR" ? "₹" : u;

const MyGoalPage = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitModal, setSubmitModal] = useState<Goal | null>(null);
  const [achievedValue, setAchievedValue] = useState(0);
  const [speedDialId, setSpeedDialId] = useState<number | null>(null);

  const fetchMyGoals = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/goal/my-goal");
      setGoals(res?.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyGoals();
  }, []);

  useEffect(() => {
    if (!speedDialId) return;
    const handler = () => setSpeedDialId(null);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [speedDialId]);

  const getMyGoalActions = (goal: Goal) => {
    const items: { icon: string; label: string; variant: string; onClick: () => void }[] = [];
    if (goal.status === "IN_PROGRESS") {
      items.push({ icon: "ti ti-checklist", label: "Submit Progress", variant: "sd-success", onClick: () => {
        setSubmitModal(goal);
        setAchievedValue(goal.achievedValue || 0);
      }});
    }
    if (goal.status === "APPROVED" && (goal.achievedValue ?? 0) < goal.targetValue) {
      items.push({ icon: "ti ti-refresh", label: "Update Progress", variant: "sd-warning", onClick: () => {
        setSubmitModal(goal);
        setAchievedValue(goal.achievedValue || 0);
      }});
    }
    return items;
  };

  const handleSubmitProgress = async (goalId: number) => {
    try {
      await axiosInstance.patch(`/goal/${goalId}/progress`, { achievedValue });
      setSubmitModal(null);
      fetchMyGoals();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <style>{`
        .goal-action-btn {
          transition: all 0.2s ease;
        }
        .goal-action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.12);
        }
        .goal-empty-icon {
          font-size: 3rem;
          color: #d0d5dd;
        }
        .speed-dial-wrap {
          position: relative;
          width: 36px;
          height: 36px;
          z-index: 1050;
        }
        .speed-dial-toggle {
          position: relative;
          z-index: 3;
          width: 36px;
          height: 36px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s, background 0.2s;
        }
        .speed-dial-toggle:hover {
          transform: scale(1.1);
        }
        .speed-dial-item-pos {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 1060;
          pointer-events: none;
        }
        .speed-dial-item {
          white-space: nowrap;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.15);
          border: 1.5px solid;
          cursor: pointer;
          pointer-events: auto;
          opacity: 0;
          animation: speedDialCircleIn 0.3s ease forwards;
          transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
          line-height: 1;
          color: #fff;
        }
        .speed-dial-item:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 14px rgba(0,0,0,0.22);
          background: #fff !important;
        }
        .speed-dial-item.sd-info { background: var(--bs-info); border-color: var(--bs-info); }
        .speed-dial-item.sd-info:hover { color: var(--bs-info); }
        .speed-dial-item.sd-primary { background: var(--bs-primary); border-color: var(--bs-primary); }
        .speed-dial-item.sd-primary:hover { color: var(--bs-primary); }
        .speed-dial-item.sd-success { background: var(--bs-success); border-color: var(--bs-success); }
        .speed-dial-item.sd-success:hover { color: var(--bs-success); }
        .speed-dial-item.sd-warning { background: var(--bs-warning); border-color: var(--bs-warning); }
        .speed-dial-item.sd-warning:hover { color: var(--bs-warning); }
        .speed-dial-item.sd-danger { background: var(--bs-danger); border-color: var(--bs-danger); }
        .speed-dial-item.sd-danger:hover { color: var(--bs-danger); }
        @keyframes speedDialCircleIn {
          0% { opacity: 0; transform: translateX(10px) scale(0.9); }
          100% { opacity: 1; transform: translateX(0) scale(1); }
        }
      `}</style>
      <div className="page-wrapper">
        <div className="content">
          <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
            <div className="my-auto mb-2">
              <h2 className="mb-1">My Goals</h2>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">HRM Employee</li>
                  <li className="breadcrumb-item">Others</li>
                  <li className="breadcrumb-item active" aria-current="page">My Goals</li>
                </ol>
              </nav>
            </div>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              {loading ? (
                <div className="p-4">
                  <SkeletonTable rows={5} columns={6} />
                </div>
              ) : goals.length === 0 ? (
                <div className="text-center py-5">
                  <i className="ti ti-flag-off goal-empty-icon d-block mb-2" />
                  <p className="text-muted mb-0">No goals assigned yet.</p>
                </div>
              ) : (
                <div className="table-responsive" style={speedDialId ? { overflow: 'visible' } : undefined}>
                  <table className="table align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="ps-4">Title</th>
                        <th>Target</th>
                        <th>Achieved</th>
                        <th>Progress</th>
                        <th>Period</th>
                        <th>Status</th>
                        <th>Incentive</th>
                        <th className="pe-4 text-end">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {goals.map((goal) => (
                        <tr key={goal.id}>
                          <td className="ps-4">
                            <div className="fw-semibold">{goal.title}</div>
                            {goal.description && <small className="text-muted">{goal.description}</small>}
                          </td>
                          <td>{goal.targetValue} {fmtUnit(goal.targetUnit)}</td>
                          <td>{goal.achievedValue ?? "-"}</td>
                          <td>
                            {goal.rating != null ? (
                              <div className="d-flex align-items-center gap-2" style={{ minWidth: "120px" }}>
                                <div className="progress flex-grow-1" style={{ height: "8px", borderRadius: "4px" }}>
                                  <div className={`progress-bar ${progressBarColor(goal.rating)}`} role="progressbar"
                                    style={{ width: `${Math.round(goal.rating)}%` }}
                                    aria-valuenow={Math.round(goal.rating)} aria-valuemin={0} aria-valuemax={100} />
                                </div>
                                <small className="fw-semibold">{Math.round(goal.rating)}%</small>
                              </div>
                            ) : "-"}
                          </td>
                          <td>
                            <small className="text-muted">
                              {new Date(goal.startDate).toLocaleDateString()} - {new Date(goal.endDate).toLocaleDateString()}
                            </small>
                          </td>
                          <td>
                            <span className={`badge ${STATUS_BADGE[goal.status] || "badge-soft-secondary"} badge-sm`}>
                              {goal.status}
                            </span>
                          </td>
                          <td>
                            {goal.calculatedAmount != null ? (
                              <span className="fw-bold text-success">₹{goal.calculatedAmount}</span>
                            ) : (
                              <span className="text-muted">
                                {goal.incentiveType === "FIXED" ? "₹" : ""}{goal.incentiveValue}
                                {goal.incentiveType === "PERCENTAGE_OF_CTC" ? "% of CTC" : goal.incentiveType === "PERCENTAGE_OF_TARGET" ? "% of target" : ""}
                              </span>
                            )}
                          </td>
                          <td className="pe-4 text-end" style={speedDialId === goal.id ? { overflow: 'visible', position: 'relative', zIndex: 1050 } : undefined}>
                            {goal.status === "SUBMITTED" && (
                              <span className="badge badge-soft-warning badge-sm">Pending Approval</span>
                            )}
                            {goal.status === "APPROVED" && (goal.achievedValue ?? 0) >= goal.targetValue && (
                              <span className="text-success small fw-semibold"><i className="ti ti-circle-check me-1" />Completed</span>
                            )}
                            {(goal.status === "IN_PROGRESS" || (goal.status === "APPROVED" && (goal.achievedValue ?? 0) < goal.targetValue)) && (
                              <div className="speed-dial-wrap">
                                <button className="speed-dial-toggle btn btn-sm btn-primary rounded-circle shadow-sm"
                                  onClick={(e) => { e.stopPropagation(); setSpeedDialId(speedDialId === goal.id ? null : goal.id); }}>
                                  <i className={`ti ${speedDialId === goal.id ? 'ti-x' : 'ti-dots-vertical'} fs-6`} />
                                </button>
                                {speedDialId === goal.id && getMyGoalActions(goal).map((action, i) => {
                                  const y = -(i + 1) * 42;
                                  return (
                                    <div key={i} className="speed-dial-item-pos" style={{ marginLeft: `-110px`, marginTop: `${y}px` }}>
                                      <button className={`speed-dial-item ${action.variant}`}
                                        style={{ animationDelay: `${i * 0.04}s` }}
                                        onClick={(e) => { e.stopPropagation(); setSpeedDialId(null); action.onClick(); }}>
                                        <i className={`${action.icon} fs-6`} />
                                        <span>{action.label}</span>
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {submitModal && (
            <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 shadow-lg">
                  <div className="modal-header">
                    <h5 className="modal-title fw-bold">Submit Progress</h5>
                    <button type="button" className="btn-close custom-btn-close" onClick={() => setSubmitModal(null)}>
                      <i className="ti ti-x" />
                    </button>
                  </div>
                  <div className="modal-body">
                    <p className="fw-semibold mb-1">{submitModal.title}</p>
                    <p className="text-muted small mb-3">Target: {submitModal.targetValue} {fmtUnit(submitModal.targetUnit)}</p>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Achieved Value</label>
                      <input
                        type="number"
                        className="form-control"
                        value={achievedValue}
                        onChange={(e) => setAchievedValue(Number(e.target.value))}
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button className="btn btn-white" onClick={() => setSubmitModal(null)}>Cancel</button>
                    <button className="btn btn-primary" onClick={() => handleSubmitProgress(submitModal.id)}>
                      <i className="ti ti-check me-1" />Submit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyGoalPage;
