import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'

type PlanRow = {
  id: string
  plan_type: string
  term: string
  priority_focus: string | null
  strategy: string | null
  status: string
  target_date: string | null
  schools: { name: string } | null
}

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

export default async function TaIsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const { data, error } = await supabase
    .from('ta_is_plans')
    .select('id, plan_type, term, priority_focus, strategy, status, target_date, schools:target_school_id(name)')
    .order('created_at', { ascending: false })

  const plans = (data ?? []) as unknown as PlanRow[]

  return (
    <div className="min-h-screen">
      <Navbar role={profile?.role ?? 'viewer'} email={user.email ?? ''} />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              Instructional Supervision &amp; TA Management
            </h1>
            <p className="text-sm text-slate-500">TA/IS Plans and their follow-up reports</p>
          </div>
          <Link
            href="/ta-is/new"
            className="rounded-md bg-[#0B6E33] text-white text-sm font-medium px-4 py-2 hover:bg-[#095C2A] transition-colors"
          >
            + New Plan
          </Link>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          {error && (
            <p className="text-sm text-red-600 p-4">Error loading plans: {error.message}</p>
          )}

          {!error && plans.length === 0 && (
            <p className="text-sm text-slate-500 p-6 text-center">
              No TA/IS plans yet. Click &quot;New Plan&quot; to add the first one.
            </p>
          )}

          {!error && plans.length > 0 && (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium text-slate-600">Type</th>
                  <th className="px-4 py-3 font-medium text-slate-600">School</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Priority Focus</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Strategy</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Target Date</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link href={`/ta-is/${p.id}`} className="text-[#0B6E33] font-medium hover:underline">
                        {planTypeLabels[p.plan_type] ?? p.plan_type}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{p.schools?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{p.priority_focus || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{p.strategy || '—'}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{p.target_date ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          statusColors[p.status] ?? 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {p.status}
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