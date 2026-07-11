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

const planTypes = [
  { value: 'ta_plan', label: 'TA Plan' },
  { value: 'is_plan', label: 'IS Plan' },
  { value: 'joint_ta_is', label: 'Joint TA/IS' },
  { value: 'followup_monitoring', label: 'Follow-up Monitoring' },
]

const basisOptions = [
  'GSA/PL Data', 'DLP Monitoring', 'LAS Tracking', 'DMEA Indicator',
  'PPA Concern', 'School Request', 'Audit Finding', 'Previous Report',
]

const strategyOptions = [
  'Coaching', 'Mentoring', 'Consultation', 'Classroom Observation',
  'Monitoring Visit', 'Virtual TA', 'Orientation', 'Demonstration',
  'Document Review', 'Follow-up Conference',
]

const fieldClass =
  'w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B6E33] focus:border-[#0B6E33]'

export default function TaIsPlanForm({ schools }: { schools: School[] }) {
  const router = useRouter()
  const supabase = createClient()

  const [planType, setPlanType] = useState('ta_plan')
  const [term, setTerm] = useState('term_1')
  const [targetSchoolId, setTargetSchoolId] = useState(schools[0]?.id ?? '')
  const [basisOfAction, setBasisOfAction] = useState(basisOptions[0])
  const [priorityFocus, setPriorityFocus] = useState('')
  const [strategy, setStrategy] = useState(strategyOptions[0])
  const [responsiblePerson, setResponsiblePerson] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [expectedOutput, setExpectedOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('ta_is_plans').insert({
      plan_type: planType,
      term,
      target_school_id: targetSchoolId || null,
      basis_of_action: basisOfAction,
      priority_focus: priorityFocus,
      strategy,
      responsible_person: responsiblePerson,
      target_date: targetDate || null,
      expected_output: expectedOutput,
      status: 'draft',
      created_by: user?.id,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/ta-is')
    router.refresh()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-4"
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Plan Type</label>
          <select value={planType} onChange={(e) => setPlanType(e.target.value)} className={fieldClass}>
            {planTypes.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
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

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Target School</label>
        <select
          value={targetSchoolId}
          onChange={(e) => setTargetSchoolId(e.target.value)}
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
          <label className="block text-sm font-medium text-slate-700 mb-1">Basis of Action</label>
          <select value={basisOfAction} onChange={(e) => setBasisOfAction(e.target.value)} className={fieldClass}>
            {basisOptions.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Strategy</label>
          <select value={strategy} onChange={(e) => setStrategy(e.target.value)} className={fieldClass}>
            {strategyOptions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Priority Focus</label>
        <input
          value={priorityFocus}
          onChange={(e) => setPriorityFocus(e.target.value)}
          placeholder="e.g. Learner performance in Mathematics Grade 8"
          className={fieldClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Responsible Person</label>
          <input
            value={responsiblePerson}
            onChange={(e) => setResponsiblePerson(e.target.value)}
            className={fieldClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Target Date</label>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Expected Output</label>
        <textarea
          value={expectedOutput}
          onChange={(e) => setExpectedOutput(e.target.value)}
          rows={3}
          placeholder="What should result from this TA/IS activity"
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