"use client";

import PermissionGuard from "@/core/common/PermissionGuard";

export default function HrmLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PermissionGuard>{children}</PermissionGuard>;
}
