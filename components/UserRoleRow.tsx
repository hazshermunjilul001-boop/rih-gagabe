'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const roles = [
  { value: 'viewer', label: 'Viewer' },
  { value: 'coordinator_encoder', label: 'Coordinator/Encoder' },
  { value: 'master_teacher', label: 'Master Teacher' },
  { value: 'school_head', label: 'School Head' },
  { value: 'psds_district', label: 'PSDS/District (Elementary)' },
  { value: 'psds_cluster', label: 'PSDS/Cluster (Secondary)' },
  { value: 'division_eps', label: 'Division EPS' },
  { value: 'admin', label: 'Admin' },
]

export default function UserRoleRow({
  id,
  fullName,
  currentRole,
  approved,
  claimedPosition,
  affiliation,
}: {
  id: string
  fullName: string
  currentRole: string
  approved: boolean
  claimedPosition: string | null
  affiliation: string
}) {
  const supabase = createClient()
  const [role, setRole] = useState(currentRole)
  const [isApproved, setIsApproved] = useState(approved)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setSaving(true)
    setSaved(false)

    const { error } = await supabase
      .from('profiles')
      .update({ role, approved: isApproved })
      .eq('id', id)

    setSaving(false)
    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  return (
    <tr className="border-b border-slate-100 last:border-0">
      <td className="px-4 py-3 text-slate-900">{fullName}</td>
      <td className="px-4 py-3 text-slate-600">{affiliation}</td>
      <td className="px-4 py-3 text-slate-600">{claimedPosition || '—'}</td>
      <td className="px-4 py-3">
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B6E33]"
        >
          {roles.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </td>
      <td className="px-4 py-3">
        <input
          type="checkbox"
          checked={isApproved}
          onChange={(e) => setIsApproved(e.target.checked)}
          className="h-4 w-4 accent-[#0B6E33]"
        />
      </td>
      <td className="px-4 py-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-md bg-[#0B6E33] text-white text-xs font-medium px-3 py-1.5 hover:bg-[#095C2A] disabled:opacity-60 transition-colors"
        >
          {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save'}
        </button>
      </td>
    </tr>
  )
}