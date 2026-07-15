"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";

export type TemplateVariable = {
  label: string;
  value: string;
};

type TiptapEditorProps = {
  content: string;
  onChange: (html: string) => void;
  variables?: TemplateVariable[];
  placeholder?: string;
};

const TiptapEditor: React.FC<TiptapEditorProps> = ({
  content,
  onChange,
  variables = [],
}) => {
  const [html, setHtml] = useState(content || "");
  const [showSource, setShowSource] = useState(false);
  const [showVars, setShowVars] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const sourceRef = useRef<"iframe" | "textarea" | null>(null);

  const writeToIframe = useCallback((val: string) => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument;
    if (!doc) return;

    doc.open();
    doc.write(val);
    doc.close();

    const body = doc.body;
    if (body) {
      body.contentEditable = "true";
      body.style.cursor = "text";
      body.style.outline = "none";
      body.style.padding = "2px 2px";

      const handler = () => {
        sourceRef.current = "iframe";
        const newHtml = body.innerHTML;
        setHtml(newHtml);
        onChange(newHtml);
      };

      if ((body as any)._handler) {
        body.removeEventListener("input", (body as any)._handler);
      }
      (body as any)._handler = handler;
      body.addEventListener("input", handler);
    }
  }, [onChange]);

  useEffect(() => {
    if (sourceRef.current === "iframe") {
      sourceRef.current = null;
      return;
    }
    sourceRef.current = null;
    writeToIframe(html);
  }, [html, showSource, writeToIframe]);

  const handleSourceChange = (val: string) => {
    sourceRef.current = "textarea";
    setHtml(val);
    onChange(val);
  };

  const insertVariable = (varValue: string) => {
    const textarea = document.getElementById("html-editor-textarea") as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newVal = html.substring(0, start) + varValue + html.substring(end);
    sourceRef.current = "textarea";
    setHtml(newVal);
    onChange(newVal);
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + varValue.length;
    }, 0);
  };

  const insertVariableInPreview = (varValue: string) => {
    if (showSource) {
      insertVariable(varValue);
      return;
    }
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument;
    if (!doc) return;
    const sel = doc.getSelection();
    if (!sel || !sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    range.deleteContents();
    const textNode = doc.createTextNode(varValue);
    range.insertNode(textNode);
    range.setStartAfter(textNode);
    range.setEndAfter(textNode);
    sel.removeAllRanges();
    sel.addRange(range);

    sourceRef.current = "iframe";
    const newHtml = doc.body.innerHTML;
    setHtml(newHtml);
    onChange(newHtml);
  };

  return (
    <div style={{ border: "1px solid #d1d5db", borderRadius: "8px", overflow: "hidden", background: "#fff" }}>
      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "6px", padding: "8px 12px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
        <button
          type="button"
          onClick={() => setShowSource(!showSource)}
          style={{
            border: "1px solid #d1d5db",
            background: showSource ? "#f59e0b" : "#fff",
            color: showSource ? "#fff" : "#374151",
            padding: "4px 12px",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: 600,
          }}
        >
          {showSource ? "</> Source" : "✏️ Visual"}
        </button>
        {variables.length > 0 && (
          <>
            <div style={{ width: 1, height: 24, background: "#d1d5db", margin: "0 4px" }} />
            <button
              type="button"
              onClick={() => setShowVars(!showVars)}
              style={{
                border: "1px solid #d1d5db",
                background: showVars ? "#eef2ff" : "#fff",
                color: showVars ? "#4338ca" : "#6b7280",
                padding: "3px 10px",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "11px",
                fontWeight: 600,
              }}
            >
              {showVars ? "▾ Variables" : "▸ Variables"}
            </button>
            {showVars && (
              <div style={{ display: "flex", alignItems: "center", gap: "4px", flexWrap: "wrap" }}>
                {variables.map((v) => (
                  <button
                    key={v.value}
                    type="button"
                    style={{
                      border: "1px solid #c7d2fe",
                      background: "#eef2ff",
                      color: "#4338ca",
                      padding: "2px 8px",
                      borderRadius: "12px",
                      fontSize: "11px",
                      fontWeight: 600,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                    onClick={() => insertVariableInPreview(v.value)}
                    title={`Insert ${v.label}`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {!showSource && (
        <div style={{ display: "flex", flexDirection: "column", minHeight: "400px" }}>
          <iframe
            ref={iframeRef}
            title="Email Preview"
            style={{ flex: 1, border: "none", width: "100%", background: "#fff" }}
          />
        </div>
      )}

      {showSource && (
        <div style={{ display: "flex", flexDirection: "column", minHeight: "400px" }}>
          <div style={{ padding: "4px 12px", background: "#fffbeb", borderBottom: "1px solid #fde68a", fontSize: "11px", fontWeight: 600, color: "#92400e", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            &lt;/&gt; HTML Source
          </div>
          <textarea
            id="html-editor-textarea"
            value={html}
            onChange={(e) => handleSourceChange(e.target.value)}
            style={{
              flex: 1,
              width: "100%",
              border: "none",
              outline: "none",
              resize: "none",
              padding: "12px 16px",
              fontSize: "13px",
              fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
              lineHeight: "1.6",
              color: "#1f2937",
              background: "#fff",
              tabSize: 2,
            }}
            spellCheck={false}
          />
        </div>
      )}
    </div>
  );
};

export default TiptapEditor;
