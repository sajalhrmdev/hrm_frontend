"use client";

import React, { useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";

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

const GoalTab = ({ employeeId }: { employeeId: number }) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/goal/employee/${employeeId}`);
        setGoals(res?.data?.data || []);
      } catch {
        setGoals([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [employeeId]);

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-primary spinner-border-sm me-2" role="status" />
        <span className="text-muted">Loading goals...</span>
      </div>
    );
  }

  if (goals.length === 0) {
    return (
      <div className="text-center py-4">
        <i className="ti ti-flag-off d-block mb-2" style={{ fontSize: "2rem", color: "#d0d5dd" }} />
        <p className="text-muted mb-0">No goals assigned yet.</p>
      </div>
    );
  }

  return (
    <div className="row g-3">
      {goals.map((goal) => (
        <div key={goal.id} className="col-12">
          <div className="card border-0 shadow-sm mb-0">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <h6 className="fw-bold mb-1">{goal.title}</h6>
                  {goal.description && <p className="text-muted small mb-0">{goal.description}</p>}
                </div>
                <span className={`badge ${STATUS_BADGE[goal.status] || "badge-soft-secondary"} badge-sm`}>
                  {goal.status}
                </span>
              </div>
              <div className="row g-2">
                <div className="col-md-3">
                  <small className="text-muted d-block">Target</small>
                  <span className="fw-semibold">{goal.targetValue} {goal.targetUnit}</span>
                </div>
                <div className="col-md-3">
                  <small className="text-muted d-block">Achieved</small>
                  <span className="fw-semibold">{goal.achievedValue ?? "-"}</span>
                </div>
                <div className="col-md-3">
                  <small className="text-muted d-block">Progress</small>
                  {goal.rating != null ? (
                    <div className="d-flex align-items-center gap-2 mt-1">
                      <div className="progress flex-grow-1" style={{ height: "6px", borderRadius: "3px" }}>
                        <div className={`progress-bar ${progressBarColor(goal.rating)}`} role="progressbar"
                          style={{ width: `${Math.round(goal.rating)}%` }} />
                      </div>
                      <small className="fw-semibold">{Math.round(goal.rating)}%</small>
                    </div>
                  ) : (
                    <span className="fw-semibold">-</span>
                  )}
                </div>
                <div className="col-md-3">
                  <small className="text-muted d-block">Period</small>
                  <span className="fw-semibold small">
                    {new Date(goal.startDate).toLocaleDateString()} - {new Date(goal.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
              {goal.calculatedAmount != null && (
                <div className="mt-2 pt-2 border-top">
                  <small className="text-muted">Incentive Paid: </small>
                  <span className="fw-bold text-success">₹{goal.calculatedAmount}</span>
                  {goal.incentiveMonth && <span className="text-muted small ms-1">({goal.incentiveMonth}/{goal.incentiveYear})</span>}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GoalTab;
