"use client";

import { useAuth } from "@/providers/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { routePermissions } from "@/utils/routePermissions";
import { hasPermission } from "@/utils/permission";

export default function PermissionGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, permissions } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!user) return;

    const required = routePermissions[pathname];
    if (required && !hasPermission(permissions, required)) {
      router.replace("/attendances");
    }
  }, [user, permissions, pathname, router]);

  if (!user) return null;

  return <>{children}</>;
}
