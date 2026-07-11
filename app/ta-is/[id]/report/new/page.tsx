import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import TaIsReportForm from '@/components/TaIsReportForm'

export default async function NewTaIsReportPage({
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

  return (
    <div className="min-h-screen">
      <Navbar role={profile?.role ?? 'viewer'} email={user.email ?? ''} />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <Link href={`/ta-is/${id}`} className="text-sm text-[#0B6E33] hover:underline">
          ← Back to Plan
        </Link>
        <h1 className="text-xl font-semibold text-slate-900 mt-3 mb-1">File TA/IS Report</h1>
        <p className="text-sm text-slate-500 mb-6">Record the results of this TA/IS activity</p>
        <TaIsReportForm planId={id} />
      </main>
    </div>
  )
}