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

const PL_LEVELS = [
  'Beginning',
  'Developing',
  'Approaching Proficiency',
  'Proficient',
  'Advanced',
]

const fieldClass =
  'w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B6E33] focus:border-[#0B6E33]'

export default function GsaPlForm({ schools }: { schools: School[] }) {
  const router = useRouter()
  const supabase = createClient()

  const [term, setTerm] = useState('term_1')
  const [schoolId, setSchoolId] = useState(schools[0]?.id ?? '')
  const [gradeLevel, setGradeLevel] = useState('')
  const [learningArea, setLearningArea] = useState('')
  const [section, setSection] = useState('')
  const [learnerCount, setLearnerCount] = useState('')
  const [classAverage, setClassAverage] = useState('')
  const [schoolAverage, setSchoolAverage] = useState('')
  const [gradeLevelAverage, setGradeLevelAverage] = useState('')
  const [previousTermAverage, setPreviousTermAverage] = useState('')
  const [plRows, setPlRows] = useState(
    PL_LEVELS.map((level) => ({ level, learnerCount: '', percentage: '' }))
  )
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function updatePlRow(index: number, field: 'learnerCount' | 'percentage', value: string) {
    setPlRows((rows) =>
      rows.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    )
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!schoolId) {
      setError('Please select a school before saving. If the dropdown is empty, no schools have been added yet — check the schools table in Supabase.')
      return
    }

    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    const { data: record, error: insertError } = await supabase
      .from('gsa_pl_records')
      .insert({
        term,
        school_id: schoolId || null,
        grade_level: gradeLevel,
        learning_area: learningArea,
        section,
        learner_count: learnerCount ? Number(learnerCount) : null,
        class_average: classAverage ? Number(classAverage) : null,
        school_average: schoolAverage ? Number(schoolAverage) : null,
        grade_level_average: gradeLevelAverage ? Number(gradeLevelAverage) : null,
        previous_term_average: previousTermAverage ? Number(previousTermAverage) : null,
        status: 'draft',
        encoded_by: user?.id,
      })
      .select('id')
      .single()

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    const rowsToInsert = plRows
      .filter((r) => r.learnerCount !== '')
      .map((r) => ({
        gsa_pl_record_id: record.id,
        proficiency_level: r.level,
        learner_count: Number(r.learnerCount),
        percentage: r.percentage ? Number(r.percentage) : null,
      }))

    if (rowsToInsert.length > 0) {
      const { error: plError } = await supabase.from('pl_distribution').insert(rowsToInsert)
      if (plError) {
        setError(`Record saved, but proficiency breakdown failed: ${plError.message}`)
        setLoading(false)
        return
      }
    }

    router.push('/gsa-pl')
    router.refresh()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-6"
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

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Grade Level</label>
          <input
            value={gradeLevel}
            onChange={(e) => setGradeLevel(e.target.value)}
            required
            placeholder="e.g. Grade 7"
            className={fieldClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Learning Area</label>
          <input
            value={learningArea}
            onChange={(e) => setLearningArea(e.target.value)}
            required
            placeholder="e.g. Mathematics"
            className={fieldClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Section</label>
          <input
            value={section}
            onChange={(e) => setSection(e.target.value)}
            placeholder="e.g. Sampaguita"
            className={fieldClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Learner Count</label>
          <input
            type="number"
            value={learnerCount}
            onChange={(e) => setLearnerCount(e.target.value)}
            className={fieldClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Class Average</label>
          <input
            type="number"
            step="0.01"
            value={classAverage}
            onChange={(e) => setClassAverage(e.target.value)}
            className={fieldClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">School Average</label>
          <input
            type="number"
            step="0.01"
            value={schoolAverage}
            onChange={(e) => setSchoolAverage(e.target.value)}
            className={fieldClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Grade Level Average</label>
          <input
            type="number"
            step="0.01"
            value={gradeLevelAverage}
            onChange={(e) => setGradeLevelAverage(e.target.value)}
            className={fieldClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Previous Term Average <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <input
            type="number"
            step="0.01"
            value={previousTermAverage}
            onChange={(e) => setPreviousTermAverage(e.target.value)}
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-slate-700 mb-2">Proficiency Level Distribution</h3>
        <div className="border border-slate-200 rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-left">
              <tr>
                <th className="px-3 py-2 font-medium text-slate-600">Level</th>
                <th className="px-3 py-2 font-medium text-slate-600">Learner Count</th>
                <th className="px-3 py-2 font-medium text-slate-600">Percentage</th>
              </tr>
            </thead>
            <tbody>
              {plRows.map((row, i) => (
                <tr key={row.level} className="border-b border-slate-100 last:border-0">
                  <td className="px-3 py-2 text-slate-700">{row.level}</td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={row.learnerCount}
                      onChange={(e) => updatePlRow(i, 'learnerCount', e.target.value)}
                      className="w-24 rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B6E33]"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      step="0.01"
                      value={row.percentage}
                      onChange={(e) => updatePlRow(i, 'percentage', e.target.value)}
                      className="w-24 rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B6E33]"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
          {loading ? 'Saving...' : 'Save as Draft'}
        </button>
      </div>
    </form>
  )
}