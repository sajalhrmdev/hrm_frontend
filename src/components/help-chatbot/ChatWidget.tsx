"use client";

import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import ChatMessage from "./ChatMessage";
import ChatSuggestionChips from "./ChatSuggestionChips";
import FeedbackButtons from "./FeedbackButtons";
import TypingIndicator from "./TypingIndicator";

interface Message {
  role: "user" | "bot";
  content: string;
  logId?: string;
  suggestions?: string[];
}

const HELP_API = process.env.NEXT_PUBLIC_HELP_CHATBOT_URL  ;

const QUICK_ACTIONS = [
  "How to apply for leave?",
  "How to check attendance?",
  "How to view my payslip?",
  "How to change my password?",
];

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      content: "Hi! I'm DebAI, your HRM assistant. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${HELP_API}/chat/help`,
        { question: text },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      const botMsg: Message = {
        role: "bot",
        content: res.data.answer,
        logId: res.data.log_id,
        suggestions: res.data.suggestions || [],
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content: "Sorry, I'm having trouble connecting. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (logId: string, helpful: string) => {
    try {
      await axios.post(`${HELP_API}/chat/feedback`, { log_id: logId, helpful });
    } catch {
      // silently ignore
    }
  };

  return (
    <>
      <style>{`
        @keyframes debai-pulse {
          0% { box-shadow: 0 0 0 0 rgba(79,70,229,0.6); }
          70% { box-shadow: 0 0 0 14px rgba(79,70,229,0); }
          100% { box-shadow: 0 0 0 0 rgba(79,70,229,0); }
        }
        @keyframes debai-slide-up {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes debai-bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>

      {/* floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          width: 60,
          height: 60,
          borderRadius: 30,
          background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 4px 20px rgba(79,70,229,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: 0.5,
          zIndex: 9999,
          animation: "debai-pulse 2s infinite",
          transition: "transform 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        {isOpen ? (
          <span style={{ fontSize: 20, lineHeight: 1 }}>✕</span>
        ) : (
          <span style={{ fontSize: 13, lineHeight: 1 }}>DebAI</span>
        )}
      </button>

      {/* chat panel */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: 96,
            right: 24,
            width: 380,
            height: 560,
            backgroundColor: "#fff",
            borderRadius: 20,
            boxShadow: "0 12px 60px rgba(0,0,0,0.18), 0 4px 20px rgba(0,0,0,0.06)",
            display: "flex",
            flexDirection: "column",
            zIndex: 9999,
            overflow: "hidden",
            animation: "debai-slide-up 0.25s ease-out",
          }}
        >
          {/* header */}
          <div
            style={{
              padding: "16px 20px",
              background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: "rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
              }}
            >
              🤖
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: 0.3 }}>
                DebAI
              </div>
              <div
                style={{
                  fontSize: 11,
                  opacity: 0.85,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: "#4ADE80",
                    display: "inline-block",
                  }}
                />
                Online
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "none",
                border: "none",
                color: "#fff",
                fontSize: 18,
                cursor: "pointer",
                opacity: 0.8,
                padding: 2,
              }}
            >
              ✕
            </button>
          </div>

          {/* messages */}
          <div
            style={{
              flex: 1,
              padding: "12px 16px",
              overflowY: "auto",
              backgroundColor: "#F8F9FF",
            }}
          >
            {messages.map((msg, i) => (
              <div key={i}>
                <ChatMessage role={msg.role} content={msg.content} />
                {msg.role === "bot" && msg.suggestions && msg.suggestions.length > 0 && (
                  <ChatSuggestionChips
                    suggestions={msg.suggestions}
                    onSelect={(s) => sendMessage(s)}
                  />
                )}
                {msg.role === "bot" && msg.logId && (
                  <FeedbackButtons
                    logId={msg.logId}
                    onFeedback={handleFeedback}
                  />
                )}
              </div>
            ))}
            {loading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* quick actions */}
          {messages.length <= 2 && (
            <div
              style={{
                padding: "0 16px 8px",
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
              }}
            >
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action}
                  onClick={() => sendMessage(action)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 14,
                    border: "1px solid #E0E0F0",
                    backgroundColor: "#fff",
                    color: "#4F46E5",
                    fontSize: 11,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#4F46E5";
                    e.currentTarget.style.backgroundColor = "#F5F3FF";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#E0E0F0";
                    e.currentTarget.style.backgroundColor = "#fff";
                  }}
                >
                  {action}
                </button>
              ))}
            </div>
          )}

          {/* input */}
          <div
            style={{
              padding: "12px 16px 16px",
              borderTop: "1px solid #F0F0F5",
              display: "flex",
              gap: 8,
              backgroundColor: "#fff",
            }}
          >
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                backgroundColor: "#F5F5FA",
                borderRadius: 12,
                padding: "0 14px",
                border: "1px solid transparent",
                transition: "border-color 0.2s",
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                placeholder="Ask DebAI anything..."
                style={{
                  flex: 1,
                  padding: "10px 0",
                  border: "none",
                  background: "none",
                  fontSize: 13,
                  outline: "none",
                  color: "#1a1a2e",
                }}
              />
            </div>
            <button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                border: "none",
                background: loading || !input.trim() ? "#D1D5DB" : "linear-gradient(135deg, #4F46E5, #7C3AED)",
                color: "#fff",
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                transition: "all 0.2s",
              }}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
