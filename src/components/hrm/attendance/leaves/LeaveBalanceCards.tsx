import React, {
  useEffect,
  useState,
} from "react";

import axiosInstance from "@/utils/axiosInstance";
import { SkeletonCard } from "@/core/common/Skeleton";

type BalanceItem = {
  id: number;

  total_allocated: number;

  used: number;

  remaining: number;

  year: number;

  leaveType: {
    id: number;
    name: string;
    code: string;
    is_paid: boolean;
  };
};

const LeaveBalanceCards: React.FC = () => {
  const [data, setData] = useState<
    BalanceItem[]
  >([]);

  const [loading, setLoading] =
    useState(false);

  const [year, setYear] = useState(
    new Date().getFullYear()
  );

  // 🚀 fetch
  const fetchBalances =
    async () => {
      try {
        setLoading(true);

        const res =
          await axiosInstance.get(
            `/leave/balance?year=${year}`
          );

        setData(res.data.data || []);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchBalances();
  }, [year]);

  return (
    <div>
      {/* HEADER */}
      <div className="balance-header">
        <div>
          <h2>
            🎯 My Leave Balance
          </h2>

          <p>
            Track your remaining
            leaves
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
        <SkeletonCard />
      ) : (
        <div className="balance-grid">
          {data.map((item) => {
            const percent =
              (item.used /
                item.total_allocated) *
              100;

            return (
              <div
                className="balance-card"
                key={item.id}
              >
                {/* TOP */}
                <div className="card-top">
                  <div>
                    <h3>
                      {
                        item.leaveType
                          .name
                      }
                    </h3>

                    <p>
                      {
                        item.leaveType
                          .code
                      }
                    </p>
                  </div>

                  <span
                    className={
                      item.leaveType
                        .is_paid
                        ? "paid-badge"
                        : "unpaid-badge"
                    }
                  >
                    {item.leaveType
                      .is_paid
                      ? "Paid"
                      : "Unpaid"}
                  </span>
                </div>

                {/* REMAINING */}
                <div className="remaining-box">
                  <h1>
                    {item.remaining}
                  </h1>

                  <span>
                    Remaining
                  </span>
                </div>

                {/* STATS */}
                <div className="stats-row">
                  <div>
                    <p>Total</p>

                    <strong>
                      {
                        item.total_allocated
                      }
                    </strong>
                  </div>

                  <div>
                    <p>Used</p>

                    <strong>
                      {item.used}
                    </strong>
                  </div>
                </div>

                {/* PROGRESS */}
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${percent}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* STYLES */}
      <style>{`
        .balance-header {
          display:flex;
          justify-content:space-between;
          align-items:center;
          margin-bottom:25px;
        }

        .balance-header h2 {
          margin:0;
        }

        .balance-header p {
          margin-top:5px;
          color:#666;
        }

        .year-input {
          width:120px;
          padding:10px;
          border-radius:12px;
          border:1px solid #ddd;
        }

        .balance-grid {
          display:grid;
          grid-template-columns:
            repeat(auto-fit,minmax(280px,1fr));
          gap:20px;
        }

        .balance-card {
          background:#fff;
          border-radius:24px;
          padding:22px;
          box-shadow:
            0 10px 30px rgba(0,0,0,.08);
          transition:.2s;
        }

        .balance-card:hover {
          transform:translateY(-4px);
        }

        .card-top {
          display:flex;
          justify-content:space-between;
          align-items:center;
        }

        .card-top h3 {
          margin:0;
        }

        .card-top p {
          margin-top:4px;
          color:#666;
          font-size:13px;
        }

        .paid-badge,
        .unpaid-badge {
          padding:5px 10px;
          border-radius:20px;
          font-size:12px;
          font-weight:600;
        }

        .paid-badge {
          background:#dcfce7;
          color:#166534;
        }

        .unpaid-badge {
          background:#fee2e2;
          color:#991b1b;
        }

        .remaining-box {
          margin:28px 0;
          text-align:center;
        }

        .remaining-box h1 {
          margin:0;
          font-size:52px;
          color:#2563eb;
        }

        .remaining-box span {
          color:#666;
          font-size:14px;
        }

        .stats-row {
          display:flex;
          justify-content:space-between;
          margin-bottom:16px;
        }

        .stats-row p {
          margin:0;
          font-size:13px;
          color:#666;
        }

        .progress-bar {
          width:100%;
          height:10px;
          background:#eee;
          border-radius:20px;
          overflow:hidden;
        }

        .progress-fill {
          height:100%;
          background:#2563eb;
          border-radius:20px;
          transition:.3s;
        }
      `}</style>
    </div>
  );
};

export default LeaveBalanceCards;