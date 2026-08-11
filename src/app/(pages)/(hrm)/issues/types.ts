export type Employee = {
  id: number;
  name: string;
  email?: string;
  status?: string;
  employeeCode?: string;
  department?: { title: string } | null;
  designation?: { title: string } | null;
};

export type Issue = {
  id: number;
  companyId: number;
  employeeId: number;
  title: string;
  description: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "REJECTED" | "CANCELLED";
  resolutionNote?: string | null;
  rejectedReason?: string | null;
  resolvedBy?: number | null;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  employee: Employee;
  resolver?: { id: number; name: string } | null;
};
