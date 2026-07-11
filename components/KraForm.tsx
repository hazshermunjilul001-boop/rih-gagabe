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

const linkedModules = [
  { value: 'ppa', label: 'PPA' },
  { value: 'gsa_pl', label: 'Learner Performance (GSA/PL)' },
  { value: 'dlp', label: 'DLP Monitoring' },
  { value: 'dmea', label: 'DMEA Indicator' },
  { value: 'ta_is_plan', label: 'TA/IS Plan' },
  { value: 'ta_is_report', label: 'TA/IS Report' },
  { value: 'other', label: 'Other' },
]

const fieldClass =
  'w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B6E33] focus:border-[#0B6E33]'

export default function KraForm({ schools }: { schools: School[] }) {
  const router = useRouter()
  const supabase = createClient()

  const [schoolId, setSchoolId] = useState(schools[0]?.id ?? '')
  const [kraNumber, setKraNumber] = useState('')
  const [term, setTerm] = useState('term_1')
  const [evidenceType, setEvidenceType] = useState('')
  const [linkedModule, setLinkedModule] = useState('ppa')
  const [fileUrl, setFileUrl] = useState('')
  const [tags, setTags] = useState('')
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

    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('kra_evidence').insert({
      school_id: schoolId,
      kra_number: kraNumber,
      term,
      evidence_type: evidenceType,
      linked_module: linkedModule,
      file_url: fileUrl,
      tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      uploaded_by: user?.id,
      status: 'draft',
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/kra')
    router.refresh()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-4"
    >
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">KRA Number</label>
          <input
            value={kraNumber}
            onChange={(e) => setKraNumber(e.target.value)}
            required
            placeholder="e.g. KRA 1"
            className={fieldClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Term</label>
          <select value={term} onChange={(e) => setTerm(e.target.value)} className={fieldClass}>
            {terms.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Evidence Type</label>
          <input
            value={evidenceType}
            onChange={(e) => setEvidenceType(e.target.value)}
            placeholder="e.g. Accomplishment Report"
            className={fieldClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Linked Module</label>
          <select value={linkedModule} onChange={(e) => setLinkedModule(e.target.value)} className={fieldClass}>
            {linkedModules.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          File Link <span className="text-slate-400 font-normal">(Google Drive, etc.)</span>
        </label>
        <input
          type="url"
          value={fileUrl}
          onChange={(e) => setFileUrl(e.target.value)}
          placeholder="https://drive.google.com/..."
          className={fieldClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Tags <span className="text-slate-400 font-normal">(comma-separated)</span>
        </label>
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="e.g. classroom observation, term 1, math"
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