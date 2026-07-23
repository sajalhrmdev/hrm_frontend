"use client";

import { useState, useEffect } from "react";
import axiosFieldTrack from "@/utils/axiosFieldTrack";
import { SkeletonTable } from "@/core/common/Skeleton";

interface FieldEmployee {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string | null;
  departmentName: string | null;
  designationName: string | null;
  isOnline: boolean;
  lastLocationAt: string | null;
}

export default function FieldEmployee() {
  const [employees, setEmployees] = useState<FieldEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [search, setSearch] = useState("");

  const fetchEmployees = async () => {
    try {
      const res = await axiosFieldTrack.get("/employees");
      setEmployees(res.data.data || []);
    } catch {
      console.error("Failed to fetch field employees");
    } finally {
      setLoading(false);
    }
  };

  const syncEmployees = async () => {
    setSyncing(true);
    try {
      await axiosFieldTrack.post("/employees/sync");
      await fetchEmployees();
    } catch {
      console.error("Failed to sync employees");
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const filtered = employees.filter(
    (e) =>
      e.name?.toLowerCase().includes(search.toLowerCase()) ||
      e.employeeId?.toLowerCase().includes(search.toLowerCase()) ||
      e.email?.toLowerCase().includes(search.toLowerCase()) ||
      e.departmentName?.toLowerCase().includes(search.toLowerCase())
  );

  const onlineCount = employees.filter((e) => e.isOnline).length;
  const offlineCount = employees.length - onlineCount;

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="ft-page">
          <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
            <div className="my-auto mb-2">
              <h2 className="mb-1">Field Employees</h2>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <i className="ti ti-smart-home" />
                  </li>
                  <li className="breadcrumb-item">Field Track</li>
                  <li className="breadcrumb-item active">Employees</li>
                </ol>
              </nav>
            </div>
            <div className="d-flex my-xl-auto right-content align-items-center flex-wrap">
              <button
                className="btn btn-primary d-flex align-items-center"
                onClick={syncEmployees}
                disabled={syncing}
              >
                <i className="ti ti-refresh me-2" />
                {syncing ? "Syncing..." : "Sync from HRM"}
              </button>
            </div>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <div className="ft-stat-card">
                <div className="d-flex align-items-center gap-3">
                  <span className="ft-stat-icon blue">
                    <i className="ti ti-users" />
                  </span>
                  <div>
                    <p className="ft-stat-label">Total Employees</p>
                    <h3 className="ft-stat-value">{employees.length}</h3>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="ft-stat-card">
                <div className="d-flex align-items-center gap-3">
                  <span className="ft-stat-icon green">
                    <i className="ti ti-user-check" />
                  </span>
                  <div>
                    <p className="ft-stat-label">Online Now</p>
                    <h3 className="ft-stat-value">{onlineCount}</h3>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="ft-stat-card">
                <div className="d-flex align-items-center gap-3">
                  <span className="ft-stat-icon gray">
                    <i className="ti ti-user-off" />
                  </span>
                  <div>
                    <p className="ft-stat-label">Offline</p>
                    <h3 className="ft-stat-value">{offlineCount}</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <SkeletonTable rows={5} columns={5} />
          ) : (
            <div className="ft-card">
              <div className="ft-card-header">
                <h5>Employee List</h5>
                <div className="ft-search-box">
                  <i className="ti ti-search" />
                  <input
                    type="text"
                    placeholder="Search employees..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="ft-table-wrap">
                <table className="ft-table">
                  <thead>
                    <tr>
                      <th>Employee ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Department</th>
                      <th>Designation</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-5 text-muted">
                          {employees.length === 0
                            ? "No employees found. Click 'Sync from HRM' to load data."
                            : "No employees match your search."}
                        </td>
                      </tr>
                    ) : (
                      filtered.map((emp) => (
                        <tr key={emp.id}>
                          <td>
                            <span className="ft-empid">{emp.employeeId}</span>
                          </td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <span className="ft-avatar">
                                {emp.name?.charAt(0)?.toUpperCase() || "?"}
                              </span>
                              <span className="fw-semibold">{emp.name}</span>
                            </div>
                          </td>
                          <td className="text-muted">{emp.email}</td>
                          <td className="text-muted">{emp.phone || "-"}</td>
                          <td>{emp.departmentName || "-"}</td>
                          <td>{emp.designationName || "-"}</td>
                          <td>
                            <span
                              className={`ft-badge ${emp.isOnline ? "ft-badge-online" : "ft-badge-offline"}`}
                            >
                              <i
                                className={`ti ti-point-filled me-1 ${emp.isOnline ? "text-success" : "text-secondary"}`}
                              />
                              {emp.isOnline ? "Online" : "Offline"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
      <style jsx>{`
        .ft-card {
          background: #fff;
          border-radius: 20px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }
        .ft-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid #f3f4f6;
        }
        .ft-card-header h5 {
          margin: 0;
          font-weight: 700;
          color: #111827;
        }
        .ft-search-box {
          display: flex;
          align-items: center;
          gap: 8px;
          height: 44px;
          padding: 0 14px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          min-width: 260px;
        }
        .ft-search-box i {
          color: #9ca3af;
          font-size: 18px;
        }
        .ft-search-box input {
          border: none;
          background: transparent;
          outline: none;
          flex: 1;
          font-size: 14px;
          color: #111827;
        }
        .ft-table-wrap {
          overflow-x: auto;
        }
        .ft-table {
          width: 100%;
          border-collapse: collapse;
        }
        .ft-table thead {
          background: #f9fafb;
        }
        .ft-table th {
          padding: 16px 18px;
          font-size: 12px;
          font-weight: 800;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          white-space: nowrap;
          text-align: left;
        }
        .ft-table td {
          padding: 16px 18px;
          border-top: 1px solid #f3f4f6;
          vertical-align: middle;
          font-size: 14px;
          color: #111827;
        }
        .ft-table tbody tr:hover {
          background: #fafafa;
        }
        .ft-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #111827;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
          flex-shrink: 0;
        }
        .ft-empid {
          font-family: monospace;
          font-weight: 600;
          color: #2563eb;
        }
        .ft-badge {
          display: inline-flex;
          align-items: center;
          padding: 4px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
        }
        .ft-badge-online {
          background: #dcfce7;
          color: #15803d;
        }
        .ft-badge-offline {
          background: #f3f4f6;
          color: #6b7280;
        }
        .ft-stat-card {
          background: #fff;
          border-radius: 18px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
          padding: 22px;
          height: 100%;
        }
        .ft-stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          flex-shrink: 0;
        }
        .ft-stat-icon.blue {
          background: #eff6ff;
          color: #2563eb;
        }
        .ft-stat-icon.green {
          background: #f0fdf4;
          color: #16a34a;
        }
        .ft-stat-icon.gray {
          background: #f9fafb;
          color: #6b7280;
        }
        .ft-stat-label {
          margin: 0;
          font-size: 13px;
          color: #6b7280;
          font-weight: 500;
        }
        .ft-stat-value {
          margin: 2px 0 0;
          font-size: 28px;
          font-weight: 800;
          color: #111827;
          letter-spacing: -0.02em;
        }
      `}</style>
    </div>
  );
}
