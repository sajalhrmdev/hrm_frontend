"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import axiosFieldTrack from "@/utils/axiosFieldTrack";
import { reverseGeocode } from "@/utils/reverseGeocode";

const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

interface LiveLocation {
  employeeId: string;
  employeeName: string;
  employeeDepartment: string | null;
  employeeDesignation: string | null;
  latitude: number;
  longitude: number;
  speed: number | null;
  batteryLevel: number | null;
  timestamp: string;
}

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function LiveTracking() {
  const [locations, setLocations] = useState<LiveLocation[]>([]);
  const [addresses, setAddresses] = useState<Record<string, string>>({});
  const [refreshKey, setRefreshKey] = useState(0);
  const defaultCenter: [number, number] = [23.685, 90.3563];

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await axiosFieldTrack.get("/live-locations");
        setLocations(res.data.data || []);
      } catch {
        console.error("Failed to fetch live locations");
      }
    };

    fetchLocations();
    const interval = setInterval(fetchLocations, 30000);
    return () => clearInterval(interval);
  }, [refreshKey]);

  const onlineCount = locations.length;

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="ft-page">
          <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
            <div className="my-auto mb-2">
              <h2 className="mb-1">Live Employee Tracking</h2>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <i className="ti ti-smart-home" />
                  </li>
                  <li className="breadcrumb-item">Field Track</li>
                  <li className="breadcrumb-item active">Live Tracking</li>
                </ol>
              </nav>
            </div>
            <div className="d-flex my-xl-auto right-content align-items-center flex-wrap gap-2">
              <span className="ft-badge ft-badge-online">
                <i className="ti ti-point-filled me-1 text-success" />
                {onlineCount} Active
              </span>
              <span className="ft-refresh-badge" onClick={() => setRefreshKey((k) => k + 1)}>
                <i className="ti ti-refresh me-1" />
                Refresh
              </span>
            </div>
          </div>

          {locations.length > 0 && (
            <div className="row g-3 mb-4">
              {locations.map((loc) => (
                <div className="col-md-3" key={loc.employeeId}>
                  <div className="ft-mini-card">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span className="ft-dot-pulse" />
                      <div className="text-truncate">
                        <span className="fw-semibold fs-14">
                          {loc.employeeName}
                        </span>
                        <span className="fs-11 text-muted d-block">
                          {loc.employeeId}
                        </span>
                      </div>
                    </div>
                    <div className="d-flex gap-3 fs-12 text-muted mt-1">
                      <span>
                        <i className="ti ti-speedometer me-1" />
                        {loc.speed ? `${loc.speed.toFixed(1)} m/s` : "0 m/s"}
                      </span>
                      <span>
                        <i className="ti ti-clock me-1" />
                        {new Date(loc.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="ft-map-card">
            <MapContainer
              center={
                locations[0]
                  ? [locations[0].latitude, locations[0].longitude]
                  : defaultCenter
              }
              zoom={14}
              style={{ height: "100%", width: "100%", borderRadius: "18px" }}
            >
              <MapController center={locations[0] ? [locations[0].latitude, locations[0].longitude] : defaultCenter} />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {locations.map((loc) => (
                <Marker
                  key={loc.employeeId}
                  position={[loc.latitude, loc.longitude]}
                  icon={icon}
                  eventHandlers={{
                    click: () => {
                      reverseGeocode(loc.latitude, loc.longitude).then((addr) =>
                        setAddresses((prev) => ({ ...prev, [loc.employeeId]: addr }))
                      );
                    },
                  }}
                >
                  <Popup>
                    <div className="ft-popup">
                      <strong>{loc.employeeName}</strong>
                      <div className="fs-11 text-muted">{loc.employeeId}</div>
                      {addresses[loc.employeeId] && (
                        <div className="fs-11 text-muted mt-1">
                          <i className="ti ti-map-pin me-1" />
                          {addresses[loc.employeeId]}
                        </div>
                      )}
                      <div className="fs-12 text-muted mt-2">
                        <div>
                          <i className="ti ti-speedometer me-1" />
                          Speed: {loc.speed ? `${loc.speed.toFixed(1)} m/s` : "N/A"}
                        </div>
                        <div>
                          <i className="ti ti-clock me-1" />
                          {new Date(loc.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      </div>
      <style jsx>{`
        .ft-page {
          padding: 2px;
        }
        .ft-badge {
          display: inline-flex;
          align-items: center;
          padding: 6px 14px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 600;
        }
        .ft-badge-online {
          background: #dcfce7;
          color: #15803d;
        }
        .ft-refresh-badge {
          display: inline-flex;
          align-items: center;
          padding: 6px 14px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 600;
          background: #f3f4f6;
          color: #374151;
          cursor: pointer;
          transition: background 0.15s;
        }
        .ft-refresh-badge:hover {
          background: #e5e7eb;
        }
        .ft-mini-card {
          background: #fff;
          border-radius: 14px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
          padding: 16px;
        }
        .ft-dot-pulse {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #16a34a;
          display: inline-block;
          animation: pulse-dot 1.5s ease-in-out infinite;
        }
        @keyframes pulse-dot {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(0.8);
          }
        }
        .fs-14 {
          font-size: 14px;
        }
        .fs-12 {
          font-size: 12px;
        }
        .fs-11 {
          font-size: 11px;
        }
        .ft-map-card {
          background: #fff;
          border-radius: 20px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.05);
          padding: 6px;
          height: 72vh;
          overflow: hidden;
        }
        .ft-popup strong {
          font-size: 14px;
          color: #111827;
        }
      `}</style>
    </div>
  );
}
