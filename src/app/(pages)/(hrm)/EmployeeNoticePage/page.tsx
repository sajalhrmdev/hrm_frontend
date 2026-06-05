"use client";

import React, { useEffect, useState } from "react";

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
} from "lucide-react";

// ======================================================

type NoticePriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

// ======================================================

interface Notice {
  id: number;

  title: string;

  description: string;

  noticeDate: string;

  priority: NoticePriority;

  isPublished: boolean;

  attachmentUrl?: string;

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
  }
> = {
  LOW: {
    bg: "linear-gradient(135deg,#7f1d1d 0%,#450a0a 45%,#000000 100%)",

    glow: "rgba(127,29,29,0.45)",

    accent: "#fca5a5",
  },

  NORMAL: {
    bg: "linear-gradient(135deg,#b91c1c 0%,#7f1d1d 40%,#000000 100%)",

    glow: "rgba(220,38,38,0.5)",

    accent: "#f87171",
  },

  HIGH: {
    bg: "linear-gradient(135deg,#dc2626 0%,#991b1b 40%,#000000 100%)",

    glow: "rgba(239,68,68,0.55)",

    accent: "#fecaca",
  },

  URGENT: {
    bg: "linear-gradient(135deg,#ff0000 0%,#b91c1c 35%,#000000 100%)",

    glow: "rgba(255,0,0,0.75)",

    accent: "#ffffff",
  },
};

// ======================================================

const EmployeeNoticePage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);

  const [notices, setNotices] = useState<Notice[]>([]);

  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // ======================================================
  // FETCH
  // ======================================================

  const fetchNotices = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get("/notice");

      const published = (res.data.data || []).filter(
        (n: Notice) => n.isPublished,
      );

      setNotices(published);
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
  // AUTO SLIDE
  // ======================================================

  useEffect(() => {
    if (notices.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === notices.length - 1 ? 0 : prev + 1));
    }, 6000);

    return () => clearInterval(interval);
  }, [notices]);

  // ======================================================

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === notices.length - 1 ? 0 : prev + 1));
  };

  // ======================================================

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? notices.length - 1 : prev - 1));
  };

  // ======================================================

  const currentNotice = notices[currentIndex];

  // ======================================================

  return (
    <>
      <style>
        {`

          .lux-notice-page{

            min-height:100vh;

           background:
  radial-gradient(circle at top left,#7f1d1d 0%,#450a0a 30%,#000000 100%);

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
              rgba(255,0,0,0.18);

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
              rgba(220,38,38,0.18);

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
    #ffffff,
    #ff4d4f,
    #7f1d1d
  );

            -webkit-background-clip:text;

            -webkit-text-fill-color:transparent;
          }

          /* ================================================= */

          .lux-subtitle{

            margin-top:16px;

            color:
              rgba(255,255,255,0.62);

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
              rgba(255,255,255,0.08);

            backdrop-filter:blur(20px);

            color:white;

            transition:0.35s;

            border:
              1px solid rgba(255,255,255,0.08);
          }

          /* ================================================= */

          .lux-nav-btn:hover{

            transform:
              translateY(-5px);

            background:
              rgba(255,255,255,0.14);

           box-shadow:
  0 10px 35px rgba(255,0,0,0.45);
          }

          /* ================================================= */

          .lux-card{

            position:relative;

            z-index:5;

            border:
              1px solid rgba(255,255,255,0.08);

            backdrop-filter:
              blur(24px);

            border-radius:46px;

            padding:65px;

            overflow:hidden;

            min-height:680px;

            box-shadow:
              0 20px 80px rgba(0,0,0,0.35);
          }

          /* ================================================= */

          .lux-card::before{

            content:"";

            position:absolute;

            inset:0;

            background:
              linear-gradient(
                135deg,
                rgba(255,255,255,0.08),
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
              0 10px 25px rgba(0,0,0,0.2);
          }

          /* ================================================= */

          .lux-main-title{

            position:relative;

            z-index:2;

            font-size:88px;

            line-height:0.92;

            font-weight:900;

            margin-top:34px;

            color:white;

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
              rgba(255,255,255,0.72);

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
              rgba(255,255,255,0.08);

            border:
              1px solid rgba(255,255,255,0.08);

            padding:20px 26px;

            border-radius:26px;

            color:white;

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
                #dc2626,
                #991b1b
              );

            padding:18px 34px;

            border-radius:24px;

            font-weight:700;

            transition:0.35s;

            box-shadow:
              0 15px 40px rgba(239,68,68,0.4);
          }

          /* ================================================= */

          .lux-attachment:hover{

            transform:
              translateY(-5px);

            color:white;

            box-shadow:
              0 20px 55px rgba(239,68,68,0.55);
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
              rgba(255,255,255,0.18);

            transition:0.4s;
          }

          /* ================================================= */

          .lux-dot.active{

  width:58px;

  background:
    linear-gradient(
      90deg,
      #ff0000,
      #7f1d1d,
      #000000
    );

  box-shadow:
    0 0 30px rgba(255,0,0,0.8);
}

          /* ================================================= */

          .lux-empty{

            position:relative;

            z-index:5;

            background:
              rgba(255,255,255,0.06);

            border:
              1px solid rgba(255,255,255,0.08);

            backdrop-filter:
              blur(20px);

            border-radius:42px;

            padding:120px;

            text-align:center;

            color:white;
          }

          /* ================================================= */

          .lux-empty h2{

            font-size:48px;

            font-weight:900;

            margin-top:25px;
          }

          /* ================================================= */

          .lux-empty p{

            margin-top:12px;

            color:
              rgba(255,255,255,0.6);

            font-size:18px;
          }

          /* ================================================= */

          @media(max-width:992px){

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
                Company
                <br />
                Notices
              </h1>

              <p className="lux-subtitle">
                Stay connected with important company updates, announcements,
                policies and workplace communications.
              </p>
            </div>

            <div className="lux-nav">
              <button onClick={prevSlide} className="lux-nav-btn">
                <ChevronLeft size={28} />
              </button>

              <button onClick={nextSlide} className="lux-nav-btn">
                <ChevronRight size={28} />
              </button>
            </div>
          </div>

          {/* ================================================= */}
          {/* CONTENT */}
          {/* ================================================= */}

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-light" />
            </div>
          ) : notices.length === 0 ? (
            <div className="lux-empty">
              <Megaphone size={90} />

              <h2>No Notices Available</h2>

              <p>Company announcements will appear here</p>
            </div>
          ) : currentNotice ? (
            <>
              {/* ================================================= */}
              {/* CARD */}
              {/* ================================================= */}

              <div
                className="lux-card"
                style={
                  {
                    background: noticeThemeMap[currentNotice.priority].bg,

                    "--cardGlow": noticeThemeMap[currentNotice.priority].glow,
                  } as React.CSSProperties
                }
              >
                {/* PRIORITY */}

                <div
                  className="lux-priority"
                  style={{
                    background: noticeThemeMap[currentNotice.priority].accent,
                  }}
                >
                  {priorityIconMap[currentNotice.priority]}

                  {currentNotice.priority}
                </div>

                {/* TITLE */}

                <h2 className="lux-main-title">{currentNotice.title}</h2>

                {/* DESC */}

                <p className="lux-desc">{currentNotice.description}</p>

                {/* DATE */}

                <div className="lux-date">
                  <CalendarDays size={24} />

                  <div>
                    <small
                      style={{
                        color: "rgba(255,255,255,0.6)",
                      }}
                    >
                      Published Date
                    </small>

                    <div className="fw-bold mt-1">
                      {new Date(currentNotice.noticeDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* ATTACHMENT */}

                {currentNotice.attachmentUrl && (
                  <a
                    href={currentNotice.attachmentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="lux-attachment"
                  >
                    <FileText size={20} />
                    View Attachment
                  </a>
                )}
              </div>

              {/* ================================================= */}
              {/* INDICATORS */}
              {/* ================================================= */}

              <div className="lux-indicators">
                {notices.map((_, index) => (
                  <div
                    key={index}
                    className={`lux-dot ${
                      currentIndex === index ? "active" : ""
                    }`}
                  />
                ))}
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
