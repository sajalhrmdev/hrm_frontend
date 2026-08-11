"use client";

import React, { useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { SkeletonTable } from "@/core/common/Skeleton";
import RejectReasonModal from "@/core/modals/RejectReasonModal";

type LeaveItem = {
  id: number;
  fromDate: string;
  toDate: string;
  totalDays: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reason?: string;

  employee: {
    name: string;
  };

  leaveType: {
    name: string;
    code: string;
  };
};

const LeaveApprovalTable: React.FC = () => {
  const [data, setData] = useState<LeaveItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [appliedFrom, setAppliedFrom] = useState("");
  const [appliedTo, setAppliedTo] = useState("");
  const [leaveFrom, setLeaveFrom] = useState("");
  const [leaveTo, setLeaveTo] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [rejectId, setRejectId] = useState<number | null>(null);

  const fetchLeaves = async (pageNum: number = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("page", String(pageNum));
      params.append("limit", "10");
      if (appliedFrom) params.append("appliedFrom", appliedFrom);
      if (appliedTo) params.append("appliedTo", appliedTo);
      if (leaveFrom) params.append("leaveFrom", leaveFrom);
      if (leaveTo) params.append("leaveTo", leaveTo);
      if (search.trim()) params.append("search", search.trim());
      const res = await axiosInstance.get(`/leave/all?${params.toString()}`);
      const result = res.data.data || {};
      setData(result.data || []);
      setTotalPages(result.totalPages || 1);
      setTotal(result.total || 0);
      setPage(pageNum);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves(1);
  }, []);

  // ✅ approve
  const handleApprove = async (id: number) => {
    const confirmApprove = window.confirm("Approve this leave?");

    if (!confirmApprove) return;

    try {
      await axiosInstance.patch(`/leave/approve/${id}`);

      alert("✅ Leave approved");

      fetchLeaves();
    } catch (err: any) {
      console.log(err);
      alert(err?.response?.data?.message || "Approve failed");
    }
  };

  // ❌ reject
  const handleReject = (id: number) => {
    setRejectId(id);
  };

  const confirmReject = async (reason: string) => {
    if (rejectId === null) return;

    try {
      await axiosInstance.patch(`/leave/reject/${rejectId}`, {
        remark: reason || undefined,
      });

      alert("❌ Leave rejected");

      setRejectId(null);

      fetchLeaves();
    } catch (err: any) {
      console.log(err);

      alert(err?.response?.data?.message || "Reject failed");
    }
  };
  const handleCancelApproval = async (
  id: number
) => {

  const confirmCancel =
    window.confirm(
      "Cancel leave approval?"
    );

  if (!confirmCancel) {
    return;
  }

  try {

    await axiosInstance.patch(
      `/leave/cancel-approval/${id}`
    );

    alert(
      "Approval cancelled"
    );

    fetchLeaves();

  } catch (err: any) {

    console.log(err);

    alert(
      err?.response?.data?.message ||
      "Cancel failed"
    );

  }

};

  // 🎨 status badge
  const getStatusStyle = (status: string): React.CSSProperties => {
    switch (status) {
      case "APPROVED":
        return {
          background: "#dcfce7",
          color: "#166534",
        };

      case "REJECTED":
        return {
          background: "#fee2e2",
          color: "#991b1b",
        };

      default:
        return {
          background: "#fef3c7",
          color: "#92400e",
        };
    }
  };

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="leave-table-card">
          {/* HEADER */}
          <div className="table-header">
            <div>
              <h2>📝 Leave Requests</h2>
              <p>Approve or reject employee leaves</p>
            </div>
            <div className="count-badge">{data.length} Requests</div>
          </div>

          {/* FILTERS */}
          <div className="filter-row">
            <div className="filter-group">
              <label>Applied From</label>
              <div className="input-with-clear">
                <input type="date" className="date-picker" value={appliedFrom} onChange={(e) => setAppliedFrom(e.target.value)} />
                {appliedFrom && <button className="clear-btn" onClick={() => setAppliedFrom("")} title="Clear">x</button>}
              </div>
            </div>
            <div className="filter-group">
              <label>Applied To</label>
              <div className="input-with-clear">
                <input type="date" className="date-picker" value={appliedTo} onChange={(e) => setAppliedTo(e.target.value)} />
                {appliedTo && <button className="clear-btn" onClick={() => setAppliedTo("")} title="Clear">x</button>}
              </div>
            </div>
            <div className="filter-group">
              <label>Leave From</label>
              <div className="input-with-clear">
                <input type="date" className="date-picker" value={leaveFrom} onChange={(e) => setLeaveFrom(e.target.value)} />
                {leaveFrom && <button className="clear-btn" onClick={() => setLeaveFrom("")} title="Clear">x</button>}
              </div>
            </div>
            <div className="filter-group">
              <label>Leave To</label>
              <div className="input-with-clear">
                <input type="date" className="date-picker" value={leaveTo} onChange={(e) => setLeaveTo(e.target.value)} />
                {leaveTo && <button className="clear-btn" onClick={() => setLeaveTo("")} title="Clear">x</button>}
              </div>
            </div>
            <div className="filter-group search-group">
              <label>Search</label>
              <input
                type="text"
                className="date-picker"
                placeholder="Search employee name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchLeaves(1)}
              />
            </div>
            <button className="search-btn" onClick={() => fetchLeaves(1)}>
              🔍
            </button>
          </div>

          {/* LOADING */}
          {loading ? (
            <SkeletonTable rows={5} columns={5} />
          ) : data.length === 0 ? (
            <p>No leave requests found</p>
          ) : (
            <div className="table-wrapper">
              <table className="leave-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Leave Type</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Days</th>
                    <th>Status</th>
                    <th>Reason</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {data.map((item) => (
                    <tr key={item.id}>
                      {/* EMPLOYEE */}
                      <td>
                        <strong>{item.employee.name}</strong>
                      </td>

                      {/* TYPE */}
                      <td>
                        <span className="type-badge">
                          {item.leaveType.name} ({item.leaveType.code})
                        </span>
                      </td>

                      {/* DATES */}
                      <td>
                        {new Date(item.fromDate).toLocaleDateString("en-IN")}
                      </td>

                      <td>
                        {new Date(item.toDate).toLocaleDateString("en-IN")}
                      </td>

                      {/* DAYS */}
                      <td>{item.totalDays}</td>

                      {/* STATUS */}
                      <td>
                        <span
                          className="status-badge"
                          style={getStatusStyle(item.status)}
                        >
                          {item.status}
                        </span>
                      </td>

                      {/* REASON */}
                      <td>{item.reason || "-"}</td>

                      {/* ACTIONS */}
                      {/* <td>
                        {item.status === "PENDING" ? (
                          <div className="action-row">
                            <button
                              className="approve-btn"
                              onClick={() => handleApprove(item.id)}
                            >
                              ✅ Approve
                            </button>

                            <button
                              className="reject-btn"
                              onClick={() => handleReject(item.id)}
                            >
                              ❌ Reject
                            </button>
                
                          </div>
                        ) : (
                          <span
                            style={{
                              color: "#888",
                              fontSize: "13px",
                            }}
                          >
                            Action completed
                          </span>
                        )}
                      </td> */}
                      <td>
                        {item.status === "PENDING" && (
                          <div className="action-row">
                            <button
                              className="approve-btn"
                              onClick={() => handleApprove(item.id)}
                            >
                              ✅ Approve
                            </button>

                            <button
                              className="reject-btn"
                              onClick={() => handleReject(item.id)}
                            >
                              ❌ Reject
                            </button>
                          </div>
                        )}

                        {item.status === "APPROVED" && (
                          <button
                            className="btn btn-warning btn-sm"
                            onClick={() => handleCancelApproval(item.id)}
                          >
                            ↩ Cancel Approval
                          </button>
                        )}

                        {item.status === "REJECTED" && (
                          <span
                            style={{
                              color: "#888",
                              fontSize: "13px",
                            }}
                          >
                            Rejected
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="pagination-bar">
              <button
                className="page-btn"
                disabled={page <= 1}
                onClick={() => fetchLeaves(page - 1)}
              >
                ← Previous
              </button>
              <span className="page-info">Page {page} of {totalPages} ({total} records)</span>
              <button
                className="page-btn"
                disabled={page >= totalPages}
                onClick={() => fetchLeaves(page + 1)}
              >
                Next →
              </button>
            </div>
          )}

          {/* STYLES */}
          <style>{`
        .leave-table-card {
          background: #fff;
          border-radius: 24px;
          padding: 24px;
          box-shadow: 0 10px 30px rgba(0,0,0,.08);
        }

        .table-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .table-header h2 {
          margin: 0;
        }

        .table-header p {
          margin-top: 6px;
          color: #666;
          font-size: 14px;
        }

        .filter-row {
          display: flex;
          align-items: flex-end;
          gap: 10px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .filter-group label {
          font-size: 11px;
          font-weight: 600;
          color: #555;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .search-group {
          flex: 1;
          min-width: 180px;
        }

        .input-with-clear {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .clear-btn {
          width: 22px;
          height: 22px;
          border: none;
          background: #ef4444;
          color: white;
          border-radius: 50%;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: .2s;
          line-height: 1;
        }

        .clear-btn:hover {
          background: #dc2626;
          transform: scale(1.1);
        }

        .search-btn {
          padding: 8px 14px;
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-size: 14px;
          transition: .2s;
        }

        .search-btn:hover {
          background: #1d4ed8;
        }

        .date-picker {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 500;
          background: #fff;
          cursor: pointer;
          outline: none;
          transition: .2s;
        }

        .date-picker:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37,99,235,.15);
        }

        .count-badge {
          background: #2563eb;
          color: white;
          padding: 8px 14px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
        }

        .table-wrapper {
          overflow-x: auto;
        }

        .leave-table {
          width: 100%;
          border-collapse: collapse;
        }

        .leave-table th {
          background: #f3f4f6;
          padding: 14px;
          text-align: left;
          font-size: 14px;
        }

        .leave-table td {
          padding: 14px;
          border-bottom: 1px solid #eee;
          font-size: 14px;
        }

        .leave-table tr:hover {
          background: #fafafa;
        }

        .type-badge {
          background: #e0e7ff;
          color: #3730a3;
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .status-badge {
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
        }

        .action-row {
          display: flex;
          gap: 10px;
        }

        .approve-btn,
        .reject-btn {
          border: none;
          padding: 8px 12px;
          border-radius: 12px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          transition: .2s;
        }

        .approve-btn {
          background: #16a34a;
          color: white;
        }

        .approve-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(22,163,74,.2);
        }

        .reject-btn {
          background: #dc2626;
          color: white;
        }

        .reject-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(220,38,38,.2);
        }

        .pagination-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid #e5e7eb;
        }

        .page-btn {
          padding: 8px 18px;
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: .2s;
        }

        .page-btn:hover:not(:disabled) {
          background: #1d4ed8;
        }

        .page-btn:disabled {
          background: #d1d5db;
          color: #999;
          cursor: not-allowed;
        }

        .page-info {
          font-size: 13px;
          color: #555;
          font-weight: 500;
        }
      `}</style>
        </div>
      </div>

      <RejectReasonModal
        show={rejectId !== null}
        onClose={() => setRejectId(null)}
        onConfirm={confirmReject}
      />
    </div>
  );
};

export default LeaveApprovalTable;
