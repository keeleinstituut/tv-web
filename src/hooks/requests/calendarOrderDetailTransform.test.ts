import { describe, expect, it } from 'vitest'
import {
  transformProjectDetail,
  unwrapCalendarProjectPayload,
} from './calendarOrderDetailTransform'

describe('unwrapCalendarProjectPayload', () => {
  it('unwraps single data wrapper', () => {
    const inner = { id: 'p1', cancel_at: '2026-01-01T00:00:00Z' }
    expect(unwrapCalendarProjectPayload({ data: inner })).toEqual(inner)
  })

  it('returns flat object when already project-shaped', () => {
    const flat = { id: 'p1', ext_id: 'E1' }
    expect(unwrapCalendarProjectPayload(flat)).toEqual(flat)
  })
})

describe('transformProjectDetail', () => {
  it('maps cancel_at from snake_case', () => {
    const d = transformProjectDetail({
      id: 'i',
      ext_id: 'e',
      status: 'NEW',
      created_at: 't',
      cancel_at: '2026-06-15T14:00:00Z',
    })
    expect(d.cancel_at).toBe('2026-06-15T14:00:00Z')
  })

  it('maps cancelAt camelCase', () => {
    const d = transformProjectDetail({
      id: 'i',
      ext_id: 'e',
      status: 'NEW',
      created_at: 't',
      cancelAt: '2026-06-15T15:00:00Z',
    })
    expect(d.cancel_at).toBe('2026-06-15T15:00:00Z')
  })

  it('merges attributes.cancel_at', () => {
    const d = transformProjectDetail({
      id: 'i',
      ext_id: 'e',
      status: 'NEW',
      created_at: 't',
      attributes: { cancel_at: '2026-07-01T12:00:00Z' },
    })
    expect(d.cancel_at).toBe('2026-07-01T12:00:00Z')
  })
})
