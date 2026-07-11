"use client";

import React from "react";

interface ChatMessageProps {
  role: "user" | "bot";
  content: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ role, content }) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: role === "user" ? "flex-end" : "flex-start",
        marginBottom: 14,
        gap: 8,
        alignItems: "flex-start",
      }}
    >
      {role === "bot" && (
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 15,
            background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            flexShrink: 0,
            marginTop: 2,
          }}
        >
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 11 }}>D</span>
        </div>
      )}
      <div
        style={{
          maxWidth: "72%",
          padding: "10px 14px",
          borderRadius: role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
          fontSize: 13,
          lineHeight: 1.6,
          backgroundColor: role === "user" ? "#4F46E5" : "#fff",
          color: role === "user" ? "#fff" : "#1a1a2e",
          whiteSpace: "pre-wrap",
          boxShadow: role === "bot" ? "0 2px 8px rgba(0,0,0,0.06)" : "0 2px 8px rgba(79,70,229,0.2)",
          border: role === "bot" ? "1px solid #F0F0F5" : "none",
        }}
      >
        {content}
      </div>
      {role === "user" && (
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 15,
            backgroundColor: "#E8E8F0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            flexShrink: 0,
            marginTop: 2,
          }}
        >
          👤
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
