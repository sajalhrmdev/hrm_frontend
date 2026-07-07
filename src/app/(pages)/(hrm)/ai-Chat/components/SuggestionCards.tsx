"use client";

import React from "react";

interface SuggestionCardsProps {
  onSelect: (prompt: string) => void;
}

const suggestions = [
  {
    icon: "👥",
    title: "Employees",
    description: "Show active employees",
    prompt: "Show active employees",
    color: "#3b82f6",
  },
  {
    icon: "📅",
    title: "Attendance",
    description: "Today's attendance",
    prompt: "Show today's attendance",
    color: "#06b6d4",
  },
  {
    icon: "🏖",
    title: "Leave",
    description: "Pending leave requests",
    prompt: "Show pending leave requests",
    color: "#f97316",
  },
  {
    icon: "💰",
    title: "Payroll",
    description: "Monthly payroll summary",
    prompt: "Show this month's payroll",
    color: "#22c55e",
  },
  {
    icon: "⭐",
    title: "Performance",
    description: "Top performers",
    prompt: "Show top performing employees",
    color: "#8b5cf6",
  },
  {
    icon: "🎁",
    title: "Rewards",
    description: "Employee rewards",
    prompt: "Show employee rewards",
    color: "#ec4899",
  },
];

const SuggestionCards: React.FC<SuggestionCardsProps> = ({
  onSelect,
}) => {
  return (
    <>
      <div className="suggestion-grid">
        {suggestions.map((item) => (
          <div
            key={item.title}
            className="suggestion-card"
            onClick={() => onSelect(item.prompt)}
          >
            <div
              className="icon-box"
              style={{
                background: `linear-gradient(135deg, ${item.color}, ${item.color}CC)`,
              }}
            >
              {item.icon}
            </div>

            <div className="card-content">
              <h5>{item.title}</h5>

              <p>{item.description}</p>
            </div>

            <div className="arrow">
              →
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .suggestion-grid {
          display: grid;

          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));

          gap: 18px;

          margin-bottom: 28px;
        }

        .suggestion-card {
          position: relative;

          overflow: hidden;

          display: flex;

          align-items: center;

          gap: 16px;

          padding: 18px;

          border-radius: 22px;

          background: rgba(255, 255, 255, 0.75);

          backdrop-filter: blur(18px);

          border: 1px solid rgba(255, 255, 255, 0.35);

          box-shadow: 0 12px 35px rgba(15, 23, 42, .08);

          transition: .35s;

          cursor: pointer;
        }

        .suggestion-card:hover {
          transform: translateY(-7px);

          box-shadow: 0 25px 50px rgba(15, 23, 42, .16);
        }

        .suggestion-card::before {
          content: "";

          position: absolute;

          inset: 0;

          background: linear-gradient(
            135deg,
            rgba(255,255,255,.35),
            transparent
          );

          opacity: 0;

          transition: .35s;
        }

        .suggestion-card:hover::before {
          opacity: 1;
        }

        .icon-box {
          width: 60px;

          height: 60px;

          border-radius: 18px;

          display: flex;

          align-items: center;

          justify-content: center;

          font-size: 28px;

          color: white;

          flex-shrink: 0;

          box-shadow: 0 12px 25px rgba(0,0,0,.18);
        }

        .card-content {
          flex: 1;
        }

        .card-content h5 {
          margin: 0;

          font-size: 18px;

          font-weight: 700;

          color: #0f172a;
        }

        .card-content p {
          margin-top: 6px;

          color: #64748b;

          font-size: 13px;

          line-height: 1.5;
        }

        .arrow {
          font-size: 24px;

          color: #94a3b8;

          transition: .35s;
        }

        .suggestion-card:hover .arrow {
          transform: translateX(6px);

          color: #2563eb;
        }

        @media (max-width:768px) {
          .suggestion-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
};

export default SuggestionCards;