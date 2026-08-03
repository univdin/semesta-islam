/**
 * SEMESTA ISLAM — Canonical Domain Types
 * Governed by docs/03_ERD.md & docs/07_API_ENDPOINTS.md
 */

export type UserRole =
  | 'LEARNER'
  | 'GUARDIAN'
  | 'EDUCATOR'
  | 'INSTITUTION_ADMIN'
  | 'LAJNAH_VERIFIER'
  | 'FOUNDER_ADMIN';

export type VerificationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW_LAJNAH'
  | 'VERIFIED'
  | 'REJECTED'
  | 'REVOKED';

export type LearningMethod =
  | 'ONLINE_ZOOM'
  | 'PRIVATE_HOME'
  | 'GROUP_MAJELIS';

export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export type LedgerEntryType =
  | 'LEARNER_POINT'
  | 'VOUCHER_CREDIT'
  | 'FEE_COLLECTION'
  | 'COMMISSION_ACCRUAL'
  | 'REWARD_TOKEN';

export interface EducatorSummary {
  id: string;
  name: string;
  title: string;
  location: string;
  rating: number;
  reviewsCount: number;
  expertise: string[];
  avatar: string;
  verified: boolean;
  verifiedStatus: VerificationStatus;
  institution: string;
  method: string;
}

export interface BookingInquiryPayload {
  educatorId: string;
  courseId?: string;
  scheduleId?: string;
  learningMethod: LearningMethod;
  preferredSchedule: string;
  learnerName: string;
  contactPhone: string;
  notes?: string;
}

export interface VerificationSubmissionPayload {
  educatorId: string;
  ktpNumber: string;
  ktpDocumentUrl: string;
  ijazahDocumentUrl: string;
  ijazahSha256Hash: string;
  recommenderEmail: string;
  recommenderInstitution: string;
  qiraahSanadName?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  error?: string;
  details?: Array<{ field: string; issue: string }>;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}
