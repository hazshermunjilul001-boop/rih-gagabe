'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type School = { id: string; name: string }

const fieldClass =
  'w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B6E33] focus:border-[#0B6E33]'

const textareaClass = fieldClass

export default function MtConceptNoteForm({ schools }: { schools: School[] }) {
  const router = useRouter()
  const supabase = createClient()

  // mt_innovations fields
  const [title, setTitle] = useState('')
  const [proponentName, setProponentName] = useState('')
  const [schoolId, setSchoolId] = useState(schools[0]?.id ?? '')
  const [learningArea, setLearningArea] = useState('')
  const [gradeLevel, setGradeLevel] = useState('')
  const [learningGap, setLearningGap] = useState('')

  // mt_stage_submissions (attachment C) fields — everything else from the
  // Concept Note template lives in the JSONB `data` column
  const [rationale, setRationale] = useState('')
  const [generalObjective, setGeneralObjective] = useState('')
  const [specificObjectives, setSpecificObjectives] = useState('')
  const [targetLearners, setTargetLearners] = useState('')
  const [description, setDescription] = useState('')
  const [implementationPeriod, setImplementationPeriod] = useState('')
  const [resourcesNeeded, setResourcesNeeded] = useState('')
  const [expectedOutputs, setExpectedOutputs] = useState('')
  const [monitoringPlan, setMonitoringPlan] = useState('')
  const [sustainabilityPotential, setSustainabilityPotential] = useState('')

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

    // 1. Create the master innovation record (current_stage starts at 'C'
    // since Attachments A/B aren't built yet — adjust this once they are)
    const { data: innovation, error: innovationError } = await supabase
      .from('mt_innovations')
      .insert({
        school_id: schoolId,
        title,
        proponent_name: proponentName,
        learning_area: learningArea,
        grade_level: gradeLevel,
        learning_gap_summary: learningGap,
        current_stage: 'C',
        school_year: '2026-2027',
        status: 'draft',
        created_by: user?.id,
      })
      .select('id')
      .single()

    if (innovationError) {
      setError(innovationError.message)
      setLoading(false)
      return
    }

    // 2. Create the Attachment C stage submission, linked to the innovation
    const { error: stageError } = await supabase.from('mt_stage_submissions').insert({
      innovation_id: innovation.id,
      attachment_code: 'C',
      data: {
        rationale,
        general_objective: generalObjective,
        specific_objectives: specificObjectives,
        target_learners: targetLearners,
        description,
        implementation_period: implementationPeriod,
        resources_needed: resourcesNeeded,
        expected_outputs: expectedOutputs,
        monitoring_evaluation_plan: monitoringPlan,
        sustainability_potential: sustainabilityPotential,
      },
      status: 'draft',
      submitted_by: user?.id,
    })

    if (stageError) {
      setError(`Innovation saved, but the Concept Note details failed: ${stageError.message}`)
      setLoading(false)
      return
    }

    router.push('/innovation-papers')
    router.refresh()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-6"
    >
      <div>
        <h2 className="text-sm font-semibold text-slate-800 mb-1">Attachment C — Innovation Concept Note</h2>
        <p className="text-xs text-slate-500">Reference dates: July 20 – August 14, 2026</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Title of Innovation</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className={fieldClass}
          placeholder="e.g. Peer-Assisted Numeracy Stations for Grade 7"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Proponent / Master Teacher</label>
          <input
            value={proponentName}
            onChange={(e) => setProponentName(e.target.value)}
            required
            className={fieldClass}
          />
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Learning Area and Grade Level</label>
          <input
            value={learningArea}
            onChange={(e) => setLearningArea(e.target.value)}
            placeholder="e.g. Mathematics, Grade 7"
            className={fieldClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Grade Level</label>
          <input
            value={gradeLevel}
            onChange={(e) => setGradeLevel(e.target.value)}
            placeholder="e.g. Grade 7"
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Identified Learning Gap</label>
        <textarea
          value={learningGap}
          onChange={(e) => setLearningGap(e.target.value)}
          rows={2}
          className={textareaClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Rationale / Brief Background</label>
        <textarea
          value={rationale}
          onChange={(e) => setRationale(e.target.value)}
          rows={3}
          className={textareaClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">General Objective</label>
          <textarea
            value={generalObjective}
            onChange={(e) => setGeneralObjective(e.target.value)}
            rows={2}
            className={textareaClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Specific Objectives</label>
          <textarea
            value={specificObjectives}
            onChange={(e) => setSpecificObjectives(e.target.value)}
            rows={2}
            className={textareaClass}
            placeholder="One per line"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Target Learners / Beneficiaries</label>
        <input
          value={targetLearners}
          onChange={(e) => setTargetLearners(e.target.value)}
          placeholder="e.g. 40 Grade 7 learners with below-proficient numeracy scores"
          className={fieldClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Description of the Innovation</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className={textareaClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Implementation Period</label>
          <input
            value={implementationPeriod}
            onChange={(e) => setImplementationPeriod(e.target.value)}
            placeholder="e.g. Term 1, Weeks 5-10"
            className={fieldClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Resources Needed</label>
          <input
            value={resourcesNeeded}
            onChange={(e) => setResourcesNeeded(e.target.value)}
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Expected Outputs and Outcomes</label>
        <textarea
          value={expectedOutputs}
          onChange={(e) => setExpectedOutputs(e.target.value)}
          rows={3}
          className={textareaClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Monitoring and Evaluation Plan</label>
        <textarea
          value={monitoringPlan}
          onChange={(e) => setMonitoringPlan(e.target.value)}
          rows={3}
          className={textareaClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Sustainability / Scalability Potential</label>
        <textarea
          value={sustainabilityPotential}
          onChange={(e) => setSustainabilityPotential(e.target.value)}
          rows={3}
          className={textareaClass}
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