"use client";

import React, { useEffect, useMemo, useState } from "react";

import axiosInstance from "@/utils/axiosInstance";
import { SkeletonTable } from "@/core/common/Skeleton";

// ======================================================

const statusOptions = [
  "PRESENT",
  "HALF_DAY",
  "ABSENT",
  // "PAID_LEAVE",
  // "UNPAID_LEAVE",
  "HOLIDAY",
  "WEEKLY_OFF",
];

// ======================================================

const AttendanceRegularizationPage = () => {
  // ======================================================

  const [loading, setLoading] = useState(false);

  const [logLoading, setLogLoading] = useState(false);

  const [attendances, setAttendances] = useState<any[]>([]);

  const [adjustmentLogs, setAdjustmentLogs] = useState<any[]>([]);

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const [search, setSearch] = useState("");

  const [selectedAttendance, setSelectedAttendance] = useState<any>(null);

  const [showModal, setShowModal] = useState(false);

  const [showLogModal, setShowLogModal] = useState(false);

  const [formData, setFormData] = useState({
    check_in_time: "",

    check_out_time: "",

    status: "",

    reason: "",

    remarks: "",

    lateGraceMinutes: 0,

    workGraceMinutes: 0,
  });

  // ======================================================
  // LOCAL DATETIME FORMAT
  // ======================================================

  const formatLocalDateTime = (dateString: string) => {
    if (!dateString) return "";

    const date = new Date(dateString);

    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, "0");

    const day = String(date.getDate()).padStart(2, "0");

    const hours = String(date.getHours()).padStart(2, "0");

    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // ======================================================
  // FORMAT TIME
  // ======================================================

  const formatTime = (value: string) => {
    if (!value) return "--";

    return new Date(value).toLocaleTimeString("en-IN", {
      hour: "2-digit",

      minute: "2-digit",
    });
  };

  // ======================================================
  // FORMAT DATE TIME
  // ======================================================

  const formatDateTime = (value: string) => {
    if (!value) return "--";

    return new Date(value).toLocaleString("en-IN", {
      day: "2-digit",

      month: "short",

      year: "numeric",

      hour: "2-digit",

      minute: "2-digit",
    });
  };

  // ======================================================
  // FETCH ATTENDANCE
  // ======================================================

  const fetchAttendances = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get(
        `/attendance/company-day?date=${selectedDate}`,
      );

      setAttendances(res?.data?.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // ======================================================

  useEffect(() => {
    fetchAttendances();
  }, [selectedDate]);

  // ======================================================
  // FILTER
  // ======================================================

  const filteredData = useMemo(() => {
    return attendances.filter((item: any) => {
      const name = item?.employee?.name?.toLowerCase() || "";

      const code = item?.employee?.employeeCode?.toLowerCase() || "";

      return (
        name.includes(search.toLowerCase()) ||
        code.includes(search.toLowerCase())
      );
    });
  }, [attendances, search]);

  // ======================================================
  // OPEN EDIT MODAL
  // ======================================================

  const handleOpenModal = (attendance: any) => {
    setSelectedAttendance(attendance);

    setFormData({
      check_in_time: attendance?.check_in_time
        ? formatLocalDateTime(attendance.check_in_time)
        : "",

      check_out_time: attendance?.check_out_time
        ? formatLocalDateTime(attendance.check_out_time)
        : "",

      status: attendance?.status || "",

      reason: "",

      remarks: "",

      lateGraceMinutes: 0,

      workGraceMinutes: 0,
    });

    setShowModal(true);
  };

  // ======================================================
  // OPEN LOG MODAL
  // ======================================================

  const handleOpenLogs = async (attendance: any) => {
    try {
      setLogLoading(true);

      setShowLogModal(true);

      const res = await axiosInstance.get(
        `/attendance/${attendance.id}/adjustments`,
      );

      setAdjustmentLogs(res?.data?.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLogLoading(false);
    }
  };

  // ======================================================
  // SUBMIT
  // ======================================================

  const handleSubmit = async () => {
    try {
      if (!selectedAttendance) return;

      await axiosInstance.patch(
        `/attendance/${selectedAttendance.id}/regularize`,

        formData,
      );

      alert("Attendance regularized successfully");

      setShowModal(false);

      fetchAttendances();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to regularize attendance");
    }
  };

  // ======================================================

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="attendance-page">
          {/* ====================================================== */}
          {/* HEADER */}
          {/* ====================================================== */}

          <div className="top-header">
            <div>
              <h1>Attendance Regularization</h1>

              <p>
                Manage attendance corrections, manual updates & adjustment logs
              </p>
            </div>
          </div>

          {/* ====================================================== */}
          {/* FILTER */}
          {/* ====================================================== */}

          <div className="filter-card">
            <input
              type="text"
              placeholder="Search employee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          {/* ====================================================== */}
          {/* TABLE */}
          {/* ====================================================== */}

          <div className="table-card">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>

                  <th>Check In</th>

                  <th>Check Out</th>

                  <th>Status</th>

                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5}>
                      <SkeletonTable rows={5} columns={5} />
                    </td>
                  </tr>
                ) : filteredData.length ? (
                  filteredData.map((item: any) => (
                    <tr key={item.id}>
                      <td>
                        <div className="employee-box">
                          <div className="avatar">
                            {item?.employee?.name?.[0]}
                          </div>

                          <div>
                            <h4>{item?.employee?.name}</h4>

                            <p>{item?.employee?.employeeCode}</p>
                          </div>
                        </div>
                      </td>

                      <td>{formatTime(item.check_in_time)}</td>

                      <td>{formatTime(item.check_out_time)}</td>

                      <td>
                        <span className={`badge ${item.status}`}>
                          {item.status?.replaceAll("_", " ")}
                        </span>
                      </td>

                      <td>
                        <div className="action-group">
                          <button
                            className="edit-btn"
                            onClick={() => handleOpenModal(item)}
                          >
                            ✏️ Regularize
                          </button>

                          <button
                            className="log-btn"
                            onClick={() => handleOpenLogs(item)}
                          >
                            📜 Logs
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="empty">
                      No attendance found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ====================================================== */}
          {/* EDIT MODAL */}
          {/* ====================================================== */}

          {showModal && (
            <div className="modal-overlay">
              <div className="modal-box">
                <div className="modal-header">
                  <h2>Regularize Attendance</h2>

                  <button onClick={() => setShowModal(false)}>✖</button>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Check In</label>

                    <input
                      type="datetime-local"
                      value={formData.check_in_time}
                      onChange={(e) =>
                        setFormData({
                          ...formData,

                          check_in_time: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Check Out</label>

                    <input
                      type="datetime-local"
                      value={formData.check_out_time}
                      onChange={(e) =>
                        setFormData({
                          ...formData,

                          check_out_time: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Status</label>

                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,

                          status: e.target.value,
                        })
                      }
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Late Grace Minutes</label>

                    <input
                      type="number"
                      value={formData.lateGraceMinutes}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          lateGraceMinutes: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Work Grace Minutes</label>

                    <input
                      type="number"
                      value={formData.workGraceMinutes}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          workGraceMinutes: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="form-group full">
                    <label>Remarks</label>

                    <textarea
                      rows={3}
                      placeholder="Internal HR remarks..."
                      value={formData.remarks}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          remarks: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-group full">
                    <label>Reason</label>

                    <textarea
                      rows={4}
                      placeholder="Enter reason..."
                      value={formData.reason}
                      onChange={(e) =>
                        setFormData({
                          ...formData,

                          reason: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    className="cancel-btn"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>

                  <button className="save-btn" onClick={handleSubmit}>
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ====================================================== */}
          {/* LOG MODAL */}
          {/* ====================================================== */}

          {/* {showLogModal && (
            <div className="modal-overlay">
              <div className="log-modal">
                <div className="modal-header">
                  <h2>Adjustment History</h2>

                  <button onClick={() => setShowLogModal(false)}>✖</button>
                </div>

                {logLoading ? (
                  <div className="empty">Loading Logs...</div>
                ) : adjustmentLogs.length ? (
                  <div className="timeline">
                    {adjustmentLogs.map((log: any) => (
                      <div className="timeline-card" key={log.id}>
                        <div className="timeline-top">
                          <span className="old-status">{log.oldStatus}</span>

                          <span className="arrow">→</span>

                          <span className="new-status">{log.newStatus}</span>
                        </div>

                        <p className="reason">
                          {log.reason || "No reason provided"}
                        </p>

                        <div className="timeline-footer">
                          <span>👤 {log?.adjustedUser?.name || "Admin"}</span>

                          <span>🕒 {formatDateTime(log.createdAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty">No adjustment logs found</div>
                )}
              </div>
            </div>
          )} */}
          {showLogModal && (
            <div className="modal-overlay">
              <div className="log-modal premium-log-modal">
                {/* ====================================================== */}
                {/* HEADER */}
                {/* ====================================================== */}

                <div className="modal-header">
                  <div>
                    <h2>Adjustment History</h2>

                    <p>All HR attendance modifications & audit timeline</p>
                  </div>

                  <button onClick={() => setShowLogModal(false)}>✖</button>
                </div>

                {/* ====================================================== */}
                {/* BODY */}
                {/* ====================================================== */}

                {logLoading ? (
                  <div className="empty">Loading Adjustment Logs...</div>
                ) : adjustmentLogs.length ? (
                  <div className="timeline">
                    {adjustmentLogs.map((log: any) => {
                      const meta = log?.metadata || {};

                      return (
                        <div
                          className="timeline-card premium-card"
                          key={log.id}
                        >
                          {/* ====================================================== */}
                          {/* TOP */}
                          {/* ====================================================== */}

                          <div className="timeline-top">
                            <div className="status-group">
                              <span
                                className={`status-badge old ${log.oldStatus}`}
                              >
                                {log.oldStatus || "N/A"}
                              </span>

                              <span className="arrow">→</span>

                              <span
                                className={`status-badge new ${log.newStatus}`}
                              >
                                {log.newStatus || "N/A"}
                              </span>
                            </div>

                            <span className="action-type">
                              {log.actionType}
                            </span>
                          </div>

                          {/* ====================================================== */}
                          {/* REASON */}
                          {/* ====================================================== */}

                          {log.reason && (
                            <div className="log-section">
                              <label>Reason</label>

                              <p>{log.reason}</p>
                            </div>
                          )}

                          {/* ====================================================== */}
                          {/* REMARKS */}
                          {/* ====================================================== */}

                          {log.remarks && (
                            <div className="log-section">
                              <label>Remarks</label>

                              <p>{log.remarks}</p>
                            </div>
                          )}

                          {/* ====================================================== */}
                          {/* GRACE */}
                          {/* ====================================================== */}

                          {(log.lateGraceMinutes > 0 ||
                            log.workGraceMinutes > 0) && (
                            <div className="grace-grid">
                              {log.lateGraceMinutes > 0 && (
                                <div className="grace-card">
                                  <span>⏰ Late Grace</span>

                                  <strong>{log.lateGraceMinutes} mins</strong>
                                </div>
                              )}

                              {log.workGraceMinutes > 0 && (
                                <div className="grace-card">
                                  <span>🛠 Work Grace</span>

                                  <strong>{log.workGraceMinutes} mins</strong>
                                </div>
                              )}
                            </div>
                          )}

                          {/* ====================================================== */}
                          {/* TIME CHANGES */}
                          {/* ====================================================== */}

                          {(meta.oldCheckIn || meta.newCheckIn) && (
                            <div className="meta-grid">
                              <div className="meta-box">
                                <label>Check In</label>

                                <div className="meta-values">
                                  <span>
                                    {meta.oldCheckIn
                                      ? formatDateTime(meta.oldCheckIn)
                                      : "--"}
                                  </span>

                                  <span>→</span>

                                  <span>
                                    {meta.newCheckIn
                                      ? formatDateTime(meta.newCheckIn)
                                      : "--"}
                                  </span>
                                </div>
                              </div>

                              <div className="meta-box">
                                <label>Check Out</label>

                                <div className="meta-values">
                                  <span>
                                    {meta.oldCheckOut
                                      ? formatDateTime(meta.oldCheckOut)
                                      : "--"}
                                  </span>

                                  <span>→</span>

                                  <span>
                                    {meta.newCheckOut
                                      ? formatDateTime(meta.newCheckOut)
                                      : "--"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* ====================================================== */}
                          {/* FOOTER */}
                          {/* ====================================================== */}

                          <div className="timeline-footer premium-footer">
                            <div>
                              👤 {log?.attendanceAdjustedBy?.name || "Admin"}
                            </div>

                            <div>🕒 {formatDateTime(log.createdAt)}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="empty">No adjustment logs found</div>
                )}
              </div>
            </div>
          )}

          {/* ====================================================== */}
          {/* STYLE */}
          {/* ====================================================== */}

          <style jsx>{`
            .attendance-page {
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

            .filter-card {
              display: flex;

              gap: 16px;

              margin-bottom: 24px;
            }

            .filter-card input {
              height: 52px;

              border-radius: 14px;

              border: 1px solid #d1d5db;

              padding: 0 16px;

              background: white;

              outline: none;

              flex: 1;
            }

            .table-card {
              background: white;

              border-radius: 24px;

              overflow-x: auto;

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
              width: 45px;

              height: 45px;

              border-radius: 50%;

              background: #111827;

              color: white;

              display: flex;

              align-items: center;

              justify-content: center;

              font-weight: 700;
            }

            .employee-box h4 {
              margin: 0;

              font-size: 14px;
            }

            .employee-box p {
              margin: 0;

              color: #6b7280;

              font-size: 12px;
            }

            .badge {
              padding: 8px 14px;

              border-radius: 999px;

              font-size: 12px;

              font-weight: 700;
            }

            .badge.PRESENT {
              background: #dcfce7;

              color: #166534;
            }

            .badge.ABSENT {
              background: #fee2e2;

              color: #991b1b;
            }

            .badge.HALF_DAY {
              background: #fef3c7;

              color: #92400e;
            }

            .badge.PAID_LEAVE {
              background: #dbeafe;

              color: #1d4ed8;
            }

            .badge.UNPAID_LEAVE {
              background: #ede9fe;

              color: #6d28d9;
            }

            .badge.HOLIDAY {
              background: #cffafe;

              color: #155e75;
            }

            .badge.WEEKLY_OFF {
              background: #e5e7eb;

              color: #111827;
            }

            .action-group {
              display: flex;

              gap: 10px;
            }

            .edit-btn,
            .log-btn {
              border: none;

              height: 40px;

              padding: 0 16px;

              border-radius: 10px;

              font-weight: 700;

              cursor: pointer;

              transition: 0.2s ease;
            }

            .edit-btn:hover,
            .log-btn:hover {
              transform: translateY(-1px);
            }

            .edit-btn {
              background: #111827;

              color: white;
            }

            .log-btn {
              background: #f3f4f6;

              color: #111827;
            }

            .modal-overlay {
              position: fixed;

              inset: 0;

              background: rgba(0, 0, 0, 0.5);

              display: flex;

              justify-content: center;

              align-items: center;

              z-index: 9999;

              padding: 20px;
            }

            .modal-box,
            .log-modal {
              width: 100%;

              max-width: 720px;

              background: white;

              border-radius: 24px;

              padding: 28px;

              max-height: 90vh;

              overflow-y: auto;
            }

            .modal-header {
              display: flex;

              justify-content: space-between;

              align-items: center;

              margin-bottom: 24px;
            }

            .modal-header h2 {
              font-size: 24px;

              font-weight: 800;

              color: #111827;
            }

            .modal-header p {
              color: #6b7280;

              margin-top: 4px;

              font-size: 14px;
            }

            .modal-header button {
              border: none;

              background: transparent;

              font-size: 22px;

              cursor: pointer;
            }

            .form-grid {
              display: grid;

              grid-template-columns: repeat(2, 1fr);

              gap: 18px;
            }

            .form-group {
              display: flex;

              flex-direction: column;

              gap: 10px;
            }

            .form-group.full {
              grid-column: span 2;
            }

            .form-group label {
              font-size: 13px;

              font-weight: 700;

              color: #374151;
            }

            .form-group input,
            .form-group select,
            .form-group textarea {
              border: 1px solid #d1d5db;

              border-radius: 14px;

              padding: 14px;

              outline: none;

              font-size: 14px;

              transition: 0.2s ease;
            }

            .form-group input:focus,
            .form-group select:focus,
            .form-group textarea:focus {
              border-color: #111827;

              box-shadow: 0 0 0 3px rgba(17, 24, 39, 0.08);
            }

            .modal-footer {
              display: flex;

              justify-content: flex-end;

              gap: 14px;

              margin-top: 24px;
            }

            .cancel-btn,
            .save-btn {
              height: 48px;

              border-radius: 12px;

              padding: 0 18px;

              font-weight: 700;

              cursor: pointer;
            }

            .cancel-btn {
              background: white;

              border: 1px solid #d1d5db;
            }

            .save-btn {
              border: none;

              background: #111827;

              color: white;
            }

            .timeline {
              display: flex;

              flex-direction: column;

              gap: 18px;

              max-height: 600px;

              overflow-y: auto;

              padding-right: 6px;
            }

            .timeline-card {
              border: 1px solid #e5e7eb;

              border-radius: 18px;

              padding: 18px;
            }

            .empty {
              padding: 40px;

              text-align: center;

              color: #6b7280;
            }

            /* ====================================================== */
            /* PREMIUM LOG MODAL */
            /* ====================================================== */

            .premium-log-modal {
              max-width: 950px;
            }

            .premium-card {
              border-radius: 24px;

              border: 1px solid #e5e7eb;

              background: linear-gradient(to bottom right, #ffffff, #f9fafb);

              padding: 22px;

              transition: 0.3s ease;
            }

            .premium-card:hover {
              transform: translateY(-2px);

              box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
            }

            .timeline-top {
              display: flex;

              align-items: center;

              justify-content: space-between;

              gap: 14px;

              margin-bottom: 18px;
            }

            .status-group {
              display: flex;

              align-items: center;

              gap: 12px;

              flex-wrap: wrap;
            }

            .status-badge {
              padding: 8px 14px;

              border-radius: 999px;

              font-size: 12px;

              font-weight: 800;
            }

            .status-badge.old {
              background: #fee2e2;

              color: #991b1b;
            }

            .status-badge.new {
              background: #dcfce7;

              color: #166534;
            }

            .arrow {
              font-size: 18px;

              color: #6b7280;

              font-weight: 700;
            }

            .action-type {
              background: #111827;

              color: white;

              padding: 8px 14px;

              border-radius: 999px;

              font-size: 11px;

              font-weight: 700;

              letter-spacing: 0.5px;
            }

            .log-section {
              margin-top: 18px;
            }

            .log-section label {
              display: block;

              margin-bottom: 6px;

              font-size: 12px;

              font-weight: 700;

              color: #6b7280;

              text-transform: uppercase;
            }

            .log-section p {
              color: #111827;

              line-height: 1.7;

              font-size: 14px;
            }

            .grace-grid {
              display: grid;

              grid-template-columns: repeat(2, 1fr);

              gap: 14px;

              margin-top: 20px;
            }

            .grace-card {
              background: #f9fafb;

              border: 1px solid #e5e7eb;

              border-radius: 18px;

              padding: 18px;

              display: flex;

              flex-direction: column;

              gap: 8px;
            }

            .grace-card span {
              color: #6b7280;

              font-size: 13px;
            }

            .grace-card strong {
              font-size: 22px;

              color: #111827;
            }

            .meta-grid {
              display: grid;

              grid-template-columns: repeat(2, 1fr);

              gap: 16px;

              margin-top: 20px;
            }

            .meta-box {
              background: white;

              border: 1px solid #e5e7eb;

              border-radius: 18px;

              padding: 16px;
            }

            .meta-box label {
              display: block;

              margin-bottom: 10px;

              font-size: 12px;

              font-weight: 700;

              color: #6b7280;

              text-transform: uppercase;
            }

            .meta-values {
              display: flex;

              align-items: center;

              gap: 10px;

              flex-wrap: wrap;

              font-size: 13px;

              color: #111827;

              line-height: 1.6;
            }

            .premium-footer {
              margin-top: 24px;

              padding-top: 16px;

              border-top: 1px dashed #d1d5db;

              display: flex;

              justify-content: space-between;

              align-items: center;

              gap: 10px;

              font-size: 13px;

              color: #6b7280;
            }

            /* ====================================================== */
            /* RESPONSIVE */
            /* ====================================================== */

            @media (max-width: 768px) {
              .attendance-page {
                padding: 16px;
              }

              .filter-card {
                flex-direction: column;
              }

              .form-grid {
                grid-template-columns: 1fr;
              }

              .form-group.full {
                grid-column: span 1;
              }

              .action-group {
                flex-direction: column;
              }

              .timeline-footer,
              .premium-footer {
                flex-direction: column;

                align-items: flex-start;

                gap: 6px;
              }

              .grace-grid,
              .meta-grid {
                grid-template-columns: 1fr;
              }

              .timeline-top {
                flex-direction: column;

                align-items: flex-start;
              }

              .meta-values {
                flex-direction: column;

                align-items: flex-start;
              }

              .modal-box,
              .log-modal {
                padding: 20px;
              }

              .top-header h1 {
                font-size: 24px;
              }

              th,
              td {
                padding: 14px;
              }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
};

export default AttendanceRegularizationPage;
