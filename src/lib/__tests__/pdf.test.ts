import { describe, it, expect } from '@jest/globals'
import { processPdf, isA5, isPdf } from '@/lib/pdf'
import { PDFDocument } from 'pdf-lib'

describe('PDF Processing', () => {
  it('detects PDF magic bytes', async () => {
    const pdfBuffer = Buffer.from('%PDF-1.4\n')
    expect(await isPdf(pdfBuffer)).toBe(true)
    
    const notPdf = Buffer.from('Hello World')
    expect(await isPdf(notPdf)).toBe(false)
  })

  it('validates A5 portrait dimensions', () => {
    expect(isA5(419.53, 595.28)).toBe(true)
    expect(isA5(420, 595)).toBe(true) // within 3% tolerance
    expect(isA5(500, 700)).toBe(false)
  })

  it('validates A5 landscape dimensions', () => {
    expect(isA5(595.28, 419.53)).toBe(true)
    expect(isA5(595, 420)).toBe(true) // within 3% tolerance
  })

  it('counts A5 pages correctly', async () => {
    const pdf = await PDFDocument.create()
    pdf.addPage([419.53, 595.28]) // A5 portrait
    pdf.addPage([595.28, 419.53]) // A5 landscape
    pdf.addPage([612, 792])       // US Letter
    
    const buffer = Buffer.from(await pdf.save())
    const result = await processPdf(buffer)
    
    expect(result.totalPageCount).toBe(3)
    expect(result.a5PageCount).toBe(2)
    expect(result.nonA5PageCount).toBe(1)
  })
})
