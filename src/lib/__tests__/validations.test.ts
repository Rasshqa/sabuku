import { describe, it, expect } from '@jest/globals'
import { sanitizeHtml } from '@/lib/validations'

describe('Input Sanitization', () => {
  it('escapes HTML tags', () => {
    const input = '<script>alert("xss")</script>'
    const result = sanitizeHtml(input)
    expect(result).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;')
    expect(result).not.toContain('<')
    expect(result).not.toContain('>')
  })

  it('escapes quotes', () => {
    const input = `He said "hello" and 'bye'`
    const result = sanitizeHtml(input)
    expect(result).toContain('&quot;')
    expect(result).toContain('&#x27;')
  })

  it('preserves safe text', () => {
    const input = 'Normal text with numbers 123 and symbols: @#$%'
    const result = sanitizeHtml(input)
    expect(result).toContain('Normal text')
    expect(result).toContain('123')
    expect(result).toContain('@#$%')
  })
})
