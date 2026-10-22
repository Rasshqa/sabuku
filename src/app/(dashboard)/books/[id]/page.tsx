import { requireAuth } from "@/lib/permissions"
import { getBookById } from "@/server/services/book.service"
import { notFound } from "next/navigation"
import Link from "next/link"

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await requireAuth()
  const book = await getBookById(id)

  if (!book) notFound()

  const isOwner = book.ownerId === user.id
  const isTargetReached = book.a5PageCount >= 60

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{book.title}</h1>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                {book.status}
              </span>
            </div>
            {book.subtitle && <p className="text-gray-500 mt-1">{book.subtitle}</p>}
            <p className="text-sm text-gray-600 mt-2">
              Penulis: <span className="font-semibold">{book.owner.name}</span> | Genre: {book.genre || '-'}
            </p>
          </div>
          <div className="flex gap-2">
            {book.versions.length > 0 && (
              <Link href={`/books/${book.id}/reader`} className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700">
                Baca Buku
              </Link>
            )}
            {isOwner && (
              <Link href={`/books/${book.id}/upload`} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
                Upload Naskah Baru
              </Link>
            )}
          </div>
        </div>

        <div className="mt-6 border-t pt-6">
          <div className="flex justify-between items-center mb-2">
            <div>
              <span className="text-sm text-gray-500 font-medium">Progress Halaman A5</span>
              <p className="text-2xl font-bold text-gray-900">{book.a5PageCount} / 60 Halaman</p>
            </div>
            <div className="text-right">
              {isTargetReached ? (
                <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold">
                  ✓ Target minimum tercapai
                </span>
              ) : (
                <span className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-semibold">
                  Masih membutuhkan {60 - book.a5PageCount} halaman
                </span>
              )}
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full"
              style={{ width: `${Math.min(book.a5PageCount / 60, 1) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-bold mb-4">Milestone</h2>
          <div className="space-y-3">
            {book.milestones.map((m) => (
              <div key={m.id} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={m.isCompleted}
                  readOnly
                  className="h-4 w-4 text-blue-600 rounded border-gray-300"
                />
                <span className={`text-sm ${m.isCompleted ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                  {m.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-bold mb-4">Riwayat Versi</h2>
          {book.versions.length === 0 ? (
            <p className="text-sm text-gray-500">Belum ada naskah yang diunggah.</p>
          ) : (
            <div className="space-y-3">
              {book.versions.map((v) => (
                <div key={v.id} className="border p-3 rounded-lg flex justify-between items-center bg-gray-50">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">Versi {v.versionNumber}</span>
                      {v.isCurrent && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">
                          Aktif
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {v.a5PageCount} halaman A5 ({v.totalPageCount} total)
                    </p>
                  </div>
                  <Link href={`/books/${book.id}/reader?version=${v.id}`} className="text-sm text-blue-600 hover:underline">
                    Buka
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
