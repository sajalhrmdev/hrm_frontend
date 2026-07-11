"use client";

import React from "react";

const TypingIndicator: React.FC = () => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 14,
      }}
    >
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: 15,
          background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          fontWeight: 700,
          color: "#fff",
          flexShrink: 0,
        }}
      >
        D
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          padding: "10px 16px",
          borderRadius: "16px 16px 16px 4px",
          backgroundColor: "#fff",
          border: "1px solid #F0F0F5",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              backgroundColor: "#4F46E5",
              opacity: 0.5,
              animation: `debai-bounce 1.4s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default TypingIndicator;
