'use client'

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="rounded-md bg-white border border-[#0B6E33] text-[#0B6E33] text-sm font-medium px-4 py-2 hover:bg-[#0B6E33] hover:text-white transition-colors print:hidden"
    >
      Export to PDF
    </button>
  )
}