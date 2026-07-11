import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import PdfExportButton from '@/components/PdfExportButton'

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  returned: 'Returned',
  revised: 'Revised',
  validated: 'Validated',
  consolidated: 'Consolidated',
  archived: 'Archived',
}

const statusBarColors: Record<string, string> = {
  draft: 'bg-slate-400',
  submitted: 'bg-blue-500',
  returned: 'bg-red-500',
  revised: 'bg-amber-500',
  validated: 'bg-emerald-500',
  consolidated: 'bg-teal-500',
  archived: 'bg-slate-300',
}

const implLabels: Record<string, string> = {
  implemented: 'Implemented',
  partially_implemented: 'Partially Implemented',
  not_yet_implemented: 'Not Yet Implemented',
  suspended: 'Suspended',
  needing_ta: 'Needing TA',
}

const implBarColors: Record<string, string> = {
  implemented: 'bg-emerald-500',
  partially_implemented: 'bg-amber-500',
  not_yet_implemented: 'bg-slate-400',
  suspended: 'bg-red-500',
  needing_ta: 'bg-orange-500',
}

const termLabels: Record<string, string> = {
  term_1: 'Term 1',
  term_2: 'Term 2',
  term_3: 'Term 3',
  year_end: 'Year-End',
}

function countBy<T extends Record<string, unknown>>(rows: T[], key: keyof T) {
  const counts: Record<string, number> = {}
  for (const row of rows) {
    const value = String(row[key] ?? 'unknown')
    counts[value] = (counts[value] ?? 0) + 1
  }
  return counts
}

function SummaryCard({ label, value, accent }: { label: string; value: string | number; accent: string }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-semibold mt-1 ${accent}`}>{value}</p>
    </div>
  )
}

function BreakdownBars({
  title,
  counts,
  labels,
  colors,
  total,
}: {
  title: string
  counts: Record<string, number>
  labels: Record<string, string>
  colors: Record<string, string>
  total: number
}) {
  const entries = Object.entries(counts)

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
      <h2 className="text-sm font-medium text-slate-700 mb-4">{title}</h2>
      {entries.length === 0 ? (
        <p className="text-sm text-slate-400">No data yet</p>
      ) : (
        <div className="space-y-3">
          {entries.map(([key, count]) => {
            const pct = total > 0 ? Math.round((count / total) * 100) : 0
            return (
              <div key={key}>
                <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                  <span>{labels[key] ?? key}</span>
                  <span>{count} ({pct}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${colors[key] ?? 'bg-slate-400'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default async function DmeaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const [{ data: ppas }, { data: gsaPl }, { data: dlp }] = await Promise.all([
    supabase.from('ppas').select('status, category'),
    supabase.from('gsa_pl_records').select('term, class_average'),
    supabase.from('dlp_status').select('implementation_status'),
  ])

  const ppaRows = ppas ?? []
  const gsaPlRows = gsaPl ?? []
  const dlpRows = dlp ?? []

  const ppaStatusCounts = countBy(ppaRows, 'status')
  const dlpImplCounts = countBy(dlpRows, 'implementation_status')

  const validScores = gsaPlRows
    .map((r) => r.class_average)
    .filter((v): v is number => v !== null && v !== undefined)
  const avgClassScore =
    validScores.length > 0
      ? (validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(1)
      : '—'

  const gsaPlByTerm = countBy(gsaPlRows, 'term')

  const implementedCount = dlpImplCounts['implemented'] ?? 0
  const dlpComplianceRate =
    dlpRows.length > 0 ? Math.round((implementedCount / dlpRows.length) * 100) : 0

  return (
    <div className="min-h-screen">
      <Navbar role={profile?.role ?? 'viewer'} email={user.email ?? ''} />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">DMEA Dashboard</h1>
            <p className="text-sm text-slate-500">
              Division Monitoring, Evaluation and Adjustment — live indicators from PPAs, Learner
              Performance, and DLP data
            </p>
          </div>
          <PdfExportButton
            totals={{
              totalPpas: ppaRows.length,
              gsaPlRecords: gsaPlRows.length,
              avgClassScore: String(avgClassScore),
              dlpComplianceRate,
            }}
            ppaStatusCounts={ppaStatusCounts}
            ppaStatusLabels={statusLabels}
            dlpImplCounts={dlpImplCounts}
            implLabels={implLabels}
            gsaPlByTerm={gsaPlByTerm}
            termLabels={termLabels}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <SummaryCard label="Total PPAs" value={ppaRows.length} accent="text-slate-900" />
          <SummaryCard label="GSA/PL Records" value={gsaPlRows.length} accent="text-slate-900" />
          <SummaryCard label="Avg Class Score" value={avgClassScore} accent="text-[#0B6E33]" />
          <SummaryCard
            label="DLP Compliance Rate"
            value={`${dlpComplianceRate}%`}
            accent={dlpComplianceRate >= 70 ? 'text-[#0B6E33]' : 'text-amber-600'}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <BreakdownBars
            title="PPAs by Status"
            counts={ppaStatusCounts}
            labels={statusLabels}
            colors={statusBarColors}
            total={ppaRows.length}
          />
          <BreakdownBars
            title="DLP Implementation Status"
            counts={dlpImplCounts}
            labels={implLabels}
            colors={implBarColors}
            total={dlpRows.length}
          />
          <BreakdownBars
            title="GSA/PL Records by Term"
            counts={gsaPlByTerm}
            labels={termLabels}
            colors={{
              term_1: 'bg-[#0B6E33]',
              term_2: 'bg-[#0B6E33]',
              term_3: 'bg-[#0B6E33]',
              year_end: 'bg-[#E8A33D]',
            }}
            total={gsaPlRows.length}
          />
        </div>
      </main>
    </div>
  )
}