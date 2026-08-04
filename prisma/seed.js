/**
 * SEMESTA ISLAM — Deterministic Development Seed
 * Canonical demo data moved from src/lib/dev/fixtures.ts (removed).
 * Governed by docs/03_ERD.md. Run via: npx prisma db seed
 *
 * All IDs are fixed UUIDs so the dataset is deterministic across machines.
 */

const { PrismaClient } = require('@prisma/client');

// Safety guard (directive §10): this seed DELETES rows and is DEV/DEMO ONLY.
// It must never run against production. Production bootstrap lives in
// prisma/seed.production.js (idempotent upserts, no deleteMany).
if (process.env.APP_ENV === 'production' || process.env.NODE_ENV === 'production') {
  console.error(
    '[seed:demo] Refusing to run destructive demo seed in a production environment. ' +
      'Use `npm run seed:production` for the idempotent bootstrap instead.'
  );
  process.exit(1);
}

const prisma = new PrismaClient();

// ---- Fixed deterministic UUIDs ----
const ID = {
  // Users
  U_LEARNER: '10000000-0000-0000-0000-000000000001',
  U_EDU1: '10000000-0000-0000-0000-000000000101',
  U_EDU2: '10000000-0000-0000-0000-000000000201',
  U_EDU3: '10000000-0000-0000-0000-000000000301',
  U_EDU4: '10000000-0000-0000-0000-000000000401',
  U_LAJNAH: '10000000-0000-0000-0000-000000000501',
  U_FOUNDER: '10000000-0000-0000-0000-000000000601',
  // UserProfiles
  P_LEARNER: '20000000-0000-0000-0000-000000000001',
  P_EDU1: '20000000-0000-0000-0000-000000000101',
  P_EDU2: '20000000-0000-0000-0000-000000000201',
  P_EDU3: '20000000-0000-0000-0000-000000000301',
  P_EDU4: '20000000-0000-0000-0000-000000000401',
  P_LAJNAH: '20000000-0000-0000-0000-000000000501',
  P_FOUNDER: '20000000-0000-0000-0000-000000000601',
  // EducatorProfiles
  E_EDU1: '30000000-0000-0000-0000-000000000101',
  E_EDU2: '30000000-0000-0000-0000-000000000201',
  E_EDU3: '30000000-0000-0000-0000-000000000301',
  E_EDU4: '30000000-0000-0000-0000-000000000401',
  // LearnerProfiles
  L_LEARNER: '40000000-0000-0000-0000-000000000001',
  // CourseCatalogs
  C_EDU1_1: '50000000-0000-0000-0000-000000000101',
  C_EDU1_2: '50000000-0000-0000-0000-000000000102',
  C_EDU1_3: '50000000-0000-0000-0000-000000000103',
  C_EDU2_1: '50000000-0000-0000-0000-000000000201',
  C_EDU2_2: '50000000-0000-0000-0000-000000000202',
  C_EDU3_1: '50000000-0000-0000-0000-000000000301',
  C_EDU3_2: '50000000-0000-0000-0000-000000000302',
  C_EDU4_1: '50000000-0000-0000-0000-000000000401',
  C_EDU4_2: '50000000-0000-0000-0000-000000000402',
  // CourseSchedules
  S_EDU1_C1: '60000000-0000-0000-0000-000000000101',
  S_EDU1_C2: '60000000-0000-0000-0000-000000000102',
  S_EDU2_C1: '60000000-0000-0000-0000-000000000201',
  // SanadRecords
  SN_EDU1_1: '70000000-0000-0000-0000-000000000101',
  SN_EDU1_2: '70000000-0000-0000-0000-000000000102',
  SN_EDU1_3: '70000000-0000-0000-0000-000000000103',
  SN_EDU2_1: '70000000-0000-0000-0000-000000000201',
  SN_EDU4_1: '70000000-0000-0000-0000-000000000401',
  // CredentialBadges
  B_EDU4_1: '80000000-0000-0000-0000-000000000401',
  B_EDU4_2: '80000000-0000-0000-0000-000000000402',
  // VerificationRequests
  VR_EDU1: '90000000-0000-0000-0000-000000000101',
  VR_EDU2: '90000000-0000-0000-0000-000000000201',
  VR_EDU3: '90000000-0000-0000-0000-000000000301',
  VR_EDU4: '90000000-0000-0000-0000-000000000401',
  // BookingRequests
  BK_LEARNER_EDU1: 'a0000000-0000-0000-0000-000000000001',
  BK_LEARNER_EDU2: 'a0000000-0000-0000-0000-000000000002',
  // Sources / Evidence / KnowledgeClaims (Slice A)
  SRC_EDU4_1: 'f1000000-0000-0000-0000-000000000001',
  EV_EDU4_1: 'f2000000-0000-0000-0000-000000000001',
  CL_EDU4_1: 'f3000000-0000-0000-0000-000000000401',
  CL_EDU4_2: 'f3000000-0000-0000-0000-000000000402',
  CL_EDU4_3: 'f3000000-0000-0000-0000-000000000403',
  CL_EDU4_4: 'f3000000-0000-0000-0000-000000000404',
  CL_EDU1_1: 'f3000000-0000-0000-0000-000000000101',
  CL_EDU2_1: 'f3000000-0000-0000-0000-000000000201',
  // Topics (EXP-03 taxonomy) — derived from course categories + verified claims
  T_TAHSIN: 'e3000000-0000-0000-0000-000000000001',
  T_FIQH: 'e3000000-0000-0000-0000-000000000002',
  T_HADITS: 'e3000000-0000-0000-0000-000000000003',
  T_AQIDAH: 'e3000000-0000-0000-0000-000000000004',
  T_BAHASA_ARAB: 'e3000000-0000-0000-0000-000000000005',
  T_KITAB_KUNING: 'e3000000-0000-0000-0000-000000000006',
  T_SIROH: 'e3000000-0000-0000-0000-000000000007',
  // Topic aliases
  TA_TAHSIN_TAJWID: 'e4000000-0000-0000-0000-000000000001',
  TA_FIQH_MUAMALAH: 'e4000000-0000-0000-0000-000000000002',
  // DigitalProfiles (Phase H)
  DP_EDU4_YT: 'e5000000-0000-0000-0000-000000000001',
  DP_EDU4_WEB: 'e5000000-0000-0000-0000-000000000002',
  // Organizations (WAVE 0)
  ORG_1: 'b0000000-0000-0000-0000-000000000001',
  ORG_2: 'b0000000-0000-0000-0000-000000000002',
  // Organization membership ids
  OM_FOUNDER_ORG1: 'c0000000-0000-0000-0000-000000000001',
  OM_STAFF_ORG1: 'c0000000-0000-0000-0000-000000000002',
  OM_FOUNDER_ORG2: 'c0000000-0000-0000-0000-000000000003',
  // Demo org users
  U_ORGADMIN: '10000000-0000-0000-0000-000000000701',
  U_ORGSTAFF: '10000000-0000-0000-0000-000000000801',
  P_ORGADMIN: '20000000-0000-0000-0000-000000000701',
  P_ORGSTAFF: '20000000-0000-0000-0000-000000000801',
  // Community Knowledge Domain (Slice E2) — deterministic demo fixtures.
  // Community signal only: never VERIFIED knowledge. See docs/03_ERD.md §54.
  Q_TAHSIN: 'd3000000-0000-0000-0000-000000000001',
  Q_FIQH: 'd3000000-0000-0000-0000-000000000002',
  A_TAHSIN_1: 'd4000000-0000-0000-0000-000000000001',
  A_TAHSIN_2: 'd4000000-0000-0000-0000-000000000002',
  A_FIQH_1: 'd4000000-0000-0000-0000-000000000003',
  CMT_EDU4_1: 'd0000000-0000-0000-0000-000000000001',
  CMT_EDU4_1_REPLY: 'd0000000-0000-0000-0000-000000000002',
  CMT_TOPIC_1: 'd0000000-0000-0000-0000-000000000003',
  CMT_HIDDEN: 'd0000000-0000-0000-0000-000000000004',
  V_AGREE: 'd1000000-0000-0000-0000-000000000001',
  V_HELPFUL: 'd1000000-0000-0000-0000-000000000002',
  REP_1: 'd2000000-0000-0000-0000-000000000001',
  XP_ANS1: 'd5000000-0000-0000-0000-000000000001',
};

const SHA_HASH = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

const AVATARS = {
  learner: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
  edu1: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  edu2: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80',
  edu3: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
  edu4: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
  lajnah: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=250&q=80',
  founder: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=250&q=80',
};

async function main() {
  // ---- Wipe in reverse dependency order for a deterministic reseed ----
  await prisma.commissionLedger.deleteMany();
  await prisma.attributionRecord.deleteMany();
  await prisma.campaignRecord.deleteMany();
  await prisma.reputationProfile.deleteMany();
  await prisma.xpLedger.deleteMany();
  await prisma.integrationJob.deleteMany();
  await prisma.backupRecord.deleteMany();
  await prisma.integrationHealth.deleteMany();
  await prisma.changelogEntry.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.delegation.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.organizationMembership.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.reviewRating.deleteMany();
  await prisma.digitalProfile.deleteMany();
  await prisma.platformSetting.deleteMany();
  await prisma.topicAlias.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.communityReport.deleteMany();
  await prisma.communityVote.deleteMany();
  await prisma.communityAnswer.deleteMany();
  await prisma.communityQuestion.deleteMany();
  await prisma.communityComment.deleteMany();
  await prisma.knowledgeClaim.deleteMany();
  await prisma.evidence.deleteMany();
  await prisma.source.deleteMany();
  await prisma.referralConversion.deleteMany();
  await prisma.referralCode.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.economicTransaction.deleteMany();
  await prisma.economicLedger.deleteMany();
  await prisma.bookingRequest.deleteMany();
  await prisma.learningProgressReport.deleteMany();
  await prisma.courseSchedule.deleteMany();
  await prisma.courseCatalog.deleteMany();
  await prisma.credentialBadge.deleteMany();
  await prisma.verificationRequest.deleteMany();
  await prisma.sanadRecord.deleteMany();
  await prisma.learnerProfile.deleteMany();
  await prisma.educatorProfile.deleteMany();
  await prisma.roleAssignment.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();

  // ---- Users ----
  await prisma.user.createMany({
    data: [
      { id: ID.U_LEARNER, email: 'learner.demo@localhost.test', phone: '081200000001' },
      { id: ID.U_EDU1, email: 'educator.demo@localhost.test', phone: '081200000101' },
      { id: ID.U_EDU2, email: 'fatimah.demo@localhost.test', phone: '081200000201' },
      { id: ID.U_EDU3, email: 'syarif.demo@localhost.test', phone: '081200000301' },
      { id: ID.U_EDU4, email: 'hasibuan.demo@localhost.test', phone: '081200000401' },
      { id: ID.U_LAJNAH, email: 'lajnah.demo@localhost.test', phone: '081200000501' },
      { id: ID.U_FOUNDER, email: 'founder.demo@localhost.test', phone: '081200000601' },
      { id: ID.U_ORGADMIN, email: 'orgadmin.demo@localhost.test', phone: '081200000701' },
      { id: ID.U_ORGSTAFF, email: 'orgstaff.demo@localhost.test', phone: '081200000801' },
    ],
  });

  // ---- UserProfiles ----
  await prisma.userProfile.createMany({
    data: [
      { id: ID.P_LEARNER, userId: ID.U_LEARNER, fullName: 'Abdullah Ahmad', avatarUrl: AVATARS.learner, locationCity: 'Jakarta Selatan', bio: 'Pembelajar aktif tahsin Al-Quran.' },
      { id: ID.P_EDU1, userId: ID.U_EDU1, fullName: "Ustadz DR. Ahmad Al-Hafiz, M.A.", avatarUrl: AVATARS.edu1, locationCity: 'Jakarta Selatan', bio: "Menyelesaikan pendidikan Doktor Fiqh Muamalah di Universitas Al-Azhar Kairo. Memegang Sanad Al-Qur'an 30 Juz Qira'ah Imam Asim riwayat Hafsh dari Syaikh Mahmud Al-Husary." },
      { id: ID.P_EDU2, userId: ID.U_EDU2, fullName: "Ustadzah Fatimah Azzahra, S.Ag.", avatarUrl: AVATARS.edu2, locationCity: 'Bandung', bio: "Pembimbing Al-Qur'an anak & keluarga, lulusan S1 Pendidikan Agama Islam." },
      { id: ID.P_EDU3, userId: ID.U_EDU3, fullName: 'Ustadz Muhammad Syarif, Lc.', avatarUrl: AVATARS.edu3, locationCity: 'Surabaya', bio: 'Pengajar Bahasa Arab & Nahwu Sharaf, lulusan LIPIA Jakarta dan Universitas Islam Madinah.' },
      { id: ID.P_EDU4, userId: ID.U_EDU4, fullName: 'Ustadz Abdullah Hasibuan, M.Pd.', avatarUrl: AVATARS.edu4, locationCity: 'Medan', bio: 'Pengajar Tajwid & Hafalan Juz Amma, lulusan UIN Sumatera Utara.' },
      { id: ID.P_LAJNAH, userId: ID.U_LAJNAH, fullName: 'KH. Ahmad Fauzi (Anggota Lajnah Demo)', avatarUrl: AVATARS.lajnah, locationCity: 'Jakarta' },
      { id: ID.P_FOUNDER, userId: ID.U_FOUNDER, fullName: 'Founder Admin SEMESTA ISLAM', avatarUrl: AVATARS.founder, locationCity: 'Jakarta' },
      { id: ID.P_ORGADMIN, userId: ID.U_ORGADMIN, fullName: 'Hasan Org Admin', avatarUrl: AVATARS.edu3, locationCity: 'Jakarta' },
      { id: ID.P_ORGSTAFF, userId: ID.U_ORGSTAFF, fullName: 'Aisyah Org Staff', avatarUrl: AVATARS.edu2, locationCity: 'Depok' },
    ],
  });

  // ---- RoleAssignments ----
  await prisma.roleAssignment.createMany({
    data: [
      { userId: ID.U_LEARNER, role: 'LEARNER' },
      { userId: ID.U_EDU1, role: 'EDUCATOR' },
      { userId: ID.U_EDU2, role: 'EDUCATOR' },
      { userId: ID.U_EDU3, role: 'EDUCATOR' },
      { userId: ID.U_EDU4, role: 'EDUCATOR' },
      { userId: ID.U_LAJNAH, role: 'LAJNAH_VERIFIER' },
      { userId: ID.U_FOUNDER, role: 'FOUNDER_ADMIN' },
      { userId: ID.U_ORGADMIN, role: 'INSTITUTION_ADMIN' },
      { userId: ID.U_ORGSTAFF, role: 'INSTITUTION_ADMIN' },
    ],
  });

  // ---- LearnerProfile ----
  await prisma.learnerProfile.create({
    data: { id: ID.L_LEARNER, userId: ID.U_LEARNER, guardianName: 'H. Ahmad Ridwan', notes: 'Target: khatam tahsin jilid 3.' },
  });

  // ---- EducatorProfiles ----
  await prisma.educatorProfile.createMany({
    data: [
      { id: ID.E_EDU1, userId: ID.U_EDU1, titlePrefix: 'Ustadz', titleSuffix: 'Pakar Fiqh Muamalah & Tahsin Sanad', institutionName: 'Al-Azhar Cairo Alumni / IIQ Jakarta', teachingMethod: 'ONLINE_ZOOM', ratingAverage: 4.9, reviewsCount: 128, verifiedStatus: 'SUBMITTED', slug: 'ahmad-al-hafiz' },
      { id: ID.E_EDU2, userId: ID.U_EDU2, titlePrefix: 'Ustadzah', titleSuffix: "Pembimbing Al-Qur'an Anak & Keluarga", institutionName: "Pesantren Tahfidz Al-Qur'an Bandung", teachingMethod: 'PRIVATE_HOME', ratingAverage: 5.0, reviewsCount: 94, verifiedStatus: 'UNDER_REVIEW_LAJNAH', slug: 'fatimah-azzahra' },
      { id: ID.E_EDU3, userId: ID.U_EDU3, titlePrefix: 'Ustadz', titleSuffix: 'Pengajar Bahasa Arab & Nahwu Sharaf', institutionName: 'LIPIA Jakarta / Universitas Islam Madinah', teachingMethod: 'ONLINE_ZOOM', ratingAverage: 4.8, reviewsCount: 76, verifiedStatus: 'REJECTED', slug: 'muhammad-syarif' },
      { id: ID.E_EDU4, userId: ID.U_EDU4, titlePrefix: 'Ustadz', titleSuffix: 'Pengajar Tajwid & Hafalan Juz Amma', institutionName: 'UIN Sumatera Utara', teachingMethod: 'GROUP_MAJELIS', ratingAverage: 4.9, reviewsCount: 52, verifiedStatus: 'VERIFIED', slug: 'abdullah-hasibuan' },
    ],
  });

  // ---- SanadRecords ----
  await prisma.sanadRecord.createMany({
    data: [
      { id: ID.SN_EDU1_1, educatorId: ID.E_EDU1, qiraahType: "HAFSH_AN_ASHIM", chainDescription: "Sanad Qira'ah Hafsh 'an 'Ashim thariq Asy-Syathibiyyah", certificateUrl: 'https://storage.supabase.co/sanad/hafsh.pdf', verifiedByLajnah: true },
      { id: ID.SN_EDU1_2, educatorId: ID.E_EDU1, qiraahType: 'QIRAAT_SANAD', chainDescription: 'Ijazah Sanad Matan Al-Jazariyyah & Tuhfatul Athfal', certificateUrl: 'https://storage.supabase.co/sanad/jazariyyah.pdf', verifiedByLajnah: true },
      { id: ID.SN_EDU1_3, educatorId: ID.E_EDU1, qiraahType: 'HADITS_SANAD', chainDescription: 'Ijazah Kitab Shahih Bukhari & Muslim', certificateUrl: 'https://storage.supabase.co/sanad/bukhari-muslim.pdf', verifiedByLajnah: true },
      { id: ID.SN_EDU2_1, educatorId: ID.E_EDU2, qiraahType: 'TAHSIN', chainDescription: 'Ijazah Tahsin & metode pengajaran Al-Quran anak', certificateUrl: 'https://storage.supabase.co/sanad/tahsin-anak.pdf', verifiedByLajnah: true },
      { id: ID.SN_EDU4_1, educatorId: ID.E_EDU4, qiraahType: 'TAJWID', chainDescription: 'Ijazah Tajwid & Tahfidz Juz Amma', certificateUrl: 'https://storage.supabase.co/sanad/tajwid-juzamma.pdf', verifiedByLajnah: true },
    ],
  });

  // ---- CredentialBadges ----
  await prisma.credentialBadge.createMany({
    data: [
      { id: ID.B_EDU4_1, educatorId: ID.E_EDU4, badgeType: 'LAJNAH_VERIFIED' },
      { id: ID.B_EDU4_2, educatorId: ID.E_EDU4, badgeType: 'SANAD_VERIFIED' },
    ],
  });

  // ---- CourseCatalogs ----
  await prisma.courseCatalog.createMany({
    data: [
      { id: ID.C_EDU1_1, educatorId: ID.E_EDU1, title: "Bimbingan Tahsin & Setoran Hafalan Qira'ah", category: "Tahsin & Qira'ah", description: 'Tahsin tartil dan setoran hafalan secara terstruktur.', duration: '8 sesi' },
      { id: ID.C_EDU1_2, educatorId: ID.E_EDU1, title: 'Kajian Fiqh Muamalah & Kontemporer', category: 'Fiqh Muamalah', description: 'Kajian fiqh muamalah untuk kehidupan kontemporer.', duration: '12 sesi' },
      { id: ID.C_EDU1_3, educatorId: ID.E_EDU1, title: 'Kelas Intensif Bahasa Arab & Nahwu', category: 'Hadits', description: 'Pengantar nahwu sharaf dan pembacaan hadits.', duration: '10 sesi' },
      { id: ID.C_EDU2_1, educatorId: ID.E_EDU2, title: "Bimbingan Al-Qur'an Anak", category: "Tahsin & Qira'ah", description: 'Belajar membaca Al-Quran yang menyenangkan untuk anak.', duration: '12 sesi' },
      { id: ID.C_EDU2_2, educatorId: ID.E_EDU2, title: 'Kajian Aqidah & Akhlaq Keluarga', category: 'Aqidah & Akhlaq', description: 'Penguatan aqidah dan akhlaq dalam keluarga.', duration: '8 sesi' },
      { id: ID.C_EDU3_1, educatorId: ID.E_EDU3, title: 'Kelas Bahasa Arab Dasar', category: 'Bahasa Arab', description: 'Membaca kitab gundul dari nol.', duration: '16 sesi' },
      { id: ID.C_EDU3_2, educatorId: ID.E_EDU3, title: 'Kajian Kitab Kuning', category: 'Kajian Kitab Kuning', description: 'Baca kitab kuning bersama.', duration: '12 sesi' },
      { id: ID.C_EDU4_1, educatorId: ID.E_EDU4, title: 'Kelas Tajwid & Tahsin Dewasa', category: "Tahsin & Qira'ah", description: 'Perbaikan tajwid untuk dewasa.', duration: '10 sesi' },
      { id: ID.C_EDU4_2, educatorId: ID.E_EDU4, title: 'Hafalan Juz Amma', category: 'Siroh Nabawiyah', description: 'Menghafal Juz Amma dengan metode talaqqi.', duration: '20 sesi' },
    ],
  });

  // ---- CourseSchedules ----
  await prisma.courseSchedule.createMany({
    data: [
      { id: ID.S_EDU1_C1, courseId: ID.C_EDU1_1, dayOfWeek: 'SATURDAY', startTime: '16:00', endTime: '17:30' },
      { id: ID.S_EDU1_C2, courseId: ID.C_EDU1_2, dayOfWeek: 'SUNDAY', startTime: '09:00', endTime: '10:30' },
      { id: ID.S_EDU2_C1, courseId: ID.C_EDU2_1, dayOfWeek: 'WEDNESDAY', startTime: '15:00', endTime: '16:00' },
    ],
  });

  // ---- VerificationRequests ----
  await prisma.verificationRequest.createMany({
    data: [
      {
        id: ID.VR_EDU1, educatorId: ID.E_EDU1, status: 'SUBMITTED',
        layer1KtpUrl: 'https://storage.supabase.co/ktp/edu1.pdf', layer2IjazahUrl: 'https://storage.supabase.co/ijazah/edu1.pdf',
        layer2Sha256Hash: SHA_HASH, layer3RecommenderEmail: 'dekan@iiq.ac.id', layer3TokenConfirmed: true, layer4EthicsScore: 100,
      },
      {
        id: ID.VR_EDU2, educatorId: ID.E_EDU2, status: 'UNDER_REVIEW_LAJNAH',
        layer1KtpUrl: 'https://storage.supabase.co/ktp/edu2.pdf', layer2IjazahUrl: 'https://storage.supabase.co/ijazah/edu2.pdf',
        layer2Sha256Hash: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e', layer3RecommenderEmail: 'pimpinan@tahfidzbandung.org',
        layer3TokenConfirmed: true, layer4EthicsScore: 100,
        reviewNotes: 'Sedang dilakukan validasi berkas ijazah ke pihak pesantren.',
      },
      {
        id: ID.VR_EDU3, educatorId: ID.E_EDU3, status: 'REJECTED',
        layer1KtpUrl: 'https://storage.supabase.co/ktp/edu3.pdf', layer2IjazahUrl: 'https://storage.supabase.co/ijazah/edu3.pdf',
        layer2Sha256Hash: 'b45cffe084dd3d20d928bee85e7b0f21ac0275d048970b3b44b82d334547926c', layer3RecommenderEmail: 'akademik@lipia.ac.id',
        layer3TokenConfirmed: false, layer4EthicsScore: 60,
        reviewNotes: 'Berkas Ijazah buram dan tidak dapat dibaca. Mohon kirim ulang pemindaian resolusi tinggi.',
      },
      {
        id: ID.VR_EDU4, educatorId: ID.E_EDU4, status: 'VERIFIED',
        layer1KtpUrl: 'https://storage.supabase.co/ktp/edu4.pdf', layer2IjazahUrl: 'https://storage.supabase.co/ijazah/edu4.pdf',
        layer2Sha256Hash: '1f1f0e8f7c0b9a3d5e6a4c2b8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f', layer3RecommenderEmail: 'rektor@uinsu.ac.id',
        layer3TokenConfirmed: true, layer4EthicsScore: 98,
        verifiedById: ID.U_LAJNAH, verifiedAt: new Date(),
      },
    ],
  });

  // ---- BookingRequests ----
  await prisma.bookingRequest.createMany({
    data: [
      {
        id: ID.BK_LEARNER_EDU1, learnerUserId: ID.U_LEARNER, educatorId: ID.E_EDU1, courseId: ID.C_EDU1_1, scheduleId: ID.S_EDU1_C1,
        learningMethod: 'ONLINE_ZOOM', status: 'PENDING',
        notes: 'Preferensi: Setiap Sabtu & Minggu, Jam 16.00 WIB.',
      },
      {
        id: ID.BK_LEARNER_EDU2, learnerUserId: ID.U_LEARNER, educatorId: ID.E_EDU2, courseId: ID.C_EDU2_1, scheduleId: ID.S_EDU2_C1,
        learningMethod: 'PRIVATE_HOME', status: 'CONFIRMED',
        notes: 'Preferensi: Rabu sore, di rumah pembelajar.',
      },
    ],
  });

  // ---- Internal Economy (canonical EconomicTransaction → EconomicLedger) ----
  const econTxInquiry = await prisma.economicTransaction.create({
    data: {
      type: 'EARN', status: 'COMPLETED', actorUserId: ID.U_LEARNER, accountOwnerId: ID.U_LEARNER,
      amount: 50, currency: 'POINT', idempotencyKey: 'seed:inquiry:bk-learner-edu1',
      source: 'BOOKING_INQUIRY', reference: ID.BK_LEARNER_EDU1,
      reason: 'Poin pendaftaran booking inquiry (seed)', completedAt: new Date(),
    },
  });
  const econTxReferral = await prisma.economicTransaction.create({
    data: {
      type: 'EARN', status: 'COMPLETED', actorUserId: ID.U_LEARNER, accountOwnerId: ID.U_LEARNER,
      amount: 50, currency: 'POINT', idempotencyKey: 'seed:referral:conversion',
      source: 'REFERRAL_CONVERSION', reason: 'Poin referral konversi (seed)', completedAt: new Date(),
    },
  });
  await prisma.economicLedger.createMany({
    data: [
      { accountOwnerId: ID.U_LEARNER, entryType: 'LEARNER_POINT', amount: 50, description: 'Poin pendaftaran awal booking (seed)', transactionId: econTxInquiry.id },
      { accountOwnerId: ID.U_LEARNER, entryType: 'LEARNER_POINT', amount: 50, description: 'Poin referral konversi (seed)', transactionId: econTxReferral.id },
    ],
  });

  // ---- ReferralCode ----
  await prisma.referralCode.create({
    data: { userId: ID.U_LEARNER, code: 'SEMESTA-001', clickCount: 12 },
  });

  // ---- AuditLogs ----
  await prisma.auditLog.createMany({
    data: [
      { actorUserId: ID.U_EDU1, actionType: 'VERIFICATION_SUBMITTED', entityAffected: 'verification_requests', metadata: { status: 'SUBMITTED', entityId: ID.VR_EDU1 } },
      { actorUserId: ID.U_EDU4, actionType: 'VERIFICATION_VERIFIED', entityAffected: 'verification_requests', metadata: { status: 'VERIFIED', entityId: ID.VR_EDU4 } },
    ],
  });

  // ---- Organizations (WAVE 0) ----
  await prisma.organization.createMany({
    data: [
      { id: ID.ORG_1, name: 'Pesantren Al-Falah Jakarta', slug: 'al-falah-jakarta', type: 'INSTITUTION', ownerUserId: ID.U_FOUNDER, status: 'ACTIVE' },
      { id: ID.ORG_2, name: 'Majelis Nurul Hikmah', slug: 'nurul-hikmah', type: 'COMMUNITY', ownerUserId: ID.U_FOUNDER, status: 'ACTIVE' },
    ],
  });

  await prisma.organizationMembership.createMany({
    data: [
      { id: ID.OM_FOUNDER_ORG1, userId: ID.U_FOUNDER, organizationId: ID.ORG_1, role: 'ORG_OWNER', status: 'ACTIVE' },
      { id: ID.OM_STAFF_ORG1, userId: ID.U_ORGSTAFF, organizationId: ID.ORG_1, role: 'ORG_STAFF', status: 'ACTIVE' },
      { id: ID.OM_FOUNDER_ORG2, userId: ID.U_FOUNDER, organizationId: ID.ORG_2, role: 'ORG_OWNER', status: 'ACTIVE' },
    ],
  });

  await prisma.organizationMembership.create({
    data: { userId: ID.U_ORGADMIN, organizationId: ID.ORG_1, role: 'ORG_ADMIN', status: 'ACTIVE' },
  });

  // ---- Permissions (capability registry) ----
  const PERMS = [
    'organization.view', 'organization.update', 'members.view', 'members.invite',
    'members.update', 'members.remove', 'roles.view', 'roles.manage',
    'courses.view', 'courses.manage', 'programs.view', 'programs.manage',
    'reports.view', 'reports.export', 'bookings.view', 'bookings.manage',
    'verification.view', 'verification.manage', 'content.view', 'content.manage',
    'content.publish', 'communications.view', 'communications.send',
    'audit.view', 'settings.view', 'settings.manage', 'platform.configuration',
    'security.configuration', 'role.system.manage', 'founder.manage',
    'backup.view', 'backup.create', 'backup.restore.request',
    'secret.manage', 'ownership.transfer',
  ];
  await prisma.permission.createMany({
    data: PERMS.map((name, i) => ({ id: `e0000000-0000-0000-0000-${String(i + 1).padStart(12, '0')}`, name })),
  });

  // ---- Delegation (Founder → ORGADMIN) ----
  await prisma.delegation.create({
    data: {
      grantorUserId: ID.U_FOUNDER,
      delegateUserId: ID.U_ORGADMIN,
      organizationId: ID.ORG_1,
      capabilities: ['members.view', 'members.invite', 'bookings.view', 'bookings.manage'],
      status: 'ACTIVE',
      reason: 'Demo: delegasi operasional anggota & pengajuan sesi.',
    },
  });

  // ---- Notifications ----
  await prisma.notification.createMany({
    data: [
      { userId: ID.U_LEARNER, type: 'BOOKING_CONFIRMED', title: 'Sesi Dikonfirmasi', body: 'Ustadzah Fatimah mengonfirmasi sesi belajar Anda.', metadata: { bookingId: ID.BK_LEARNER_EDU2 } },
      { userId: ID.U_ORGADMIN, type: 'DELEGATION_GRANTED', title: 'Delegasi diberikan', body: 'Founder memberi Anda akses operasional organisasi.', metadata: { organizationId: ID.ORG_1 } },
    ],
  });

  // ---- Changelog ----
  await prisma.changelogEntry.create({
    data: {
      title: 'Portal Member & Organisasi',
      slug: 'portal-member-organisasi',
      summary: 'Perubahan terbaru: portal member dan portal organisasi tersedia.',
      version: '0.2.0',
      audience: 'public',
      status: 'PUBLISHED',
      authorUserId: ID.U_FOUNDER,
      publishedAt: new Date(),
    },
  });

  // ---- Integration health (simulation) ----
  await prisma.integrationHealth.createMany({
    data: [
      { provider: 'local', status: 'CONNECTED' },
      { provider: 'google-drive', status: 'DISCONNECTED', errorMessage: 'CLOUD CONFIGURATION REQUIRED' },
      { provider: 'gmail', status: 'DISCONNECTED', errorMessage: 'CLOUD CONFIGURATION REQUIRED' },
    ],
  });

  // ---- Knowledge Claims (Slice A — provenance-marked demo) ----
  await prisma.source.createMany({
    data: [
      {
        id: ID.SRC_EDU4_1,
        title: 'Profil publik pendidik SEMESTA ISLAM (Demo)',
        url: `https://ilmify.id/educator/abdullah-hasibuan`,
        publisher: 'SEMESTA ISLAM Demo',
      },
    ],
  });

  await prisma.evidence.createMany({
    data: [
      {
        id: ID.EV_EDU4_1,
        sourceId: ID.SRC_EDU4_1,
        url: `https://ilmify.id/educator/abdullah-hasibuan`,
        description: 'Data profil yang ditampilkan pada direktori publik (demo)',
      },
    ],
  });

  await prisma.topic.createMany({
    data: [
      { id: ID.T_TAHSIN, name: "Tahsin & Qira'ah", slug: 'tahsin-qiraah', description: "Perbaikan bacaan Al-Qur'an (tahsin), ilmu tajwid, dan sanad qira'ah bagi pendidik dan pembelajar.", parentId: null, status: 'PUBLISHED', sortOrder: 1 },
      { id: ID.T_FIQH, name: 'Fiqh & Muamalah', slug: 'fiqh-muamalah', description: 'Kajian fiqh ibadah dan muamalah kontemporer, dari fikih klasik hingga isu ekonomi modern.', parentId: null, status: 'PUBLISHED', sortOrder: 2 },
      { id: ID.T_HADITS, name: 'Hadits & Sanad', slug: 'hadits-sanad', description: 'Studi hadits, ilmu musthalah, dan sanad keilmuan Islam.', parentId: null, status: 'PUBLISHED', sortOrder: 3 },
      { id: ID.T_AQIDAH, name: 'Aqidah & Akhlaq', slug: 'aqidah-akhlaq', description: 'Penguatan aqidah dan akhlaq keluarga serta masyarakat.', parentId: null, status: 'PUBLISHED', sortOrder: 4 },
      { id: ID.T_BAHASA_ARAB, name: 'Bahasa Arab', slug: 'bahasa-arab', description: 'Pembelajaran bahasa Arab dan ilmu nahwu sharaf untuk membaca kitab.', parentId: null, status: 'PUBLISHED', sortOrder: 5 },
      { id: ID.T_KITAB_KUNING, name: 'Kajian Kitab Kuning', slug: 'kajian-kitab-kuning', description: 'Pembacaan dan pemahaman kitab kuning secara bersama.', parentId: null, status: 'PUBLISHED', sortOrder: 6 },
      { id: ID.T_SIROH, name: 'Siroh Nabawiyah', slug: 'siroh-nabawiyah', description: 'Sejarah dan teladan kehidupan Rasulullah SAW.', parentId: null, status: 'PUBLISHED', sortOrder: 7 },
    ],
  });

  await prisma.topicAlias.createMany({
    data: [
      { id: ID.TA_TAHSIN_TAJWID, topicId: ID.T_TAHSIN, alias: 'tajwid' },
      { id: ID.TA_FIQH_MUAMALAH, topicId: ID.T_FIQH, alias: 'fiqh' },
    ],
  });

  await prisma.knowledgeClaim.createMany({
    data: [
      {
        id: ID.CL_EDU4_1,
        educatorId: ID.E_EDU4,
        predicate: 'SPECIALIZES_IN',
        objectText: "Tajwid, Tahfidz Juz Amma, dan pembelajaran Al-Qur'an untuk pemula",
        topicId: ID.T_TAHSIN,
        status: 'VERIFIED',
        verifiedById: ID.U_LAJNAH,
        verifiedAt: new Date(),
        sourceId: ID.SRC_EDU4_1,
        evidenceId: ID.EV_EDU4_1,
      },
      {
        id: ID.CL_EDU4_2,
        educatorId: ID.E_EDU4,
        predicate: 'GRADUATED_FROM',
        objectText: 'UIN Sumatera Utara',
        status: 'UNVERIFIED',
      },
      {
        id: ID.CL_EDU4_3,
        educatorId: ID.E_EDU4,
        predicate: 'GRADUATED_FROM',
        objectText: 'UIN Sumatera Utara',
        status: 'VERIFIED',
        verifiedById: ID.U_LAJNAH,
        verifiedAt: new Date(),
        sourceId: ID.SRC_EDU4_1,
        evidenceId: ID.EV_EDU4_1,
      },
      {
        id: ID.CL_EDU4_4,
        educatorId: ID.E_EDU4,
        predicate: 'AFFILIATED_WITH',
        objectText: 'Majelis Ta\'lim Nurul Hidayah (Demo)',
        status: 'VERIFIED',
        verifiedById: ID.U_LAJNAH,
        verifiedAt: new Date(),
        sourceId: ID.SRC_EDU4_1,
        evidenceId: ID.EV_EDU4_1,
      },
      {
        id: ID.CL_EDU1_1,
        educatorId: ID.E_EDU1,
        predicate: 'SPECIALIZES_IN',
        objectText: "Fiqh Muamalah & Tahsin Qira'ah",
        status: 'UNVERIFIED',
      },
      {
        id: ID.CL_EDU2_1,
        educatorId: ID.E_EDU2,
        predicate: 'SPECIALIZES_IN',
        objectText: "Pembelajaran Al-Qur'an Anak & Keluarga",
        status: 'DRAFT',
      },
    ],
  });

  await prisma.digitalProfile.createMany({
    data: [
      {
        id: ID.DP_EDU4_YT,
        educatorId: ID.E_EDU4,
        platform: 'YOUTUBE',
        url: 'https://www.youtube.com/@abdullahhasibuan',
        handle: '@abdullahhasibuan',
        status: 'VERIFIED',
        verifiedById: ID.U_LAJNAH,
        verifiedAt: new Date(),
      },
      {
        id: ID.DP_EDU4_WEB,
        educatorId: ID.E_EDU4,
        platform: 'WEBSITE',
        url: 'https://ustadzabdullah.example.com',
        handle: null,
        status: 'SELF_DECLARED',
      },
    ],
  });

  await prisma.platformSetting.createMany({
    data: [
      { key: 'public_directory_enabled', value: 'true' },
      { key: 'public_topics_enabled', value: 'true' },
      { key: 'maintenance_mode', value: 'false' },
      { key: 'search_console_enabled', value: 'false' },
      { key: 'entity_publishing_policy', value: 'verified-only' },
    ],
  });

  // ---- Community Knowledge Domain (Slice E2 — demo fixtures) ----
  // Community signal only: questions, answers, votes, reports, comments.
  // These rows are NEVER VERIFIED knowledge; the accepted answer below records
  // the matching idempotent COMMUNITY_KHIDMAH XP entry exactly as the service
  // would (eventId + idempotencyKey reproduced from src/lib/community/qa.ts).
  // Community PlatformSettings are intentionally NOT seeded: absent keys fall
  // back to defaults (features ON, QA indexing OFF, anonymous OFF).

  await prisma.communityQuestion.createMany({
    data: [
      {
        id: ID.Q_TAHSIN, authorId: ID.U_LEARNER, topicId: ID.T_TAHSIN, educatorId: ID.E_EDU4,
        title: 'Metode talaqqi untuk pemula dewasa?',
        body: 'Assalamualaikum, saya baru mulai belajar tajwid di usia dewasa. Metode talaqqi seperti apa yang paling disarankan untuk pemula, dan berapa lama idealnya satu sesi?',
      },
      {
        id: ID.Q_FIQH, authorId: ID.U_LEARNER, topicId: ID.T_FIQH, educatorId: null,
        title: 'Jual beli kredit dalam fiqh muamalah',
        body: 'Bagaimana hukum jual beli secara kredit (cicilan) dalam fiqh muamalah kontemporer? Apakah ada perbedaan pendapat yang perlu diketahui pembelajar?',
      },
    ],
  });

  await prisma.communityAnswer.createMany({
    data: [
      {
        id: ID.A_TAHSIN_1, questionId: ID.Q_TAHSIN, authorId: ID.U_EDU4,
        body: 'Waalaikumsalam. Untuk pemula dewasa saya sarankan talaqqi 2-3 kali pekan, 30-45 menit per sesi, fokus pada makhraj dan satu hukum tajwid per pertemuan agar tidak memberatkan.',
        acceptedAt: new Date(), acceptedById: ID.U_LEARNER,
      },
      {
        id: ID.A_TAHSIN_2, questionId: ID.Q_TAHSIN, authorId: ID.U_EDU1,
        body: 'Saya setuju dengan pendekatan bertahap. Tambahan: rekam bacaan Anda dan bandingkan dengan murottal sanad yang sama untuk melatih pendengaran.',
      },
      {
        id: ID.A_FIQH_1, questionId: ID.Q_FIQH, authorId: ID.U_EDU1,
        body: 'Mayoritas ulama membolehkan jual beli kredit (bai\' al-taqsith) dengan syarat harga tetap di awal dan tidak ada denda riba atas keterlambatan. Ada perbedaan rinci, pelajari dulu kaidahnya secara bertahap.',
      },
    ],
  });

  await prisma.communityComment.createMany({
    data: [
      {
        id: ID.CMT_EDU4_1, authorId: ID.U_LEARNER, targetType: 'EDUCATOR_PROFILE', targetId: ID.E_EDU4,
        body: 'Jazakallahu khair, penjelasan tentang makhraj hurufnya sangat mudah diikuti untuk pemula.',
      },
      {
        id: ID.CMT_EDU4_1_REPLY, authorId: ID.U_EDU4, targetType: 'COMMENT', targetId: ID.CMT_EDU4_1, parentId: ID.CMT_EDU4_1,
        body: 'Wa iyyakum. Silakan tanyakan bagian yang masih kurang jelas di kelas.',
      },
      {
        id: ID.CMT_TOPIC_1, authorId: ID.U_LEARNER, targetType: 'TOPIC', targetId: ID.T_TAHSIN,
        body: 'Apakah ada sesi latihan pendengaran (tamyiz) yang dibuka untuk umum?',
      },
      {
        id: ID.CMT_HIDDEN, authorId: ID.U_EDU2, targetType: 'EDUCATOR_PROFILE', targetId: ID.E_EDU1,
        status: 'HIDDEN', moderatedById: ID.U_FOUNDER, moderatedAt: new Date(),
        body: 'Contoh komentar yang ditandai moderasi (soft-hidden, dipertahankan untuk audit).',
      },
    ],
  });

  await prisma.communityVote.createMany({
    data: [
      { id: ID.V_AGREE, voterId: ID.U_LEARNER, targetType: 'ANSWER', targetId: ID.A_TAHSIN_1, voteType: 'AGREE' },
      { id: ID.V_HELPFUL, voterId: ID.U_EDU1, targetType: 'ANSWER', targetId: ID.A_TAHSIN_1, voteType: 'HELPFUL' },
    ],
  });

  await prisma.communityReport.create({
    data: {
      id: ID.REP_1, reporterId: ID.U_EDU1, targetType: 'COMMENT', targetId: ID.CMT_TOPIC_1,
      reason: 'Pertanyaan ini lebih cocok disampaikan melalui forum tanya jawab.',
    },
  });

  // Accepted answer XP entry — reproduced verbatim from awardAcceptedAnswerXp
  // (src/lib/community/qa.ts) so re-accept/unaccept in the demo stays idempotent.
  await prisma.xpLedger.create({
    data: {
      id: ID.XP_ANS1,
      userId: ID.U_EDU4,
      eventId: `answer-accepted-${ID.A_TAHSIN_1}`,
      idempotencyKey: `xp-${ID.U_EDU4}-answer-accepted-${ID.A_TAHSIN_1}-COMMUNITY_KHIDMAH`,
      amount: 50,
      actionType: 'COMMUNITY_KHIDMAH',
      source: 'COMMUNITY_QA',
      reference: ID.Q_TAHSIN,
    },
  });

  console.log('Seed complete. Deterministic SEMESTA ISLAM dataset loaded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
