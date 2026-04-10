/**
 * HIPAA/BAA/PHI Compliance System
 * Tags medical businesses with compliance requirements.
 * All data handling enforces PHI rules for tagged organizations.
 */

export interface ComplianceBadge {
  readonly type: "hipaa" | "baa" | "phi" | "pci" | "sox";
  readonly label: string;
  readonly color: string;
  readonly description: string;
}

/** Medical departments that require HIPAA compliance */
export const HIPAA_DEPARTMENTS = new Set([
  "clinical-operations",
  "admissions-intake",
  "compliance-quality",
]);

/** Departments that handle financial PHI */
export const PHI_FINANCIAL_DEPARTMENTS = new Set([
  "accounting-finance",
]);

/** Full compliance badge set for medical businesses */
export const MEDICAL_COMPLIANCE_BADGES: readonly ComplianceBadge[] = [
  { type: "hipaa", label: "HIPAA", color: "#ef4444", description: "Health Insurance Portability and Accountability Act compliant" },
  { type: "baa", label: "BAA", color: "#f97316", description: "Business Associate Agreement in place" },
  { type: "phi", label: "PHI Safe", color: "#06d6a0", description: "Protected Health Information handling compliant" },
];

/** Check if a business type requires medical compliance */
export function isMedicalBusiness(businessType?: string): boolean {
  if (!businessType) return false;
  const medicalTypes = ["hospice", "healthcare", "medical", "clinical", "hospital", "nursing", "comfort care"];
  return medicalTypes.some((t) => businessType.toLowerCase().includes(t));
}

/** Get compliance badges for a department */
export function getDepartmentComplianceBadges(department: string): readonly ComplianceBadge[] {
  const badges: ComplianceBadge[] = [];
  if (HIPAA_DEPARTMENTS.has(department)) {
    badges.push(...MEDICAL_COMPLIANCE_BADGES);
  }
  if (PHI_FINANCIAL_DEPARTMENTS.has(department)) {
    badges.push(
      { type: "hipaa", label: "HIPAA", color: "#ef4444", description: "Financial PHI handling compliant" },
      { type: "phi", label: "PHI Safe", color: "#06d6a0", description: "Medicare/Medicaid billing data protected" },
    );
  }
  return badges;
}
