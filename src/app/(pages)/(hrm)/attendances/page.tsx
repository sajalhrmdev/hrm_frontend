"use client";

import React, { useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { useFakeProgress } from "@/hooks/useFakeProgress";
import { Tooltip } from "react-tooltip";
import MonthlyAttendance from "@/compo/MonthlyAttendance";


const Attendance = () => {
  const [showMonthly, setShowMonthly] = useState(false);

  const [time, setTime] = useState(new Date());

  const [loading, setLoading] = useState(false);

  const [attendance, setAttendance] = useState<any>(null);

  const [addresses, setAddresses] = useState<{
    [key: number]: string;
  }>({});

  // ✅ backend driven
  const [nextAction, setNextAction] = useState<
    "CHECK_IN" | "CHECK_OUT"
  >("CHECK_IN");

  // ============================================
  // LOCATION
  // ============================================

  const getLocation = async () => {
    const pos = await new Promise<GeolocationPosition>(
      (resolve, reject) =>
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
        ),
    );

    return {
      latitude: pos.coords.latitude,

      longitude: pos.coords.longitude,

      accuracy: pos.coords.accuracy,
    };
  };

  // ============================================
  // ADDRESS
  // ============================================

  const getAddress = async (
    lat: number,
    lng: number,
  ) => {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyBc19C3Weqk97CdYInTUlLlbwBN_MqjLI8`,
    );

    const data = await res.json();

    return (
      data.results?.[0]?.formatted_address ||
      "Unknown"
    );
  };

  // ============================================
  // FETCH TODAY ATTENDANCE
  // ============================================

  const fetchTodayAttendance = async () => {
    try {
      const res =
        await axiosInstance.get(
          `/attendance/today`,
        );

      setAttendance(
        res.data.data || null,
      );

      setNextAction(
        res.data.nextAction ||
          "CHECK_IN",
      );
    } catch (err) {
      console.error(err);
    }
  };

  // ============================================
  // CLOCK + FETCH
  // ============================================

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    fetchTodayAttendance();

    getLocation();

    return () =>
      clearInterval(interval);
  }, []);

  // ============================================
  // ATTENDANCE ACTION
  // ============================================

  const handleAttendance =
    async () => {
      try {
        setLoading(true);

        const {
          latitude,
          longitude,
          accuracy,
        } = await getLocation();

        const endpoint =
          nextAction ===
          "CHECK_IN"
            ? "/attendance/check-in"
            : "/attendance/check-out";

        await axiosInstance.post(
          endpoint,
          {
            latitude,
            longitude,
            accuracy,
          },
        );

        await fetchTodayAttendance();
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

  // ============================================
  // FORMAT
  // ============================================

  const formatTime = (date: any) =>
    new Date(date).toLocaleTimeString(
      "en-GB",
      {
        hour12: false,
      },
    );

  const formatDate = (date: Date) =>
    date.toDateString();

  // ============================================
  // PROGRESS
  // ============================================

  const progress =
    useFakeProgress(loading);

  return (
    <>
      <div className="container d-flex justify-content-center align-items-center vh-100 bg-light">
        <div
          className="card border-0 shadow-lg p-4"
          style={{
            width: "420px",

            borderRadius: "20px",

            background:
              "linear-gradient(135deg, #56bef2, #ffffff)",
          }}
        >
          {/* HEADER */}

          <div className="text-center mb-3">
            <button
              className="btn btn-primary mb-3"
              onClick={() =>
                setShowMonthly(
                  (prev) => !prev,
                )
              }
            >
              {showMonthly
                ? " Close Attendance"
                : "📅 View Monthly Attendance"}
            </button>

            <h5
              className="fw-bold mb-2"
              style={{
                background:
                  "linear-gradient(90deg, #5c19ed, #f10972)",

                WebkitBackgroundClip:
                  "text",

                WebkitTextFillColor:
                  "transparent",
              }}
            >
              {
                attendance?.company
                  ?.slug
              }
            </h5>

            <h5
              className="fw-bold mb-2"
              style={{
                background:
                  "linear-gradient(90deg, #ff6600, #f10972)",

                WebkitBackgroundClip:
                  "text",

                WebkitTextFillColor:
                  "transparent",
              }}
            >
              Welcome,{" "}
              {attendance?.employee
                ?.name || "User"}{" "}
              👋
            </h5>

            <h4 className="fw-bold text-dark">
              Attendance
            </h4>

            <small className="text-muted">
              {formatDate(time)}
            </small>
          </div>

          {/* LIVE TIME */}

          <h1
            className="text-center fw-bold mb-3"
            style={{
              letterSpacing: "2px",
            }}
          >
            {formatTime(time)}
          </h1>

          {/* BUTTON */}

          <div className="d-flex justify-content-center my-3 position-relative">
            <button
              onClick={
                handleAttendance
              }
              disabled={loading}
              className={`btn rounded-circle d-flex align-items-center justify-content-center shadow ${
                nextAction ===
                "CHECK_IN"
                  ? "btn-success"
                  : "btn-danger"
              }`}
              style={{
                width: "140px",

                height: "140px",

                fontSize: "18px",

                border:
                  "6px solid #e9ecef",

                transition: "0.3s",

                zIndex: 2,
              }}
            >
              {loading
                ? "Processing..."
                : nextAction ===
                  "CHECK_IN"
                ? "Check In"
                : "Check Out"}
            </button>

            {/* PROGRESS */}

            {progress > 0 && (
              <div
                className="progress-ring"
                style={{
                  background: `conic-gradient(#198754 ${progress}%, #dee2e6 ${progress}%)`,
                }}
              />
            )}
          </div>

          {/* STATUS */}

          {/* STATUS */}

<div className="text-center mb-3">
  <span
    className={`badge px-3 py-2 attendance-status-badge ${

      attendance?.status ===
      "PRESENT"

        ? "bg-success"

        : attendance?.status ===
          "HALF_DAY"

        ? "bg-warning text-dark"

        : attendance?.status ===
          "ABSENT"

        ? "bg-danger"

        : attendance?.status ===
          "PAID_LEAVE"

        ? "bg-primary"

        : attendance?.status ===
          "UNPAID_LEAVE"

        ? "bg-dark"

        : attendance?.status ===
          "WEEKLY_OFF"

        ? "attendance-weekly-off"

        : attendance?.status ===
          "HOLIDAY"

        ? "attendance-holiday"

        : attendance?.status ===
          "ON_DUTY"

        ? "attendance-on-duty"

        : attendance?.status ===
          "WORK_FROM_HOME"

        ? "attendance-wfh"

        : "bg-secondary"
    }`}
  >
    {
      attendance?.status ||
      "No Data"
    }
  </span>
</div>

          {/* SHIFT */}

          {attendance?.shift && (
            <div className="text-center mb-3">
              <span className="badge bg-dark px-3 py-2">
                🕒{" "}
                {
                  attendance.shift
                    .title
                }{" "}
                |{" "}
                {
                  attendance.shift
                    .startTime
                }
                -
                {
                  attendance.shift
                    .endTime
                }
              </span>
            </div>
          )}

          {/* STATS */}

          <div
            className="d-flex justify-content-between align-items-center p-3 mb-3 shadow-sm"
            style={{
              background:
                "linear-gradient(135deg, #f8f9fa, #ffffff)",

              borderRadius: "18px",
            }}
          >
            <Tooltip id="location-tooltip" />

            {/* IN */}

            <div className="text-start">
              <p className="mb-2 text-success fw-semibold">
                IN
              </p>

              {attendance?.attendanceLogs
                ?.filter(
                  (log: any) =>
                    log.type ===
                    "IN",
                )
                .map((log: any) => (
                  <div
                    key={log.id}
                    className="mb-2 p-2"
                    style={{
                      background:
                        "#e9f7ef",

                      borderRadius:
                        "10px",
                    }}
                  >
                    <div className="fw-semibold small text-dark">
                      ⏱{" "}
                      {formatTime(
                        log.time,
                      )}
                    </div>

                    <span
                      data-tooltip-id="location-tooltip"
                      data-tooltip-content={
                        addresses[
                          log.id
                        ] ||
                        "Loading..."
                      }
                      onMouseEnter={async () => {
                        if (
                          !addresses[
                            log.id
                          ] &&
                          log.latitude &&
                          log.longitude
                        ) {
                          try {
                            const addr =
                              await getAddress(
                                log.latitude,
                                log.longitude,
                              );

                            setAddresses(
                              (
                                prev,
                              ) => ({
                                ...prev,

                                [log.id]:
                                  addr,
                              }),
                            );
                          } catch {
                            setAddresses(
                              (
                                prev,
                              ) => ({
                                ...prev,

                                [log.id]:
                                  "Failed to load",
                              }),
                            );
                          }
                        }
                      }}
                      className="badge bg-light text-dark border"
                      style={{
                        cursor:
                          "pointer",
                      }}
                    >
                      🌍{" "}
                      {log.latitude
                        ? Number(
                            log.latitude,
                          ).toFixed(
                            2,
                          )
                        : "N/A"}
                      ,{" "}
                      {log.longitude
                        ? Number(
                            log.longitude,
                          ).toFixed(
                            2,
                          )
                        : "N/A"}
                    </span>
                  </div>
                ))}
            </div>

            {/* TOTAL */}

            <div className="text-center px-2">
              <p className="mb-1 fw-semibold text-muted">
                Total
              </p>

              <h5 className="fw-bold text-primary">
                {attendance?.total_work_minutes
                  ? `${Math.floor(
                      attendance.total_work_minutes /
                        60,
                    )}h ${
                      attendance.total_work_minutes %
                      60
                    }m`
                  : "0h 0m"}
              </h5>

              {/* NEW */}

              <div className="text-center mt-2">
                <small className="text-muted">
                  Late:{" "}
                  {attendance?.late_minutes ||
                    0}
                  m | OT:{" "}
                  {attendance?.overtime_minutes ||
                    0}
                  m
                </small>
              </div>
            </div>

            {/* OUT */}

            <div className="text-end">
              <p className="mb-2 text-danger fw-semibold">
                OUT
              </p>

              {attendance?.attendanceLogs
                ?.filter(
                  (log: any) =>
                    log.type ===
                    "OUT",
                )
                .map((log: any) => (
                  <div
                    key={log.id}
                    className="mb-2 p-2"
                    style={{
                      background:
                        "#fdecea",

                      borderRadius:
                        "10px",
                    }}
                  >
                    <div className="fw-semibold small text-dark">
                      ⏱{" "}
                      {formatTime(
                        log.time,
                      )}
                    </div>

                    <div className="d-flex justify-content-end gap-2 mt-1">
                      <span
                        data-tooltip-id="location-tooltip"
                        data-tooltip-content={
                          addresses[
                            log.id
                          ] ||
                          "Loading..."
                        }
                        onMouseEnter={async () => {
                          if (
                            !addresses[
                              log.id
                            ] &&
                            log.latitude &&
                            log.longitude
                          ) {
                            try {
                              const addr =
                                await getAddress(
                                  log.latitude,
                                  log.longitude,
                                );

                              setAddresses(
                                (
                                  prev,
                                ) => ({
                                  ...prev,

                                  [log.id]:
                                    addr,
                                }),
                              );
                            } catch {
                              setAddresses(
                                (
                                  prev,
                                ) => ({
                                  ...prev,

                                  [log.id]:
                                    "Failed to load",
                                }),
                              );
                            }
                          }
                        }}
                        className="badge bg-light text-dark border"
                        style={{
                          cursor:
                            "pointer",
                        }}
                      >
                        🌍{" "}
                        {log.latitude
                          ? Number(
                              log.latitude,
                            ).toFixed(
                              2,
                            )
                          : "N/A"}
                        ,{" "}
                        {log.longitude
                          ? Number(
                              log.longitude,
                            ).toFixed(
                              2,
                            )
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* MONTHLY */}

        {showMonthly && (
          <div>
            <MonthlyAttendance />
          </div>
        )}
      </div>

      {/* STYLE */}

      <style jsx>{`
  .progress-ring {
    position: absolute;

    top: 50%;

    left: 50%;

    transform: translate(
      -50%,
      -50%
    );

    width: 160px;

    height: 160px;

    border-radius: 50%;

    z-index: 1;

    transition: 0.3s ease;
  }

  .attendance-status-badge{
    font-size:14px;
    border-radius:999px;
    letter-spacing:.4px;
  }

  .attendance-weekly-off{
    background:#0ea5e9 !important;
    color:#fff !important;
  }

  .attendance-holiday{
    background:#6b7280 !important;
    color:#fff !important;
  }

  .attendance-on-duty{
    background:#9333ea !important;
    color:#fff !important;
  }

  .attendance-wfh{
    background:#06b6d4 !important;
    color:#fff !important;
  }

  @keyframes spin {
    0% {
      transform: translate(
          -50%,
          -50%
        )
        rotate(0deg);
    }

    100% {
      transform: translate(
          -50%,
          -50%
        )
        rotate(360deg);
    }
  }
`}</style>
    </>
  );
};

export default Attendance;