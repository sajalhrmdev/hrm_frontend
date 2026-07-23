"use client";

import { useState, useEffect } from "react";
import axiosFieldTrack from "@/utils/axiosFieldTrack";
import { SkeletonCard } from "@/core/common/Skeleton";

interface DashboardStats {
  totalEmployees: number;
  employeesOnline: number;
  employeesOffline: number;
  todayAttendance: number;
  totalDistance: number;
  averageWorkingHours: number;
  activeRoutes: number;
}

const ReportsView = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axiosFieldTrack.get("/dashboard/stats");
        setStats(res.data.data || null);
      } catch {
        console.error("Failed to fetch dashboard stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="container-fluid p-4 text-center">
        <SkeletonCard />
      </div>
    );
  }

  const cards = [
    { label: "Total Employees", value: stats?.totalEmployees || 0, color: "primary" },
    { label: "Online Now", value: stats?.employeesOnline || 0, color: "success" },
    { label: "Offline", value: stats?.employeesOffline || 0, color: "secondary" },
    { label: "Today Check-ins", value: stats?.todayAttendance || 0, color: "info" },
    { label: "Total Distance (km)", value: ((stats?.totalDistance || 0) / 1000).toFixed(1), color: "warning" },
    { label: "Avg Working Hours", value: stats?.averageWorkingHours.toFixed(1) || "0.0", color: "danger" },
  ];

  return (
    <div className="container-fluid p-4">
      <h4 className="mb-4">Field Track Reports</h4>

      <div className="row g-3">
        {cards.map((card) => (
          <div className="col-md-4 col-lg-3" key={card.label}>
            <div className={`card border-${card.color} shadow-sm`}>
              <div className="card-body text-center">
                <h6 className="card-title text-muted">{card.label}</h6>
                <h3 className={`text-${card.color} mb-0`}>{card.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Quick Actions</h5>
              <p className="card-text">
                Export field tracking data or view detailed reports.
              </p>
              <button className="btn btn-outline-primary me-2">
                Export Attendance
              </button>
              <button className="btn btn-outline-success">
                Download Route Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsView;
