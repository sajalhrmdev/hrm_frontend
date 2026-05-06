import React, { useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";

type LeaveType = {
  id: number;
  name: string;
  code: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

const ApplyLeaveModal: React.FC<Props> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [leaveTypes, setLeaveTypes] = useState<
    LeaveType[]
  >([]);

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    leaveTypeId: "",
    fromDate: "",
    toDate: "",
    leaveMode: "FULL",
    reason: "",
  });

  // 🔥 fetch leave types
  const fetchLeaveTypes = async () => {
    try {
      const res = await axiosInstance.get(
        "/leave/types?is_active=true"
      );

      setLeaveTypes(res.data.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (open) {
      fetchLeaveTypes();
    }
  }, [open]);

  // 🔥 input change
  const handleChange = (
    e:
      | React.ChangeEvent<
          HTMLInputElement | HTMLTextAreaElement
        >
      | React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 🚀 submit
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {
      setLoading(true);

      await axiosInstance.post(
        "/leave/apply",
        formData
      );

      alert("✅ Leave applied successfully");

      // reset
      setFormData({
        leaveTypeId: "",
        fromDate: "",
        toDate: "",
        leaveMode: "FULL",
        reason: "",
      });

      onClose();

      onSuccess?.();
    } catch (err: any) {
      console.log(err);

      alert(
        err?.response?.data?.message ||
          "Apply failed"
      );
    } finally {
      setLoading(false);
    }
  };

  // ❌ close if not open
  if (!open) return null;

  return (
    <div className="leave-modal-overlay">
      <div className="leave-modal-box">
        {/* HEADER */}
        <div className="leave-modal-header">
          <div>
            <h2>📝 Apply Leave</h2>

            <p>
              Submit your leave request
            </p>
          </div>

          <button
            className="close-btn"
            onClick={onClose}
          >
            ✖
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit}>
          {/* LEAVE TYPE */}
          <div className="field">
            <label>Leave Type</label>

            <select
              name="leaveTypeId"
              value={formData.leaveTypeId}
              onChange={handleChange}
              required
              className="leave-input"
            >
              <option value="">
                Select Leave Type
              </option>

              {leaveTypes.map((item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.name} ({item.code})
                </option>
              ))}
            </select>
          </div>

          {/* DATES */}
          <div className="date-grid">
            <div className="field">
              <label>From Date</label>

              <input
                type="date"
                name="fromDate"
                value={formData.fromDate}
                onChange={handleChange}
                required
                className="leave-input"
              />
            </div>

            <div className="field">
              <label>To Date</label>

              <input
                type="date"
                name="toDate"
                value={formData.toDate}
                onChange={handleChange}
                required
                className="leave-input"
              />
            </div>
          </div>

          {/* MODE */}
          <div className="field">
            <label>Leave Mode</label>

            <select
              name="leaveMode"
              value={formData.leaveMode}
              onChange={handleChange}
              className="leave-input"
            >
              <option value="FULL">
                Full Day
              </option>

              <option value="HALF">
                Half Day
              </option>
            </select>
          </div>

          {/* REASON */}
          <div className="field">
            <label>Reason</label>

            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              rows={4}
              placeholder="Write reason..."
              className="leave-input"
            />
          </div>

          {/* BUTTONS */}
          <div className="btn-row">
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="submit-btn"
            >
              {loading
                ? "Applying..."
                : "Apply Leave"}
            </button>
          </div>
        </form>
      </div>

      {/* STYLES */}
      <style>{`
        .leave-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,.45);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          backdrop-filter: blur(4px);
          animation: fadeIn .2s ease;
        }

        .leave-modal-box {
          width: 95%;
          max-width: 650px;
          background: #fff;
          border-radius: 24px;
          padding: 25px;
          box-shadow: 0 15px 40px rgba(0,0,0,.2);
          animation: scaleIn .2s ease;
        }

        .leave-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }

        .leave-modal-header h2 {
          margin: 0;
        }

        .leave-modal-header p {
          margin-top: 5px;
          color: #666;
          font-size: 14px;
        }

        .close-btn {
          border: none;
          background: #f3f4f6;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          cursor: pointer;
          transition: .2s;
        }

        .close-btn:hover {
          background: #e5e7eb;
          transform: rotate(90deg);
        }

        .field {
          margin-bottom: 18px;
        }

        .field label {
          font-weight: 600;
          font-size: 14px;
        }

        .leave-input {
          width: 100%;
          margin-top: 6px;
          padding: 12px;
          border-radius: 14px;
          border: 1px solid #ddd;
          transition: .2s;
          font-size: 14px;
        }

        .leave-input:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 4px rgba(37,99,235,.1);
        }

        .date-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit,minmax(220px,1fr));
          gap: 15px;
        }

        .btn-row {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 25px;
        }

        .submit-btn,
        .cancel-btn {
          border: none;
          padding: 12px 18px;
          border-radius: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: .2s;
        }

        .submit-btn {
          background: #2563eb;
          color: #fff;
        }

        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(37,99,235,.2);
        }

        .cancel-btn {
          background: #f3f4f6;
        }

        .cancel-btn:hover {
          background: #e5e7eb;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            transform: scale(.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default ApplyLeaveModal;