"use client";

import React, { useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import ImportConfigCard from "@/components/import/ImportConfigCard";
import { SkeletonCard } from "@/core/common/Skeleton";

interface ImportConfig {
  entity: string;
  label: string;
  templateName: string;
  columnCount: number;
  duplicateStrategy: string;
}

const ImportPage = () => {
  const [configs, setConfigs] = useState<ImportConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/import/configs");
        setConfigs(res?.data?.data || []);
      } catch (err: any) {
        console.error(err);
        alert(err?.response?.data?.message || "Failed to load import configs");
      } finally {
        setLoading(false);
      }
    };
    fetchConfigs();
  }, []);

  const filteredConfigs = configs.filter(
    (c) =>
      c.label.toLowerCase().includes(search.toLowerCase()) ||
      c.entity.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="page-header">
          <div className="page-title">
            <h4>Data Import</h4>
            <h6>Import data from Excel files into the system</h6>
          </div>
        </div>

        <div className="card mb-4">
          <div className="card-body">
            <div className="row align-items-center">
              <div className="col-md-6">
                <div className="mb-3">
                  <h6>Import Order Guide</h6>
                  <p className="text-muted small mb-0">
                    <strong>Phase 1:</strong> Role, Department, Designation, Shift, Work Schedule, Leave Type, Salary Component, Holiday, Office Location, Professional Tax, Weekly Off
                  </p>
                  <p className="text-muted small mb-0">
                    <strong>Phase 2:</strong> Employee, Personal Info, Address, Bank Detail, Emergency Contact, Experience, Document
                  </p>
                  <p className="text-muted small mb-0">
                    <strong>Phase 3:</strong> Salary Component Assign, Leave Balance, Leave Increment Policy, Attendance, Leave Application
                  </p>
                  <p className="text-muted small mb-0">
                    <strong>Phase 4:</strong> <strong>Salary History</strong> (previous months' payroll — auto-creates PayRollRun + PayRoll + Snap Components)
                  </p>
                  <p className="text-muted small mb-0">
                    <strong>Phase 5:</strong> Notice, Employee Reward, Resignation, PayRollRun, PayRoll, Payroll Snap Component
                  </p>
                </div>
              </div>
              <div className="col-md-6">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search entity..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <SkeletonCard />
        ) : (
          <div className="row">
            {filteredConfigs.map((config) => (
              <ImportConfigCard key={config.entity} {...config} />
            ))}
            {filteredConfigs.length === 0 && (
              <div className="col-12 text-center py-5 text-muted">
                No import entities found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportPage;
