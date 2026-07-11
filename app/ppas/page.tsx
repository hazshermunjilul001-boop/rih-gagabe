import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'

type PpaRow = {
  id: string
  title: string
  category: string
  status: string
  start_date: string | null
  end_date: string | null
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

export default async function PpasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const { data, error } = await supabase
    .from('ppas')
    .select('id, title, category, status, start_date, end_date, schools(name)')
    .order('created_at', { ascending: false })

  const ppas = (data ?? []) as unknown as PpaRow[]

  return (
    <div className="min-h-screen">
      <Navbar role={profile?.role ?? 'viewer'} email={user.email ?? ''} />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              Programs, Projects &amp; Activities
            </h1>
            <p className="text-sm text-slate-500">
              SPA, SPS, Master Teachers, Wellness, LAS Tracking, and more
            </p>
          </div>
          <div className="flex gap-2">
            <a
              href="/api/export/ppas"
              className="rounded-md bg-white border border-[#0B6E33] text-[#0B6E33] text-sm font-medium px-4 py-2 hover:bg-[#0B6E33] hover:text-white transition-colors"
            >
              Export to Excel
            </a>
            <Link
              href="/ppas/new"
              className="rounded-md bg-[#0B6E33] text-white text-sm font-medium px-4 py-2 hover:bg-[#095C2A] transition-colors"
            >
              + New PPA
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          {error && (
            <p className="text-sm text-red-600 p-4">Error loading PPAs: {error.message}</p>
          )}

          {!error && ppas.length === 0 && (
            <p className="text-sm text-slate-500 p-6 text-center">
              No PPAs yet. Click &quot;New PPA&quot; to add the first one.
            </p>
          )}

          {!error && ppas.length > 0 && (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium text-slate-600">Title</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Category</th>
                  <th className="px-4 py-3 font-medium text-slate-600">School</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Status</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Dates</th>
                </tr>
              </thead>
              <tbody>
                {ppas.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3 text-slate-900">{p.title}</td>
                    <td className="px-4 py-3 text-slate-600 capitalize">
                      {p.category.replaceAll('_', ' ')}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{p.schools?.name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          statusColors[p.status] ?? 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {p.start_date ?? '—'} to {p.end_date ?? '—'}
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