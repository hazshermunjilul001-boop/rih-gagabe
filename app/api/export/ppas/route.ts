import { NextResponse } from 'next/server'
import ExcelJS from 'exceljs'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { data: ppas, error } = await supabase
    .from('ppas')
    .select(
      'title, category, description, target_beneficiaries, responsible_person, start_date, end_date, status, schools(name)'
    )
    .order('created_at', { ascending: false })

  if (error) return new NextResponse(error.message, { status: 500 })

  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Research & Innovation HUB'
  workbook.created = new Date()

  const sheet = workbook.addWorksheet('PPAs')

  sheet.columns = [
    { header: 'Title', key: 'title', width: 32 },
    { header: 'Category', key: 'category', width: 20 },
    { header: 'School', key: 'school', width: 30 },
    { header: 'Target Beneficiaries', key: 'target_beneficiaries', width: 26 },
    { header: 'Responsible Person', key: 'responsible_person', width: 22 },
    { header: 'Start Date', key: 'start_date', width: 14 },
    { header: 'End Date', key: 'end_date', width: 14 },
    { header: 'Status', key: 'status', width: 14 },
    { header: 'Description', key: 'description', width: 40 },
  ]

  const headerRow = sheet.getRow(1)
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0B6E33' } }
  headerRow.alignment = { vertical: 'middle' }

  type PpaRow = {
    title: string
    category: string
    description: string | null
    target_beneficiaries: string | null
    responsible_person: string | null
    start_date: string | null
    end_date: string | null
    status: string
    schools: { name: string } | null
  }

  ;(ppas as unknown as PpaRow[])?.forEach((p) => {
    sheet.addRow({
      title: p.title,
      category: p.category.replaceAll('_', ' '),
      school: p.schools?.name ?? '',
      target_beneficiaries: p.target_beneficiaries ?? '',
      responsible_person: p.responsible_person ?? '',
      start_date: p.start_date ?? '',
      end_date: p.end_date ?? '',
      status: p.status,
      description: p.description ?? '',
    })
  })

  sheet.autoFilter = { from: 'A1', to: 'I1' }
  sheet.views = [{ state: 'frozen', ySplit: 1 }]

  const buffer = await workbook.xlsx.writeBuffer()
  const filename = `PPAs_${new Date().toISOString().slice(0, 10)}.xlsx`

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}