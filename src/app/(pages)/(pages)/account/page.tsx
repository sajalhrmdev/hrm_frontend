"use client";

import React, { useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { useAuth } from "@/providers/AuthContext";

const AccountPage = () => {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // forgot-password (OTP) state
  const [otpStep, setOtpStep] = useState<1 | 2 | 3>(1);
  const [otpEmail, setOtpEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [fpNew, setFpNew] = useState("");
  const [fpConfirm, setFpConfirm] = useState("");
  const [fpLoading, setFpLoading] = useState(false);
  const [fpMessage, setFpMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters" });
      return;
    }

    try {
      setLoading(true);
      await axiosInstance.post("/auth/change-password", {
        currentPassword,
        newPassword,
      });
      setMessage({ type: "success", text: "Password changed successfully" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err?.response?.data?.message || "Failed to change password",
      });
    } finally {
      setLoading(false);
    }
  };

  const accountEmail = user?.email || "";

  const handleSendOtp = async () => {
    setFpMessage(null);
    try {
      setFpLoading(true);
      // logged-in user's login email is resolved server-side (JWT has no email)
      const res = await axiosInstance.post("/auth/forgot-password/me", {});
      setOtpEmail(res.data?.data?.email || "");
      setFpMessage({
        type: "success",
        text: res.data?.message || "OTP sent to your email.",
      });
      setOtpStep(2);
    } catch (err: any) {
      setFpMessage({
        type: "error",
        text: err?.response?.data?.message || "Failed to send OTP",
      });
    } finally {
      setFpLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFpMessage(null);
    try {
      setFpLoading(true);
      const res = await axiosInstance.post("/auth/verify-otp", {
        email: otpEmail,
        otp,
      });
      setResetToken(res.data?.data?.resetToken || "");
      setOtpStep(3);
    } catch (err: any) {
      setFpMessage({
        type: "error",
        text: err?.response?.data?.message || "OTP verification failed",
      });
    } finally {
      setFpLoading(false);
    }
  };

  const handleResetViaOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFpMessage(null);
    if (fpNew !== fpConfirm) {
      setFpMessage({ type: "error", text: "Passwords do not match" });
      return;
    }
    if (fpNew.length < 6) {
      setFpMessage({ type: "error", text: "Password must be at least 6 characters" });
      return;
    }
    try {
      setFpLoading(true);
      await axiosInstance.post("/auth/reset-password", {
        email: otpEmail,
        resetToken,
        newPassword: fpNew,
      });
      setFpMessage({ type: "success", text: "Password reset successfully" });
      setOtp("");
      setResetToken("");
      setFpNew("");
      setFpConfirm("");
      setOtpStep(1);
    } catch (err: any) {
      setFpMessage({
        type: "error",
        text: err?.response?.data?.message || "Password reset failed",
      });
    } finally {
      setFpLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
          <div className="my-auto mb-2">
            <h2 className="mb-1">Account</h2>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-6">
            <div className="card">
              <div className="card-body">
                <h5 className="fw-bold mb-4">Change Password</h5>

                {message && (
                  <div className={`alert alert-${message.type === "success" ? "success" : "danger"} alert-dismissible fade show`}>
                    {message.text}
                    <button type="button" className="btn-close" onClick={() => setMessage(null)} />
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Current Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Confirm New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? "Updating..." : "Update Password"}
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="card">
              <div className="card-body">
                <h5 className="fw-bold mb-2">Forgot Current Password?</h5>
                <p className="text-muted small mb-4">
                  Don&apos;t remember your current password? Verify with a 6-digit code sent to {accountEmail || "your email"}.
                </p>

                {fpMessage && (
                  <div className={`alert alert-${fpMessage.type === "success" ? "success" : "danger"} alert-dismissible fade show`}>
                    {fpMessage.text}
                    <button type="button" className="btn-close" onClick={() => setFpMessage(null)} />
                  </div>
                )}

                {otpStep === 1 && (
                  <button className="btn btn-outline-primary" disabled={fpLoading} onClick={handleSendOtp}>
                    {fpLoading ? "Sending..." : "Send OTP to My Email"}
                  </button>
                )}

                {otpStep === 2 && (
                  <form onSubmit={handleVerifyOtp}>
                    <div className="mb-3">
                      <label className="form-label">6-Digit OTP (expires in 10 minutes)</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        className="form-control text-center fw-bold"
                        placeholder="••••••"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                        required
                      />
                    </div>
                    <div className="d-flex gap-2">
                      <button type="submit" className="btn btn-primary" disabled={fpLoading}>
                        {fpLoading ? "Verifying..." : "Verify OTP"}
                      </button>
                      <button type="button" className="btn btn-link btn-sm" disabled={fpLoading} onClick={handleSendOtp}>
                        Resend OTP
                      </button>
                    </div>
                  </form>
                )}

                {otpStep === 3 && (
                  <form onSubmit={handleResetViaOtp}>
                    <div className="mb-3">
                      <label className="form-label">New Password</label>
                      <input
                        type="password"
                        className="form-control"
                        value={fpNew}
                        onChange={(e) => setFpNew(e.target.value)}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Confirm New Password</label>
                      <input
                        type="password"
                        className="form-control"
                        value={fpConfirm}
                        onChange={(e) => setFpConfirm(e.target.value)}
                        required
                      />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={fpLoading}>
                      {fpLoading ? "Resetting..." : "Reset Password"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
