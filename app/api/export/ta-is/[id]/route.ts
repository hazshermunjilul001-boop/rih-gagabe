import { NextResponse } from 'next/server'
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ShadingType,
} from 'docx'
import { createClient } from '@/lib/supabase/server'

const planTypeLabels: Record<string, string> = {
  ta_plan: 'TA Plan',
  is_plan: 'IS Plan',
  joint_ta_is: 'Joint TA/IS',
  followup_monitoring: 'Follow-up Monitoring',
}

const termLabels: Record<string, string> = {
  term_1: 'Term 1',
  term_2: 'Term 2',
  term_3: 'Term 3',
  year_end: 'Year-End',
}

function fieldRow(label: string, value: string) {
  return new TableRow({
    children: [
      new TableCell({
        width: { size: 30, type: WidthType.PERCENTAGE },
        shading: { type: ShadingType.SOLID, color: 'F4F5F4', fill: 'F4F5F4' },
        children: [new Paragraph({ children: [new TextRun({ text: label, bold: true })] })],
      }),
      new TableCell({
        width: { size: 70, type: WidthType.PERCENTAGE },
        children: [new Paragraph(value || '—')],
      }),
    ],
  })
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { data: plan, error } = await supabase
    .from('ta_is_plans')
    .select('*, schools:target_school_id(name)')
    .eq('id', id)
    .single()

  if (error || !plan) return new NextResponse('Plan not found', { status: 404 })

  const { data: reports } = await supabase
    .from('ta_is_reports')
    .select('*')
    .eq('plan_id', id)
    .order('created_at', { ascending: true })

  const reportParagraphs =
    reports && reports.length > 0
      ? reports.flatMap((r, i) => [
          new Paragraph({
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 300 },
            children: [
              new TextRun({ text: `${i + 1}. ${r.activity_conducted || 'Untitled Activity'}` }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Date Conducted: ', bold: true }),
              new TextRun({ text: r.date_conducted ?? '—' }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Findings: ', bold: true }),
              new TextRun({ text: r.findings || '—' }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Recommendations: ', bold: true }),
              new TextRun({ text: r.recommendations || '—' }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Issues Resolved: ', bold: true }),
              new TextRun({ text: r.issues_resolved || '—' }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Pending Concerns: ', bold: true }),
              new TextRun({ text: r.pending_concerns || '—' }),
            ],
          }),
        ])
      : [new Paragraph({ text: 'No reports filed yet.' })]

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'Research & Innovation HUB',
                bold: true,
                size: 28,
                color: '0B6E33',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
            children: [
              new TextRun({ text: 'Schools Division Office of Davao City', size: 20, color: '666666' }),
            ],
          }),
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            children: [
              new TextRun({
                text: `${planTypeLabels[plan.plan_type] ?? plan.plan_type} Report`,
              }),
            ],
          }),
          new Paragraph({ text: '', spacing: { after: 200 } }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              fieldRow('School', plan.schools?.name ?? '—'),
              fieldRow('Term', termLabels[plan.term] ?? plan.term),
              fieldRow('Target Date', plan.target_date ?? '—'),
              fieldRow('Basis of Action', plan.basis_of_action ?? '—'),
              fieldRow('Priority Focus', plan.priority_focus ?? '—'),
              fieldRow('Strategy', plan.strategy ?? '—'),
              fieldRow('Responsible Person', plan.responsible_person ?? '—'),
              fieldRow('Expected Output', plan.expected_output ?? '—'),
              fieldRow('Status', plan.status),
            ],
          }),
          new Paragraph({ text: '', spacing: { after: 300 } }),
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [new TextRun({ text: `Reports Filed (${reports?.length ?? 0})` })],
          }),
          ...reportParagraphs,
        ],
      },
    ],
  })

  const buffer = await Packer.toBuffer(doc)
  const filename = `TA_IS_Report_${id.slice(0, 8)}.docx`

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}