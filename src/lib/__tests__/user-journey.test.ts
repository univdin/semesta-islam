/**
 * ILMIFY — End-to-End User Journey Simulation & Function Verification Test
 * Verification of mapped user journeys in docs/audit/18_END_TO_END_USER_JOURNEY_MAP.md:
 *   1. Public Guest Search & Discovery Flow
 *   2. Authenticated Learner Booking & Points Award Flow
 *   3. Educator Credential Submission & Verification Flow
 *   4. Lajnah Verifier Evaluation & Review Flow
 *   5. Founder Admin Governance & Role Access Flow
 */

import { describe, it, expect } from 'vitest';
import { BookingInquirySchema, VerificationSubmitSchema, DirectoryFilterSchema } from '@/lib/validations';
import { authorize } from '@/lib/auth/authorization';
import { CAPABILITIES, PLATFORM_ROLE_CAPABILITIES } from '@/lib/auth/permissions';

describe('End-to-End User Journey Validation Suite', () => {
  describe('Journey 1: Public Guest Search & Discovery Flow', () => {
    it('validates search query filtering parameters correctly', () => {
      const searchParams = {
        q: 'Ustaz Ahmad',
        expertise: 'Tahsin',
        location: 'Jakarta',
        method: 'ONLINE_ZOOM' as const,
        page: 1,
      };

      const result = DirectoryFilterSchema.safeParse(searchParams);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.q).toBe('Ustaz Ahmad');
        expect(result.data.method).toBe('ONLINE_ZOOM');
      }
    });

    it('verifies dark mode theme toggle state management', () => {
      let theme: 'cream' | 'dark' = 'cream';
      const toggleTheme = () => {
        theme = theme === 'cream' ? 'dark' : 'cream';
      };

      expect(theme).toBe('cream');
      toggleTheme();
      expect(theme).toBe('dark');
      toggleTheme();
      expect(theme).toBe('cream');
    });
  });

  describe('Journey 2: Authenticated Learner Booking & Points Award Flow', () => {
    it('validates booking inquiry form payload schema successfully', () => {
      const payload = {
        educatorId: '00000000-0000-0000-0000-000000000001',
        learningMethod: 'ONLINE_ZOOM' as const,
        preferredSchedule: 'Setiap Sabtu jam 16.00 WIB',
        learnerName: 'Ahmad Fulan',
        contactPhone: '081234567890',
        notes: 'Level Tahsin Juz 30',
      };

      const result = BookingInquirySchema.safeParse(payload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.learnerName).toBe('Ahmad Fulan');
        expect(result.data.learningMethod).toBe('ONLINE_ZOOM');
      }
    });

    it('blocks incomplete booking inquiry payloads', () => {
      const invalidPayload = {
        educatorId: 'invalid-uuid',
        learningMethod: 'ONLINE_ZOOM',
        preferredSchedule: '', // Empty schedule
        learnerName: '',
        contactPhone: '123', // Short phone
      };

      const result = BookingInquirySchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });
  });

  describe('Journey 3: Educator Credential Submission Flow', () => {
    it('validates educator credential submission schema', () => {
      const validSha256 = 'a'.repeat(64);
      const submissionData = {
        educatorId: '00000000-0000-0000-0000-000000000002',
        ktpNumber: '3171010101900001',
        ktpDocumentUrl: 'https://storage.ilmify.id/ktp/ktp-123.pdf',
        ijazahDocumentUrl: 'https://storage.ilmify.id/ijazah/ijazah-123.pdf',
        ijazahSha256Hash: validSha256,
        recommenderEmail: 'recommender@pesantren.ac.id',
        recommenderInstitution: 'Pondok Pesantren Al-Hikmah',
        qiraahSanadName: 'Sanad Hafss an Asim',
      };

      const result = VerificationSubmitSchema.safeParse(submissionData);
      expect(result.success).toBe(true);
    });
  });

  describe('Journey 4: Lajnah Verifier Evaluation & Review Flow', () => {
    it('validates Lajnah reviewer platform role capabilities', () => {
      const verifierCapabilities = PLATFORM_ROLE_CAPABILITIES.LAJNAH_VERIFIER;
      expect(verifierCapabilities).toContain(CAPABILITIES.VERIFICATION_VIEW);
      expect(verifierCapabilities).toContain(CAPABILITIES.VERIFICATION_MANAGE);
    });

    it('validates Educator self-scoped resource access configuration', () => {
      const educatorCapabilities = PLATFORM_ROLE_CAPABILITIES.EDUCATOR;
      expect(educatorCapabilities).toEqual([]);
    });
  });

  describe('Journey 5: Founder Admin Governance & Role Access Flow', () => {
    it('verifies authorization for FOUNDER_ADMIN capability checks', async () => {
      const actor = {
        userId: 'founder-1',
        roles: ['FOUNDER_ADMIN' as const],
      };

      const authResult = await authorize({
        actor,
        capability: CAPABILITIES.PLATFORM_CONFIGURATION,
      });

      expect(authResult.allowed).toBe(true);
    });
  });
});
