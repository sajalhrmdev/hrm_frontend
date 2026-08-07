"use client";

import React from "react";

import SalaryStructureEditor from "@/compo/SalaryStructureEditor";

// ======================================================

type Props = {
  employeeId: number;
  isViewOnly?: boolean;
};

// ======================================================

const EmployeeSalaryTab = ({ employeeId, isViewOnly }: Props) => {
  return (
    <SalaryStructureEditor employeeId={employeeId} readOnly={!!isViewOnly} />
  );
};

export default EmployeeSalaryTab;
