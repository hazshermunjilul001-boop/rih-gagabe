import { createClient } from '@/lib/supabase/server'
import SignupForm from '@/components/SignupForm'

export default async function SignupPage() {
  const supabase = await createClient()

  const { data: schools } = await supabase
    .from('schools')
    .select('id, name, districts:district_id(name), clusters:cluster_id(name, districts:district_id(name))')
    .order('name')

  const { data: districts } = await supabase
    .from('districts')
    .select('id, name')
    .order('name')

  const { data: clustersRaw } = await supabase
    .from('clusters')
    .select('id, name')

  const clusters = (clustersRaw ?? []).sort((a, b) => {
    const numA = parseInt(a.name.replace(/\D/g, ''), 10) || 0
    const numB = parseInt(b.name.replace(/\D/g, ''), 10) || 0
    return numA - numB
  })

  return (
    <div className="min-h-screen w-full flex flex-col">
      <div className="h-2 w-full bg-[#0B6E33]" />
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden">
            <div className="bg-[#0B6E33] px-6 py-5 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/divlogo.webp"
                alt="Division Logo"
                className="mx-auto mb-2 h-12 w-12 rounded-full object-cover bg-white"
              />
              <h1 className="text-white font-semibold text-base">Create Your Account</h1>
              <p className="text-[#d7ead9] text-xs mt-0.5">
                Research &amp; Innovation HUB · SDO Davao City
              </p>
            </div>

            <SignupForm
              schools={
                (schools ?? []) as unknown as {
                  id: string
                  name: string
                  districts: { name: string } | null
                  clusters: { name: string; districts: { name: string } | null } | null
                }[]
              }
              districts={districts ?? []}
              clusters={clusters ?? []}
            />
          </div>

          <p className="text-center text-xs text-slate-400 mt-4">
            Already have an account?{' '}
            <a href="/login" className="text-[#0B6E33] hover:underline">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}