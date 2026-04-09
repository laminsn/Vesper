"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileJson,
  FileSpreadsheet,
  ArrowLeft,
  ArrowRight,
  Check,
  Building2,
  HeartPulse,
  Megaphone,
  Landmark,
  Laptop,
  FileEdit,
  Shield,
} from "lucide-react";
import { GlowCard, ArcReactor } from "@/components/jarvis";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrgStore } from "@/stores/org-store";
import { useI18n } from "@/providers/i18n-provider";
import type { OrgIndustry } from "@/types";

// ─── Constants ────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3;

const STEP_LABELS: readonly string[] = ["Upload", "Review", "Deploy"] as const;

interface OrgTemplate {
  readonly id: string;
  readonly nameKey: string;
  readonly name: string;
  readonly agentCount: number;
  readonly deptCount: number;
  readonly industry: OrgIndustry;
  readonly hipaaEnabled: boolean;
  readonly icon: typeof HeartPulse;
  readonly color: string;
  readonly departments: readonly TemplateDepartment[];
}

interface TemplateDepartment {
  readonly name: string;
  readonly agentCount: number;
}

const TEMPLATES: readonly OrgTemplate[] = [
  {
    id: "healthcare-hospice",
    nameKey: "upload.templateHealthcare",
    name: "Healthcare (Hospice)",
    agentCount: 39,
    deptCount: 8,
    industry: "healthcare",
    hipaaEnabled: true,
    icon: HeartPulse,
    color: "#ef4444",
    departments: [
      { name: "Executive", agentCount: 1 },
      { name: "Marketing", agentCount: 7 },
      { name: "Clinical Operations", agentCount: 7 },
      { name: "Admissions & Intake", agentCount: 4 },
      { name: "Caregiver Staffing", agentCount: 5 },
      { name: "Customer Experience", agentCount: 6 },
      { name: "Compliance & Quality", agentCount: 5 },
      { name: "Accounting & Finance", agentCount: 6 },
    ],
  },
  {
    id: "marketing-agency",
    nameKey: "upload.templateMarketing",
    name: "Marketing Agency",
    agentCount: 48,
    deptCount: 9,
    industry: "marketing",
    hipaaEnabled: false,
    icon: Megaphone,
    color: "#8b5cf6",
    departments: [
      { name: "Executive", agentCount: 1 },
      { name: "Marketing", agentCount: 6 },
      { name: "Sales", agentCount: 6 },
      { name: "AI Solutions", agentCount: 7 },
      { name: "Campaign Management", agentCount: 6 },
      { name: "Web & Design", agentCount: 6 },
      { name: "Coaching", agentCount: 5 },
      { name: "Client Success", agentCount: 5 },
      { name: "Operations", agentCount: 6 },
    ],
  },
  {
    id: "real-estate-title",
    nameKey: "upload.templateRealEstate",
    name: "Real Estate & Title",
    agentCount: 35,
    deptCount: 8,
    industry: "real_estate",
    hipaaEnabled: false,
    icon: Landmark,
    color: "#f59e0b",
    departments: [
      { name: "Executive", agentCount: 1 },
      { name: "Marketing", agentCount: 5 },
      { name: "Sales & Realtor Relations", agentCount: 5 },
      { name: "Title & Escrow Operations", agentCount: 6 },
      { name: "Closing", agentCount: 5 },
      { name: "Customer Experience", agentCount: 4 },
      { name: "Compliance", agentCount: 4 },
      { name: "Accounting & Finance", agentCount: 5 },
    ],
  },
  {
    id: "saas-startup",
    nameKey: "upload.templateSaaS",
    name: "SaaS Startup",
    agentCount: 20,
    deptCount: 6,
    industry: "technology",
    hipaaEnabled: false,
    icon: Laptop,
    color: "#3b82f6",
    departments: [
      { name: "Executive", agentCount: 1 },
      { name: "Engineering", agentCount: 6 },
      { name: "Product", agentCount: 4 },
      { name: "Growth", agentCount: 4 },
      { name: "Customer Success", agentCount: 3 },
      { name: "Operations", agentCount: 2 },
    ],
  },
  {
    id: "blank",
    nameKey: "upload.templateBlank",
    name: "Blank Organization",
    agentCount: 0,
    deptCount: 0,
    industry: "other",
    hipaaEnabled: false,
    icon: FileEdit,
    color: "#6b7280",
    departments: [],
  },
] as const;

const INDUSTRY_OPTIONS: readonly { value: OrgIndustry; label: string }[] = [
  { value: "healthcare", label: "Healthcare" },
  { value: "marketing", label: "Marketing" },
  { value: "finance", label: "Finance" },
  { value: "real_estate", label: "Real Estate" },
  { value: "technology", label: "Technology" },
  { value: "education", label: "Education" },
  { value: "other", label: "Other" },
] as const;

// ─── Animations ───────────────────────────────────────────────────────────────

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -16, transition: { duration: 0.2 } },
};

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const staggerChild = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

// ─── Deploy Progress Steps ────────────────────────────────────────────────────

interface DeployStep {
  readonly label: string;
  readonly duration: number;
}

const DEPLOY_STEPS: readonly DeployStep[] = [
  { label: "Creating organization...", duration: 1200 },
  { label: "Setting up departments...", duration: 1800 },
  { label: "Deploying agents...", duration: 2400 },
  { label: "Configuring playbooks...", duration: 1600 },
  { label: "Ready!", duration: 800 },
] as const;

// ─── Types for form state ─────────────────────────────────────────────────────

interface ManualFormState {
  readonly orgName: string;
  readonly industry: OrgIndustry;
  readonly hipaaMode: boolean;
}

interface ReviewData {
  readonly orgName: string;
  readonly industry: OrgIndustry;
  readonly hipaaMode: boolean;
  readonly departments: readonly TemplateDepartment[];
  readonly totalAgents: number;
  readonly source: "template" | "manual" | "file";
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function UploadProfilePage() {
  const router = useRouter();
  const { setCurrentOrg } = useOrgStore();
  const { t } = useI18n();

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [selectedTemplate, setSelectedTemplate] = useState<OrgTemplate | null>(null);
  const [manualForm, setManualForm] = useState<ManualFormState>({
    orgName: "",
    industry: "other",
    hipaaMode: false,
  });
  const [reviewData, setReviewData] = useState<ReviewData | null>(null);
  const [deployProgress, setDeployProgress] = useState(-1);
  const [deployComplete, setDeployComplete] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // ─── Handlers ─────────────────────────────────────────────────────────

  const handleTemplateSelect = useCallback(
    (template: OrgTemplate) => {
      setSelectedTemplate(template);
      setReviewData({
        orgName: template.name,
        industry: template.industry,
        hipaaMode: template.hipaaEnabled,
        departments: template.departments,
        totalAgents: template.agentCount,
        source: "template",
      });
      setCurrentStep(2);
    },
    []
  );

  const handleManualContinue = useCallback(() => {
    if (!manualForm.orgName.trim()) return;
    setReviewData({
      orgName: manualForm.orgName,
      industry: manualForm.industry,
      hipaaMode: manualForm.hipaaMode,
      departments: [],
      totalAgents: 0,
      source: "manual",
    });
    setCurrentStep(2);
  }, [manualForm]);

  const handleFileDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragActive(false);
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileUpload(files[0]);
      }
    },
    []
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFileUpload(files[0]);
      }
    },
    []
  );

  const handleFileUpload = useCallback((_file: File) => {
    // Mock: pretend file is parsed as HHCC template
    const template = TEMPLATES[0];
    setReviewData({
      orgName: template.name,
      industry: template.industry,
      hipaaMode: template.hipaaEnabled,
      departments: template.departments,
      totalAgents: template.agentCount,
      source: "file",
    });
    setCurrentStep(2);
  }, []);

  const handleDeploy = useCallback(async () => {
    setCurrentStep(3);
    for (let i = 0; i < DEPLOY_STEPS.length; i++) {
      setDeployProgress(i);
      await new Promise((resolve) =>
        setTimeout(resolve, DEPLOY_STEPS[i].duration)
      );
    }
    setDeployComplete(true);
    if (reviewData) {
      const slug = reviewData.orgName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setCurrentOrg(
        `org-${slug}`,
        reviewData.orgName,
        slug,
        reviewData.hipaaMode
      );
    }
  }, [reviewData, setCurrentOrg]);

  const handleBack = useCallback(() => {
    if (currentStep === 2) {
      setCurrentStep(1);
      setSelectedTemplate(null);
      setReviewData(null);
    }
  }, [currentStep]);

  const handleGoToDashboard = useCallback(() => {
    router.push("/");
  }, [router]);

  // ─── Manual form updaters (immutable) ─────────────────────────────────

  const updateOrgName = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setManualForm((prev) => ({ ...prev, orgName: e.target.value }));
    },
    []
  );

  const updateIndustry = useCallback((value: string) => {
    setManualForm((prev) => ({ ...prev, industry: value as OrgIndustry }));
  }, []);

  const updateHipaaMode = useCallback((checked: boolean) => {
    setManualForm((prev) => ({ ...prev, hipaaMode: checked }));
  }, []);

  // ─── Render ───────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="heading-display text-3xl text-[var(--jarvis-text-primary)]">
          {t("upload.title")}
        </h1>
        <p className="mt-1 text-sm text-[var(--jarvis-text-muted)]">
          {t("upload.subtitle")}
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-3">
        {STEP_LABELS.map((label, idx) => {
          const stepNum = (idx + 1) as Step;
          const isActive = stepNum === currentStep;
          const isDone = stepNum < currentStep;
          return (
            <div key={label} className="flex items-center gap-3">
              {idx > 0 && (
                <div
                  className="h-px w-8"
                  style={{
                    backgroundColor: isDone
                      ? "var(--jarvis-accent)"
                      : "var(--jarvis-border)",
                  }}
                />
              )}
              <div className="flex items-center gap-2">
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold transition-colors"
                  style={{
                    borderColor: isActive || isDone
                      ? "var(--jarvis-accent)"
                      : "var(--jarvis-border)",
                    backgroundColor: isDone
                      ? "var(--jarvis-accent)"
                      : isActive
                        ? "var(--jarvis-accent)15"
                        : "transparent",
                    color: isDone
                      ? "#000"
                      : isActive
                        ? "var(--jarvis-accent)"
                        : "var(--jarvis-text-muted)",
                  }}
                >
                  {isDone ? <Check className="h-3.5 w-3.5" /> : stepNum}
                </div>
                <span
                  className="text-sm font-medium"
                  style={{
                    color: isActive
                      ? "var(--jarvis-text-primary)"
                      : "var(--jarvis-text-muted)",
                  }}
                >
                  {label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <motion.div key="step-1" {...fadeUp} className="space-y-8">
            <StepUpload
              dragActive={dragActive}
              setDragActive={setDragActive}
              onFileDrop={handleFileDrop}
              onFileInput={handleFileInput}
              templates={TEMPLATES}
              onTemplateSelect={handleTemplateSelect}
              manualForm={manualForm}
              onOrgNameChange={updateOrgName}
              onIndustryChange={updateIndustry}
              onHipaaChange={updateHipaaMode}
              onManualContinue={handleManualContinue}
              t={t}
            />
          </motion.div>
        )}

        {currentStep === 2 && reviewData && (
          <motion.div key="step-2" {...fadeUp}>
            <StepReview
              data={reviewData}
              onBack={handleBack}
              onDeploy={handleDeploy}
              t={t}
            />
          </motion.div>
        )}

        {currentStep === 3 && (
          <motion.div key="step-3" {...fadeUp}>
            <StepDeploy
              progress={deployProgress}
              complete={deployComplete}
              steps={DEPLOY_STEPS}
              onGoToDashboard={handleGoToDashboard}
              t={t}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Step 1: Upload ───────────────────────────────────────────────────────────

interface StepUploadProps {
  readonly dragActive: boolean;
  readonly setDragActive: (v: boolean) => void;
  readonly onFileDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  readonly onFileInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readonly templates: readonly OrgTemplate[];
  readonly onTemplateSelect: (t: OrgTemplate) => void;
  readonly manualForm: ManualFormState;
  readonly onOrgNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readonly onIndustryChange: (v: string) => void;
  readonly onHipaaChange: (v: boolean) => void;
  readonly onManualContinue: () => void;
  readonly t: (key: string) => string;
}

function StepUpload({
  dragActive,
  setDragActive,
  onFileDrop,
  onFileInput,
  templates,
  onTemplateSelect,
  manualForm,
  onOrgNameChange,
  onIndustryChange,
  onHipaaChange,
  onManualContinue,
  t,
}: StepUploadProps) {
  return (
    <>
      {/* File Upload Zone */}
      <GlowCard className="p-6" hover={false}>
        <div
          className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 transition-colors"
          style={{
            borderColor: dragActive
              ? "var(--jarvis-accent)"
              : "var(--jarvis-border)",
            backgroundColor: dragActive
              ? "var(--jarvis-accent)08"
              : "transparent",
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={onFileDrop}
        >
          <Upload
            className="mb-4 h-10 w-10"
            style={{
              color: dragActive
                ? "var(--jarvis-accent)"
                : "var(--jarvis-text-muted)",
            }}
          />
          <p className="mb-1 text-sm font-medium text-[var(--jarvis-text-primary)]">
            {t("upload.dragDrop")}
          </p>
          <p className="mb-4 text-xs text-[var(--jarvis-text-muted)]">
            {t("upload.supportedFormats")}
          </p>
          <label>
            <input
              type="file"
              accept=".json,.csv"
              className="hidden"
              onChange={onFileInput}
            />
            <Button variant="outline" size="sm" asChild>
              <span>{t("upload.browseFiles")}</span>
            </Button>
          </label>
          <div className="mt-4 flex items-center gap-3">
            <FileJson className="h-4 w-4 text-[var(--jarvis-text-muted)]" />
            <span className="text-xs text-[var(--jarvis-text-muted)]">.json</span>
            <FileSpreadsheet className="h-4 w-4 text-[var(--jarvis-text-muted)]" />
            <span className="text-xs text-[var(--jarvis-text-muted)]">.csv</span>
          </div>
        </div>
      </GlowCard>

      {/* OR divider */}
      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-[var(--jarvis-border)]" />
        <span className="text-xs font-medium uppercase tracking-wider text-[var(--jarvis-text-muted)]">
          {t("upload.orTemplate")}
        </span>
        <div className="h-px flex-1 bg-[var(--jarvis-border)]" />
      </div>

      {/* Template Selection */}
      <div>
        <h3 className="heading-mono mb-4">{t("upload.startFromTemplate")}</h3>
        <motion.div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          {templates.map((template) => {
            const Icon = template.icon;
            return (
              <motion.div key={template.id} variants={staggerChild}>
                <GlowCard
                  className="flex flex-col p-4"
                  glowColor={template.color}
                >
                  <div className="mb-3 flex items-center gap-2.5">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${template.color}15` }}
                    >
                      <span style={{ color: template.color }}><Icon className="h-5 w-5" /></span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--jarvis-text-primary)]">
                        {template.name}
                      </p>
                    </div>
                  </div>
                  <div className="mb-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-md border border-[var(--jarvis-border)] bg-[var(--jarvis-bg-tertiary)] px-2 py-0.5 text-[10px] text-[var(--jarvis-text-muted)]">
                      {template.agentCount} {t("common.agents")}
                    </span>
                    <span className="inline-flex items-center rounded-md border border-[var(--jarvis-border)] bg-[var(--jarvis-bg-tertiary)] px-2 py-0.5 text-[10px] text-[var(--jarvis-text-muted)]">
                      {template.deptCount} depts
                    </span>
                    {template.hipaaEnabled && (
                      <span className="inline-flex items-center gap-1 rounded-md border border-[var(--jarvis-accent)]/30 bg-[var(--jarvis-accent)]/10 px-2 py-0.5 text-[10px] text-[var(--jarvis-accent)]">
                        <Shield className="h-2.5 w-2.5" />
                        HIPAA
                      </span>
                    )}
                  </div>
                  <div className="mt-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => onTemplateSelect(template)}
                    >
                      {t("upload.useTemplate")}
                    </Button>
                  </div>
                </GlowCard>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* OR divider */}
      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-[var(--jarvis-border)]" />
        <span className="text-xs font-medium uppercase tracking-wider text-[var(--jarvis-text-muted)]">
          {t("upload.orManual")}
        </span>
        <div className="h-px flex-1 bg-[var(--jarvis-border)]" />
      </div>

      {/* Manual Entry */}
      <GlowCard className="max-w-xl p-5" hover={false}>
        <h3 className="heading-mono mb-4">{t("upload.manualEntry")}</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t("upload.orgNameLabel")}</Label>
            <Input
              placeholder={t("upload.orgNamePlaceholder")}
              value={manualForm.orgName}
              onChange={onOrgNameChange}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("upload.industryLabel")}</Label>
            <Select value={manualForm.industry} onValueChange={onIndustryChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-[var(--jarvis-border)] p-3">
            <div>
              <p className="text-sm font-medium text-[var(--jarvis-text-primary)]">
                {t("upload.hipaaMode")}
              </p>
              <p className="text-xs text-[var(--jarvis-text-muted)]">
                {t("upload.hipaaDescription")}
              </p>
            </div>
            <Switch
              checked={manualForm.hipaaMode}
              onCheckedChange={onHipaaChange}
            />
          </div>
          <Button
            onClick={onManualContinue}
            disabled={!manualForm.orgName.trim()}
          >
            <ArrowRight className="h-4 w-4" />
            {t("upload.continue")}
          </Button>
        </div>
      </GlowCard>
    </>
  );
}

// ─── Step 2: Review ───────────────────────────────────────────────────────────

interface StepReviewProps {
  readonly data: ReviewData;
  readonly onBack: () => void;
  readonly onDeploy: () => void;
  readonly t: (key: string) => string;
}

function StepReview({ data, onBack, onDeploy, t }: StepReviewProps) {
  return (
    <div className="max-w-2xl space-y-6">
      <GlowCard className="p-6" hover={false}>
        <h3 className="heading-mono mb-4">{t("upload.reviewTitle")}</h3>

        <div className="space-y-4">
          {/* Org name */}
          <div className="flex items-center justify-between rounded-lg border border-[var(--jarvis-border)] p-3">
            <span className="text-sm text-[var(--jarvis-text-muted)]">
              {t("upload.orgNameLabel")}
            </span>
            <span className="text-sm font-medium text-[var(--jarvis-text-primary)]">
              {data.orgName}
            </span>
          </div>

          {/* Industry */}
          <div className="flex items-center justify-between rounded-lg border border-[var(--jarvis-border)] p-3">
            <span className="text-sm text-[var(--jarvis-text-muted)]">
              {t("upload.industryLabel")}
            </span>
            <span className="inline-flex items-center rounded-md border border-[var(--jarvis-border)] bg-[var(--jarvis-bg-tertiary)] px-2 py-0.5 text-xs text-[var(--jarvis-text-secondary)]">
              {data.industry}
            </span>
          </div>

          {/* HIPAA */}
          <div className="flex items-center justify-between rounded-lg border border-[var(--jarvis-border)] p-3">
            <span className="text-sm text-[var(--jarvis-text-muted)]">
              {t("upload.hipaaMode")}
            </span>
            <span
              className="text-sm font-medium"
              style={{
                color: data.hipaaMode
                  ? "var(--jarvis-accent)"
                  : "var(--jarvis-text-muted)",
              }}
            >
              {data.hipaaMode ? "Enabled" : "Disabled"}
            </span>
          </div>

          {/* Total Agents */}
          <div className="flex items-center justify-between rounded-lg border border-[var(--jarvis-border)] p-3">
            <span className="text-sm text-[var(--jarvis-text-muted)]">
              {t("upload.totalAgents")}
            </span>
            <span className="text-sm font-medium text-[var(--jarvis-text-primary)]">
              {data.totalAgents}
            </span>
          </div>

          {/* Departments */}
          {data.departments.length > 0 && (
            <div className="rounded-lg border border-[var(--jarvis-border)] p-3">
              <p className="mb-2 text-sm text-[var(--jarvis-text-muted)]">
                {t("upload.departments")} ({data.departments.length})
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {data.departments.map((dept) => (
                  <div
                    key={dept.name}
                    className="flex items-center justify-between rounded-md bg-[var(--jarvis-bg-tertiary)] px-3 py-2"
                  >
                    <span className="text-xs font-medium text-[var(--jarvis-text-primary)]">
                      {dept.name}
                    </span>
                    <span className="text-[10px] text-[var(--jarvis-text-muted)]">
                      {dept.agentCount} {t("common.agents")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center gap-3">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
            {t("common.back")}
          </Button>
          <Button onClick={onDeploy}>
            {t("upload.deploy")}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </GlowCard>
    </div>
  );
}

// ─── Step 3: Deploy ───────────────────────────────────────────────────────────

interface StepDeployProps {
  readonly progress: number;
  readonly complete: boolean;
  readonly steps: readonly DeployStep[];
  readonly onGoToDashboard: () => void;
  readonly t: (key: string) => string;
}

function StepDeploy({ progress, complete, steps, onGoToDashboard, t }: StepDeployProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      {/* Arc Reactor spinner */}
      <div className={complete ? "" : "animate-pulse"}>
        <ArcReactor
          size="lg"
          label={complete ? "OK" : ""}
          sublabel={complete ? "" : undefined}
          color={complete ? "var(--jarvis-success)" : "var(--jarvis-accent)"}
        />
      </div>

      <h2 className="heading-display mt-6 text-xl text-[var(--jarvis-text-primary)]">
        {complete ? t("upload.deployComplete") : t("upload.deploying")}
      </h2>

      {/* Progress steps */}
      <div className="mt-8 w-full max-w-sm space-y-3">
        {steps.map((step, idx) => {
          const isDone = idx < progress || (idx === progress && complete);
          const isActive = idx === progress && !complete;
          return (
            <div key={step.label} className="flex items-center gap-3">
              <div className="flex h-6 w-6 items-center justify-center">
                {isDone ? (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--jarvis-success)]">
                    <Check className="h-3 w-3 text-black" />
                  </div>
                ) : isActive ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--jarvis-accent)] border-t-transparent" />
                ) : (
                  <div className="h-5 w-5 rounded-full border border-[var(--jarvis-border)]" />
                )}
              </div>
              <span
                className="text-sm"
                style={{
                  color: isDone
                    ? "var(--jarvis-text-primary)"
                    : isActive
                      ? "var(--jarvis-accent)"
                      : "var(--jarvis-text-muted)",
                }}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Go to Dashboard */}
      {complete && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <Button size="lg" onClick={onGoToDashboard}>
            {t("upload.goToDashboard")}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}
