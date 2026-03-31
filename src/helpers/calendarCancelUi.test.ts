import { describe, expect, it } from 'vitest'
import {
  hasScheduledCancelAt,
  inReversibleCancelWindow,
  orderDetailIsPast,
  showScheduledCancelBanner,
  sidePanelIsPastSlot,
} from './calendarCancelUi'

describe('calendarCancelUi', () => {
  it('hasScheduledCancelAt', () => {
    expect(hasScheduledCancelAt(null)).toBe(false)
    expect(hasScheduledCancelAt({ cancel_at: '' })).toBe(false)
    expect(hasScheduledCancelAt({ cancel_at: '  ' })).toBe(false)
    expect(hasScheduledCancelAt({ cancel_at: '2026-03-30T12:00:00Z' })).toBe(
      true
    )
  })

  it('inReversibleCancelWindow', () => {
    expect(
      inReversibleCancelWindow({
        order: null,
        isCancelled: true,
        isCancelPending: true,
      })
    ).toBe(true)
    expect(
      inReversibleCancelWindow({
        order: null,
        isCancelled: true,
        isCancelPending: false,
      })
    ).toBe(false)
    expect(
      inReversibleCancelWindow({
        order: { cancel_at: '2026-04-01T10:00:00Z' },
        isCancelled: false,
        isCancelPending: false,
      })
    ).toBe(true)
  })

  it('showScheduledCancelBanner', () => {
    expect(
      showScheduledCancelBanner({
        order: null,
        isCancelled: true,
        isCancelPending: true,
      })
    ).toBe(true)
    expect(
      showScheduledCancelBanner({
        order: { cancel_at: '2026-04-01T10:00:00Z' },
        isCancelled: false,
        isCancelPending: false,
      })
    ).toBe(true)
  })

  it('sidePanelIsPastSlot', () => {
    expect(
      sidePanelIsPastSlot({
        assignmentWorkEnded: true,
        orderTerminal: false,
        isCancelled: false,
        inReversibleCancelWindow: false,
      })
    ).toBe(true)
    expect(
      sidePanelIsPastSlot({
        assignmentWorkEnded: false,
        orderTerminal: false,
        isCancelled: true,
        inReversibleCancelWindow: true,
      })
    ).toBe(false)
    expect(
      sidePanelIsPastSlot({
        assignmentWorkEnded: false,
        orderTerminal: false,
        isCancelled: true,
        inReversibleCancelWindow: false,
      })
    ).toBe(true)
  })

  it('orderDetailIsPast', () => {
    expect(
      orderDetailIsPast({
        order: { status: 'ACCEPTED', cancel_at: undefined },
        isCancelled: false,
        isCancelPending: false,
      })
    ).toBe(true)
    expect(
      orderDetailIsPast({
        order: { status: 'NEW', cancel_at: undefined },
        isCancelled: true,
        isCancelPending: true,
      })
    ).toBe(false)
    expect(
      orderDetailIsPast({
        order: { status: 'NEW', cancel_at: undefined },
        isCancelled: true,
        isCancelPending: false,
      })
    ).toBe(true)
  })
})
