"use client";

import React, { useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";

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

  // 🔥 fetch leaves
  const fetchLeaves = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get("/leave/all");

      setData(res.data.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
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
  const handleReject = async (id: number) => {
    const confirmReject = window.confirm("Reject this leave?");

    if (!confirmReject) return;

    try {
      await axiosInstance.patch(`/leave/reject/${id}`);

      alert("❌ Leave rejected");

      fetchLeaves();
    } catch (err: any) {
      console.log(err);

      alert(err?.response?.data?.message || "Reject failed");
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

          {/* LOADING */}
          {loading ? (
            <p>Loading...</p>
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
                      <td>
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
          margin-bottom: 24px;
        }

        .table-header h2 {
          margin: 0;
        }

        .table-header p {
          margin-top: 6px;
          color: #666;
          font-size: 14px;
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
      `}</style>
        </div>
      </div>
    </div>
  );
};

export default LeaveApprovalTable;
