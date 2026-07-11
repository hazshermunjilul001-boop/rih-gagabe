'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const fieldClass =
  'w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B6E33] focus:border-[#0B6E33]'

export default function TaIsReportForm({ planId }: { planId: string }) {
  const router = useRouter()
  const supabase = createClient()

  const [activityConducted, setActivityConducted] = useState('')
  const [dateConducted, setDateConducted] = useState('')
  const [findings, setFindings] = useState('')
  const [recommendations, setRecommendations] = useState('')
  const [issuesResolved, setIssuesResolved] = useState('')
  const [pendingConcerns, setPendingConcerns] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('ta_is_reports').insert({
      plan_id: planId,
      activity_conducted: activityConducted,
      date_conducted: dateConducted || null,
      findings,
      recommendations,
      issues_resolved: issuesResolved,
      pending_concerns: pendingConcerns,
      status: 'draft',
      created_by: user?.id,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push(`/ta-is/${planId}`)
    router.refresh()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-4"
    >
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Activity Conducted</label>
        <input
          value={activityConducted}
          onChange={(e) => setActivityConducted(e.target.value)}
          required
          placeholder="e.g. Classroom observation and coaching session"
          className={fieldClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Date Conducted</label>
        <input
          type="date"
          value={dateConducted}
          onChange={(e) => setDateConducted(e.target.value)}
          className={fieldClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Findings</label>
        <textarea
          value={findings}
          onChange={(e) => setFindings(e.target.value)}
          rows={3}
          className={fieldClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Recommendations</label>
        <textarea
          value={recommendations}
          onChange={(e) => setRecommendations(e.target.value)}
          rows={3}
          className={fieldClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Issues Resolved</label>
          <textarea
            value={issuesResolved}
            onChange={(e) => setIssuesResolved(e.target.value)}
            rows={2}
            className={fieldClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Pending Concerns</label>
          <textarea
            value={pendingConcerns}
            onChange={(e) => setPendingConcerns(e.target.value)}
            rows={2}
            className={fieldClass}
          />
        </div>
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
          {loading ? 'Saving...' : 'Save Report'}
        </button>
      </div>
    </form>
  )
}