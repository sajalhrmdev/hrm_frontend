"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Polyline, Circle, Marker, Popup } from "react-leaflet";
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

interface RouteStop {
  latitude: number;
  longitude: number;
  arrivedAt: string;
  departedAt: string;
  duration: number;
}

interface RouteData {
  locations: { latitude: number; longitude: number; timestamp: string }[];
  stops?: RouteStop[];
  totalDistance: number;
  totalTime: number;
  startLocation: { lat: number; lng: number } | null;
  endLocation: { lat: number; lng: number } | null;
  employeeName?: string;
  checkInImage?: string;
  checkOutImage?: string;
}

export default function MyRouteHistory() {
  const { employee: hrmEmployee } = useAuth();
  const [fieldEmployeeId, setFieldEmployeeId] = useState<string | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [route, setRoute] = useState<RouteData | null>(null);
  const [startAddr, setStartAddr] = useState("");
  const [endAddr, setEndAddr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!hrmEmployee?.id) return;
    axiosFieldTrack.get(`/employees/${hrmEmployee.id}`).then((res) => {
      const empId = res.data.data?.employeeId || null;
      setFieldEmployeeId(empId);
    }).catch(() => {});
  }, [hrmEmployee?.id]);

  const fetchRoute = async () => {
    if (!fieldEmployeeId || !date) return;
    setLoading(true);
    try {
      const res = await axiosFieldTrack.get(
        `/gps/history/${fieldEmployeeId}?date=${date}`
      );
      const data = res.data.data || null;
      setRoute(data);
      setStartAddr("");
      setEndAddr("");
      if (data) {
        if (data.startLocation) {
          reverseGeocode(data.startLocation.lat, data.startLocation.lng).then(setStartAddr);
        }
        if (data.endLocation) {
          reverseGeocode(data.endLocation.lat, data.endLocation.lng).then(setEndAddr);
        }
      }
    } catch {
      console.error("Failed to fetch route history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (fieldEmployeeId) fetchRoute();
  }, [fieldEmployeeId]);

  const formatDuration = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`;
  };

  const defaultCenter: [number, number] = [23.685, 90.3563];

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="ft-page">
          <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
            <div className="my-auto mb-2">
              <h2 className="mb-1">My Route History</h2>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <i className="ti ti-smart-home" />
                  </li>
                  <li className="breadcrumb-item">Field Track</li>
                  <li className="breadcrumb-item active">My Route History</li>
                </ol>
              </nav>
            </div>
          </div>

          <div className="ft-search-card mb-4">
            <div className="row g-3 align-items-end">
              <div className="col-md-3">
                <label className="ft-label">Date</label>
                <div className="ft-input-group">
                  <i className="ti ti-calendar" />
                  <input
                    type="date"
                    className="ft-input"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-2">
                <button
                  className="ft-btn-primary"
                  onClick={fetchRoute}
                  disabled={loading || !fieldEmployeeId}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <i className="ti ti-search me-2" />
                      Search
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {route ? (
            <div className="row g-4">
              <div className="col-md-3">
                <div className="ft-stat-card mb-3">
                  <h6 className="ft-stat-title">Route Summary</h6>
                  {route.employeeName && (
                    <div className="d-flex align-items-center gap-2 mt-2 pb-2 border-bottom">
                      <span className="ft-mini-icon name">
                        <i className="ti ti-user" />
                      </span>
                      <div>
                        <p className="ft-mini-label">Employee</p>
                        <p className="ft-mini-value">{route.employeeName}</p>
                      </div>
                    </div>
                  )}
                  <div className="d-flex flex-column gap-3 mt-3">
                    <div className="d-flex align-items-center gap-3">
                      <span className="ft-mini-icon blue">
                        <i className="ti ti-route" />
                      </span>
                      <div>
                        <p className="ft-mini-label">Distance</p>
                        <p className="ft-mini-value">
                          {(route.totalDistance / 1000).toFixed(2)} km
                        </p>
                      </div>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                      <span className="ft-mini-icon amber">
                        <i className="ti ti-clock" />
                      </span>
                      <div>
                        <p className="ft-mini-label">Duration</p>
                        <p className="ft-mini-value">
                          {Math.floor(route.totalTime / 3600)}h{" "}
                          {Math.floor((route.totalTime % 3600) / 60)}m
                        </p>
                      </div>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                      <span className="ft-mini-icon purple">
                        <i className="ti ti-map-pin" />
                      </span>
                      <div>
                        <p className="ft-mini-label">GPS Points</p>
                        <p className="ft-mini-value">{route.locations.length}</p>
                      </div>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                      <span className="ft-mini-icon orange">
                        <i className="ti ti-circle" />
                      </span>
                      <div>
                        <p className="ft-mini-label">Stay Zones</p>
                        <p className="ft-mini-value">{route.stops?.length || 0}</p>
                      </div>
                    </div>
                  </div>
                  {(route.checkInImage || route.checkOutImage) && (
                    <div className="ft-stat-card">
                      <h6 className="ft-stat-title mb-2">Odometer Photos</h6>
                      <div className="d-flex gap-2">
                        {route.checkInImage && (
                          <a href={route.checkInImage} target="_blank" rel="noopener noreferrer" className="flex-fill">
                            <div className="ft-image-thumb">
                              <span className="ft-image-badge">Check-in</span>
                              <img src={route.checkInImage} alt="Check-in odometer" />
                            </div>
                          </a>
                        )}
                        {route.checkOutImage && (
                          <a href={route.checkOutImage} target="_blank" rel="noopener noreferrer" className="flex-fill">
                            <div className="ft-image-thumb">
                              <span className="ft-image-badge">Check-out</span>
                              <img src={route.checkOutImage} alt="Check-out odometer" />
                            </div>
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="col-md-9">
                <div className="ft-map-card">
                  <MapContainer
                    center={
                      route.startLocation
                        ? [route.startLocation.lat, route.startLocation.lng]
                        : defaultCenter
                    }
                    zoom={14}
                    style={{ height: "100%", width: "100%", borderRadius: "18px" }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Polyline
                      positions={route.locations.map((l) => [
                        l.latitude,
                        l.longitude,
                      ])}
                      color="#2563eb"
                      weight={3}
                      opacity={0.7}
                    />
                    {route.stops?.map((stop, i) => (
                      <Circle
                        key={i}
                        center={[stop.latitude, stop.longitude]}
                        radius={50}
                        pathOptions={{ color: "#f59e0b", weight: 5, fillColor: "#f59e0b", fillOpacity: 0.12 }}
                      >
                        <Popup>
                          <div className="ft-popup">
                            <strong>Stay Zone</strong>
                            <div className="fs-12 text-muted mt-1">
                              <i className="ti ti-login me-1" />
                              Entered: {new Date(stop.arrivedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true })}
                            </div>
                            <div className="fs-12 text-muted">
                              <i className="ti ti-logout me-1" />
                              Exited: {new Date(stop.departedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true })}
                            </div>
                            <div className="fs-12 text-muted">
                              <i className="ti ti-clock me-1" />
                              Duration: {formatDuration(stop.duration)}
                            </div>
                          </div>
                        </Popup>
                      </Circle>
                    ))}
                    {route.startLocation && (
                      <Marker
                        position={[route.startLocation.lat, route.startLocation.lng]}
                        icon={icon}
                      >
                        <Popup>
                          <div className="ft-popup">
                            <strong>Start Point</strong>
                            {startAddr && (
                              <div className="fs-11 text-muted mt-1">
                                <i className="ti ti-map-pin me-1" />
                                {startAddr}
                              </div>
                            )}
                            <div className="fs-12 text-muted mt-1">
                              {route.startLocation.lat.toFixed(4)},{" "}
                              {route.startLocation.lng.toFixed(4)}
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    )}
                    {route.endLocation && (
                      <Marker
                        position={[route.endLocation.lat, route.endLocation.lng]}
                        icon={icon}
                      >
                        <Popup>
                          <div className="ft-popup">
                            <strong>End Point</strong>
                            {endAddr && (
                              <div className="fs-11 text-muted mt-1">
                                <i className="ti ti-map-pin me-1" />
                                {endAddr}
                              </div>
                            )}
                            <div className="fs-12 text-muted mt-1">
                              {route.endLocation.lat.toFixed(4)},{" "}
                              {route.endLocation.lng.toFixed(4)}
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    )}
                  </MapContainer>
                </div>
              </div>
            </div>
          ) : (
            <div className="ft-empty-state">
              <i className="ti ti-route-off" />
              <h5>No Route Data</h5>
              <p>Select a date and click Search to view your route history.</p>
            </div>
          )}
        </div>
      </div>
      <style jsx>{`
        .ft-page {
          padding: 2px;
        }
        .ft-search-card {
          background: #fff;
          border-radius: 18px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
          padding: 22px;
        }
        .ft-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 6px;
        }
        .ft-input-group {
          display: flex;
          align-items: center;
          gap: 10px;
          height: 48px;
          padding: 0 14px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
        }
        .ft-input-group i {
          color: #9ca3af;
          font-size: 18px;
        }
        .ft-input {
          border: none;
          background: transparent;
          outline: none;
          flex: 1;
          font-size: 14px;
          color: #111827;
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
          width: 100%;
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
        .ft-stat-card {
          background: #fff;
          border-radius: 18px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
          padding: 22px;
        }
        .ft-stat-title {
          margin: 0;
          font-weight: 700;
          color: #111827;
          font-size: 15px;
        }
        .ft-mini-icon {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
        }
        .ft-mini-icon.blue {
          background: #eff6ff;
          color: #2563eb;
        }
        .ft-mini-icon.amber {
          background: #fffbeb;
          color: #d97706;
        }
        .ft-mini-icon.purple {
          background: #f5f3ff;
          color: #7c3aed;
        }
        .ft-mini-icon.name {
          background: #ecfdf5;
          color: #059669;
        }
        .ft-mini-icon.orange {
          background: #fff7ed;
          color: #ea580c;
        }
        .ft-mini-label {
          margin: 0;
          font-size: 12px;
          color: #6b7280;
          font-weight: 500;
        }
        .ft-mini-value {
          margin: 1px 0 0;
          font-size: 16px;
          font-weight: 700;
          color: #111827;
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
        .ft-empty-state {
          text-align: center;
          padding: 80px 20px;
          color: #9ca3af;
        }
        .ft-empty-state i {
          font-size: 48px;
          margin-bottom: 16px;
          display: block;
        }
        .ft-empty-state h5 {
          color: #6b7280;
          font-weight: 700;
        }
        .ft-empty-state p {
          font-size: 14px;
          max-width: 400px;
          margin: 8px auto 0;
        }
        .fs-12 {
          font-size: 12px;
        }
        .ft-popup strong {
          font-size: 14px;
          color: #111827;
        }
        .ft-image-thumb {
          position: relative;
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid #e5e7eb;
        }
        .ft-image-thumb img {
          width: 100%;
          height: 100px;
          object-fit: cover;
          display: block;
        }
        .ft-image-badge {
          position: absolute;
          top: 4px;
          left: 4px;
          background: #111827cc;
          color: #fff;
          font-size: 10px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 6px;
          z-index: 1;
        }
      `}</style>
    </div>
  );
}
