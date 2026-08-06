"use client";

import React, { useEffect, useRef, useState } from "react";

import axiosInstance from "@/utils/axiosInstance";
import { SkeletonTable } from "@/core/common/Skeleton";

type Meeting = {
  id: number;
  title: string;
  description: string;
  location: string;
  meetingType: "INTERNAL" | "EXTERNAL" | "VIRTUAL";
  date: string;
  organizerId?: number | null;
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

type Employee = {
  id: number;
  name: string;
  employeeCode?: string;
};

const STATUS_BADGE: Record<string, string> = {
  SCHEDULED: "bg-primary",
  COMPLETED: "bg-success",
  CANCELLED: "bg-danger",
};

const TYPE_BADGE: Record<string, string> = {
  INTERNAL: "bg-info",
  EXTERNAL: "bg-warning",
  VIRTUAL: "bg-secondary",
};

const toDateInputValue = (d: string) => {
  const dt = new Date(d);
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${dt.getFullYear()}-${m}-${day}`;
};

const MeetingPage = () => {
  const [loading, setLoading] = useState(false);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Meeting | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    limit: 10,
  });

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    meetingType: "INTERNAL",
    date: "",
    startTime: "",
    endTime: "",
    status: "SCHEDULED",
  });

  const [organizerSelected, setOrganizerSelected] = useState<Employee | null>(
    null,
  );
  const [organizerSearch, setOrganizerSearch] = useState("");
  const [organizerResults, setOrganizerResults] = useState<Employee[]>([]);
  const [organizerLoading, setOrganizerLoading] = useState(false);
  const [organizerOpen, setOrganizerOpen] = useState(false);

  const [attendeeChips, setAttendeeChips] = useState<Employee[]>([]);
  const [attendeeSearch, setAttendeeSearch] = useState("");
  const [attendeeResults, setAttendeeResults] = useState<Employee[]>([]);
  const [attendeeLoading, setAttendeeLoading] = useState(false);
  const [attendeeOpen, setAttendeeOpen] = useState(false);

  const organizerAbortRef = useRef<AbortController | null>(null);
  const organizerDebounceRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const organizerDropdownRef = useRef<HTMLDivElement>(null);

  const attendeeAbortRef = useRef<AbortController | null>(null);
  const attendeeDebounceRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const attendeeDropdownRef = useRef<HTMLDivElement>(null);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(
        `/meeting?page=${page}&limit=10&search=${search}`,
      );
      setMeetings(res?.data?.data?.meetings || []);
      setPagination(res?.data?.data?.pagination);
    } catch (err: any) {
      console.log(err);
      alert(err?.response?.data?.message || "Failed to fetch meetings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchMeetings();
  };

  useEffect(() => {
    if (organizerDebounceRef.current) clearTimeout(organizerDebounceRef.current);

    if (organizerSearch.trim().length < 2) {
      setOrganizerResults([]);
      setOrganizerLoading(false);
      return;
    }

    setOrganizerLoading(true);

    organizerDebounceRef.current = setTimeout(() => {
      organizerAbortRef.current?.abort();
      const controller = new AbortController();
      organizerAbortRef.current = controller;

      axiosInstance
        .get(
          `/employee?search=${encodeURIComponent(organizerSearch.trim())}&limit=8`,
          { signal: controller.signal },
        )
        .then((res) => {
          setOrganizerResults(
            res?.data?.data?.employees || res?.data?.data || [],
          );
        })
        .catch((err) => {
          if (err?.name !== "CanceledError" && err?.code !== "ERR_CANCELED") {
            console.log(err);
          }
        })
        .finally(() => setOrganizerLoading(false));
    }, 500);

    return () => {
      if (organizerDebounceRef.current)
        clearTimeout(organizerDebounceRef.current);
    };
  }, [organizerSearch]);

  useEffect(() => {
    if (attendeeDebounceRef.current) clearTimeout(attendeeDebounceRef.current);

    if (attendeeSearch.trim().length < 2) {
      setAttendeeResults([]);
      setAttendeeLoading(false);
      return;
    }

    setAttendeeLoading(true);

    attendeeDebounceRef.current = setTimeout(() => {
      attendeeAbortRef.current?.abort();
      const controller = new AbortController();
      attendeeAbortRef.current = controller;

      axiosInstance
        .get(
          `/employee?search=${encodeURIComponent(attendeeSearch.trim())}&limit=8`,
          { signal: controller.signal },
        )
        .then((res) => {
          setAttendeeResults(res?.data?.data?.employees || res?.data?.data || []);
        })
        .catch((err) => {
          if (err?.name !== "CanceledError" && err?.code !== "ERR_CANCELED") {
            console.log(err);
          }
        })
        .finally(() => setAttendeeLoading(false));
    }, 500);

    return () => {
      if (attendeeDebounceRef.current)
        clearTimeout(attendeeDebounceRef.current);
    };
  }, [attendeeSearch]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        organizerDropdownRef.current &&
        !organizerDropdownRef.current.contains(e.target as Node)
      ) {
        setOrganizerOpen(false);
      }
      if (
        attendeeDropdownRef.current &&
        !attendeeDropdownRef.current.contains(e.target as Node)
      ) {
        setAttendeeOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const selectOrganizer = (emp: Employee) => {
    setOrganizerSelected(emp);
    setOrganizerSearch(emp.name);
    setOrganizerOpen(false);
  };

  const clearOrganizer = () => {
    setOrganizerSelected(null);
    setOrganizerSearch("");
  };

  const toggleAttendee = (emp: Employee) => {
    setAttendeeChips((prev) =>
      prev.some((x) => x.id === emp.id)
        ? prev.filter((x) => x.id !== emp.id)
        : [...prev, emp],
    );
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      location: "",
      meetingType: "INTERNAL",
      date: "",
      startTime: "",
      endTime: "",
      status: "SCHEDULED",
    });
    setOrganizerSelected(null);
    setOrganizerSearch("");
    setOrganizerResults([]);
    setAttendeeChips([]);
    setAttendeeSearch("");
    setAttendeeResults([]);
    setEditing(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (item: Meeting) => {
    setEditing(item);
    setFormData({
      title: item.title,
      description: item.description,
      location: item.location,
      meetingType: item.meetingType,
      date: toDateInputValue(item.date),
      startTime: item.startTime,
      endTime: item.endTime,
      status: item.status,
    });
    setOrganizerSelected(item.organizer || null);
    setOrganizerSearch(item.organizer?.name || "");
    setOrganizerResults([]);
    setAttendeeChips(
      (item.attendees || [])
        .map((a) => a.employee)
        .filter((e): e is Employee => Boolean(e)),
    );
    setAttendeeSearch("");
    setAttendeeResults([]);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!organizerSelected) {
        alert("Organizer is required");
        return;
      }
      const payload = {
        ...formData,
        organizerId: organizerSelected.id,
        attendees: attendeeChips.map((emp) => emp.id),
      };
      if (editing) {
        await axiosInstance.put(`/meeting/${editing.id}`, payload);
        alert("Meeting updated successfully");
      } else {
        await axiosInstance.post("/meeting", payload);
        alert("Meeting created successfully");
      }
      setShowModal(false);
      resetForm();
      fetchMeetings();
    } catch (err: any) {
      console.log(err);
      alert(err?.response?.data?.message || "Failed");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const confirmDelete = window.confirm("Delete meeting?");
      if (!confirmDelete) return;
      await axiosInstance.delete(`/meeting/${id}`);
      alert("Meeting deleted");
      fetchMeetings();
    } catch (err: any) {
      console.log(err);
      alert(err?.response?.data?.message || "Delete failed");
    }
  };

  const attendeeNames = (item: Meeting) =>
    (item.attendees || [])
      .map((a) => a.employee?.name)
      .filter(Boolean)
      .join(", ");

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
          <div>
            <h3 className="fw-bold mb-1">Meeting Management</h3>
            <p className="text-muted mb-0">Manage employee meetings</p>
          </div>
          <button className="btn btn-primary" onClick={handleOpenCreate}>
            <i className="ti ti-plus me-1" /> Add Meeting
          </button>
        </div>

        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <form onSubmit={handleSearch}>
              <div className="row g-3">
                <div className="col-md-10">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search meeting..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="col-md-2">
                  <button type="submit" className="btn btn-dark w-100">
                    <i className="ti ti-search me-1" /> Search
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div className="card border-0 shadow-sm">
          <div className="card-body">
            {loading ? (
              <SkeletonTable rows={5} columns={9} />
            ) : (
              <div className="table-responsive">
                <table className="table table-bordered align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Title</th>
                      <th>Organizer</th>
                      <th>Type</th>
                      <th>Date</th>
                      <th>Start Time</th>
                      <th>End Time</th>
                      <th>Location</th>
                      <th>Attendees</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {meetings.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="text-center py-4">
                          No meetings found
                        </td>
                      </tr>
                    ) : (
                      meetings.map((item, index) => (
                        <tr key={item.id}>
                          <td>{(page - 1) * 10 + index + 1}</td>
                          <td>
                            <div className="fw-semibold">{item.title}</div>
                            {item.description && (
                              <small className="text-muted d-block">
                                {item.description}
                              </small>
                            )}
                          </td>
                          <td>{item.organizer?.name || "-"}</td>
                          <td>
                            <span
                              className={`badge ${
                                TYPE_BADGE[item.meetingType] || "bg-secondary"
                              }`}
                            >
                              {item.meetingType}
                            </span>
                          </td>
                          <td>{new Date(item.date).toLocaleDateString()}</td>
                          <td>{item.startTime}</td>
                          <td>{item.endTime}</td>
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
                                STATUS_BADGE[item.status] || "bg-secondary"
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <button
                                className="btn btn-sm btn-dark"
                                onClick={() => handleEdit(item)}
                              >
                                <i className="ti ti-edit me-1" /> Edit
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDelete(item.id)}
                              >
                                <i className="ti ti-trash me-1" /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-center mt-4">
          <div className="text-muted">Total: {pagination?.total}</div>
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-dark"
              disabled={page === 1}
              onClick={() => setPage((prev) => prev - 1)}
            >
              Previous
            </button>
            <button className="btn btn-dark">{page}</button>
            <button
              className="btn btn-outline-dark"
              disabled={page === pagination?.totalPages}
              onClick={() => setPage((prev) => prev + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div
          className="modal d-block"
          style={{
            background: "rgba(0,0,0,0.5)",
          }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  {editing ? "Edit Meeting" : "Add Meeting"}
                </h5>
                <button
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                />
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Title <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Enter Title"
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Location <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="location"
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Meeting Type
                      </label>
                      <select
                        className="form-select"
                        name="meetingType"
                        value={formData.meetingType}
                        onChange={handleChange}
                      >
                        <option value="INTERNAL">INTERNAL</option>
                        <option value="EXTERNAL">EXTERNAL</option>
                        <option value="VIRTUAL">VIRTUAL</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Date Schedule <span className="text-danger">*</span>
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Organizer <span className="text-danger">*</span>
                      </label>
                      <div
                        className="searchable-select"
                        ref={organizerDropdownRef}
                      >
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search organizer (min 2 chars)..."
                          value={organizerSearch}
                          onChange={(e) => {
                            if (e.target.value !== organizerSelected?.name) {
                              clearOrganizer();
                            }
                            setOrganizerSearch(e.target.value);
                            setOrganizerOpen(true);
                          }}
                          onFocus={() => setOrganizerOpen(true)}
                        />
                        {organizerOpen && (
                          <div className="searchable-list">
                            {organizerLoading ? (
                              <div className="searchable-item empty">
                                Searching...
                              </div>
                            ) : organizerResults.length ? (
                              organizerResults.map((emp) => (
                                <div
                                  key={emp.id}
                                  className="searchable-item"
                                  onClick={() => selectOrganizer(emp)}
                                >
                                  <strong>{emp.name}</strong>
                                  <span>{emp.employeeCode || ""}</span>
                                </div>
                              ))
                            ) : organizerSearch.trim().length >= 2 ? (
                              <div className="searchable-item empty">
                                No employees found
                              </div>
                            ) : (
                              <div className="searchable-item empty">
                                Type at least 2 characters
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Start Time <span className="text-danger">*</span>
                      </label>
                      <input
                        type="time"
                        className="form-control"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        End Time <span className="text-danger">*</span>
                      </label>
                      <input
                        type="time"
                        className="form-control"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Status</label>
                      <select
                        className="form-select"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                      >
                        <option value="SCHEDULED">SCHEDULED</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">
                        Description <span className="text-danger">*</span>
                      </label>
                      <textarea
                        className="form-control"
                        name="description"
                        rows={2}
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Enter Description"
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">
                        Attendees
                      </label>
                      {attendeeChips.length > 0 && (
                        <div className="d-flex flex-wrap gap-2 mb-2">
                          {attendeeChips.map((emp) => (
                            <span
                              key={emp.id}
                              className="badge bg-primary d-inline-flex align-items-center gap-1"
                            >
                              {emp.name}
                              <button
                                type="button"
                                className="btn p-0 border-0 text-white"
                                style={{ lineHeight: 1 }}
                                onClick={() => toggleAttendee(emp)}
                              >
                                <i className="ti ti-x" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                      <div
                        className="searchable-select"
                        ref={attendeeDropdownRef}
                      >
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search employee to add as attendee..."
                          value={attendeeSearch}
                          onChange={(e) => {
                            setAttendeeSearch(e.target.value);
                            setAttendeeOpen(true);
                          }}
                          onFocus={() => setAttendeeOpen(true)}
                        />
                        {attendeeOpen && (
                          <div className="searchable-list">
                            {attendeeLoading ? (
                              <div className="searchable-item empty">
                                Searching...
                              </div>
                            ) : attendeeResults.length ? (
                              attendeeResults.map((emp) => {
                                const isSelected = attendeeChips.some(
                                  (x) => x.id === emp.id,
                                );
                                return (
                                  <div
                                    key={emp.id}
                                    className="searchable-item"
                                    onClick={() => toggleAttendee(emp)}
                                  >
                                    <strong>{emp.name}</strong>
                                    <span>
                                      {isSelected
                                        ? "Added"
                                        : emp.employeeCode || ""}
                                    </span>
                                  </div>
                                );
                              })
                            ) : attendeeSearch.trim().length >= 2 ? (
                              <div className="searchable-item empty">
                                No employees found
                              </div>
                            ) : (
                              <div className="searchable-item empty">
                                Type at least 2 characters
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editing ? "Update Meeting" : "Create Meeting"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .searchable-select {
          position: relative;
        }
        .searchable-list {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          right: 0;
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
          z-index: 999;
          max-height: 220px;
          overflow-y: auto;
        }
        .searchable-item {
          padding: 10px 14px;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #f3f4f6;
          transition: background 0.15s ease;
        }
        .searchable-item:last-child {
          border-bottom: none;
        }
        .searchable-item:hover {
          background: #f9fafb;
        }
        .searchable-item.empty {
          color: #9ca3af;
          cursor: default;
          justify-content: center;
        }
        .searchable-item strong {
          font-size: 14px;
          color: #111827;
        }
        .searchable-item span {
          font-size: 12px;
          color: #6b7280;
        }
      `}</style>
    </div>
  );
};

export default MeetingPage;
