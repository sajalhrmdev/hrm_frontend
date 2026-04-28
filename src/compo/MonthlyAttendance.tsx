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
    <p style={{ textAlign: "center", marginTop: "20px" }}>Loading...</p>
  ) : (
    <div className="card p-3">
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
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

      {/* 🔥 WEEK HEADER */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          marginBottom: "10px",
          textAlign: "center",
          fontWeight: "bold",
          color: "#555",
        }}
      >
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
     
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: "12px",
        }}
      >
        {calendar.map((d, index) => {
          if (!d) return <div key={index}></div>;

          const content = d.record
            ? `
              <div style="font-size:12px">
                <b>Date:</b> ${d.record.date.split("T")[0]} <br/>
                <b>Status:</b> ${d.record.status} <br/>
                <b>Work:</b> ${d.record.total_work_minutes} min <br/>
                <b>OT:</b> ${d.record.overtime_minutes} min
              </div>
            `
            : `
              <div style="font-size:12px">
                <b>Date:</b> ${year}-${String(month).padStart(2, "0")}-${String(
                d.day
              ).padStart(2, "0")} <br/>
                <b>Status:</b> ABSENT
              </div>
            `;

          return (
            
            <div
              key={index}
              data-tooltip-id="attendance-tooltip"
              data-tooltip-html={content}
              style={{
                padding: "14px",
                borderRadius: "14px",
                textAlign: "center",
                background: getColor(d.status),
                color: "#fff",
                fontWeight: "bold",
                cursor: "pointer",
                transition: "0.2s",
                boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform =
                  "scale(1.08)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform =
                  "scale(1)";
              }}
            >
              <div style={{ fontSize: "18px" }}>{d.day}</div>
              <div style={{ fontSize: "11px" }}>{d.status}</div>
            </div>
          );
        })}
      </div>

      {/* FIX Z-INDEX */}
      <style>{`
        .react-tooltip {
          z-index: 9999 !important;
        }
      `}</style>
    </div>
  );
};

export default MonthlyAttendance;
