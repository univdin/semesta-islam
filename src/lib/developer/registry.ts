/**
 * SEMESTA ISLAM — Developer API Reference Registry (Read-Only)
 *
 * Source of truth: the ACTUAL runtime (`src/app/api/v1/**`, `src/lib/**`)
 * reconciled with `docs/07_API_ENDPOINTS.md` and the latest empirical audit
 * (`docs/implementation/POST_EXECUTION_VERIFICATION.md`).
 *
 * This is a static, typed, read-only metadata registry. It is NOT an API
 * console and does NOT execute or mutate anything.
 *
 * Status taxonomy per BATCH 5 EXECUTION DIRECTIVE §4:
 *   VERIFIED         — endpoint exists in code AND empirically verified E2E
 *   IMPLEMENTED      — endpoint exists in code; source-verified (not in E2E run)
 *   DEFERRED         — documented in 07_API_ENDPOINTS.md, intentionally post-MVP, no code
 *   ASPIRATIONAL     — documented as a future capability, blocked by missing
 *                      cloud credentials/infrastructure, no code
 *   NOT_IMPLEMENTED  — documented, no code, no MVP plan
 */

import type {
  BookingStatus,
  LearningMethod,
  LedgerEntryType,
  UserRole,
  VerificationStatus,
} from '@/types';

export type EndpointStatus =
  | 'VERIFIED'
  | 'IMPLEMENTED'
  | 'DEFERRED'
  | 'ASPIRATIONAL'
  | 'NOT_IMPLEMENTED';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export type DomainId =
  | 'educators'
  | 'verification'
  | 'bookings'
  | 'authentication'
  | 'member'
  | 'courses'
  | 'referrals'
  | 'management'
  | 'economy'
  | 'payments';

export interface EndpointField {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

export interface EndpointError {
  code: number;
  label: string;
  description: string;
}

export interface EndpointDetail {
  id: string;
  method: HttpMethod;
  path: string;
  domain: DomainId;
  name: string;
  summary: string;
  status: EndpointStatus;
  access: string;
  request?: {
    body?: EndpointField[];
    bodySchema?: string;
    query?: EndpointField[];
    note?: string;
  };
  response?: {
    successCode: number;
    envelope: string;
    dataFields?: EndpointField[];
    note?: string;
  };
  errors: EndpointError[];
  notes?: string[];
  evidence?: string[];
}

export interface SchemaRef {
  name: string;
  source: string;
  fields: EndpointField[];
  note?: string;
}

export interface StatusLegend {
  status: EndpointStatus;
  description: string;
}

export const ENDPOINT_STATUSES: StatusLegend[] = [
  {
    status: 'VERIFIED',
    description:
      'Endpoint ada di kode dan terverifikasi secara empiris pada audit terbaru (E2E, fresh database).',
  },
  {
    status: 'IMPLEMENTED',
    description:
      'Endpoint ada di kode, terverifikasi dari sumber; belum masuk daftar verifikasi E2E terakhir.',
  },
  {
    status: 'DEFERRED',
    description:
      'Terdokumentasi di 07_API_ENDPOINTS.md, sengaja ditunda pasca-MVP; belum ada kode.',
  },
  {
    status: 'ASPIRATIONAL',
    description:
      'Kapabilitas yang diharapkan kontrak (contoh: Supabase Auth, Upstash rate limit) — terblokir kredensial cloud, belum ada kode.',
  },
  {
    status: 'NOT_IMPLEMENTED',
    description:
      'Terdokumentasi, belum ada kode, dan tidak terjadwal pada MVP.',
  },
];

export const SUCCESS_ENVELOPE_NOTE =
  'Envelope sukses runtime: `{ "success": true, "statusCode": <code>, "message": "...", "data": { ... } }`. ' +
  'Field `meta` (07_API_ENDPOINTS.md §1.1) tidak dikeluarkan oleh runtime saat ini (drift tercatat).';

export const VALIDATION_ERROR_ENVELOPE =
  'Error validasi (400): `{ "success": false, "statusCode": 400, "message": "...", "details": [{ "field": "...", "issue": "..." }] }`. ' +
  'Error bisnis (403/404/409): `{ "success": false, "statusCode": <code>, "message": "..." }`. ' +
  'Error internal (500): `{ "success": false, "statusCode": 500, "message": "...", "error": "<message>" }`.';

export const USER_ROLES: ReadonlyArray<UserRole> = [
  'LEARNER',
  'GUARDIAN',
  'EDUCATOR',
  'INSTITUTION_ADMIN',
  'LAJNAH_VERIFIER',
  'FOUNDER_ADMIN',
];

export const VERIFICATION_STATUSES: ReadonlyArray<VerificationStatus> = [
  'DRAFT',
  'SUBMITTED',
  'UNDER_REVIEW_LAJNAH',
  'VERIFIED',
  'REJECTED',
  'REVOKED',
];

export const LEARNING_METHODS: ReadonlyArray<LearningMethod> = [
  'ONLINE_ZOOM',
  'PRIVATE_HOME',
  'GROUP_MAJELIS',
];

export const BOOKING_STATUSES: ReadonlyArray<BookingStatus> = [
  'PENDING',
  'CONFIRMED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
];

export const LEDGER_ENTRY_TYPES: ReadonlyArray<LedgerEntryType> = [
  'LEARNER_POINT',
  'VOUCHER_CREDIT',
  'FEE_COLLECTION',
  'COMMISSION_ACCRUAL',
  'REWARD_TOKEN',
];

export const VERIFICATION_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['SUBMITTED'],
  SUBMITTED: ['UNDER_REVIEW_LAJNAH', 'REJECTED'],
  UNDER_REVIEW_LAJNAH: ['VERIFIED', 'REJECTED'],
  VERIFIED: ['REVOKED'],
  REJECTED: ['SUBMITTED'],
  REVOKED: ['SUBMITTED'],
};

export const BOOKING_INQUIRY_SCHEMA: SchemaRef = {
  name: 'BookingInquirySchema',
  source: 'src/lib/validations/index.ts',
  fields: [
    { name: 'educatorId', type: 'uuid', required: true, description: 'ID pendidik tujuan' },
    { name: 'courseId', type: 'uuid', required: false, description: 'ID program (opsional)' },
    { name: 'scheduleId', type: 'uuid', required: false, description: 'ID jadwal (opsional)' },
    {
      name: 'learningMethod',
      type: 'enum(ONLINE_ZOOM | PRIVATE_HOME | GROUP_MAJELIS)',
      required: true,
      description: 'Metode belajar',
    },
    { name: 'preferredSchedule', type: 'string (min 3)', required: true, description: 'Preferensi jadwal' },
    { name: 'learnerName', type: 'string (min 2)', required: true, description: 'Nama pembelajar' },
    {
      name: 'contactPhone',
      type: 'string (regex ^(\\+62|08)[0-9]{8,12}$)',
      required: true,
      description: 'Nomor WhatsApp/HP Indonesia',
    },
    { name: 'notes', type: 'string (max 500)', required: false, description: 'Catatan tambahan' },
  ],
};

export const VERIFICATION_SUBMIT_SCHEMA: SchemaRef = {
  name: 'VerificationSubmitSchema',
  source: 'src/lib/validations/index.ts',
  fields: [
    { name: 'educatorId', type: 'uuid', required: true, description: 'ID pendidik' },
    { name: 'ktpNumber', type: 'string (16 digit)', required: true, description: 'Nomor KTP' },
    { name: 'ktpDocumentUrl', type: 'url', required: true, description: 'URL dokumen KTP (Lapisan 1)' },
    { name: 'ijazahDocumentUrl', type: 'url', required: true, description: 'URL dokumen Ijazah (Lapisan 2)' },
    {
      name: 'ijazahSha256Hash',
      type: 'string (64 hex)',
      required: true,
      description: 'Fingerprint SHA-256 dokumen Ijazah',
    },
    { name: 'recommenderEmail', type: 'email', required: true, description: 'Email ulama/penyandang rekomendasi (Lapisan 3)' },
    { name: 'recommenderInstitution', type: 'string (min 3)', required: true, description: 'Lembaga pemberi rekomendasi' },
    { name: 'qiraahSanadName', type: 'string', required: false, description: 'Nama sanad qiraah (opsional)' },
  ],
};

export const LAJNAH_REVIEW_SCHEMA: SchemaRef = {
  name: 'LajnahReviewSchema',
  source: 'src/app/api/v1/verification/review/route.ts (inline)',
  fields: [
    { name: 'verificationRequestId', type: 'string (min 1)', required: true, description: 'ID permohonan verifikasi' },
    { name: 'currentStatus', type: 'enum(VerificationStatus)', required: true, description: 'Status yang diklaim klien (stale-check terhadap DB)' },
    { name: 'targetStatus', type: 'enum(VerificationStatus)', required: true, description: 'Status tujuan' },
    { name: 'reviewNotes', type: 'string (min 5)', required: true, description: 'Catatan telaah' },
    { name: 'ethicsScore', type: 'number (0-100)', required: false, description: 'Skor etika, default 100' },
  ],
  note: 'Identity verifikator (verifierUserId & verifierRoles) TIDAK dikirim klien; diresolusi server-side dari session (DECISION-07) dan diperiksa role LAJNAH_VERIFIER/FOUNDER_ADMIN.',
};

export const BOOKING_CONFIRM_SCHEMA: SchemaRef = {
  name: 'BookingConfirmSchema',
  source: 'src/app/api/v1/bookings/confirm/route.ts (inline)',
  fields: [{ name: 'bookingId', type: 'uuid', required: true, description: 'ID booking' }],
  note: 'Identity aktor (actorUserId & actorRoles) TIDAK dikirim klien; diresolusi server-side dari session (DECISION-07). Konfirmasi hanya untuk pendidik pemilik booking atau FOUNDER_ADMIN.',
};

export const VERIFICATION_STATUS_QUERY: SchemaRef = {
  name: 'VerificationStatusQuery',
  source: 'src/app/api/v1/verification/status/route.ts (inline)',
  fields: [{ name: 'educatorId', type: 'uuid', required: true, description: 'Query parameter; ID pendidik' }],
};

export const SCHEMAS: SchemaRef[] = [
  BOOKING_INQUIRY_SCHEMA,
  VERIFICATION_SUBMIT_SCHEMA,
  LAJNAH_REVIEW_SCHEMA,
  BOOKING_CONFIRM_SCHEMA,
  VERIFICATION_STATUS_QUERY,
];

const VERIFIED_EVIDENCE =
  'docs/implementation/POST_EXECUTION_VERIFICATION.md §1 (V7-V13) — diverifikasi ulang pada fresh database.';

export const ENDPOINTS: EndpointDetail[] = [
  // ── VERIFICATION (verified) ────────────────────────────────────────────────
  {
    id: 'post-verification-submit',
    method: 'POST',
    path: '/api/v1/verification/submit',
    domain: 'verification',
    name: 'Submit Verifikasi Kredensial',
    summary:
      'Mengajukan verifikasi kredensial & sanad pendidik ke antrean Lajnah (status -> SUBMITTED).',
    status: 'VERIFIED',
    access: 'Authenticated Educator (identity demo diresolusi server-side hingga auth nyata ada)',
    request: { body: VERIFICATION_SUBMIT_SCHEMA.fields, bodySchema: 'VerificationSubmitSchema' },
    response: {
      successCode: 201,
      envelope: SUCCESS_ENVELOPE_NOTE,
      dataFields: [
        { name: 'verificationRequestId', type: 'uuid', required: true, description: 'ID permohonan baru' },
        { name: 'educatorId', type: 'uuid', required: true, description: 'ID pendidik' },
        { name: 'status', type: '"SUBMITTED"', required: true, description: 'Status awal antrean' },
        { name: 'ijazahSha256Hash', type: 'string (64 hex)', required: true, description: 'Fingerprint tersimpan' },
        { name: 'recommenderEmail', type: 'email', required: true, description: 'Email rekomendasi' },
        { name: 'auditLogged', type: 'boolean', required: true, description: 'Selalu true; audit ditulis di transaksi' },
        { name: 'submittedAt', type: 'ISO 8601', required: true, description: 'Waktu pengajuan' },
      ],
    },
    errors: [
      { code: 400, label: 'VALIDATION', description: 'Payload tidak lolos VerificationSubmitSchema, atau format SHA-256 tidak valid (isValidSha256).' },
      { code: 404, label: 'EDUCATOR_NOT_FOUND', description: 'educatorId tidak ditemukan di educator_profiles.' },
      { code: 409, label: 'ACTIVE_REQUEST_EXISTS', description: 'Sudah ada permohonan berstatus SUBMITTED / UNDER_REVIEW_LAJNAH untuk pendidik ini.' },
      { code: 500, label: 'INTERNAL', description: 'Internal server error.' },
    ],
    notes: [
      'Security: `ijazahSha256Hash` diperiksa ulang format 64-hex sebelum diproses.',
      'Menulis `verification_requests`, memperbarui `educator_profiles.verifiedStatus`, dan menulis `audit_logs` (VERIFICATION_SUBMITTED) dalam satu transaksi.',
    ],
    evidence: [VERIFIED_EVIDENCE, 'src/app/api/v1/verification/submit/route.ts', 'src/lib/verification/service.ts'],
  },
  {
    id: 'get-verification-status',
    method: 'GET',
    path: '/api/v1/verification/status',
    domain: 'verification',
    name: 'Status Verifikasi Pendidik',
    summary: 'Membaca status antrean verifikasi terbaru untuk seorang pendidik.',
    status: 'VERIFIED',
    access: 'Educator / Founder (read-only)',
    request: { query: VERIFICATION_STATUS_QUERY.fields, bodySchema: 'VerificationStatusQuery' },
    response: {
      successCode: 200,
      envelope: SUCCESS_ENVELOPE_NOTE,
      dataFields: [
        { name: 'requestId', type: 'uuid', required: true, description: 'ID permohonan' },
        { name: 'educatorId', type: 'uuid', required: true, description: 'ID pendidik' },
        { name: 'status', type: 'enum(VerificationStatus)', required: true, description: 'Status terkini' },
        { name: 'layer1KtpUrl', type: 'url | null', required: true, description: 'URL dokumen KTP' },
        { name: 'layer2IjazahUrl', type: 'url | null', required: true, description: 'URL dokumen Ijazah' },
        { name: 'layer2Sha256Hash', type: 'string | null', required: true, description: 'Fingerprint SHA-256' },
        { name: 'recommenderEmail', type: 'email | null', required: true, description: 'Email rekomendasi' },
        { name: 'reviewNotes', type: 'string | null', required: true, description: 'Catatan telaah Lajnah' },
        { name: 'ethicsScore', type: 'number', required: true, description: 'Skor etika Lapisan 4' },
        { name: 'createdAt', type: 'ISO 8601', required: true, description: 'Waktu dibuat' },
        { name: 'updatedAt', type: 'ISO 8601', required: true, description: 'Waktu diperbarui' },
      ],
    },
    errors: [
      { code: 400, label: 'VALIDATION', description: '`educatorId` bukan UUID valid.' },
      { code: 404, label: 'NOT_FOUND', description: 'Belum ada permohonan verifikasi untuk pendidik ini.' },
      { code: 500, label: 'INTERNAL', description: 'Internal server error.' },
    ],
    notes: ['Mengembalikan permohonan terbaru (`updatedAt` desc) untuk educatorId.'],
    evidence: [VERIFIED_EVIDENCE, 'src/app/api/v1/verification/status/route.ts', 'src/lib/verification/service.ts'],
  },
  {
    id: 'post-verification-review',
    method: 'POST',
    path: '/api/v1/verification/review',
    domain: 'verification',
    name: 'Telaah Lajnah',
    summary:
      'Transisi status verifikasi oleh Lajnah (guard role + state machine + stale-check currentStatus terhadap DB).',
    status: 'VERIFIED',
    access: 'LAJNAH_VERIFIER atau FOUNDER_ADMIN (identity diresolusi server-side dari session)',
    request: { body: LAJNAH_REVIEW_SCHEMA.fields, bodySchema: 'LajnahReviewSchema' },
    response: {
      successCode: 200,
      envelope: SUCCESS_ENVELOPE_NOTE,
      dataFields: [
        { name: 'verificationRequestId', type: 'uuid', required: true, description: 'ID permohonan' },
        { name: 'verifierUserId', type: 'uuid', required: true, description: 'ID verifikator' },
        { name: 'previousStatus', type: 'enum(VerificationStatus)', required: true, description: 'Status sebelum transisi' },
        { name: 'newStatus', type: 'enum(VerificationStatus)', required: true, description: 'Status setelah transisi' },
        { name: 'reviewNotes', type: 'string', required: true, description: 'Catatan telaah' },
        { name: 'ethicsScore', type: 'number', required: true, description: 'Skor etika' },
        { name: 'auditLogged', type: 'boolean', required: true, description: 'Selalu true' },
        { name: 'reviewedAt', type: 'ISO 8601', required: true, description: 'Waktu telaah' },
      ],
    },
    errors: [
      { code: 400, label: 'VALIDATION', description: 'Payload tidak lolos LajnahReviewSchema (mis. reviewNotes < 5 karakter).' },
      { code: 403, label: 'FORBIDDEN', description: 'Role session server-side bukan LAJNAH_VERIFIER / FOUNDER_ADMIN.' },
      { code: 404, label: 'NOT_FOUND', description: 'Permohonan verifikasi tidak ditemukan.' },
      { code: 409, label: 'CONFLICT', description: 'Transisi tidak valid menurut state machine, ATAU currentStatus basi (tidak cocok dengan status di DB).' },
      { code: 500, label: 'INTERNAL', description: 'Internal server error.' },
    ],
    notes: [
      'State machine: ' +
        Object.entries(VERIFICATION_TRANSITIONS)
          .map(([from, to]) => `${from} -> [${to.join(', ')}]`)
          .join(' · '),
      'Stale-check: DB adalah sumber kebenaran; `currentStatus` klien yang basi ditolak 409.',
      'Menulis `verification_requests`, `educator_profiles.verifiedStatus`, dan `audit_logs` (VERIFICATION_REVIEWED) dalam satu transaksi.',
    ],
    evidence: [VERIFIED_EVIDENCE, 'src/app/api/v1/verification/review/route.ts', 'src/lib/verification/service.ts', 'src/lib/verification/stateMachine.ts'],
  },
  {
    id: 'post-verification-resubmit',
    method: 'POST',
    path: '/api/v1/verification/resubmit',
    domain: 'verification',
    name: 'Resubmit Verifikasi',
    summary: 'Mengajukan ulang verifikasi setelah ditolak (REJECTED -> SUBMITTED).',
    status: 'VERIFIED',
    access: 'Authenticated Educator (identity demo diresolusi server-side)',
    request: {
      body: [
        { name: 'verificationRequestId', type: 'uuid', required: true, description: 'ID permohonan yang akan diajukan ulang' },
        { name: 'currentStatus', type: 'enum(VerificationStatus)', required: false, description: 'Status yang diklaim; default "REJECTED"' },
        ...VERIFICATION_SUBMIT_SCHEMA.fields,
      ],
      bodySchema: 'VerificationSubmitSchema (+ verificationRequestId, currentStatus)',
    },
    response: {
      successCode: 200,
      envelope: SUCCESS_ENVELOPE_NOTE,
      dataFields: [
        { name: 'verificationRequestId', type: 'uuid', required: true, description: 'ID permohonan' },
        { name: 'status', type: '"SUBMITTED"', required: true, description: 'Status setelah resubmit' },
        { name: 'ijazahSha256Hash', type: 'string (64 hex)', required: true, description: 'Fingerprint baru' },
        { name: 'resubmittedAt', type: 'ISO 8601', required: true, description: 'Waktu resubmit' },
      ],
    },
    errors: [
      { code: 400, label: 'VALIDATION', description: '`verificationRequestId` hilang atau payload submit tidak valid.' },
      { code: 404, label: 'NOT_FOUND', description: 'Permohonan verifikasi tidak ditemukan.' },
      { code: 409, label: 'CONFLICT', description: 'Status di DB tidak cocok dengan currentStatus, atau transisi dari status tersebut ke SUBMITTED tidak valid.' },
      { code: 500, label: 'INTERNAL', description: 'Internal server error.' },
    ],
    notes: [
      'Hanya REJECTED -> SUBMITTED dan REVOKED -> SUBMITTED yang valid untuk resubmit (state machine).',
      'Menulis audit VERIFICATION_RESUBMITTED.',
    ],
    evidence: [VERIFIED_EVIDENCE, 'src/app/api/v1/verification/resubmit/route.ts', 'src/lib/verification/service.ts'],
  },
  {
    id: 'post-verification-confirm-token',
    method: 'POST',
    path: '/api/v1/verification/confirm-token',
    domain: 'verification',
    name: 'Konfirmasi Token Rekomendasi',
    summary: 'Verifikasi token rekomendasi ulama via email (dokumentasi 07 §2.5).',
    status: 'DEFERRED',
    access: 'Public (Token-bound)',
    request: undefined,
    response: undefined,
    errors: [],
    notes: [
      'Belum ada kode. Membutuhkan infrastruktur email/token yang belum tersedia; ditunda pasca-MVP.',
      'Tidak direpresentasikan sebagai berfungsi.',
    ],
    evidence: ['docs/07_API_ENDPOINTS.md §2.5', 'docs/implementation/POST_EXECUTION_VERIFICATION.md §2 (N4)'],
  },

  // ── BOOKINGS (verified) ────────────────────────────────────────────────────
  {
    id: 'post-bookings-inquire',
    method: 'POST',
    path: '/api/v1/bookings/inquire',
    domain: 'bookings',
    name: 'Inquiry Booking',
    summary: 'Pengajuan multi-step booking inquiry + alokasi poin virtual ledger.',
    status: 'VERIFIED',
    access: 'Authenticated Learner (identity demo: seeded learner `10000000-...-0001`, diresolusi server-side)',
    request: { body: BOOKING_INQUIRY_SCHEMA.fields, bodySchema: 'BookingInquirySchema' },
    response: {
      successCode: 201,
      envelope: SUCCESS_ENVELOPE_NOTE,
      dataFields: [
        { name: 'bookingId', type: 'uuid', required: true, description: 'ID booking baru' },
        { name: 'learnerName', type: 'string', required: true, description: 'Nama pembelajar' },
        { name: 'learningMethod', type: 'enum(LearningMethod)', required: true, description: 'Metode belajar' },
        { name: 'preferredSchedule', type: 'string', required: true, description: 'Preferensi jadwal' },
        { name: 'ledgerPointsEarned', type: 'number', required: true, description: 'Poin yang dialokasikan (50)' },
        { name: 'paymentAmount', type: 'number', required: true, description: 'Selalu 0 — inquiry MVP tidak memiliki tarif' },
        { name: 'invoiceStatus', type: 'string | null', required: true, description: 'Selalu null — tidak ada invoice yang dibuat saat inquiry' },
        { name: 'paymentMode', type: 'string | null', required: true, description: 'Selalu null — tidak ada mode pembayaran saat inquiry' },
      ],
    },
    errors: [
      { code: 400, label: 'VALIDATION', description: 'Payload tidak lolos BookingInquirySchema (mis. contactPhone format +62/08).' },
      { code: 401, label: 'UNAUTHORIZED', description: 'Sesi tidak terautentikasi (Supabase atau demo identity).' },
      { code: 404, label: 'EDUCATOR_NOT_FOUND', description: 'educatorId tidak ditemukan di educator_profiles.' },
      { code: 500, label: 'INTERNAL', description: 'Internal server error.' },
    ],
    notes: [
      'Menulis `booking_requests` (status PENDING), `economic_ledgers` (LEARNER_POINT 50), dan `audit_logs` (BOOKING_INQUIRED) dalam satu transaksi.',
      'Tidak ada pembayaran yang dibuat pada inquiry (tanpa tarif, tanpa provider pembayaran terkonfigurasi). Invoice hanya relevan pasca-konfirmasi saat payment provider ter-wire.',
      'learnerUserId tidak dikirim klien; diresolusi server-side dari sesi terautentikasi (getServerIdentity, DECISION-07).',
    ],
    evidence: [VERIFIED_EVIDENCE, 'src/app/api/v1/bookings/inquire/route.ts', 'src/lib/bookings/service.ts'],
  },
  {
    id: 'post-bookings-confirm',
    method: 'POST',
    path: '/api/v1/bookings/confirm',
    domain: 'bookings',
    name: 'Konfirmasi Booking',
    summary: 'Konfirmasi booking PENDING oleh pendidik pemilik atau founder (PENDING -> CONFIRMED).',
    status: 'VERIFIED',
    access: 'Owning EDUCATOR atau FOUNDER_ADMIN',
    request: { body: BOOKING_CONFIRM_SCHEMA.fields, bodySchema: 'BookingConfirmSchema' },
    response: {
      successCode: 200,
      envelope: SUCCESS_ENVELOPE_NOTE,
      dataFields: [
        { name: 'bookingId', type: 'uuid', required: true, description: 'ID booking' },
        { name: 'status', type: '"CONFIRMED"', required: true, description: 'Status baru' },
        { name: 'confirmedAt', type: 'ISO 8601', required: true, description: 'Waktu konfirmasi' },
      ],
    },
    errors: [
      { code: 400, label: 'VALIDATION', description: 'Payload tidak lolos BookingConfirmSchema.' },
      { code: 403, label: 'FORBIDDEN', description: 'Aktor bukan pendidik pemilik booking dan bukan FOUNDER_ADMIN.' },
      { code: 404, label: 'BOOKING_NOT_FOUND', description: 'Booking tidak ditemukan.' },
      { code: 409, label: 'CONFLICT', description: 'Booking tidak berstatus PENDING (tidak dapat dikonfirmasi).' },
      { code: 500, label: 'INTERNAL', description: 'Internal server error.' },
    ],
    notes: [
      'Domain event `booking.confirmed` (PRD §450, WEBHOOK_CONTRACT).',
      'Guard: hanya pemilik EDUCATOR (booking.educator.userId === actorUserId, dari session server-side — bukan dari klien) atau FOUNDER_ADMIN.',
      'Menulis status CONFIRMED + audit BOOKING_CONFIRMED.',
    ],
    evidence: [VERIFIED_EVIDENCE, 'src/app/api/v1/bookings/confirm/route.ts', 'src/lib/bookings/service.ts'],
  },
  {
    id: 'get-bookings-ledger',
    method: 'GET',
    path: '/api/v1/bookings/ledger',
    domain: 'bookings',
    name: 'Riwayat Ledger',
    summary: 'Riwayat pencatatan buku besar internal (dokumentasi 07 §2.6).',
    status: 'DEFERRED',
    access: 'Authenticated Learner',
    request: undefined,
    response: undefined,
    errors: [],
    notes: [
      'Belum ada kode; bagian dari scope member/founder pasca-MVP.',
      'Tidak direpresentasikan sebagai berfungsi.',
    ],
    evidence: ['docs/07_API_ENDPOINTS.md §2.6', 'docs/implementation/POST_EXECUTION_VERIFICATION.md §2 (N4)'],
  },

  // ── EDUCATORS (documented only) ────────────────────────────────────────────
  {
    id: 'get-educators',
    method: 'GET',
    path: '/api/v1/educators',
    domain: 'educators',
    name: 'Direktori Pendidik',
    summary: 'Pencarian & filter presisi direktori pendidik (dokumentasi 07 §2.3).',
    status: 'DEFERRED',
    access: 'Public (Upstash cached — klaim, belum ada)',
    request: undefined,
    response: undefined,
    errors: [],
    notes: [
      'Belum ada route API. Fungsi setara disajikan sebagai halaman server-rendered `/directory` yang dibackend Postgres (terverifikasi).',
      'Klaim cache Upstash pada 07 bersifat aspirasional.',
    ],
    evidence: ['docs/07_API_ENDPOINTS.md §2.3', 'docs/implementation/POST_EXECUTION_VERIFICATION.md §1 (V6)'],
  },
  {
    id: 'get-educators-id',
    method: 'GET',
    path: '/api/v1/educators/:id',
    domain: 'educators',
    name: 'Detail Pendidik',
    summary: 'Detail profil pendidik, silsilah sanad, & ulasan (dokumentasi 07 §2.3).',
    status: 'DEFERRED',
    access: 'Public',
    request: undefined,
    response: undefined,
    errors: [],
    notes: [
      'Belum ada route API. Fungsi setara disajikan sebagai halaman server-rendered `/educator/[slug]` (DB-backed); slug/UUID tidak dikenal -> 404 via notFound(), UUID legacy -> 308 ke slug kanonik.',
    ],
    evidence: ['docs/07_API_ENDPOINTS.md §2.3', 'docs/implementation/POST_EXECUTION_VERIFICATION.md §1 (V6)'],
  },
  {
    id: 'get-educators-id-reviews',
    method: 'GET',
    path: '/api/v1/educators/:id/reviews',
    domain: 'educators',
    name: 'Ulasan Pendidik',
    summary: 'Daftar ulasan terverifikasi (dokumentasi 07 §2.3).',
    status: 'DEFERRED',
    access: 'Public',
    request: undefined,
    response: undefined,
    errors: [],
    notes: ['Belum ada kode; pasca-MVP.'],
    evidence: ['docs/07_API_ENDPOINTS.md §2.3', 'docs/implementation/POST_EXECUTION_VERIFICATION.md §2 (N4)'],
  },

  // ── AUTHENTICATION (aspirational) ──────────────────────────────────────────
  {
    id: 'post-auth-magic-link',
    method: 'POST',
    path: '/api/v1/auth/magic-link',
    domain: 'authentication',
    name: 'Magic Link',
    summary: 'Mengirimkan Magic Link via Supabase Auth (dokumentasi 07 §2.1).',
    status: 'ASPIRATIONAL',
    access: 'Public',
    request: undefined,
    response: undefined,
    errors: [],
    notes: ['Belum ada kode; terblokir kredensial cloud Supabase. Identity demo diresolusi server-side.'],
    evidence: ['docs/07_API_ENDPOINTS.md §2.1', 'docs/implementation/POST_EXECUTION_VERIFICATION.md §2 (N2)'],
  },
  {
    id: 'post-auth-verify-session',
    method: 'POST',
    path: '/api/v1/auth/verify-session',
    domain: 'authentication',
    name: 'Verifikasi Sesi',
    summary: 'Verifikasi token sesi & mengambil data role (dokumentasi 07 §2.1).',
    status: 'ASPIRATIONAL',
    access: 'Authenticated',
    request: undefined,
    response: undefined,
    errors: [],
    notes: ['Belum ada kode; terblokir kredensial cloud Supabase.'],
    evidence: ['docs/07_API_ENDPOINTS.md §2.1', 'docs/implementation/POST_EXECUTION_VERIFICATION.md §2 (N2)'],
  },
  {
    id: 'post-auth-logout',
    method: 'POST',
    path: '/api/v1/auth/logout',
    domain: 'authentication',
    name: 'Logout',
    summary: 'Mengakhiri sesi pengguna (dokumentasi 07 §2.1).',
    status: 'ASPIRATIONAL',
    access: 'Authenticated',
    request: undefined,
    response: undefined,
    errors: [],
    notes: ['Belum ada kode; terblokir kredensial cloud Supabase.'],
    evidence: ['docs/07_API_ENDPOINTS.md §2.1', 'docs/implementation/POST_EXECUTION_VERIFICATION.md §2 (N2)'],
  },

  // ── MEMBER (deferred) ──────────────────────────────────────────────────────
  {
    id: 'get-member-dashboard',
    method: 'GET',
    path: '/api/v1/member/dashboard',
    domain: 'member',
    name: 'Dashboard Anggota',
    summary: 'Data agregat (jadwal, point ledger, referral) — dokumentasi 07 §2.2.',
    status: 'DEFERRED',
    access: 'Authenticated (Learner/Edu/Inst)',
    request: undefined,
    response: undefined,
    errors: [],
    notes: ['Belum ada kode; pasca-MVP.'],
    evidence: ['docs/07_API_ENDPOINTS.md §2.2', 'docs/implementation/POST_EXECUTION_VERIFICATION.md §2 (N4)'],
  },
  {
    id: 'get-member-progress-reports',
    method: 'GET',
    path: '/api/v1/member/progress-reports',
    domain: 'member',
    name: 'Laporan Perkembangan',
    summary: 'Laporan perkembangan Rabbani anak (dokumentasi 07 §2.2).',
    status: 'DEFERRED',
    access: 'Authenticated (Learner/Guardian)',
    request: undefined,
    response: undefined,
    errors: [],
    notes: ['Belum ada kode; pasca-MVP.'],
    evidence: ['docs/07_API_ENDPOINTS.md §2.2', 'docs/implementation/POST_EXECUTION_VERIFICATION.md §2 (N4)'],
  },

  // ── COURSES / LMS (deferred) ───────────────────────────────────────────────
  {
    id: 'courses-list',
    method: 'GET',
    path: '/api/v1/courses',
    domain: 'courses',
    name: 'Katalog Program',
    summary: 'Katalog program belajar & kurikulum (dokumentasi 07 §2.4).',
    status: 'DEFERRED',
    access: 'Public',
    request: undefined,
    response: undefined,
    errors: [],
    notes: [
      'Belum ada route API. `course_catalogs` (9 entri) sudah tersedia di database via seed.',
      'Fungsi katalog saat ini disajikan via halaman landing (`/`), bukan API.',
    ],
    evidence: ['docs/07_API_ENDPOINTS.md §2.4', 'docs/implementation/POST_EXECUTION_VERIFICATION.md §2 (N4)'],
  },
  {
    id: 'courses-create',
    method: 'POST',
    path: '/api/v1/courses',
    domain: 'courses',
    name: 'Buat Program',
    summary: 'Membuat kurikulum/modul materi baru (dokumentasi 07 §2.4).',
    status: 'DEFERRED',
    access: 'Educator / Institution',
    request: undefined,
    response: undefined,
    errors: [],
    notes: ['Belum ada kode; pasca-MVP.'],
    evidence: ['docs/07_API_ENDPOINTS.md §2.4', 'docs/implementation/POST_EXECUTION_VERIFICATION.md §2 (N4)'],
  },
  {
    id: 'post-lms-attendance',
    method: 'POST',
    path: '/api/v1/lms/attendance',
    domain: 'courses',
    name: 'Presensi Sesi',
    summary: 'Catat presensi sesi mengajar (dokumentasi 07 §2.4).',
    status: 'DEFERRED',
    access: 'Educator',
    request: undefined,
    response: undefined,
    errors: [],
    notes: ['Belum ada kode; pasca-MVP.'],
    evidence: ['docs/07_API_ENDPOINTS.md §2.4', 'docs/implementation/POST_EXECUTION_VERIFICATION.md §2 (N4)'],
  },
  {
    id: 'post-lms-progress-report',
    method: 'POST',
    path: '/api/v1/lms/progress-report',
    domain: 'courses',
    name: 'Laporan Perkembangan',
    summary: 'Laporan perkembangan hafalan/talaqqi (dokumentasi 07 §2.4).',
    status: 'DEFERRED',
    access: 'Educator',
    request: undefined,
    response: undefined,
    errors: [],
    notes: ['Belum ada kode; pasca-MVP.'],
    evidence: ['docs/07_API_ENDPOINTS.md §2.4', 'docs/implementation/POST_EXECUTION_VERIFICATION.md §2 (N4)'],
  },
  {
    id: 'get-lms-external-sso',
    method: 'GET',
    path: '/api/v1/lms/external-sso',
    domain: 'courses',
    name: 'SSO LMS Eksternal',
    summary: 'SSO Token ke LearnHouse / Moodle LMS (dokumentasi 07 §2.4).',
    status: 'DEFERRED',
    access: 'Authenticated Member',
    request: undefined,
    response: undefined,
    errors: [],
    notes: ['Belum ada kode; pasca-MVP.'],
    evidence: ['docs/07_API_ENDPOINTS.md §2.4', 'docs/implementation/POST_EXECUTION_VERIFICATION.md §2 (N4)'],
  },

  // ── REFERRALS (deferred) ───────────────────────────────────────────────────
  {
    id: 'post-referrals-generate-code',
    method: 'POST',
    path: '/api/v1/referrals/generate-code',
    domain: 'referrals',
    name: 'Generate Kode Referral',
    summary: 'Membuat kode/link referral baru (dokumentasi 07 §2.7).',
    status: 'DEFERRED',
    access: 'Authenticated Member',
    request: undefined,
    response: undefined,
    errors: [],
    notes: ['Belum ada kode; pasca-MVP.'],
    evidence: ['docs/07_API_ENDPOINTS.md §2.7', 'docs/implementation/POST_EXECUTION_VERIFICATION.md §2 (N4)'],
  },
  {
    id: 'get-referrals-stats',
    method: 'GET',
    path: '/api/v1/referrals/stats',
    domain: 'referrals',
    name: 'Statistik Referral',
    summary: 'Statistik klik, konversi, & komisi virtual (dokumentasi 07 §2.7).',
    status: 'DEFERRED',
    access: 'Authenticated Member',
    request: undefined,
    response: undefined,
    errors: [],
    notes: ['Belum ada kode; pasca-MVP.'],
    evidence: ['docs/07_API_ENDPOINTS.md §2.7', 'docs/implementation/POST_EXECUTION_VERIFICATION.md §2 (N4)'],
  },
  {
    id: 'get-referrals-leaderboard',
    method: 'GET',
    path: '/api/v1/referrals/leaderboard',
    domain: 'referrals',
    name: 'Leaderboard Ambassador',
    summary: 'Papan peringkat ambassador terbanyak (dokumentasi 07 §2.7).',
    status: 'DEFERRED',
    access: 'Public',
    request: undefined,
    response: undefined,
    errors: [],
    notes: ['Belum ada kode; pasca-MVP.'],
    evidence: ['docs/07_API_ENDPOINTS.md §2.7', 'docs/implementation/POST_EXECUTION_VERIFICATION.md §2 (N4)'],
  },

  // ── MANAGEMENT (deferred) ──────────────────────────────────────────────────
  {
    id: 'management-cms-articles',
    method: 'GET',
    path: '/api/v1/management/cms/articles',
    domain: 'management',
    name: 'Manajemen CMS',
    summary: 'Manajemen konten artikel & landing page (dokumentasi 07 §2.8).',
    status: 'DEFERRED',
    access: 'Founder / CMS Admin',
    request: undefined,
    response: undefined,
    errors: [],
    notes: ['Belum ada kode; pasca-MVP.'],
    evidence: ['docs/07_API_ENDPOINTS.md §2.8', 'docs/implementation/POST_EXECUTION_VERIFICATION.md §2 (N4)'],
  },
  {
    id: 'management-erp-ledger-summary',
    method: 'GET',
    path: '/api/v1/management/erp/ledger-summary',
    domain: 'management',
    name: 'Ringkasan Ledger ERP',
    summary: 'Pengawasan pembukuan ledger & fee platform (dokumentasi 07 §2.8).',
    status: 'DEFERRED',
    access: 'Founder / Finance',
    request: undefined,
    response: undefined,
    errors: [],
    notes: ['Belum ada kode; pasca-MVP.'],
    evidence: ['docs/07_API_ENDPOINTS.md §2.8', 'docs/implementation/POST_EXECUTION_VERIFICATION.md §2 (N4)'],
  },
  {
    id: 'management-rbac-roles',
    method: 'GET',
    path: '/api/v1/management/rbac/roles',
    domain: 'management',
    name: 'Matriks RBAC',
    summary: 'Manajemen matriks hak akses user (dokumentasi 07 §2.8).',
    status: 'DEFERRED',
    access: 'Founder Admin',
    request: undefined,
    response: undefined,
    errors: [],
    notes: ['Belum ada kode; pasca-MVP.'],
    evidence: ['docs/07_API_ENDPOINTS.md §2.8', 'docs/implementation/POST_EXECUTION_VERIFICATION.md §2 (N4)'],
  },
  {
    id: 'management-verification-queue',
    method: 'GET',
    path: '/api/v1/management/verification/queue',
    domain: 'management',
    name: 'Queue Verifikasi (API)',
    summary: 'Queue audit 4-lapis Lajnah & approval badge (dokumentasi 07 §2.8).',
    status: 'DEFERRED',
    access: 'Lajnah Verifier / Founder',
    request: undefined,
    response: undefined,
    errors: [],
    notes: [
      'Belum ada route API. Fungsi setara disajikan sebagai halaman server-rendered `/management/lajnah` (listVerificationQueue, DB-backed; terverifikasi).',
    ],
    evidence: ['docs/07_API_ENDPOINTS.md §2.8', 'docs/implementation/POST_EXECUTION_VERIFICATION.md §1 (V12)'],
  },
  {
    id: 'management-taxonomy',
    method: 'GET',
    path: '/api/v1/management/taxonomy',
    domain: 'management',
    name: 'Tata Kelola Taksonomi',
    summary: 'Hirarki kategori, Mazhab, Sanad Tree (dokumentasi 07 §2.8).',
    status: 'DEFERRED',
    access: 'Founder / Admin',
    request: undefined,
    response: undefined,
    errors: [],
    notes: ['Belum ada kode; pasca-MVP.'],
    evidence: ['docs/07_API_ENDPOINTS.md §2.8', 'docs/implementation/POST_EXECUTION_VERIFICATION.md §2 (N4)'],
  },
  {
    id: 'economy-balance',
    method: 'GET',
    path: '/api/v1/economy/balance',
    domain: 'economy',
    name: 'Balance Proyeksi (Poin Saya)',
    summary: 'Proyeksi saldo Poin dari ledger append-only (SELF-scoped).',
    status: 'VERIFIED',
    access: 'Member (SELF)',
    request: undefined,
    response: {
      successCode: 200,
      envelope: SUCCESS_ENVELOPE_NOTE,
      dataFields: [
        { name: 'accountOwnerId', type: 'uuid', required: true, description: 'Akun yang diproyeksikan' },
        { name: 'currency', type: 'string', required: true, description: "'POINT'" },
        { name: 'balance.totalPoints', type: 'int', required: true, description: 'Saldo Poin (proyeksi ledger)' },
      ],
      note: 'Menyertakan disclaimer: Poin internal platform — non-tunai dan tidak dapat ditarik.',
    },
    errors: [{ code: 401, label: 'AUTH', description: 'Tidak ada identity server.' }],
    notes: ['Ledger adalah sumber kebenaran; saldo adalah proyeksi. Runtime: learner 200, unauth 401.'],
    evidence: ['src/app/api/v1/economy/balance/route.ts', 'src/lib/ledger/service.ts'],
  },
  {
    id: 'economy-transactions',
    method: 'GET',
    path: '/api/v1/economy/transactions',
    domain: 'economy',
    name: 'Transaksi Ekonomi',
    summary: 'Riwayat transaksi (SELF default; ?organizationId org-scoped untuk ORG_OWNER/ADMIN).',
    status: 'VERIFIED',
    access: 'Member (SELF) / ORG_OWNER, ORG_ADMIN (org)',
    request: { query: [{ name: 'organizationId', type: 'uuid', required: false, description: 'Scope organisasi (org-scoped read)' }] },
    response: {
      successCode: 200,
      envelope: SUCCESS_ENVELOPE_NOTE,
      dataFields: [
        { name: 'scope', type: 'string', required: true, description: "'SELF' | 'ORGANIZATION'" },
        { name: 'transactions', type: 'array', required: true, description: 'Daftar EconomicTransaction' },
      ],
    },
    errors: [{ code: 403, label: 'FORBIDDEN', description: 'Cross-org / bukan member aktif.' }],
    notes: ['Runtime: learner SELF 200, cross-org 403, org admin org-scoped 200.'],
    evidence: ['src/app/api/v1/economy/transactions/route.ts', 'src/lib/economy/service.ts'],
  },
  {
    id: 'economy-ledger',
    method: 'GET',
    path: '/api/v1/economy/ledger',
    domain: 'economy',
    name: 'Entri Ledger (SELF)',
    summary: 'Entri ledger append-only milik member yang terautentikasi.',
    status: 'VERIFIED',
    access: 'Member (SELF)',
    request: undefined,
    response: {
      successCode: 200,
      envelope: SUCCESS_ENVELOPE_NOTE,
      dataFields: [
        { name: 'accountOwnerId', type: 'uuid', required: true, description: 'Pemilik ledger' },
        { name: 'entries', type: 'array', required: true, description: 'Entri append-only' },
      ],
    },
    errors: [{ code: 401, label: 'AUTH', description: 'Tidak ada identity server.' }],
    notes: ['Runtime: learner 200 (2 entries).'],
    evidence: ['src/app/api/v1/economy/ledger/route.ts'],
  },
  {
    id: 'management-economy-overview',
    method: 'GET',
    path: '/api/v1/management/economy/overview',
    domain: 'management',
    name: 'Overview Ekonomi (Founder)',
    summary: 'Monitoring Founder: total transaksi, ledger, poin beredar, payment health, komisi.',
    status: 'VERIFIED',
    access: 'Founder (economy.transaction.view)',
    request: undefined,
    response: {
      successCode: 200,
      envelope: SUCCESS_ENVELOPE_NOTE,
      dataFields: [
        { name: 'overview.transactionCount', type: 'int', required: true, description: 'Total transaksi' },
        { name: 'overview.totalPointsInCirculation', type: 'int', required: true, description: 'Poin beredar (proyeksi)' },
        { name: 'payment.mode', type: 'string', required: true, description: "'SIMULATED_INTERNAL'" },
      ],
    },
    errors: [{ code: 403, label: 'FORBIDDEN', description: 'Tidak memiliki economy.transaction.view.' }],
    notes: ['Runtime: founder 200, staff 403.'],
    evidence: ['src/app/api/v1/management/economy/overview/route.ts'],
  },
  {
    id: 'management-economy-adjustments',
    method: 'POST',
    path: '/api/v1/management/economy/adjustments',
    domain: 'management',
    name: 'Penyesuaian Ekonomi (Founder)',
    summary: 'ADJUSTMENT founder dengan reason wajib + authorization + audit (economy.adjust).',
    status: 'VERIFIED',
    access: 'Founder-only (economy.adjust)',
    request: {
      body: [
        { name: 'accountOwnerId', type: 'uuid', required: true, description: 'Target akun' },
        { name: 'amount', type: 'int', required: true, description: 'Jumlah (signed, integer)' },
        { name: 'reason', type: 'string', required: true, description: 'Alasan wajib' },
      ],
      bodySchema: 'AdjustmentSchema',
    },
    response: {
      successCode: 201,
      envelope: SUCCESS_ENVELOPE_NOTE,
      dataFields: [
        { name: 'transactionId', type: 'uuid', required: true, description: 'ADJUSTMENT transaction' },
        { name: 'status', type: 'string', required: true, description: "'COMPLETED'" },
        { name: 'duplicate', type: 'boolean', required: true, description: 'Idempotency indicator' },
      ],
    },
    errors: [{ code: 403, label: 'FORBIDDEN', description: 'economy.adjust founder-only.' }],
    notes: ['Runtime: founder 201 COMPLETED, staff 403. Idempotent per key.'],
    evidence: ['src/app/api/v1/management/economy/adjustments/route.ts', 'src/lib/economy/service.ts'],
  },
  {
    id: 'management-economy-reversals',
    method: 'POST',
    path: '/api/v1/management/economy/reversals',
    domain: 'management',
    name: 'Reversal Transaksi (Founder)',
    summary: 'REVERSAL transaksi COMPLETED dengan reason wajib + audit (economy.reversal).',
    status: 'VERIFIED',
    access: 'Founder-only (economy.reversal)',
    request: {
      body: [
        { name: 'transactionId', type: 'uuid', required: true, description: 'Transaksi target (COMPLETED)' },
        { name: 'reason', type: 'string', required: true, description: 'Alasan wajib' },
      ],
      bodySchema: 'ReversalSchema',
    },
    response: {
      successCode: 201,
      envelope: SUCCESS_ENVELOPE_NOTE,
      dataFields: [
        { name: 'transactionId', type: 'uuid', required: true, description: 'Transaksi asli (REVERSED)' },
        { name: 'reversalTransactionId', type: 'uuid', required: true, description: 'Transaksi REVERSAL baru' },
        { name: 'status', type: 'string', required: true, description: "'REVERSED'" },
      ],
    },
    errors: [{ code: 403, label: 'FORBIDDEN', description: 'economy.reversal founder-only.' }],
    notes: ['Runtime: founder 201 REVERSED, duplicate deterministic reject, staff 403.'],
    evidence: ['src/app/api/v1/management/economy/reversals/route.ts', 'src/lib/economy/service.ts'],
  },
  {
    id: 'payments-webhook',
    method: 'POST',
    path: '/api/v1/payments/webhook',
    domain: 'payments',
    name: 'Webhook Pembayaran (Mock)',
    summary: 'Webhook provider mock: verifikasi HMAC signature + idempotent; PAID → domain transaction.',
    status: 'VERIFIED',
    access: 'Provider (signature header x-mock-signature)',
    request: {
      body: [
        { name: 'eventId', type: 'string', required: true, description: 'ID event unik (idempotency)' },
        { name: 'bookingId', type: 'uuid', required: true, description: 'Booking terkait' },
        { name: 'amount', type: 'int', required: true, description: 'Jumlah' },
        { name: 'status', type: 'string', required: true, description: "'PAID' | 'REFUNDED' | 'EXPIRED' | 'FAILED'" },
      ],
      bodySchema: 'WebhookPayload',
      note: 'Header x-mock-signature = HMAC-SHA256(payload, PAYMENT_MOCK_SECRET).',
    },
    response: {
      successCode: 200,
      envelope: SUCCESS_ENVELOPE_NOTE,
      dataFields: [
        { name: 'paymentId', type: 'uuid', required: true, description: 'Payment boundary record' },
        { name: 'paymentStatus', type: 'string', required: true, description: "'PAID'" },
        { name: 'transactionId', type: 'uuid | null', required: true, description: 'Domain transaction (PAID only)' },
        { name: 'duplicate', type: 'boolean', required: true, description: 'Duplicate webhook indicator' },
        { name: 'mode', type: 'string', required: true, description: "'SIMULATED_INTERNAL'" },
      ],
    },
    errors: [
      { code: 401, label: 'SIGNATURE', description: 'HMAC signature tidak valid.' },
      { code: 400, label: 'VALIDATION', description: 'Payload/status tidak valid.' },
      { code: 503, label: 'DISABLED', description: 'Mock webhook dinonaktifkan di production tanpa PAYMENT_MOCK_SECRET eksplisit.' },
    ],
    notes: ['Runtime: valid 200, duplicate dup:true (satu efek), forged 401, tanpa persistensi.'],
    evidence: ['src/app/api/v1/payments/webhook/route.ts', 'src/lib/payment/service.ts', 'src/lib/payment/mockAdapter.ts'],
  },
];

export interface DomainInfo {
  id: DomainId;
  label: string;
  description: string;
}

export const DOMAINS: DomainInfo[] = [
  { id: 'educators', label: 'Educators', description: 'Direktori pendidik, profil & sanad.' },
  { id: 'verification', label: 'Verification', description: 'Pipeline verifikasi kredensial & sanad 4-lapis.' },
  { id: 'bookings', label: 'Bookings', description: 'Booking inquiry & konfirmasi (virtual ledger).' },
  { id: 'authentication', label: 'Authentication', description: 'Auth & sesi (aspirational — Supabase terblokir).' },
  { id: 'member', label: 'Member', description: 'Dashboard & laporan anggota.' },
  { id: 'courses', label: 'Courses / LMS', description: 'Katalog program & modul LMS.' },
  { id: 'referrals', label: 'Referrals', description: 'Kode referral, statistik & leaderboard.' },
  { id: 'management', label: 'Management', description: 'CMS, ERP, RBAC, taksonomi & queue.' },
  { id: 'economy', label: 'Economy', description: 'Internal economy: balance, transaksi, ledger.' },
  { id: 'payments', label: 'Payments', description: 'External payment boundary (webhook mock).' },
];

export interface DocumentedCapability {
  id: string;
  name: string;
  documentedIn: string;
  status: EndpointStatus;
  description: string;
  runtimeState: string;
}

export const CAPABILITIES: DocumentedCapability[] = [
  {
    id: 'supabase-auth-rbac',
    name: 'Supabase Auth & RBAC',
    documentedIn: 'docs/07_API_ENDPOINTS.md §1',
    status: 'ASPIRATIONAL',
    description: 'Proteksi route API via Supabase Auth RBAC.',
    runtimeState:
      'Belum ada. Role diresolusi server-side (DEMO_LEARNER_USER_ID, DEMO_EDUCATOR_ID, LAJNAH verifier) hingga kredensial cloud tersedia.',
  },
  {
    id: 'upstash-rate-limit',
    name: 'Upstash Redis Rate Limiter',
    documentedIn: 'docs/07_API_ENDPOINTS.md §4',
    status: 'ASPIRATIONAL',
    description: 'Rate limit per IP / user (60/menit public, 5/menit verification, 3/menit auth).',
    runtimeState: 'Belum ada middleware rate limit; terblokir kredensial cloud Upstash.',
  },
];

export const DRIFT_NOTES: string[] = [
  'Envelope sukses tidak memuat `meta` (07 §1.1).',
  'Error envelope 400 memuat `details[]`; error bisnis hanya `{ success, statusCode, message }` (07 §1.2).',
  '`X-Verifier-Role` header (OpenAPI) vs `verifierRoles` payload (runtime) — kontradiksi tercatat di docs/audit/CONTRACT_DRIFT_REPORT.md §2.3.',
  '`qiraahType` semantic drift (Quran-anchored) — DECISION REQUIRED Founder.',
  'Auth Supabase + Upstash rate limit = aspirasional (cloud block).',
  'BookingInquirySchema.preferredSchedule: runtime min 3 (07 §3.2 menuliskan min 5).',
];

export function endpointsForDomain(domainId: DomainId): EndpointDetail[] {
  return ENDPOINTS.filter((e) => e.domain === domainId);
}

export function countByStatus(): Record<EndpointStatus, number> {
  const counts: Record<EndpointStatus, number> = {
    VERIFIED: 0,
    IMPLEMENTED: 0,
    DEFERRED: 0,
    ASPIRATIONAL: 0,
    NOT_IMPLEMENTED: 0,
  };
  for (const e of ENDPOINTS) counts[e.status] += 1;
  return counts;
}
