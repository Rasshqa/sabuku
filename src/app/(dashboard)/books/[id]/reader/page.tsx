"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function BookReaderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLandscape, setIsLandscape] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const versionId = searchParams.get("version");

  useEffect(() => {
    const checkOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };
    checkOrientation();
    window.addEventListener("resize", checkOrientation);
    return () => window.removeEventListener("resize", checkOrientation);
  }, []);

  useEffect(() => {
    async function fetchPdfUrl() {
      try {
        const resolvedParams = await params;
        const url = `/api/books/${resolvedParams.id}/reader${versionId ? `?versionId=${versionId}` : ''}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Gagal memuat PDF');
        const data = await res.json();
        setPdfUrl(data.url);
      } catch (err: any) {
        setError(err.message || 'Terjadi kesalahan');
      } finally {
        setLoading(false);
      }
    }
    fetchPdfUrl();
  }, [params, versionId]);

  if (!isLandscape && typeof window !== "undefined" && window.innerWidth < 768) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900 text-white p-6">
        <div className="text-center space-y-4">
          <div className="text-4xl">↻</div>
          <h2 className="text-xl font-bold">Putar Perangkat Anda</h2>
          <p className="text-sm text-gray-300">
            Untuk pengalaman membaca yang lebih baik, Book Reader SABUKU membutuhkan orientasi landscape.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-sm text-gray-300">Memuat PDF...</p>
        </div>
      </div>
    );
  }

  if (error || !pdfUrl) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900 text-white p-6">
        <div className="text-center space-y-4">
          <div className="text-4xl">⚠️</div>
          <h2 className="text-xl font-bold">Gagal Memuat PDF</h2>
          <p className="text-sm text-gray-300">{error || 'File tidak ditemukan'}</p>
          <button onClick={() => router.back()} className="px-4 py-2 bg-blue-600 rounded text-sm hover:bg-blue-700">
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-900 text-white flex flex-col">
      <div className="bg-gray-800 px-6 py-4 flex justify-between items-center border-b border-gray-700">
        <button onClick={() => router.back()} className="text-sm text-gray-300 hover:text-white">
          ← Tutup Reader
        </button>
        <span className="text-sm font-semibold">SABUKU Book Reader</span>
        <div className="text-xs text-gray-400">Halaman {currentPage}</div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="flex gap-6 max-w-5xl w-full justify-center">
          <iframe
            src={pdfUrl}
            className="w-full h-full border-0 rounded shadow-lg"
            title="PDF Reader"
          />
        </div>
      </div>

      <div className="bg-gray-800 px-6 py-4 flex justify-center items-center gap-6 border-t border-gray-700">
        <a href={pdfUrl} download className="px-4 py-2 bg-blue-600 rounded text-sm hover:bg-blue-700">
          Download PDF
        </a>
      </div>
    </div>
  );
}
