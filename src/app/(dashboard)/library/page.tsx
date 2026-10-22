import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function LibraryPage() {
  const books = await prisma.book.findMany({
    where: {
      OR: [
        { visibility: "SCHOOL" },
        { visibility: "PUBLIC" },
      ],
    },
    include: {
      owner: true,
    },
    orderBy: { createdAt: "desc" },
  })

  const pastelColors = [
    '#FFCDB8', '#FFE4A8', '#C7EBD5', '#B9E6E8',
    '#B9E2F2', '#C9C8F3', '#F2B5D4', '#F5B1A8'
  ]

  const genres = Array.from(new Set(books.map(b => b.genre || "Umum")))

  return (
    <div className="space-y-16">
      {/* Search */}
      <div className="space-y-8">
        <div className="max-w-4xl mx-auto">
          <input
            type="search"
            placeholder="Cari buku..."
            className="w-full px-8 text-lg border-0 focus:outline-none focus:ring-2"
            style={{
              height: '80px',
              borderRadius: '24px',
              backgroundColor: 'white',
              boxShadow: '0 6px 24px rgba(0, 0, 0, 0.05)'
            }}
          />
        </div>

        {/* Category pills */}
        <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
          {genres.map((genre, i) => (
            <button
              key={genre}
              className="px-6 py-3 font-medium whitespace-nowrap transition-colors"
              style={{
                borderRadius: '18px',
                backgroundColor: pastelColors[i % pastelColors.length],
                color: '#171717'
              }}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Books */}
      {books.length === 0 ? (
        <div 
          className="text-center py-16 bg-white"
          style={{
            borderRadius: '24px',
            boxShadow: '0 6px 24px rgba(0, 0, 0, 0.05)',
            padding: '64px 32px'
          }}
        >
          <p className="text-gray-500">Belum ada buku publik.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {books.map((book) => (
            <div 
              key={book.id} 
              className="bg-white p-8"
              style={{
                borderRadius: '24px',
                boxShadow: '0 6px 24px rgba(0, 0, 0, 0.05)'
              }}
            >
              <div className="flex gap-6 items-center">
                <div 
                  className="flex-shrink-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-3"
                  style={{
                    width: '96px',
                    height: '144px',
                    borderRadius: '8px'
                  }}
                >
                  <span className="text-xs font-medium text-gray-700 text-center line-clamp-4">
                    {book.title}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="editorial text-gray-900 mb-2 text-lg">
                    {book.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-1">{book.owner.name}</p>
                  <p className="text-xs text-gray-500">{book.a5PageCount} halaman</p>
                  <Link
                    href={`/books/${book.id}`}
                    className="inline-block mt-4 text-sm hover:underline"
                    style={{ color: '#F2B5D4' }}
                  >
                    Lihat buku →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
