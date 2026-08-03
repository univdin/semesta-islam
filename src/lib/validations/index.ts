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
  category: z.string().optional(),
  method: z.enum(['all', 'ONLINE_ZOOM', 'PRIVATE_HOME', 'GROUP_MAJELIS']).optional(),
  query: z.string().optional(),
  sort: z.enum(['rating', 'reviews']).optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(50).optional().default(10)
});
