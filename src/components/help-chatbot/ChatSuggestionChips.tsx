"use client";

import React from "react";

interface ChatSuggestionChipsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
}

const ChatSuggestionChips: React.FC<ChatSuggestionChipsProps> = ({
  suggestions,
  onSelect,
}) => {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 4,
        marginBottom: 6,
        marginLeft: 38,
      }}
    >
      {suggestions.map((s, i) => (
        <button
          key={i}
          onClick={() => onSelect(s)}
          style={{
            padding: "5px 12px",
            borderRadius: 14,
            border: "1px solid #E0E0F0",
            backgroundColor: "#fff",
            color: "#4F46E5",
            fontSize: 11,
            cursor: "pointer",
            whiteSpace: "nowrap",
            transition: "all 0.2s",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#4F46E5";
            e.currentTarget.style.backgroundColor = "#F5F3FF";
            e.currentTarget.style.boxShadow = "0 2px 6px rgba(79,70,229,0.12)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#E0E0F0";
            e.currentTarget.style.backgroundColor = "#fff";
            e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)";
          }}
        >
          <span style={{ fontSize: 10 }}>✦</span>
          {s}
        </button>
      ))}
    </div>
  );
};

export default ChatSuggestionChips;
