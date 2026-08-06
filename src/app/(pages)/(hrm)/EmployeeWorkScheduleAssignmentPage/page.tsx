"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

import { toast } from "react-toastify";

import axiosInstance from "@/utils/axiosInstance";
import { SkeletonTable } from "@/core/common/Skeleton";

// ======================================================

const PAGE_SIZE = 20;

// ======================================================

const EmployeeWorkScheduleAssignmentPage = () => {
  // ======================================================

  const [loading, setLoading] = useState(false);

  const [assigning, setAssigning] = useState(false);

  const [unassigning, setUnassigning] = useState(false);

  const [employees, setEmployees] = useState<any[]>([]);

  const [departments, setDepartments] = useState<any[]>([]);

  const [policies, setPolicies] = useState<any[]>([]);

  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);

  const [selectedPolicy, setSelectedPolicy] = useState("");

  const [search, setSearch] = useState("");

  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [departmentFilter, setDepartmentFilter] = useState("");

  const [policyFilter, setPolicyFilter] = useState("");

  const [page, setPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);

  const [total, setTotal] = useState(0);

  const abortRef = useRef<AbortController | null>(null);

  // ======================================================
  // DEBOUNCE SEARCH
  // ======================================================

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);

    return () => clearTimeout(timer);
  }, [search]);

  const [confirm, setConfirm] = useState<{
    type: "assign" | "unassign" | "assignAll";

    title: string;
  } | null>(null);

  // ======================================================
  // FETCH
  // ======================================================

  const fetchData = useCallback(async () => {
    abortRef.current?.abort();

    const controller = new AbortController();

    abortRef.current = controller;

    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: String(page),

        limit: String(PAGE_SIZE),
      });

      if (debouncedSearch.trim()) {
        params.set("search", debouncedSearch.trim());
      }

      if (departmentFilter) {
        params.set("departmentId", departmentFilter);
      }

      if (policyFilter === "unassigned") {
        params.set("unassigned", "true");
      } else if (policyFilter) {
        params.set("policyId", policyFilter);
      }

      const [employeeRes, policyRes] = await Promise.all([
        axiosInstance.get(`/employee?${params.toString()}`, {
          signal: controller.signal,
        }),

        axiosInstance.get("/work-schedule-policy", {
          signal: controller.signal,
        }),
      ]);

      const employeeData = employeeRes?.data?.data;

      setEmployees(employeeData?.employees || []);

      setTotal(employeeData?.pagination?.total || 0);

      setTotalPages(employeeData?.pagination?.totalPages || 1);

      setPolicies(policyRes?.data?.data || []);
    } catch (err: any) {
      if (err?.name !== "CanceledError" && err?.code !== "ERR_CANCELED") {
        console.log(err);

        toast.error("Failed to load data");
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [page, debouncedSearch, departmentFilter, policyFilter]);

  // ======================================================
  // FETCH DEPARTMENTS
  // ======================================================

  const fetchDepartments = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/department?limit=1000");

      setDepartments(res?.data?.data?.departments || []);
    } catch (err) {
      console.log(err);
    }
  }, []);

  // ======================================================

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  // ======================================================
  // FILTER CHANGE RESETS PAGE
  // ======================================================

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, departmentFilter, policyFilter]);

  // ======================================================
  // SELECT
  // ======================================================

  const toggleEmployee = (id: number) => {
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  // ======================================================
  // SELECT ALL (VISIBLE PAGE)
  // ======================================================

  const toggleSelectAll = () => {
    const allIds = employees.map((emp: any) => emp.id);

    const isAllSelected = allIds.every((id: number) =>
      selectedEmployees.includes(id),
    );

    if (isAllSelected) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(allIds);
    }
  };

  // ======================================================
  // ASSIGN
  // ======================================================

  const handleAssign = async () => {
    try {
      const isAll = confirm?.type === "assignAll";

      if (!isAll && !selectedEmployees.length) {
        return toast.error("Select employees");
      }

      if (!selectedPolicy) {
        return toast.error("Select policy");
      }

      setAssigning(true);

      await axiosInstance.post("/work-schedule-policy/assign", {
        employeeIds: isAll ? [] : selectedEmployees,

        workSchedulePolicyId: selectedPolicy,

        assignAll: isAll,
      });

      toast.success(
        isAll ? "Policy assigned to all active employees" : "Policy assigned successfully",
      );

      setSelectedEmployees([]);

      setConfirm(null);

      fetchData();
    } catch (err: any) {
      console.log(err);

      toast.error(err?.response?.data?.message || "Assignment failed");
    } finally {
      setAssigning(false);
    }
  };

  // ======================================================
  // UNASSIGN
  // ======================================================

  const handleUnassign = async () => {
    try {
      if (!selectedEmployees.length) {
        return toast.error("Select employees");
      }

      setUnassigning(true);

      await axiosInstance.post("/work-schedule-policy/unassign", {
        employeeIds: selectedEmployees,
      });

      toast.success("Policy removed successfully");

      setSelectedEmployees([]);

      setConfirm(null);

      fetchData();
    } catch (err: any) {
      console.log(err);

      toast.error(err?.response?.data?.message || "Remove failed");
    } finally {
      setUnassigning(false);
    }
  };

  // ======================================================
  // CONFIRM OPEN
  // ======================================================

  const openConfirm = (type: "assign" | "unassign") => {
    if (!selectedEmployees.length) {
      return toast.error("Select employees");
    }

    const title =
      type === "assign"
        ? `Assign "${
            policies.find((p: any) => String(p.id) === selectedPolicy)?.title ||
            "policy"
          }" to ${selectedEmployees.length} employee(s)?`
        : `Remove the current policy from ${selectedEmployees.length} employee(s)?`;

    setConfirm({ type, title });
  };

  // ======================================================
  // CONFIRM OPEN (ASSIGN ALL)
  // ======================================================

  const openConfirmAll = () => {
    if (!selectedPolicy) {
      return toast.error("Select policy");
    }

    const title = `Assign "${
      policies.find((p: any) => String(p.id) === selectedPolicy)?.title ||
      "policy"
    }" to all active employees in the company?`;

    setConfirm({ type: "assignAll", title });
  };

  // ======================================================

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="assignment-page">
          {/* ====================================================== */}
          {/* HEADER */}
          {/* ====================================================== */}

          <div className="top-header">
            <div>
              <h1>Employee Work Schedule Assignment</h1>

              <p>Assign work schedule policies to employees</p>
            </div>
          </div>

          {/* ====================================================== */}
          {/* ACTION BAR */}
          {/* ====================================================== */}

          <div className="action-bar">
            <input
              className="search-input"
              type="text"
              placeholder="Search by name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="filter-select"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="">All Departments</option>

              {departments.map((dept: any) => (
                <option key={dept.id} value={dept.id}>
                  {dept.title}
                </option>
              ))}
            </select>

            <select
              className="filter-select"
              value={policyFilter}
              onChange={(e) => setPolicyFilter(e.target.value)}
            >
              <option value="">All Policies</option>

              <option value="unassigned">Unassigned</option>

              {policies.map((item: any) => (
                <option key={item.id} value={item.id}>
                  {item.title} ({item.employees?.length || 0})
                </option>
              ))}
            </select>

            <select
              className="filter-select"
              value={selectedPolicy}
              onChange={(e) => setSelectedPolicy(e.target.value)}
            >
              <option value="">Select Policy to Assign</option>

              {policies.map((item: any) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>

            <button
              className="assign-btn"
              disabled={assigning || !selectedEmployees.length}
              onClick={() => openConfirm("assign")}
            >
              {assigning ? "Assigning..." : `Assign (${selectedEmployees.length})`}
            </button>

            <button
              className="assign-all-btn"
              disabled={assigning || !selectedPolicy}
              onClick={openConfirmAll}
            >
              Assign to All
            </button>

            <button
              className="unassign-btn"
              disabled={unassigning || !selectedEmployees.length}
              onClick={() => openConfirm("unassign")}
            >
              {unassigning ? "Removing..." : "Remove"}
            </button>
          </div>

          {/* ====================================================== */}
          {/* SELECTION BAR */}
          {/* ====================================================== */}

          {selectedEmployees.length > 0 && (
            <div className="selection-bar">
              <span>
                <strong>{selectedEmployees.length}</strong> employee(s) selected
              </span>

              <button
                className="clear-btn"
                onClick={() => setSelectedEmployees([])}
              >
                Clear selection
              </button>
            </div>
          )}

          {/* ====================================================== */}
          {/* TABLE */}
          {/* ====================================================== */}

          <div className="table-card">
            <table>
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      onChange={toggleSelectAll}
                      checked={
                        employees.length > 0 &&
                        employees.every((emp: any) =>
                          selectedEmployees.includes(emp.id),
                        )
                      }
                    />
                  </th>

                  <th>Employee</th>

                  <th>Department</th>

                  <th>Current Policy</th>

                  <th>Shift</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5}>
                      <SkeletonTable rows={5} columns={5} />
                    </td>
                  </tr>
                ) : employees.length ? (
                  employees.map((emp: any) => {
                    const assigned = !!emp?.workSchedulePolicy;

                    return (
                      <tr key={emp.id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedEmployees.includes(emp.id)}
                            onChange={() => toggleEmployee(emp.id)}
                          />
                        </td>

                        <td>
                          <div className="employee-box">
                            <div className="avatar">{emp?.name?.[0]}</div>

                            <div>
                              <h4>{emp?.name}</h4>

                              <p>{emp?.employeeCode}</p>
                            </div>
                          </div>
                        </td>

                        <td>{emp?.department?.title || "--"}</td>

                        <td>
                          <div
                            className={
                              assigned
                                ? "policy-badge assigned"
                                : "policy-badge unassigned"
                            }
                          >
                            {assigned
                              ? emp.workSchedulePolicy.title
                              : "Not Assigned"}
                          </div>
                        </td>

                        <td>
                          {emp?.workSchedulePolicy?.shift?.title || "--"}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5}>
                      <div className="empty-state">
                        <div className="empty-icon">📋</div>

                        <h4>No employees found</h4>

                        <p>
                          Try adjusting your search or filters, or assign a
                          policy to see it here.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ====================================================== */}
          {/* PAGINATION */}
          {/* ====================================================== */}

          {!loading && totalPages > 1 && (
            <div className="pagination-bar">
              <span>
                Showing {employees.length} of {total} employee(s)
              </span>

              <div className="pagination-controls">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (p) =>
                      p === 1 ||
                      p === totalPages ||
                      Math.abs(p - page) <= 2,
                  )
                  .reduce<number[]>(
                    (acc, p) =>
                      acc.length && p - acc[acc.length - 1] > 1
                        ? [...acc, -1, p]
                        : [...acc, p],
                    [],
                  )
                  .map((p, idx) =>
                    p === -1 ? (
                      <span key={`gap-${idx}`} className="page-gap">
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        className={p === page ? "active" : ""}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </button>
                    ),
                  )}

                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* ====================================================== */}
          {/* CONFIRM MODAL */}
          {/* ====================================================== */}

          {confirm && (
            <div className="confirm-overlay" onClick={() => setConfirm(null)}>
              <div
                className="confirm-modal"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="confirm-icon">
                  {confirm.type === "unassign" ? "✕" : "✓"}
                </div>

                <h3>
                  {confirm.type === "unassign"
                    ? "Confirm Removal"
                    : confirm.type === "assignAll"
                      ? "Assign to All Active Employees"
                      : "Confirm Assignment"}
                </h3>

                <p>{confirm.title}</p>

                <div className="confirm-actions">
                  <button
                    className="cancel-btn"
                    onClick={() => setConfirm(null)}
                    disabled={assigning || unassigning}
                  >
                    Cancel
                  </button>

                  <button
                    className={confirm.type === "unassign" ? "danger-btn" : "ok-btn"}
                    disabled={assigning || unassigning}
                    onClick={
                      confirm.type === "unassign" ? handleUnassign : handleAssign
                    }
                  >
                    {confirm.type === "unassign"
                      ? unassigning
                        ? "Removing..."
                        : "Remove"
                      : assigning
                        ? "Assigning..."
                        : "Confirm"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ====================================================== */}
          {/* STYLE */}
          {/* ====================================================== */}

          <style jsx>{`
            .assignment-page {
              padding: 24px;
            }

            .top-header {
              margin-bottom: 24px;
            }

            .top-header h1 {
              font-size: 32px;

              font-weight: 800;

              color: #111827;

              margin-bottom: 6px;
            }

            .top-header p {
              color: #6b7280;
            }

            .action-bar {
              display: flex;

              flex-wrap: wrap;

              gap: 16px;

              align-items: center;

              margin-bottom: 16px;
            }

            .action-bar .search-input {
              flex: 1 1 240px;

              min-width: 220px;
            }

            .action-bar input,
            .action-bar select {
              height: 52px;

              border-radius: 14px;

              border: 1px solid #d1d5db;

              padding: 0 16px;

              outline: none;

              background: white;

              font-size: 14px;

              color: #111827;
            }

            .action-bar select {
              min-width: 190px;

              cursor: pointer;
            }

            .action-bar input:focus,
            .action-bar select:focus {
              border-color: #111827;
            }

            .assign-btn,
            .assign-all-btn,
            .unassign-btn {
              height: 52px;

              border: none;

              color: white;

              border-radius: 14px;

              padding: 0 20px;

              font-weight: 700;

              cursor: pointer;

              white-space: nowrap;
            }

            .assign-btn {
              background: #111827;
            }

            .assign-all-btn {
              background: #2563eb;
            }

            .unassign-btn {
              background: #dc2626;
            }

            .assign-btn:disabled,
            .assign-all-btn:disabled,
            .unassign-btn:disabled {
              opacity: 0.4;

              cursor: not-allowed;
            }

            .selection-bar {
              display: flex;

              align-items: center;

              justify-content: space-between;

              gap: 12px;

              background: #eef2ff;

              border: 1px solid #c7d2fe;

              color: #4338ca;

              border-radius: 14px;

              padding: 12px 16px;

              margin-bottom: 16px;

              font-size: 14px;
            }

            .clear-btn {
              border: none;

              background: transparent;

              color: #dc2626;

              font-weight: 700;

              cursor: pointer;

              font-size: 13px;
            }

            .table-card {
              background: white;

              border-radius: 24px;

              overflow: auto;

              border: 1px solid #e5e7eb;

              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
            }

            table {
              width: 100%;

              border-collapse: collapse;
            }

            th {
              background: #f9fafb;

              padding: 18px;

              text-align: left;

              font-size: 13px;

              font-weight: 800;

              color: #374151;
            }

            td {
              padding: 18px;

              border-top: 1px solid #f3f4f6;
            }

            .employee-box {
              display: flex;

              align-items: center;

              gap: 14px;
            }

            .avatar {
              width: 48px;

              height: 48px;

              border-radius: 50%;

              background: #111827;

              color: white;

              display: flex;

              align-items: center;

              justify-content: center;

              font-weight: 700;

              font-size: 18px;
            }

            .employee-box h4 {
              margin: 0;

              font-size: 15px;

              color: #111827;
            }

            .employee-box p {
              margin: 4px 0 0;

              color: #6b7280;

              font-size: 13px;
            }

            .policy-badge {
              display: inline-flex;

              align-items: center;

              justify-content: center;

              padding: 8px 14px;

              border-radius: 999px;

              font-size: 12px;

              font-weight: 700;
            }

            .policy-badge.assigned {
              background: #eef2ff;

              color: #4338ca;
            }

            .policy-badge.unassigned {
              background: #f3f4f6;

              color: #6b7280;
            }

            .empty-state {
              text-align: center;

              padding: 48px 24px;
            }

            .empty-icon {
              font-size: 40px;

              margin-bottom: 12px;
            }

            .empty-state h4 {
              margin: 0 0 6px;

              font-size: 16px;

              color: #111827;
            }

            .empty-state p {
              margin: 0;

              color: #6b7280;

              font-size: 14px;
            }

            .pagination-bar {
              display: flex;

              align-items: center;

              justify-content: space-between;

              gap: 16px;

              flex-wrap: wrap;

              margin-top: 16px;

              font-size: 14px;

              color: #6b7280;
            }

            .pagination-controls {
              display: flex;

              align-items: center;

              gap: 6px;
            }

            .pagination-controls button {
              min-width: 38px;

              height: 38px;

              border: 1px solid #d1d5db;

              background: white;

              border-radius: 10px;

              cursor: pointer;

              font-weight: 600;

              color: #111827;

              padding: 0 12px;
            }

            .pagination-controls button.active {
              background: #111827;

              color: white;

              border-color: #111827;
            }

            .pagination-controls button:disabled {
              opacity: 0.4;

              cursor: not-allowed;
            }

            .page-gap {
              padding: 0 4px;

              color: #6b7280;
            }

            .confirm-overlay {
              position: fixed;

              inset: 0;

              background: rgba(17, 24, 39, 0.5);

              display: flex;

              align-items: center;

              justify-content: center;

              z-index: 1000;

              padding: 24px;
            }

            .confirm-modal {
              background: white;

              border-radius: 24px;

              padding: 32px;

              width: 100%;

              max-width: 420px;

              text-align: center;
            }

            .confirm-icon {
              width: 56px;

              height: 56px;

              border-radius: 50%;

              display: flex;

              align-items: center;

              justify-content: center;

              font-size: 22px;

              font-weight: 800;

              margin: 0 auto 16px;

              background: #eef2ff;

              color: #4338ca;
            }

            .confirm-modal h3 {
              margin: 0 0 8px;

              font-size: 18px;

              color: #111827;
            }

            .confirm-modal p {
              margin: 0 0 24px;

              color: #6b7280;

              font-size: 14px;
            }

            .confirm-actions {
              display: flex;

              gap: 12px;
            }

            .confirm-actions button {
              flex: 1;

              height: 48px;

              border: none;

              border-radius: 12px;

              font-weight: 700;

              cursor: pointer;
            }

            .cancel-btn {
              background: #f3f4f6;

              color: #111827;
            }

            .ok-btn {
              background: #111827;

              color: white;
            }

            .danger-btn {
              background: #dc2626;

              color: white;
            }

            .confirm-actions button:disabled {
              opacity: 0.6;

              cursor: not-allowed;
            }

            @media (max-width: 768px) {
              .assignment-page {
                padding: 16px;
              }

              .top-header h1 {
                font-size: 24px;
              }

              .action-bar {
                flex-direction: column;

                align-items: stretch;
              }

              .action-bar .search-input,
              .action-bar select,
              .action-bar button {
                width: 100%;

                min-width: 0;
              }

              .pagination-bar {
                flex-direction: column;

                align-items: flex-start;
              }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
};

export default EmployeeWorkScheduleAssignmentPage;
