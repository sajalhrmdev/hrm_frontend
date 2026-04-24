"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import axiosInstance from "@/utils/axiosInstance";
import { useFakeProgress } from "@/hooks/useFakeProgress";
import { log } from "console";
import { Tooltip } from "react-tooltip";

const Attendance = () => {
  const [time, setTime] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"IN" | "OUT">("OUT");
  const [attendance, setAttendance] = useState<any>(null);
  const [addresses, setAddresses] = useState<{ [key: number]: string }>({});

  const getLocation = async () => {
    const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject),
    );

    return {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
    };
  };

  const getAddress = async (lat: number, lng: number) => {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyBc19C3Weqk97CdYInTUlLlbwBN_MqjLI8`,
    );

    const data = await res.json();
    return data.results?.[0]?.formatted_address || "Unknown";
  };
  const fetchAddresses = async () => {
    if (!attendance?.attendanceLogs) return;

    const result: any = {};

    for (const log of attendance.attendanceLogs) {
      if (log.latitude && log.longitude) {
        result[log.id] = await getAddress(log.latitude, log.longitude);
      }
    }

    setAddresses(result);
  };
  // useEffect(() => {
  //   fetchAddresses();
  // }, [attendance]);
  // ⏱ clock + fetch
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    fetchTodayAttendance();
    getLocation();

    return () => clearInterval(interval);
  }, []);

  // ✅ TODAY API (array fix)
  const fetchTodayAttendance = async () => {
    try {
      const res = await axiosInstance.get(`/attendance/today`);


      const todayData = res.data.data?.[0]; // 🔥 main fix
      setAttendance(todayData);

      // auto button state set
      const lastLog =
        todayData?.attendanceLogs?.[todayData.attendanceLogs.length - 1];

      if (lastLog?.type === "IN") {
        setStatus("IN");
      } else {
        setStatus("OUT");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ CHECK-IN
  const handleCheckIn = async () => {
    try {
      setLoading(true);
      const { latitude, longitude, accuracy } = await getLocation();
      const res = await axiosInstance.post(`/attendance/check-in`, {
        latitude,
        longitude,
        accuracy,
      });
     

      setAttendance(res.data.data.attendance);

      setStatus("IN");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ CHECK-OUT
  const handleCheckOut = async () => {
    try {
      setLoading(true);
      const { latitude, longitude, accuracy } = await getLocation();
        const res = await axiosInstance.post(`/attendance/check-out`, {
      latitude,
      longitude,
      accuracy,
    });

      setAttendance(res.data.data.attendance);

      setStatus("OUT");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date: any) =>
    new Date(date).toLocaleTimeString("en-GB", { hour12: false });

  const formatDate = (date: Date) => date.toDateString();

  // ✅ first IN
  const checkIn = attendance?.attendanceLogs?.find(
    (log: any) => log.type === "IN",
  );

  // ✅ last OUT
  const checkOut = [...(attendance?.attendanceLogs || [])]
    .reverse()
    .find((log: any) => log.type === "OUT");

  const progress = useFakeProgress(loading);

  return (
    <>
      <div className="container d-flex justify-content-center align-items-center vh-100 bg-light">
        <div
          className="card border-0 shadow-lg p-4"
          style={{
            width: "420px",
            borderRadius: "20px",
            background: "linear-gradient(135deg, #56bef2, #ffffff)",
          }}
        >
          {/* HEADER */}
          <div className="text-center mb-3">
            <h5
              className="fw-bold mb-2"
              style={{
                background: "linear-gradient(90deg, #5c19ed, #f10972)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {attendance?.company?.slug}
            </h5>
            <h5
              className="fw-bold mb-2"
              style={{
                background: "linear-gradient(90deg, #ff6600, #f10972)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Welcome, {attendance?.employee?.name || "User"} 👋
            </h5>
            <h4 className="fw-bold text-dark">Attendance</h4>
            <small className="text-muted">{formatDate(time)}</small>
          </div>

          {/* LIVE TIME */}
          <h1
            className="text-center fw-bold mb-3"
            style={{ letterSpacing: "2px" }}
          >
            {formatTime(time)}
          </h1>

          {/* BUTTON */}
          <div className="d-flex justify-content-center my-3 position-relative">
            <button
              onClick={status === "OUT" ? handleCheckIn : handleCheckOut}
              disabled={loading}
              className={`btn rounded-circle d-flex align-items-center justify-content-center shadow ${
                status === "OUT" ? "btn-success" : "btn-danger"
              }`}
              style={{
                width: "140px",
                height: "140px",
                fontSize: "18px",
                border: "6px solid #e9ecef",
                transition: "0.3s",
                zIndex: 2,
              }}
            >
              {loading
                ? "Processing..."
                : status === "OUT"
                  ? "Check In"
                  : "Check Out"}
            </button>

            {/* 🔥 PROGRESS RING */}
            {progress > 0 && (
              <div
                className="progress-ring"
                style={{
                  background: `conic-gradient(#198754 ${progress}%, #dee2e6 ${progress}%)`,
                }}
              />
            )}
          </div>

          {/* STATUS BADGE */}
          <div className="text-center mb-3">
            <span
              className={`badge px-3 py-2 ${
                attendance?.status === "FULL_DAY"
                  ? "bg-success"
                  : attendance?.status === "HALF_DAY"
                    ? "bg-warning text-dark"
                    : "bg-secondary"
              }`}
            >
              {attendance?.status || "No Data"}
            </span>
          </div>

          {/* CARD STATS */}

          <div
            className="d-flex justify-content-between align-items-center p-3 mb-3 shadow-sm"
            style={{
              background: "linear-gradient(135deg, #f8f9fa, #ffffff)",
              borderRadius: "18px",
            }}
          >
            <Tooltip id="location-tooltip" />
            {/* IN */}
            <div className="text-start">
              <p className="mb-2 text-success fw-semibold">IN</p>

              {attendance?.attendanceLogs
                ?.filter((log: any) => log.type === "IN")
                .map((log: any) => (
                  <div
                    key={log.id}
                    className="mb-2 p-2"
                    style={{
                      background: "#e9f7ef",
                      borderRadius: "10px",
                    }}
                  >
                    <div className="fw-semibold small text-dark">
                      ⏱ {formatTime(log.time)}
                    </div>

                    {/* <div className="d-flex gap-2 mt-1">
                      <span className="badge bg-light text-dark border">
                        📍{" "}
                        {log.latitude !== null
                          ? Number(log.latitude).toFixed(2)
                          : "N/A"}
                      </span>
                      <span className="badge bg-light text-dark border">
                        🌍{" "}
                        {log.longitude !== null
                          ? Number(log.longitude).toFixed(2)
                          : "N/A"}
                      </span>
                    </div> */}

                    <span
                      data-tooltip-id="location-tooltip"
                      data-tooltip-content={addresses[log.id] || "Loading..."}
                      onMouseEnter={async () => {
                        if (
                          !addresses[log.id] &&
                          log.latitude &&
                          log.longitude
                        ) {
                          try {
                            const addr = await getAddress(
                              log.latitude,
                              log.longitude,
                            );
                            setAddresses((prev) => ({
                              ...prev,
                              [log.id]: addr,
                            }));
                          } catch {
                            setAddresses((prev) => ({
                              ...prev,
                              [log.id]: "Failed to load",
                            }));
                          }
                        }
                      }}
                      className="badge bg-light text-dark border"
                      style={{ cursor: "pointer" }}
                    >
                      🌍{" "}
                      {log.latitude ? Number(log.latitude).toFixed(2) : "N/A"},{" "}
                      {log.longitude ? Number(log.longitude).toFixed(2) : "N/A"}
                    </span>
                  </div>
                ))}
            </div>

            {/* TOTAL */}
            <div className="text-center px-2">
              <p className="mb-1 fw-semibold text-muted">Total</p>
              <h5 className="fw-bold text-primary">
                {attendance?.total_work_minutes
                  ? `${Math.floor(attendance.total_work_minutes / 60)}h ${
                      attendance.total_work_minutes % 60
                    }m`
                  : "0h 0m"}
              </h5>
            </div>

            {/* OUT */}
            <div className="text-end">
              <p className="mb-2 text-danger fw-semibold">OUT</p>

              {attendance?.attendanceLogs
                ?.filter((log: any) => log.type === "OUT")
                .map((log: any) => (
                  <div
                    key={log.id}
                    className="mb-2 p-2"
                    style={{
                      background: "#fdecea",
                      borderRadius: "10px",
                    }}
                  >
                    <div className="fw-semibold small text-dark">
                      ⏱ {formatTime(log.time)}
                    </div>

                    <div className="d-flex justify-content-end gap-2 mt-1">
                      <span
                        data-tooltip-id="location-tooltip"
                        data-tooltip-content={addresses[log.id] || "Loading..."}
                        onMouseEnter={async () => {
                          if (
                            !addresses[log.id] &&
                            log.latitude &&
                            log.longitude
                          ) {
                            try {
                              const addr = await getAddress(
                                log.latitude,
                                log.longitude,
                              );
                              setAddresses((prev) => ({
                                ...prev,
                                [log.id]: addr,
                              }));
                            } catch {
                              setAddresses((prev) => ({
                                ...prev,
                                [log.id]: "Failed to load",
                              }));
                            }
                          }
                        }}
                        className="badge bg-light text-dark border"
                        style={{ cursor: "pointer" }}
                      >
                        🌍{" "}
                        {log.latitude ? Number(log.latitude).toFixed(2) : "N/A"}
                        ,{" "}
                        {log.longitude
                          ? Number(log.longitude).toFixed(2)
                          : "N/A"}
                      </span>
                    </div>
                    {/* <p>📍 {addresses[log.id] || "Loading..."}</p> */}
                  </div>
                ))}
            </div>
          </div>
          {/* LOG TIMELINE */}
          {/* <div
        className="p-3"
        style={{
          background: "#ffffff",
          borderRadius: "15px",
          border: "1px solid #eee",
          maxHeight: "150px",
          overflowY: "auto",
        }}
      >
        <p className="fw-bold mb-2">Activity</p>

        {attendance?.attendanceLogs?.length > 0 ? (
          attendance.attendanceLogs.map((log: any) => (
            <div
              key={log.id}
              className="d-flex justify-content-between align-items-center mb-2"
            >
              <span
                className={`badge ${
                  log.type === "IN" ? "bg-success" : "bg-danger"
                }`}
              >
                {log.type}
              </span>
              <small className="text-muted">
                {formatTime(log.time)}
              </small>
            </div>
          ))
        ) : (
          <p className="text-muted mb-0">No activity</p>
        )}
      </div> */}
        </div>
      </div>
      <style jsx>{`
        .progress-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);

          width: 160px;
          height: 160px;
          border-radius: 50%;

          z-index: 1;
          transition: 0.3s ease;
        }

        /* 🔥 FIX: translate + rotate ek sathe */
        @keyframes spin {
          0% {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          100% {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }
      `}</style>
    </>
  );
};

export default Attendance;
