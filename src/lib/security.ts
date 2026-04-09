/**
 * Security utilities for the AI Army Vesper platform.
 * Provides input sanitization, PHI detection, session guards,
 * rate limiting, CSRF protection, zone enforcement, and distress detection.
 */

/* -- Input Sanitization --------------------------------------------------- */

/** Strip HTML tags to prevent XSS via user-supplied text */
export function sanitizeInput(raw: string): string {
  return raw
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/** Validate email format */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Validate that a string is a safe identifier (alphanumeric + hyphens/underscores) */
export function isSafeIdentifier(value: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(value) && value.length <= 128;
}

/* -- PHI Detection (client-side redaction layer) -------------------------- */

const PHI_PATTERNS: readonly RegExp[] = [
  /\b\d{3}-\d{2}-\d{4}\b/,                        // SSN
  /\b\d{9}\b/,                                      // 9-digit ID
  /\b(?:MRN|mrn)[:\s#]*\w{4,}\b/i,                  // Medical Record Number
  /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/,              // DOB-style dates
  /\b(?:DOB|dob|Date of Birth)[:\s]*\S+/i,           // Labeled DOB
  /\b(?:patient|pt|member)\s*(?:name|id)[:\s]*\S+/i, // Patient identifiers
  /\b[A-Z]\d{4,9}\b/,                               // Insurance/policy IDs
  /\b(?:NPI|npi)[:\s#]*\d{10}\b/i,                  // National Provider Identifier
  /\b(?:DEA|dea)[:\s#]*[A-Z]{2}\d{7}\b/i,           // DEA number
];

/** Check whether a string likely contains PHI */
export function containsPhi(text: string): boolean {
  return PHI_PATTERNS.some((p) => p.test(text));
}

/** Redact potential PHI tokens from a string */
export function redactPhi(text: string): string {
  let result = text;
  for (const pattern of PHI_PATTERNS) {
    result = result.replace(new RegExp(pattern, "g"), "[REDACTED]");
  }
  return result;
}

export type PhiRiskLevel = "none" | "low" | "medium" | "high";

/** Classify PHI severity level */
export function classifyPhiRisk(text: string): PhiRiskLevel {
  const lower = text.toLowerCase();
  // High: SSN, MRN, or explicit patient data
  if (/\b\d{3}-\d{2}-\d{4}\b/.test(text)) return "high";
  if (/\b(?:MRN|mrn)[:\s#]*\w{4,}\b/i.test(text)) return "high";
  if (/\b(?:patient|pt|member)\s*(?:name|id)[:\s]*\S+/i.test(lower)) return "high";
  // Medium: DOB, insurance IDs
  if (/\b(?:DOB|dob|Date of Birth)/i.test(text)) return "medium";
  if (/\b[A-Z]\d{4,9}\b/.test(text)) return "medium";
  // Low: dates that might be DOB
  if (/\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/.test(text)) return "low";
  return "none";
}

/* -- Session Security ----------------------------------------------------- */

/** Maximum idle time before we consider the session stale (ms) */
export const SESSION_TIMEOUT_MS = 60 * 60 * 1000; // 60 min default

let lastActivity = Date.now();

export function recordActivity(): void {
  lastActivity = Date.now();
}

export function isSessionStale(): boolean {
  return Date.now() - lastActivity > SESSION_TIMEOUT_MS;
}

/* -- Client-Side Rate Limiting -------------------------------------------- */

interface RateLimitEntry {
  readonly count: number;
  readonly windowStart: number;
}

export interface RateLimitConfig {
  readonly maxRequests: number;
  readonly windowMs: number;
}

export interface RateLimitResult {
  readonly allowed: boolean;
  readonly remaining: number;
  readonly retryAfterMs: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/** Default rate limit presets */
export const RATE_LIMITS: Readonly<Record<string, RateLimitConfig>> = {
  auth_login:     { maxRequests: 5,   windowMs: 60_000 },
  auth_signup:    { maxRequests: 3,   windowMs: 600_000 },
  api_call:       { maxRequests: 60,  windowMs: 60_000 },
  agent_invoke:   { maxRequests: 30,  windowMs: 60_000 },
  task_create:    { maxRequests: 60,  windowMs: 60_000 },
  export_data:    { maxRequests: 5,   windowMs: 600_000 },
  password_reset: { maxRequests: 3,   windowMs: 3_600_000 },
};

/**
 * Client-side rate limiter. Returns { allowed, remaining, retryAfterMs }.
 * This is a first line of defense -- server-side edge function is the enforcer.
 */
export function checkClientRateLimit(
  action: string,
  config?: RateLimitConfig
): RateLimitResult {
  const limits = config ?? RATE_LIMITS[action];
  if (!limits) return { allowed: true, remaining: 999, retryAfterMs: 0 };

  const now = Date.now();
  const entry = rateLimitStore.get(action);

  if (!entry || now - entry.windowStart >= limits.windowMs) {
    rateLimitStore.set(action, { count: 1, windowStart: now });
    return { allowed: true, remaining: limits.maxRequests - 1, retryAfterMs: 0 };
  }

  if (entry.count >= limits.maxRequests) {
    const retryAfterMs = limits.windowMs - (now - entry.windowStart);
    return { allowed: false, remaining: 0, retryAfterMs };
  }

  rateLimitStore.set(action, { ...entry, count: entry.count + 1 });
  return {
    allowed: true,
    remaining: limits.maxRequests - (entry.count + 1),
    retryAfterMs: 0,
  };
}

/** Reset rate limit for an action (e.g., after successful login) */
export function resetClientRateLimit(action: string): void {
  rateLimitStore.delete(action);
}

/* -- CSRF Protection ------------------------------------------------------ */

const CSRF_TOKEN_KEY = "vesper-csrf-token";

/** Generate a cryptographically random CSRF token */
export function generateCsrfToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const token = Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
  try {
    sessionStorage.setItem(CSRF_TOKEN_KEY, token);
  } catch {
    // sessionStorage unavailable (SSR)
  }
  return token;
}

/** Validate a CSRF token against the stored one */
export function validateCsrfToken(token: string): boolean {
  try {
    const stored = sessionStorage.getItem(CSRF_TOKEN_KEY);
    if (!stored || !token) return false;
    // Constant-time comparison to prevent timing attacks
    if (stored.length !== token.length) return false;
    let result = 0;
    for (let i = 0; i < stored.length; i++) {
      result |= stored.charCodeAt(i) ^ token.charCodeAt(i);
    }
    return result === 0;
  } catch {
    return false;
  }
}

/* -- API Key Validation --------------------------------------------------- */

/** Mask an API key for display (show first 4 and last 4 chars) */
export function maskApiKey(key: string): string {
  if (key.length <= 12) return "****";
  return `${key.slice(0, 4)}${"*".repeat(key.length - 8)}${key.slice(-4)}`;
}

/** Validate API key format for known providers */
export function validateApiKeyFormat(
  provider: string,
  key: string
): { readonly valid: boolean; readonly message: string } {
  const trimmed = key.trim();
  if (!trimmed) return { valid: false, message: "API key is required" };
  if (trimmed.length < 10) return { valid: false, message: "API key is too short" };

  switch (provider.toLowerCase()) {
    case "openai":
      if (!trimmed.startsWith("sk-")) return { valid: false, message: "OpenAI keys must start with 'sk-'" };
      break;
    case "anthropic":
      if (!trimmed.startsWith("sk-ant-")) return { valid: false, message: "Anthropic keys must start with 'sk-ant-'" };
      break;
    case "google":
    case "gemini":
      if (!trimmed.startsWith("AI")) return { valid: false, message: "Google AI keys typically start with 'AI'" };
      break;
  }

  return { valid: true, message: "Valid format" };
}

/* -- Zone Enforcement ----------------------------------------------------- */

export type SecurityZone = "clinical" | "operations" | "external";

export interface ZonePolicy {
  readonly allowedModels: readonly string[];
  readonly allowExternalApi: boolean;
  readonly requirePhiScan: boolean;
  readonly requireAuditLog: boolean;
  readonly maxTokensPerRequest: number;
  readonly description: string;
}

export const ZONE_POLICIES: Readonly<Record<SecurityZone, ZonePolicy>> = {
  clinical: {
    allowedModels: ["self-hosted", "llama", "mistral"],
    allowExternalApi: false,
    requirePhiScan: true,
    requireAuditLog: true,
    maxTokensPerRequest: 4096,
    description: "PHI-safe zone. Only self-hosted models allowed. No external API calls.",
  },
  operations: {
    allowedModels: ["claude", "openai", "gemini", "self-hosted", "llama", "mistral"],
    allowExternalApi: true,
    requirePhiScan: true,
    requireAuditLog: true,
    maxTokensPerRequest: 8192,
    description: "Internal operations. All models allowed. PHI scanning enforced.",
  },
  external: {
    allowedModels: ["claude", "openai", "gemini", "self-hosted", "llama", "mistral"],
    allowExternalApi: true,
    requirePhiScan: false,
    requireAuditLog: false,
    maxTokensPerRequest: 16384,
    description: "External-facing zone. No PHI restrictions.",
  },
};

/** Check if a model is allowed in a given zone */
export function isModelAllowedInZone(model: string, zone: SecurityZone): boolean {
  const policy = ZONE_POLICIES[zone];
  return policy.allowedModels.some((allowed) =>
    model.toLowerCase().includes(allowed.toLowerCase())
  );
}

/** Get the zone policy for enforcement */
export function getZonePolicy(zone: SecurityZone): ZonePolicy {
  return ZONE_POLICIES[zone];
}

/* -- Distress Detection (keyword-based first pass) ------------------------ */

const DISTRESS_KEYWORDS: readonly string[] = [
  "suicide", "suicidal", "kill myself", "end my life", "self-harm",
  "want to die", "hurt myself", "no reason to live", "overdose",
  "emergency", "crisis", "in danger", "help me",
];

/** Detect potential distress signals in text */
export function detectDistress(text: string): boolean {
  const lower = text.toLowerCase();
  return DISTRESS_KEYWORDS.some((kw) => lower.includes(kw));
}

/** Standard distress response message */
export const DISTRESS_RESPONSE =
  "It sounds like you may be experiencing a crisis. Please contact the 988 Suicide & Crisis Lifeline (call or text 988) or go to your nearest emergency room. If you are in immediate danger, call 911.";
