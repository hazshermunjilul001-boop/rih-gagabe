import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import UserRoleRow from '@/components/UserRoleRow'

export default async function ManageUsersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: users } = await supabase
    .from('profiles')
    .select(
      'id, full_name, role, approved, claimed_position, school_id, district_id, schools:school_id(name), districts:district_id(name)'
    )
    .order('approved', { ascending: true })

  const pendingCount = users?.filter((u) => !u.approved).length ?? 0

  return (
    <div className="min-h-screen">
      <Navbar role="admin" email={user.email ?? ''} />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-slate-900">Manage Users</h1>
          <p className="text-sm text-slate-500">
            {pendingCount > 0
              ? `${pendingCount} account${pendingCount === 1 ? '' : 's'} awaiting review`
              : 'All accounts reviewed'}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-left">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-600">Name</th>
                <th className="px-4 py-3 font-medium text-slate-600">Claimed Affiliation</th>
                <th className="px-4 py-3 font-medium text-slate-600">Claimed Position</th>
                <th className="px-4 py-3 font-medium text-slate-600">Role</th>
                <th className="px-4 py-3 font-medium text-slate-600">Approved</th>
                <th className="px-4 py-3 font-medium text-slate-600"></th>
              </tr>
            </thead>
            <tbody>
              {users?.map((u) => (
                <UserRoleRow
                  key={u.id}
                  id={u.id}
                  fullName={u.full_name}
                  currentRole={u.role}
                  approved={u.approved}
                  claimedPosition={u.claimed_position}
                  affiliation={
                    (u.schools as { name: string } | null)?.name ??
                    (u.districts as { name: string } | null)?.name ??
                    'None specified'
                  }
                />
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}