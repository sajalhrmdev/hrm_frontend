export const isSuperAdmin = (user: any) => {
  return user?.globalRole === "SUPER_ADMIN";
};
