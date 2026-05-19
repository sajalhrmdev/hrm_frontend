"use client";

import React, { useEffect, useState } from "react";

import axiosInstance from "@/utils/axiosInstance";

// ======================================================
// TYPES
// ======================================================

type Role = {
  id: number;

  name: string;

  rolePermissions: {
    permission: Permission;
  }[];
};

type Permission = {
  id: number;

  name: string;

  label?: string;
};

type RolePermissionResponse = {
  rolePermissions: {
    permission: Permission;
  }[];
};

// ======================================================
// COMPONENT
// ======================================================

const AssignRolePermissionsPage = () => {

  // ======================================================
  // STATES
  // ======================================================

  const [roles, setRoles] =
    useState<Role[]>([]);

  const [permissions,
    setPermissions] =
    useState<Permission[]>([]);

  const [selectedRole,
    setSelectedRole] =
    useState<number | "">("");

  const [selectedPermissions,
    setSelectedPermissions] =
    useState<number[]>([]);

  const [allRolePermissions,
    setAllRolePermissions] =
    useState<Role[]>([]);

  const [loading,
    setLoading] =
    useState(false);

  // ======================================================
  // FETCH ROLES
  // ======================================================

  const fetchRoles =
    async () => {

      try {

        const res =
          await axiosInstance.get(
            "/role"
          );

        setRoles(
          res.data.data || []
        );

      } catch (err) {

        console.log(err);
      }
    };

  // ======================================================
  // FETCH PERMISSIONS
  // ======================================================

  const fetchPermissions =
    async () => {

      try {

        const res =
          await axiosInstance.get(
            "/permission"
          );

        setPermissions(
          res.data.data || []
        );

      } catch (err) {

        console.log(err);
      }
    };

  // ======================================================
  // FETCH ROLE PERMISSIONS
  // ======================================================

  const fetchRolePermissions =
    async (
      roleId: number
    ) => {

      try {

        const res =
          await axiosInstance.get<{
            success: boolean;

            data: RolePermissionResponse;
          }>(
            `/role-permission/${roleId}/permissions`
          );

        const ids =
          res.data.data.rolePermissions.map(
            (rp) =>
              rp.permission.id
          );

        setSelectedPermissions(
          ids
        );

      } catch (err) {

        console.log(err);
      }
    };

  // ======================================================
  // FETCH ALL ROLE PERMISSIONS
  // ======================================================

  const fetchAllRolePermissions =
    async () => {

      try {

        const res =
          await axiosInstance.get(
            "/role-permission/all"
          );

        setAllRolePermissions(
          res.data.data || []
        );

      } catch (err) {

        console.log(err);
      }
    };

  // ======================================================
  // INITIAL
  // ======================================================

  useEffect(() => {

    fetchRoles();

    fetchPermissions();

    fetchAllRolePermissions();

  }, []);

  // ======================================================
  // ROLE CHANGE
  // ======================================================

  const handleRoleChange =
    (
      e: React.ChangeEvent<HTMLSelectElement>
    ) => {

      const roleId =
        Number(
          e.target.value
        );

      setSelectedRole(
        roleId
      );

      fetchRolePermissions(
        roleId
      );
    };

  // ======================================================
  // CHECKBOX
  // ======================================================

  const handleCheckbox =
    (
      permissionId: number
    ) => {

      setSelectedPermissions(
        (prev) => {

          if (
            prev.includes(
              permissionId
            )
          ) {

            return prev.filter(
              (id) =>
                id !==
                permissionId
            );
          }

          return [
            ...prev,

            permissionId,
          ];
        }
      );
    };

  // ======================================================
  // SUBMIT
  // ======================================================

  const handleSubmit =
    async () => {

      if (
        !selectedRole
      ) {

        return alert(
          "Select role first"
        );
      }

      try {

        setLoading(true);

        await axiosInstance.post(

          "/role-permission/assign-permissions",

          {

            roleId:
              selectedRole,

            permissionIds:
              selectedPermissions,
          }
        );

        alert(
          "✅ Permissions assigned successfully"
        );

        fetchAllRolePermissions();

      } catch (err: any) {

        console.log(err);

        alert(

          err?.response?.data
            ?.message ||

          "Something went wrong"
        );

      } finally {

        setLoading(false);
      }
    };

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="page-wrapper">

      <div className="content">

        <div className="assign-page">

          {/* HEADER */}

          <div className="role-permission-header">

            <div>

              <h2>
                🔐 Assign Permissions
              </h2>

              <p>
                Assign permissions to roles
              </p>

            </div>

          </div>

          {/* SELECT ROLE */}

          <div className="role-select-box">

            <label>
              Select Role
            </label>

            <select
              value={
                selectedRole
              }

              onChange={
                handleRoleChange
              }
            >

              <option value="">
                Select Role
              </option>

              {
                roles.map(
                  (role) => (

                    <option
                      key={
                        role.id
                      }

                      value={
                        role.id
                      }
                    >
                      {role.name}
                    </option>
                  )
                )
              }

            </select>

          </div>

          {/* PERMISSIONS */}

          {
            selectedRole && (

              <div className="permission-card">

                <div className="permission-grid">

                  {
                    permissions.map(
                      (
                        permission
                      ) => (

                        <label
                          key={
                            permission.id
                          }

                          className="permission-item"
                        >

                          <input
                            type="checkbox"

                            checked={
                              selectedPermissions.includes(
                                permission.id
                              )
                            }

                            onChange={() =>
                              handleCheckbox(
                                permission.id
                              )
                            }
                          />

                          <div>

                            <div className="permission-name">

                              {
                                permission.name
                              }

                            </div>

                            <div className="permission-label">

                              {
                                permission.label ||
                                "-"
                              }

                            </div>

                          </div>

                        </label>
                      )
                    )
                  }

                </div>

                {/* BUTTON */}

                <button
                  className="save-btn"

                  onClick={
                    handleSubmit
                  }

                  disabled={
                    loading
                  }
                >
                  {
                    loading

                      ? "Saving..."

                      : "💾 Save Permissions"
                  }
                </button>

              </div>
            )
          }

          {/* ALL ROLE PERMISSIONS */}

          <div className="all-role-permissions">

            <h3 className="section-title">
              All Role Permissions
            </h3>

            <div className="role-list-grid">

              {
                allRolePermissions.map(
                  (role) => (

                    <div
                      key={role.id}

                      className="role-permission-box"
                    >

                      <div className="role-box-header">

                        <h4>
                          {role.name}
                        </h4>

                        <span>

                          {
                            role.rolePermissions.length
                          } Permissions

                        </span>

                      </div>

                      <div className="permission-badge-wrapper">

                        {
                          role.rolePermissions.length ? (

                            role.rolePermissions.map(
                              (rp) => (

                                <span
                                  key={
                                    rp.permission.id
                                  }

                                  className="permission-badge"
                                >
                                  {
                                    rp.permission.label
                                  }
                                </span>
                              )
                            )

                          ) : (

                            <span className="no-permission">
                              No Permissions
                            </span>
                          )
                        }

                      </div>

                    </div>
                  )
                )
              }

            </div>

          </div>

          {/* STYLES */}

          <style jsx>{`

            .assign-page {

              padding: 24px;

              margin-top: 20px;
            }

            .role-permission-header {

              display: flex;

              justify-content: space-between;

              align-items: center;

              margin-bottom: 24px;

              gap: 20px;

              flex-wrap: wrap;
            }

            .role-permission-header h2 {

              margin: 0;

              font-size: 30px;

              font-weight: 700;
            }

            .role-permission-header p {

              margin-top: 4px;

              color: #666;
            }

            .role-select-box {

              background: #fff;

              border: 1px solid #e2e8f0;

              border-radius: 14px;

              padding: 20px;

              margin-bottom: 24px;
            }

            .role-select-box label {

              display: block;

              margin-bottom: 10px;

              font-size: 15px;

              font-weight: 600;

              color: #0f172a;
            }

            .role-select-box select {

              width: 100%;

              height: 48px;

              border-radius: 10px;

              border: 1px solid #cbd5e1;

              padding: 0 14px;

              font-size: 14px;

              outline: none;

              background: #fff;
            }

            .role-select-box select:focus {

              border-color: #2563eb;
            }

            .permission-card {

              background: #fff;

              border: 1px solid #e2e8f0;

              border-radius: 14px;

              padding: 20px;
            }

            .permission-grid {

              display: grid;

              grid-template-columns:
                repeat(
                  auto-fit,
                  minmax(240px, 1fr)
                );

              gap: 16px;
            }

            .permission-item {

              display: flex;

              align-items: flex-start;

              gap: 12px;

              padding: 14px;

              border: 1px solid #e2e8f0;

              border-radius: 12px;

              cursor: pointer;

              transition: 0.2s;
            }

            .permission-item:hover {

              background: #f8fafc;

              border-color: #2563eb;
            }

            .permission-item input {

              margin-top: 3px;

              width: 16px;

              height: 16px;
            }

            .permission-name {

              font-size: 14px;

              font-weight: 600;

              color: #0f172a;
            }

            .permission-label {

              margin-top: 4px;

              font-size: 12px;

              color: #64748b;
            }

            .save-btn {

              width: 100%;

              margin-top: 24px;

              height: 48px;

              border: none;

              border-radius: 12px;

              background: #2563eb;

              color: #fff;

              font-size: 15px;

              font-weight: 600;

              cursor: pointer;

              transition: 0.2s;
            }

            .save-btn:hover {

              background: #1d4ed8;
            }

            .all-role-permissions {

              margin-top: 24px;
            }

            .section-title {

              margin-bottom: 16px;

              font-size: 20px;

              font-weight: 700;

              color: #111827;
            }

            .role-list-grid {

              display: grid;

              grid-template-columns:
                repeat(
                  auto-fit,
                  minmax(320px, 1fr)
                );

              gap: 16px;
            }

            .role-permission-box {

              background: #fff;

              border: 1px solid #e2e8f0;

              border-radius: 14px;

              padding: 18px;
            }

            .role-box-header {

              display: flex;

              justify-content: space-between;

              align-items: center;

              margin-bottom: 14px;
            }

            .role-box-header h4 {

              margin: 0;

              font-size: 16px;

              font-weight: 700;

              color: #111827;
            }

            .role-box-header span {

              font-size: 12px;

              color: #64748b;
            }

            .permission-badge-wrapper {

              display: flex;

              flex-wrap: wrap;

              gap: 10px;
            }

            .permission-badge {

              background: #eff6ff;

              color: #2563eb;

              padding: 6px 10px;

              border-radius: 999px;

              font-size: 12px;

              font-weight: 600;
            }

            .no-permission {

              font-size: 13px;

              color: #94a3b8;
            }

            @media (max-width: 768px) {

              .assign-page {

                padding: 18px;
              }

              .permission-grid {

                grid-template-columns: 1fr;
              }

              .role-list-grid {

                grid-template-columns: 1fr;
              }
            }

          `}</style>

        </div>

      </div>

    </div>
  );
};

export default AssignRolePermissionsPage;