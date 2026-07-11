export type Employee = {
  id: number;
  name: string;
  email?: string;
  status?: string;
  employeeCode?: string;
  department?: { title: string } | null;
  designation?: { title: string } | null;
};

export type Resignation = {
  id: number;
  companyId: number;
  employeeId: number;
  resignationDate: string;
  lastWorkingDay: string | null;
  noticePeriodDays: number;
  reason?: string;
  handoverTo?: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  approvedBy?: number;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  employee: Employee;
  approver?: { id: number; name: string } | null;
};
