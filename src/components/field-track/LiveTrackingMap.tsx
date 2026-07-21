"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
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

interface LiveLocation {
  employeeId: string;
  latitude: number;
  longitude: number;
  speed: number | null;
  batteryLevel: number | null;
  timestamp: string;
}

const LiveTrackingMap = () => {
  const [locations, setLocations] = useState<LiveLocation[]>([]);
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
  }, []);

  return (
    <div className="container-fluid p-4">
      <h4 className="mb-4">Live Employee Tracking</h4>
      <div style={{ height: "70vh", width: "100%" }}>
        <MapContainer
          center={defaultCenter}
          zoom={12}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {locations.map((loc) => (
            <Marker
              key={loc.employeeId}
              position={[loc.latitude, loc.longitude]}
              icon={icon}
            >
              <Popup>
                <strong>Employee ID:</strong> {loc.employeeId}<br />
                <strong>Speed:</strong> {loc.speed ? `${loc.speed.toFixed(1)} m/s` : "N/A"}<br />
                <strong>Battery:</strong> {loc.batteryLevel ? `${loc.batteryLevel}%` : "N/A"}<br />
                <strong>Last Updated:</strong>{" "}
                {new Date(loc.timestamp).toLocaleTimeString()}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default LiveTrackingMap;
