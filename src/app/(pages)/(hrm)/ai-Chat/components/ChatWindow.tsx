"use client";

import React, { useEffect, useRef } from "react";
import ChatBubble from "./ChatBubble";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

interface ChatWindowProps {
  messages: Message[];
  loading: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, loading }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  return (
    <>
      <div className="chat-window">
        {messages.length === 0 && (
          <div className="empty-state">
            <div className="robot">🤖</div>

            <h2>HRM AI Assistant</h2>

            <p>
              Ask anything about your employees, attendance, payroll, leave,
              performance or departments.
            </p>
          </div>
        )}

        {messages.map((item) => (
          <ChatBubble
            key={item.id}
            role={item.role}
            message={item.content}
            time={item.createdAt}
          />
        ))}

        {loading && <ChatBubble role="assistant" message="" loading />}

        <div ref={bottomRef} />
      </div>

      <style jsx>{`
        .chat-window {
          flex: 1;

          overflow-y: auto;

          padding: 30px;

          background: linear-gradient(180deg, #f8fafc, #eef4ff);

          scroll-behavior: smooth;
        }

        .chat-window::-webkit-scrollbar {
          width: 7px;
        }

        .chat-window::-webkit-scrollbar-thumb {
          background: #d1d5db;

          border-radius: 20px;
        }

        .empty-state {
          height: 100%;

          display: flex;

          flex-direction: column;

          justify-content: center;

          align-items: center;

          text-align: center;

          animation: fade 0.5s;
        }

        .robot {
          width: 95px;

          height: 95px;

          border-radius: 50%;

          display: flex;

          justify-content: center;

          align-items: center;

          font-size: 44px;

          background: linear-gradient(135deg, #2563eb, #60a5fa);

          color: white;

          margin-bottom: 25px;

          box-shadow: 0 20px 40px rgba(37, 99, 235, 0.25);
        }

        h2 {
          margin: 0;

          font-size: 30px;

          font-weight: 700;

          color: #1e293b;
        }

        p {
          margin-top: 14px;

          max-width: 520px;

          color: #64748b;

          line-height: 1.8;
        }

        @keyframes fade {
          from {
            opacity: 0;

            transform: translateY(20px);
          }

          to {
            opacity: 1;

            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .chat-window {
            padding: 20px;
          }

          h2 {
            font-size: 24px;
          }
        }
      `}</style>
    </>
  );
};

export default ChatWindow;
