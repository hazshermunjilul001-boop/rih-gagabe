import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'

type KraRow = {
  id: string
  kra_number: string
  term: string | null
  evidence_type: string | null
  linked_module: string | null
  file_url: string | null
  status: string
  schools: { name: string } | null
}

const statusColors: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700',
  submitted: 'bg-blue-100 text-blue-700',
  returned: 'bg-red-100 text-red-700',
  revised: 'bg-amber-100 text-amber-700',
  validated: 'bg-emerald-100 text-emerald-700',
  consolidated: 'bg-teal-100 text-teal-700',
  archived: 'bg-slate-200 text-slate-500',
}

const termLabels: Record<string, string> = {
  term_1: 'Term 1',
  term_2: 'Term 2',
  term_3: 'Term 3',
  year_end: 'Year-End',
}

export default async function KraPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const { data, error } = await supabase
    .from('kra_evidence')
    .select('id, kra_number, term, evidence_type, linked_module, file_url, status, schools:school_id(name)')
    .order('created_at', { ascending: false })

  const records = (data ?? []) as unknown as KraRow[]

  return (
    <div className="min-h-screen">
      <Navbar role={profile?.role ?? 'viewer'} email={user.email ?? ''} />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">PPSS / KRA Evidence</h1>
            <p className="text-sm text-slate-500">
              Digital portfolio linking evidence files back to KRAs
            </p>
          </div>
          <Link
            href="/kra/new"
            className="rounded-md bg-[#0B6E33] text-white text-sm font-medium px-4 py-2 hover:bg-[#095C2A] transition-colors"
          >
            + New Evidence
          </Link>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          {error && (
            <p className="text-sm text-red-600 p-4">Error loading evidence: {error.message}</p>
          )}

          {!error && records.length === 0 && (
            <p className="text-sm text-slate-500 p-6 text-center">
              No evidence records yet. Click &quot;New Evidence&quot; to add the first one.
            </p>
          )}

          {!error && records.length > 0 && (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium text-slate-600">KRA</th>
                  <th className="px-4 py-3 font-medium text-slate-600">School</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Term</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Evidence Type</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Linked Module</th>
                  <th className="px-4 py-3 font-medium text-slate-600">File</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3 text-slate-900">{r.kra_number}</td>
                    <td className="px-4 py-3 text-slate-600">{r.schools?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {r.term ? termLabels[r.term] ?? r.term : '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{r.evidence_type || '—'}</td>
                    <td className="px-4 py-3 text-slate-600 capitalize">
                      {r.linked_module?.replaceAll('_', ' ') ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      {r.file_url ? (
                        <a
                          href={r.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#0B6E33] hover:underline text-xs"
                        >
                          View File
                        </a>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          statusColors[r.status] ?? 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}