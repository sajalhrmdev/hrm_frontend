"use client";
import axiosInstance from "@/utils/axiosInstance";
import { createContext, useContext, useState } from "react";

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
  const [permissions, setPermissions] = useState<string[]>([]);

  const [user, setUser] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [employee, setEmployee] = useState<any>(null);
  const loadAuth = async () => {
    try {
      const res = await axiosInstance.get("/me");

      setPermissions(res.data.permissions);

      setUser(res.data.user);
      setCompany(res.data.company);
      setEmployee(res.data.employee);
    } catch (err) {
      console.log(err);
    }
  };

  const logout = () => {
    console.log("🔴 LOGOUT called");
    if (typeof window !== "undefined") {
      console.log("📋 localStorage before:", localStorage.getItem("token"));
      localStorage.removeItem("token");
      console.log("📋 localStorage after:", localStorage.getItem("token"));
    }

    setUser(null);
    setPermissions([]);
    setCompany(null);
    setEmployee(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        permissions,
        setPermissions,
        company,
        setCompany,
        employee,
        setEmployee,
        loadAuth,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
