"use client";

import React, { useEffect, useState } from "react";

import axiosInstance from "@/utils/axiosInstance";
import { SkeletonTable } from "@/core/common/Skeleton";

type Appointment = {
  id: number;
  title: string;
  description: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
  createdAt: string;
};

const STATUS_BADGE: Record<string, string> = {
  SCHEDULED: "badge-soft-primary",
  COMPLETED: "badge-soft-success",
  CANCELLED: "badge-soft-danger",
};

const MyAppointmentPage = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchMyAppointments = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(
        `/appointment/my?page=${page}&limit=20`,
      );
      setAppointments(res?.data?.data?.appointments || []);
      setTotalPages(res?.data?.data?.pagination?.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleStatusChange = async (id: number, status: string) => {
    try {
      setUpdatingId(id);
      await axiosInstance.patch(`/appointment/my/${id}/status`, { status });
      await fetchMyAppointments();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <div className="page-wrapper">
        <div className="content">
          <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
            <div className="my-auto mb-2">
              <h2 className="mb-1">My Appointment</h2>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">HRM Employee</li>
                  <li className="breadcrumb-item active" aria-current="page">
                    My Appointment
                  </li>
                </ol>
              </nav>
            </div>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              {loading ? (
                <div className="p-4">
                  <SkeletonTable rows={5} columns={5} />
                </div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-5">
                  <i className="ti ti-calendar-off fs-1 text-muted d-block mb-2" />
                  <p className="text-muted mb-0">No appointments scheduled.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="ps-4">Title</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Location</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((item) => (
                        <tr key={item.id}>
                          <td className="ps-4">
                            <div className="fw-semibold">{item.title}</div>
                            {item.description && (
                              <small className="text-muted">
                                {item.description}
                              </small>
                            )}
                          </td>
                          <td>{new Date(item.date).toLocaleDateString()}</td>
                          <td>
                            {item.startTime} - {item.endTime}
                          </td>
                          <td>{item.location || "-"}</td>
                          <td>
                            <select
                              className={`form-select form-select-sm w-auto ${STATUS_BADGE[item.status] || "badge-soft-secondary"}`}
                              value={item.status}
                              disabled={updatingId === item.id}
                              onChange={(e) =>
                                handleStatusChange(item.id, e.target.value)
                              }
                            >
                              <option value="SCHEDULED">SCHEDULED</option>
                              <option value="COMPLETED">COMPLETED</option>
                              <option value="CANCELLED">CANCELLED</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-3">
              <button
                className="btn btn-sm btn-outline-primary me-2"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </button>
              <span className="align-self-center text-muted small">
                Page {page} of {totalPages}
              </span>
              <button
                className="btn btn-sm btn-outline-primary ms-2"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyAppointmentPage;
