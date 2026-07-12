import { NextResponse } from 'next/server'
import ExcelJS from 'exceljs'
import { createClient } from '@/lib/supabase/server'

const termLabels: Record<string, string> = {
  term_1: 'Term 1',
  term_2: 'Term 2',
  term_3: 'Term 3',
  year_end: 'Year-End',
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { data: records, error } = await supabase
    .from('gsa_pl_records')
    .select(
      'term, grade_level, learning_area, section, learner_count, class_average, school_average, grade_level_average, status, schools(name)'
    )
    .order('created_at', { ascending: false })

  if (error) return new NextResponse(error.message, { status: 500 })

  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Research & Innovation HUB'
  workbook.created = new Date()

  const sheet = workbook.addWorksheet('GSA-PL Records')

  sheet.columns = [
    { header: 'Term', key: 'term', width: 12 },
    { header: 'School', key: 'school', width: 32 },
    { header: 'Grade Level', key: 'grade_level', width: 12 },
    { header: 'Section', key: 'section', width: 14 },
    { header: 'Learning Area', key: 'learning_area', width: 18 },
    { header: 'Learner Count', key: 'learner_count', width: 14 },
    { header: 'Class Average', key: 'class_average', width: 14 },
    { header: 'School Average', key: 'school_average', width: 14 },
    { header: 'Grade Level Average', key: 'grade_level_average', width: 18 },
    { header: 'Status', key: 'status', width: 14 },
  ]

  const headerRow = sheet.getRow(1)
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0B6E33' } }
  headerRow.alignment = { vertical: 'middle' }

  type RecordRow = {
    term: string
    grade_level: string
    learning_area: string
    section: string | null
    learner_count: number | null
    class_average: number | null
    school_average: number | null
    grade_level_average: number | null
    status: string
    schools: { name: string } | null
  }

  ;(records as unknown as RecordRow[])?.forEach((r) => {
    sheet.addRow({
      term: termLabels[r.term] ?? r.term,
      school: r.schools?.name ?? '',
      grade_level: r.grade_level,
      section: r.section ?? '',
      learning_area: r.learning_area,
      learner_count: r.learner_count,
      class_average: r.class_average,
      school_average: r.school_average,
      grade_level_average: r.grade_level_average,
      status: r.status,
    })
  })

  sheet.autoFilter = { from: 'A1', to: 'J1' }
  sheet.views = [{ state: 'frozen', ySplit: 1 }]

  const buffer = await workbook.xlsx.writeBuffer()
  const filename = `GSA_PL_Records_${new Date().toISOString().slice(0, 10)}.xlsx`

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}