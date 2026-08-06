"use client";

import React, { useEffect, useState } from "react";

import axiosInstance from "@/utils/axiosInstance";
import { SkeletonTable } from "@/core/common/Skeleton";

type Meeting = {
  id: number;
  title: string;
  description: string;
  location: string;
  meetingType: "INTERNAL" | "EXTERNAL" | "VIRTUAL";
  date: string;
  organizer?: { id: number; name: string; employeeCode?: string | null } | null;
  startTime: string;
  endTime: string;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
  attendees?: {
    id: number;
    employeeId: number;
    employee?: { id: number; name: string; employeeCode?: string | null } | null;
  }[];
  createdAt: string;
};

const STATUS_BADGE: Record<string, string> = {
  SCHEDULED: "badge-soft-primary",
  COMPLETED: "badge-soft-success",
  CANCELLED: "badge-soft-danger",
};

const TYPE_BADGE: Record<string, string> = {
  INTERNAL: "badge-soft-info",
  EXTERNAL: "badge-soft-warning",
  VIRTUAL: "badge-soft-secondary",
};

const MyMeetingPage = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchMyMeetings = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(
        `/meeting/my?page=${page}&limit=20`,
      );
      setMeetings(res?.data?.data?.meetings || []);
      setTotalPages(res?.data?.data?.pagination?.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyMeetings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const attendeeNames = (item: Meeting) =>
    (item.attendees || [])
      .map((a) => a.employee?.name)
      .filter(Boolean)
      .join(", ");

  return (
    <div>
      <div className="page-wrapper">
        <div className="content">
          <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
            <div className="my-auto mb-2">
              <h2 className="mb-1">My Meetings</h2>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">HRM Employee</li>
                  <li className="breadcrumb-item active" aria-current="page">
                    My Meetings
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
              ) : meetings.length === 0 ? (
                <div className="text-center py-5">
                  <i className="ti ti-calendar-off fs-1 text-muted d-block mb-2" />
                  <p className="text-muted mb-0">No meetings scheduled.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="ps-4">Title</th>
                        <th>Type</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Location</th>
                        <th>Attendees</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {meetings.map((item) => (
                        <tr key={item.id}>
                          <td className="ps-4">
                            <div className="fw-semibold">{item.title}</div>
                            {item.description && (
                              <small className="text-muted">
                                {item.description}
                              </small>
                            )}
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                TYPE_BADGE[item.meetingType] ||
                                "badge-soft-secondary"
                              } badge-sm`}
                            >
                              {item.meetingType}
                            </span>
                          </td>
                          <td>{new Date(item.date).toLocaleDateString()}</td>
                          <td>
                            {item.startTime} - {item.endTime}
                          </td>
                          <td>{item.location || "-"}</td>
                          <td>
                            {item.attendees?.length ? (
                              <span title={attendeeNames(item)}>
                                {item.attendees.length}{" "}
                                {item.attendees.length === 1
                                  ? "attendee"
                                  : "attendees"}
                              </span>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                STATUS_BADGE[item.status] ||
                                "badge-soft-secondary"
                              } badge-sm`}
                            >
                              {item.status}
                            </span>
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

export default MyMeetingPage;
