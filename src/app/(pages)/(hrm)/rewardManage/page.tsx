"use client";

import React, { useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { toast } from "react-toastify";

interface Employee {
  id: number;
  name: string;
}

interface EmployeeReward {
  id: number;
  employeeId: number;

  title: string;

  description?: string;

  rewardType: string;

  rewardAmount?: number;

  rewardDate: string;

  employee?: Employee;
}

const RewardManagement = () => {
  const [rewards, setRewards] = useState<EmployeeReward[]>([]);

  const [employees, setEmployees] = useState<Employee[]>([]);

  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    employeeId: "",
    title: "",
    description: "",
    rewardType: "",
    rewardAmount: "",
    rewardDate: "",
  });

  const fetchRewards = async () => {
    try {
      setLoading(true);

      const response = await axiosInstance.get("/rewards");

      setRewards(response.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axiosInstance.get("/employee");

      setEmployees(response?.data.data.employees || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchRewards();
    fetchEmployees();
  }, []);

  const resetForm = () => {
    setFormData({
      employeeId: "",
      title: "",
      description: "",
      rewardType: "",
      rewardAmount: "",
      rewardDate: "",
    });

    setEditingId(null);
  };
  const handleSubmit = async () => {
    try {
      if (!formData.employeeId) {
        toast.warning("Please select employee");
        return;
      }

      if (!formData.title) {
        toast.warning("Title is required");
        return;
      }

      if (!formData.rewardType) {
        toast.warning("Reward type is required");
        return;
      }

      if (!formData.rewardDate) {
        toast.warning("Reward date is required");
        return;
      }

      const payload = {
        employeeId: Number(formData.employeeId),

        title: formData.title,

        description: formData.description,

        rewardType: formData.rewardType,

        rewardAmount: formData.rewardAmount
          ? Number(formData.rewardAmount)
          : undefined,

        rewardDate: formData.rewardDate,
      };

      if (editingId) {
        await axiosInstance.patch(`/rewards/${editingId}`, payload);

        toast.success("Reward Updated Successfully");
      } else {
        await axiosInstance.post("/rewards", payload);

        toast.success("Reward Created Successfully");
      }

      setShowModal(false);

      resetForm();

      fetchRewards();
    } catch (error: any) {
      console.error(error);

      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  const handleEdit = (reward: EmployeeReward) => {
    setEditingId(reward.id);

    setFormData({
      employeeId: String(reward.employeeId),

      title: reward.title,

      description: reward.description || "",

      rewardType: reward.rewardType,

      rewardAmount: String(reward.rewardAmount || ""),

      rewardDate: reward.rewardDate.split("T")[0],
    });

    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this reward?",
    );

    if (!confirmed) return;

    try {
      await axiosInstance.delete(`/rewards/${id}`);

      toast.success("Reward Deleted Successfully");

      fetchRewards();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Delete failed");
    }
  };

  const filteredRewards = rewards.filter((reward) =>
    reward.employee?.name?.toLowerCase().includes(search.toLowerCase()),
  );

  const rewardTypes = [
    "Employee Of The Month",

    "Best Performer",

    "Attendance Award",

    "Team Excellence",

    "Spot Award",

    "Leadership Award",

    "Innovation Award",

    "Customer Appreciation",

    "Project Completion Award",
  ];
  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="container-fluid py-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="mb-0">Employee Rewards & Recognition</h4>

            <button
              className="btn btn-primary"
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
            >
              Add Reward
            </button>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="row mb-3">
                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search Employee..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="table-responsive">
                <table className="table table-striped table-hover table-bordered align-middle">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Title</th>
                      <th>Reward Type</th>
                      <th>Amount</th>
                      <th>Date</th>
                      <th>Description</th>
                      <th style={{ width: "150px" }}>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="text-center">
                          Loading...
                        </td>
                      </tr>
                    ) : filteredRewards.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center">
                          No Rewards Found
                        </td>
                      </tr>
                    ) : (
                      filteredRewards.map((reward) => (
                        <tr key={reward.id}>
                          <td>
                            <strong>{reward.employee?.name}</strong>
                          </td>

                          <td>{reward.title}</td>

                          <td>
                            <span className="badge bg-info">
                              {reward.rewardType}
                            </span>
                          </td>

                          <td>
                            {reward.rewardAmount
                              ? `₹${Number(reward.rewardAmount).toLocaleString()}`
                              : "-"}
                          </td>

                          <td>
                            {new Date(reward.rewardDate).toLocaleDateString()}
                          </td>

                          <td>{reward.description}</td>

                          <td>
                            <button
                              className="btn btn-warning btn-sm me-2"
                              onClick={() => handleEdit(reward)}
                            >
                              Edit
                            </button>

                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDelete(reward.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {showModal && (
            <>
              <div className="modal fade show d-block">
                <div className="modal-dialog modal-lg">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">
                        {editingId ? "Edit Reward" : "Add Reward"}
                      </h5>

                      <button
                        className="btn-close"
                        onClick={() => {
                          setShowModal(false);
                          resetForm();
                        }}
                      />
                    </div>

                    <div className="modal-body">
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Employee</label>

                          <select
                            disabled={!!editingId}
                            className="form-select"
                            value={formData.employeeId}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                employeeId: e.target.value,
                              })
                            }
                          >
                            <option value="">Select Employee</option>

                            {employees.map((employee) => (
                              <option key={employee.id} value={employee.id}>
                                {employee.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="col-md-6 mb-3">
                          <label className="form-label">Reward Type</label>

                          <select
                            className="form-select"
                            value={formData.rewardType}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                rewardType: e.target.value,
                              })
                            }
                          >
                            <option value="">Select Reward Type</option>

                            {rewardTypes.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="col-md-6 mb-3">
                          <label className="form-label">Title</label>

                          <input
                            type="text"
                            className="form-control"
                            value={formData.title}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                title: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="col-md-6 mb-3">
                          <label className="form-label">Reward Amount</label>

                          <input
                            type="number"
                            className="form-control"
                            value={formData.rewardAmount}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                rewardAmount: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="col-md-6 mb-3">
                          <label className="form-label">Reward Date</label>

                          <input
                            type="date"
                            className="form-control"
                            value={formData.rewardDate}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                rewardDate: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="col-12 mb-3">
                          <label className="form-label">Description</label>

                          <textarea
                            rows={4}
                            className="form-control"
                            value={formData.description}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                description: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className="modal-footer">
                      <button
                        className="btn btn-secondary"
                        onClick={() => {
                          setShowModal(false);
                          resetForm();
                        }}
                      >
                        Cancel
                      </button>

                      <button
                        className="btn btn-primary"
                        onClick={handleSubmit}
                      >
                        {editingId ? "Update" : "Save"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-backdrop fade show"></div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RewardManagement;
