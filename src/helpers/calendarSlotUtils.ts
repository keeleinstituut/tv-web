import dayjs from 'dayjs'

export const SLOT_WIDTH_PX = 48 // px per 30 min

export function timeToX(
  isoTime: string,
  dayStartHour: number,
  slotWidthPx = SLOT_WIDTH_PX
): number {
  const t = dayjs(isoTime)
  const hoursFromStart = t.hour() + t.minute() / 60 - dayStartHour
  return hoursFromStart * slotWidthPx * 2
}

export function durationToWidth(
  startIso: string,
  endIso: string,
  slotWidthPx = SLOT_WIDTH_PX
): number {
  const minutes = dayjs(endIso).diff(dayjs(startIso), 'minute')
  return (minutes / 30) * slotWidthPx
}

export function slotIndexToIso(
  index: number,
  date: string,
  dayStartHour: number
): string {
  const totalMinutes = index * 30
  const hours = dayStartHour + Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return dayjs(date)
    .hour(hours)
    .minute(minutes)
    .second(0)
    .millisecond(0)
    .toISOString()
}

export function isSlotPast(startIso: string): boolean {
  return dayjs(startIso).isBefore(dayjs())
}
