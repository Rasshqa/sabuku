import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const role = session.user?.role

  return (
    <div className="min-h-screen pb-16" style={{ backgroundColor: '#F7F7F8' }}>
      {/* Large rounded navbar */}
      <div className="pt-6 px-4">
        <nav 
          className="px-6 py-8 mx-auto flex items-center justify-between"
          style={{
            backgroundColor: '#171717',
            borderRadius: '32px',
            maxWidth: '94vw',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
          }}
        >
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white">
              <span style={{ color: '#FFCDB8' }}>SA</span>
              <span style={{ color: '#B9E6E8' }}>BUKU</span>
            </span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-8">
            <Link 
              href="/library" 
              className="text-white/80 hover:text-white text-sm font-medium transition-colors"
            >
              Buku
            </Link>
            <Link 
              href="/dashboard" 
              className="text-white/80 hover:text-white text-sm font-medium transition-colors"
            >
              Kegiatan
            </Link>
            <Link 
              href="/books" 
              className="text-white/80 hover:text-white text-sm font-medium transition-colors"
            >
              Penulis
            </Link>
            {role === "ADMIN" && (
              <Link 
                href="/admin" 
                className="text-white/80 hover:text-white text-sm font-medium transition-colors"
              >
                Admin
              </Link>
            )}
            <div className="flex items-center gap-4 ml-4 pl-4 border-l border-white/20">
              <span className="text-white/60 text-sm">
                {session.user?.name}
              </span>
              <Link 
                href="/api/auth/signout" 
                className="text-white/80 hover:text-white text-sm transition-colors"
              >
                Keluar
              </Link>
            </div>
          </div>

          {/* Mobile menu */}
          <button className="md:hidden text-white text-sm">
            Menu
          </button>
        </nav>
      </div>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-8 py-20">
        {children}
      </main>
    </div>
  )
}
