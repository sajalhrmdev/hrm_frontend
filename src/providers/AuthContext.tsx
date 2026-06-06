"use client"
import { createContext, useContext, useState } from "react";

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
  const [permissions, setPermissions] = useState<string[]>([]);

  const [user, setUser] = useState<any>(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,

        permissions,
        setPermissions,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
