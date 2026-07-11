"use client";

import React from "react";

type StatsProps = {
  stats: { total: number; pending: number; approved: number; rejected: number };
  filter: string;
  setFilter: (f: string) => void;
};

const cards = [
  { label: "Total", value: "total", icon: "📋", gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", shadow: "rgba(102,126,234,0.35)", key: "ALL" },
  { label: "Pending", value: "pending", icon: "⏳", gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", shadow: "rgba(245,87,108,0.35)", key: "PENDING" },
  { label: "Approved", value: "approved", icon: "✅", gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", shadow: "rgba(79,172,254,0.35)", key: "APPROVED" },
  { label: "Rejected", value: "rejected", icon: "❌", gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)", shadow: "rgba(250,112,154,0.35)", key: "REJECTED" },
];

const ResignationStats: React.FC<StatsProps> = ({ stats, filter, setFilter }) => {
  return (
    <div className="row g-3 mb-4">
      {cards.map((card) => {
        const isActive = filter === card.key;
        return (
          <div key={card.key} className="col-6 col-lg-3">
            <div
              onClick={() => setFilter(card.key)}
              style={{
                background: isActive ? card.gradient : "rgba(255,255,255,0.8)",
                backdropFilter: "blur(20px)",
                borderRadius: "22px",
                padding: "22px 20px",
                border: isActive ? "none" : "1px solid rgba(255,255,255,0.6)",
                boxShadow: isActive ? `0 12px 32px ${card.shadow}` : "0 4px 20px rgba(0,0,0,0.06)",
                transition: "all 0.35s cubic-bezier(0.4,0,0.2,1)",
                cursor: "pointer",
                transform: isActive ? "translateY(-3px) scale(1.02)" : "translateY(0) scale(1)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {isActive && (
                <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.15)" }} />
              )}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <p style={{ margin: 0, fontSize: "13px", color: isActive ? "rgba(255,255,255,0.85)" : "#9ca3af", fontWeight: 500, letterSpacing: "0.3px" }}>{card.label}</p>
                  <h2 style={{ margin: "8px 0 0", fontSize: "32px", fontWeight: 800, color: isActive ? "#fff" : "#1f2937", lineHeight: 1 }}>{stats[card.value as keyof typeof stats]}</h2>
                </div>
                <div style={{
                  fontSize: "28px",
                  width: "52px",
                  height: "52px",
                  borderRadius: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: isActive ? "rgba(255,255,255,0.2)" : `${card.gradient}`,
                  boxShadow: isActive ? "none" : `0 4px 12px ${card.shadow}`,
                }}>
                  {card.icon}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ResignationStats;
