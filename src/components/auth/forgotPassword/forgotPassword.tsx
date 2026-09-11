"use client";

import { all_routes } from "@/routes/all_routes";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import Link from "next/link";
import React, { useState } from "react";
import axiosInstance from "@/utils/axiosInstance";

const ForgotPasswordComponent = () => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    try {
      setLoading(true);
      const res = await axiosInstance.post("/auth/forgot-password", { email });
      setInfo(res.data?.message || "OTP sent to your email.");
      setStep(2);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    try {
      setLoading(true);
      const res = await axiosInstance.post("/auth/verify-otp", { email, otp });
      setResetToken(res.data?.data?.resetToken || "");
      setStep(3);
    } catch (err: any) {
      setError(err?.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    try {
      setLoading(true);
      await axiosInstance.post("/auth/reset-password", {
        email,
        resetToken,
        newPassword,
      });
      setStep(4);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  const stepTitle =
    step === 1
      ? "Forgot Password?"
      : step === 2
        ? "Enter OTP"
        : step === 3
          ? "Set New Password"
          : "Password Reset!";

  const stepDesc =
    step === 1
      ? "Enter your account email address and we'll send you a 6-digit code to reset your password."
      : step === 2
        ? `We sent a 6-digit code to ${email}. It expires in 10 minutes.`
        : step === 3
          ? "Choose a strong new password for your account."
          : "Your password has been reset successfully. You can now sign in with your new password.";

  return (
    <div className="container-fuild">
      <div className="w-100 overflow-hidden position-relative flex-wrap d-block vh-100">
        <div className="row">
          <div className="col-lg-5">
            <div className="login-background position-relative d-lg-flex align-items-center justify-content-center d-none flex-wrap vh-100">
              <div className="bg-overlay-img">
                <ImageWithBasePath src="assets/img/bg/bg-01.png" className="bg-1" alt="Background pattern 1" />
                <ImageWithBasePath src="assets/img/bg/bg-02.png" className="bg-2" alt="Background pattern 2" />
                <ImageWithBasePath src="assets/img/bg/bg-03.png" className="bg-3" alt="Background pattern 3" />
              </div>
              <div className="authentication-card w-100">
                <div className="authen-overlay-item border w-100">
                  <h1 className="text-white">
                    Empowering people <br /> through seamless HR <br /> management.
                  </h1>
                  <div className="my-4 mx-auto authen-overlay-img">
                    <ImageWithBasePath src="assets/img/bg/authentication-bg-01.png" alt="Authentication illustration" />
                  </div>
                  <div>
                    <p className="text-white fs-20 fw-semibold text-center">
                      Efficiently manage your workforce, streamline <br /> operations effortlessly.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-7 col-md-12 col-sm-12">
            <div className="row justify-content-center align-items-center vh-100 overflow-auto flex-wrap">
              <div className="col-md-7 mx-auto vh-100">
                <div className="vh-100 d-flex flex-column justify-content-between p-4 pb-0">
                  <div className="mx-auto mb-5 text-center">
                    <ImageWithBasePath
                      src="assets/img/logo.svg"
                      className="img-fluid"
                      alt="logo"
                    />
                  </div>
                  <div>
                    <div className="text-center mb-3">
                      <h2 className="mb-2">{stepTitle}</h2>
                      <p className="mb-0">{stepDesc}</p>
                    </div>

                    {error && (
                      <div className="alert alert-danger py-2">{error}</div>
                    )}
                    {info && (
                      <div className="alert alert-success py-2">{info}</div>
                    )}

                    {step === 1 && (
                      <form onSubmit={handleSendOtp}>
                        <div className="mb-3">
                          <label className="form-label" htmlFor="email">Email Address</label>
                          <div className="input-group">
                            <input
                              id="email"
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="form-control border-end-0"
                              required
                              autoComplete="email"
                            />
                            <span className="input-group-text border-start-0">
                              <i className="ti ti-mail" />
                            </span>
                          </div>
                        </div>
                        <div className="mb-3">
                          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                            {loading ? "Sending..." : "Send OTP"}
                          </button>
                        </div>
                      </form>
                    )}

                    {step === 2 && (
                      <form onSubmit={handleVerifyOtp}>
                        <div className="mb-3">
                          <label className="form-label" htmlFor="otp">6-Digit OTP</label>
                          <input
                            id="otp"
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                            className="form-control text-center fw-bold"
                            style={{ fontSize: "28px", letterSpacing: "8px", padding: "12px" }}
                            placeholder="••••••"
                            required
                            autoComplete="one-time-code"
                          />
                        </div>
                        <div className="mb-3">
                          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                            {loading ? "Verifying..." : "Verify OTP"}
                          </button>
                        </div>
                        <div className="text-center">
                          <button
                            type="button"
                            className="btn btn-link btn-sm"
                            disabled={loading}
                            onClick={handleSendOtp}
                          >
                            Resend OTP
                          </button>
                        </div>
                      </form>
                    )}

                    {step === 3 && (
                      <form onSubmit={handleResetPassword}>
                        <div className="mb-3">
                          <label className="form-label" htmlFor="newPassword">New Password</label>
                          <input
                            id="newPassword"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="form-control"
                            required
                            autoComplete="new-password"
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label" htmlFor="confirmPassword">Confirm New Password</label>
                          <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="form-control"
                            required
                            autoComplete="new-password"
                          />
                        </div>
                        <div className="mb-3">
                          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                            {loading ? "Resetting..." : "Reset Password"}
                          </button>
                        </div>
                      </form>
                    )}

                    <div className="text-center mt-3">
                      <h6 className="fw-normal text-dark mb-0">
                        Return to
                        <Link href={all_routes.login2} className="hover-a ms-1">
                          Sign In
                        </Link>
                      </h6>
                    </div>
                  </div>
                  <div className="mt-5 pb-4 text-center">
                    <p className="mb-0 text-gray-9">Copyright © 2026 - Smarthr</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordComponent;
