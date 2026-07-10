export type OAuthProvider = "GOOGLE" | "KAKAO" | "APPLE"

export type OAuthLoginCode = "LOGIN_SUCCESS" | "REGISTER_REQUIRED"

export interface OAuthLoginResponse {
  provider: OAuthProvider
  success: boolean
  code: OAuthLoginCode
  oAuthVerificationToken?: string
  accessToken?: string
  refreshToken?: string
}

export interface GoogleLoginRequest {
  accessToken: string
}

export interface KakaoLoginRequest {
  authorizationCode: string
  redirectUri: string
}

export interface KakaoCodeLoginRequest {
  authorizationCode: string
  redirectUri: string
}

export type ClientType = "ANDROID" | "IOS" | "WEB"

export interface AppleLoginRequest {
  authorizationCode: string
  clientType: ClientType
}

export type EmailVerificationPurpose =
  | "REGISTER"
  | "PASSWORD_RESET"
  | "CHANGE_EMAIL"

export interface SendEmailVerificationRequest {
  email: string
  purpose: EmailVerificationPurpose
}

export interface SendEmailVerificationResponse {
  emailVerificationId: string
}

export interface ResendEmailVerificationRequest {
  emailVerificationId: number
}

export interface CompleteEmailVerificationRequest {
  emailVerificationId: number
  verificationCode: string
}

export interface CompleteEmailVerificationResponse {
  emailVerificationToken: string
}

export interface GetEmailAvailabilityRequest {
  email: string
}

export interface GetEmailAvailabilityResponse {
  email: string
  available: boolean
}

export interface TermConsentStatus {
  termsId: number
  isAgreed: boolean
}

export interface RegisterMemberRequest {
  oAuthVerificationToken: string
  name: string
  nickname: string
  emailVerificationToken: string
  schoolId: number
  termsAgreements: TermConsentStatus[]
  appleRefreshToken?: string
  appleClientId?: string
}

export interface RegisterResponse {
  memberId: number
  accessToken: string
  refreshToken: string
}

export type { TermType } from "@/shared/model/domain"

export interface TermResponse {
  id: number
  link: string
  isMandatory: boolean
}

import type { Term } from "@/shared/model/domain"

export type { Term }

export interface Terms {
  terms: Term[]
}

export interface SchoolNameItem {
  schoolId: string
  schoolName: string
}

export interface EmailLoginRequest {
  email: string
  password: string
  clientType: ClientType
}

export interface EmailLoginResponse {
  memberId: number
  accessToken: string
  refreshToken: string
}

export interface RegisterCredentialsRequest {
  loginId: string
  password: string
}

export interface LoginIdAvailabilityResponse {
  loginId: string
  available: boolean
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface EmailRegisterMemberRequest {
  rawPassword: string
  name: string
  nickname: string
  emailVerificationToken: string
  schoolId: number
  termsAgreements: TermConsentStatus[]
}

export interface MemberOAuthItem {
  memberId: number
  memberOAuthId: number
  provider: OAuthProvider
}
