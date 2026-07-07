"use client";

import React, { useEffect, useMemo, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { toast } from "react-toastify";

interface Employee {
  id: number;
  name: string;
}

interface PerformanceReview {
  id: number;
  companyId: number;
  employeeId: number;

  punctuality: number;
  teamwork: number;
  productivity: number;

  overallRating: number;

  comments?: string;

  reviewMonth: number;
  reviewYear: number;

  employee?: Employee;
}

const PerformanceReviewManagement = () => {
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    employeeId: "",
    punctuality: 1,
    teamwork: 1,
    productivity: 1,
    comments: "",
    reviewMonth: new Date().getMonth() + 1,
    reviewYear: new Date().getFullYear(),
  });

  const fetchReviews = async () => {
    try {
      setLoading(true);

      const response = await axiosInstance.get("/performance");

      setReviews(response.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axiosInstance.get("/employee");

      setEmployees(response.data.data.employees || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchReviews();
    fetchEmployees();
  }, []);

  const overallRating = useMemo(() => {
    return (
      (Number(formData.punctuality) +
        Number(formData.teamwork) +
        Number(formData.productivity)) /
      3
    ).toFixed(2);
  }, [formData]);

  const resetForm = () => {
    setFormData({
      employeeId: "",
      punctuality: 1,
      teamwork: 1,
      productivity: 1,
      comments: "",
      reviewMonth: new Date().getMonth() + 1,
      reviewYear: new Date().getFullYear(),
    });

    setEditingId(null);
  };
  const handleSubmit = async () => {
    try {
      const payload = {
        employeeId: Number(formData.employeeId),
        punctuality: Number(formData.punctuality),
        teamwork: Number(formData.teamwork),
        productivity: Number(formData.productivity),
        comments: formData.comments,
        reviewMonth: Number(formData.reviewMonth),
        reviewYear: Number(formData.reviewYear),
      };

      if (editingId) {
        await axiosInstance.patch(`/performance/${editingId}`, payload);

        toast.success("Performance Review Updated Successfully");
      } else {
        await axiosInstance.post("/performance", payload);

        toast.success("Performance Review Created Successfully");
      }

      setShowModal(false);

      resetForm();

      fetchReviews();
    } catch (error) {
      console.error(error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong";

      toast.error(message);
    }
  };

  const handleEdit = (review: PerformanceReview) => {
    setEditingId(review.id);

    setFormData({
      employeeId: String(review.employeeId),
      punctuality: review.punctuality,
      teamwork: review.teamwork,
      productivity: review.productivity,
      comments: review.comments || "",
      reviewMonth: review.reviewMonth,
      reviewYear: review.reviewYear,
    });

    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this review?",
    );

    if (!confirmed) return;

    try {
      await axiosInstance.delete(`/performance-reviews/${id}`);

      alert("Review Deleted Successfully");

      fetchReviews();
    } catch (error) {
      console.error(error);
      alert("Failed To Delete Review");
    }
  };

  const filteredReviews = reviews.filter((review) =>
    review.employee?.name?.toLowerCase().includes(search.toLowerCase()),
  );

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const years = Array.from(
    { length: 10 },
    (_, index) => new Date().getFullYear() - 5 + index,
  );
  const getRatingBadge = (rating: number) => {
    if (rating < 3) {
      return "bg-danger";
    }

    if (rating < 4) {
      return "bg-warning text-dark";
    }

    return "bg-success";
  };
  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="container-fluid py-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="mb-0">Employee Performance Reviews</h4>

            <button
              className="btn btn-primary"
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
            >
              Add Review
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
                <table className="table table-bordered table-hover align-middle">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Month</th>
                      <th>Year</th>
                      <th>Punctuality</th>
                      <th>Teamwork</th>
                      <th>Productivity</th>
                      <th>Rating</th>
                      <th>Comments</th>
                      <th width="160">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={9} className="text-center">
                          Loading...
                        </td>
                      </tr>
                    ) : filteredReviews.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center">
                          No Reviews Found
                        </td>
                      </tr>
                    ) : (
                      filteredReviews.map((review) => (
                        <tr key={review.id}>
                          <td>{review.employee?.name}</td>

                          <td>{months[review.reviewMonth - 1]}</td>

                          <td>{review.reviewYear}</td>

                          <td>{review.punctuality}</td>

                          <td>{review.teamwork}</td>

                          <td>{review.productivity}</td>

                          <td>
                            <span
                              className={`badge ${getRatingBadge(
                                Math.round(review.overallRating),
                              )}`}
                            >
                              {Number(review.overallRating).toFixed(2)}
                            </span>
                          </td>

                          <td>{review.comments}</td>

                          <td>
                            <button
                              className="btn btn-sm btn-warning me-2"
                              onClick={() => handleEdit(review)}
                            >
                              Edit
                            </button>

                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDelete(review.id)}
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
              <div className="modal fade show d-block" tabIndex={-1}>
                <div className="modal-dialog modal-lg">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">
                        {editingId
                          ? "Edit Performance Review"
                          : "Add Performance Review"}
                      </h5>

                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => setShowModal(false)}
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

                            {employees?.map((employee) => (
                              <option key={employee.id} value={employee.id}>
                                {employee.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="col-md-3 mb-3">
                          <label className="form-label">Month</label>

                          <select
                            className="form-select"
                            value={formData.reviewMonth}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                reviewMonth: Number(e.target.value),
                              })
                            }
                          >
                            {months.map((month, index) => (
                              <option key={month} value={index + 1}>
                                {month}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="col-md-3 mb-3">
                          <label className="form-label">Year</label>

                          <select
                            className="form-select"
                            value={formData.reviewYear}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                reviewYear: Number(e.target.value),
                              })
                            }
                          >
                            {years.map((year) => (
                              <option key={year} value={year}>
                                {year}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="col-md-4 mb-3">
                          <label className="form-label">Punctuality</label>

                          <select
                            className="form-select"
                            value={formData.punctuality}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                punctuality: Number(e.target.value),
                              })
                            }
                          >
                            {[1, 2, 3, 4, 5].map((value) => (
                              <option key={value} value={value}>
                                {value}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="col-md-4 mb-3">
                          <label className="form-label">Teamwork</label>

                          <select
                            className="form-select"
                            value={formData.teamwork}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                teamwork: Number(e.target.value),
                              })
                            }
                          >
                            {[1, 2, 3, 4, 5].map((value) => (
                              <option key={value} value={value}>
                                {value}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="col-md-4 mb-3">
                          <label className="form-label">Productivity</label>

                          <select
                            className="form-select"
                            value={formData.productivity}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                productivity: Number(e.target.value),
                              })
                            }
                          >
                            {[1, 2, 3, 4, 5].map((value) => (
                              <option key={value} value={value}>
                                {value}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="col-12 mb-3">
                          <div className="alert alert-info">
                            Overall Rating :<strong> {overallRating}</strong>
                          </div>
                        </div>

                        <div className="col-12">
                          <label className="form-label">Comments</label>

                          <textarea
                            rows={4}
                            className="form-control"
                            value={formData.comments}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                comments: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className="modal-footer">
                      <button
                        className="btn btn-secondary"
                        onClick={() => setShowModal(false)}
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

export default PerformanceReviewManagement;
