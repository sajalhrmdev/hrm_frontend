"use client";

import React, { useRef } from "react";

interface ChatInputProps {
  value: string;
  loading: boolean;
  onChange: (value: string) => void;
  onSend: () => void;
}

const MAX_LENGTH = 100;

const ChatInput: React.FC<ChatInputProps> = ({
  value,
  loading,
  onChange,
  onSend,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resizeTextarea = () => {
    const textarea = textareaRef.current;

    if (!textarea) return;

    textarea.style.height = "0px";
    textarea.style.height = textarea.scrollHeight + "px";
  };

  return (
    <>
      <div className="chat-input-wrapper">
        <textarea
          ref={textareaRef}
          value={value}
          maxLength={MAX_LENGTH}
          placeholder="Ask HRM AI anything..."
          rows={1}
          onChange={(e) => {
            onChange(e.target.value);
            resizeTextarea();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();

              if (!loading && value.trim()) {
                onSend();
              }
            }
          }}
        />

        <div className="bottom-bar">
          <span className="counter">
            {value.length}/{MAX_LENGTH}
          </span>

          <button disabled={loading || !value.trim()} onClick={onSend}>
            {loading ? (
              <>
                <span className="spinner" />
                Sending...
              </>
            ) : (
              <>🚀 Send</>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        .chat-input-wrapper {
          margin-top: 20px;

          padding: 18px;

          border-radius: 22px;

          background: rgba(255, 255, 255, 0.8);

          backdrop-filter: blur(16px);

          border: 1px solid rgba(255, 255, 255, 0.45);

          box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
        }

        textarea {
          width: 100%;

          border: none;

          resize: none;

          outline: none;

          font-size: 15px;

          line-height: 1.7;

          min-height: 50px;

          max-height: 180px;

          background: transparent;

          color: #1e293b;
        }

        textarea::placeholder {
          color: #94a3b8;
        }

        .bottom-bar {
          margin-top: 12px;

          display: flex;

          justify-content: space-between;

          align-items: center;
        }

        .counter {
          font-size: 12px;

          color: #64748b;
        }

        button {
          border: none;

          outline: none;

          padding: 11px 22px;

          border-radius: 12px;

          cursor: pointer;

          display: flex;

          align-items: center;

          gap: 10px;

          color: white;

          font-weight: 600;

          background: linear-gradient(135deg, #2563eb, #3b82f6);

          transition: 0.3s;
        }

        button:hover:not(:disabled) {
          transform: translateY(-2px);

          box-shadow: 0 12px 25px rgba(37, 99, 235, 0.25);
        }

        button:disabled {
          opacity: 0.6;

          cursor: not-allowed;
        }

        .spinner {
          width: 16px;

          height: 16px;

          border-radius: 50%;

          border: 2px solid rgba(255, 255, 255, 0.35);

          border-top-color: white;

          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 768px) {
          .chat-input-wrapper {
            padding: 14px;
          }

          button {
            padding: 10px 16px;
          }
        }
      `}</style>
    </>
  );
};

export default ChatInput;
