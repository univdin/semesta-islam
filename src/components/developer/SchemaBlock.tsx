import type { SchemaRef } from '@/lib/developer/registry';

export function SchemaBlock({ schema }: { schema: SchemaRef }) {
  return (
    <div className="glass-panel rounded-2xl border border-gray-100 p-5 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="font-mono text-sm font-semibold text-[#0F3D2E]">{schema.name}</h4>
        <code className="text-[11px] px-2 py-1 rounded-lg bg-white/70 border border-gray-200 text-gray-500 font-mono">
          {schema.source}
        </code>
      </div>
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
            {schema.fields.map((f) => (
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
      {schema.note && (
        <p className="text-xs text-gray-500 bg-amber-50/60 border border-amber-200/60 rounded-xl px-3 py-2">
          {schema.note}
        </p>
      )}
    </div>
  );
}
