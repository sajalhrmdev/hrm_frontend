import React, {
  useEffect,
  useState,
} from "react";

import axiosInstance from "@/utils/axiosInstance";

type LeaveItem = {
  id: number;

  fromDate: string;
  toDate: string;

  totalDays: number;

  leaveMode: string;

  paidDays: number;
  unpaidDays: number;

  status:
    | "PENDING"
    | "APPROVED"
    | "REJECTED";

  reason?: string;

  applied_at: string;

  leaveType: {
    id: number;
    name: string;
    code: string;
    is_paid: boolean;
  };
};

const MyLeavesTable: React.FC = () => {
  const [data, setData] = useState<
    LeaveItem[]
  >([]);

  const [loading, setLoading] =
    useState(false);

  const [year, setYear] = useState(
    new Date().getFullYear()
  );

  // 🚀 fetch
  const fetchLeaves =
    async () => {
      try {
        setLoading(true);

        const res =
          await axiosInstance.get(
            `/leave/my?year=${year}`
          );

        setData(res.data.data || []);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchLeaves();
  }, [year]);

  // 🎨 status style
  const getStatusStyle = (
    status: string
  ): React.CSSProperties => {
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
    <div className="leave-table-card">
      {/* HEADER */}
      <div className="table-header">
        <div>
          <h2>
            📝 My Leaves
          </h2>

          <p>
            Track your leave
            applications
          </p>
        </div>

        {/* YEAR */}
        <input
          type="number"
          value={year}
          onChange={(e) =>
            setYear(
              Number(
                e.target.value
              )
            )
          }
          className="year-input"
        />
      </div>

      {/* LOADING */}
      {loading ? (
        <p>Loading...</p>
      ) : data.length === 0 ? (
        <div className="empty-box">
          No leave history found
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="leave-table">
            <thead>
              <tr>
                <th>Leave Type</th>
                <th>From</th>
                <th>To</th>
                <th>Days</th>
                <th>Mode</th>
                <th>Paid</th>
                <th>Unpaid</th>
                <th>Status</th>
                <th>Reason</th>
                <th>Applied</th>
              </tr>
            </thead>

            <tbody>
              {data.map((item) => (
                <tr key={item.id}>
                  {/* TYPE */}
                  <td>
                    <div>
                      <strong>
                        {
                          item.leaveType
                            .name
                        }
                      </strong>

                      <div
                        className="leave-code"
                      >
                        {
                          item.leaveType
                            .code
                        }
                      </div>
                    </div>
                  </td>

                  {/* FROM */}
                  <td>
                    {new Date(
                      item.fromDate
                    ).toLocaleDateString(
                      "en-IN"
                    )}
                  </td>

                  {/* TO */}
                  <td>
                    {new Date(
                      item.toDate
                    ).toLocaleDateString(
                      "en-IN"
                    )}
                  </td>

                  {/* DAYS */}
                  <td>
                    <strong>
                      {
                        item.totalDays
                      }
                    </strong>
                  </td>

                  {/* MODE */}
                  <td>
                    <span className="mode-badge">
                      {
                        item.leaveMode
                      }
                    </span>
                  </td>

                  {/* PAID */}
                  <td>
                    {item.paidDays}
                  </td>

                  {/* UNPAID */}
                  <td>
                    {item.unpaidDays}
                  </td>

                  {/* STATUS */}
                  <td>
                    <span
                      className="status-badge"
                      style={getStatusStyle(
                        item.status
                      )}
                    >
                      {item.status}
                    </span>
                  </td>

                  {/* REASON */}
                  <td>
                    {item.reason ||
                      "-"}
                  </td>

                  {/* APPLIED */}
                  <td>
                    {new Date(
                      item.applied_at
                    ).toLocaleDateString(
                      "en-IN"
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
          background:#fff;
          border-radius:24px;
          padding:24px;
          box-shadow:
            0 10px 30px rgba(0,0,0,.08);
        }

        .table-header {
          display:flex;
          justify-content:space-between;
          align-items:center;
          margin-bottom:24px;
        }

        .table-header h2 {
          margin:0;
        }

        .table-header p {
          margin-top:6px;
          color:#666;
          font-size:14px;
        }

        .year-input {
          width:120px;
          padding:10px;
          border-radius:12px;
          border:1px solid #ddd;
        }

        .table-wrapper {
          overflow-x:auto;
        }

        .leave-table {
          width:100%;
          border-collapse:collapse;
        }

        .leave-table th {
          background:#f3f4f6;
          padding:14px;
          text-align:left;
          font-size:13px;
          white-space:nowrap;
        }

        .leave-table td {
          padding:14px;
          border-bottom:
            1px solid #eee;
          font-size:14px;
          vertical-align:middle;
        }

        .leave-table tr:hover {
          background:#fafafa;
        }

        .leave-code {
          margin-top:5px;
          display:inline-block;
          background:#e0e7ff;
          color:#3730a3;
          padding:4px 8px;
          border-radius:20px;
          font-size:11px;
          font-weight:600;
        }

        .mode-badge {
          background:#eff6ff;
          color:#1d4ed8;
          padding:5px 10px;
          border-radius:20px;
          font-size:12px;
          font-weight:600;
        }

        .status-badge {
          padding:6px 12px;
          border-radius:20px;
          font-size:12px;
          font-weight:700;
          white-space:nowrap;
        }

        .empty-box {
          background:#fff;
          padding:40px;
          text-align:center;
          border-radius:20px;
          box-shadow:
            0 10px 30px rgba(0,0,0,.06);
        }
      `}</style>
    </div>
  );
};

export default MyLeavesTable;