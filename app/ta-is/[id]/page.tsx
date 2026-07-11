import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'

const planTypeLabels: Record<string, string> = {
  ta_plan: 'TA Plan',
  is_plan: 'IS Plan',
  joint_ta_is: 'Joint TA/IS',
  followup_monitoring: 'Follow-up Monitoring',
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

export default async function TaIsPlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const { data: plan } = await supabase
    .from('ta_is_plans')
    .select('*, schools:target_school_id(name)')
    .eq('id', id)
    .single()

  if (!plan) notFound()

  const { data: reports } = await supabase
    .from('ta_is_reports')
    .select('*')
    .eq('plan_id', id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen">
      <Navbar role={profile?.role ?? 'viewer'} email={user.email ?? ''} />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <Link href="/ta-is" className="text-sm text-[#0B6E33] hover:underline">
          ← Back to TA/IS Plans
        </Link>

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 mt-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-semibold text-slate-900">
              {planTypeLabels[plan.plan_type] ?? plan.plan_type}
            </h1>
            <div className="flex items-center gap-2">
              <a
                href={`/api/export/ta-is/${id}`}
                className="rounded-md bg-white border border-[#0B6E33] text-[#0B6E33] text-xs font-medium px-3 py-1.5 hover:bg-[#0B6E33] hover:text-white transition-colors"
              >
                Export to Word
              </a>
              <span
                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  statusColors[plan.status] ?? 'bg-slate-100 text-slate-700'
                }`}
              >
                {plan.status}
              </span>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-slate-500">School</dt>
              <dd className="text-slate-900">{plan.schools?.name ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Target Date</dt>
              <dd className="text-slate-900">{plan.target_date ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Basis of Action</dt>
              <dd className="text-slate-900">{plan.basis_of_action || '—'}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Strategy</dt>
              <dd className="text-slate-900">{plan.strategy || '—'}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-slate-500">Priority Focus</dt>
              <dd className="text-slate-900">{plan.priority_focus || '—'}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-slate-500">Expected Output</dt>
              <dd className="text-slate-900">{plan.expected_output || '—'}</dd>
            </div>
          </dl>
        </div>

        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-slate-700">
            Reports ({reports?.length ?? 0})
          </h2>
          <Link
            href={`/ta-is/${id}/report/new`}
            className="rounded-md bg-[#0B6E33] text-white text-xs font-medium px-3 py-1.5 hover:bg-[#095C2A] transition-colors"
          >
            + File Report
          </Link>
        </div>

        {(!reports || reports.length === 0) && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 text-center text-sm text-slate-500">
            No reports filed yet for this plan.
          </div>
        )}

        <div className="space-y-3">
          {reports?.map((r) => (
            <div key={r.id} className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-slate-900">{r.activity_conducted}</p>
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    statusColors[r.status] ?? 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {r.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-3">{r.date_conducted ?? 'No date recorded'}</p>
              {r.findings && (
                <p className="text-sm text-slate-600 mb-1">
                  <span className="font-medium text-slate-700">Findings: </span>{r.findings}
                </p>
              )}
              {r.recommendations && (
                <p className="text-sm text-slate-600">
                  <span className="font-medium text-slate-700">Recommendations: </span>{r.recommendations}
                </p>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}