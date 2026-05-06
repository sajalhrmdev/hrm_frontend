import React, { useState } from "react";
import axiosInstance from "@/utils/axiosInstance";

type FormDataType = {
  name: string;
  code: string;
  is_paid: boolean;
  carryForward: boolean;
  maxDays: number;
};

const LeaveTypeForm: React.FC = () => {
  const [formData, setFormData] = useState<FormDataType>({
    name: "",
    code: "",
    is_paid: true,
    carryForward: false,
    maxDays: 0,
  });

  const [loading, setLoading] = useState(false);

  // 🔥 input handler
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
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

      const res = await axiosInstance.post(
        "/leave/type",
        formData
      );

      alert("✅ Leave Type Created");

      console.log(res.data);

      // reset
      setFormData({
        name: "",
        code: "",
        is_paid: true,
        carryForward: false,
        maxDays: 0,
      });
    } catch (err: any) {
      console.log(err);

      alert(
        err?.response?.data?.message ||
          "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "30px auto",
        padding: "20px",
        borderRadius: "16px",
        boxShadow: "0 5px 20px rgba(0,0,0,0.1)",
        background: "#fff",
      }}
    >
      <h2 style={{ marginBottom: "20px" }}>
        ➕ Create Leave Type
      </h2>

      <form onSubmit={handleSubmit}>
        {/* NAME */}
        <div style={{ marginBottom: "15px" }}>
          <label>Name</label>

          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="form-control"
          />
        </div>

        {/* CODE */}
        <div style={{ marginBottom: "15px" }}>
          <label>Code</label>

          <input
            type="text"
            name="code"
            value={formData.code}
            onChange={handleChange}
            required
            className="form-control"
          />
        </div>

        {/* MAX DAYS */}
        <div style={{ marginBottom: "15px" }}>
          <label>Max Days</label>

          <input
            type="number"
            name="maxDays"
            value={formData.maxDays}
            onChange={handleChange}
            className="form-control"
          />
        </div>

        {/* CHECKBOXES */}
        <div style={{ marginBottom: "10px" }}>
          <label>
            <input
              type="checkbox"
              name="is_paid"
              checked={formData.is_paid}
              onChange={handleChange}
            />{" "}
            Paid Leave
          </label>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label>
            <input
              type="checkbox"
              name="carryForward"
              checked={formData.carryForward}
              onChange={handleChange}
            />{" "}
            Carry Forward
          </label>
        </div>

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? "Creating..." : "Create Leave Type"}
        </button>
      </form>
    </div>
  );
};

export default LeaveTypeForm;