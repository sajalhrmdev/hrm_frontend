import React, { useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";

type Employee = {
  id: number;
  name: string;
};

type LeaveType = {
  id: number;
  name: string;
  code: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
};

const AllocateLeaveBalanceModal: React.FC<Props> = ({
  open,
  onClose,
}) => {
  const [employees, setEmployees] = useState<
    Employee[]
  >([]);

  const [leaveTypes, setLeaveTypes] = useState<
    LeaveType[]
  >([]);

  const [loading, setLoading] = useState(false);

  const currentYear = new Date().getFullYear();

  const [formData, setFormData] = useState({
    employeeId: "",
    leaveTypeId: "",
    year: currentYear,
    total_allocated: 0,
  });

  // 🔥 fetch data
  const fetchInitialData = async () => {
    try {
      const [empRes, leaveRes] =
        await Promise.all([
          axiosInstance.get("/employee"),
          axiosInstance.get(
            "/leave/types?is_active=true"
          ),
        ]);

      setEmployees(empRes.data.data || []);
      setLeaveTypes(leaveRes.data.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (open) {
      fetchInitialData();
    }
  }, [open]);

  // 🔥 handle input
  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "year" ||
        name === "total_allocated"
          ? Number(value)
          : value,
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
        "/leave/allocate",
        formData
      );

      alert(
        "✅ Leave balance allocated successfully"
      );

      // reset
      setFormData({
        employeeId: "",
        leaveTypeId: "",
        year: currentYear,
        total_allocated: 0,
      });

      onClose();
    } catch (err: any) {
      console.log(err);

      alert(
        err?.response?.data?.message ||
          "Allocation failed"
      );
    } finally {
      setLoading(false);
    }
  };

  // ❌ hidden
  if (!open) return null;

  return (
    <div className="allocate-overlay">
      <div className="allocate-modal">
        {/* HEADER */}
        <div className="allocate-header">
          <div>
            <h2>🎯 Allocate Leave Balance</h2>

            <p>
              Assign leave days to employee
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
          {/* EMPLOYEE */}
          <div className="field">
            <label>Employee</label>

            <select
              name="employeeId"
              value={formData.employeeId}
              onChange={handleChange}
              required
              className="allocate-input"
            >
              <option value="">
                Select Employee
              </option>

              {employees.map((emp) => (
                <option
                  key={emp.id}
                  value={emp.id}
                >
                  {emp.name}
                </option>
              ))}
            </select>
          </div>

          {/* LEAVE TYPE */}
          <div className="field">
            <label>Leave Type</label>

            <select
              name="leaveTypeId"
              value={formData.leaveTypeId}
              onChange={handleChange}
              required
              className="allocate-input"
            >
              <option value="">
                Select Leave Type
              </option>

              {leaveTypes.map((lt) => (
                <option
                  key={lt.id}
                  value={lt.id}
                >
                  {lt.name} ({lt.code})
                </option>
              ))}
            </select>
          </div>

          {/* YEAR + DAYS */}
          <div className="grid-2">
            <div className="field">
              <label>Year</label>

              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="allocate-input"
              />
            </div>

            <div className="field">
              <label>Total Days</label>

              <input
                type="number"
                name="total_allocated"
                value={
                  formData.total_allocated
                }
                onChange={handleChange}
                required
                className="allocate-input"
              />
            </div>
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
                ? "Allocating..."
                : "Allocate Leave"}
            </button>
          </div>
        </form>
      </div>

      {/* STYLES */}
      <style>{`
        .allocate-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,.45);
          backdrop-filter: blur(4px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          animation: fadeIn .2s ease;
        }

        .allocate-modal {
          width: 95%;
          max-width: 650px;
          background: #fff;
          border-radius: 24px;
          padding: 25px;
          box-shadow: 0 20px 40px rgba(0,0,0,.2);
          animation: scaleIn .2s ease;
        }

        .allocate-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
        }

        .allocate-header h2 {
          margin: 0;
        }

        .allocate-header p {
          margin-top: 6px;
          font-size: 14px;
          color: #666;
        }

        .close-btn {
          border: none;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          cursor: pointer;
          background: #f3f4f6;
          transition: .2s;
        }

        .close-btn:hover {
          transform: rotate(90deg);
          background: #e5e7eb;
        }

        .field {
          margin-bottom: 18px;
        }

        .field label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 6px;
        }

        .allocate-input {
          width: 100%;
          padding: 12px;
          border-radius: 14px;
          border: 1px solid #ddd;
          font-size: 14px;
          transition: .2s;
        }

        .allocate-input:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 4px rgba(37,99,235,.1);
        }

        .grid-2 {
          display: grid;
          grid-template-columns: repeat(auto-fit,minmax(200px,1fr));
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
          cursor: pointer;
          font-weight: 600;
          transition: .2s;
        }

        .submit-btn {
          background: #2563eb;
          color: white;
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
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default AllocateLeaveBalanceModal;