"use client";

import { useEffect, useState } from "react";

import axiosInstance from "@/utils/axiosInstance";
import { SkeletonTable } from "@/core/common/Skeleton";
import ScrollProgressBar from "@/core/common/ScrollProgressBar";

type Project = {
  id: number;
  name: string;
  description: string;
  clientId?: number | null;
  client?: { id: number; name: string; companyName?: string | null } | null;
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

const MyProjectPage = () => {
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    limit: 10,
  });

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(
        `/project/my?page=${page}&limit=10`,
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

  const teamNames = (item: Project) =>
    (item.teamMembers || [])
      .map((m) => m.employee?.name)
      .filter(Boolean)
      .join(", ");

  return (
    <div className="page-wrapper">
      <ScrollProgressBar />
      <div className="content">
        <div className="mb-4">
          <h3 className="fw-bold mb-1">My Projects</h3>
          <p className="text-muted mb-0">
            Projects you manage or are a team member of
          </p>
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
                      <th>Name</th>
                      <th>Manager</th>
                      <th>Client</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Team</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center py-4">
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
    </div>
  );
};

export default MyProjectPage;
