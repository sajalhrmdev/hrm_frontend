"use client";

import React, { useEffect, useMemo, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import {
  Button,
  Card,
  ConfigProvider,
  Divider,
  Empty,
  Input,
  message,
  Switch,
  Tag,
} from "antd";
import { SkeletonCard, SkeletonTable } from "@/core/common/Skeleton";
import {
  AppstoreOutlined,
  ArrowRightOutlined,
  CheckCircleFilled,
  CompressOutlined,
  DeleteOutlined,
  DownOutlined,
  ExpandOutlined,
  FolderOutlined,
  PlusOutlined,
  ReloadOutlined,
  RightOutlined,
  SafetyCertificateOutlined,
  SaveOutlined,
  SearchOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";

// ======================================================
// TYPES
// ======================================================

type Permission = {
  id: number;
  name: string;
  label?: string;
};

type Role = {
  id: number;
  name: string;
  rolePermissions?: {
    permission: Permission;
  }[];
};

type RolePermissionResponse = {
  rolePermissions: {
    permission: Permission;
  }[];
};

type TreeNode = {
  key: string;
  title: string;
  searchText: string;
  nodeType: "group" | "permission";
  permissionId?: number;
  children?: TreeNode[];
  iconType?: "folder" | "shield" | "other";
};

// ======================================================
// HELPERS
// ======================================================

const normalize = (value: string) => value.trim().toLowerCase();

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

const highlightText = (text: string, query: string) => {
  const q = query.trim();
  if (!q) return text;

  const lowerText = text.toLowerCase();
  const lowerQuery = q.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);

  if (index === -1) return text;

  const before = text.slice(0, index);
  const match = text.slice(index, index + q.length);
  const after = text.slice(index + q.length);

  return (
    <>
      {before}
      <mark className="search-mark">{match}</mark>
      {after}
    </>
  );
};

const collectPermissionIds = (node: TreeNode): number[] => {
  const ids: number[] = [];

  if (typeof node.permissionId === "number") {
    ids.push(node.permissionId);
  }

  if (node.children?.length) {
    node.children.forEach((child) => {
      ids.push(...collectPermissionIds(child));
    });
  }

  return ids;
};

const collectExpandableKeys = (nodes: TreeNode[]): string[] => {
  const keys: string[] = [];

  const walk = (node: TreeNode) => {
    if (node.children?.length) {
      keys.push(node.key);
      node.children.forEach(walk);
    }
  };

  nodes.forEach(walk);

  return keys;
};

const filterTree = (nodes: TreeNode[], query: string): TreeNode[] => {
  const q = normalize(query);
  if (!q) return nodes;

  const walk = (node: TreeNode): TreeNode | null => {
    const nodeMatch = normalize(node.searchText).includes(q);

    const filteredChildren = node.children?.map(walk).filter(Boolean) as
      | TreeNode[]
      | undefined;

    if (nodeMatch || (filteredChildren && filteredChildren.length > 0)) {
      return {
        ...node,
        children: filteredChildren,
      };
    }

    return null;
  };

  return nodes.map(walk).filter(Boolean) as TreeNode[];
};

const makeLeaf = (
  permissionsMap: Map<string, Permission>,
  usedIds: Set<number>,
  permissionName: string,
  displayTitle?: string,
  iconType: "shield" | "other" = "shield",
): TreeNode | null => {
  const permission = permissionsMap.get(normalize(permissionName));
  if (!permission) return null;

  usedIds.add(permission.id);

  return {
    key: String(permission.id),
    title: displayTitle || permission.label || permission.name,
    searchText: `${displayTitle || permission.label || permission.name} ${permission.name}`,
    nodeType: "permission",
    permissionId: permission.id,
    iconType,
  };
};

const makeGroup = (
  permissionsMap: Map<string, Permission>,
  usedIds: Set<number>,
  groupTitle: string,
  permissionName: string | undefined,
  children: Array<TreeNode | null>,
  iconType: "folder" | "other" = "folder",
): TreeNode | null => {
  const permission = permissionName
    ? permissionsMap.get(normalize(permissionName))
    : undefined;

  if (permission) {
    usedIds.add(permission.id);
  }

  const filteredChildren = children.filter(Boolean) as TreeNode[];

  if (!permission && filteredChildren.length === 0) {
    return null;
  }

  return {
    key: permission ? String(permission.id) : `group-${slugify(groupTitle)}`,
    title: groupTitle,
    searchText: `${groupTitle} ${permission?.name || ""}`,
    nodeType: permission ? "permission" : "group",
    permissionId: permission?.id,
    children: filteredChildren.length ? filteredChildren : undefined,
    iconType,
  };
};

const buildPermissionTree = (permissions: Permission[]) => {
  const permissionsMap = new Map<string, Permission>();
  permissions.forEach((permission) => {
    permissionsMap.set(normalize(permission.name), permission);
  });

  const usedIds = new Set<number>();
  const tree: TreeNode[] = [];

  const attendance = makeGroup(
    permissionsMap,
    usedIds,
    "Attendance",
    "Sidebar Attendance",
    [
      makeLeaf(
        permissionsMap,
        usedIds,
        "Sidebar Attendance Dashboard",
        "Attendance Dashboard",
      ),
      makeLeaf(
        permissionsMap,
        usedIds,
        "Sidebar Attendance Regularization",
        "Attendance Regularization",
      ),
      makeGroup(permissionsMap, usedIds, "Attendance Adjustment", undefined, [
        makeLeaf(permissionsMap, usedIds, "Sidebar Processor", "Processor"),
        makeLeaf(permissionsMap, usedIds, "Sidebar Logs By Day", "Logs By Day"),
        makeLeaf(
          permissionsMap,
          usedIds,
          "Sidebar Logs ByAuthorized",
          "Logs By Authorized",
        ),
        makeLeaf(
          permissionsMap,
          usedIds,
          "Sidebar Logs By Employee",
          "Logs By Employee",
        ),
      ]),
      makeGroup(permissionsMap, usedIds, "Attendance Settings", undefined, [
        makeLeaf(
          permissionsMap,
          usedIds,
          "Sidebar WeekendSetup",
          "Weekend Setup",
        ),
        makeLeaf(
          permissionsMap,
          usedIds,
          "Sidebar HolidaySetup",
          "Holiday Setup",
        ),
      ]),
    ],
  );

  const employee = makeGroup(
    permissionsMap,
    usedIds,
    "Employee",
    "Sidebar Employee",
    [
      makeLeaf(permissionsMap, usedIds, "Sidebar Employee", "Employee List"),
      makeLeaf(permissionsMap, usedIds, "Sidebar Department", "Department"),
      makeLeaf(permissionsMap, usedIds, "Sidebar Designation", "Designation"),
      makeLeaf(permissionsMap, usedIds, "Sidebar Role", "Role"),
      makeLeaf(
        permissionsMap,
        usedIds,
        "Sidebar AssignRolePermissions",
        "Assign Role Permissions",
      ),
      makeLeaf(
        permissionsMap,
        usedIds,
        "Sidebar PerformanceReview",
        "Performance Review",
      ),
      makeLeaf(
        permissionsMap,
        usedIds,
        "Sidebar RewardManage",
        "Reward Manage",
      ),
      makeLeaf(
        permissionsMap,
        usedIds,
        "Sidebar Resignation",
        "Resignation",
      ),
    ],
  );
  const user = makeLeaf(permissionsMap, usedIds, "Sidebar User", "User");
  const assignRolePermissions = makeLeaf(
    permissionsMap,
    usedIds,
    "Sidebar AssignRolePermissions",
    "Assign Role Permissions",
  );

  const leave = makeGroup(permissionsMap, usedIds, "Leave", "Sidebar Leave", [
    makeLeaf(
      permissionsMap,
      usedIds,
      "Sidebar Leave Approval",
      "Leave Approval",
    ),
    makeLeaf(permissionsMap, usedIds, "Sidebar Leave Balance", "Leave Balance"),
    makeLeaf(permissionsMap, usedIds, "Sidebar Leave Types", "Leave Types"),
    makeGroup(
      permissionsMap,
      usedIds,
      "Leave Increment",
      undefined,
      [
        makeLeaf(
          permissionsMap,
          usedIds,
          "Sidebar Leave Increment Processor",
          "Processor",
        ),
        makeLeaf(
          permissionsMap,
          usedIds,
          "Sidebar Leave Increment Policy",
          "Policy",
        ),
        makeLeaf(
          permissionsMap,
          usedIds,
          "Sidebar Leave Increment Logs",
          "Logs",
        ),
      ],
    ),
  ]);

  const salary = makeGroup(
    permissionsMap,
    usedIds,
    "Salary",
    "Sidebar Salary",
    [
      makeLeaf(
        permissionsMap,
        usedIds,
        "Sidebar Salary Component",
        "Salary Component",
      ),
      makeLeaf(
        permissionsMap,
        usedIds,
        "Sidebar Salary Assign",
        "Salary Assign",
      ),
      makeLeaf(permissionsMap, usedIds, "Sidebar Payroll", "Payroll"),
    ],
  );

  const workSchedule = makeGroup(
    permissionsMap,
    usedIds,
    "Work Schedule",
    "Sidebar WorkSchedule",
    [
      makeLeaf(permissionsMap, usedIds, "Sidebar Schedule", "Schedule"),
      makeLeaf(
        permissionsMap,
        usedIds,
        "Sidebar WorkSchedule Assign",
        "Assign",
      ),
      makeLeaf(
        permissionsMap,
        usedIds,
        "Sidebar WorkSchedule Policy",
        "Work Schedule Policy",
      ),
      makeLeaf(permissionsMap, usedIds, "Sidebar Shift", "Shift"),
    ],
  );

  const notice = makeLeaf(
    permissionsMap,
    usedIds,
    "Sidebar Notice",
    "Notice",
  );

  const report = makeGroup(
    permissionsMap,
    usedIds,
    "Report",
    "Sidebar Report",
    [
      makeLeaf(
        permissionsMap,
        usedIds,
        "Sidebar Attendance Report",
        "Attendance Report",
      ),
    ],
  );

  const fieldTrack = makeGroup(
    permissionsMap,
    usedIds,
    "FieldTrack",
    "Sidebar FieldTrack",
    [
      makeLeaf(
        permissionsMap,
        usedIds,
        "Sidebar FieldEmployees",
        "Field Employees",
      ),
      makeLeaf(
        permissionsMap,
        usedIds,
        "Sidebar FieldLiveTracking",
        "Live Tracking",
      ),
      makeLeaf(
        permissionsMap,
        usedIds,
        "Sidebar FieldRouteHistory",
        "Route History",
      ),
      makeLeaf(permissionsMap, usedIds, "Sidebar FieldReports", "Reports"),
    ],
  );

  const settings = makeGroup(
    permissionsMap,
    usedIds,
    "Settings",
    "Sidebar Settings",
    [
      makeLeaf(
        permissionsMap,
        usedIds,
        "Sidebar CompanySettings",
        "Company Settings",
      ),
      makeLeaf(permissionsMap, usedIds, "Sidebar Location", "Location"),
      makeLeaf(permissionsMap, usedIds, "Sidebar Branding", "Branding"),
      makeLeaf(permissionsMap, usedIds, "Sidebar ProfessionalTax", "Professional Tax"),
      makeLeaf(permissionsMap, usedIds, "Sidebar Import", "Import"),
      makeLeaf(permissionsMap, usedIds, "Sidebar Client", "Client"),
      makeLeaf(permissionsMap, usedIds, "Sidebar Appointment", "Appointment"),
      makeLeaf(permissionsMap, usedIds, "Sidebar Visit", "Visit"),
      makeLeaf(permissionsMap, usedIds, "Sidebar Meeting", "Meeting"),
    ],
  );

  const sections = [
    attendance,
    employee,
    user,
    leave,
    salary,
    workSchedule,
    notice,
    report,
    fieldTrack,
    settings,
  ].filter(Boolean) as TreeNode[];

  tree.push(...sections);

  const otherPermissions = permissions.filter(
    (permission) => !usedIds.has(permission.id),
  );

  if (otherPermissions.length) {
    tree.push({
      key: "group-other-permissions",
      title: "Other Permissions",
      searchText: "Other Permissions",
      nodeType: "group",
      iconType: "other",
      children: otherPermissions.map((permission) => ({
        key: String(permission.id),
        title: permission.label || permission.name,
        searchText: `${permission.label || permission.name} ${permission.name}`,
        nodeType: "permission",
        permissionId: permission.id,
        iconType: "shield",
      })),
    });
  }

  return tree;
};

const getAllGroupKeys = (nodes: TreeNode[]) => collectExpandableKeys(nodes);

// ======================================================
// NODE COMPONENT
// ======================================================

type PermissionNodeCardProps = {
  node: TreeNode;
  search: string;
  selectedPermissions: number[];
  onToggleNode: (node: TreeNode) => void;
  expandedKeys: string[];
  onToggleExpand: (key: string) => void;
};

const PermissionNodeCard: React.FC<PermissionNodeCardProps> = ({
  node,
  search,
  selectedPermissions,
  onToggleNode,
  expandedKeys,
  onToggleExpand,
}) => {
  const hasChildren = !!node.children?.length;
  const isOpen = expandedKeys.includes(node.key);

  const nodePermissionIds = useMemo(() => collectPermissionIds(node), [node]);

  const selectedSet = useMemo(
    () => new Set(selectedPermissions),
    [selectedPermissions],
  );

  const selectedCount = nodePermissionIds.filter((id) =>
    selectedSet.has(id),
  ).length;
  const allSelected =
    nodePermissionIds.length > 0 && selectedCount === nodePermissionIds.length;
  const someSelected =
    nodePermissionIds.length > 0 &&
    selectedCount > 0 &&
    selectedCount < nodePermissionIds.length;

  const icon =
    node.iconType === "other" ? (
      <SettingOutlined />
    ) : hasChildren ? (
      <FolderOutlined />
    ) : (
      <SafetyCertificateOutlined />
    );

  return (
    <div className={`perm-block ${hasChildren ? "group-block" : "leaf-block"}`}>
      <div
        className={`perm-head ${allSelected ? "selected" : ""} ${
          someSelected ? "partial" : ""
        }`}
      >
        <div className="perm-head-left">
          {hasChildren ? (
            <button
              type="button"
              className={`expand-btn ${isOpen ? "open" : ""}`}
              onClick={() => onToggleExpand(node.key)}
              aria-label={isOpen ? "Collapse" : "Expand"}
            >
              <RightOutlined />
            </button>
          ) : (
            <span className="leaf-spacer" />
          )}

          <div className={`perm-icon ${hasChildren ? "group" : "leaf"}`}>
            {icon}
          </div>

          <div className="perm-text">
            <div className="perm-title">
              {highlightText(node.title, search)}
            </div>
            <div className="perm-subtitle">
              {hasChildren && `${node.children?.length || 0}  item(s)`}
            </div>
          </div>
        </div>

        <div className="perm-head-right">
          <Tag className={`perm-tag ${hasChildren ? "group" : "leaf"}`}>
            {hasChildren ? "Section" : "Permission"}
          </Tag>

          <Switch checked={allSelected} onChange={() => onToggleNode(node)} />
        </div>
      </div>

      {hasChildren && isOpen && (
        <div className="perm-children">
          {node.children!.map((child) => (
            <PermissionNodeCard
              key={child.key}
              node={child}
              search={search}
              selectedPermissions={selectedPermissions}
              onToggleNode={onToggleNode}
              expandedKeys={expandedKeys}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ======================================================
// MAIN COMPONENT
// ======================================================

const AssignRolePermissionsPage = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedRole, setSelectedRole] = useState<number | "">("");
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [originalPermissions, setOriginalPermissions] = useState<number[]>([]);
  const [allRolePermissions, setAllRolePermissions] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [roleSearch, setRoleSearch] = useState("");

  const permissionTree = useMemo(
    () => buildPermissionTree(permissions),
    [permissions],
  );

  const filteredTree = useMemo(
    () => filterTree(permissionTree, search),
    [permissionTree, search],
  );

  const rolePermissionCountMap = useMemo(() => {
    const map = new Map<number, number>();

    allRolePermissions.forEach((role) => {
      map.set(role.id, role.rolePermissions?.length || 0);
    });

    return map;
  }, [allRolePermissions]);

  const filteredRoles = useMemo(() => {
    const q = normalize(roleSearch);

    if (!q) return roles;

    return roles.filter((role) => {
      const count = rolePermissionCountMap.get(role.id) || 0;
      return normalize(role.name).includes(q) || String(count).includes(q);
    });
  }, [roles, roleSearch, rolePermissionCountMap]);

  const selectedRoleName =
    roles.find((role) => role.id === selectedRole)?.name || "Select role";

  const selectedPermissionObjects = useMemo(() => {
    const map = new Map(permissions.map((p) => [p.id, p]));
    return selectedPermissions
      .map((id) => map.get(id))
      .filter(Boolean) as Permission[];
  }, [permissions, selectedPermissions]);

  const fetchRoles = async () => {
    const res = await axiosInstance.get("/role");
    setRoles(res.data.data || []);
  };

  const fetchPermissions = async () => {
    const res = await axiosInstance.get("/permission");
    setPermissions(res.data.data || []);
  };

  const fetchRolePermissions = async (roleId: number) => {
    try {
      const res = await axiosInstance.get<{
        success: boolean;
        data: RolePermissionResponse;
      }>(`/role-permission/${roleId}/permissions`);

      const ids = res.data.data.rolePermissions.map((rp) => rp.permission.id);

      setSelectedPermissions(ids);
      setOriginalPermissions(ids);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchAllRolePermissions = async () => {
    try {
      const res = await axiosInstance.get("/role-permission/all");
      setAllRolePermissions(res.data.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        setInitialLoading(true);
        await Promise.all([
          fetchRoles(),
          fetchPermissions(),
          fetchAllRolePermissions(),
        ]);
      } catch (error) {
        console.log(error);
      } finally {
        setInitialLoading(false);
      }
    };

    init();
  }, []);

  useEffect(() => {
    if (search.trim()) {
      setExpandedKeys(getAllGroupKeys(filteredTree));
    }
  }, [search, filteredTree]);

  const handleRoleSelect = async (roleId: number) => {
    setSelectedRole(roleId);
    await fetchRolePermissions(roleId);
  };

  const toggleNodeSelection = (node: TreeNode) => {
    const ids = collectPermissionIds(node);

    if (!ids.length) return;

    setSelectedPermissions((prev) => {
      const prevSet = new Set(prev);
      const allSelected = ids.every((id) => prevSet.has(id));

      if (allSelected) {
        return prev.filter((id) => !ids.includes(id));
      }

      const next = new Set(prev);
      ids.forEach((id) => next.add(id));

      return Array.from(next);
    });
  };

  const handleExpandAll = () => {
    setExpandedKeys(getAllGroupKeys(permissionTree));
  };

  const handleCollapseAll = () => {
    setExpandedKeys([]);
  };

  const handleSelectAll = () => {
    setSelectedPermissions(permissions.map((permission) => permission.id));
  };

  const handleReset = () => {
    setSelectedPermissions(originalPermissions);
  };

  const handleSubmit = async () => {
    if (!selectedRole) {
      message.warning("Select role first");
      return;
    }

    try {
      setLoading(true);

      await axiosInstance.post("/role-permission/assign-permissions", {
        roleId: selectedRole,
        permissionIds: selectedPermissions,
      });

      message.success("Permissions assigned successfully");
      fetchAllRolePermissions();
    } catch (err: any) {
      console.log(err);
      message.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = () => {
    message.info("Connect this button with your create-role modal/page.");
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#16a34a",
          borderRadius: 14,
          colorBgContainer: "#ffffff",
          colorText: "#0f172a",
          colorTextSecondary: "#64748b",
          fontSize: 14,
        },
      }}
    >
      <div className="page-wrapper">
        <div className="content">
          <div className="access-page">
            <div className="page-topbar">
              <div className="topbar-left">
                <div className="brand-mark">
                  <AppstoreOutlined />
                </div>
                <div>
                  <div className="brand-title">HRM Admin</div>
                  <div className="brand-subtitle">Access Control</div>
                </div>
              </div>

              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                className="create-btn"
                onClick={handleCreateRole}
              >
                Create Role
              </Button>
            </div>

            <div className="page-header">
              <div className="header-copy">
                <div className="crumbs">
                  Access Control <ArrowRightOutlined /> Assign Role Permissions
                </div>
                <h1>Assign Role Permissions</h1>
                <p>
                  Manage role-based access with a clean sidebar-like permission
                  tree and fast role switching.
                </p>
              </div>

              <div className="header-stats">
                <Card className="mini-stat" bordered={false}>
                  <div className="mini-label">Roles</div>
                  <div className="mini-value">{roles.length}</div>
                </Card>

                <Card className="mini-stat" bordered={false}>
                  <div className="mini-label">Sections</div>
                  <div className="mini-value">{permissionTree.length}</div>
                </Card>

                <Card className="mini-stat" bordered={false}>
                  <div className="mini-label">Enabled</div>
                  <div className="mini-value">{selectedPermissions.length}</div>
                </Card>
              </div>
            </div>

            <div className="layout-grid">
              <aside className="left-panel">
                <Card className="panel-card sticky-panel" bordered={false}>
                  <div className="panel-head">
                    <div>
                      <h3>Roles</h3>
                      <p>Select a role to edit its permissions</p>
                    </div>
                    <Tag color="green" className="count-tag">
                      {roles.length}
                    </Tag>
                  </div>

                  <Input
                    value={roleSearch}
                    onChange={(e) => setRoleSearch(e.target.value)}
                    placeholder="Search role..."
                    prefix={<SearchOutlined />}
                    allowClear
                    className="search-input"
                  />

                  <div className="role-list">
                    {initialLoading ? (
                      <SkeletonCard />
                    ) : (
                      filteredRoles.map((role) => {
                        const count = rolePermissionCountMap.get(role.id) || 0;
                        const active = selectedRole === role.id;

                        return (
                          <button
                            key={role.id}
                            type="button"
                            className={`role-item ${active ? "active" : ""}`}
                            onClick={() => handleRoleSelect(role.id)}
                          >
                            <div className="role-item-left">
                              <div className="role-avatar">
                                <TeamOutlined />
                              </div>

                              <div className="role-item-text">
                                <div className="role-name">{role.name}</div>
                                <div className="role-sub">
                                  {count} permission{count !== 1 ? "s" : ""}
                                </div>
                              </div>
                            </div>

                            <div className="role-badge">{count}</div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </Card>

                <Card className="panel-card summary-card" bordered={false}>
                  <div className="panel-head">
                    <div>
                      <h3>Role Summary</h3>
                      <p>Quick overview</p>
                    </div>
                  </div>

                  <div className="summary-list">
                    <div className="summary-item">
                      <div className="summary-icon">
                        <UserOutlined />
                      </div>
                      <div className="summary-text">
                        <span>Total Roles</span>
                        <strong>{roles.length}</strong>
                      </div>
                    </div>

                    <div className="summary-item">
                      <div className="summary-icon">
                        <SafetyCertificateOutlined />
                      </div>
                      <div className="summary-text">
                        <span>Total Permissions</span>
                        <strong>{permissions.length}</strong>
                      </div>
                    </div>

                    <div className="summary-item">
                      <div className="summary-icon">
                        <CheckCircleFilled />
                      </div>
                      <div className="summary-text">
                        <span>Selected</span>
                        <strong>{selectedPermissions.length}</strong>
                      </div>
                    </div>
                  </div>
                </Card>
              </aside>

              <main className="right-panel">
                <Card className="panel-card" bordered={false}>
                  <div className="permission-header">
                    <div>
                      <div className="selected-label">Selected Role</div>
                      <div className="selected-role-row">
                        <h2>{selectedRoleName}</h2>
                        <Tag color="green" className="selected-tag">
                          {selectedPermissions.length} permissions
                        </Tag>
                      </div>
                      <p>
                        Toggle individual permissions or entire sections from
                        the tree below.
                      </p>
                    </div>

                    <div className="header-actions">
                      <Button
                        icon={<ExpandOutlined />}
                        onClick={handleExpandAll}
                      >
                        Expand All
                      </Button>
                      <Button
                        icon={<CompressOutlined />}
                        onClick={handleCollapseAll}
                      >
                        Collapse All
                      </Button>
                    </div>
                  </div>

                  <Divider className="soft-divider" />

                  <div className="search-row">
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search permissions..."
                      prefix={<SearchOutlined />}
                      allowClear
                      className="search-input large"
                    />

                    <Button
                      className="select-all-btn"
                      icon={<CheckCircleFilled />}
                      onClick={handleSelectAll}
                    >
                      Select All
                    </Button>
                  </div>

                  {initialLoading ? <SkeletonTable rows={5} columns={5} /> : (<div className="permission-list">
                      {filteredTree.length ? (
                        filteredTree.map((node) => (
                          <Card
                            key={node.key}
                            className={`perm-card ${node.children?.length ? "group-card" : "leaf-card"}`}
                            bordered={false}
                          >
                            <PermissionNodeCard
                              node={node}
                              search={search}
                              selectedPermissions={selectedPermissions}
                              onToggleNode={toggleNodeSelection}
                              expandedKeys={expandedKeys}
                              onToggleExpand={(key) =>
                                setExpandedKeys((prev) =>
                                  prev.includes(key)
                                    ? prev.filter((item) => item !== key)
                                    : [...prev, key],
                                )
                              }
                            />
                          </Card>
                        ))
                      ) : (
                        <Empty
                          description="No matching permissions found"
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                      )}
                    </div>)}

                  <Divider className="soft-divider" />

                  <div className="footer-bar">
                    <div className="footer-left">
                      <div className="footer-check">
                        <CheckCircleFilled />
                      </div>
                      <div>
                        <div className="footer-title">
                          {selectedPermissions.length} Permissions Selected
                        </div>
                        <div className="footer-subtitle">
                          You can save the permissions for this role
                        </div>
                      </div>
                    </div>

                    <div className="footer-actions">
                      <Button icon={<ReloadOutlined />} onClick={handleReset}>
                        Reset
                      </Button>
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => setSelectedPermissions([])}
                      >
                        Clear
                      </Button>
                      <Button
                        type="primary"
                        size="large"
                        icon={<SaveOutlined />}
                        onClick={handleSubmit}
                        loading={loading}
                      >
                        Save Permissions
                      </Button>
                    </div>
                  </div>
                </Card>
              </main>
            </div>

            <style jsx global>{`
              .access-page {
                min-height: 100vh;
                background: #f4f6f8;
                padding: 18px;
                color: #0f172a;
              }

              .page-topbar {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 16px;
                padding: 14px 18px;
                border-radius: 18px;
                background: #ffffff;
                border: 1px solid #e5e7eb;
                box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04);
                margin-bottom: 18px;
              }

              .topbar-left {
                display: flex;
                align-items: center;
                gap: 12px;
              }

              .brand-mark {
                width: 40px;
                height: 40px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #fff;
                background: linear-gradient(135deg, #16a34a, #22c55e);
                box-shadow: 0 10px 20px rgba(34, 197, 94, 0.18);
              }

              .brand-title {
                font-size: 16px;
                font-weight: 800;
                color: #111827;
                line-height: 1.2;
              }

              .brand-subtitle {
                font-size: 12px;
                color: #64748b;
                margin-top: 2px;
              }

              .create-btn {
                border-radius: 14px;
                background: linear-gradient(135deg, #16a34a, #15803d);
                border: none;
                box-shadow: 0 12px 24px rgba(22, 163, 74, 0.18);
              }

              .page-header {
                display: flex;
                align-items: end;
                justify-content: space-between;
                gap: 20px;
                margin-bottom: 18px;
              }

              .crumbs {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                font-size: 12px;
                color: #64748b;
                margin-bottom: 8px;
              }

              .header-copy h1 {
                margin: 0;
                font-size: 26px;
                font-weight: 900;
                color: #0f172a;
                letter-spacing: -0.02em;
              }

              .header-copy p {
                margin: 8px 0 0;
                font-size: 14px;
                color: #64748b;
                line-height: 1.7;
              }

              .header-stats {
                display: flex;
                gap: 12px;
                flex-wrap: wrap;
                justify-content: flex-end;
              }

              .mini-stat {
                min-width: 120px;
                border-radius: 16px;
                border: 1px solid #e5e7eb;
                box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04);
              }

              .mini-stat .ant-card-body {
                padding: 14px 16px;
              }

              .mini-label {
                font-size: 12px;
                color: #64748b;
                margin-bottom: 6px;
              }

              .mini-value {
                font-size: 20px;
                font-weight: 900;
                color: #111827;
              }

              .layout-grid {
                display: grid;
                grid-template-columns: 320px 1fr;
                gap: 18px;
                align-items: start;
              }

              .left-panel {
                display: flex;
                flex-direction: column;
                gap: 16px;
              }

              .panel-card {
                border-radius: 18px;
                border: 1px solid #e5e7eb;
                box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04);
                background: #fff;
              }

              .sticky-panel {
                position: sticky;
                top: 18px;
              }

              .panel-card .ant-card-body {
                padding: 18px;
              }

              .panel-head {
                display: flex;
                align-items: start;
                justify-content: space-between;
                gap: 12px;
                margin-bottom: 14px;
              }

              .panel-head h3 {
                margin: 0;
                font-size: 18px;
                font-weight: 900;
                color: #111827;
              }

              .panel-head p {
                margin: 5px 0 0;
                font-size: 12px;
                color: #64748b;
              }

              .count-tag {
                margin: 0;
                border-radius: 999px;
                font-weight: 700;
                border: none;
                padding: 4px 10px;
              }

              .search-input {
                border-radius: 14px;
                margin-bottom: 14px;
              }

              .search-input .ant-input-affix-wrapper {
                border-radius: 14px !important;
                height: 44px;
              }

              .search-input .ant-input {
                font-size: 14px;
              }

              .role-list {
                display: flex;
                flex-direction: column;
                gap: 10px;
                max-height: 510px;
                overflow: auto;
                padding-right: 4px;
              }

              .loading-box {
                min-height: 220px;
                display: flex;
                align-items: center;
                justify-content: center;
              }

              .role-item {
                width: 100%;
                border: 1px solid #e5e7eb;
                background: #fff;
                border-radius: 16px;
                padding: 12px 14px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
                cursor: pointer;
                transition: 0.22s ease;
                text-align: left;
              }

              .role-item:hover {
                border-color: #16a34a;
                box-shadow: 0 12px 24px rgba(15, 23, 42, 0.06);
                transform: translateY(-1px);
              }

              .role-item.active {
                border-color: #0f172a;
                background: linear-gradient(135deg, #0f172a, #1f2937);
                color: #fff;
                box-shadow: 0 16px 32px rgba(15, 23, 42, 0.18);
              }

              .role-item.active .role-sub,
              .role-item.active .role-name {
                color: #fff;
              }

              .role-item-left {
                display: flex;
                align-items: center;
                gap: 12px;
                min-width: 0;
              }

              .role-avatar {
                width: 38px;
                height: 38px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #f1f5f9;
                color: #16a34a;
                flex: 0 0 auto;
              }

              .role-item.active .role-avatar {
                background: rgba(255, 255, 255, 0.12);
                color: #86efac;
              }

              .role-item-text {
                min-width: 0;
              }

              .role-name {
                font-weight: 800;
                color: #111827;
                font-size: 14px;
                line-height: 1.3;
              }

              .role-sub {
                margin-top: 4px;
                color: #64748b;
                font-size: 12px;
              }

              .role-badge {
                min-width: 34px;
                height: 24px;
                padding: 0 8px;
                border-radius: 999px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                background: #ecfdf5;
                color: #16a34a;
                font-weight: 800;
                font-size: 12px;
                flex: 0 0 auto;
              }

              .role-item.active .role-badge {
                background: rgba(255, 255, 255, 0.12);
                color: #86efac;
              }

              .summary-card .summary-list {
                display: flex;
                flex-direction: column;
                gap: 12px;
              }

              .summary-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 12px;
                border-radius: 14px;
                background: #f9fafb;
                border: 1px solid #eef2f7;
              }

              .summary-icon {
                width: 36px;
                height: 36px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #ecfdf5;
                color: #16a34a;
                flex: 0 0 auto;
              }

              .summary-text {
                display: flex;
                flex-direction: column;
                gap: 2px;
              }

              .summary-text span {
                font-size: 12px;
                color: #64748b;
              }

              .summary-text strong {
                font-size: 16px;
                color: #111827;
                font-weight: 900;
              }

              .right-panel {
                display: flex;
                flex-direction: column;
                gap: 16px;
              }

              .permission-header {
                display: flex;
                align-items: start;
                justify-content: space-between;
                gap: 16px;
                flex-wrap: wrap;
              }

              .selected-label {
                font-size: 12px;
                color: #64748b;
                margin-bottom: 8px;
              }

              .selected-role-row {
                display: flex;
                align-items: center;
                gap: 10px;
                flex-wrap: wrap;
              }

              .selected-role-row h2 {
                margin: 0;
                font-size: 28px;
                font-weight: 900;
                color: #111827;
                letter-spacing: -0.02em;
              }

              .selected-tag {
                margin: 0;
                border-radius: 999px;
                font-weight: 700;
                border: none;
              }

              .permission-header p {
                margin: 8px 0 0;
                font-size: 13px;
                color: #64748b;
                line-height: 1.65;
              }

              .header-actions {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
              }

              .soft-divider {
                margin: 16px 0 !important;
                border-color: #e5e7eb !important;
              }

              .search-row {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 16px;
              }

              .search-row .search-input.large {
                flex: 1;
                margin-bottom: 0;
              }

              .select-all-btn {
                height: 44px;
                border-radius: 14px;
                border-color: #d1fae5;
                background: #f0fdf4;
                color: #15803d;
                font-weight: 800;
              }

              .permission-list {
                display: flex;
                flex-direction: column;
                gap: 14px;
              }

              .perm-card {
                border-radius: 16px;
                border: 1px solid #e5e7eb;
                background: linear-gradient(180deg, #ffffff, #fbfcfd);
                overflow: hidden;
              }

              .perm-card .ant-card-body {
                padding: 0;
              }

              .perm-block {
                padding: 0;
              }

              .perm-head {
                display: flex !important;
                align-items: center !important;
                justify-content: space-between !important;
                gap: 16px;
                padding: 14px 16px;
                width: 100%;
                transition: 0.2s ease;
              }

              .perm-head:hover {
                background: #fbfdff;
              }

              .perm-head.selected {
                background: linear-gradient(
                  180deg,
                  rgba(240, 253, 244, 0.9),
                  rgba(255, 255, 255, 1)
                );
              }

              .perm-head.partial {
                background: linear-gradient(
                  180deg,
                  rgba(255, 251, 235, 0.95),
                  rgba(255, 255, 255, 1)
                );
              }

              .perm-head-left {
                display: flex !important;
                align-items: center !important;
                gap: 12px;
                min-width: 0;
                flex: 1;
              }

              .expand-btn {
                width: 30px;
                height: 30px;
                border: 1px solid #dbe4ee;
                border-radius: 10px;
                background: #fff;
                color: #334155;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                flex: 0 0 auto;
                cursor: pointer;
                transition: all 2s ease;
              }
              .expand-btn svg {
                transition: transform 2s ease;
              }

              .expand-btn.open svg {
                transform: rotate(90deg);
              }
              .expand-btn:hover {
                border-color: #16a34a;
                color: #16a34a;
                box-shadow: 0 8px 16px rgba(15, 23, 42, 0.06);
              }

              .leaf-spacer {
                width: 30px;
                height: 30px;
                flex: 0 0 auto;
              }

              .perm-icon {
                width: 40px;
                height: 40px;
                border-radius: 14px;
                display: flex;
                align-items: center;
                justify-content: center;
                flex: 0 0 auto;
              }

              .perm-icon.group {
                background: #ecfdf5;
                color: #16a34a;
              }

              .perm-icon.leaf {
                background: #eff6ff;
                color: #2563eb;
              }

              .perm-text {
                min-width: 0;
              }

              .perm-title {
                font-size: 14px;
                font-weight: 900;
                color: #111827;
                line-height: 1.35;
              }

              .perm-subtitle {
                margin-top: 4px;
                font-size: 12px;
                color: #64748b;
              }

              .perm-head-right {
                display: flex !important;
                align-items: center !important;
                gap: 12px;
                flex: 0 0 auto;
              }

              .perm-tag {
                margin: 0;
                border: none;
                border-radius: 999px;
                font-weight: 700;
                padding: 4px 10px;
              }

              .perm-tag.group {
                background: #eff6ff !important;
                color: #2563eb !important;
              }

              .perm-tag.leaf {
                background: #ecfdf5 !important;
                color: #16a34a !important;
              }

              .perm-children {
                position: relative;
                margin-left: 42px;
                padding-left: 16px;
                padding-bottom: 10px;
              }

              .perm-children::before {
                content: "";
                position: absolute;
                left: 0;
                top: 0;
                bottom: 14px;
                width: 1px;
                background: #dcdfe5;
              }

              .group-block + .group-block {
                margin-top: 8px;
              }

              .leaf-block .perm-head {
                padding-top: 12px;
                padding-bottom: 12px;
              }

              .footer-bar {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 16px;
                padding: 16px 18px;
                border-radius: 18px;
                background: #f8fafc;
                border: 1px solid #e5e7eb;
              }

              .footer-left {
                display: flex;
                align-items: center;
                gap: 12px;
              }

              .footer-check {
                width: 38px;
                height: 38px;
                border-radius: 12px;
                background: #ecfdf5;
                color: #16a34a;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 10px 18px rgba(22, 163, 74, 0.12);
              }

              .footer-title {
                font-size: 14px;
                font-weight: 900;
                color: #111827;
              }

              .footer-subtitle {
                margin-top: 2px;
                font-size: 12px;
                color: #64748b;
              }

              .footer-actions {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
                justify-content: flex-end;
              }

              .assigned-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: 16px;
              }

              .assigned-head {
                display: flex;
                align-items: start;
                justify-content: space-between;
                gap: 12px;
                margin-bottom: 12px;
              }

              .assigned-head h3 {
                margin: 0;
                font-size: 16px;
                font-weight: 900;
                color: #111827;
              }

              .assigned-head p {
                margin: 4px 0 0;
                font-size: 12px;
                color: #64748b;
              }

              .assigned-tags {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
              }

              .permission-pill {
                margin: 0;
                border: 1px solid #d1fae5;
                background: #f0fdf4 !important;
                color: #15803d !important;
                border-radius: 999px;
                font-weight: 700;
              }

              .empty-text {
                color: #94a3b8;
                font-size: 13px;
              }

              .search-mark {
                background: #fde68a;
                color: #111827;
                padding: 0 3px;
                border-radius: 4px;
              }

              .perm-head .ant-switch {
                background: #d1d5db;
              }

              .perm-head .ant-switch-checked {
                background: #22c55e !important;
              }

              @media (max-width: 1180px) {
                .layout-grid {
                  grid-template-columns: 1fr;
                }

                .sticky-panel {
                  position: static;
                }
              }

              @media (max-width: 920px) {
                .page-header {
                  flex-direction: column;
                  align-items: flex-start;
                }

                .header-stats {
                  justify-content: flex-start;
                }

                .search-row,
                .footer-bar {
                  flex-direction: column;
                  align-items: stretch;
                }

                .footer-actions {
                  justify-content: stretch;
                }

                .footer-actions .ant-btn {
                  width: 100%;
                }
              }

              @media (max-width: 640px) {
                .access-page {
                  padding: 12px;
                }

                .page-topbar {
                  padding: 12px 14px;
                }

                .header-copy h1 {
                  font-size: 22px;
                }

                .selected-role-row h2 {
                  font-size: 22px;
                }

                .perm-head {
                  padding: 12px;
                }

                .perm-children {
                  margin-left: 12px;
                  padding-left: 10px;
                }

                .role-item {
                  padding: 11px 12px;
                }
              }
            `}</style>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default AssignRolePermissionsPage;
