"use client";

import React, { useEffect, useRef, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { useFakeProgress } from "@/hooks/useFakeProgress";
import { Tooltip } from "react-tooltip";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";
import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";
import Webcam from "react-webcam";

type FacePoint = { x: number; y: number };

const LEFT_EYE = [362, 385, 387, 263, 373, 380];
const RIGHT_EYE = [33, 160, 158, 133, 153, 144];

const Attendance = () => {
  const webcamRef = useRef<Webcam>(null);
  const detectorRef =
    useRef<faceLandmarksDetection.FaceLandmarksDetector | null>(null);

  const eyeClosedRef = useRef(false);
  const blinkVerifiedRef = useRef(false);
  const submitTriggeredRef = useRef(false);
  const closedFramesRef = useRef(0);
  const detectingRef = useRef(false);
  const earBaselineRef = useRef<number | null>(null);
  const earSamplesRef = useRef<number[]>([]);
  const closedAtRef = useRef<number | null>(null);
  const modeStartRef = useRef(0);

  const [attendanceMode, setAttendanceMode] = useState(false);
  const [eyeClosed, setEyeClosed] = useState(false);
  const [blinkVerified, setBlinkVerified] = useState(false);
  const [instruction, setInstruction] = useState("Face camera to continue");
  const [showSkipBlink, setShowSkipBlink] = useState(false);
  const [time, setTime] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [attendance, setAttendance] = useState<any>(null);
  const [addresses, setAddresses] = useState<{ [key: number]: string }>({});
  const [nextAction, setNextAction] = useState<"CHECK_IN" | "CHECK_OUT">(
    "CHECK_IN",
  );
  const [selectedMethod, setSelectedMethod] = useState<"FACE" | "NORMAL">("FACE");
  const [allowedMethods, setAllowedMethods] = useState<string[]>(["FACE"]);
  const [methodChosen, setMethodChosen] = useState(false);

  const googleMapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAP_KEY;

  const distance = (a: FacePoint, b: FacePoint) =>
    Math.hypot(a.x - b.x, a.y - b.y);

  const eyeAspectRatio = (eye: FacePoint[]) => {
    const vertical1 = distance(eye[1], eye[5]);
    const vertical2 = distance(eye[2], eye[4]);
    const horizontal = distance(eye[0], eye[3]);

    if (!horizontal) return 0;
    return (vertical1 + vertical2) / (2 * horizontal);
  };

  const getLocation = async () => {
    return await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    }).then((pos) => ({
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
    }));
  };

  const getAddress = async (lat: number, lng: number) => {
    if (!googleMapsKey) return "Unknown";

    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleMapsKey}`,
    );

    const data = await res.json();
    return data.results?.[0]?.formatted_address || "Unknown";
  };

  const fetchTodayAttendance = async () => {
    try {
      const res = await axiosInstance.get(`/attendance/today`);
      setAttendance(res.data.data || null);
      setNextAction(res.data.nextAction || "CHECK_IN");
      const methods = res.data.allowedMethods || ["FACE"];
      setAllowedMethods(methods);
      if (methods.length === 1) {
        setSelectedMethod(methods[0] as "FACE" | "NORMAL");
        setMethodChosen(true);
      } else if (methods.includes("NORMAL")) {
        setSelectedMethod("NORMAL");
        setMethodChosen(false);
      } else {
        setMethodChosen(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const resetBlinkState = () => {
    eyeClosedRef.current = false;
    blinkVerifiedRef.current = false;
    submitTriggeredRef.current = false;
    closedFramesRef.current = 0;
    earBaselineRef.current = null;
    earSamplesRef.current = [];
    closedAtRef.current = null;

    setEyeClosed(false);
    setBlinkVerified(false);
    setShowSkipBlink(false);
  };

  useEffect(() => {
    const init = async () => {
      await tf.setBackend("webgl");
      await tf.ready();

      const detector = await faceLandmarksDetection.createDetector(
        faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
        {
          runtime: "tfjs",
          maxFaces: 1,
          refineLandmarks: false,
        },
      );

      detectorRef.current = detector;
    };

    init();

    return () => {
      detectorRef.current?.dispose?.();
      detectorRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!attendanceMode) return;

    // fresh calibration for every attempt
    earSamplesRef.current = [];
    earBaselineRef.current = null;
    closedAtRef.current = null;
    modeStartRef.current = Date.now();
    setShowSkipBlink(false);

    let stopped = false;

    let timer: ReturnType<typeof setTimeout> | null = null;

    const tick = async () => {
      try {
        if (!webcamRef.current || !detectorRef.current) return;
        if (blinkVerifiedRef.current || submitTriggeredRef.current) return;

        // 🔒 busy guard: never overlap two inferences (mobile GPUs are slow —
        // overlapping calls pile up and each gets slower, missing blinks)
        if (detectingRef.current) return;

        const video = webcamRef.current.video as HTMLVideoElement | null;
        if (!video || video.readyState < 2) return;

        detectingRef.current = true;

        const faces = await detectorRef.current.estimateFaces(video);

        detectingRef.current = false;

        if (!faces.length) {
          setInstruction("Look at camera");
          return;
        }

        const points = faces[0].keypoints as FacePoint[];

        // face-size hint: tiny face in frame = unreliable EAR on mobile
        let tooFar = false;
        try {
          const xs = points.map((p) => p.x);
          const faceW = Math.max(...xs) - Math.min(...xs);
          const vw = video.videoWidth || 1;
          tooFar = faceW / vw < 0.15;
        } catch {
          tooFar = false;
        }

        const leftEye = LEFT_EYE.map((i) => points[i]).filter(Boolean);
        const rightEye = RIGHT_EYE.map((i) => points[i]).filter(Boolean);

        if (leftEye.length !== 6 || rightEye.length !== 6) return;

        const leftEAR = eyeAspectRatio(leftEye);
        const rightEAR = eyeAspectRatio(rightEye);
        const ear = (leftEAR + rightEAR) / 2;

        // adaptive baseline: mean of open-state EARs (device/distance independent)
        if (!eyeClosedRef.current && ear > 0.12 && ear < 0.6) {
          const samples = earSamplesRef.current;
          samples.push(ear);
          if (samples.length > 20) samples.shift();
          if (samples.length >= 6) {
            earBaselineRef.current =
              samples.reduce((a, b) => a + b, 0) / samples.length;
          }
        }

        const baseline = earBaselineRef.current;
        const CLOSED_THRESHOLD = baseline
          ? Math.max(0.16, baseline * 0.75)
          : 0.26;
        const OPEN_THRESHOLD = baseline ? baseline * 0.88 : 0.3;

        if (!eyeClosedRef.current && ear < CLOSED_THRESHOLD && ear < 0.38) {
          closedFramesRef.current = 1;
          eyeClosedRef.current = true;
          closedAtRef.current = Date.now();
          setEyeClosed(true);
        }

        // un-stick a false "closed" latch (bad threshold / drift)
        if (
          eyeClosedRef.current &&
          closedAtRef.current &&
          Date.now() - closedAtRef.current > 2500
        ) {
          eyeClosedRef.current = false;
          closedAtRef.current = null;
          setEyeClosed(false);
        }

        if (
          eyeClosedRef.current &&
          closedFramesRef.current >= 1 &&
          ear > OPEN_THRESHOLD
        ) {
          blinkVerifiedRef.current = true;
          setBlinkVerified(true);
          setInstruction("Verifying...");
        } else if (!blinkVerifiedRef.current) {
          setInstruction(
            tooFar ? "Move closer to camera" : "Please blink your eyes",
          );
        }

        // give up -> offer NORMAL fallback after 30s of trying
        if (
          !blinkVerifiedRef.current &&
          Date.now() - modeStartRef.current > 30000
        ) {
          setShowSkipBlink(true);
        }
      } catch (e) {
        detectingRef.current = false;

        console.error(e);
      } finally {
        // adaptive pace: next tick only after this one finished (+60ms breather)
        if (!stopped) {
          timer = setTimeout(tick, 60);
        }
      }
    };

    timer = setTimeout(tick, 60);

    return () => {
      stopped = true;

      if (timer) clearTimeout(timer);
    };
  }, [attendanceMode, blinkVerified]);

  useEffect(() => {
    if (
      !attendanceMode ||
      !blinkVerified ||
      loading ||
      submitTriggeredRef.current
    ) {
      return;
    }

    submitTriggeredRef.current = true;

    const timer = setTimeout(() => {
      handleAttendance();
    }, 500);

    return () => clearTimeout(timer);
  }, [attendanceMode, blinkVerified, loading]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    fetchTodayAttendance();

    return () => clearInterval(interval);
  }, []);

  const handleAttendance = async () => {
    if (loading) return;

    try {
      setLoading(true);

      if (!blinkVerifiedRef.current) {
        throw new Error("Please blink your eyes first");
      }

      if (!webcamRef.current) {
        throw new Error("Camera not ready");
      }

      const imageSrc = webcamRef.current.getScreenshot();

      if (!imageSrc) {
        throw new Error("Failed to capture image");
      }

      const imageResponse = await fetch(imageSrc);
      const blob = await imageResponse.blob();
      const { latitude, longitude, accuracy } = await getLocation();

      const formData = new FormData();
      formData.append("image", blob, "attendance.jpg");
      formData.append("latitude", String(latitude));
      formData.append("longitude", String(longitude));
      formData.append("accuracy", String(accuracy));
      formData.append("method", "FACE");

      const endpoint =
        nextAction === "CHECK_IN"
          ? "/attendance/check-in"
          : "/attendance/check-out";

      await axiosInstance.post(endpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      closedFramesRef.current = 0;
      eyeClosedRef.current = false;
      blinkVerifiedRef.current = false;
      submitTriggeredRef.current = false;
      setInstruction("Attendance Successful ✅");
      setAttendanceMode(false);
      resetBlinkState();

      await fetchTodayAttendance();
    } catch (err: any) {
      console.error(err);

      submitTriggeredRef.current = false;
      blinkVerifiedRef.current = false;
      eyeClosedRef.current = false;
      closedFramesRef.current = 0;

      setBlinkVerified(false);
      setEyeClosed(false);
      setInstruction("Please blink your eyes again");

      alert(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNormalAttendance = async () => {
    if (loading) return;
    try {
      setLoading(true);
      const { latitude, longitude, accuracy } = await getLocation();
      const endpoint =
        nextAction === "CHECK_IN"
          ? "/attendance/check-in"
          : "/attendance/check-out";
      await axiosInstance.post(endpoint, {
        latitude,
        longitude,
        accuracy,
        method: "NORMAL",
      });
      setAttendanceMode(false);
      resetBlinkState();
      setInstruction("Attendance Successful ✅");
      await fetchTodayAttendance();
    } catch (err: any) {
      alert(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date: any) =>
    new Date(date).toLocaleTimeString("en-GB", {
      hour12: true,
    });

  const formatDate = (date: Date) => date.toDateString();

  const progress = useFakeProgress(loading);

  return (
    <>
      <div className="container d-flex justify-content-center align-items-center vh-100" style={{ background: "linear-gradient(135deg, #eff6ff 0%, #ecfeff 35%, #f0fdfa 70%, #e0f2fe 100%)" }}>
        <div
          className="card border-0 shadow-lg p-4"
          style={{
            width: "420px",
            borderRadius: "20px",
            background: "linear-gradient(135deg, #56bef2, #ffffff)",
          }}
        >
          <div className="text-center mb-1">
            {/* <h5
              className="fw-bold mb-2"
              style={{
                background: "linear-gradient(90deg, #5c19ed, #f10972)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {attendance?.company?.slug}
            </h5> */}

            <h5
              className="fw-bold "
              style={{
                background: "linear-gradient(90deg, #ff6600, #f10972)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Welcome, {attendance?.employee?.name || "User"} 👋
            </h5>

            <small className="text-muted">{formatDate(time)}</small>
          </div>

          <h1
            className="text-center fw-bold mb-1"
            style={{ letterSpacing: "2px" }}
          >
            {formatTime(time)}
          </h1>

          {!attendanceMode && (allowedMethods.length >= 2 || allowedMethods.includes("NORMAL")) && (
            <div className="d-flex gap-2 justify-content-center mb-3">
              {allowedMethods.includes("FACE") && (
                <button
                  className={`btn btn-sm ${selectedMethod === "FACE" ? "btn-primary" : "btn-outline-primary"}`}
                  onClick={() => { setSelectedMethod("FACE"); setMethodChosen(true); }}
                >
                  📸 Face
                </button>
              )}
              {allowedMethods.includes("NORMAL") && (
                <button
                  className={`btn btn-sm ${selectedMethod === "NORMAL" ? "btn-success" : "btn-outline-success"}`}
                  onClick={() => { setSelectedMethod("NORMAL"); setMethodChosen(true); }}
                >
                  ✅ Normal
                </button>
              )}
            </div>
          )}

          {!attendanceMode && (
            <button
              className="btn btn-primary"
              disabled={allowedMethods.length > 1 && !methodChosen}
              onClick={() => {
                if (selectedMethod === "NORMAL") {
                  handleNormalAttendance();
                } else {
                  setAttendanceMode(true);
                  resetBlinkState();
                  setInstruction("Please look at camera");
                }
              }}
            >
              Start Attendance
            </button>
          )}

          {attendanceMode && (
            <div
              className="text-center mt-1 mb-1"
              style={{
                animation: "pulseInstruction 1.5s infinite",
              }}
            >
              <div
                className="d-inline-flex align-items-center gap-2 px-4 py-2"
                style={{
                  background:
                    instruction === "Verifying..."
                      ? "linear-gradient(135deg,#ff9800,#ff5722)"
                      : "linear-gradient(135deg,#dc3545,#ff6b6b)",
                  color: "#fff",
                  borderRadius: "999px",
                  fontWeight: 600,
                  fontSize: "15px",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
                }}
              >
                <span style={{ fontSize: "18px" }}>
                  {instruction === "Verifying..."
                    ? "⏳"
                    : instruction === "Attendance Successful ✅"
                      ? "✅"
                      : "👀"}
                </span>

                <span>{instruction}</span>
              </div>
            </div>
          )}

          {attendanceMode &&
            showSkipBlink &&
            allowedMethods.includes("NORMAL") && (
              <div className="text-center mb-2">
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => {
                    setAttendanceMode(false);
                    resetBlinkState();
                    setSelectedMethod("NORMAL");
                    setMethodChosen(true);
                    setInstruction("Trying without blink check...");
                    handleNormalAttendance();
                  }}
                >
                  Skip blink check — use Normal instead
                </button>
              </div>
            )}

          <div className="d-flex justify-content-center my-3 align-items-center gap-3">
            <div className="position-relative">
              <button
                type="button"
                disabled
                className={`btn rounded-circle d-flex align-items-center justify-content-center shadow ${
                  nextAction === "CHECK_IN" ? "btn-success" : "btn-danger"
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
                  : nextAction === "CHECK_IN"
                    ? "Check In"
                    : "Check Out"}
              </button>

              {progress > 0 && (
                <div
                  className="progress-ring"
                  style={{
                    background: `conic-gradient(#198754 ${progress}%, #dee2e6 ${progress}%)`,
                  }}
                />
              )}
            </div>

            {attendanceMode && selectedMethod === "FACE" && (
              <div className="webcam-circle">
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  width={140}
                  height={140}
                  videoConstraints={{
                    facingMode: "user",
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                  }}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
            )}
          </div>

          <div className="text-center mb-1">
            <span
              className={`badge px-3 py-2 attendance-status-badge ${
                attendance?.status === "PRESENT"
                  ? "bg-success"
                  : attendance?.status === "HALF_DAY"
                    ? "bg-warning text-dark"
                    : attendance?.status === "ABSENT"
                      ? "bg-danger"
                      : attendance?.status === "PAID_LEAVE"
                        ? "bg-primary"
                        : attendance?.status === "UNPAID_LEAVE"
                          ? "bg-dark"
                          : attendance?.status === "WEEKLY_OFF"
                            ? "attendance-weekly-off"
                            : attendance?.status === "HOLIDAY"
                              ? "attendance-holiday"
                              : attendance?.status === "ON_DUTY"
                                ? "attendance-on-duty"
                                : attendance?.status === "WORK_FROM_HOME"
                                  ? "attendance-wfh"
                                  : "bg-secondary"
              }`}
            >
              {attendance?.status || "No Data"}
            </span>
          </div>

          {attendance?.shift && (
            <div className="text-center mb-1">
              <span className="badge bg-dark px-3 py-2">
                🕒 {attendance.shift.title} | {attendance.shift.startTime}-
                {attendance.shift.endTime}
              </span>
            </div>
          )}

          <div
            className="d-flex justify-content-between align-items-center p-3 mb-1 shadow-sm"
            style={{
              background: "linear-gradient(135deg, #f8f9fa, #ffffff)",
              borderRadius: "18px",
            }}
          >
            <Tooltip id="location-tooltip" />

            <div className="text-start">
              <p className="mb-1 text-success fw-semibold">IN</p>

              {attendance?.attendanceLogs
                ?.filter((log: any) => log.type === "IN")
                .map((log: any) => (
                  <div
                    key={log.id}
                    className="mb-1 p-2"
                    style={{
                      background: "#e9f7ef",
                      borderRadius: "10px",
                    }}
                  >
                    <div className="fw-semibold small text-dark">
                      ⏱ {formatTime(log.time)}
                    </div>

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

            <div className="text-center px-2">
              <p className="mb-1 fw-semibold text-muted">Total</p>

              <h5 className="fw-bold text-primary">
                {attendance?.total_work_minutes
                  ? `${Math.floor(attendance.total_work_minutes / 60)}h ${
                      attendance.total_work_minutes % 60
                    }m`
                  : "0h 0m"}
              </h5>

              <div className="text-center mt-1">
                <small className="text-muted">
                  Late: {attendance?.late_minutes || 0}m | OT:{" "}
                  {attendance?.overtime_minutes || 0}m
                </small>
              </div>
            </div>

            <div className="text-end">
              <p className="mb-1 text-danger fw-semibold">OUT</p>

              {attendance?.attendanceLogs
                ?.filter((log: any) => log.type === "OUT")
                .map((log: any) => (
                  <div
                    key={log.id}
                    className="mb-1 p-2"
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
                  </div>
                ))}
            </div>
          </div>
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
          pointer-events: none;
        }
        @keyframes pulseInstruction {
          0% {
            transform: scale(1);
          }

          50% {
            transform: scale(1.04);
          }

          100% {
            transform: scale(1);
          }
        }
        .webcam-circle {
          width: 140px;
          height: 140px;
          border-radius: 50%;
          overflow: hidden;
          border: 5px solid #fff;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          flex-shrink: 0;
        }

        .attendance-status-badge {
          font-size: 14px;
          border-radius: 999px;
          letter-spacing: 0.4px;
        }

        .attendance-weekly-off {
          background: #0ea5e9 !important;
          color: #fff !important;
        }

        .attendance-holiday {
          background: #6b7280 !important;
          color: #fff !important;
        }

        .attendance-on-duty {
          background: #9333ea !important;
          color: #fff !important;
        }

        .attendance-wfh {
          background: #06b6d4 !important;
          color: #fff !important;
        }

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
