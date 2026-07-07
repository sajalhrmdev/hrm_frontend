import React, { useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { Tooltip } from "react-tooltip";

type Attendance = {
  id: number;

  date: string;

  status: string;

  total_work_minutes: number;

  overtime_minutes: number;

  late_minutes: number;

  shift?: {
    title: string;
  };
};

type CalendarDay = {
  day: number;

  status: string;

  record?: Attendance;
};

const MonthlyAttendance: React.FC = () => {
  const [data, setData] = useState<Attendance[]>([]);

  const [loading, setLoading] = useState<boolean>(false);

  const today = new Date();

  const [year, setYear] = useState<number>(today.getFullYear());

  const [month, setMonth] = useState<number>(today.getMonth() + 1);

  // ============================================
  // API
  // ============================================

  const fetchAttendance = async (y: number, m: number) => {
    try {
      setLoading(true);

      const res = await axiosInstance.get<{
        success: boolean;

        data: Attendance[];
      }>(`/attendance/monthly-attendance-all?year=${y}&month=${m}`);

      setData(res.data.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // EFFECT
  // ============================================

  useEffect(() => {
    fetchAttendance(year, month);
  }, [year, month]);

  // ============================================
  // STATUS COLOR
  // ============================================

  const getColor = (status: string): string => {
    const colors: Record<string, string> = {
      PRESENT: "#16a34a",

      ABSENT: "#dc2626",

      HALF_DAY: "#f59e0b",

      PAID_LEAVE: "#2563eb",

      UNPAID_LEAVE: "#111827",

      WEEKLY_OFF: "#0ea5e9",

      HOLIDAY: "#6b7280",

      ON_DUTY: "#9333ea",

      WORK_FROM_HOME: "#06b6d4",
    };

    return colors[status] || "#000";
  };

  // ============================================
  // CALENDAR GENERATE
  // ============================================

  const generateCalendar = (): (CalendarDay | null)[] => {
    const daysInMonth = new Date(year, month, 0).getDate();

    const firstDay = new Date(year, month - 1, 1).getDay();

    const map: Record<number, Attendance> = {};

    data.forEach((d) => {
      const day = new Date(d.date).getDate();

      map[day] = d;
    });

    const days: (CalendarDay | null)[] = [];

    // empty slots

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // actual days

    for (let i = 1; i <= daysInMonth; i++) {
      const record = map[i];

      days.push({
        day: i,

        status: record?.status || "ABSENT",

        record,
      });
    }

    return days;
  };

  const calendar = generateCalendar();

  // ============================================
  // LOADING
  // ============================================

  if (loading) {
    return (
      <div
        style={{
          textAlign: "center",

          marginTop: "40px",
        }}
      >
        <div className="loader"></div>

        <p
          style={{
            marginTop: "10px",

            color: "#666",
          }}
        >
          Loading attendance...
        </p>

        <style>{`
          .loader {
            width: 40px;
            height: 40px;
            border: 4px solid #ddd;
            border-top: 4px solid #2563eb;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: auto;
          }

          @keyframes spin {
            100% {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  // ============================================
  // UI
  // ============================================

  return (
    <div className="attendance-card">
      {/* HEADER */}

      <div className="header">
        <h3>📅 Monthly Attendance</h3>

        <input
          type="month"
          value={`${year}-${String(month).padStart(2, "0")}`}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;

            if (!value) return;

            const [y, m] = value.split("-");

            setYear(Number(y));

            setMonth(Number(m));
          }}
        />
      </div>

      {/* WEEK HEADER */}

      <div className="week-header">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      {/* TOOLTIP */}

      <Tooltip
        id="attendance-tooltip"
        place="top"
        positionStrategy="fixed"
        offset={10}
        delayShow={200}
      />

      {/* CALENDAR */}

      <div className="calendar-grid">
        {calendar.map((d, index) => {
          if (!d) return <div key={index}></div>;

          const content = d.record
            ? `
                    <div>

                      <b>Date:</b>
                      ${d.record.date.split("T")[0]}

                      <br/>

                      <b>Status:</b>
                      ${d.record.status}

                      <br/>

                      <b>Work:</b>
                      ${d.record.total_work_minutes} min

                      <br/>

                      <b>OT:</b>
                      ${d.record.overtime_minutes} min

                      <br/>

                      <b>Late:</b>
                      ${d.record.late_minutes || 0} min

                      <br/>

                      <b>Shift:</b>
                      ${d.record.shift?.title || "-"}

                    </div>
                  `
            : `
                    <div>
                      <b>Status:</b>
                      ABSENT
                    </div>
                  `;

          return (
            <div
              key={index}
              className="calendar-item"
              data-tooltip-id="attendance-tooltip"
              data-tooltip-html={content}
              style={{
                background: getColor(d.status),

                animationDelay: `${index * 0.03}s`,
              }}
            >
              <div className="day">{d.day}</div>

              <div className="status">{d.status}</div>
            </div>
          );
        })}
      </div>

      {/* STYLES */}

      <style>{`
        .attendance-card {
          backdrop-filter: blur(12px);

          background:
            rgba(255,255,255,0.7);

          border-radius: 20px;

          padding: 20px;

          box-shadow:
            0 8px 30px
            rgba(0,0,0,0.1);

          animation:
            fadeIn 0.5s ease;
        }

        .header {
          display: flex;

          justify-content:
            space-between;

          align-items: center;

          margin-bottom: 20px;

          gap: 10px;

          flex-wrap: wrap;
        }

        .header h3 {
          font-weight: bold;

          background:
            linear-gradient(
              90deg,
              #2563eb,
              #9333ea
            );

          -webkit-background-clip:
            text;

          -webkit-text-fill-color:
            transparent;
        }

        .header input {
          padding: 6px 10px;

          border-radius: 8px;

          border:
            1px solid #ddd;
        }

        .week-header {
          display: grid;

          grid-template-columns:
            repeat(7, 1fr);

          text-align: center;

          font-weight: bold;

          margin-bottom: 10px;

          color: #555;
        }

        .calendar-grid {
          display: grid;

          grid-template-columns:
            repeat(7, 1fr);

          gap: 12px;
        }

        .calendar-item {
          padding: 14px;

          border-radius: 16px;

          text-align: center;

          color: #fff;

          font-weight: bold;

          cursor: pointer;

          transform:
            translateY(20px);

          opacity: 0;

          animation:
            fadeUp 0.5s ease
            forwards;

          box-shadow:
            0 6px 15px
            rgba(0,0,0,0.15);

          transition:
            all 0.25s ease;

          min-height: 90px;

          display: flex;

          flex-direction: column;

          justify-content: center;

          align-items: center;
        }

        .calendar-item:hover {
          transform:
            scale(1.08)
            translateY(-3px);

          box-shadow:
            0 10px 25px
            rgba(0,0,0,0.2);

          z-index: 5;
        }

        .day {
          font-size: 20px;
        }

        .status {
          font-size: 10px;

          opacity: 0.95;

          margin-top: 4px;

          word-break: break-word;

          line-height: 1.2;
        }

        /* animations */

        @keyframes fadeUp {
          to {
            opacity: 1;

            transform:
              translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;

            transform:
              scale(0.95);
          }

          to {
            opacity: 1;

            transform:
              scale(1);
          }
        }

        /* loader */

        .loader {
          width: 40px;

          height: 40px;

          border:
            4px solid #ddd;

          border-top:
            4px solid #2563eb;

          border-radius: 50%;

          animation:
            spin 1s linear infinite;

          margin: auto;
        }

        @keyframes spin {
          100% {
            transform:
              rotate(360deg);
          }
        }

        .react-tooltip {
          z-index: 9999 !important;
        }

        /* responsive */

        @media (max-width: 768px) {
          .calendar-grid {
            gap: 8px;
          }

          .calendar-item {
            padding: 10px;

            min-height: 75px;
          }

          .day {
            font-size: 16px;
          }

          .status {
            font-size: 9px;
          }
        }
      `}</style>
    </div>
  );
};
export default MonthlyAttendance;
