import { requireAuth } from "@/lib/permissions"
import { getUserBooks } from "@/server/services/book.service"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function DashboardPage() {
  const user = await requireAuth()

  if (user.role === 'ADMIN' || user.role === 'TEACHER') {
    const totalUsers = await prisma.user.count()
    const activeBooks = await prisma.book.count({ where: { status: { not: 'COMPLETED' } } })
    const targetReached = await prisma.book.count({ where: { a5PageCount: { gte: 60 } } })
    const waitingReview = await prisma.book.count({ where: { status: 'WAITING_FOR_REVIEW' } })

    const recentBooks = await prisma.book.findMany({
      take: 10,
      orderBy: { updatedAt: 'desc' },
      include: { owner: true },
    })

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard {user.role === 'ADMIN' ? 'Admin' : 'Guru Pembimbing'}</h1>
        </div>
        
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg p-5">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Peserta</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{totalUsers}</dd>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg p-5">
            <dt className="text-sm font-medium text-gray-500 truncate">Buku Aktif</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{activeBooks}</dd>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg p-5">
            <dt className="text-sm font-medium text-gray-500 truncate">Menunggu Review</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{waitingReview}</dd>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg p-5">
            <dt className="text-sm font-medium text-gray-500 truncate">Memenuhi Target</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{targetReached}</dd>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Buku Terbaru</h3>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Penulis</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Judul</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Halaman A5</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentBooks.map((book) => (
                <tr key={book.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{book.owner.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{book.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {book.a5PageCount} / 60
                    {book.a5PageCount >= 60 && <span className="ml-2 text-green-600">✓ Target</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {book.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link href={`/books/${book.id}`} className="text-blue-600 hover:text-blue-900">
                      Detail
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // Student view
  const { books: userBooks } = await getUserBooks(user.id)
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Selamat datang, {user.name}</h1>
        </div>
        <Link href="/books/new" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          Buat Buku Baru
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {userBooks.map((book) => {
          const progress = Math.min(book.a5PageCount / book.targetPages, 1) * 100
          const targetReached = book.a5PageCount >= 60

          return (
            <div key={book.id} className="bg-white border rounded-lg shadow-sm p-5">
              <div className="flex justify-between items-start">
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                  {book.status}
                </span>
                <span className="text-xs text-gray-500">{book.genre || 'Umum'}</span>
              </div>
              <h3 className="mt-3 text-lg font-bold text-gray-900 truncate">{book.title}</h3>
              
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Halaman A5</span>
                  <span>{book.a5PageCount} / {book.targetPages}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${progress}%` }} />
                </div>
                <p className={`mt-2 text-xs font-semibold ${targetReached ? 'text-green-600' : 'text-gray-500'}`}>
                  {targetReached ? '✓ Target minimum tercapai' : `Masih membutuhkan ${60 - book.a5PageCount} halaman`}
                </p>
              </div>

              <div className="mt-6 flex gap-3">
                <Link href={`/books/${book.id}`} className="flex-1 text-center bg-gray-50 border px-3 py-2 text-sm rounded-md hover:bg-gray-100">
                  Detail
                </Link>
                {book.versions.length > 0 && (
                  <Link href={`/books/${book.id}/reader`} className="flex-1 text-center bg-blue-50 text-blue-700 border border-blue-200 px-3 py-2 text-sm rounded-md hover:bg-blue-100">
                    Baca
                  </Link>
                )}
              </div>
            </div>
          )
        })}
        {userBooks.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 mb-4">Belum ada buku. Mulai tulis karya pertamamu sekarang.</p>
            <Link href="/books/new" className="text-blue-600 font-medium hover:underline">
              Buat Buku
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
