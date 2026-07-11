import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import PpaForm from '@/components/PpaForm'

export default async function NewPpaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const { data: schools } = await supabase
    .from('schools')
    .select('id, name')
    .order('name')

  return (
    <div className="min-h-screen">
      <Navbar role={profile?.role ?? 'viewer'} email={user.email ?? ''} />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-xl font-semibold text-slate-900 mb-1">New PPA</h1>
        <p className="text-sm text-slate-500 mb-6">
          Add a Program, Project, or Activity record
        </p>
        <PpaForm schools={schools ?? []} />
      </main>
    </div>
  )
}