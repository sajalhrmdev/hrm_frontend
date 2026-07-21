"use client";

import { useState, useEffect } from "react";
import axiosFieldTrack from "@/utils/axiosFieldTrack";

interface DashboardStats {
  totalEmployees: number;
  employeesOnline: number;
  employeesOffline: number;
  todayAttendance: number;
  totalDistance: number;
  averageWorkingHours: number;
  activeRoutes: number;
}

export default function Reports() {
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

  const statCards = [
    {
      label: "Total Employees",
      value: stats?.totalEmployees || 0,
      icon: "ti-users",
      bg: "#eff6ff",
      color: "#2563eb",
    },
    {
      label: "Online Now",
      value: stats?.employeesOnline || 0,
      icon: "ti-user-check",
      bg: "#f0fdf4",
      color: "#16a34a",
    },
    {
      label: "Offline",
      value: stats?.employeesOffline || 0,
      icon: "ti-user-off",
      bg: "#f9fafb",
      color: "#6b7280",
    },
    {
      label: "Today Check-ins",
      value: stats?.todayAttendance || 0,
      icon: "ti-fingerprint",
      bg: "#fefce8",
      color: "#ca8a04",
    },
    {
      label: "Total Distance",
      value: `${((stats?.totalDistance || 0) / 1000).toFixed(1)} km`,
      icon: "ti-route",
      bg: "#fef2f2",
      color: "#dc2626",
    },
    {
      label: "Avg Working Hours",
      value: stats?.averageWorkingHours?.toFixed(1) || "0.0",
      icon: "ti-clock",
      bg: "#f5f3ff",
      color: "#7c3aed",
    },
  ];

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="content">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="ft-page">
          <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
            <div className="my-auto mb-2">
              <h2 className="mb-1">Field Track Reports</h2>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <i className="ti ti-smart-home" />
                  </li>
                  <li className="breadcrumb-item">Field Track</li>
                  <li className="breadcrumb-item active">Reports</li>
                </ol>
              </nav>
            </div>
          </div>

          <div className="row g-3 mb-4">
            {statCards.map((card) => (
              <div className="col-md-4 col-lg-4" key={card.label}>
                <div className="ft-report-card">
                  <div className="d-flex align-items-center gap-3">
                    <span
                      className="ft-report-icon"
                      style={{ background: card.bg, color: card.color }}
                    >
                      <i className={`ti ${card.icon}`} />
                    </span>
                    <div>
                      <p className="ft-report-label">{card.label}</p>
                      <h3 className="ft-report-value">{card.value}</h3>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="row">
            <div className="col-12">
              <div className="ft-action-card">
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                  <div>
                    <h5 className="fw-bold mb-1" style={{ color: "#111827" }}>
                      Quick Actions
                    </h5>
                    <p className="mb-0 text-muted" style={{ fontSize: "14px" }}>
                      Export field tracking data or view detailed reports.
                    </p>
                  </div>
                  <div className="d-flex gap-2">
                    <button className="ft-btn-secondary">
                      <i className="ti ti-file-export me-2" />
                      Export Attendance
                    </button>
                    <button className="ft-btn-secondary">
                      <i className="ti ti-download me-2" />
                      Download Route Data
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .ft-page {
          padding: 2px;
        }
        .ft-report-card {
          background: #fff;
          border-radius: 18px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
          padding: 24px;
          height: 100%;
          transition: box-shadow 0.2s;
        }
        .ft-report-card:hover {
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
        }
        .ft-report-icon {
          width: 54px;
          height: 54px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          flex-shrink: 0;
        }
        .ft-report-label {
          margin: 0;
          font-size: 13px;
          color: #6b7280;
          font-weight: 500;
        }
        .ft-report-value {
          margin: 2px 0 0;
          font-size: 28px;
          font-weight: 800;
          color: #111827;
          letter-spacing: -0.02em;
        }
        .ft-action-card {
          background: #fff;
          border-radius: 18px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
          padding: 24px;
        }
        .ft-btn-secondary {
          height: 44px;
          padding: 0 20px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          background: #fff;
          color: #374151;
          font-weight: 600;
          font-size: 13px;
          display: inline-flex;
          align-items: center;
          cursor: pointer;
          transition: all 0.15s;
        }
        .ft-btn-secondary:hover {
          background: #f9fafb;
          border-color: #d1d5db;
        }
      `}</style>
    </div>
  );
}
