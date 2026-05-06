import React, { useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { Tooltip } from "react-tooltip";

type Attendance = {
  id: number;
  date: string;
  status: string;
  total_work_minutes: number;
  overtime_minutes: number;
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

  // ✅ API
  const fetchAttendance = async (y: number, m: number) => {
    try {
      setLoading(true);

      const res = await axiosInstance.get<{
        success: boolean;
        data: Attendance[];
      }>(`/attendance/monthly-attendance?year=${y}&month=${m}`);

      setData(res.data.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance(year, month);
  }, [year, month]);

  // 🎨 color
  const getColor = (status: string): string => {
    const colors: Record<string, string> = {
      PRESENT: "#16a34a",
      ABSENT: "#dc2626",
      HALF_DAY: "#f59e0b",
      LEAVE: "#2563eb",
    };
    return colors[status] || "#000";
  };

  // 📅 calendar generate (aligned)
  const generateCalendar = (): (CalendarDay | null)[] => {
    const daysInMonth = new Date(year, month, 0).getDate();

    const firstDay = new Date(year, month - 1, 1).getDay();

    const map: Record<number, Attendance> = {};
    data.forEach((d) => {
      const day = new Date(d.date).getDate();
      map[day] = d;
    });

    const days: (CalendarDay | null)[] = [];

    // 🔥 empty slots
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // 🔥 actual days
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

return loading ? (
  <div style={{ textAlign: "center", marginTop: "40px" }}>
    <div className="loader"></div>
    <p style={{ marginTop: "10px", color: "#666" }}>Loading attendance...</p>
  </div>
) : (
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
              <b>Date:</b> ${d.record.date.split("T")[0]} <br/>
              <b>Status:</b> ${d.record.status} <br/>
              <b>Work:</b> ${d.record.total_work_minutes} min <br/>
              <b>OT:</b> ${d.record.overtime_minutes} min
            </div>
          `
          : `
            <div>
              <b>Status:</b> ABSENT
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

    {/* GLOBAL STYLE */}
    <style>{`
      .attendance-card {
        backdrop-filter: blur(12px);
        background: rgba(255,255,255,0.7);
        border-radius: 20px;
        padding: 20px;
        box-shadow: 0 8px 30px rgba(0,0,0,0.1);
        animation: fadeIn 0.5s ease;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }

      .header h3 {
        font-weight: bold;
        background: linear-gradient(90deg,#2563eb,#9333ea);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .header input {
        padding: 6px 10px;
        border-radius: 8px;
        border: 1px solid #ddd;
      }

      .week-header {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        text-align: center;
        font-weight: bold;
        margin-bottom: 10px;
        color: #555;
      }

      .calendar-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 12px;
      }

      .calendar-item {
        padding: 14px;
        border-radius: 16px;
        text-align: center;
        color: #fff;
        font-weight: bold;
        cursor: pointer;
        transform: translateY(20px);
        opacity: 0;
        animation: fadeUp 0.5s ease forwards;
        box-shadow: 0 6px 15px rgba(0,0,0,0.15);
        transition: all 0.25s ease;
      }

      .calendar-item:hover {
        transform: scale(1.1) translateY(-3px);
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
      }

      .day {
        font-size: 20px;
      }

      .status {
        font-size: 11px;
        opacity: 0.9;
      }

      /* animations */
      @keyframes fadeUp {
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: scale(0.95);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      /* loader */
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

      .react-tooltip {
        z-index: 9999 !important;
      }
    `}</style>
  </div>
);
};

export default MonthlyAttendance;
