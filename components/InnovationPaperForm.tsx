'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const categories = [
  'Instructional Innovation',
  'Learning Resource Innovation',
  'Assessment Innovation',
  'Learner Support Innovation',
  'Other',
]

const classifications = [
  'A - Attendance Sheet, Orientation Documentation, and Initial Commitment List',
  'B - Learning Gap Analysis Template',
]

const fieldClass =
  'w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B6E33] focus:border-[#0B6E33]'

export default function InnovationPaperForm() {
  const router = useRouter()
  const supabase = createClient()

  const [teacherName, setTeacherName] = useState('')
  const [schoolNameRaw, setSchoolNameRaw] = useState('')
  const [clusterDistrictRaw, setClusterDistrictRaw] = useState('')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(categories[0])
  const [classification, setClassification] = useState(classifications[0])
  const [fileUrl, setFileUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await supabase.from('innovation_papers').insert({
      teacher_name: teacherName,
      school_name_raw: schoolNameRaw,
      cluster_district_raw: clusterDistrictRaw,
      title,
      category,
      classification,
      file_url: fileUrl,
      status: 'submitted',
      submitted_at: new Date().toISOString(),
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/innovation-papers')
    router.refresh()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-4"
    >
      <p className="text-xs text-slate-400 bg-slate-50 border border-slate-200 rounded-md px-3 py-2">
        A tracking number will be assigned automatically once saved.
      </p>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Teacher Name</label>
        <input
          value={teacherName}
          onChange={(e) => setTeacherName(e.target.value)}
          required
          className={fieldClass}
          placeholder="Juan Dela Cruz"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">School</label>
          <input
            value={schoolNameRaw}
            onChange={(e) => setSchoolNameRaw(e.target.value)}
            required
            className={fieldClass}
            placeholder="e.g. Sta. Ana National High School"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Cluster / District</label>
          <input
            value={clusterDistrictRaw}
            onChange={(e) => setClusterDistrictRaw(e.target.value)}
            className={fieldClass}
            placeholder="e.g. Cluster 1 / Sta. Ana District"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={fieldClass}
          placeholder="Title of the innovation paper or attachment"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={fieldClass}>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Classification</label>
          <select
            value={classification}
            onChange={(e) => setClassification(e.target.value)}
            className={fieldClass}
          >
            {classifications.map((c) => (
              <option key={c} value={c}>{c}</option>
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
          {loading ? 'Saving...' : 'Submit'}
        </button>
      </div>
    </form>
  )
}