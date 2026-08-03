/**
 * SEMESTA ISLAM — API Validation Schemas (Zod)
 * Governed by docs/07_API_ENDPOINTS.md
 */

import { z } from 'zod';

export const PhoneRegex = /^(\+62|08)[0-9]{8,12}$/;
export const Sha256Regex = /^[a-fA-F0-9]{64}$/;

export const VerificationSubmitSchema = z.object({
  educatorId: z.string().uuid({ message: "Invalid Educator UUID" }),
  ktpNumber: z.string().min(16, "KTP number must be 16 digits").max(16, "KTP number must be 16 digits"),
  ktpDocumentUrl: z.string().url("Invalid KTP Document URL"),
  ijazahDocumentUrl: z.string().url("Invalid Ijazah Document URL"),
  ijazahSha256Hash: z.string().regex(Sha256Regex, "Invalid SHA-256 Hash format"),
  recommenderEmail: z.string().email("Invalid recommender email address"),
  recommenderInstitution: z.string().min(3, "Institution name too short"),
  qiraahSanadName: z.string().optional()
});

export const BookingInquirySchema = z.object({
  educatorId: z.string().uuid({ message: "Invalid Educator UUID" }),
  courseId: z.string().uuid().optional(),
  scheduleId: z.string().uuid().optional(),
  learningMethod: z.enum(['ONLINE_ZOOM', 'PRIVATE_HOME', 'GROUP_MAJELIS']),
  preferredSchedule: z.string().min(3, "Schedule description required"),
  learnerName: z.string().min(2, "Learner name required"),
  contactPhone: z.string().regex(PhoneRegex, "Invalid Indonesian phone number format (+62... or 08...)"),
  notes: z.string().max(500, "Notes max 500 characters").optional()
});

export const ReferralGenerateSchema = z.object({
  userId: z.string().uuid(),
  customCode: z.string().min(4).max(20).regex(/^[A-Z0-9-]+$/, "Uppercase letters, numbers, and dashes only").optional()
});

export const DirectoryFilterSchema = z.object({
  q: z.string().max(100, 'Query max 100 characters').optional(),
  expertise: z.string().max(50, 'Expertise max 50 characters').optional(),
  location: z.string().max(50, 'Location max 50 characters').optional(),
  method: z.enum(['all', 'ONLINE_ZOOM', 'PRIVATE_HOME', 'GROUP_MAJELIS']).optional().default('all'),
  sort: z.enum(['rating', 'reviews']).optional().default('rating'),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(50).optional().default(9)
});

// Knowledge Domain (Slice A)

export const ClaimPredicateSchema = z.enum([
  'GRADUATED_FROM',
  'HOLDS_CREDENTIAL',
  'HAS_SANAD_IN',
  'SPECIALIZES_IN',
  'AFFILIATED_WITH',
  'AUTHORED',
]);

export const ClaimStatusSchema = z.enum(['DRAFT', 'UNVERIFIED', 'VERIFIED', 'REJECTED']);

export const KnowledgeClaimCreateSchema = z.object({
  educatorId: z.string().uuid({ message: 'Invalid Educator UUID' }),
  predicate: ClaimPredicateSchema,
  objectText: z.string().min(3, 'Object text is required (min 3 characters)').max(300, 'Object text max 300 characters'),
  objectType: z.string().min(2).max(50).optional(),
  status: ClaimStatusSchema.optional(),
  sourceId: z.string().uuid().optional(),
  evidenceId: z.string().uuid().optional(),
  confidence: z.number().min(0).max(1).optional(),
});

export const KnowledgeClaimStatusSchema = z.object({
  status: ClaimStatusSchema,
});

export const KnowledgeSourceCreateSchema = z.object({
  title: z.string().min(3).max(200),
  url: z.string().url().optional().or(z.literal('')),
  publisher: z.string().max(200).optional().or(z.literal('')),
  publishedAt: z.string().datetime().optional().or(z.literal('')),
});

// Digital Identity Domain (Phase H)

export const DigitalPlatformSchema = z.enum([
  'WEBSITE',
  'YOUTUBE',
  'INSTAGRAM',
  'TIKTOK',
  'X',
  'FACEBOOK',
  'OTHER',
]);

export const DigitalProfileStatusSchema = z.enum([
  'SELF_DECLARED',
  'SUBMITTED',
  'UNDER_REVIEW',
  'VERIFIED',
  'REJECTED',
]);

export const DigitalProfileCreateSchema = z.object({
  educatorId: z.string().uuid({ message: 'Invalid Educator UUID' }),
  platform: DigitalPlatformSchema,
  url: z.string().url('Invalid profile URL').max(500),
  handle: z.string().min(2).max(120).optional(),
});

export const DigitalProfileStatusUpdateSchema = z.object({
  profileId: z.string().uuid({ message: 'Invalid profile UUID' }),
  status: DigitalProfileStatusSchema,
  note: z.string().max(500).optional(),
});
