import type { EndpointStatus } from '@/lib/developer/registry';

const STATUS_STYLES: Record<EndpointStatus, string> = {
  VERIFIED: 'bg-emerald-100 text-emerald-800',
  IMPLEMENTED: 'bg-teal-100 text-teal-800',
  DEFERRED: 'bg-amber-100 text-amber-800',
  ASPIRATIONAL: 'bg-sky-100 text-sky-800',
  NOT_IMPLEMENTED: 'bg-gray-100 text-gray-700',
};

export function StatusBadge({ status }: { status: EndpointStatus }) {
  return (
    <span
      className={`inline-flex items-center text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}
