"use client";

import React, { useEffect, useState } from "react";

import axiosInstance from "@/utils/axiosInstance";

// ======================================================

const LeaveIncrementLogsPage = () => {
  // ======================================================

  const [logs, setLogs] = useState<any[]>([]);

  const [employees, setEmployees] = useState<any[]>([]);

  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);

  const [pagination, setPagination] = useState<any>({});

  // ======================================================
  // FILTERS
  // ======================================================

  const [filters, setFilters] = useState({
    page: 1,

    limit: 10,

    employeeId: "",

    leaveTypeId: "",

    frequency: "",

    month: "",

    year: new Date().getFullYear(),

    status: "",
  });

  // ======================================================
  // FETCH LOGS
  // ======================================================

  const fetchLogs = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          params.append(key, String(value));
        }
      });

      const res = await axiosInstance.get(
        `/leave-increment-log?${params.toString()}`,
      );

      setLogs(res?.data?.data?.logs || []);

      setPagination(res?.data?.data?.pagination || {});
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // FETCH EMPLOYEES
  // ======================================================

  const fetchEmployees = async () => {
    try {
      const res = await axiosInstance.get("/employee");

      setEmployees(res?.data?.data?.employees || []);
    } catch (err) {
      console.log(err);
    }
  };

  // ======================================================
  // FETCH LEAVE TYPES
  // ======================================================

  const fetchLeaveTypes = async () => {
    try {
      const res = await axiosInstance.get("/leave/types");

      setLeaveTypes(res?.data?.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  // ======================================================

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  // ======================================================

  useEffect(() => {
    fetchEmployees();

    fetchLeaveTypes();
  }, []);

  // ======================================================
  // CHANGE
  // ======================================================

  const handleChange = (e: any) => {
    const { name, value } = e.target;

    setFilters((prev: any) => ({
      ...prev,

      [name]: value,

      page: 1,
    }));
  };

  // ======================================================
  // PAGE CHANGE
  // ======================================================

  const changePage = (page: number) => {
    setFilters((prev: any) => ({
      ...prev,

      page,
    }));
  };

  // ======================================================

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="logs-page">
          {/* ====================================================== */}
          {/* HEADER */}
          {/* ====================================================== */}

          <div className="top-header">
            <div>
              <h1>Leave Increment Logs</h1>

              <p>Track all employee leave increment history</p>
            </div>
          </div>

          {/* ====================================================== */}
          {/* FILTERS */}
          {/* ====================================================== */}

          <div className="filter-card">
            <div className="filter-grid">
              {/* EMPLOYEE */}

              <div className="form-group">
                <label>Employee</label>

                <select
                  name="employeeId"
                  value={filters.employeeId}
                  onChange={handleChange}
                >
                  <option value="">All Employees</option>

                  {employees.map((item: any) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* LEAVE TYPE */}

              <div className="form-group">
                <label>Leave Type</label>

                <select
                  name="leaveTypeId"
                  value={filters.leaveTypeId}
                  onChange={handleChange}
                >
                  <option value="">All Leave Types</option>

                  {leaveTypes.map((item: any) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* FREQUENCY */}

              <div className="form-group">
                <label>Frequency</label>

                <select
                  name="frequency"
                  value={filters.frequency}
                  onChange={handleChange}
                >
                  <option value="">All</option>

                  <option value="DAILY">DAILY</option>

                  <option value="WEEKLY">WEEKLY</option>

                  <option value="MONTHLY">MONTHLY</option>

                  <option value="YEARLY">YEARLY</option>
                </select>
              </div>

              {/* MONTH */}

              <div className="form-group">
                <label>Month</label>

                <select
                  name="month"
                  value={filters.month}
                  onChange={handleChange}
                >
                  <option value="">All</option>

                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              {/* YEAR */}

              <div className="form-group">
                <label>Year</label>

                <input
                  type="number"
                  name="year"
                  value={filters.year}
                  onChange={handleChange}
                />
              </div>

              {/* STATUS */}

              <div className="form-group">
                <label>Status</label>

                <select
                  name="status"
                  value={filters.status}
                  onChange={handleChange}
                >
                  <option value="">All</option>

                  <option value="PENDING">PENDING</option>

                  <option value="COMPLETED">COMPLETED</option>

                  <option value="FAILED">FAILED</option>

                  <option value="REVERSED">REVERSED</option>
                </select>
              </div>
            </div>
          </div>

          {/* ====================================================== */}
          {/* TABLE */}
          {/* ====================================================== */}

          <div className="table-card">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>

                  <th>Leave Type</th>

                  <th>Policy</th>

                  <th>Frequency</th>

                  <th>Amount</th>

                  <th>Status</th>

                  <th>Increment Date</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7}>Loading...</td>
                  </tr>
                ) : logs.length ? (
                  logs.map((item: any) => (
                    <tr key={item.id}>
                      <td>
                        <div className="employee-box">
                          <strong>{item?.employee?.name}</strong>

                          <span>{item?.employee?.employeeCode}</span>
                        </div>
                      </td>

                      <td>{item?.leaveType?.name}</td>

                      <td>{item?.leaveIncrementPolicy?.title}</td>

                      <td>
                        <span className="badge">{item.frequency}</span>
                      </td>

                      <td>+{item.amount}</td>

                      <td>
                        <span className={item.status?.toLowerCase()}>
                          {item.status}
                        </span>
                      </td>

                      <td>
                        {new Date(item.incrementDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7}>No logs found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ====================================================== */}
          {/* PAGINATION */}
          {/* ====================================================== */}

          <div className="pagination">
            <button
              disabled={pagination.page <= 1}
              onClick={() => changePage(pagination.page - 1)}
            >
              Prev
            </button>

            <span>
              Page {pagination.page || 1} of {pagination.totalPages || 1}
            </span>

            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => changePage(pagination.page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ====================================================== */}
      {/* CSS */}
      {/* ====================================================== */}

      <style jsx>{`
        .logs-page {
          padding: 24px;
        }

        .top-header {
          margin-bottom: 24px;
        }

        .top-header h1 {
          font-size: 32px;
          font-weight: 800;
          margin-bottom: 8px;
          color: #111827;
        }

        .top-header p {
          color: #6b7280;
        }

        .filter-card {
          background: white;
          padding: 24px;
          border-radius: 24px;
          margin-bottom: 24px;
          border: 1px solid #e5e7eb;
        }

        .filter-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 18px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-size: 14px;
          font-weight: 700;
        }

        .form-group select,
        .form-group input {
          width: 100%;
          height: 48px;
          border: 1px solid #d1d5db;
          border-radius: 12px;
          padding: 0 14px;
          outline: none;
        }

        .table-card {
          background: white;
          border-radius: 24px;
          overflow: auto;
          border: 1px solid #e5e7eb;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th {
          background: #f9fafb;
          padding: 18px;
          text-align: left;
          font-size: 14px;
        }

        td {
          padding: 18px;
          border-top: 1px solid #f3f4f6;
        }

        .employee-box {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .employee-box span {
          font-size: 12px;
          color: #6b7280;
        }

        .badge {
          background: #eef2ff;
          color: #4338ca;
          padding: 6px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
        }

        .completed {
          color: #15803d;
          font-weight: 700;
        }

        .pending {
          color: #ca8a04;
          font-weight: 700;
        }

        .failed {
          color: #dc2626;
          font-weight: 700;
        }

        .reversed {
          color: #7c3aed;
          font-weight: 700;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 16px;
          margin-top: 24px;
        }

        .pagination button {
          height: 42px;
          padding: 0 18px;
          border: none;
          border-radius: 12px;
          background: #111827;
          color: white;
          cursor: pointer;
        }

        .pagination button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .logs-page {
            padding: 16px;
          }

          .top-header h1 {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default LeaveIncrementLogsPage;
