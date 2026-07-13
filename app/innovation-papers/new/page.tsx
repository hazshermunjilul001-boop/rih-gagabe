import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import InnovationPaperForm from '@/components/InnovationPaperForm'

export default async function NewInnovationPaperPage() {
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
    .select('id, name, districts:district_id(name), clusters:cluster_id(name, districts:district_id(name))')
    .order('name')

  return (
    <div className="min-h-screen">
      <Navbar role={profile?.role ?? 'viewer'} email={user.email ?? ''} />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-xl font-semibold text-slate-900 mb-1">New Innovation Paper Submission</h1>
        <p className="text-sm text-slate-500 mb-6">
          Log a Master Teacher innovation paper or orientation attachment
        </p>
        <InnovationPaperForm
          schools={
            (schools ?? []) as unknown as {
              id: string
              name: string
              districts: { name: string } | null
              clusters: { name: string; districts: { name: string } | null } | null
            }[]
          }
        />
      </main>
    </div>
  )
}