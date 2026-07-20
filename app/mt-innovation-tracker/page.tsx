import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'

type InnovationRow = {
  id: string
  title: string
  proponent_name: string
  current_stage: string
  status: string
  school_year: string
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

const stageLabels: Record<string, string> = {
  A: 'A · Orientation',
  B: 'B · Gap Analysis',
  C: 'C · Concept Note',
  D: 'D · Reviewed Proposal',
  E: 'E · Alignment Matrix',
  F: 'F · District Inventory',
  G: 'G · Implementation Log',
  H: 'H · Monitoring/TA',
  I: 'I · Refined Package',
  J: 'J · Term 2 Report',
  K: 'K · Shortlisting',
  L: 'L · Portfolio/Deck',
  M: 'M · Validation',
  N: 'N · Pre-Summit',
  O: 'O · Final Presenters',
  P: 'P · Summit',
  Q: 'Q · Replication Plan',
}

export default async function MtInnovationTrackerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const { data, error } = await supabase
    .from('mt_innovations')
    .select('id, title, proponent_name, current_stage, status, school_year, schools(name)')
    .order('created_at', { ascending: false })

  const innovations = (data ?? []) as unknown as InnovationRow[]

  return (
    <div className="min-h-screen">
      <Navbar role={profile?.role ?? 'viewer'} email={user.email ?? ''} />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              Master Teachers&apos; Instructional Innovation Tracker
            </h1>
            <p className="text-sm text-slate-500">
              Three-Term School Calendar, SY 2026–2027 — Attachments A through Q
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/mt-innovation-tracker/new"
              className="rounded-md bg-[#0B6E33] text-white text-sm font-medium px-4 py-2 hover:bg-[#095C2A] transition-colors"
            >
              + New Concept Note
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          {error && (
            <p className="text-sm text-red-600 p-4">Error loading innovations: {error.message}</p>
          )}

          {!error && innovations.length === 0 && (
            <p className="text-sm text-slate-500 p-6 text-center">
              No innovations yet. Click &quot;New Concept Note&quot; to add the first one.
            </p>
          )}

          {!error && innovations.length > 0 && (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium text-slate-600">Title</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Proponent</th>
                  <th className="px-4 py-3 font-medium text-slate-600">School</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Current Stage</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Status</th>
                  <th className="px-4 py-3 font-medium text-slate-600">SY</th>
                </tr>
              </thead>
              <tbody>
                {innovations.map((i) => (
                  <tr key={i.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3 text-slate-900">{i.title}</td>
                    <td className="px-4 py-3 text-slate-600">{i.proponent_name}</td>
                    <td className="px-4 py-3 text-slate-600">{i.schools?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs">
                      {stageLabels[i.current_stage] ?? i.current_stage}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          statusColors[i.status] ?? 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {i.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{i.school_year}</td>
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