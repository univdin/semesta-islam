import { ChevronDown } from 'lucide-react';
import type { EndpointDetail, EndpointField } from '@/lib/developer/registry';
import { StatusBadge } from './StatusBadge';

const METHOD_STYLES: Record<EndpointDetail['method'], string> = {
  GET: 'bg-sky-600',
  POST: 'bg-emerald-600',
  PUT: 'bg-amber-500',
  DELETE: 'bg-red-600',
};

function FieldTable({ fields, empty }: { fields: EndpointField[]; empty: string }) {
  if (fields.length === 0) {
    return <p className="text-sm text-gray-500 italic">{empty}</p>;
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-3 py-2 font-semibold">Field</th>
            <th className="px-3 py-2 font-semibold">Type</th>
            <th className="px-3 py-2 font-semibold">Wajib</th>
            <th className="px-3 py-2 font-semibold">Deskripsi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {fields.map((f) => (
            <tr key={f.name}>
              <td className="px-3 py-2 font-mono text-[13px] text-[#0F3D2E]">{f.name}</td>
              <td className="px-3 py-2 font-mono text-[12px] text-gray-500">{f.type}</td>
              <td className="px-3 py-2">
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    f.required ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {f.required ? 'Ya' : 'Opsional'}
                </span>
              </td>
              <td className="px-3 py-2 text-gray-600">{f.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ErrorsList({ endpoint }: { endpoint: EndpointDetail }) {
  if (endpoint.errors.length === 0) return null;
  return (
    <div>
      <h5 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">Known Status / Error Codes</h5>
      <div className="flex flex-wrap gap-2">
        {endpoint.errors.map((err) => (
          <div
            key={`${err.code}-${err.label}`}
            className="text-xs rounded-xl border border-gray-200 bg-white/70 px-3 py-2"
            title={err.description}
          >
            <span className="font-bold text-[#0F3D2E]">{err.code}</span>{' '}
            <span className="text-gray-500">{err.label}</span>
            <span className="block text-gray-500 font-normal mt-0.5 max-w-xs">{err.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function EndpointBlock({ endpoint }: { endpoint: EndpointDetail }) {
  return (
    <details id={endpoint.id} className="group glass-panel rounded-2xl border border-gray-100 overflow-hidden">
      <summary className="flex flex-wrap items-center gap-3 p-4 cursor-pointer list-none select-none">
        <span
          className={`w-16 shrink-0 text-center text-xs font-bold py-1 rounded-md text-white ${METHOD_STYLES[endpoint.method]}`}
        >
          {endpoint.method}
        </span>
        <code className="text-sm font-mono font-medium text-[#0F3D2E]">{endpoint.path}</code>
        <span className="ml-auto flex items-center gap-2">
          <StatusBadge status={endpoint.status} />
          <ChevronDown className="w-4 h-4 text-gray-400 transition-transform group-open:rotate-180" />
        </span>
      </summary>

      <div className="px-4 pb-5 space-y-5 border-t border-gray-100">
        <div className="pt-3 space-y-1">
          <h4 className="text-sm font-bold text-[#0F3D2E]">{endpoint.name}</h4>
          <p className="text-sm text-gray-600">{endpoint.summary}</p>
        </div>

        <div className="text-xs text-gray-500">
          <span className="font-semibold text-[#0F3D2E]">Akses / Role:</span> {endpoint.access}
        </div>

        {endpoint.request && (
          <div className="space-y-2">
            <h5 className="text-xs font-bold uppercase tracking-wide text-gray-400">
              Request
              {endpoint.request.bodySchema && (
                <span className="ml-2 font-mono normal-case tracking-normal text-gray-400">
                  Zod: {endpoint.request.bodySchema}
                </span>
              )}
            </h5>
            {endpoint.request.query && (
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-500">Query Parameters</p>
                <FieldTable fields={endpoint.request.query} empty="Tidak ada parameter query." />
              </div>
            )}
            {endpoint.request.body && (
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-500">Request Body</p>
                <FieldTable fields={endpoint.request.body} empty="Tidak ada request body." />
              </div>
            )}
          </div>
        )}

        {endpoint.response && (
          <div className="space-y-2">
            <h5 className="text-xs font-bold uppercase tracking-wide text-gray-400">
              Response — {endpoint.response.successCode}
            </h5>
            <p className="text-xs text-gray-500">{endpoint.response.envelope}</p>
            {endpoint.response.dataFields && (
              <FieldTable fields={endpoint.response.dataFields} empty="Tidak ada data." />
            )}
            {endpoint.response.note && <p className="text-xs text-gray-500">{endpoint.response.note}</p>}
          </div>
        )}

        <ErrorsList endpoint={endpoint} />

        {endpoint.notes && endpoint.notes.length > 0 && (
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">Implementation Notes</h5>
            <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
              {endpoint.notes.map((note, i) => (
                <li key={i}>{note}</li>
              ))}
            </ul>
          </div>
        )}

        {endpoint.evidence && endpoint.evidence.length > 0 && (
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-1.5">Source / Evidence</h5>
            <div className="flex flex-wrap gap-1.5">
              {endpoint.evidence.map((src, i) => (
                <code key={i} className="text-[11px] px-2 py-1 rounded-lg bg-white/70 border border-gray-200 text-gray-500 font-mono">
                  {src}
                </code>
              ))}
            </div>
          </div>
        )}
      </div>
    </details>
  );
}
