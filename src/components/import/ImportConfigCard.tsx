"use client";

import React from "react";
import Link from "next/link";

interface ImportConfigCardProps {
  entity: string;
  label: string;
  templateName: string;
  columnCount: number;
  duplicateStrategy: string;
}

const ImportConfigCard: React.FC<ImportConfigCardProps> = ({
  entity,
  label,
  templateName,
  columnCount,
  duplicateStrategy,
}) => {
  const entityIcons: Record<string, string> = {
    role: "shield",
    department: "building",
    designation: "briefcase",
    shift: "clock",
    workSchedulePolicy: "calendar",
    leaveType: "calendar-off",
    salaryComponent: "currency-dollar",
    holiday: "calendar-event",
    officeLocation: "map-pin",
    employee: "users",
    employeePersonalInfo: "user",
    employeeAddress: "home",
    employeeBankDetail: "credit-card",
    employeeEmergencyContact: "phone",
    employeeSalaryComponent: "cash",
    leaveBalance: "calendar-check",
    attendance: "check-circle",
    performanceReview: "star",
  };

  return (
    <div className="col-xl-3 col-lg-4 col-md-6">
      <div className="card h-100">
        <div className="card-body">
          <div className="d-flex align-items-center mb-3">
            <span className="avatar avatar-md bg-primary rounded-circle d-flex align-items-center justify-content-center me-3">
              <i className={`ti ti-${entityIcons[entity] || "file"} text-white`}></i>
            </span>
            <div>
              <h6 className="mb-0">{label}</h6>
              <small className="text-muted">{columnCount} columns</small>
            </div>
          </div>
          <p className="text-muted mb-3">
            <small>Strategy: <span className="fw-semibold text-capitalize">{duplicateStrategy}</span></small>
          </p>
          <Link
            href={`/import/${entity}`}
            className="btn btn-sm btn-primary w-100"
          >
            Import {label}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ImportConfigCard;
