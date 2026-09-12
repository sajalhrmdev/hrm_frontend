"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

import axiosInstance from "@/utils/axiosInstance";
import { SkeletonTable } from "@/core/common/Skeleton";
import { Tooltip } from "react-tooltip";

// ======================================================

const statusColors: any = {
  PRESENT: "success",

  HALF_DAY: "warning",

  ABSENT: "danger",

  HOLIDAY: "info",

  PAID_LEAVE: "primary",

  UNPAID_LEAVE: "secondary",

  WEEKLY_OFF: "dark",
};

// ======================================================

const CompanyDailyAttendanceDashboard = () => {
  // ====================================================

  const [loading, setLoading] = useState(false);

  const [attendanceData, setAttendanceData] = useState<any[]>([]);

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const [search, setSearch] = useState("");

  const [topScrollWidth, setTopScrollWidth] = useState(0);

  const topScrollRef = useRef<HTMLDivElement>(null);

  const tableWrapRef = useRef<HTMLDivElement>(null);

  const syncingRef = useRef(false);

  // ====================================================
  // SYNCED TOP SCROLLBAR
  // ====================================================

  useEffect(() => {
    const update = () => {
      if (tableWrapRef.current) {
        setTopScrollWidth(tableWrapRef.current.scrollWidth);
      }
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [attendanceData, loading]);

  const handleTopScroll = () => {
    if (syncingRef.current || !topScrollRef.current || !tableWrapRef.current) {
      return;
    }
    syncingRef.current = true;
    tableWrapRef.current.scrollLeft = topScrollRef.current.scrollLeft;
    requestAnimationFrame(() => {
      syncingRef.current = false;
    });
  };

  const handleTableScroll = () => {
    if (syncingRef.current || !topScrollRef.current || !tableWrapRef.current) {
      return;
    }
    syncingRef.current = true;
    topScrollRef.current.scrollLeft = tableWrapRef.current.scrollLeft;
    requestAnimationFrame(() => {
      syncingRef.current = false;
    });
  };

  const [officeLoc, setOfficeLoc] = useState<any>(null);

  const [addresses, setAddresses] = useState<{ [key: number]: string }>({});

  const googleMapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAP_KEY;

  // ====================================================
  // FETCH OFFICE LOCATION (once, for distance badges)
  // ====================================================

  const fetchOfficeLocation = async () => {
    try {
      const res = await axiosInstance.get("/office-location/myLocations");

      const list = res?.data?.data || [];

      const withCoords = list.find((l: any) => l.latitude && l.longitude);

      if (!withCoords) {
        console.error("[Location] no office with coordinates found", list);
      }

      setOfficeLoc(withCoords || null);
    } catch (err: any) {
      console.error(
        "[Location] office fetch failed:",
        err?.response?.data?.message || err.message,
      );
    }
  };

  useEffect(() => {
    fetchOfficeLocation();
  }, []);

  // ====================================================
  // DISTANCE (haversine, km)
  // ====================================================

  const distanceKm = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // ====================================================
  // REVERSE GEOCODE (on hover, cached)
  // ====================================================

  const getAddress = async (lat: number, lng: number) => {
    if (!googleMapsKey) return "Unknown";

    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleMapsKey}`,
    );

    const data = await res.json();
    return data.results?.[0]?.formatted_address || "Unknown";
  };

  const loadAddress = async (log: any) => {
    if (!log || addresses[log.id] || !log.latitude || !log.longitude) return;

    try {
      const addr = await getAddress(log.latitude, log.longitude);

      setAddresses((prev) => ({ ...prev, [log.id]: addr }));
    } catch {
      setAddresses((prev) => ({ ...prev, [log.id]: "Failed to load" }));
    }
  };

  // ====================================================
  // LOCATION CELLS (IN / OUT logs -> coords + distance badge + map link)
  // ====================================================

  const renderLogCell = (log: any) => {
    if (!log || !log.latitude || !log.longitude) {
      return <span className="loc-na">--</span>;
    }

    const lat = Number(log.latitude);
    const lng = Number(log.longitude);

    let km: number | null = null;
    let inside: boolean | null = null;

    if (officeLoc?.latitude && officeLoc?.longitude) {
      km = distanceKm(lat, lng, officeLoc.latitude, officeLoc.longitude);
      const radiusM = Number(officeLoc.radius) || 100;
      inside = km * 1000 <= radiusM;
    }

    return (
      <div className="loc-cell">
        <a
          href={`https://maps.google.com/?q=${lat},${lng}`}
          target="_blank"
          rel="noreferrer"
          className="loc-coords"
          data-tooltip-id="loc-tooltip"
          data-tooltip-content={addresses[log.id] || "Hover to load address"}
          onMouseEnter={() => loadAddress(log)}
        >
          📍 {lat.toFixed(2)}, {lng.toFixed(2)}
        </a>

        {km !== null ? (
          <span className={`loc-badge ${inside ? "in" : "out"}`}>
            <span className="loc-dot" />
            {km < 1
              ? `${Math.round(km * 1000)}m`
              : `${km.toFixed(1)}km`}{" "}
            · {inside ? "In office" : "Away"}
          </span>
        ) : (
          <span className="loc-badge off">
            <span className="loc-dot" />
            office n/a
          </span>
        )}
      </div>
    );
  };

  const renderLocation = (item: any, type: "IN" | "OUT") => {
    const logs = item?.attendanceLogs || [];
    return renderLogCell(logs.find((l: any) => l.type === type));
  };

  // ====================================================
  // FETCH
  // ====================================================

  const fetchAttendance = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get(
        `/attendance/company-day?date=${selectedDate}`,
      );

      setAttendanceData(res?.data?.data || []);
    } catch (err: any) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // ====================================================

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate]);

  // ====================================================
  // FILTERED
  // ====================================================

  const filteredData = useMemo(() => {
    return attendanceData.filter((item: any) => {
      const name = item?.employee?.name?.toLowerCase() || "";

      const code = item?.employee?.employeeCode?.toLowerCase() || "";

      return (
        name.includes(search.toLowerCase()) ||
        code.includes(search.toLowerCase())
      );
    });
  }, [attendanceData, search]);

  // ====================================================
  // SUMMARY
  // ====================================================

  const summary = useMemo(() => {
    return {
      total: attendanceData.length,

      present: attendanceData.filter((a: any) => a.status === "PRESENT").length,

      absent: attendanceData.filter((a: any) => a.status === "ABSENT").length,

      halfDay: attendanceData.filter((a: any) => a.status === "HALF_DAY")
        .length,

      leave: attendanceData.filter(
        (a: any) => a.status === "PAID_LEAVE" || a.status === "UNPAID_LEAVE",
      ).length,
    };
  }, [attendanceData]);

  // ====================================================
  // FORMAT TIME
  // ====================================================

  const formatTime = (value: string) => {
    if (!value) return "--";

    return new Date(value).toLocaleTimeString("en-IN", {
      hour: "2-digit",

      minute: "2-digit",
    });
  };

  // ====================================================
  // FORMAT WORK
  // ====================================================

  const formatWork = (minutes: number) => {
    if (!minutes) return "0m";

    const hrs = Math.floor(minutes / 60);

    const mins = minutes % 60;

    return `${hrs}h ${mins}m`;
  };

  // ====================================================

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="attendance-page">
          {/* ================================= */}
          {/* HEADER */}
          {/* ================================= */}

          <div className="top-header">
            <div>
              <h2>Daily Attendance Dashboard</h2>

              <p>
                Monitor company-wide attendance, work hours, overtime & employee
                statuses.
              </p>
            </div>

            <button className="refresh-btn" onClick={fetchAttendance}>
              🔄 Refresh
            </button>
          </div>

          {/* ================================= */}
          {/* SUMMARY */}
          {/* ================================= */}

          <div className="summary-grid">
            <div className="summary-card">
              <span>Total</span>

              <h3>{summary.total}</h3>
            </div>

            <div className="summary-card success">
              <span>Present</span>

              <h3>{summary.present}</h3>
            </div>

            <div className="summary-card danger">
              <span>Absent</span>

              <h3>{summary.absent}</h3>
            </div>

            <div className="summary-card warning">
              <span>Half Day</span>

              <h3>{summary.halfDay}</h3>
            </div>

            <div className="summary-card primary">
              <span>Leave</span>

              <h3>{summary.leave}</h3>
            </div>
          </div>

          {/* ================================= */}
          {/* FILTER */}
          {/* ================================= */}

          <div className="filter-wrapper">
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

          {/* ================================= */}
          {/* TABLE */}
          {/* ================================= */}

          <div
            className="top-scroll"
            ref={topScrollRef}
            onScroll={handleTopScroll}
          >
            <div
              className="top-scroll-spacer"
              style={{ width: topScrollWidth }}
            />
          </div>

          <div
            className="table-wrapper"
            ref={tableWrapRef}
            onScroll={handleTableScroll}
          >
            <table>
              <thead>
                <tr>
                  <th>Employee</th>

                  <th>Check In</th>

                  <th>Check Out</th>

                  <th>Work Hours</th>

                  <th>Overtime</th>

                  <th>Late</th>

                  <th>Status</th>

                  <th>In Location</th>

                  <th>Out Location</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9}>
                      <SkeletonTable rows={5} columns={9} />
                    </td>
                  </tr>
                ) : filteredData.length ? (
                  filteredData.map((item: any) => (
                    <tr key={item.id}>
                      <td>
                        <div className="employee-info">
                          <div className="avatar">
                            {item?.employee?.name?.[0]}
                          </div>

                          <div>
                            <h6>{item?.employee?.name}</h6>

                            <span>{item?.employee?.employeeCode}</span>
                          </div>
                        </div>
                      </td>

                      <td>{formatTime(item.check_in_time)}</td>

                      <td>{formatTime(item.check_out_time)}</td>

                      <td>{formatWork(item.total_work_minutes)}</td>

                      <td>{formatWork(item.overtime_minutes)}</td>

                      <td>{item.late_minutes || 0} mins</td>

                      <td>
                        <span
                          className={`badge bg-${statusColors[item.status]}`}
                        >
                          {item.status?.replaceAll("_", " ")}
                        </span>
                      </td>

                      <td>{renderLocation(item, "IN")}</td>

                      <td>{renderLocation(item, "OUT")}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="empty">
                      No attendance found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Tooltip id="loc-tooltip" />

          {/* ================================= */}
          {/* STYLE */}
          {/* ================================= */}

          <style>{`
            .attendance-page {
              width: 100%;

              padding: 24px;

              .top-header {
              display: flex;

              justify-content: space-between;

              align-items: center;

              gap: 20px;

              margin-bottom: 24px;
            }

            .top-header h2 {
              font-size: 30px;

              font-weight: 800;

              margin-bottom: 6px;

              color: #111827;
            }

            .top-header p {
              margin: 0;

              color: #6b7280;

              font-size: 14px;
            }

            .refresh-btn {
              border: none;

              height: 48px;

              padding: 0 18px;

              border-radius: 12px;

              background: #111827;

              color: white;

              font-weight: 700;
            }

            .summary-grid {
              display: grid;

              grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));

              gap: 18px;

              margin-bottom: 24px;
            }

            .summary-card {
              background: white;

              border-radius: 20px;

              padding: 22px;

              border: 1px solid #e5e7eb;

              box-shadow: 0 6px 24px rgba(0, 0, 0, 0.05);
            }

            .summary-card span {
              color: #6b7280;

              font-size: 14px;
            }

            .summary-card h3 {
              margin-top: 10px;

              margin-bottom: 0;

              font-size: 34px;

              font-weight: 800;
            }

            .summary-card.success h3 {
              color: #16a34a;
            }

            .summary-card.danger h3 {
              color: #dc2626;
            }

            .summary-card.warning h3 {
              color: #d97706;
            }

            .summary-card.primary h3 {
              color: #2563eb;
            }

            .filter-wrapper {
              display: flex;

              gap: 16px;

              margin-bottom: 24px;
            }

            .filter-wrapper input {
              height: 50px;

              border-radius: 14px;

              border: 1px solid #d1d5db;

              padding: 0 16px;

              background: white;

              outline: none;

              font-size: 14px;

              color: #111827;

              writing-mode: horizontal-tb;
            }

            .filter-wrapper input:first-child {
              flex: 1;
            }

            .table-wrapper {
              width: 100%;

              overflow-x: auto;

              background: white;

              border-radius: 22px;

              border: 1px solid #e5e7eb;

              box-shadow: 0 10px 35px rgba(0, 0, 0, 0.05);
            }

            .top-scroll {
              width: 100%;

              overflow-x: auto;

              overflow-y: hidden;

              height: 12px;

              margin-bottom: 10px;

              border-radius: 999px;

              background: linear-gradient(135deg, #eef2ff, #f8fafc);

              border: 1px solid #e0e7ff;

              scrollbar-width: thin;

              scrollbar-color: #818cf8 #eef2ff;
            }

            .top-scroll::-webkit-scrollbar {
              height: 10px;
            }

            .top-scroll::-webkit-scrollbar-track {
              background: transparent;

              border-radius: 999px;
            }

            .top-scroll::-webkit-scrollbar-thumb {
              background: linear-gradient(90deg, #6366f1, #8b5cf6, #6366f1);

              border-radius: 999px;

              border: 2px solid #eef2ff;
            }

            .top-scroll::-webkit-scrollbar-thumb:hover {
              background: linear-gradient(90deg, #4f46e5, #7c3aed, #4f46e5);
            }

            .top-scroll-spacer {
              height: 1px;
            }

            .table-wrapper::-webkit-scrollbar {
              height: 10px;
            }

            .table-wrapper::-webkit-scrollbar-track {
              background: #f8fafc;

              border-radius: 0 0 22px 22px;
            }

            .table-wrapper::-webkit-scrollbar-thumb {
              background: linear-gradient(90deg, #6366f1, #8b5cf6, #6366f1);

              border-radius: 999px;

              border: 2px solid #f8fafc;
            }

            .table-wrapper::-webkit-scrollbar-thumb:hover {
              background: linear-gradient(90deg, #4f46e5, #7c3aed, #4f46e5);
            }

            .table-wrapper {
              scrollbar-width: thin;

              scrollbar-color: #818cf8 #f8fafc;
            }

            table {
              width: 100%;

              border-collapse: collapse;
            }

            thead {
              background: #f9fafb;
            }

            th {
              padding: 18px;

              font-size: 13px;

              font-weight: 800;

              color: #374151;

              text-transform: uppercase;

              white-space: nowrap;
            }

            td {
              padding: 18px;

              border-top: 1px solid #f3f4f6;

              vertical-align: middle;

              white-space: nowrap;

              font-size: 14px;

              color: #111827;
            }

            tr:hover {
              background: #fafafa;
            }

            .employee-info {
              display: flex;

              align-items: center;

              gap: 14px;
            }

            .avatar {
              width: 42px;

              height: 42px;

              border-radius: 50%;

              background: #111827;

              color: white;

              display: flex;

              align-items: center;

              justify-content: center;

              font-weight: 700;
            }

            .employee-info h6 {
              margin: 0;

              font-size: 14px;

              font-weight: 700;
            }

            .employee-info span {
              font-size: 12px;

              color: #6b7280;
            }

            .badge {
              padding: 8px 12px;

              border-radius: 999px;

              font-size: 12px;

              font-weight: 700;
            }

            .empty {
              text-align: center;

              padding: 50px;

              color: #6b7280;
            }

            .loc-cell {
              display: flex;

              flex-direction: column;

              gap: 6px;

              align-items: flex-start;
            }

            .loc-coords {
              display: inline-flex;

              align-items: center;

              gap: 6px;

              font-size: 13px;

              font-weight: 700;

              color: #1e40af;

              background: linear-gradient(135deg, #eff6ff, #ffffff);

              border: 1px solid #bfdbfe;

              padding: 5px 12px;

              border-radius: 999px;

              text-decoration: none;

              white-space: nowrap;

              cursor: pointer;

              transition: 0.2s;
            }

            .loc-coords:hover {
              background: #dbeafe;

              text-decoration: none;

              transform: translateY(-1px);

              box-shadow: 0 4px 12px rgba(29, 78, 216, 0.18);
            }

            .loc-badge {
              display: inline-flex;

              align-items: center;

              gap: 6px;

              font-size: 11px;

              font-weight: 800;

              letter-spacing: 0.02em;

              padding: 4px 12px;

              border-radius: 999px;

              white-space: nowrap;
            }

            .loc-dot {
              width: 7px;

              height: 7px;

              border-radius: 50%;

              background: currentColor;

              box-shadow: 0 0 6px currentColor;

              flex-shrink: 0;
            }

            .loc-badge.in {
              background: linear-gradient(135deg, #dcfce7, #f0fdf4);

              color: #15803d;

              border: 1px solid #86efac;

              box-shadow: 0 2px 8px rgba(22, 101, 52, 0.12);
            }

            .loc-badge.out {
              background: linear-gradient(135deg, #fee2e2, #fef2f2);

              color: #b91c1c;

              border: 1px solid #fca5a5;

              box-shadow: 0 2px 8px rgba(153, 27, 27, 0.12);
            }

            .loc-badge.off {
              background: #f3f4f6;

              color: #6b7280;

              border: 1px solid #e5e7eb;
            }

            .loc-na {
              color: #9ca3af;
            }

            @media (max-width: 768px) {
              .top-header {
                flex-direction: column;

                align-items: flex-start;
              }

              .filter-wrapper {
                flex-direction: column;
              }
            }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
};

export default CompanyDailyAttendanceDashboard;
