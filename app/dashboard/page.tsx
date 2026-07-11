import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role, approved')
    .eq('id', user.id)
    .single()

  const role = profile?.role ?? 'viewer'

  const [
    { count: ppaCount },
    { count: gsaPlCount },
    { count: dlpCount },
    { count: kraCount },
    { count: taIsCount },
  ] = await Promise.all([
    supabase.from('ppas').select('*', { count: 'exact', head: true }),
    supabase.from('gsa_pl_records').select('*', { count: 'exact', head: true }),
    supabase.from('dlp_status').select('*', { count: 'exact', head: true }),
    supabase.from('kra_evidence').select('*', { count: 'exact', head: true }),
    supabase.from('ta_is_plans').select('*', { count: 'exact', head: true }),
  ])

  let pendingApprovals = 0
  if (role === 'admin') {
    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('approved', false)
    pendingApprovals = count ?? 0
  }

  const modules = [
    { href: '/ppas', label: 'PPAs', count: ppaCount ?? 0, desc: 'Programs, Projects & Activities' },
    { href: '/gsa-pl', label: 'Learner Performance', count: gsaPlCount ?? 0, desc: 'GSA/PL records' },
    { href: '/dlp', label: 'DLP Monitoring', count: dlpCount ?? 0, desc: 'Dynamic Learning Program status' },
    { href: '/ta-is', label: 'TA/IS', count: taIsCount ?? 0, desc: 'Technical Assistance & Supervision plans' },
    { href: '/kra', label: 'KRA Evidence', count: kraCount ?? 0, desc: 'PPSS evidence portfolio' },
    { href: '/dmea', label: 'DMEA Dashboard', count: null, desc: 'Division indicators & analytics' },
  ]

  const displayName = profile?.full_name?.includes('@')
    ? profile.full_name.split('@')[0]
    : profile?.full_name ?? user.email

  return (
    <div className="min-h-screen">
      <Navbar role={role} email={user.email ?? ''} />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-slate-900">Welcome, {displayName}</h1>
          <p className="text-sm text-slate-500">
            {role.replaceAll('_', ' ')} · Research &amp; Innovation HUB, SDO Davao City
          </p>
        </div>

        {role === 'admin' && pendingApprovals > 0 && (
          <Link
            href="/admin/users"
            className="block mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 hover:bg-amber-100 transition-colors"
          >
            {pendingApprovals} account{pendingApprovals === 1 ? '' : 's'} awaiting approval — click to review
          </Link>
        )}

        {profile && !profile.approved && role === 'viewer' && (
          <div className="mb-6 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
            Your account is pending review by an administrator. Access will expand once approved.
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 hover:border-[#0B6E33] hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-sm font-semibold text-slate-900">{m.label}</h2>
                {m.count !== null && (
                  <span className="text-lg font-bold text-[#0B6E33]">{m.count}</span>
                )}
              </div>
              <p className="text-xs text-slate-500">{m.desc}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}