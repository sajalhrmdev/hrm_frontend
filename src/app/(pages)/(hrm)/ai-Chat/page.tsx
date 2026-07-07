"use client";

import React, { useState } from "react";
import axiosInstance from "@/utils/axiosInstance";

import ChatHeader from "./components/ChatHeader";
import SuggestionCards from "./components/SuggestionCards";
import ChatWindow from "./components/ChatWindow";
import ChatInput from "./components/ChatInput";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;

  rawData?: any;
  prismaQuery?: any;
}

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const appendMessage = (message: Message) => {
    setMessages((prev) => [...prev, message]);
  };

  const clearChat = () => {
    setMessages([]);
    setInput("");
  };

  const sendMessage = async (text?: string) => {
    const value = (text ?? input).trim();

    if (!value || loading) return;

    // ==========================
    // User Message
    // ==========================

    appendMessage({
      id: crypto.randomUUID(),
      role: "user",
      content: value,
      createdAt: new Date().toLocaleTimeString(),
    });

    setInput("");
    setLoading(true);

    try {
      const { data } = await axiosInstance.post("/chat", {
        message: value,
      });

      if (!data.success) {
        throw new Error(data.message || "AI request failed.");
      }

      const response = data.data;

      // ==========================
      // AI Message
      // ==========================

      appendMessage({
        id: crypto.randomUUID(),
        role: "assistant",

        content:
          response?.answer ??
          "Sorry, I couldn't generate a response.",

        rawData: response?.data ?? [],

        prismaQuery: response?.prismaQuery ?? null,

        createdAt: new Date().toLocaleTimeString(),
      });
    } catch (error: any) {
      let errorMessage =
  "⚠️ Something went wrong. Please try again.";

const backendMessage =
  error?.response?.data?.message || "";

if (
  backendMessage.includes("RESOURCE_EXHAUSTED") ||
  backendMessage.includes("quota")
) {
  errorMessage =
    "🤖 AI service is currently busy. Please try again in a few seconds.";
} else if (
  backendMessage.includes("Prisma") ||
  backendMessage.includes("Invalid `prisma")
) {
  errorMessage =
    "❌ Sorry, I couldn't retrieve the requested information.";
} else if (
  backendMessage.includes("network") ||
  backendMessage.includes("ECONNREFUSED")
) {
  errorMessage =
    "🌐 Unable to connect to the AI service.";
}

appendMessage({
  id: crypto.randomUUID(),
  role: "assistant",
  content: errorMessage,
  createdAt: new Date().toLocaleTimeString(),
});
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="chat-page">
          <ChatHeader onClearChat={clearChat} />
{messages.length === 0 && (
            <SuggestionCards
              onSelect={(prompt) => sendMessage(prompt)}
            />
          )}
          <div className="chat-body">
            <ChatWindow
              messages={messages}
              loading={loading}
            />

            <ChatInput
              value={input}
              loading={loading}
              onChange={setInput}
              onSend={() => sendMessage()}
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        .chat-page {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 20px;
          height: calc(100vh - 110px);
        }

        .chat-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
          overflow: hidden;

          border-radius: 24px;

          background: #ffffff;

          border: 1px solid #e5e7eb;

          box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
        }

        @media (max-width: 768px) {
          .chat-page {
            height: auto;
          }
        }
      `}</style>
    </div>
  );
}