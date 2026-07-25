"use client";

import React, { useEffect, useRef, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { SkeletonCard } from "@/core/common/Skeleton";

const LogsByAuthorizedPage = () => {
  const [loading, setLoading] = useState(false);
  const [adjustments, setAdjustments] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null);

  const [empSearch, setEmpSearch] = useState("");
  const [empResults, setEmpResults] = useState<any[]>([]);
  const [empLoading, setEmpLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (empSearch.length < 2) {
      setEmpResults([]);
      return;
    }

    setEmpLoading(true);

    debounceRef.current = setTimeout(() => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      axiosInstance
        .get(`/employee?search=${encodeURIComponent(empSearch)}&limit=5`, {
          signal: controller.signal,
        })
        .then((res) => {
          const emps = res.data.data?.employees || res.data.data || [];
          setEmpResults(emps);
        })
        .catch((err) => {
          if (err?.name !== "CanceledError" && err?.code !== "ERR_CANCELED") {
            console.log(err);
          }
        })
        .finally(() => setEmpLoading(false));
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [empSearch]);

  const fetchAdjustments = async (page = 1) => {
    if (!selectedAdmin) return;
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("userId", String(selectedAdmin.id));
      params.set("page", String(page));
      params.set("limit", "10");
      if (selectedDate) params.set("date", selectedDate);

      const res = await axiosInstance.get(
        `/attendance/adjustments/by-authorized?${params.toString()}`,
      );
      setAdjustments(res?.data?.data || []);
      setPagination(res?.data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 });
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedAdmin) fetchAdjustments(1);
  }, [selectedAdmin, selectedDate]);

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

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="adjustment-page">
          <div className="top-header">
            <div>
              <h1>Logs By Authorized Person</h1>
              <p>View regularization logs by the admin who authorized them</p>
            </div>
          </div>

          <div className="filter-card">
            <div className="emp-search-wrapper" ref={dropdownRef}>
              <input
                type="text"
                placeholder="Search authorized person..."
                value={selectedAdmin ? selectedAdmin.name : empSearch}
                onChange={(e) => {
                  setSelectedAdmin(null);
                  setEmpSearch(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => {
                  if (empResults.length) setShowDropdown(true);
                }}
              />
              {showDropdown && !selectedAdmin && (
                <div className="emp-dropdown">
                  {empLoading ? (
                    <div className="emp-dropdown-item empty">Searching...</div>
                  ) : empResults.length ? (
                    empResults.map((emp: any) => (
                      <div
                        key={emp.id}
                        className="emp-dropdown-item"
                        onClick={() => {
                          setSelectedAdmin(emp);
                          setEmpSearch("");
                          setShowDropdown(false);
                        }}
                      >
                        <strong>{emp.name}</strong>
                        <span>{emp.employeeCode || emp.email}</span>
                      </div>
                    ))
                  ) : empSearch.length >= 2 ? (
                    <div className="emp-dropdown-item empty">No employees found</div>
                  ) : null}
                </div>
              )}
            </div>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          {selectedAdmin && (
            <div className="admin-info">
              Showing logs for: <strong>{selectedAdmin.name}</strong>
              {selectedAdmin.employeeCode && (
                <span> ({selectedAdmin.employeeCode})</span>
              )}
            </div>
          )}

          {!selectedAdmin ? (
            <div className="empty-card">Select an authorized person to view their logs</div>
          ) : loading ? (
            <SkeletonCard />
          ) : adjustments.length ? (
            <>
              <div className="timeline">
                {adjustments.map((item: any) => {
                  const meta = item?.metadata || {};
                  return (
                    <div className="timeline-card" key={item.id}>
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

                      <div className="status-row">
                        <span className="status old">{item?.oldStatus}</span>
                        <span className="arrow">&rarr;</span>
                        <span className="status new">{item?.newStatus}</span>
                      </div>

                      {item?.reason && (
                        <div className="section">
                          <label>Reason</label>
                          <p>{item.reason}</p>
                        </div>
                      )}

                      {item?.remarks && (
                        <div className="section">
                          <label>Remarks</label>
                          <p>{item.remarks}</p>
                        </div>
                      )}

                      {(item?.lateGraceMinutes > 0 || item?.workGraceMinutes > 0) && (
                        <div className="grace-grid">
                          {item?.lateGraceMinutes > 0 && (
                            <div className="grace-card">
                              <span>Late Grace</span>
                              <strong>{item.lateGraceMinutes} mins</strong>
                            </div>
                          )}
                          {item?.workGraceMinutes > 0 && (
                            <div className="grace-card">
                              <span>Work Grace</span>
                              <strong>{item.workGraceMinutes} mins</strong>
                            </div>
                          )}
                        </div>
                      )}

                      {(meta.oldCheckIn || meta.newCheckIn) && (
                        <div className="meta-grid">
                          <div className="meta-box">
                            <label>Check In</label>
                            <div className="meta-values">
                              <span>{meta.oldCheckIn ? formatDateTime(meta.oldCheckIn) : "--"}</span>
                              <span>&rarr;</span>
                              <span>{meta.newCheckIn ? formatDateTime(meta.newCheckIn) : "--"}</span>
                            </div>
                          </div>
                          <div className="meta-box">
                            <label>Check Out</label>
                            <div className="meta-values">
                              <span>{meta.oldCheckOut ? formatDateTime(meta.oldCheckOut) : "--"}</span>
                              <span>&rarr;</span>
                              <span>{meta.newCheckOut ? formatDateTime(meta.newCheckOut) : "--"}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="footer">
                        <div>Authorized by: {item?.attendanceAdjustedBy?.name || "Admin"}</div>
                        <div>{formatDateTime(item.createdAt)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {pagination.totalPages > 1 && (
                <div className="pagination">
                  <button
                    disabled={pagination.page <= 1}
                    onClick={() => fetchAdjustments(pagination.page - 1)}
                  >
                    &lt; Prev
                  </button>
                  <span>
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => fetchAdjustments(pagination.page + 1)}
                  >
                    Next &gt;
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="empty-card">No adjustment logs found</div>
          )}

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

            .filter-card input:focus {
              border-color: #111827;
              box-shadow: 0 0 0 3px rgba(17, 24, 39, 0.08);
            }

            .emp-search-wrapper {
              flex: 1;
              position: relative;
            }

            .emp-dropdown {
              position: absolute;
              top: 56px;
              left: 0;
              right: 0;
              background: white;
              border: 1px solid #e5e7eb;
              border-radius: 14px;
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
              z-index: 999;
              max-height: 240px;
              overflow-y: auto;
            }

            .emp-dropdown-item {
              padding: 12px 16px;
              cursor: pointer;
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 1px solid #f3f4f6;
              transition: 0.15s ease;
            }

            .emp-dropdown-item:last-child {
              border-bottom: none;
            }

            .emp-dropdown-item:hover {
              background: #f9fafb;
            }

            .emp-dropdown-item.empty {
              color: #9ca3af;
              cursor: default;
              justify-content: center;
            }

            .emp-dropdown-item strong {
              font-size: 14px;
              color: #111827;
            }

            .emp-dropdown-item span {
              font-size: 12px;
              color: #6b7280;
            }

            .admin-info {
              margin-bottom: 20px;
              padding: 14px 18px;
              background: #eff6ff;
              border: 1px solid #bfdbfe;
              border-radius: 14px;
              font-size: 14px;
              color: #1e40af;
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

            .pagination {
              display: flex;
              justify-content: center;
              align-items: center;
              gap: 16px;
              margin-top: 24px;
              padding: 16px;
            }

            .pagination button {
              height: 40px;
              padding: 0 18px;
              border-radius: 10px;
              border: 1px solid #d1d5db;
              background: white;
              font-weight: 600;
              cursor: pointer;
              transition: 0.15s ease;
            }

            .pagination button:hover:not(:disabled) {
              background: #111827;
              color: white;
              border-color: #111827;
            }

            .pagination button:disabled {
              opacity: 0.4;
              cursor: not-allowed;
            }

            .pagination span {
              font-size: 14px;
              color: #6b7280;
              font-weight: 600;
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

export default LogsByAuthorizedPage;
