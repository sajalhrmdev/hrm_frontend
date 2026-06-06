// utils/permission.ts

export const hasPermission = (permissions: string[], permission: string) => {
  return permissions.includes("*") || permissions.includes(permission);
};
