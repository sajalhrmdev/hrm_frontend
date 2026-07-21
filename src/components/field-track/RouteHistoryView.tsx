"use client";

import { useState } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import axiosFieldTrack from "@/utils/axiosFieldTrack";

import "leaflet/dist/leaflet.css";

const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

interface RouteData {
  locations: { latitude: number; longitude: number; timestamp: string }[];
  totalDistance: number;
  totalTime: number;
  startLocation: { lat: number; lng: number } | null;
  endLocation: { lat: number; lng: number } | null;
}

const RouteHistoryView = () => {
  const [employeeId, setEmployeeId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [route, setRoute] = useState<RouteData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchRoute = async () => {
    if (!employeeId || !date) return;
    setLoading(true);
    try {
      const res = await axiosFieldTrack.get(
        `/gps/history/${employeeId}?date=${date}`
      );
      setRoute(res.data.data || null);
    } catch {
      console.error("Failed to fetch route history");
    } finally {
      setLoading(false);
    }
  };

  const defaultCenter: [number, number] = [23.685, 90.3563];

  return (
    <div className="container-fluid p-4">
      <h4 className="mb-4">Route History</h4>

      <div className="row mb-4">
        <div className="col-md-4">
          <label className="form-label">Employee ID</label>
          <input
            className="form-control"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            placeholder="Enter employee ID"
          />
        </div>
        <div className="col-md-3">
          <label className="form-label">Date</label>
          <input
            type="date"
            className="form-control"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="col-md-2 d-flex align-items-end">
          <button
            className="btn btn-primary w-100"
            onClick={fetchRoute}
            disabled={loading || !employeeId}
          >
            {loading ? "Loading..." : "Search"}
          </button>
        </div>
      </div>

      {route && (
        <div className="row">
          <div className="col-md-3">
            <div className="card mb-3">
              <div className="card-body">
                <h6 className="card-title">Summary</h6>
                <p className="mb-1">
                  <strong>Distance:</strong>{" "}
                  {(route.totalDistance / 1000).toFixed(2)} km
                </p>
                <p className="mb-1">
                  <strong>Duration:</strong>{" "}
                  {Math.floor(route.totalTime / 3600)}h{" "}
                  {Math.floor((route.totalTime % 3600) / 60)}m
                </p>
                <p className="mb-0">
                  <strong>Points:</strong> {route.locations.length}
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-9">
            <div style={{ height: "60vh", width: "100%" }}>
              <MapContainer
                center={
                  route.startLocation
                    ? [route.startLocation.lat, route.startLocation.lng]
                    : defaultCenter
                }
                zoom={14}
                style={{ height: "100%", width: "100%" }}
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
                  color="blue"
                />
                {route.startLocation && (
                  <Marker
                    position={[route.startLocation.lat, route.startLocation.lng]}
                    icon={icon}
                  >
                    <Popup>Start Point</Popup>
                  </Marker>
                )}
                {route.endLocation && (
                  <Marker
                    position={[route.endLocation.lat, route.endLocation.lng]}
                    icon={icon}
                  >
                    <Popup>End Point</Popup>
                  </Marker>
                )}
              </MapContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteHistoryView;
