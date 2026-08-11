"use client";

import React, { useEffect, useMemo, useState } from "react";

import axiosInstance from "@/utils/axiosInstance";

import {
  Megaphone,
  CalendarDays,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  FileText,
  BellRing,
  ShieldAlert,
  Inbox,
  User,
  Building2,
  Layers,
  Clock3,
} from "lucide-react";
import { SkeletonCard } from "@/core/common/Skeleton";

// ======================================================

type NoticePriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

type NoticeFilter = "ALL" | "PERSONAL" | "COMPANY";

// ======================================================

interface Notice {
  id: number;

  title: string;

  description: string;

  noticeDate: string;

  priority: NoticePriority;

  isPublished: boolean;

  attachmentUrl?: string;

  employeeId?: number | null;

  createdAt: string;
}

// ======================================================

const priorityIconMap: Record<NoticePriority, React.ReactNode> = {
  LOW: <BellRing size={18} />,

  NORMAL: <Megaphone size={18} />,

  HIGH: <Sparkles size={18} />,

  URGENT: <ShieldAlert size={18} />,
};

// ======================================================

const noticeThemeMap: Record<
  NoticePriority,
  {
    bg: string;

    glow: string;

    accent: string;

    label: string;
  }
> = {
  LOW: {
    bg: "linear-gradient(135deg,#e0f2fe 0%,#f0f9ff 60%,#ffffff 100%)",

    glow: "rgba(56,189,248,0.3)",

    accent: "#38bdf8",

    label: "#0c4a6e",
  },

  NORMAL: {
    bg: "linear-gradient(135deg,#ede9fe 0%,#f5f3ff 60%,#ffffff 100%)",

    glow: "rgba(139,92,246,0.32)",

    accent: "#8b5cf6",

    label: "#4c1d95",
  },

  HIGH: {
    bg: "linear-gradient(135deg,#fef3c7 0%,#fffbeb 60%,#ffffff 100%)",

    glow: "rgba(251,191,36,0.35)",

    accent: "#f59e0b",

    label: "#78350f",
  },

  URGENT: {
    bg: "linear-gradient(135deg,#ffe4e6 0%,#fff1f2 60%,#ffffff 100%)",

    glow: "rgba(244,63,94,0.35)",

    accent: "#e11d48",

    label: "#9f1239",
  },
};

// ======================================================

const isNewNotice = (dateStr: string) => {
  return Date.now() - new Date(dateStr).getTime() < 48 * 60 * 60 * 1000;
};

// ======================================================

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();

  const hours = Math.floor(diff / 3.6e6);

  if (hours < 1) return "Just now";

  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);

  if (days === 1) return "Yesterday";

  if (days < 7) return `${days}d ago`;

  return new Date(dateStr).toLocaleDateString(undefined, {
    day: "numeric",

    month: "short",
  });
};

// ======================================================

const EmployeeNoticePage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);

  const [notices, setNotices] = useState<Notice[]>([]);

  const [filter, setFilter] = useState<NoticeFilter>("ALL");

  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const [paused, setPaused] = useState<boolean>(false);

  // ======================================================
  // FETCH
  // ======================================================

  const fetchNotices = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get("/notice/active");

      const active = res.data.data || [];

      setNotices(active);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // ======================================================

  useEffect(() => {
    fetchNotices();
  }, []);

  // ======================================================
  // FILTER
  // ======================================================

  const filtered = useMemo(() => {
    if (filter === "PERSONAL") return notices.filter((n) => n.employeeId);

    if (filter === "COMPANY") return notices.filter((n) => !n.employeeId);

    return notices;
  }, [notices, filter]);

  // ======================================================

  useEffect(() => {
    setCurrentIndex(0);
  }, [filter, notices]);

  // ======================================================
  // AUTO SLIDE
  // ======================================================

  useEffect(() => {
    if (filtered.length <= 1 || paused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === filtered.length - 1 ? 0 : prev + 1));
    }, 6000);

    return () => clearInterval(interval);
  }, [filtered, paused]);

  // ======================================================
  // KEYBOARD NAV
  // ======================================================

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevSlide();

      if (e.key === "ArrowRight") nextSlide();
    };

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  });

  // ======================================================

  const nextSlide = () => {
    if (filtered.length <= 1) return;

    setCurrentIndex((prev) => (prev === filtered.length - 1 ? 0 : prev + 1));
  };

  // ======================================================

  const prevSlide = () => {
    if (filtered.length <= 1) return;

    setCurrentIndex((prev) => (prev === 0 ? filtered.length - 1 : prev - 1));
  };

  // ======================================================

  const currentNotice = filtered[currentIndex];

  const filterTabs: {
    key: NoticeFilter;

    label: string;

    icon: React.ReactNode;

    count: number;
  }[] = [
    {
      key: "ALL",

      label: "All",

      icon: <Layers size={16} />,

      count: notices.length,
    },

    {
      key: "PERSONAL",

      label: "For Me",

      icon: <User size={16} />,

      count: notices.filter((n) => n.employeeId).length,
    },

    {
      key: "COMPANY",

      label: "Company",

      icon: <Building2 size={16} />,

      count: notices.filter((n) => !n.employeeId).length,
    },
  ];

  // ======================================================

  return (
    <>
      <style>
        {`

          .lux-notice-page{

            min-height:100vh;

           background:
  radial-gradient(circle at top left,#e0e7ff 0%,#f5f7ff 45%,#dbeafe 100%);

            overflow:hidden;

            position:relative;

            padding:40px;
          }

          /* ================================================= */

          .lux-notice-page::before{

            content:"";

            position:absolute;

            width:700px;

            height:700px;

            background:
              rgba(139,92,246,0.18);

            border-radius:50%;

            filter:blur(120px);

            top:-250px;

            right:-200px;
          }

          /* ================================================= */

          .lux-notice-page::after{

            content:"";

            position:absolute;

            width:600px;

            height:600px;

            background:
              rgba(56,189,248,0.18);

            border-radius:50%;

            filter:blur(140px);

            bottom:-250px;

            left:-200px;
          }

          /* ================================================= */

          .lux-header{

            position:relative;

            z-index:5;

            display:flex;

            justify-content:space-between;

            align-items:center;

            margin-bottom:40px;

            flex-wrap:wrap;

            gap:20px;
          }

          /* ================================================= */

          .lux-title{

            font-size:78px;

            font-weight:900;

            line-height:0.95;

            letter-spacing:-4px;

            background:
  linear-gradient(
    90deg,
    #312e81,
    #7c3aed,
    #0ea5e9
  );

            -webkit-background-clip:text;

            -webkit-text-fill-color:transparent;
          }

          /* ================================================= */

          .lux-subtitle{

            margin-top:16px;

            color:
              #6b7280;

            font-size:18px;

            max-width:650px;
          }

          /* ================================================= */

          .lux-nav{

            display:flex;

            align-items:center;

            gap:16px;
          }

          /* ================================================= */

          .lux-nav-btn{

            width:74px;

            height:74px;

            border:none;

            border-radius:24px;

            background:
              rgba(255,255,255,0.8);

            backdrop-filter:blur(20px);

            color:#4338ca;

            transition:0.35s;

            border:
              1px solid rgba(0,0,0,0.06);

            box-shadow:
              0 8px 25px rgba(99,102,241,0.12);
          }

          /* ================================================= */

          .lux-nav-btn:hover{

            transform:
              translateY(-5px);

            background:
              #ffffff;

           box-shadow:
  0 12px 35px rgba(99,102,241,0.3);
          }

          /* ================================================= */

          .lux-card{

            position:relative;

            z-index:5;

            border:
              1px solid rgba(0,0,0,0.05);

            backdrop-filter:
              blur(24px);

            border-radius:46px;

            padding:65px;

            overflow:hidden;

            min-height:680px;

            box-shadow:
              0 20px 60px rgba(99,102,241,0.14);
          }

          /* ================================================= */

          .lux-card::before{

            content:"";

            position:absolute;

            inset:0;

            background:
              linear-gradient(
                135deg,
                rgba(255,255,255,0.7),
                transparent
              );

            pointer-events:none;
          }

          /* ================================================= */

          .lux-card::after{

            content:"";

            position:absolute;

            width:420px;

            height:420px;

            border-radius:50%;

            top:-140px;

            right:-120px;

            filter:blur(80px);

            opacity:0.9;

            background:
              var(--cardGlow);
          }

          /* ================================================= */

          .lux-priority{

            position:relative;

            z-index:2;

            display:inline-flex;

            align-items:center;

            gap:10px;

            padding:12px 22px;

            border-radius:999px;

            font-size:13px;

            font-weight:700;

            color:white;

            backdrop-filter:
              blur(12px);

            box-shadow:
              0 10px 25px rgba(0,0,0,0.08);
          }

          /* ================================================= */

          .lux-main-title{

            position:relative;

            z-index:2;

            font-size:88px;

            line-height:0.92;

            font-weight:900;

            margin-top:34px;

            color:#1e1b4b;

            letter-spacing:-5px;

            max-width:75%;
          }

          /* ================================================= */

          .lux-desc{

            position:relative;

            z-index:2;

            margin-top:42px;

            max-width:72%;

            color:
              #4b5563;

            font-size:30px;

            line-height:2;
          }

          /* ================================================= */

          .lux-date{

            position:relative;

            z-index:2;

            margin-top:48px;

            display:inline-flex;

            align-items:center;

            gap:16px;

            background:
              rgba(255,255,255,0.85);

            border:
              1px solid rgba(0,0,0,0.06);

            padding:20px 26px;

            border-radius:26px;

            color:#1e1b4b;

            backdrop-filter:
              blur(14px);
          }

          /* ================================================= */

          .lux-attachment{

            position:relative;

            z-index:2;

            margin-top:45px;

            display:inline-flex;

            align-items:center;

            gap:12px;

            text-decoration:none;

            color:white;

            background:
              linear-gradient(
                135deg,
                #8b5cf6,
                #4f46e5
              );

            padding:18px 34px;

            border-radius:24px;

            font-weight:700;

            transition:0.35s;

            box-shadow:
              0 15px 40px rgba(139,92,246,0.4);
          }

          /* ================================================= */

          .lux-attachment:hover{

            transform:
              translateY(-5px);

            color:white;

            box-shadow:
              0 20px 55px rgba(139,92,246,0.55);
          }

          /* ================================================= */

          .lux-indicators{

            position:relative;

            z-index:5;

            display:flex;

            justify-content:center;

            gap:14px;

            margin-top:35px;
          }

          /* ================================================= */

          .lux-dot{

            width:14px;

            height:14px;

            border-radius:999px;

            background:
              rgba(15,23,42,0.15);

            transition:0.4s;
          }

          /* ================================================= */

          .lux-dot.active{

  width:58px;

  background:
    linear-gradient(
      90deg,
      #22d3ee,
      #8b5cf6,
      #4f46e5
    );

  box-shadow:
    0 0 30px rgba(34,211,238,0.8);
}

          /* ================================================= */

          .lux-empty{

            position:relative;

            z-index:5;

            background:
              rgba(255,255,255,0.7);

            border:
              1px solid rgba(0,0,0,0.06);

            backdrop-filter:
              blur(20px);

            border-radius:42px;

            padding:120px;

            text-align:center;

            color:#1e1b4b;
          }

          /* ================================================= */

          .lux-empty h2{

            font-size:48px;

            font-weight:900;

            margin-top:25px;

            color:#1e1b4b;
          }

          /* ================================================= */

          .lux-empty p{

            margin-top:12px;

            color:
              #6b7280;

            font-size:18px;
          }

          /* ================================================= */

          .lux-header-right{

            display:flex;

            align-items:center;

            gap:16px;

            flex-wrap:wrap;
          }

          /* ================================================= */

          .lux-stat{

            display:flex;

            align-items:center;

            gap:14px;

            padding:14px 22px;

            background:
              rgba(255,255,255,0.75);

            border:
              1px solid rgba(0,0,0,0.06);

            border-radius:22px;

            backdrop-filter:
              blur(16px);
          }

          .lux-stat-pulse{

            width:12px;

            height:12px;

            border-radius:50%;

            background:#22c55e;

            animation:luxPulse 2s infinite;
          }

          @keyframes luxPulse{

            0%{box-shadow:0 0 0 0 rgba(34,197,94,0.55)}

            70%{box-shadow:0 0 0 12px rgba(34,197,94,0)}

            100%{box-shadow:0 0 0 0 rgba(34,197,94,0)}
          }

          .lux-stat-num{

            font-size:26px;

            font-weight:900;

            color:#1e1b4b;

            line-height:1;
          }

          .lux-stat-label{

            font-size:12px;

            color:
              #6b7280;

            margin-top:3px;
          }

          /* ================================================= */

          .lux-tabs{

            position:relative;

            z-index:5;

            display:flex;

            gap:10px;

            margin-bottom:28px;

            flex-wrap:wrap;
          }

          .lux-tab{

            display:inline-flex;

            align-items:center;

            gap:8px;

            padding:12px 20px;

            border-radius:999px;

            border:
              1px solid rgba(0,0,0,0.08);

            background:
              rgba(255,255,255,0.75);

            color:
              #4b5563;

            font-weight:700;

            font-size:14px;

            cursor:pointer;

            transition:0.3s;

            backdrop-filter:
              blur(12px);
          }

          .lux-tab:hover{

            background:
              #ffffff;

            color:#4338ca;
          }

          .lux-tab.active{

            background:
              linear-gradient(
                135deg,
                #6366f1,
                #8b5cf6
              );

            color:#fff;

            border-color:transparent;

            box-shadow:
              0 10px 30px rgba(99,102,241,0.35);
          }

          .lux-tab-count{

            min-width:24px;

            text-align:center;

            padding:2px 8px;

            border-radius:999px;

            background:
              rgba(0,0,0,0.08);

            color:#4b5563;

            font-size:12px;
          }

          .lux-tab.active .lux-tab-count{

            background:
              rgba(255,255,255,0.25);

            color:#fff;
          }

          /* ================================================= */

          .lux-grid{

            position:relative;

            z-index:5;

            display:grid;

            grid-template-columns:1fr 340px;

            gap:26px;

            align-items:start;
          }

          .lux-main-col{

            min-width:0;
          }

          /* ================================================= */

          .lux-card{

            padding:48px;

            min-height:460px;
          }

          .lux-card-anim{

            animation:luxFadeUp 0.5s ease both;
          }

          @keyframes luxFadeUp{

            from{opacity:0;transform:translateY(18px) scale(0.99)}

            to{opacity:1;transform:none}
          }

          /* ================================================= */

          .lux-card-top{

            position:relative;

            z-index:2;

            display:flex;

            justify-content:space-between;

            align-items:center;

            gap:16px;

            flex-wrap:wrap;
          }

          .lux-card-meta{

            display:flex;

            align-items:center;

            gap:10px;

            flex-wrap:wrap;
          }

          .lux-chip{

            display:inline-flex;

            align-items:center;

            gap:6px;

            padding:8px 14px;

            border-radius:999px;

            font-size:12px;

            font-weight:700;

            border:
              1px solid rgba(0,0,0,0.08);

            backdrop-filter:
              blur(12px);
          }

          .lux-chip-personal{

            background:
              rgba(139,92,246,0.12);

            border-color:
              rgba(139,92,246,0.25);

            color:#6d28d9;
          }

          .lux-chip-new{

            background:
              linear-gradient(
                135deg,
                #fde68a,
                #f59e0b
              );

            color:#451a03;
          }

          /* ================================================= */

          .lux-main-title{

            font-size:54px;

            max-width:100%;
          }

          .lux-desc{

            font-size:19px;

            line-height:1.85;

            max-width:100%;

            margin-top:28px;
          }

          /* ================================================= */

          .lux-card-footer{

            position:relative;

            z-index:2;

            margin-top:44px;

            display:flex;

            justify-content:space-between;

            align-items:center;

            gap:20px;

            flex-wrap:wrap;
          }

          .lux-ago{

            font-weight:600;

            font-size:13px;

            color:
              #6b7280;
          }

          /* ================================================= */

          .lux-dot{

            border:none;

            cursor:pointer;

            padding:0;
          }

          /* ================================================= */

          .lux-rail{

            position:sticky;

            top:24px;

            background:
              rgba(255,255,255,0.72);

            border:
              1px solid rgba(0,0,0,0.06);

            backdrop-filter:
              blur(24px);

            border-radius:34px;

            padding:18px;
          }

          .lux-rail-header{

            display:flex;

            justify-content:space-between;

            align-items:center;

            padding:6px 8px 14px;
          }

          .lux-rail-title-sm{

            font-size:13px;

            font-weight:800;

            color:
              #4338ca;

            text-transform:uppercase;

            letter-spacing:1px;
          }

          .lux-rail-count{

            min-width:28px;

            text-align:center;

            background:
              #eef2ff;

            border-radius:999px;

            padding:4px 10px;

            font-size:12px;

            font-weight:800;

            color:#4338ca;
          }

          .lux-rail-list{

            display:flex;

            flex-direction:column;

            gap:8px;

            max-height:480px;

            overflow-y:auto;

            padding-right:4px;
          }

          .lux-rail-item{

            width:100%;

            display:flex;

            align-items:flex-start;

            gap:12px;

            padding:14px;

            border:none;

            border-radius:20px;

            background:transparent;

            text-align:left;

            cursor:pointer;

            transition:0.25s;

            border:
              1px solid transparent;
          }

          .lux-rail-item:hover{

            background:
              rgba(0,0,0,0.04);
          }

          .lux-rail-item.active{

            background:
              linear-gradient(
                135deg,
                rgba(139,92,246,0.14),
                rgba(79,70,229,0.05)
              );

            border-color:
              rgba(139,92,246,0.25);
          }

          .lux-rail-dot{

            width:10px;

            height:10px;

            border-radius:50%;

            margin-top:6px;

            flex-shrink:0;
          }

          .lux-rail-body{

            flex:1;

            min-width:0;

            display:flex;

            flex-direction:column;

            gap:4px;
          }

          .lux-rail-title{

            font-size:15px;

            font-weight:700;

            color:#111827;

            white-space:nowrap;

            overflow:hidden;

            text-overflow:ellipsis;
          }

          .lux-rail-sub{

            font-size:12px;

            color:
              #6b7280;

            display:flex;

            align-items:center;

            gap:6px;

            flex-wrap:wrap;
          }

          .lux-rail-new{

            font-style:normal;

            background:
              linear-gradient(
                135deg,
                #fbbf24,
                #f59e0b
              );

            color:#451a03;

            font-size:10px;

            font-weight:800;

            padding:2px 8px;

            border-radius:999px;
          }

          .lux-tip{

            display:flex;

            align-items:center;

            gap:8px;

            margin:14px 6px 0;

            font-size:12px;

            color:
              #9ca3af;
          }

          /* ================================================= */

          @media(max-width:1200px){

            .lux-grid{

              grid-template-columns:1fr 300px;
            }
          }

          /* ================================================= */

          @media(max-width:992px){

            .lux-grid{

              grid-template-columns:1fr;
            }

            .lux-rail{

              position:static;
            }

            .lux-rail-list{

              max-height:none;
            }
          }

          /* ================================================= */

          @media(max-width:768px){

            .lux-header-right{

              width:100%;

              justify-content:space-between;
            }

            .lux-card-top{

              flex-direction:column;

              align-items:flex-start;
            }
          }

            .lux-main-title{

              font-size:58px;

              max-width:100%;
            }

            .lux-desc{

              max-width:100%;
            }

            .lux-title{

              font-size:52px;
            }

            .lux-card{

              padding:38px;

              min-height:auto;
            }
          }

          /* ================================================= */

          @media(max-width:768px){

            .lux-notice-page{

              padding:20px;
            }

            .lux-main-title{

              font-size:42px;
            }

            .lux-desc{

              font-size:16px;
            }

            .lux-title{

              font-size:42px;
            }

            .lux-nav-btn{

              width:58px;

              height:58px;
            }
          }

        `}
      </style>

      <div className="page-wrapper">
        {/* <div className="content"> */}

        <div className="lux-notice-page">
          {/* ================================================= */}
          {/* HEADER */}
          {/* ================================================= */}

          <div className="lux-header">
            <div>
              <h1 className="lux-title">
                Notice
                <br />
                Board
              </h1>

              <p className="lux-subtitle">
                Stay connected with important company updates, personal
                notifications, policies and workplace communications.
              </p>
            </div>

            <div className="lux-header-right">
              <div className="lux-stat">
                <span className="lux-stat-pulse" />

                <div>
                  <div className="lux-stat-num">{filtered.length}</div>

                  <div className="lux-stat-label">
                    {filtered.length === 1 ? "Active notice" : "Active notices"}
                  </div>
                </div>
              </div>

              {filtered.length > 1 && (
                <div className="lux-nav">
                  <button onClick={prevSlide} className="lux-nav-btn">
                    <ChevronLeft size={24} />
                  </button>

                  <button onClick={nextSlide} className="lux-nav-btn">
                    <ChevronRight size={24} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ================================================= */}
          {/* FILTER TABS */}
          {/* ================================================= */}

          <div className="lux-tabs">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                className={`lux-tab ${filter === tab.key ? "active" : ""}`}
                onClick={() => setFilter(tab.key)}
              >
                {tab.icon}

                <span>{tab.label}</span>

                <span className="lux-tab-count">{tab.count}</span>
              </button>
            ))}
          </div>

          {/* ================================================= */}
          {/* CONTENT */}
          {/* ================================================= */}

          {loading ? (
            <SkeletonCard />
          ) : filtered.length === 0 ? (
            <div className="lux-empty">
              <Inbox size={80} />

              <h2>
                {filter === "PERSONAL"
                  ? "No Personal Notices"
                  : filter === "COMPANY"
                    ? "No Company Notices"
                    : "No Notices Available"}
              </h2>

              <p>
                {filter === "PERSONAL"
                  ? "Leave approvals, rejections and other personal updates will appear here"
                  : "Company announcements will appear here"}
              </p>
            </div>
          ) : currentNotice ? (
            <>
              <div className="lux-grid">
                {/* ================================================= */}
                {/* MAIN CARD */}
                {/* ================================================= */}

                <div className="lux-main-col">
                  <div
                    key={currentNotice.id}
                    className="lux-card lux-card-anim"
                    style={
                      {
                        background: noticeThemeMap[currentNotice.priority].bg,

                        "--cardGlow":
                          noticeThemeMap[currentNotice.priority].glow,
                      } as React.CSSProperties
                    }
                    onMouseEnter={() => setPaused(true)}
                    onMouseLeave={() => setPaused(false)}
                  >
                    {/* TOP ROW */}

                    <div className="lux-card-top">
                      <div
                        className="lux-priority"
                        style={{
                          background: noticeThemeMap[currentNotice.priority]
                            .accent,

                          color:
                            noticeThemeMap[currentNotice.priority].label,
                        }}
                      >
                        {priorityIconMap[currentNotice.priority]}

                        {currentNotice.priority}
                      </div>

                      <div className="lux-card-meta">
                        {currentNotice.employeeId && (
                          <span className="lux-chip lux-chip-personal">
                            <User size={12} />
                            For Me
                          </span>
                        )}

                        {isNewNotice(currentNotice.noticeDate) && (
                          <span className="lux-chip lux-chip-new">
                            <Sparkles size={12} />
                            New
                          </span>
                        )}
                      </div>
                    </div>

                    {/* TITLE */}

                    <h2 className="lux-main-title">{currentNotice.title}</h2>

                    {/* DESC */}

                    <p className="lux-desc">{currentNotice.description}</p>

                    {/* FOOTER */}

                    <div className="lux-card-footer">
                      <div className="lux-date">
                        <CalendarDays size={22} />

                        <div>
                          <small
                            style={{
                              color: "rgba(0,0,0,0.5)",
                            }}
                          >
                            Published
                          </small>

                          <div className="fw-bold mt-1">
                            {new Date(
                              currentNotice.noticeDate,
                            ).toLocaleDateString()}

                            <span className="lux-ago">
                              {" "}
                              · {timeAgo(currentNotice.noticeDate)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {currentNotice.attachmentUrl && (
                        <a
                          href={currentNotice.attachmentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="lux-attachment"
                        >
                          <FileText size={18} />
                          View Attachment
                        </a>
                      )}
                    </div>
                  </div>

                  {/* INDICATORS */}

                  {filtered.length > 1 && (
                    <div className="lux-indicators">
                      {filtered.map((_, index) => (
                        <button
                          key={index}
                          className={`lux-dot ${
                            currentIndex === index ? "active" : ""
                          }`}
                          onClick={() => setCurrentIndex(index)}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* ================================================= */}
                {/* RAIL */}
                {/* ================================================= */}

                <aside className="lux-rail">
                  <div className="lux-rail-header">
                    <span className="lux-rail-title-sm">All Notices</span>

                    <span className="lux-rail-count">{filtered.length}</span>
                  </div>

                  <div className="lux-rail-list">
                    {filtered.map((notice, index) => (
                      <button
                        key={notice.id}
                        className={`lux-rail-item ${
                          currentIndex === index ? "active" : ""
                        }`}
                        onClick={() => setCurrentIndex(index)}
                      >
                        <span
                          className="lux-rail-dot"
                          style={{
                            background:
                              noticeThemeMap[notice.priority].accent,

                            boxShadow: `0 0 12px ${noticeThemeMap[notice.priority].glow}`,
                          }}
                        />

                        <span className="lux-rail-body">
                          <span className="lux-rail-title">
                            {notice.title}
                          </span>

                          <span className="lux-rail-sub">
                            {notice.employeeId ? "Personal" : "Company"}

                            {" · "}

                            {timeAgo(notice.noticeDate)}

                            {isNewNotice(notice.noticeDate) && (
                              <em className="lux-rail-new">New</em>
                            )}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>

                  <p className="lux-tip">
                    <Clock3 size={14} />
                    Use ← → arrow keys · hover a card to pause slides
                  </p>
                </aside>
              </div>
            </>
          ) : null}
        </div>
        {/* </div> */}
      </div>
    </>
  );
};

export default EmployeeNoticePage;
