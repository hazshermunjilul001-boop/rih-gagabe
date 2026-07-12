'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type District = { id: string; name: string }
type Cluster = { id: string; name: string }
type SchoolDistrict = { name: string } | null
type SchoolCluster = { name: string; districts: SchoolDistrict } | null
type School = {
  id: string
  name: string
  districts: SchoolDistrict
  clusters: SchoolCluster
}

const fieldClass =
  'w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B6E33] focus:border-[#0B6E33]'

const DEPED_EMAIL_PATTERN = /@deped\.gov\.ph$/i

function schoolLabel(s: School) {
  const districtName = s.districts?.name ?? s.clusters?.districts?.name
  const clusterName = s.clusters?.name
  const parts = [clusterName, districtName].filter(Boolean)
  return parts.length > 0 ? `${s.name} — ${parts.join(', ')}` : s.name
}

export default function SignupForm({
  schools,
  districts,
  clusters,
}: {
  schools: School[]
  districts: District[]
  clusters: Cluster[]
}) {
  const router = useRouter()
  const supabase = createClient()

  const [affiliationType, setAffiliationType] = useState<
    'school' | 'cluster' | 'district' | 'division'
  >('school')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [schoolId, setSchoolId] = useState('')
  const [districtId, setDistrictId] = useState('')
  const [clusterId, setClusterId] = useState('')
  const [position, setPosition] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!DEPED_EMAIL_PATTERN.test(email.trim())) {
      setError('Please use your official DepEd email address (must end in @deped.gov.ph).')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          claimed_school_id: affiliationType === 'school' ? schoolId : '',
          claimed_district_id: affiliationType === 'district' ? districtId : '',
          claimed_cluster_id: affiliationType === 'cluster' ? clusterId : '',
          claimed_position: position,
        },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="p-6">
        <div className="rounded-md bg-emerald-50 border border-emerald-200 px-4 py-4 text-sm text-emerald-800">
          <p className="font-medium mb-1">Account created</p>
          <p>
            An administrator will review
            your registration and activate full access — you can log in once approved, though
            initial access will be limited until then.
          </p>
        </div>
        <button
          onClick={() => router.push('/login')}
          className="w-full mt-4 rounded-md bg-[#0B6E33] text-white text-sm font-medium py-2.5 hover:bg-[#095C2A] transition-colors"
        >
          Go to Sign In
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          className={fieldClass}
          placeholder="Juan Dela Cruz"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={fieldClass}
          placeholder="you@deped.gov.ph"
        />
        <p className="text-xs text-slate-400 mt-1">
          Must be your official DepEd email address (ends in @deped.gov.ph).
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className={fieldClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">I am registering as</label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 'school', label: 'School Staff' },
            { value: 'cluster', label: 'Cluster Office' },
            { value: 'district', label: 'District Office' },
            { value: 'division', label: 'Division Office' },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setAffiliationType(opt.value as typeof affiliationType)}
              className={`rounded-md border px-2 py-2 text-xs font-medium transition-colors ${
                affiliationType === opt.value
                  ? 'bg-[#0B6E33] text-white border-[#0B6E33]'
                  : 'bg-white text-slate-600 border-slate-300 hover:border-[#0B6E33]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {affiliationType === 'school' && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Your School</label>
          <input
            list="school-options"
            value={schoolId ? schoolLabel(schools.find((s) => s.id === schoolId)!) : ''}
            onChange={(e) => {
              const match = schools.find((s) => schoolLabel(s) === e.target.value)
              setSchoolId(match?.id ?? '')
            }}
            className={fieldClass}
            placeholder="Start typing your school name..."
          />
          <datalist id="school-options">
            {schools.map((s) => (
              <option key={s.id} value={schoolLabel(s)} />
            ))}
          </datalist>
        </div>
      )}

      {affiliationType === 'cluster' && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Your Cluster</label>
          <select
            value={clusterId}
            onChange={(e) => setClusterId(e.target.value)}
            className={fieldClass}
          >
            <option value="">Select cluster</option>
            {clusters.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      )}

      {affiliationType === 'district' && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Your District</label>
          <select
            value={districtId}
            onChange={(e) => setDistrictId(e.target.value)}
            className={fieldClass}
          >
            <option value="">Select district</option>
            {districts.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Position</label>
        <input
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          className={fieldClass}
          placeholder="e.g. School Head, Master Teacher, Cluster Coordinator, PSDS, EPS"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-[#0B6E33] text-white text-sm font-medium py-2.5 hover:bg-[#095C2A] disabled:opacity-60 transition-colors"
      >
        {loading ? 'Creating account...' : 'Create Account'}
      </button>

      <p className="text-xs text-slate-400 text-center pt-1">
        Your account will have limited access until an administrator reviews and approves it.
      </p>
    </form>
  )
}