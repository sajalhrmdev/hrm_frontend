"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axiosInstance from "@/utils/axiosInstance";
import { useAuth } from "@/providers/AuthContext";

interface User {
  name: string;
  email: string;
  avatar: string;
}

const ProfileDropdown = ({ all_routes }: any) => {
  const router = useRouter();
  const { logout, employee } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await axiosInstance.get("/user/profile"); // 🔥 your API

      if (res.data.success) {
        setUser(res.data.data);
      }
    } catch (error) {
      console.error("Profile fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleLogout = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log("🚀 handleLogout triggered");
    e.preventDefault();
    console.log("🔓 Calling logout()");
    logout();
    console.log("📍 Redirecting to login...");
    router.push(all_routes.login2);
  };

  // 🔥 loading state
  if (loading) {
    return (
      <div className="avatar avatar-md">
        <span className="spinner-border spinner-border-sm" />
      </div>
    );
  }

  // 🔥 fallback
  if (!user) return null;

  return (
    <div className="dropdown profile-dropdown">
      <Link
        href="#"
        className="dropdown-toggle d-flex align-items-center"
        data-bs-toggle="dropdown"
      >
        <span className="avatar avatar-md online">
          <img
            src={user.avatar || "/default-avatar.png"}
            alt="Img"
            className="img-fluid rounded-circle"
          />
        </span>
      </Link>

      <div className="dropdown-menu shadow-none">
        <div className="card mb-0">
          <div className="card-header">
            <div className="d-flex align-items-center">
              <span className="avatar avatar-lg me-2 avatar-rounded">
                <img src={user.avatar || "/default-avatar.png"} alt="img" />
              </span>
              <div>
                <h5 className="mb-0">{user.name}</h5>
                <p className="fs-12 fw-medium mb-0">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="card-body">
            <Link
              className="dropdown-item d-inline-flex align-items-center p-0 py-2"
              href={employee?.id ? `/profile/${employee.id}` : "#"}
            >
              <i className="ti ti-user-circle me-1" />
              My Profile
            </Link>

            <Link
              className="dropdown-item d-inline-flex align-items-center p-0 py-2"
              href={all_routes.bussinessSettings}
            >
              <i className="ti ti-settings me-1" />
              Settings
            </Link>

            <Link
              className="dropdown-item d-inline-flex align-items-center p-0 py-2"
              href={all_routes.profilesettings}
            >
              <i className="ti ti-circle-arrow-up me-1" />
              My Account
            </Link>

            <Link
              className="dropdown-item d-inline-flex align-items-center p-0 py-2"
              href={all_routes.knowledgebase}
            >
              <i className="ti ti-question-mark me-1" />
              Knowledge Base
            </Link>

            <Link
              className="dropdown-item d-inline-flex align-items-center p-0 py-2"
              href={all_routes.account}
            >
              <i className="ti ti-user-circle me-1" />
              Account
            </Link>
          </div>

          <div className="card-footer">
            <button
              type="button"
              className="dropdown-item d-inline-flex align-items-center p-0 py-2 w-100 text-start border-0 bg-transparent"
              onClick={handleLogout}
            >
              <i className="ti ti-login me-2" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDropdown;
