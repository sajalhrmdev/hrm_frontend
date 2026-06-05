"use client";

import React, { useEffect, useMemo, useState } from "react";

import axiosInstance from "@/utils/axiosInstance";

// ======================================================

const AttendanceAdjustmentHistoryPage = () => {
  // ======================================================

  const [loading, setLoading] = useState(false);

  const [adjustments, setAdjustments] = useState<any[]>([]);

  const [search, setSearch] = useState("");

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  // ======================================================
  // FETCH
  // ======================================================

  const fetchAdjustments = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get(
        `/attendance/adjustments/day?date=${selectedDate}`,
      );

      setAdjustments(res?.data?.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // ======================================================

  useEffect(() => {
    fetchAdjustments();
  }, [selectedDate]);

  // ======================================================
  // FILTER
  // ======================================================

  const filteredData = useMemo(() => {
    return adjustments.filter((item: any) => {
      const name = item?.employee?.name?.toLowerCase() || "";

      const code = item?.employee?.employeeCode?.toLowerCase() || "";

      return (
        name.includes(search.toLowerCase()) ||
        code.includes(search.toLowerCase())
      );
    });
  }, [adjustments, search]);

  // ======================================================
  // FORMAT
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

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="adjustment-page">
          {/* ====================================================== */}
          {/* HEADER */}
          {/* ====================================================== */}

          <div className="top-header">
            <div>
              <h1>Attendance Adjustment History</h1>

              <p>Daily attendance regularization & audit timeline</p>
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
          {/* BODY */}
          {/* ====================================================== */}

          {loading ? (
            <div className="empty-card">Loading...</div>
          ) : filteredData.length ? (
            <div className="timeline">
              {filteredData.map((item: any) => {
                const meta = item?.metadata || {};

                return (
                  <div className="timeline-card" key={item.id}>
                    {/* ====================================================== */}
                    {/* TOP */}
                    {/* ====================================================== */}

                    <div className="timeline-top">
                      <div className="employee-info">
                        <div className="avatar">
                          {item?.employee?.name?.[0]}
                        </div>

                        <div>
                          <h4>{item?.employee?.name}</h4>

                          <p>{item?.employee?.employeeCode}</p>
                        </div>
                      </div>

                      <div className="action-type">{item?.actionType}</div>
                    </div>

                    {/* ====================================================== */}
                    {/* STATUS */}
                    {/* ====================================================== */}

                    <div className="status-row">
                      <span className="status old">{item?.oldStatus}</span>

                      <span className="arrow">→</span>

                      <span className="status new">{item?.newStatus}</span>
                    </div>

                    {/* ====================================================== */}
                    {/* REASON */}
                    {/* ====================================================== */}

                    {item?.reason && (
                      <div className="section">
                        <label>Reason</label>

                        <p>{item.reason}</p>
                      </div>
                    )}

                    {/* ====================================================== */}
                    {/* REMARKS */}
                    {/* ====================================================== */}

                    {item?.remarks && (
                      <div className="section">
                        <label>Remarks</label>

                        <p>{item.remarks}</p>
                      </div>
                    )}

                    {/* ====================================================== */}
                    {/* GRACE */}
                    {/* ====================================================== */}

                    {(item?.lateGraceMinutes > 0 ||
                      item?.workGraceMinutes > 0) && (
                      <div className="grace-grid">
                        {item?.lateGraceMinutes > 0 && (
                          <div className="grace-card">
                            <span>⏰ Late Grace</span>

                            <strong>{item.lateGraceMinutes} mins</strong>
                          </div>
                        )}

                        {item?.workGraceMinutes > 0 && (
                          <div className="grace-card">
                            <span>🛠 Work Grace</span>

                            <strong>{item.workGraceMinutes} mins</strong>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ====================================================== */}
                    {/* META */}
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

                    <div className="footer">
                      <div>
                        👤 {item?.attendanceAdjustedBy?.name || "Admin"}
                      </div>

                      <div>🕒 {formatDateTime(item.createdAt)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-card">No adjustment history found</div>
          )}

          {/* ====================================================== */}
          {/* STYLE */}
          {/* ====================================================== */}

          <style jsx>{`
            .adjustment-page {
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

            .timeline {
              display: flex;

              flex-direction: column;

              gap: 18px;
            }

            .timeline-card {
              background: white;

              border-radius: 28px;

              padding: 24px;

              border: 1px solid #e5e7eb;

              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);

              transition: 0.3s ease;
            }

            .timeline-card:hover {
              transform: translateY(-2px);

              box-shadow: 0 14px 35px rgba(0, 0, 0, 0.08);
            }

            .timeline-top {
              display: flex;

              justify-content: space-between;

              align-items: center;

              gap: 20px;

              margin-bottom: 20px;
            }

            .employee-info {
              display: flex;

              align-items: center;

              gap: 14px;
            }

            .avatar {
              width: 52px;

              height: 52px;

              border-radius: 50%;

              background: #111827;

              color: white;

              display: flex;

              align-items: center;

              justify-content: center;

              font-weight: 700;

              font-size: 18px;
            }

            .employee-info h4 {
              margin: 0;

              font-size: 16px;

              color: #111827;
            }

            .employee-info p {
              margin: 0;

              color: #6b7280;

              font-size: 13px;
            }

            .action-type {
              background: #111827;

              color: white;

              padding: 8px 14px;

              border-radius: 999px;

              font-size: 11px;

              font-weight: 700;
            }

            .status-row {
              display: flex;

              align-items: center;

              gap: 12px;

              margin-bottom: 18px;

              flex-wrap: wrap;
            }

            .status {
              padding: 8px 14px;

              border-radius: 999px;

              font-size: 12px;

              font-weight: 800;
            }

            .status.old {
              background: #fee2e2;

              color: #991b1b;
            }

            .status.new {
              background: #dcfce7;

              color: #166534;
            }

            .arrow {
              font-size: 18px;

              font-weight: 700;

              color: #6b7280;
            }

            .section {
              margin-top: 18px;
            }

            .section label {
              display: block;

              margin-bottom: 6px;

              font-size: 12px;

              font-weight: 700;

              color: #6b7280;

              text-transform: uppercase;
            }

            .section p {
              color: #111827;

              line-height: 1.7;
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
            }

            .grace-card span {
              display: block;

              color: #6b7280;

              margin-bottom: 8px;
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
              border: 1px solid #e5e7eb;

              border-radius: 18px;

              padding: 18px;
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
            }

            .footer {
              margin-top: 24px;

              padding-top: 16px;

              border-top: 1px dashed #d1d5db;

              display: flex;

              justify-content: space-between;

              align-items: center;

              gap: 12px;

              font-size: 13px;

              color: #6b7280;
            }

            .empty-card {
              background: white;

              border-radius: 24px;

              padding: 60px;

              text-align: center;

              color: #6b7280;

              border: 1px solid #e5e7eb;
            }

            @media (max-width: 768px) {
              .adjustment-page {
                padding: 16px;
              }

              .filter-card {
                flex-direction: column;
              }

              .timeline-top {
                flex-direction: column;

                align-items: flex-start;
              }

              .grace-grid,
              .meta-grid {
                grid-template-columns: 1fr;
              }

              .meta-values {
                flex-direction: column;

                align-items: flex-start;
              }

              .footer {
                flex-direction: column;

                align-items: flex-start;
              }

              .top-header h1 {
                font-size: 24px;
              }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
};

export default AttendanceAdjustmentHistoryPage;
