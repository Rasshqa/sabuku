"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function UploadPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const { id } = await params;
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/books/${id}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal mengunggah file");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Upload Naskah</h1>
        <p className="text-sm text-gray-500 mt-1">
          Format yang disarankan: PDF. PDF direkomendasikan agar naskah dapat ditampilkan dengan format yang konsisten pada Book Reader.
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        {error && (
          <div className="mb-4 bg-red-50 text-red-700 p-4 rounded-md text-sm">
            {error}
          </div>
        )}

        {result ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-5">
              <h3 className="font-bold text-green-800 text-lg">Naskah berhasil diproses.</h3>
              <div className="mt-3 space-y-1 text-sm text-gray-700">
                <p><span className="font-medium">Halaman A5:</span> {result.a5PageCount} halaman</p>
                <p><span className="font-medium">Total Halaman:</span> {result.totalPageCount} halaman</p>
                <p><span className="font-medium">Target minimum:</span> 60 halaman</p>
                <p className={`font-bold mt-2 ${result.a5PageCount >= 60 ? 'text-green-600' : 'text-yellow-600'}`}>
                  Status: {result.a5PageCount >= 60 ? '✓ Memenuhi target' : `Belum memenuhi target (kurang ${60 - result.a5PageCount} halaman)`}
                </p>
              </div>
            </div>
            <button
              onClick={() => router.back()}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
            >
              Kembali ke Detail Buku
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-50 text-blue-700 border border-blue-200 px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-100"
              >
                Pilih File
              </button>
              <p className="text-xs text-gray-500 mt-2">PDF, DOC, DOCX hingga 50MB</p>
              {file && <p className="text-sm font-medium text-gray-900 mt-4">{file.name}</p>}
            </div>

            <div className="flex justify-end gap-3">
              <Link href="/dashboard" className="px-4 py-2 border rounded-md text-sm text-gray-700 hover:bg-gray-50">
                Batal
              </Link>
              <button
                type="button"
                onClick={handleUpload}
                disabled={!file || uploading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                {uploading ? "Memproses..." : "Upload Naskah"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
