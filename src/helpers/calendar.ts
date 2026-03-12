import dayjs from 'dayjs'

export function formatDuration(startIso: string, endIso: string): string {
  const minutes = dayjs(endIso).diff(dayjs(startIso), 'minute')
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (m === 0) return `${h}h`
  return `${h}h ${m}min`
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
