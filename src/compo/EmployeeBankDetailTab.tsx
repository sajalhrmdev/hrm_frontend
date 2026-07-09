"use client";

import React, {
  useEffect,
  useState,
} from "react";

import axiosInstance
from "@/utils/axiosInstance";

// ======================================================

type Props = {
  employeeId: number;
  isViewOnly?: boolean;
};

// ======================================================

const EmployeeBankDetailTab = ({
  employeeId,
  isViewOnly,
}: Props) => {

  // ======================================================
  // STATES
  // ======================================================

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    formData,
    setFormData,
  ] = useState({

    bankName: "",

    accountHolderName: "",

    accountNumber: "",

    ifscCode: "",

    branchName: "",

    upiId: "",
  });

  // ======================================================
  // FETCH
  // ======================================================

  const fetchBankDetail =
    async () => {

      try {

        setLoading(true);

        const res =
          await axiosInstance.get(

            `/employee-bank-detail/${employeeId}`
          );

        if (res?.data?.data) {

          setFormData({

            bankName:
              res.data.data.bankName || "",

            accountHolderName:
              res.data.data
                .accountHolderName || "",

            accountNumber:
              res.data.data
                .accountNumber || "",

            ifscCode:
              res.data.data.ifscCode || "",

            branchName:
              res.data.data.branchName || "",

            upiId:
              res.data.data.upiId || "",
          });
        }

      } catch (err) {

        console.log(err);

      } finally {

        setLoading(false);
      }
    };

  useEffect(() => {

    if (employeeId) {

      fetchBankDetail();
    }

  }, [employeeId]);

  // ======================================================
  // HANDLE CHANGE
  // ======================================================

  const handleChange =
    (
      e: React.ChangeEvent<
        HTMLInputElement
      >
    ) => {

      setFormData({

        ...formData,

        [e.target.name]:
          e.target.value,
      });
    };

  // ======================================================
  // SUBMIT
  // ======================================================

  const handleSubmit =
    async (
      e: React.FormEvent
    ) => {

      e.preventDefault();

      try {

        setSaving(true);

        await axiosInstance.post(

          "/employee-bank-detail",

          {

            employeeId,

            ...formData,
          }
        );

        alert(
          "Bank details saved successfully"
        );

      } catch (err: any) {

        alert(
          err?.response?.data?.message
        );

      } finally {

        setSaving(false);
      }
    };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {

    return (

      <div className="bank-loading">

        <div className="spinner-border text-primary" />

        <p className="mt-3 mb-0">
          Loading bank details...
        </p>

      </div>
    );
  }

  // ======================================================
  // UI
  // ======================================================

  return (

    <div className="bank-page">

      {/* ====================================== */}
      {/* HEADER */}
      {/* ====================================== */}

      <div className="bank-top-card">

        <div>

          <h3 className="bank-title">
            🏦 Bank Details
          </h3>

          <p className="bank-subtitle">
            Manage employee banking information
          </p>

        </div>

        <div className="bank-badge">
          Secure Banking
        </div>

      </div>

      {/* ====================================== */}
      {/* FORM CARD */}
      {/* ====================================== */}

      <div className="bank-form-card">

        <form
          onSubmit={handleSubmit}
        >

          <div className="row g-4">

            {/* BANK NAME */}

            <div className="col-md-6">

              <label className="bank-label">
                Bank Name
              </label>

              <input
                type="text"

                name="bankName"

                className="bank-input"

                placeholder="Enter bank name"

                value={formData.bankName}

                onChange={handleChange}
                disabled={isViewOnly}
              />

            </div>

            {/* ACCOUNT HOLDER */}

            <div className="col-md-6">

              <label className="bank-label">
                Account Holder Name
              </label>

              <input
                type="text"

                name="accountHolderName"

                className="bank-input"

                placeholder="Enter account holder name"

                value={
                  formData.accountHolderName
                }

                onChange={handleChange}
                disabled={isViewOnly}
              />

            </div>

            {/* ACCOUNT NUMBER */}

            <div className="col-md-6">

              <label className="bank-label">
                Account Number
              </label>

              <input
                type="text"

                name="accountNumber"

                className="bank-input"

                placeholder="Enter account number"

                value={
                  formData.accountNumber
                }

                onChange={handleChange}
                disabled={isViewOnly}
              />

            </div>

            {/* IFSC */}

            <div className="col-md-6">

              <label className="bank-label">
                IFSC Code
              </label>

              <input
                type="text"

                name="ifscCode"

                className="bank-input"

                placeholder="Enter IFSC code"

                value={formData.ifscCode}

                onChange={handleChange}
                disabled={isViewOnly}
              />

            </div>

            {/* BRANCH */}

            <div className="col-md-6">

              <label className="bank-label">
                Branch Name
              </label>

              <input
                type="text"

                name="branchName"

                className="bank-input"

                placeholder="Enter branch name"

                value={formData.branchName}

                onChange={handleChange}
                disabled={isViewOnly}
              />

            </div>

            {/* UPI */}

            <div className="col-md-6">

              <label className="bank-label">
                UPI ID
              </label>

              <input
                type="text"

                name="upiId"

                className="bank-input"

                placeholder="Enter UPI ID"

                value={formData.upiId}

                onChange={handleChange}
                disabled={isViewOnly}
              />

            </div>

          </div>

          {/* BUTTON */}
          {!isViewOnly && (
          <div className="save-btn-wrapper">

            <button
              type="submit"

              className="save-btn"

              disabled={saving}
            >

              {saving ? (

                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                  />
                  Saving...
                </>

              ) : (

                <>
                  💾 Save Bank Details
                </>

              )}

            </button>

          </div>
          )}

        </form>

      </div>

      {/* ====================================== */}
      {/* STYLE */}
      {/* ====================================== */}

      <style jsx>{`

        .bank-page {

          width: 100%;
        }

        .bank-top-card {

          display: flex;

          justify-content: space-between;

          align-items: center;

          margin-bottom: 24px;

          padding: 24px 28px;

          background: linear-gradient(
            135deg,
            #ffffff,
            #f8fbff
          );

          border-radius: 18px;

          box-shadow:
            0 4px 25px
            rgba(0,0,0,0.06);

          border: 1px solid #edf2f7;
        }

        .bank-title {

          font-size: 28px;

          font-weight: 800;

          color: #111827;

          margin-bottom: 6px;
        }

        .bank-subtitle {

          margin: 0;

          color: #6b7280;

          font-size: 14px;
        }

        .bank-badge {

          background: linear-gradient(
            135deg,
            #2563eb,
            #1d4ed8
          );

          color: white;

          padding: 10px 18px;

          border-radius: 999px;

          font-size: 13px;

          font-weight: 600;

          box-shadow:
            0 6px 18px
            rgba(37,99,235,0.25);
        }

        .bank-form-card {

          background: white;

          border-radius: 20px;

          padding: 32px;

          box-shadow:
            0 6px 30px
            rgba(0,0,0,0.08);

          border: 1px solid #edf2f7;
        }

        .bank-label {

          display: block;

          margin-bottom: 10px;

          font-size: 14px;

          font-weight: 700;

          color: #111827;
        }

        .bank-input {

          width: 100% !important;

          height: 54px !important;

          border-radius: 14px;

          border: 1px solid #d1d5db;

          background: #f9fafb;

          padding: 0 16px;

          font-size: 14px;

          color: #111827;

          transition: all 0.2s ease;

          outline: none;

          writing-mode:
            horizontal-tb !important;

          transform:
            none !important;

          rotate: 0deg !important;

          text-orientation:
            mixed !important;

          white-space:
            nowrap !important;

          display: block !important;
        }

        .bank-input::placeholder {

          color: #9ca3af;
        }

        .bank-input:focus {

          background: white;

          border-color: #2563eb;

          box-shadow:
            0 0 0 4px
            rgba(37,99,235,0.12);
        }

        .save-btn-wrapper {

          margin-top: 32px;
        }

        .save-btn {

          border: none;

          background: linear-gradient(
            135deg,
            #2563eb,
            #1d4ed8
          );

          color: white;

          height: 52px;

          padding: 0 28px;

          border-radius: 14px;

          font-size: 15px;

          font-weight: 700;

          transition: all 0.2s ease;

          box-shadow:
            0 10px 24px
            rgba(37,99,235,0.25);
        }

        .save-btn:hover {

          transform: translateY(-2px);

          box-shadow:
            0 14px 28px
            rgba(37,99,235,0.3);
        }

        .save-btn:disabled {

          opacity: 0.7;

          cursor: not-allowed;
        }

        .bank-loading {

          height: 300px;

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: center;

          color: #374151;
        }

        @media (max-width: 768px) {

          .bank-top-card {

            flex-direction: column;

            align-items: flex-start;

            gap: 16px;

            padding: 20px;
          }

          .bank-form-card {

            padding: 20px;
          }

          .bank-title {

            font-size: 22px;
          }

          .save-btn {

            width: 100%;
          }
        }

      `}</style>

    </div>
  );
};

export default EmployeeBankDetailTab;