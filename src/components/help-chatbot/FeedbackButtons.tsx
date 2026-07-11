"use client";

import React, { useState } from "react";

interface FeedbackButtonsProps {
  logId: string;
  onFeedback: (logId: string, helpful: string) => void;
}

const FeedbackButtons: React.FC<FeedbackButtonsProps> = ({
  logId,
  onFeedback,
}) => {
  const [thanked, setThanked] = useState(false);

  const handleClick = (helpful: string) => {
    onFeedback(logId, helpful);
    setThanked(true);
    setTimeout(() => setThanked(false), 2000);
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        marginTop: 4,
        marginLeft: 38,
      }}
    >
      {thanked ? (
        <span
          style={{
            fontSize: 11,
            color: "#22C55E",
            fontWeight: 500,
          }}
        >
          ✓ Thanks!
        </span>
      ) : (
        <>
          <span style={{ fontSize: 11, color: "#999" }}>Helpful?</span>
          <button
            onClick={() => handleClick("yes")}
            style={{
              border: "none",
              background: "none",
              cursor: "pointer",
              fontSize: 14,
              padding: "2px 4px",
              borderRadius: 4,
              transition: "all 0.15s",
              opacity: 0.6,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "1";
              e.currentTarget.style.backgroundColor = "#F0FDF4";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "0.6";
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            👍
          </button>
          <button
            onClick={() => handleClick("no")}
            style={{
              border: "none",
              background: "none",
              cursor: "pointer",
              fontSize: 14,
              padding: "2px 4px",
              borderRadius: 4,
              transition: "all 0.15s",
              opacity: 0.6,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "1";
              e.currentTarget.style.backgroundColor = "#FEF2F2";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "0.6";
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            👎
          </button>
        </>
      )}
    </div>
  );
};

export default FeedbackButtons;
