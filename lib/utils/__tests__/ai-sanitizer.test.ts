import { sanitizeAiOutput, detectHarmfulContent, safeAiHtml } from '../ai-sanitizer'

describe('AI Sanitizer', () => {
  describe('sanitizeAiOutput', () => {
    it('returns empty string for empty input', () => {
      expect(sanitizeAiOutput('')).toBe('')
    })

    it('returns content when no harmful patterns detected', () => {
      const content = 'This is safe content'
      const result = sanitizeAiOutput(content)
      expect(result).toContain('safe content')
    })

    it('truncates content when over max length', () => {
      const longContent = 'a'.repeat(6000)
      const result = sanitizeAiOutput(longContent, { maxLength: 100 })
      expect(result.length).toBeLessThanOrEqual(100)
    })

    it('filters harmful content', () => {
      const harmfulContent = 'How to hack a system'
      const result = sanitizeAiOutput(harmfulContent)
      expect(result).toBe('[Content filtered for safety reasons]')
    })

    it('respects custom options', () => {
      const content = 'Test content'
      const result = sanitizeAiOutput(content, { 
        maxLength: 5,
        checkForHarmfulContent: false 
      })
      expect(result.length).toBeLessThanOrEqual(5)
    })
  })

  describe('detectHarmfulContent', () => {
    it('detects hack-related content', () => {
      expect(detectHarmfulContent('how to hack something')).toBe(true)
      expect(detectHarmfulContent('How to HACK a system')).toBe(true)
    })

    it('detects malware-related content', () => {
      expect(detectHarmfulContent('create virus software')).toBe(true)
      expect(detectHarmfulContent('make malware tool')).toBe(true)
    })

    it('detects security bypass attempts', () => {
      expect(detectHarmfulContent('bypass security measures')).toBe(true)
      expect(detectHarmfulContent('circumvent security')).toBe(true)
    })

    it('detects JavaScript injection patterns', () => {
      expect(detectHarmfulContent('script: alert(1)')).toBe(true)
      expect(detectHarmfulContent('javascript void(0)')).toBe(true)
      expect(detectHarmfulContent('onerror=alert')).toBe(true)
      expect(detectHarmfulContent('onclick=malicious')).toBe(true)
    })

    it('detects eval patterns', () => {
      expect(detectHarmfulContent('eval(someCode)')).toBe(true)
    })

    it('allows safe content', () => {
      expect(detectHarmfulContent('This is normal content')).toBe(false)
      expect(detectHarmfulContent('How to bake a cake')).toBe(false)
      expect(detectHarmfulContent('JavaScript programming tutorial')).toBe(false)
    })
  })

  describe('safeAiHtml', () => {
    it('returns object with __html property', () => {
      const content = 'Test content'
      const result = safeAiHtml(content)
      expect(result).toHaveProperty('__html')
      expect(typeof result.__html).toBe('string')
    })

    it('sanitizes content before returning', () => {
      const harmfulContent = 'how to hack systems'
      const result = safeAiHtml(harmfulContent)
      expect(result.__html).toBe('[Content filtered for safety reasons]')
    })
  })
})