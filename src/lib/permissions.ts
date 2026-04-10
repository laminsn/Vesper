/**
 * Vesper Permission System
 * Department-scoped access control for team members.
 */

export type TeamRole = "owner" | "admin" | "operator" | "viewer";

export interface Permission {
  readonly canViewDashboard: boolean;
  readonly canViewAllDepartments: boolean;
  readonly canViewFinancials: boolean;
  readonly canViewPHI: boolean;
  readonly canIssueDirectives: boolean;
  readonly canManageAgents: boolean;
  readonly canEditSettings: boolean;
  readonly canInviteTeam: boolean;
  readonly canEditCompanyProfile: boolean;
  readonly canApproveAssets: boolean;
  readonly canExportData: boolean;
  readonly departmentScope: "all" | "assigned";
}

const ROLE_PERMISSIONS: Record<TeamRole, Permission> = {
  owner: {
    canViewDashboard: true,
    canViewAllDepartments: true,
    canViewFinancials: true,
    canViewPHI: true,
    canIssueDirectives: true,
    canManageAgents: true,
    canEditSettings: true,
    canInviteTeam: true,
    canEditCompanyProfile: true,
    canApproveAssets: true,
    canExportData: true,
    departmentScope: "all",
  },
  admin: {
    canViewDashboard: true,
    canViewAllDepartments: true,
    canViewFinancials: false,
    canViewPHI: false,
    canIssueDirectives: true,
    canManageAgents: true,
    canEditSettings: true,
    canInviteTeam: true,
    canEditCompanyProfile: false,
    canApproveAssets: true,
    canExportData: true,
    departmentScope: "all",
  },
  operator: {
    canViewDashboard: true,
    canViewAllDepartments: false,
    canViewFinancials: false,
    canViewPHI: false,
    canIssueDirectives: true,
    canManageAgents: false,
    canEditSettings: false,
    canInviteTeam: false,
    canEditCompanyProfile: false,
    canApproveAssets: false,
    canExportData: false,
    departmentScope: "assigned",
  },
  viewer: {
    canViewDashboard: true,
    canViewAllDepartments: false,
    canViewFinancials: false,
    canViewPHI: false,
    canIssueDirectives: false,
    canManageAgents: false,
    canEditSettings: false,
    canInviteTeam: false,
    canEditCompanyProfile: false,
    canApproveAssets: false,
    canExportData: false,
    departmentScope: "assigned",
  },
};

export function getPermissions(role: TeamRole): Permission {
  return ROLE_PERMISSIONS[role] ?? ROLE_PERMISSIONS.viewer;
}

export function canAccessDepartment(
  role: TeamRole,
  department: string,
  allowedDepartments: readonly string[]
): boolean {
  const perms = getPermissions(role);
  if (perms.departmentScope === "all") return true;
  return allowedDepartments.includes(department);
}

export function isFinancialDepartment(department: string): boolean {
  return department === "accounting-finance";
}

export function isClinicalDepartment(department: string): boolean {
  return ["clinical-operations", "admissions-intake"].includes(department);
}

/** Sidebar items to hide based on role */
export function getHiddenNavItems(role: TeamRole): readonly string[] {
  const perms = getPermissions(role);
  const hidden: string[] = [];
  if (!perms.canViewFinancials) hidden.push("/billing");
  if (!perms.canEditSettings) hidden.push("/settings");
  if (!perms.canViewPHI) hidden.push("/phi-monitor");
  if (!perms.canManageAgents) hidden.push("/training");
  if (!perms.canInviteTeam) hidden.push("/api-portal");
  return hidden;
}
