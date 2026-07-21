"use client";

import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import axiosFieldTrack from "@/utils/axiosFieldTrack";
import { reverseGeocode } from "@/utils/reverseGeocode";
import { useAuth } from "@/providers/AuthContext";
import "leaflet/dist/leaflet.css";

const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function MyLocation() {
  const { employee: hrmEmployee } = useAuth();
  const [fieldEmployeeId, setFieldEmployeeId] = useState<string | null>(null);
  const fieldEmployeeIdRef = useRef<string | null>(null);
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState<GeolocationCoordinates | null>(null);
  const [markerAddress, setMarkerAddress] = useState("");
  const checkInImageRef = useRef<HTMLInputElement>(null);
  const [checkInImagePreview, setCheckInImagePreview] = useState<string>("");
  const checkOutImageRef = useRef<HTMLInputElement>(null);
  const [checkOutImagePreview, setCheckOutImagePreview] = useState<string>("");
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [photoModalImages, setPhotoModalImages] = useState<{ checkInImage?: string; checkOutImage?: string }>({});
  const [photoLoading, setPhotoLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const gpsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!hrmEmployee?.id) return;
    const fetchFieldEmployee = async () => {
      try {
        const res = await axiosFieldTrack.get(`/employees/${hrmEmployee.id}`);
        const empId = res.data.data?.employeeId || null;
        setFieldEmployeeId(empId);
        fieldEmployeeIdRef.current = empId;

        if (empId) {
          const attRes = await axiosFieldTrack.get(`/attendance/employee/${empId}/today`);
          const attData = attRes.data?.data;
          if (attData && attData.status === "CHECKED_IN") {
            setCheckedIn(true);
            setCheckInTime(new Date(attData.checkInTime));
            const elapsed = Math.floor(
              (Date.now() - new Date(attData.checkInTime).getTime()) / 1000
            );
            setDuration(elapsed);
            startGpsTracking();
          }
        }
      } catch {
        console.error("Failed to fetch field employee");
      } finally {
        setLoading(false);
      }
    };
    fetchFieldEmployee();
  }, [hrmEmployee?.id]);

  useEffect(() => {
    let cancelled = false;
    const getPos = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (cancelled) return;
          console.log("Position acquired:", pos.coords);
          setPosition(pos.coords);
        },
        (err) => {
          if (cancelled) return;
          console.error("Geolocation error:", err);
          if (err.code === 1) {
            alert("Location access is required. Please enable GPS in your browser settings and refresh.");
          }
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 120000 }
      );
    };
    getPos();
    return () => { cancelled = true; };
  }, []);

  const startGpsTracking = () => {
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => setPosition(pos.coords),
      () => {},
      { enableHighAccuracy: true }
    );
    gpsIntervalRef.current = setInterval(() => {
      const empId = fieldEmployeeIdRef.current;
      if (!empId) return;
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            await axiosFieldTrack.post("/gps/location", {
              employeeId: empId,
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              speed: pos.coords.speed ?? undefined,
              accuracy: pos.coords.accuracy ?? undefined,
            });
          } catch (err: any) {
            if (err?.response?.status === 400) {
              stopGpsTracking();
              setCheckedIn(false);
              setCheckInTime(null);
              setDuration(0);
            }
          }
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 30000 }
      );
    }, 30000);
  };

  const stopGpsTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (gpsIntervalRef.current !== null) {
      clearInterval(gpsIntervalRef.current);
      gpsIntervalRef.current = null;
    }
  };

  useEffect(() => {
    if (!checkedIn) return;
    const timer = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [checkedIn]);

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>, type: "checkin" | "checkout") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      if (type === "checkin") setCheckInImagePreview(base64);
      else setCheckOutImagePreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleCheckIn = async () => {
    if (!fieldEmployeeId || !position) return;
    setCheckInLoading(true);
    try {
      await axiosFieldTrack.post("/attendance/check-in", {
        employeeId: fieldEmployeeId,
        latitude: position.latitude,
        longitude: position.longitude,
        checkInImage: checkInImagePreview || undefined,
      });
      setCheckedIn(true);
      setCheckInTime(new Date());
      setDuration(0);
      setCheckInImagePreview("");
      if (position) {
        await axiosFieldTrack.post("/gps/location", {
          employeeId: fieldEmployeeId,
          latitude: position.latitude,
          longitude: position.longitude,
        });
      }
      startGpsTracking();
    } catch {
      console.error("Check-in failed");
    } finally {
      setCheckInLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!fieldEmployeeId || !position) return;
    setCheckInLoading(true);
    try {
      await axiosFieldTrack.post("/attendance/check-out", {
        employeeId: fieldEmployeeId,
        latitude: position.latitude,
        longitude: position.longitude,
        checkOutImage: checkOutImagePreview || undefined,
      });
      setCheckedIn(false);
      setCheckInTime(null);
      setDuration(0);
      setCheckOutImagePreview("");
      stopGpsTracking();
    } catch {
      console.error("Check-out failed");
    } finally {
      setCheckInLoading(false);
    }
  };

  const formatDuration = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const center: [number, number] = position
    ? [position.latitude, position.longitude]
    : [23.685, 90.3563];

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="ft-page">
          <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
            <div className="my-auto mb-2">
              <h2 className="mb-1">My Live Location</h2>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <i className="ti ti-smart-home" />
                  </li>
                  <li className="breadcrumb-item">Field Track</li>
                  <li className="breadcrumb-item active">My Location</li>
                </ol>
              </nav>
            </div>
            <div className="d-flex my-xl-auto right-content align-items-center flex-wrap gap-2">
              {checkedIn && (
                <span className="ft-badge ft-badge-checkin">
                  <i className="ti ti-point-filled me-1 text-success" />
                  Checked In
                </span>
              )}
            </div>
          </div>

          {!position && checkedIn && (
            <div className="ft-alert">
              <i className="ti ti-alert-triangle me-2" />
              GPS signal weak — location may not update in real time.
            </div>
          )}

          <div className="row g-4">
            <div className="col-md-8">
              <div className="ft-map-card">
                <MapContainer
                  center={center}
                  zoom={15}
                  style={{ height: "100%", width: "100%", borderRadius: "18px" }}
                >
                  <MapController center={center} />
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {position && (
                    <Marker
                      position={[position.latitude, position.longitude]}
                      icon={icon}
                      eventHandlers={{
                        click: () => {
                          reverseGeocode(position.latitude, position.longitude).then(setMarkerAddress);
                        },
                      }}
                    >
                      <Popup>
                        <div className="ft-popup">
                          <strong>You are here</strong>
                          {markerAddress && (
                            <div className="fs-11 text-muted mt-1">
                              <i className="ti ti-map-pin me-1" />
                              {markerAddress}
                            </div>
                          )}
                          <div className="fs-12 text-muted mt-1">
                            {position.latitude.toFixed(4)}, {position.longitude.toFixed(4)}
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  )}
                </MapContainer>
              </div>
            </div>
            <div className="col-md-4">
              <div className={`ft-att-card ${checkedIn ? "ft-att-checked-in" : ""}`}>
                <div className="text-center">
                  <div className="ft-att-icon-wrap">
                    <span className={`ft-att-icon ${checkedIn ? "green" : "gray"}`}>
                      <i className={`ti ${checkedIn ? "ti-fingerprint" : "ti-fingerprint-off"}`} />
                    </span>
                  </div>
                  <h5 className="ft-att-title mt-3">Attendance</h5>

                  {checkedIn ? (
                    <>
                      <div className="ft-att-status success mb-3">
                        <i className="ti ti-point-filled me-1" />
                        Checked In
                      </div>
                      <div className="ft-att-time">
                        <p className="ft-att-label">Since</p>
                        <p className="ft-att-value-sm">{checkInTime?.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</p>
                      </div>
                      <div className="ft-att-time">
                        <p className="ft-att-label">Duration</p>
                        <p className="ft-att-duration">{formatDuration(duration)}</p>
                      </div>
                      <input
                        ref={checkOutImageRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="d-none"
                        onChange={(e) => handleImageCapture(e, "checkout")}
                      />
                      <div className="d-flex gap-2 mt-3">
                        <button
                          className="ft-btn-outline-secondary flex-fill"
                          onClick={() => checkOutImageRef.current?.click()}
                          disabled={checkInLoading}
                        >
                          <i className="ti ti-camera me-1" />
                          Odometer
                        </button>
                        <button
                          className="ft-btn-outline-danger flex-fill"
                          onClick={handleCheckOut}
                          disabled={checkInLoading}
                        >
                          {checkInLoading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <i className="ti ti-logout me-2" />
                              Check Out
                            </>
                          )}
                        </button>
                      </div>
                      {checkOutImagePreview && (
                        <div className="ft-image-preview mt-2">
                          <img src={checkOutImagePreview} alt="Odometer" />
                          <i className="ti ti-x ft-image-remove" onClick={() => setCheckOutImagePreview("")} />
                        </div>
                      )}
                      <button
                        className="ft-btn-ghost w-100 mt-2"
                        onClick={async () => {
                          if (!fieldEmployeeIdRef.current) return;
                          setPhotoLoading(true);
                          try {
                            const res = await axiosFieldTrack.get(`/attendance/employee/${fieldEmployeeIdRef.current}/today`);
                            const att = res.data?.data;
                            setPhotoModalImages({
                              checkInImage: att?.checkInImage || undefined,
                              checkOutImage: att?.checkOutImage || undefined,
                            });
                            setPhotoModalOpen(true);
                          } catch {
                            console.error("Failed to fetch photos");
                          } finally {
                            setPhotoLoading(false);
                          }
                        }}
                        disabled={photoLoading}
                      >
                        {photoLoading ? (
                          <span className="spinner-border spinner-border-sm me-2" />
                        ) : (
                          <i className="ti ti-camera me-1" />
                        )}
                        Show Photos
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="ft-att-status secondary mb-3">
                        <i className="ti ti-point-filled me-1" />
                        Not Checked In
                      </div>
                      <p className="ft-att-hint">
                        Check in to start sharing your live location with the admin.
                      </p>
                      <input
                        ref={checkInImageRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="d-none"
                        onChange={(e) => handleImageCapture(e, "checkin")}
                      />
                      <div className="d-flex gap-2">
                        <button
                          className="ft-btn-outline-secondary flex-fill"
                          onClick={() => checkInImageRef.current?.click()}
                          disabled={checkInLoading || loading || !position}
                        >
                          <i className="ti ti-camera me-1" />
                          Odometer
                        </button>
                        <button
                          className="ft-btn-primary flex-fill"
                          onClick={handleCheckIn}
                          disabled={checkInLoading || loading || !position}
                        >
                          {checkInLoading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" />
                              Processing...
                            </>
                          ) : !position ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" />
                              Getting location...
                            </>
                          ) : (
                            <>
                              <i className="ti ti-login me-2" />
                              Check In
                            </>
                          )}
                        </button>
                      </div>
                      {checkInImagePreview && (
                        <div className="ft-image-preview mt-2">
                          <img src={checkInImagePreview} alt="Odometer" />
                          <i className="ti ti-x ft-image-remove" onClick={() => setCheckInImagePreview("")} />
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {position && (
                <div className="ft-coords-card mt-3">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <i className="ti ti-map-pin text-primary" />
                    <span className="fw-semibold fs-14">Current Coordinates</span>
                  </div>
                  <div className="ft-coords-grid">
                    <div>
                      <span className="ft-coords-label">Lat</span>
                      <span className="ft-coords-value">{position.latitude.toFixed(6)}</span>
                    </div>
                    <div>
                      <span className="ft-coords-label">Lng</span>
                      <span className="ft-coords-value">{position.longitude.toFixed(6)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {photoModalOpen && (
          <div className="ft-modal-overlay" onClick={() => setPhotoModalOpen(false)}>
            <div className="ft-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="ft-modal-header">
                <h5>Odometer Photos</h5>
                <i className="ti ti-x ft-modal-close" onClick={() => setPhotoModalOpen(false)} />
              </div>
              <div className="ft-modal-body">
                {photoModalImages.checkInImage ? (
                  <div className="ft-modal-image-wrap">
                    <span className="ft-image-badge">Check-in</span>
                    <img src={photoModalImages.checkInImage} alt="Check-in odometer" />
                  </div>
                ) : (
                  <div className="ft-modal-empty">No check-in photo</div>
                )}
                {photoModalImages.checkOutImage ? (
                  <div className="ft-modal-image-wrap">
                    <span className="ft-image-badge">Check-out</span>
                    <img src={photoModalImages.checkOutImage} alt="Check-out odometer" />
                  </div>
                ) : (
                  <div className="ft-modal-empty">No check-out photo</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <style jsx>{`
        .ft-page {
          padding: 2px;
        }
        .ft-alert {
          display: flex;
          align-items: center;
          padding: 12px 18px;
          background: #fffbeb;
          border: 1px solid #fde68a;
          border-radius: 12px;
          font-size: 13px;
          color: #92400e;
          margin-bottom: 16px;
        }
        .ft-badge {
          display: inline-flex;
          align-items: center;
          padding: 6px 14px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 600;
        }
        .ft-badge-checkin {
          background: #dcfce7;
          color: #15803d;
        }
        .ft-map-card {
          background: #fff;
          border-radius: 20px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.05);
          padding: 6px;
          height: 62vh;
          overflow: hidden;
        }
        .ft-att-card {
          background: #fff;
          border-radius: 20px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.05);
          padding: 28px 22px;
          transition: border-color 0.3s;
        }
        .ft-att-checked-in {
          border-color: #86efac;
          background: linear-gradient(180deg, #f0fdf4 0%, #fff 100%);
        }
        .ft-att-icon-wrap {
          display: flex;
          justify-content: center;
        }
        .ft-att-icon {
          width: 60px;
          height: 60px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
        }
        .ft-att-icon.green {
          background: #dcfce7;
          color: #16a34a;
        }
        .ft-att-icon.gray {
          background: #f3f4f6;
          color: #9ca3af;
        }
        .ft-att-title {
          font-weight: 700;
          color: #111827;
          margin-bottom: 12px;
        }
        .ft-att-status {
          display: inline-flex;
          align-items: center;
          padding: 4px 14px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 600;
        }
        .ft-att-status.success {
          background: #dcfce7;
          color: #15803d;
        }
        .ft-att-status.secondary {
          background: #f3f4f6;
          color: #6b7280;
        }
        .ft-att-time {
          margin-bottom: 8px;
        }
        .ft-att-label {
          margin: 0;
          font-size: 12px;
          color: #6b7280;
          font-weight: 500;
        }
        .ft-att-value-sm {
          margin: 1px 0 0;
          font-size: 15px;
          font-weight: 600;
          color: #111827;
        }
        .ft-att-duration {
          margin: 1px 0 0;
          font-size: 32px;
          font-weight: 800;
          color: #111827;
          letter-spacing: -0.02em;
          font-variant-numeric: tabular-nums;
        }
        .ft-att-hint {
          font-size: 13px;
          color: #6b7280;
          margin-bottom: 12px;
        }
        .ft-btn-primary {
          height: 48px;
          padding: 0 24px;
          border: none;
          border-radius: 12px;
          background: #111827;
          color: #fff;
          font-weight: 700;
          font-size: 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.15s;
        }
        .ft-btn-primary:hover:not(:disabled) {
          background: #1f2937;
        }
        .ft-btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .ft-btn-outline-danger {
          height: 48px;
          padding: 0 24px;
          border: 2px solid #ef4444;
          border-radius: 12px;
          background: #fff;
          color: #ef4444;
          font-weight: 700;
          font-size: 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s;
        }
        .ft-btn-outline-danger:hover:not(:disabled) {
          background: #fef2f2;
        }
        .ft-btn-outline-danger:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .ft-btn-outline-secondary {
          height: 48px;
          padding: 0 16px;
          border: 2px solid #d1d5db;
          border-radius: 12px;
          background: #fff;
          color: #374151;
          font-weight: 600;
          font-size: 13px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s;
        }
        .ft-btn-outline-secondary:hover:not(:disabled) {
          background: #f9fafb;
          border-color: #9ca3af;
        }
        .ft-btn-outline-secondary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .ft-image-preview {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid #e5e7eb;
        }
        .ft-image-preview img {
          width: 100%;
          height: 120px;
          object-fit: cover;
          display: block;
        }
        .ft-image-remove {
          position: absolute;
          top: 6px;
          right: 6px;
          background: #111827cc;
          color: #fff;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          cursor: pointer;
        }
        .ft-coords-card {
          background: #fff;
          border-radius: 16px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
          padding: 16px;
        }
        .ft-coords-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }
        .ft-coords-label {
          display: block;
          font-size: 11px;
          color: #6b7280;
          font-weight: 500;
          text-transform: uppercase;
        }
        .ft-coords-value {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #111827;
          font-family: monospace;
        }
        .fs-12 {
          font-size: 12px;
        }
        .fs-14 {
          font-size: 14px;
        }
        .ft-popup strong {
          font-size: 14px;
          color: #111827;
        }
        .ft-btn-ghost {
          height: 36px;
          border: none;
          border-radius: 10px;
          background: transparent;
          color: #6b7280;
          font-weight: 600;
          font-size: 13px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s;
        }
        .ft-btn-ghost:hover:not(:disabled) {
          background: #f3f4f6;
          color: #111827;
        }
        .ft-btn-ghost:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .ft-modal-overlay {
          position: fixed;
          inset: 0;
          background: #00000099;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .ft-modal-content {
          background: #fff;
          border-radius: 20px;
          max-width: 420px;
          width: 100%;
          overflow: hidden;
        }
        .ft-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid #e5e7eb;
        }
        .ft-modal-header h5 {
          margin: 0;
          font-weight: 700;
          font-size: 16px;
        }
        .ft-modal-close {
          font-size: 20px;
          cursor: pointer;
          color: #9ca3af;
        }
        .ft-modal-close:hover {
          color: #111827;
        }
        .ft-modal-body {
          padding: 16px 20px 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .ft-modal-image-wrap {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid #e5e7eb;
        }
        .ft-modal-image-wrap img {
          width: 100%;
          height: 180px;
          object-fit: cover;
          display: block;
        }
        .ft-modal-empty {
          text-align: center;
          padding: 24px;
          color: #9ca3af;
          font-size: 14px;
          background: #f9fafb;
          border-radius: 12px;
        }
      `}</style>
    </div>
  );
}
