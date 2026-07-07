"use client";

import React, { useState } from "react";

interface ChatBubbleProps {
  role: "user" | "assistant";
  message: string;
  time?: string;
  loading?: boolean;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({
  role,
  message,
  time,
  loading = false,
}) => {
  const [copied, setCopied] = useState(false);

  const copyMessage = async () => {
    await navigator.clipboard.writeText(message);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <>
      <div
        className={`chat-row ${role === "user" ? "user-row" : "assistant-row"}`}
      >
        {role === "assistant" && (
          <div className="avatar assistant-avatar">🤖</div>
        )}

        <div
          className={`bubble ${
            role === "user" ? "user-bubble" : "assistant-bubble"
          }`}
        >
          {loading ? (
            <div className="typing">
              <span />
              <span />
              <span />
            </div>
          ) : (
            <>
              <div className="message">{message}</div>

              <div className="bottom">
                <small>{time}</small>

                {role === "assistant" && (
                  <button className="copy-btn" onClick={copyMessage}>
                    {copied ? "✅ Copied" : "📋 Copy"}
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {role === "user" && <div className="avatar user-avatar">👤</div>}
      </div>

      <style jsx>{`
        .chat-row {
          display: flex;

          gap: 14px;

          margin-bottom: 22px;

          align-items: flex-end;
        }

        .user-row {
          justify-content: flex-end;
        }

        .assistant-row {
          justify-content: flex-start;
        }

        .avatar {
          width: 46px;

          height: 46px;

          border-radius: 50%;

          display: flex;

          justify-content: center;

          align-items: center;

          font-size: 22px;

          flex-shrink: 0;

          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12);
        }

        .assistant-avatar {
          background: linear-gradient(135deg, #2563eb, #60a5fa);

          color: white;
        }

        .user-avatar {
          background: #f3f4f6;
        }

        .bubble {
          max-width: 72%;

          border-radius: 22px;

          padding: 18px;

          transition: 0.3s;

          position: relative;
        }

        .bubble:hover {
          transform: translateY(-2px);
        }

        .assistant-bubble {
          background: white;

          border: 1px solid #e5e7eb;

          box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
        }

        .user-bubble {
          background: linear-gradient(135deg, #2563eb, #3b82f6);

          color: white;

          box-shadow: 0 15px 35px rgba(37, 99, 235, 0.25);
        }

        .message {
          line-height: 1.8;

          white-space: pre-wrap;

          word-break: break-word;

          font-size: 15px;
        }

        .bottom {
          display: flex;

          justify-content: space-between;

          align-items: center;

          margin-top: 15px;
        }

        .bottom small {
          opacity: 0.65;

          font-size: 12px;
        }

        .copy-btn {
          border: none;

          background: #eff6ff;

          color: #2563eb;

          padding: 6px 12px;

          border-radius: 8px;

          cursor: pointer;

          transition: 0.25s;

          font-size: 12px;
        }

        .copy-btn:hover {
          background: #2563eb;

          color: white;
        }

        .typing {
          display: flex;

          gap: 6px;
        }

        .typing span {
          width: 10px;

          height: 10px;

          border-radius: 50%;

          background: #3b82f6;

          animation: bounce 1.2s infinite;
        }

        .typing span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes bounce {
          0%,
          80%,
          100% {
            transform: scale(0.7);

            opacity: 0.5;
          }

          40% {
            transform: scale(1.3);

            opacity: 1;
          }
        }

        @media (max-width: 768px) {
          .bubble {
            max-width: 88%;
          }
        }
      `}</style>
    </>
  );
};

export default ChatBubble;
