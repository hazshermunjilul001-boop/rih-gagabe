'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type School = { id: string; name: string }

const terms = [
  { value: 'term_1', label: 'Term 1' },
  { value: 'term_2', label: 'Term 2' },
  { value: 'term_3', label: 'Term 3' },
  { value: 'year_end', label: 'Year-End' },
]

const implementationStatuses = [
  { value: 'implemented', label: 'Implemented' },
  { value: 'partially_implemented', label: 'Partially Implemented' },
  { value: 'not_yet_implemented', label: 'Not Yet Implemented' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'needing_ta', label: 'Needing Technical Assistance' },
]

const fieldClass =
  'w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B6E33] focus:border-[#0B6E33]'

export default function DlpForm({ schools }: { schools: School[] }) {
  const router = useRouter()
  const supabase = createClient()

  const [term, setTerm] = useState('term_1')
  const [schoolId, setSchoolId] = useState(schools[0]?.id ?? '')
  const [implementationStatus, setImplementationStatus] = useState('implemented')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!schoolId) {
      setError('Please select a school before saving.')
      return
    }

    setLoading(true)

    const { error } = await supabase.from('dlp_status').insert({
      school_id: schoolId,
      term,
      implementation_status: implementationStatus,
      notes,
      status: 'draft',
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dlp')
    router.refresh()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-4"
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Term</label>
          <select value={term} onChange={(e) => setTerm(e.target.value)} className={fieldClass}>
            {terms.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">School</label>
          <select
            value={schoolId}
            onChange={(e) => setSchoolId(e.target.value)}
            required
            className={fieldClass}
          >
            {schools.length === 0 && <option value="">No schools yet</option>}
            {schools.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          DLP Implementation Status
        </label>
        <select
          value={implementationStatus}
          onChange={(e) => setImplementationStatus(e.target.value)}
          className={fieldClass}
        >
          {implementationStatuses.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="Observations, blockers, or context for this term's implementation"
          className={fieldClass}
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-[#0B6E33] text-white text-sm font-medium px-5 py-2.5 hover:bg-[#095C2A] disabled:opacity-60 transition-colors"
        >
          {loading ? 'Saving...' : 'Save as Draft'}
        </button>
      </div>
    </form>
  )
}