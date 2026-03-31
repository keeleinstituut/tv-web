import dayjs from 'dayjs'
import type { CalendarOrderDetail } from 'types/calendar'

/** True when the booking time window has ended (wall clock). BE may still return NEW. */
export function isCalendarBookingEventEnded(
  endAt: string | null | undefined
): boolean {
  if (endAt == null || typeof endAt !== 'string' || !endAt.trim()) return false
  return dayjs(endAt).isBefore(dayjs())
}

/** Non-empty scheduled cancellation time from order detail (after transform). */
export function hasScheduledCancelAt(
  order: Pick<CalendarOrderDetail, 'cancel_at'> | null | undefined
): boolean {
  const v = order?.cancel_at
  return typeof v === 'string' && v.trim().length > 0
}

/** User can still decline / undo within local grace or while server has cancel_at set. */
export function inReversibleCancelWindow(params: {
  order: Pick<CalendarOrderDetail, 'cancel_at'> | null | undefined
  isCancelled: boolean
  isCancelPending: boolean
}): boolean {
  return (
    (params.isCancelled && params.isCancelPending) ||
    hasScheduledCancelAt(params.order)
  )
}

/** Side panel: switch to “past” body only when slot is truly finished (not mid cancel-undo). */
export function sidePanelIsPastSlot(params: {
  assignmentWorkEnded: boolean
  orderTerminal: boolean
  isCancelled: boolean
  inReversibleCancelWindow: boolean
  /** Event end is in the past while project may still be NEW (BE does not time-transition status). */
  eventEndedByClock?: boolean
}): boolean {
  return (
    params.assignmentWorkEnded ||
    params.orderTerminal ||
    (params.isCancelled && !params.inReversibleCancelWindow) ||
    (Boolean(params.eventEndedByClock) && !params.inReversibleCancelWindow)
  )
}

/** Order detail page: “past” for layout/actions — reversible cancel still editable view. */
export function orderDetailIsPast(params: {
  order: Pick<CalendarOrderDetail, 'status' | 'cancel_at' | 'end_at'> | null | undefined
  isCancelled: boolean
  isCancelPending: boolean
}): boolean {
  const rev = inReversibleCancelWindow({
    order: params.order,
    isCancelled: params.isCancelled,
    isCancelPending: params.isCancelPending,
  })
  if (
    params.order?.status === 'CANCELLED' ||
    params.order?.status === 'ACCEPTED'
  ) {
    return true
  }
  if (params.isCancelled && !rev) {
    return true
  }
  if (rev) {
    return false
  }
  if (isCalendarBookingEventEnded(params.order?.end_at)) {
    return true
  }
  return false
}

/** Same visibility rule as calendar side panel yellow banner. */
export function showScheduledCancelBanner(params: {
  order: Pick<CalendarOrderDetail, 'cancel_at'> | null | undefined
  isCancelled: boolean
  isCancelPending: boolean
}): boolean {
  return (
    hasScheduledCancelAt(params.order) ||
    (params.isCancelled && params.isCancelPending)
  )
}
