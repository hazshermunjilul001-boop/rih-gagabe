import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'

type SchoolDistrict = { name: string } | null
type SchoolCluster = { name: string; districts: SchoolDistrict } | null
type SchoolJoin = {
  name: string
  districts: SchoolDistrict
  clusters: SchoolCluster
} | null

type PaperRow = {
  id: string
  tracking_no: string | null
  teacher_name: string | null
  school_name_raw: string | null
  cluster_district_raw: string | null
  title: string | null
  category: string | null
  status: string
  schools: SchoolJoin
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

function displaySchool(p: PaperRow) {
  return p.schools?.name ?? p.school_name_raw ?? '—'
}

function displayClusterDistrict(p: PaperRow) {
  if (p.schools) {
    const clusterName = p.schools.clusters?.name
    const districtName = p.schools.districts?.name ?? p.schools.clusters?.districts?.name
    const parts = [clusterName, districtName].filter(Boolean)
    if (parts.length > 0) return parts.join(' / ')
  }
  return p.cluster_district_raw ?? '—'
}

export default async function InnovationPapersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const { data, error } = await supabase
    .from('innovation_papers')
    .select(
      'id, tracking_no, teacher_name, school_name_raw, cluster_district_raw, title, category, status, schools:school_id(name, districts:district_id(name), clusters:cluster_id(name, districts:district_id(name)))'
    )
    .order('created_at', { ascending: false })

  const papers = (data ?? []) as unknown as PaperRow[]

  return (
    <div className="min-h-screen">
      <Navbar role={profile?.role ?? 'viewer'} email={user.email ?? ''} />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Innovation Papers</h1>
            <p className="text-sm text-slate-500">
              Master Teacher innovation paper submission log
            </p>
          </div>
          <Link
            href="/innovation-papers/new"
            className="rounded-md bg-[#0B6E33] text-white text-sm font-medium px-4 py-2 hover:bg-[#095C2A] transition-colors"
          >
            + New Submission
          </Link>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          {error && (
            <p className="text-sm text-red-600 p-4">Error loading records: {error.message}</p>
          )}

          {!error && papers.length === 0 && (
            <p className="text-sm text-slate-500 p-6 text-center">
              No submissions yet. Click &quot;New Submission&quot; to add the first one.
            </p>
          )}

          {!error && papers.length > 0 && (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium text-slate-600">Tracking No.</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Teacher</th>
                  <th className="px-4 py-3 font-medium text-slate-600">School</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Cluster/District</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Category</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {papers.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3 text-slate-900 font-mono text-xs">{p.tracking_no ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{p.teacher_name ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{displaySchool(p)}</td>
                    <td className="px-4 py-3 text-slate-600">{displayClusterDistrict(p)}</td>
                    <td className="px-4 py-3 text-slate-600">{p.category ?? '—'}</td>
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