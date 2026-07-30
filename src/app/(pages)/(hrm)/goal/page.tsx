"use client";

import React, { useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { SkeletonTable } from "@/core/common/Skeleton";

interface Goal {
  id: number;
  employeeId: number;
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
  employee: { id: number; name: string; email: string; employeeCode?: string };
  createdAt: string;
}

interface Employee {
  id: number;
  name: string;
  email: string;
  employeeCode?: string;
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

const GoalPage = () => {
  const [loading, setLoading] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterEmployee, setFilterEmployee] = useState("");

  const [formData, setFormData] = useState({
    employeeId: 0,
    title: "",
    description: "",
    targetValue: 0,
    targetUnit: "INR",
    startDate: "",
    endDate: "",
    incentiveType: "FIXED",
    incentiveValue: 0,
  });

  const [approveData, setApproveData] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    ratingOverride: 100,
  });
  const [approveModal, setApproveModal] = useState<Goal | null>(null);
  const [speedDialId, setSpeedDialId] = useState<number | null>(null);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus) params.set("status", filterStatus);
      if (filterEmployee) params.set("employeeId", filterEmployee);
      const res = await axiosInstance.get(`/goal?${params.toString()}`);
      setGoals(res?.data?.data || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await axiosInstance.get("/employee?limit=1000");
      setEmployees(res?.data?.data?.employees || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchGoals();
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [filterStatus, filterEmployee]);

  useEffect(() => {
    if (!speedDialId) return;
    const handler = () => setSpeedDialId(null);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [speedDialId]);

  const resetForm = () => {
    setFormData({
      employeeId: 0,
      title: "",
      description: "",
      targetValue: 0,
      targetUnit: "INR",
      startDate: "",
      endDate: "",
      incentiveType: "FIXED",
      incentiveValue: 0,
    });
    setEditingGoal(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setFormData({
      employeeId: goal.employeeId,
      title: goal.title,
      description: goal.description || "",
      targetValue: goal.targetValue,
      targetUnit: goal.targetUnit,
      startDate: goal.startDate.slice(0, 10),
      endDate: goal.endDate.slice(0, 10),
      incentiveType: goal.incentiveType,
      incentiveValue: goal.incentiveValue,
    });
    setShowModal(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ["targetValue", "incentiveValue", "employeeId"].includes(name) ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingGoal) {
        await axiosInstance.patch(`/goal/${editingGoal.id}`, formData);
      } else {
        await axiosInstance.post("/goal", formData);
      }
      setShowModal(false);
      resetForm();
      fetchGoals();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed");
    }
  };

  const handleViewDetail = async (goal: Goal) => {
    try {
      const res = await axiosInstance.get(`/goal/${goal.id}`);
      const g = res?.data?.data;
      setSelectedGoal(g);
      setApproveData({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        ratingOverride: g.rating ?? 100,
      });
      setShowDetailModal(true);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to load goal");
    }
  };

  const handleSubmitProgress = async () => {
    if (!selectedGoal) return;
    const val = prompt("Enter achieved value:", String(selectedGoal.achievedValue || ""));
    if (val === null) return;
    try {
      await axiosInstance.patch(`/goal/${selectedGoal.id}/progress`, { achievedValue: Number(val) });
      setShowDetailModal(false);
      fetchGoals();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed");
    }
  };

  const handleApprove = async () => {
    if (!selectedGoal) return;
    try {
      await axiosInstance.patch(`/goal/${selectedGoal.id}/approve`, approveData);
      setShowDetailModal(false);
      fetchGoals();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed");
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm("Cancel this goal?")) return;
    try {
      await axiosInstance.patch(`/goal/${id}`, { status: "CANCELLED" });
      fetchGoals();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed");
    }
  };

  const getGoalActions = (goal: Goal) => {
    const items: { icon: string; label: string; variant: string; onClick: () => void }[] = [];
    items.push({ icon: "ti ti-eye", label: "View Details", variant: "sd-info", onClick: () => handleViewDetail(goal) });
    if (goal.status === "PENDING") {
      items.push({ icon: "ti ti-player-play-filled", label: "Start", variant: "sd-primary", onClick: async () => {
        try { await axiosInstance.patch(`/goal/${goal.id}`, { status: "IN_PROGRESS" }); fetchGoals(); }
        catch (e: any) { alert(e?.response?.data?.message || "Failed"); }
      }});
      items.push({ icon: "ti ti-edit", label: "Edit", variant: "sd-warning", onClick: () => handleEdit(goal) });
      items.push({ icon: "ti ti-x", label: "Cancel", variant: "sd-danger", onClick: () => handleCancel(goal.id) });
    }
    if (goal.status === "IN_PROGRESS") {
      items.push({ icon: "ti ti-checklist", label: "Submit Progress", variant: "sd-success", onClick: () => {
        const val = prompt("Enter achieved value:", String(goal.achievedValue || ""));
        if (val !== null) axiosInstance.patch(`/goal/${goal.id}/progress`, { achievedValue: Number(val) })
          .then(() => fetchGoals()).catch((e) => alert(e?.response?.data?.message || "Failed"));
      }});
      items.push({ icon: "ti ti-edit", label: "Edit", variant: "sd-warning", onClick: () => handleEdit(goal) });
      items.push({ icon: "ti ti-x", label: "Cancel", variant: "sd-danger", onClick: () => handleCancel(goal.id) });
    }
    if (goal.status === "SUBMITTED") {
      items.push({ icon: "ti ti-circle-check", label: "Approve", variant: "sd-success", onClick: () => {
        setApproveModal(goal);
        setApproveData({ month: new Date().getMonth() + 1, year: new Date().getFullYear(), ratingOverride: goal.rating ?? 100 });
      }});
      items.push({ icon: "ti ti-x", label: "Cancel", variant: "sd-danger", onClick: async () => {
        try { await axiosInstance.patch(`/goal/${goal.id}`, { status: "CANCELLED" }); fetchGoals(); }
        catch (e: any) { alert(e?.response?.data?.message || "Failed"); }
      }});
    }
    if (goal.status === "APPROVED") {
      if ((goal.achievedValue ?? 0) < goal.targetValue) {
        items.push({ icon: "ti ti-refresh", label: "Update Progress", variant: "sd-success", onClick: () => {
          const val = prompt("Enter updated achieved value:", String(goal.achievedValue || ""));
          if (val !== null) axiosInstance.patch(`/goal/${goal.id}/progress`, { achievedValue: Number(val) })
            .then(() => fetchGoals()).catch((e) => alert(e?.response?.data?.message || "Failed"));
        }});
      }
      items.push({ icon: "ti ti-rotate-2", label: "Cancel Approve", variant: "sd-danger", onClick: async () => {
        if (!confirm("Cancel this approval and revert to Submitted?")) return;
        try { await axiosInstance.patch(`/goal/${goal.id}`, { status: "SUBMITTED" }); fetchGoals(); }
        catch (e: any) { alert(e?.response?.data?.message || "Failed"); }
      }});
    }
    return items;
  };

  const incentiveLabel = (type: string, value: number) => {
    switch (type) {
      case "FIXED": return `₹${value}`;
      case "PERCENTAGE_OF_CTC": return `${value}% of CTC`;
      case "PERCENTAGE_OF_TARGET": return `${value}% of achieved`;
      default: return `${value}`;
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
              <h2 className="mb-1">Goal Management</h2>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">HRM Admin</li>
                  <li className="breadcrumb-item">Employee</li>
                  <li className="breadcrumb-item active" aria-current="page">Goals</li>
                </ol>
              </nav>
            </div>
            <button className="btn btn-primary-gradient" onClick={handleOpenCreate}>
              <i className="ti ti-plus me-2" />Assign Goal
            </button>
          </div>

          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <div className="row g-3 align-items-end">
                <div className="col-md-4">
                  <label className="form-label fw-semibold small mb-1">Status</label>
                  <select className="form-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="SUBMITTED">Submitted</option>
                    <option value="APPROVED">Approved</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold small mb-1">Employee</label>
                  <select className="form-select" value={filterEmployee} onChange={(e) => setFilterEmployee(e.target.value)}>
                    <option value="">All Employees</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>{emp.name} ({emp.email})</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-2">
                  <button className="btn btn-soft-primary w-100 goal-action-btn" onClick={fetchGoals}>
                    <i className="ti ti-refresh me-1" />Refresh
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              {loading ? (
                <div className="p-4">
                  <SkeletonTable rows={5} columns={8} />
                </div>
              ) : goals.length === 0 ? (
                <div className="text-center py-5">
                  <i className="ti ti-flag-off goal-empty-icon d-block mb-2" />
                  <p className="text-muted mb-3">No goals have been assigned yet</p>
                  <button className="btn btn-primary-gradient btn-sm" onClick={handleOpenCreate}>
                    <i className="ti ti-plus me-1" /> Assign Your First Goal
                  </button>
                </div>
              ) : (
                <div className="table-responsive" style={speedDialId ? { overflow: 'visible' } : undefined}>
                  <table className="table align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="ps-4" style={{ width: "50px" }}>#</th>
                        <th>Progress</th>
                        <th>Employee</th>
                        <th>Goal</th>
                        <th>Target</th>
                        <th>Achieved</th>
                        <th>Incentive</th>
                        <th>Status</th>
                        <th className="pe-4 text-end">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {goals.map((goal, index) => (
                        <tr key={goal.id}>
                          <td className="ps-4">{index + 1}</td>
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
                            <div className="fw-semibold">{goal.employee.name}</div>
                            <small className="text-muted">{goal.employee.employeeCode}</small>
                          </td>
                          <td>
                            <div className="fw-semibold">{goal.title}</div>
                            {goal.description && <small className="text-muted">{goal.description.slice(0, 50)}</small>}
                          </td>
                          <td>{goal.targetValue} {fmtUnit(goal.targetUnit)}</td>
                          <td>{goal.achievedValue ?? "-"}</td>
                          <td>
                            <small>{incentiveLabel(goal.incentiveType, goal.incentiveValue)}</small>
                            {goal.calculatedAmount != null && (
                              <div className="fw-bold text-success">₹{goal.calculatedAmount}</div>
                            )}
                          </td>
                          <td>
                            <span className={`badge ${STATUS_BADGE[goal.status] || "badge-soft-secondary"} badge-sm`}>
                              {goal.status}
                            </span>
                          </td>
                          <td className="pe-4 text-end" style={speedDialId === goal.id ? { overflow: 'visible', position: 'relative', zIndex: 1050 } : undefined}>
                            {goal.status === "APPROVED" && !((goal.achievedValue ?? 0) < goal.targetValue) ? (
                              <span className="text-success small fw-semibold"><i className="ti ti-circle-check me-1" />Completed</span>
                            ) : (
                              <div className="speed-dial-wrap">
                                <button className="speed-dial-toggle btn btn-sm btn-primary rounded-circle shadow-sm"
                                  onClick={(e) => { e.stopPropagation(); setSpeedDialId(speedDialId === goal.id ? null : goal.id); }}>
                                  <i className={`ti ${speedDialId === goal.id ? 'ti-x' : 'ti-dots-vertical'} fs-6`} />
                                </button>
                                {speedDialId === goal.id && getGoalActions(goal).map((action, i) => {
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
        </div>

        {showModal && (
          <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content border-0 shadow-lg">
                <div className="modal-header">
                  <h5 className="modal-title fw-bold">{editingGoal ? "Edit Goal" : "Assign Goal"}</h5>
                  <button className="btn-close custom-btn-close" onClick={() => { setShowModal(false); resetForm(); }}>
                    <i className="ti ti-x" />
                  </button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    <div className="row g-3">
                      <div className="col-6">
                        <label className="form-label fw-semibold">Employee</label>
                        <select className="form-select" name="employeeId" value={formData.employeeId} onChange={handleChange} required>
                          <option value={0}>Select employee</option>
                          {employees.map((emp) => (
                            <option key={emp.id} value={emp.id}>{emp.name} ({emp.email})</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-6">
                        <label className="form-label fw-semibold">Goal Title</label>
                        <input type="text" className="form-control" name="title" value={formData.title} onChange={handleChange} required />
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-semibold">Description</label>
                        <textarea className="form-control" name="description" value={formData.description} onChange={handleChange} rows={2} />
                      </div>
                      <div className="col-3">
                        <label className="form-label fw-semibold">Target Value</label>
                        <input type="number" className="form-control" name="targetValue" value={formData.targetValue} onChange={handleChange} required />
                      </div>
                      <div className="col-3">
                        <label className="form-label fw-semibold">Target Unit</label>
                        <select className="form-select" value={["INR","Sales","Units","Count","Clients","Hours","Days","%"].includes(formData.targetUnit) ? formData.targetUnit : "Other"} onChange={(e) => setFormData(p => ({ ...p, targetUnit: e.target.value === "Other" ? "" : e.target.value }))}>
                          <option value="">Select unit...</option>
                          <option value="INR">INR (₹)</option>
                          <option value="Sales">Sales</option>
                          <option value="Units">Units</option>
                          <option value="Count">Count</option>
                          <option value="Clients">Clients</option>
                          <option value="Hours">Hours</option>
                          <option value="Days">Days</option>
                          <option value="%">% (Percentage)</option>
                          <option value="Other">Other</option>
                        </select>
                        {!["INR","Sales","Units","Count","Clients","Hours","Days","%",""].includes(formData.targetUnit) && (
                          <input type="text" className="form-control mt-1" placeholder="Type unit..." value={formData.targetUnit} onChange={(e) => setFormData(p => ({ ...p, targetUnit: e.target.value }))} />
                        )}
                      </div>
                      <div className="col-3">
                        <label className="form-label fw-semibold">Start Date</label>
                        <input type="date" className="form-control" name="startDate" value={formData.startDate} onChange={handleChange} required />
                      </div>
                      <div className="col-3">
                        <label className="form-label fw-semibold">End Date</label>
                        <input type="date" className="form-control" name="endDate" value={formData.endDate} onChange={handleChange} required />
                      </div>
                      <div className="col-6">
                        <label className="form-label fw-semibold">Incentive Type</label>
                        <select className="form-select" name="incentiveType" value={formData.incentiveType} onChange={handleChange}>
                          <option value="FIXED">Fixed Amount</option>
                          <option value="PERCENTAGE_OF_CTC">% of Monthly CTC</option>
                          <option value="PERCENTAGE_OF_TARGET">% of Achieved Target</option>
                        </select>
                      </div>
                      <div className="col-6">
                        <label className="form-label fw-semibold">Incentive Value</label>
                        <input type="number" className="form-control" name="incentiveValue" value={formData.incentiveValue} onChange={handleChange} required />
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-white" onClick={() => { setShowModal(false); resetForm(); }}>Close</button>
                    <button type="submit" className="btn btn-primary">{editingGoal ? "Update" : "Assign Goal"}</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {showDetailModal && selectedGoal && (
          <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg">
                <div className="modal-header">
                  <h5 className="modal-title fw-bold">{selectedGoal.title}</h5>
                  <button className="btn-close custom-btn-close" onClick={() => setShowDetailModal(false)}>
                    <i className="ti ti-x" />
                  </button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <span className={`badge ${STATUS_BADGE[selectedGoal.status] || "badge-soft-secondary"} badge-md`}>{selectedGoal.status}</span>
                  </div>
                  <table className="table table-sm">
                    <tbody>
                      <tr><td className="fw-semibold">Employee</td><td>{selectedGoal.employee.name}</td></tr>
                      <tr><td className="fw-semibold">Description</td><td>{selectedGoal.description || "-"}</td></tr>
                      <tr><td className="fw-semibold">Target</td><td>{selectedGoal.targetValue} {fmtUnit(selectedGoal.targetUnit)}</td></tr>
                      <tr><td className="fw-semibold">Achieved</td><td>{selectedGoal.achievedValue ?? "-"}</td></tr>
                      <tr><td className="fw-semibold">Progress</td><td>{selectedGoal.rating != null ? `${Math.round(selectedGoal.rating)}%` : "-"}</td></tr>
                      <tr><td className="fw-semibold">Period</td><td>{new Date(selectedGoal.startDate).toLocaleDateString()} - {new Date(selectedGoal.endDate).toLocaleDateString()}</td></tr>
                      <tr><td className="fw-semibold">Incentive</td><td>{incentiveLabel(selectedGoal.incentiveType, selectedGoal.incentiveValue)}</td></tr>
                      {selectedGoal.calculatedAmount != null && (
                        <tr><td className="fw-semibold text-success">Calculated Amount</td><td className="fw-bold">₹{selectedGoal.calculatedAmount}</td></tr>
                      )}
                      {selectedGoal.incentiveMonth && (
                        <tr><td className="fw-semibold">Applied In</td><td>{selectedGoal.incentiveMonth}/{selectedGoal.incentiveYear}</td></tr>
                      )}
                    </tbody>
                  </table>

                  {selectedGoal.status === "IN_PROGRESS" && (
                    <button className="btn btn-success-light w-100 mt-2 goal-action-btn" onClick={handleSubmitProgress}>
                      <i className="ti ti-checklist me-1" /> Submit Progress
                    </button>
                  )}

                  {selectedGoal.status === "APPROVED" && (selectedGoal.achievedValue ?? 0) < selectedGoal.targetValue && (
                    <button className="btn btn-success-light w-100 mt-2 goal-action-btn" onClick={handleSubmitProgress}>
                      <i className="ti ti-refresh me-1" /> Update Progress
                    </button>
                  )}

                  {selectedGoal.status === "SUBMITTED" && (
                    <div className="mt-3 p-3 bg-light rounded-3">
                      <h6 className="fw-bold mb-3">Approve Incentive</h6>
                      <div className="row g-2 mb-2">
                        <div className="col-4">
                          <label className="form-label small fw-semibold">Achievement %</label>
                          <input type="number" className="form-control" min={0} max={100}
                            value={approveData.ratingOverride}
                            onChange={(e) => setApproveData(p => ({ ...p, ratingOverride: Number(e.target.value) }))} />
                        </div>
                        <div className="col-4">
                          <label className="form-label small fw-semibold">Month</label>
                          <input type="number" className="form-control" min={1} max={12}
                            value={approveData.month}
                            onChange={(e) => setApproveData(p => ({ ...p, month: Number(e.target.value) }))} />
                        </div>
                        <div className="col-4">
                          <label className="form-label small fw-semibold">Year</label>
                          <input type="number" className="form-control"
                            value={approveData.year}
                            onChange={(e) => setApproveData(p => ({ ...p, year: Number(e.target.value) }))} />
                        </div>
                      </div>
                      <button className="btn btn-success w-100 goal-action-btn" onClick={handleApprove}>
                        <i className="ti ti-circle-check me-1" /> Approve
                      </button>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button className="btn btn-white" onClick={() => setShowDetailModal(false)}>Close</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {approveModal && (
          <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered modal-sm">
              <div className="modal-content border-0 shadow-lg">
                <div className="modal-header">
                  <h5 className="modal-title fw-bold">Approve Goal</h5>
                  <button className="btn-close custom-btn-close" onClick={() => setApproveModal(null)}>
                    <i className="ti ti-x" />
                  </button>
                </div>
                <div className="modal-body">
                  <p className="mb-2 fw-semibold">{approveModal.title}</p>
                  <p className="text-muted small mb-3">
                    Incentive: {incentiveLabel(approveModal.incentiveType, approveModal.incentiveValue)}
                    {approveModal.achievedValue != null && approveModal.targetValue > 0 && (
                      <> &bull; Achieved: {Math.round((approveModal.achievedValue / approveModal.targetValue) * 100)}%</>
                    )}
                  </p>
                  <div className="row g-2 mb-3">
                    <div className="col-4">
                      <label className="form-label small fw-semibold">%</label>
                      <input type="number" className="form-control" min={0} max={100}
                        value={approveData.ratingOverride}
                        onChange={(e) => setApproveData(p => ({ ...p, ratingOverride: Number(e.target.value) }))} />
                    </div>
                    <div className="col-4">
                      <label className="form-label small fw-semibold">Month</label>
                      <input type="number" className="form-control" min={1} max={12}
                        value={approveData.month}
                        onChange={(e) => setApproveData(p => ({ ...p, month: Number(e.target.value) }))} />
                    </div>
                    <div className="col-4">
                      <label className="form-label small fw-semibold">Year</label>
                      <input type="number" className="form-control"
                        value={approveData.year}
                        onChange={(e) => setApproveData(p => ({ ...p, year: Number(e.target.value) }))} />
                    </div>
                  </div>
                  <button className="btn btn-success w-100 goal-action-btn" onClick={async () => {
                    try {
                      await axiosInstance.patch(`/goal/${approveModal.id}/approve`, approveData);
                      setApproveModal(null);
                      fetchGoals();
                    } catch (err: any) {
                      alert(err?.response?.data?.message || "Failed");
                    }
                  }}>
                    <i className="ti ti-circle-check me-1" /> Approve
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalPage;
