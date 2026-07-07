"use client";

import React from "react";

interface ChatHeaderProps {
  onClearChat: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ onClearChat }) => {
  return (
    <div className="chat-header">
      <div className="chat-header-left">
        <div className="ai-avatar">🤖</div>

        <div>
          <h2>HRM AI Assistant</h2>

          <p>
            Ask anything about Employees, Attendance, Payroll, Leave &
            Performance
          </p>

          <div className="ai-status">
            <span className="status-dot" />
            AI Online
          </div>
        </div>
      </div>

      <div className="chat-header-right">
        <button className="clear-btn" onClick={onClearChat}>
          🗑 Clear Chat
        </button>
      </div>

      <style jsx>{`
        .chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;

          padding: 22px 28px;

          border-radius: 24px;

          background: linear-gradient(135deg, #2563eb, #3b82f6, #60a5fa);

          color: white;

          box-shadow: 0 18px 45px rgba(37, 99, 235, 0.25);

          margin-bottom: 25px;
        }

        .chat-header-left {
          display: flex;

          gap: 18px;

          align-items: center;
        }

        .ai-avatar {
          width: 70px;

          height: 70px;

          border-radius: 50%;

          display: flex;

          justify-content: center;

          align-items: center;

          font-size: 34px;

          background: rgba(255, 255, 255, 0.18);

          backdrop-filter: blur(10px);

          border: 1px solid rgba(255, 255, 255, 0.3);

          animation: pulse 2.5s infinite;
        }

        h2 {
          margin: 0;

          font-size: 28px;

          font-weight: 700;
        }

        p {
          margin: 6px 0;

          opacity: 0.9;

          font-size: 15px;
        }

        .ai-status {
          display: inline-flex;

          align-items: center;

          gap: 8px;

          margin-top: 8px;

          padding: 5px 12px;

          border-radius: 999px;

          background: rgba(255, 255, 255, 0.18);

          font-size: 13px;
        }

        .status-dot {
          width: 10px;

          height: 10px;

          border-radius: 50%;

          background: #22c55e;

          box-shadow: 0 0 12px #22c55e;
        }

        .clear-btn {
          border: none;

          outline: none;

          padding: 12px 20px;

          border-radius: 12px;

          background: white;

          color: #2563eb;

          cursor: pointer;

          font-weight: 600;

          transition: 0.25s;
        }

        .clear-btn:hover {
          transform: translateY(-2px);

          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.15);
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
          }

          50% {
            transform: scale(1.08);
          }

          100% {
            transform: scale(1);
          }
        }

        @media (max-width: 768px) {
          .chat-header {
            flex-direction: column;

            align-items: flex-start;

            gap: 20px;
          }

          .chat-header-left {
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default ChatHeader;
