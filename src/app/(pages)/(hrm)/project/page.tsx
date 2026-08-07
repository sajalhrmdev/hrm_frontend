"use client";

import React, { useEffect, useRef, useState } from "react";

import axiosInstance from "@/utils/axiosInstance";
import { SkeletonTable } from "@/core/common/Skeleton";
import ScrollProgressBar from "@/core/common/ScrollProgressBar";

type Project = {
  id: number;
  name: string;
  description: string;
  clientId?: number | null;
  client?: { id: number; name: string; companyName?: string | null } | null;
  managerId?: number | null;
  manager?: { id: number; name: string; employeeCode?: string | null } | null;
  startDate: string;
  endDate?: string | null;
  status: "NOT_STARTED" | "IN_PROGRESS" | "ON_HOLD" | "COMPLETED" | "CANCELLED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  teamMembers?: {
    id: number;
    employeeId: number;
    employee?: { id: number; name: string; employeeCode?: string | null } | null;
  }[];
  createdAt: string;
};

type Employee = {
  id: number;
  name: string;
  employeeCode?: string | null;
};

type ClientOption = {
  id: number;
  name: string;
  companyName?: string | null;
};

const STATUS_BADGE: Record<string, string> = {
  NOT_STARTED: "bg-secondary",
  IN_PROGRESS: "bg-info",
  ON_HOLD: "bg-warning",
  COMPLETED: "bg-success",
  CANCELLED: "bg-danger",
};

const PRIORITY_BADGE: Record<string, string> = {
  LOW: "bg-success",
  MEDIUM: "bg-warning",
  HIGH: "bg-danger",
};

const toDateInputValue = (d?: string | null) => {
  if (!d) return "";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "";
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${dt.getFullYear()}-${m}-${day}`;
};

const ProjectPage = () => {
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    limit: 10,
  });

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    status: "NOT_STARTED",
    priority: "MEDIUM",
  });

  const [managerSelected, setManagerSelected] = useState<Employee | null>(null);
  const [managerSearch, setManagerSearch] = useState("");
  const [managerResults, setManagerResults] = useState<Employee[]>([]);
  const [managerLoading, setManagerLoading] = useState(false);
  const [managerOpen, setManagerOpen] = useState(false);

  const [teamChips, setTeamChips] = useState<Employee[]>([]);
  const [teamSearch, setTeamSearch] = useState("");
  const [teamResults, setTeamResults] = useState<Employee[]>([]);
  const [teamLoading, setTeamLoading] = useState(false);
  const [teamOpen, setTeamOpen] = useState(false);

  const [clientSelected, setClientSelected] = useState<ClientOption | null>(null);
  const [clientSearch, setClientSearch] = useState("");
  const [clientResults, setClientResults] = useState<ClientOption[]>([]);
  const [clientLoading, setClientLoading] = useState(false);
  const [clientOpen, setClientOpen] = useState(false);

  const managerAbortRef = useRef<AbortController | null>(null);
  const managerDebounceRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const managerDropdownRef = useRef<HTMLDivElement>(null);

  const teamAbortRef = useRef<AbortController | null>(null);
  const teamDebounceRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const teamDropdownRef = useRef<HTMLDivElement>(null);

  const clientAbortRef = useRef<AbortController | null>(null);
  const clientDebounceRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const clientDropdownRef = useRef<HTMLDivElement>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(
        `/project?page=${page}&limit=10&search=${search}`,
      );
      setProjects(res?.data?.data?.projects || []);
      setPagination(res?.data?.data?.pagination);
    } catch (err: any) {
      console.log(err);
      alert(err?.response?.data?.message || "Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProjects();
  };

  useEffect(() => {
    if (managerDebounceRef.current) clearTimeout(managerDebounceRef.current);

    if (managerSearch.trim().length < 2) {
      setManagerResults([]);
      setManagerLoading(false);
      return;
    }

    setManagerLoading(true);

    managerDebounceRef.current = setTimeout(() => {
      managerAbortRef.current?.abort();
      const controller = new AbortController();
      managerAbortRef.current = controller;

      axiosInstance
        .get(
          `/employee?search=${encodeURIComponent(managerSearch.trim())}&limit=8`,
          { signal: controller.signal },
        )
        .then((res) => {
          setManagerResults(
            res?.data?.data?.employees || res?.data?.data || [],
          );
        })
        .catch((err) => {
          if (err?.name !== "CanceledError" && err?.code !== "ERR_CANCELED") {
            console.log(err);
          }
        })
        .finally(() => setManagerLoading(false));
    }, 500);

    return () => {
      if (managerDebounceRef.current) clearTimeout(managerDebounceRef.current);
    };
  }, [managerSearch]);

  useEffect(() => {
    if (teamDebounceRef.current) clearTimeout(teamDebounceRef.current);

    if (teamSearch.trim().length < 2) {
      setTeamResults([]);
      setTeamLoading(false);
      return;
    }

    setTeamLoading(true);

    teamDebounceRef.current = setTimeout(() => {
      teamAbortRef.current?.abort();
      const controller = new AbortController();
      teamAbortRef.current = controller;

      axiosInstance
        .get(
          `/employee?search=${encodeURIComponent(teamSearch.trim())}&limit=8`,
          { signal: controller.signal },
        )
        .then((res) => {
          setTeamResults(res?.data?.data?.employees || res?.data?.data || []);
        })
        .catch((err) => {
          if (err?.name !== "CanceledError" && err?.code !== "ERR_CANCELED") {
            console.log(err);
          }
        })
        .finally(() => setTeamLoading(false));
    }, 500);

    return () => {
      if (teamDebounceRef.current) clearTimeout(teamDebounceRef.current);
    };
  }, [teamSearch]);

  useEffect(() => {
    if (clientDebounceRef.current) clearTimeout(clientDebounceRef.current);

    if (clientSearch.trim().length < 2) {
      setClientResults([]);
      setClientLoading(false);
      return;
    }

    setClientLoading(true);

    clientDebounceRef.current = setTimeout(() => {
      clientAbortRef.current?.abort();
      const controller = new AbortController();
      clientAbortRef.current = controller;

      axiosInstance
        .get(
          `/client?search=${encodeURIComponent(clientSearch.trim())}&limit=8`,
          { signal: controller.signal },
        )
        .then((res) => {
          setClientResults(res?.data?.data?.clients || res?.data?.data || []);
        })
        .catch((err) => {
          if (err?.name !== "CanceledError" && err?.code !== "ERR_CANCELED") {
            console.log(err);
          }
        })
        .finally(() => setClientLoading(false));
    }, 500);

    return () => {
      if (clientDebounceRef.current) clearTimeout(clientDebounceRef.current);
    };
  }, [clientSearch]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        managerDropdownRef.current &&
        !managerDropdownRef.current.contains(e.target as Node)
      ) {
        setManagerOpen(false);
      }
      if (
        teamDropdownRef.current &&
        !teamDropdownRef.current.contains(e.target as Node)
      ) {
        setTeamOpen(false);
      }
      if (
        clientDropdownRef.current &&
        !clientDropdownRef.current.contains(e.target as Node)
      ) {
        setClientOpen(false);
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

  const selectManager = (emp: Employee) => {
    setManagerSelected(emp);
    setManagerSearch(emp.name);
    setManagerOpen(false);
  };

  const clearManager = () => {
    setManagerSelected(null);
    setManagerSearch("");
  };

  const toggleTeam = (emp: Employee) => {
    setTeamChips((prev) =>
      prev.some((x) => x.id === emp.id)
        ? prev.filter((x) => x.id !== emp.id)
        : [...prev, emp],
    );
  };

  const selectClient = (c: ClientOption) => {
    setClientSelected(c);
    setClientSearch(c.name);
    setClientOpen(false);
  };

  const clearClient = () => {
    setClientSelected(null);
    setClientSearch("");
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      startDate: "",
      endDate: "",
      status: "NOT_STARTED",
      priority: "MEDIUM",
    });
    setManagerSelected(null);
    setManagerSearch("");
    setManagerResults([]);
    setTeamChips([]);
    setTeamSearch("");
    setTeamResults([]);
    setClientSelected(null);
    setClientSearch("");
    setClientResults([]);
    setEditing(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (item: Project) => {
    setEditing(item);
    setFormData({
      name: item.name,
      description: item.description || "",
      startDate: toDateInputValue(item.startDate),
      endDate: toDateInputValue(item.endDate),
      status: item.status,
      priority: item.priority,
    });
    setManagerSelected(item.manager || null);
    setManagerSearch(item.manager?.name || "");
    setManagerResults([]);
    setTeamChips(
      (item.teamMembers || [])
        .map((m) => m.employee)
        .filter((e): e is Employee => Boolean(e)),
    );
    setTeamSearch("");
    setTeamResults([]);
    setClientSelected(item.client || null);
    setClientSearch(item.client?.name || "");
    setClientResults([]);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!managerSelected) {
        alert("Manager is required");
        return;
      }
      const payload = {
        ...formData,
        clientId: clientSelected ? clientSelected.id : null,
        managerId: managerSelected.id,
        teamMembers: teamChips.map((emp) => emp.id),
        endDate: formData.endDate || null,
      };
      if (editing) {
        await axiosInstance.put(`/project/${editing.id}`, payload);
        alert("Project updated successfully");
      } else {
        await axiosInstance.post("/project", payload);
        alert("Project created successfully");
      }
      setShowModal(false);
      resetForm();
      fetchProjects();
    } catch (err: any) {
      console.log(err);
      alert(err?.response?.data?.message || "Failed");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const confirmDelete = window.confirm("Delete project?");
      if (!confirmDelete) return;
      await axiosInstance.delete(`/project/${id}`);
      alert("Project deleted");
      fetchProjects();
    } catch (err: any) {
      console.log(err);
      alert(err?.response?.data?.message || "Delete failed");
    }
  };

  const teamNames = (item: Project) =>
    (item.teamMembers || [])
      .map((m) => m.employee?.name)
      .filter(Boolean)
      .join(", ");

  return (
    <div className="page-wrapper">
      <ScrollProgressBar />
      <div className="content">
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
          <div>
            <h3 className="fw-bold mb-1">Project Management</h3>
            <p className="text-muted mb-0">Manage employee projects</p>
          </div>
          <button className="btn btn-primary" onClick={handleOpenCreate}>
            <i className="ti ti-plus me-1" /> Add Project
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
                    placeholder="Search project..."
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
              <SkeletonTable rows={5} columns={10} />
            ) : (
              <div className="table-responsive">
                <table className="table table-bordered align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Manager</th>
                      <th>Client</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Team</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="text-center py-4">
                          No projects found
                        </td>
                      </tr>
                    ) : (
                      projects.map((item, index) => (
                        <tr key={item.id}>
                          <td>{(page - 1) * 10 + index + 1}</td>
                          <td>
                            <div className="fw-semibold">{item.name}</div>
                            {item.description && (
                              <small className="text-muted d-block">
                                {item.description}
                              </small>
                            )}
                          </td>
                          <td>{item.manager?.name || "-"}</td>
                          <td>{item.client?.name || "-"}</td>
                          <td>{new Date(item.startDate).toLocaleDateString()}</td>
                          <td>
                            {item.endDate
                              ? new Date(item.endDate).toLocaleDateString()
                              : "-"}
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                PRIORITY_BADGE[item.priority] || "bg-secondary"
                              }`}
                            >
                              {item.priority}
                            </span>
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
                            {item.teamMembers?.length ? (
                              <span title={teamNames(item)}>
                                {item.teamMembers.length}{" "}
                                {item.teamMembers.length === 1
                                  ? "member"
                                  : "members"}
                              </span>
                            ) : (
                              "-"
                            )}
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
                  {editing ? "Edit Project" : "Add Project"}
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
                        Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter Project Name"
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Client</label>
                      <div
                        className="searchable-select"
                        ref={clientDropdownRef}
                      >
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search client (min 2 chars)..."
                          value={clientSearch}
                          onChange={(e) => {
                            if (e.target.value !== clientSelected?.name) {
                              clearClient();
                            }
                            setClientSearch(e.target.value);
                            setClientOpen(true);
                          }}
                          onFocus={() => setClientOpen(true)}
                        />
                        {clientOpen && (
                          <div className="searchable-list">
                            {clientLoading ? (
                              <div className="searchable-item empty">
                                Searching...
                              </div>
                            ) : clientResults.length ? (
                              clientResults.map((c) => (
                                <div
                                  key={c.id}
                                  className="searchable-item"
                                  onClick={() => selectClient(c)}
                                >
                                  <strong>{c.name}</strong>
                                  <span>{c.companyName || ""}</span>
                                </div>
                              ))
                            ) : clientSearch.trim().length >= 2 ? (
                              <div className="searchable-item empty">
                                No clients found
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
                        Manager <span className="text-danger">*</span>
                      </label>
                      <div
                        className="searchable-select"
                        ref={managerDropdownRef}
                      >
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search manager (min 2 chars)..."
                          value={managerSearch}
                          onChange={(e) => {
                            if (e.target.value !== managerSelected?.name) {
                              clearManager();
                            }
                            setManagerSearch(e.target.value);
                            setManagerOpen(true);
                          }}
                          onFocus={() => setManagerOpen(true)}
                        />
                        {managerOpen && (
                          <div className="searchable-list">
                            {managerLoading ? (
                              <div className="searchable-item empty">
                                Searching...
                              </div>
                            ) : managerResults.length ? (
                              managerResults.map((emp) => (
                                <div
                                  key={emp.id}
                                  className="searchable-item"
                                  onClick={() => selectManager(emp)}
                                >
                                  <strong>{emp.name}</strong>
                                  <span>{emp.employeeCode || ""}</span>
                                </div>
                              ))
                            ) : managerSearch.trim().length >= 2 ? (
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
                        Start Date <span className="text-danger">*</span>
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        End Date
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Priority</label>
                      <select
                        className="form-select"
                        name="priority"
                        value={formData.priority}
                        onChange={handleChange}
                      >
                        <option value="LOW">LOW</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="HIGH">HIGH</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Status</label>
                      <select
                        className="form-select"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                      >
                        <option value="NOT_STARTED">NOT_STARTED</option>
                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                        <option value="ON_HOLD">ON_HOLD</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">
                        Description
                      </label>
                      <textarea
                        className="form-control"
                        name="description"
                        rows={2}
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Enter Description"
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">
                        Team Members
                      </label>
                      {teamChips.length > 0 && (
                        <div className="d-flex flex-wrap gap-2 mb-2">
                          {teamChips.map((emp) => (
                            <span
                              key={emp.id}
                              className="badge bg-primary d-inline-flex align-items-center gap-1"
                            >
                              {emp.name}
                              <button
                                type="button"
                                className="btn p-0 border-0 text-white"
                                style={{ lineHeight: 1 }}
                                onClick={() => toggleTeam(emp)}
                              >
                                <i className="ti ti-x" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                      <div
                        className="searchable-select"
                        ref={teamDropdownRef}
                      >
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search employee to add to team..."
                          value={teamSearch}
                          onChange={(e) => {
                            setTeamSearch(e.target.value);
                            setTeamOpen(true);
                          }}
                          onFocus={() => setTeamOpen(true)}
                        />
                        {teamOpen && (
                          <div className="searchable-list">
                            {teamLoading ? (
                              <div className="searchable-item empty">
                                Searching...
                              </div>
                            ) : teamResults.length ? (
                              teamResults.map((emp) => {
                                const isSelected = teamChips.some(
                                  (x) => x.id === emp.id,
                                );
                                return (
                                  <div
                                    key={emp.id}
                                    className="searchable-item"
                                    onClick={() => toggleTeam(emp)}
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
                            ) : teamSearch.trim().length >= 2 ? (
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
                    {editing ? "Update Project" : "Create Project"}
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

export default ProjectPage;
