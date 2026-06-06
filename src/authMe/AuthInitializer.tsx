// "use client";
// import { useAuth } from "@/providers/AuthContext";
// import axiosInstance from "@/utils/axiosInstance";
// import { useEffect } from "react";

// export default function AuthInitializer() {
//   const { setPermissions, setUser } = useAuth();
//   const loadAuth = async () => {
//     try {
//       const res = await axiosInstance.get("/me");

//       setPermissions(res.data.permissions);

//       setUser(res.data.user);
//     } catch (err) {
//       console.log(err);
//     }
//   };
//   useEffect(() => {
//     loadAuth();
//   }, []);
//   return <></>;
// }

"use client";

import { useEffect } from "react";
import { useAuth } from "@/providers/AuthContext";

export default function AuthInitializer() {
  const { loadAuth } = useAuth();

  useEffect(() => {
    loadAuth();
  }, []);

  return <></>;
}
