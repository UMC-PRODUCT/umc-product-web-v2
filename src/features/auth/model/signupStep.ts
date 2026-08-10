export type EmailSignupStep = "EMAIL" | "PASSWORD" | "PROFILE" | "TERMS"

export interface EmailSignupStepInput {
  emailVerificationToken?: string | null
  rawPassword?: string | null
  isTermsOpen?: boolean
}

export function resolveEmailSignupStep({
  emailVerificationToken,
  rawPassword,
  isTermsOpen = false,
}: EmailSignupStepInput): EmailSignupStep {
  if (!emailVerificationToken) return "EMAIL"
  if (!rawPassword) return "PASSWORD"
  return isTermsOpen ? "TERMS" : "PROFILE"
}
