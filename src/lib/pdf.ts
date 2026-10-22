import { PDFDocument } from 'pdf-lib'

// A5: 148 × 210 mm
// PDF units are points (1pt = 25.4/72 mm)
// A5 in points: 419.53 × 595.28
// Tolerance: ±3% for conversion/rendering variance
const A5_WIDTH_PT = 419.53
const A5_HEIGHT_PT = 595.28
const TOLERANCE = 0.03

export type PdfProcessingResult = {
  totalPageCount: number
  a5PageCount: number
  nonA5PageCount: number
}

export async function processPdf(buffer: Buffer): Promise<PdfProcessingResult> {
  const pdf = await PDFDocument.load(buffer)

  const pages = pdf.getPages()
  let a5PageCount = 0

  for (const page of pages) {
    const { width, height } = page.getSize()
    if (isA5(width, height)) {
      a5PageCount++
    }
  }

  return {
    totalPageCount: pages.length,
    a5PageCount,
    nonA5PageCount: pages.length - a5PageCount,
  }
}

export function isA5(width: number, height: number): boolean {
  // Check both orientations
  const isPortraitA5 =
    Math.abs(width - A5_WIDTH_PT) / A5_WIDTH_PT <= TOLERANCE &&
    Math.abs(height - A5_HEIGHT_PT) / A5_HEIGHT_PT <= TOLERANCE

  const isLandscapeA5 =
    Math.abs(width - A5_HEIGHT_PT) / A5_HEIGHT_PT <= TOLERANCE &&
    Math.abs(height - A5_WIDTH_PT) / A5_WIDTH_PT <= TOLERANCE

  return isPortraitA5 || isLandscapeA5
}

export async function isPdf(buffer: Buffer): Promise<boolean> {
  const magic = buffer.subarray(0, 5).toString()
  return magic === '%PDF-'
}

// pdf-lib metadata extraction (title, author)
export async function extractMetadata(buffer: Buffer) {
  const pdf = await PDFDocument.load(buffer)
  return {
    title: pdf.getTitle() ?? null,
    author: pdf.getAuthor() ?? null,
  }
}
