import { FC, useMemo, useState, useEffect } from 'react'
import type { SlotStepMinutes } from '../../types/calendar'
import classes from './CalendarTimeRow.module.scss'

const TIMEZONE = 'Europe/Tallinn'

function getDateYmdInTimezone(d: Date, timeZone: string): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  return formatter.format(d)
}

function getMinutesSinceMidnightInTimezone(timeZone: string): number {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
  const parts = formatter.formatToParts(new Date())
  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? 0)
  const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? 0)
  return hour * 60 + minute
}

export interface CalendarTimeRowProps {
  date: Date
  startHour?: number
  endHour?: number
  /** 30 = half-hour columns (09, 09:30, …), 60 = hour columns (09–21). */
  slotStepMinutes?: SlotStepMinutes
  timeZone?: string
}

function formatSlotLabel(hour: number, stepMinutes: SlotStepMinutes): string {
  const h = Math.floor(hour)
  const label = h.toString().padStart(2, '0')
  if (stepMinutes === 60) return label
  const m = hour % 1
  return m === 0 ? label : `${label}:30`
}

export const CalendarTimeRow: FC<CalendarTimeRowProps> = ({
  date,
  startHour = 9,
  endHour = 21,
  slotStepMinutes = 60,
  timeZone = TIMEZONE,
}) => {
  const [nowMinutes, setNowMinutes] = useState(() =>
    getMinutesSinceMidnightInTimezone(timeZone)
  )

  useEffect(() => {
    const tick = () =>
      setNowMinutes(getMinutesSinceMidnightInTimezone(timeZone))
    const id = setInterval(tick, 60_000)
    return () => clearInterval(id)
  }, [timeZone])

  const selectedYmd = useMemo(
    () => getDateYmdInTimezone(date, timeZone),
    [date, timeZone]
  )
  const todayYmd = useMemo(
    () => getDateYmdInTimezone(new Date(), timeZone),
    [timeZone]
  )
  const isToday = selectedYmd === todayYmd

  const slotLabels = useMemo(() => {
    const stepHour = slotStepMinutes / 60
    const list: number[] = []
    for (let t = startHour; t <= endHour; t += stepHour) list.push(t)
    return list
  }, [startHour, endHour, slotStepMinutes])

  const startMinutes = startHour * 60
  const endMinutes = endHour * 60
  const showMarker =
    isToday && nowMinutes >= startMinutes && nowMinutes <= endMinutes
  const markerPercent = showMarker
    ? ((nowMinutes - startMinutes) / (endMinutes - startMinutes)) * 100
    : 0

  return (
    <div className={classes.root} role="row" aria-label="Time row">
      <div className={classes.left} aria-hidden />
      <div className={classes.center}>
        {slotLabels.map((hour) => {
          const isBold =
            slotStepMinutes === 60
              ? (hour - startHour) % 3 === 0
              : (hour - startHour) % 1 === 0
          return (
            <div
              key={hour}
              className={
                isBold
                  ? `${classes.timeCell} ${classes.timeCellBold}`
                  : classes.timeCell
              }
            >
              {formatSlotLabel(hour, slotStepMinutes)}
            </div>
          )
        })}
        {showMarker && (
          <div
            className={classes.marker}
            style={{ left: `${markerPercent}%` }}
            aria-hidden
          />
        )}
      </div>
      <div className={classes.right} aria-hidden />
    </div>
  )
}
