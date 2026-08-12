"use client";

import { useState } from "react";
import { all_routes } from "@/routes/all_routes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axiosInstance from "@/utils/axiosInstance";
import { useAuth } from "@/providers/AuthContext";

type PasswordField = "password";

const Login2Component = () => {
  const { loadAuth } = useAuth();
  const routes = all_routes;
  const navigation = useRouter();

  // 🔥 FORM STATE
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [passwordVisibility, setPasswordVisibility] = useState({
    password: false,
  });

  const togglePasswordVisibility = (field: PasswordField) => {
    setPasswordVisibility((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  // 🚀 LOGIN HANDLER
  const navigationPath = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    try {
      setLoading(true);

      const res = await axiosInstance.post("/auth/login", formData);
      localStorage.setItem("token", res.data.token);
      await loadAuth(); // 🔥 loadAuth call to set user and permissions in context

      // 🔥 redirect based on user role from response (not context)
      const userRole = res.data.user.globalRole;

      if (userRole === "SUPER_ADMIN") {
        navigation.push(routes.company);
      } else {
        navigation.push(routes.attendances);
      }
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          "Unable to sign in. Please check your credentials and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="premium-login">
      <div className="premium-login__inner">
        {/* ====================================== */}
        {/* BRAND PANEL */}
        {/* ====================================== */}

        <div className="brand-panel">
          <div className="brand-panel__glow brand-panel__glow--1" />
          <div className="brand-panel__glow brand-panel__glow--2" />
          <div className="brand-panel__ring brand-panel__ring--1" />
          <div className="brand-panel__ring brand-panel__ring--2" />

          <div className="brand-panel__content">
            <div className="brand-panel__badge">
              <i className="ti ti-sparkles" />
              HR Platform
            </div>

            <h1 className="brand-panel__title">
              Empowering people through seamless{" "}
              <span className="brand-panel__highlight">HR management.</span>
            </h1>

            <p className="brand-panel__subtitle">
              Manage attendance, leaves, payroll and everything HR — all in one
              beautifully simple place.
            </p>

            <ul className="feature-list">
              <li>
                <span className="feature-list__icon">
                  <i className="ti ti-check" />
                </span>
                Smart attendance tracking with face recognition
              </li>
              <li>
                <span className="feature-list__icon">
                  <i className="ti ti-check" />
                </span>
                Leave & payroll handled in one workspace
              </li>
              <li>
                <span className="feature-list__icon">
                  <i className="ti ti-check" />
                </span>
                Real-time insights & reports
              </li>
            </ul>

            <div className="brand-stats">
              <div className="brand-stats__item">
                <div className="brand-stats__value">500+</div>
                <div className="brand-stats__label">Companies</div>
              </div>
              <div className="brand-stats__item">
                <div className="brand-stats__value">10K+</div>
                <div className="brand-stats__label">Employees</div>
              </div>
              <div className="brand-stats__item">
                <div className="brand-stats__value">99.9%</div>
                <div className="brand-stats__label">Uptime</div>
              </div>
            </div>
          </div>
        </div>

        {/* ====================================== */}
        {/* FORM PANEL */}
        {/* ====================================== */}

        <div className="form-panel">
          <div className="form-card">
            <div className="form-card__logo">
              <span className="brand-name">
                Deb<span className="brand-name__accent">HRM</span>
              </span>
            </div>

            <div className="form-card__heading">
              <h2>Welcome back</h2>
              <p>Please enter your details to sign in to your account.</p>
            </div>

            {error && (
              <div className="error-banner" role="alert">
                <span className="error-banner__icon">
                  <i className="ti ti-alert-circle" />
                </span>
                <span className="error-banner__text">{error}</span>
                <button
                  type="button"
                  className="error-banner__close"
                  aria-label="Dismiss"
                  onClick={() => setError("")}
                >
                  <i className="ti ti-x" />
                </button>
              </div>
            )}

            <form className="login-form" onSubmit={navigationPath}>
              <div className="form-group">
                <label className="form-group__label" htmlFor="login-email">
                  Email Address
                </label>
                <div className="input-field">
                  <i className="ti ti-mail input-field__icon" />
                  <input
                    id="login-email"
                    type="email"
                    className="input-field__control"
                    placeholder="you@company.com"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="form-group__row">
                  <label className="form-group__label" htmlFor="login-password">
                    Password
                  </label>
                  <Link
                    href={routes.forgotPassword2}
                    className="form-group__link"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="input-field">
                  <i className="ti ti-lock input-field__icon" />
                  <input
                    id="login-password"
                    type={passwordVisibility.password ? "text" : "password"}
                    className="input-field__control"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    className="input-field__toggle"
                    aria-label="Toggle password visibility"
                    onClick={() => togglePasswordVisibility("password")}
                  >
                    <i
                      className={`ti ${
                        passwordVisibility.password ? "ti-eye" : "ti-eye-off"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="form-options">
                <label className="checkbox-label">
                  <input type="checkbox" className="checkbox-label__input" />
                  <span className="checkbox-label__text">Remember me</span>
                </label>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm submit-btn__spinner"
                      aria-hidden="true"
                    />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <i className="ti ti-arrow-right submit-btn__arrow" />
                  </>
                )}
              </button>
            </form>

            <p className="form-card__copyright">© 2026 All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* ====================================== */}
      {/* STYLES */}
      {/* ====================================== */}

      <style jsx>{`
        .premium-login {
          width: 100%;
          min-height: 100vh;
          background: #f8fafc;
        }

        .premium-login__inner {
          display: grid;
          grid-template-columns: 45fr 55fr;
          min-height: 100vh;
        }

        /* ========== BRAND PANEL ========== */

        .brand-panel {
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          padding: 64px 56px;
          background:
            radial-gradient(
              1200px 800px at -10% -10%,
              rgba(45, 212, 191, 0.5),
              transparent 60%
            ),
            radial-gradient(
              900px 700px at 110% 110%,
              rgba(52, 211, 153, 0.4),
              transparent 55%
            ),
            linear-gradient(
              160deg,
              #022c22 0%,
              #0f766e 52%,
              #10b981 120%
            );
          color: #fff;
        }

        .brand-panel__glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
        }

        .brand-panel__glow--1 {
          width: 420px;
          height: 420px;
          top: -120px;
          right: -100px;
          background: rgba(45, 212, 191, 0.35);
        }

        .brand-panel__glow--2 {
          width: 380px;
          height: 380px;
          bottom: -140px;
          left: -80px;
          background: rgba(52, 211, 153, 0.25);
        }

        .brand-panel__ring {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.14);
          pointer-events: none;
        }

        .brand-panel__ring--1 {
          width: 520px;
          height: 520px;
          top: 8%;
          right: -180px;
        }

        .brand-panel__ring--2 {
          width: 320px;
          height: 320px;
          bottom: -60px;
          left: -80px;
        }

        .brand-panel__content {
          position: relative;
          z-index: 2;
          max-width: 480px;
        }

        .brand-panel__badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.2);
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.3px;
          backdrop-filter: blur(8px);
          margin-bottom: 28px;
        }

        .brand-panel__badge i {
          color: #99f6e4;
        }

        .brand-panel__title {
          font-size: 38px;
          line-height: 1.18;
          font-weight: 800;
          letter-spacing: -0.5px;
          margin-bottom: 20px;
        }

        .brand-panel__highlight {
          background: linear-gradient(
            90deg,
            #99f6e4,
            #6ee7b7
          );
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .brand-panel__subtitle {
          font-size: 16px;
          line-height: 1.7;
          color: rgba(255, 255, 255, 0.72);
          margin-bottom: 32px;
        }

        .feature-list {
          list-style: none;
          padding: 0;
          margin: 0 0 40px;
          display: grid;
          gap: 14px;
        }

        .feature-list li {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.9);
          font-weight: 500;
        }

        .feature-list__icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          flex-shrink: 0;
          background: rgba(255, 255, 255, 0.16);
          color: #99f6e4;
          font-size: 12px;
        }

        .brand-stats {
          display: flex;
          gap: 40px;
          padding-top: 32px;
          border-top: 1px solid rgba(255, 255, 255, 0.16);
        }

        .brand-stats__value {
          font-size: 26px;
          font-weight: 800;
          letter-spacing: -0.4px;
        }

        .brand-stats__label {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.6);
          margin-top: 2px;
        }

        /* ========== FORM PANEL ========== */

        .form-panel {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
          background: #f8fafc;
          background-image:
            radial-gradient(
              600px 400px at 100% 0%,
              rgba(99, 102, 241, 0.06),
              transparent 60%
            ),
            radial-gradient(
              600px 400px at 0% 100%,
              rgba(217, 70, 239, 0.06),
              transparent 60%
            );
        }

        .form-card {
          width: 100%;
          max-width: 420px;
          animation: cardIn 0.5s ease;
        }

        .form-card__logo {
          text-align: center;
          margin-bottom: 32px;
        }

        .brand-name {
          display: inline-block;
          font-size: 32px;
          font-weight: 800;
          letter-spacing: -0.5px;
          color: #0f172a;
        }

        .brand-name__accent {
          background: linear-gradient(
            135deg,
            #14b8a6,
            #10b981
          );
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .form-card__heading {
          text-align: center;
          margin-bottom: 28px;
        }

        .form-card__heading h2 {
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.4px;
          color: #0f172a;
          margin-bottom: 8px;
        }

        .form-card__heading p {
          color: #64748b;
          font-size: 14px;
          margin: 0;
        }

        .error-banner {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 14px;
          border-radius: 12px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #b91c1c;
          font-size: 13px;
          margin-bottom: 20px;
          animation: bannerIn 0.25s ease;
        }

        .error-banner__icon {
          font-size: 18px;
        }

        .error-banner__text {
          flex: 1;
        }

        .error-banner__close {
          border: 0;
          background: transparent;
          color: inherit;
          cursor: pointer;
          font-size: 16px;
          padding: 2px;
          display: inline-flex;
        }

        .login-form {
          display: grid;
          gap: 20px;
        }

        .form-group__row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .form-group__label {
          display: block;
          font-size: 13px;
          font-weight: 700;
          color: #334155;
          margin-bottom: 8px;
        }

        .form-group__link {
          font-size: 13px;
          font-weight: 600;
          color: #6366f1;
          text-decoration: none;
        }

        .form-group__link:hover {
          color: #4f46e5;
          text-decoration: underline;
        }

        .input-field {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-field__icon {
          position: absolute;
          left: 16px;
          color: #94a3b8;
          font-size: 18px;
          pointer-events: none;
        }

        .input-field__control {
          width: 100%;
          height: 52px;
          padding: 0 16px 0 48px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          background: #ffffff;
          font-size: 14px;
          color: #0f172a;
          outline: none;
          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
        }

        .input-field__control::placeholder {
          color: #94a3b8;
        }

        .input-field__control:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15);
        }

        .input-field__toggle {
          position: absolute;
          right: 8px;
          border: 0;
          background: transparent;
          color: #94a3b8;
          width: 40px;
          height: 40px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          cursor: pointer;
          font-size: 18px;
        }

        .input-field__toggle:hover {
          color: #475569;
          background: #f1f5f9;
        }

        .form-options {
          display: flex;
          align-items: center;
        }

        .checkbox-label {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          cursor: pointer;
        }

        .checkbox-label__input {
          width: 17px;
          height: 17px;
          accent-color: #6366f1;
          cursor: pointer;
        }

        .checkbox-label__text {
          font-size: 14px;
          color: #475569;
          font-weight: 500;
        }

        .submit-btn {
          position: relative;
          width: 100%;
          height: 52px;
          border: 0;
          border-radius: 12px;
          background: linear-gradient(
            135deg,
            #6366f1 0%,
            #8b5cf6 55%,
            #d946ef 130%
          );
          color: #fff;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 0.2px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 12px 24px rgba(99, 102, 241, 0.28);
          transition:
            transform 0.15s ease,
            box-shadow 0.2s ease;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 16px 32px rgba(99, 102, 241, 0.34);
        }

        .submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .submit-btn:disabled {
          opacity: 0.75;
          cursor: not-allowed;
        }

        .submit-btn__arrow {
          font-size: 18px;
        }

        .submit-btn__spinner {
          --bs-spinner-color: #fff;
        }

        .form-card__copyright {
          text-align: center;
          color: #94a3b8;
          font-size: 13px;
          margin-top: 28px;
        }

        @keyframes cardIn {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bannerIn {
          from {
            opacity: 0;
            transform: translateY(-6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 991.98px) {
          .premium-login__inner {
            grid-template-columns: 1fr;
          }

          .brand-panel {
            display: none;
          }

          .form-panel {
            min-height: 100vh;
            padding: 32px 20px;
          }
        }

        @media (max-width: 480px) {
          .form-panel {
            align-items: flex-start;
            padding-top: 48px;
          }

          .form-card__heading h2 {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default Login2Component;
