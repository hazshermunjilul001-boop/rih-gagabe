import Link from 'next/link'

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/ppas', label: 'PPAs' },
  { href: '/gsa-pl', label: 'Learner Perf.' },
  { href: '/dlp', label: 'DLP' },
  { href: '/dmea', label: 'DMEA' },
  { href: '/ta-is', label: 'TA/IS' },
  { href: '/kra', label: 'KRA' },
  { href: '/innovation-papers', label: 'Innovations' },
]

export default function Navbar({ role, email }: { role: string; email: string }) {
  return (
    <>
      <div className="bg-[#0B6E33] h-1.5 w-full" />
      <header className="bg-[#232323]">
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/divlogo.webp"
              alt="Division Logo"
              className="h-7 w-7 rounded-full object-cover shrink-0 bg-white"
            />
            <span className="text-white text-xs font-medium whitespace-nowrap hidden xl:inline">
              Research &amp; Innovation HUB
            </span>
          </Link>

          <nav className="flex items-center gap-3 shrink-0">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-slate-300 text-xs font-medium whitespace-nowrap hover:text-yellow-400 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {role === 'admin' && (
              <Link
                href="/admin/users"
                className="text-slate-300 text-xs font-medium whitespace-nowrap hover:text-yellow-400 transition-colors"
              >
                Users
              </Link>
            )}
          </nav>

          <div className="flex-1" />

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-slate-400 text-xs whitespace-nowrap hidden 2xl:inline truncate max-w-[180px]">
              {email}
            </span>
            <span className="inline-flex items-center rounded-full bg-[#E8A33D] text-[#232323] text-xs font-semibold px-3 py-1 whitespace-nowrap">
              {role}
            </span>
          </div>
        </div>
      </header>
    </>
  )
}