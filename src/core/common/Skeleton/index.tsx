"use client";

import React from "react";

// ======================================================
// SHIMMER ANIMATION STYLE
// ======================================================

const shimmerStyle: React.CSSProperties = {
  background:
    "linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%)",
  backgroundSize: "200% 100%",
  animation: "skeleton-shimmer 1.5s infinite",
  borderRadius: "6px",
};

// ======================================================
// GLOBAL KEYFRAMES (injected once)
// ======================================================

const GlobalKeyframes: React.FC = () => (
  <style>{`
    @keyframes skeleton-shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `}</style>
);

// ======================================================
// SKELETON BLOCK (generic rectangle)
// ======================================================

interface SkeletonBlockProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  style?: React.CSSProperties;
}

export const SkeletonBlock: React.FC<SkeletonBlockProps> = ({
  width = "100%",
  height = "16px",
  borderRadius = "6px",
  style = {},
}) => (
  <div
    style={{
      ...shimmerStyle,
      width,
      height,
      borderRadius,
      flexShrink: 0,
      ...style,
    }}
  />
);

// ======================================================
// SKELETON TEXT (multiple lines)
// ======================================================

interface SkeletonTextProps {
  lines?: number;
  lastWidth?: string;
  gap?: number;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 3,
  lastWidth = "60%",
  gap = 10,
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap }}>
    {Array.from({ length: lines }).map((_, i) => (
      <SkeletonBlock
        key={i}
        height="12px"
        width={i === lines - 1 ? lastWidth : "100%"}
      />
    ))}
  </div>
);

// ======================================================
// SKELETON TABLE
// ======================================================

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
}

export const SkeletonTable: React.FC<SkeletonTableProps> = ({
  rows = 5,
  columns = 4,
}) => {
  const colWidths = Array.from({ length: columns }).map(
    (_, i) => (i === 0 ? "25%" : `${75 / (columns - 1)}%`),
  );

  return (
    <div style={{ width: "100%" }}>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={rowIdx}
          style={{
            display: "flex",
            gap: "16px",
            padding: "14px 12px",
            borderBottom: "1px solid #f0f0f0",
            alignItems: "center",
          }}
        >
          {colWidths.map((w, colIdx) => (
            <SkeletonBlock
              key={colIdx}
              width={w}
              height="14px"
            />
          ))}
        </div>
      ))}
    </div>
  );
};

// ======================================================
// SKELETON CARD
// ======================================================

interface SkeletonCardProps {
  rows?: number;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ rows = 5 }) => (
  <div
    style={{
      background: "#fff",
      borderRadius: "12px",
      padding: "24px",
      boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
    }}
  >
    <SkeletonBlock width="40%" height="20px" style={{ marginBottom: 20 }} />
    <SkeletonText lines={rows} gap={14} />
  </div>
);

// ======================================================
// SKELETON PAGE (full page layout)
// ======================================================

interface SkeletonPageProps {
  rows?: number;
}

export const SkeletonPage: React.FC<SkeletonPageProps> = ({ rows = 8 }) => (
  <div style={{ padding: "24px" }}>
    <SkeletonBlock
      width="200px"
      height="28px"
      style={{ marginBottom: 20 }}
    />
    <SkeletonBlock
      width="350px"
      height="14px"
      style={{ marginBottom: 30 }}
    />
    <div
      style={{
        background: "#fff",
        borderRadius: "12px",
        padding: "20px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
      }}
    >
      <SkeletonBlock
        width="100%"
        height="36px"
        style={{ marginBottom: 20 }}
      />
      <SkeletonTable rows={rows} columns={5} />
    </div>
  </div>
);

// ======================================================
// DEFAULT EXPORT (auto-injects keyframes)
// ======================================================

const Skeleton: React.FC = () => (
  <>
    <GlobalKeyframes />
    <SkeletonPage />
  </>
);

export default Skeleton;
