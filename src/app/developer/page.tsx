import type { Metadata } from 'next';
import { ShieldCheck, BookOpen, Code2, FileJson, Info } from 'lucide-react';
import pkg from '../../../package.json';
import {
  CAPABILITIES,
  DOMAINS,
  DRIFT_NOTES,
  ENDPOINTS,
  ENDPOINT_STATUSES,
  SCHEMAS,
  VERIFICATION_TRANSITIONS,
  countByStatus,
  endpointsForDomain,
} from '@/lib/developer/registry';
import { StatusBadge } from '@/components/developer/StatusBadge';
import { EndpointBlock } from '@/components/developer/EndpointBlock';
import { SchemaBlock } from '@/components/developer/SchemaBlock';
import { USER_ROLES, VERIFICATION_STATUSES, LEARNING_METHODS, BOOKING_STATUSES, LEDGER_ENTRY_TYPES } from '@/lib/developer/registry';

export const metadata: Metadata = {
  title: 'Developer API Reference — ILMIFY',
  description:
    'Referensi API read-only SEMESTA ISLAM yang mencerminkan kondisi implementasi aktual, bukan kontrak aspirasional.',
  openGraph: {
    title: 'Developer API Reference — ILMIFY',
    description:
      'Dokumentasi API, skema, dan status implementasi teknis SEMESTA ISLAM.',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Developer API Reference — ILMIFY',
      },
    ],
  },
};

const NAV = [
  { id: 'overview', label: 'Overview' },
  { id: 'api-reference', label: 'API Reference' },
  { id: 'schemas', label: 'Schemas' },
  { id: 'implementation-status', label: 'Implementation Status' },
];

const ENUMS = [
  { label: 'UserRole', values: USER_ROLES },
  { label: 'VerificationStatus', values: VERIFICATION_STATUSES },
  { label: 'LearningMethod', values: LEARNING_METHODS },
  { label: 'BookingStatus', values: BOOKING_STATUSES },
  { label: 'LedgerEntryType', values: LEDGER_ENTRY_TYPES },
];

const STACK = [
  { label: 'Next.js', version: pkg.dependencies.next },
  { label: 'React', version: pkg.dependencies.react },
  { label: 'TypeScript', version: pkg.devDependencies.typescript },
  { label: 'Prisma', version: pkg.dependencies['@prisma/client'] },
  { label: 'Zod', version: pkg.dependencies.zod },
];

export default function DeveloperPage() {
  const counts = countByStatus();
  const total = ENDPOINTS.length;

  return (
    <main className="main-content pt-20">
      <div className="container py-8">
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="bg-[#0F3D2E] text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5" /> Developer Documentation
            </span>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Read-Only Reference
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#0F3D2E] tracking-tight">API Reference</h1>
          <p className="text-sm text-gray-500 mt-2 max-w-3xl">
            Referensi endpoint, skema, dan status implementasi SEMESTA ISLAM. Halaman ini{' '}
            <span className="font-semibold text-[#0F3D2E]">mendokumentasikan sistem yang benar-benar ada</span>,
            bukan kontrak yang diharapkan ada. Tidak ada eksekusi request, API key, autentikasi, atau integrasi cloud.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="text-xs px-2.5 py-1 rounded-full bg-white/70 border border-gray-200 text-gray-600">
              App v{pkg.version}
            </span>
            {STACK.map((s) => (
              <span key={s.label} className="text-xs px-2.5 py-1 rounded-full bg-white/70 border border-gray-200 text-gray-600 font-mono">
                {s.label} {s.version}
              </span>
            ))}
          </div>
        </header>

        {/* Mobile nav */}
        <nav className="lg:hidden flex gap-2 overflow-x-auto pb-3 -mx-1 px-1 mb-4" aria-label="Sections">
          {NAV.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="tag-chip shrink-0"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
          {/* Sidebar nav */}
          <aside className="hidden lg:block">
            <nav className="sticky top-24 space-y-1 text-sm" aria-label="Developer sections">
              {NAV.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="block px-3 py-2 rounded-xl text-gray-600 hover:bg-white/70 hover:text-[#0F3D2E] transition-colors"
                >
                  {item.label}
                </a>
              ))}
              <div className="pt-3 mt-3 border-t border-gray-200 space-y-1">
                {DOMAINS.filter((d) => endpointsForDomain(d.id).length > 0).map((d) => (
                  <a
                    key={d.id}
                    href={`#domain-${d.id}`}
                    className="block px-3 py-1.5 rounded-xl text-gray-500 hover:bg-white/70 hover:text-[#0F3D2E] transition-colors"
                  >
                    {d.label}
                  </a>
                ))}
              </div>
            </nav>
          </aside>

          {/* Content */}
          <div className="space-y-14 min-w-0">
            {/* ── Overview ── */}
            <section id="overview" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-5 h-5 text-[#D4AF37]" />
                <h2 className="text-xl font-bold text-[#0F3D2E]">Overview</h2>
              </div>
              <div className="glass-panel rounded-2xl border border-gray-100 p-5 space-y-3 text-sm text-gray-600">
                <p>
                  Semua route API dibangun di atas <code className="font-mono text-[#0F3D2E]">/app/api/v1/**</code> dengan
                  validasi Zod dan ditulis ke PostgreSQL 16 (Prisma 6) dalam transaksi, termasuk jejak audit
                  (<code className="font-mono text-[#0F3D2E]">audit_logs</code>).
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    <span className="font-semibold text-[#0F3D2E]">Status VERIFIED</span> = endpoint terverifikasi
                    secara empiris pada audit terakhir terhadap fresh database (lihat{' '}
                    <code className="font-mono">docs/implementation/POST_EXECUTION_VERIFICATION.md</code>).
                  </li>
                  <li>
                    Status selain <span className="font-semibold text-[#0F3D2E]">VERIFIED</span> menunjukkan endpoint
                    yang terdokumentasi namun <span className="font-semibold text-[#0F3D2E]">tidak</span> berfungsi
                    sebagai route API saat ini (deferred / aspirasional).
                  </li>
                  <li>
                    Klaim autentikasi (Supabase Auth RBAC) dan rate limit (Upstash) pada{' '}
                    <code className="font-mono">docs/07_API_ENDPOINTS.md</code> bersifat aspirasional; terblokir
                    kredensial cloud. Identity saat ini diresolusi server-side (demo).
                  </li>
                </ul>
                <div className="pt-1">
                  <p className="font-semibold text-[#0F3D2E] mb-1.5">Drift kontrak yang tercatat:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    {DRIFT_NOTES.map((note, i) => (
                      <li key={i}>{note}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* ── API Reference ── */}
            <section id="api-reference" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-[#D4AF37]" />
                <h2 className="text-xl font-bold text-[#0F3D2E]">API Reference</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-mono">{total} endpoints</span>
              </div>

              {DOMAINS.filter((d) => endpointsForDomain(d.id).length > 0).map((domain) => (
                <div key={domain.id} id={`domain-${domain.id}`} className="scroll-mt-24 mb-8">
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <h3 className="text-base font-bold text-[#0F3D2E]">{domain.label}</h3>
                    <span className="text-xs text-gray-400">{endpointsForDomain(domain.id).length} endpoint</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">{domain.description}</p>
                  <div className="space-y-3">
                    {endpointsForDomain(domain.id).map((endpoint) => (
                      <EndpointBlock key={endpoint.id} endpoint={endpoint} />
                    ))}
                  </div>
                </div>
              ))}
            </section>

            {/* ── Schemas ── */}
            <section id="schemas" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-4">
                <FileJson className="w-5 h-5 text-[#D4AF37]" />
                <h2 className="text-xl font-bold text-[#0F3D2E]">Schemas</h2>
              </div>

              <h3 className="text-sm font-semibold text-gray-600 mb-3">Zod Validation Schemas</h3>
              <div className="space-y-4 mb-8">
                {SCHEMAS.map((schema) => (
                  <SchemaBlock key={schema.name} schema={schema} />
                ))}
              </div>

              <h3 className="text-sm font-semibold text-gray-600 mb-3">State Machine — Verification</h3>
              <div className="glass-panel rounded-2xl border border-gray-100 p-4 mb-8">
                <div className="flex flex-wrap gap-2">
                  {Object.entries(VERIFICATION_TRANSITIONS).map(([from, to]) => (
                    <span key={from} className="text-xs px-3 py-1.5 rounded-xl bg-white/70 border border-gray-200 font-mono text-[#0F3D2E]">
                      {from} → [{to.join(', ')}]
                    </span>
                  ))}
                </div>
              </div>

              <h3 className="text-sm font-semibold text-gray-600 mb-3">Domain Enums</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ENUMS.map((e) => (
                  <div key={e.label} className="glass-panel rounded-2xl border border-gray-100 p-4 space-y-2">
                    <h4 className="font-mono text-xs font-semibold text-gray-500 uppercase tracking-wide">{e.label}</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {e.values.map((v) => (
                        <span key={v} className="text-[11px] px-2 py-1 rounded-full bg-white/70 border border-gray-200 font-mono text-gray-600">
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Implementation Status ── */}
            <section id="implementation-status" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
                <h2 className="text-xl font-bold text-[#0F3D2E]">Implementation Status</h2>
              </div>

              <h3 className="text-sm font-semibold text-gray-600 mb-3">Status Legend</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {ENDPOINT_STATUSES.map((s) => (
                  <div key={s.status} className="glass-panel rounded-2xl border border-gray-100 p-4 flex items-start gap-3">
                    <StatusBadge status={s.status} />
                    <p className="text-xs text-gray-600 pt-1">{s.description}</p>
                  </div>
                ))}
              </div>

              <h3 className="text-sm font-semibold text-gray-600 mb-3">
                Endpoint Matrix{' '}
                <span className="text-gray-400 font-normal">
                  ({counts.VERIFIED} verified · {counts.DEFERRED} deferred · {counts.ASPIRATIONAL} aspirational)
                </span>
              </h3>
              <div className="overflow-x-auto rounded-2xl border border-gray-200 mb-8">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-4 py-2.5 font-semibold">Endpoint</th>
                      <th className="px-4 py-2.5 font-semibold">Method</th>
                      <th className="px-4 py-2.5 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white/50">
                    {[...ENDPOINTS]
                      .sort((a, b) => a.path.localeCompare(b.path))
                      .map((e) => (
                        <tr key={e.id}>
                          <td className="px-4 py-2.5 font-mono text-[13px] text-[#0F3D2E]">
                            <a href={`#${e.id}`} className="hover:underline">
                              {e.path}
                            </a>
                          </td>
                          <td className="px-4 py-2.5 font-mono text-[12px] text-gray-500">{e.method}</td>
                          <td className="px-4 py-2.5">
                            <StatusBadge status={e.status} />
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              <h3 className="text-sm font-semibold text-gray-600 mb-3">Non-Endpoint Capabilities (Aspirational)</h3>
              <div className="space-y-3">
                {CAPABILITIES.map((cap) => (
                  <div key={cap.id} className="glass-panel rounded-2xl border border-gray-100 p-4 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-bold text-[#0F3D2E]">{cap.name}</h4>
                      <StatusBadge status={cap.status} />
                      <code className="text-[11px] px-2 py-0.5 rounded-lg bg-white/70 border border-gray-200 text-gray-500 font-mono">
                        {cap.documentedIn}
                      </code>
                    </div>
                    <p className="text-xs text-gray-600">{cap.description}</p>
                    <p className="text-xs text-gray-500">
                      <span className="font-semibold text-[#0F3D2E]">Runtime:</span> {cap.runtimeState}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
