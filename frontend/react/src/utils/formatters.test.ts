import { describe, it, expect } from 'vitest'
import { formatters } from './formatters'

describe('formatters', () => {
  describe('formatAddress', () => {
    it('should format a valid address', () => {
      const address = '0x1234567890abcdef1234567890abcdef12345678'
      const result = formatters.formatAddress(address)
      expect(result).toBe('0x1234...5678')
    })

    it('should handle undefined', () => {
      const result = formatters.formatAddress(undefined)
      expect(result).toBe('')
    })

    it('should handle empty string', () => {
      const result = formatters.formatAddress('')
      expect(result).toBe('')
    })
  })

  describe('weiToEther', () => {
    it('should convert wei to ether', () => {
      const wei = 1500000000000000000n
      const result = formatters.weiToEther(wei)
      expect(result).toBe(1.5)
    })

    it('should handle string input', () => {
      const wei = '1000000000000000000'
      const result = formatters.weiToEther(wei)
      expect(result).toBe(1.0)
    })
  })

  describe('toWei', () => {
    it('should convert decimal string to wei', () => {
      const result = formatters.toWei('1.5')
      expect(result).toBe(1500000000000000000n)
    })

    it('should handle whole numbers', () => {
      const result = formatters.toWei('10')
      expect(result).toBe(10000000000000000000n)
    })

    it('should handle zero', () => {
      const result = formatters.toWei('0')
      expect(result).toBe(0n)
    })
  })

  describe('isAddress', () => {
    it('should return true for valid address', () => {
      expect(formatters.isAddress('0x1234567890abcdef1234567890abcdef12345678')).toBe(true)
    })

    it('should return false for invalid address', () => {
      expect(formatters.isAddress('invalid')).toBe(false)
    })
  })
})