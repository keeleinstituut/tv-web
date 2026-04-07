import {
  FC,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useCallback,
} from 'react'
import { useClickAway } from 'ahooks'
import classNames from 'classnames'

import classes from './classes.module.scss'

const STEP_MINUTES = 30
const MINUTES_PER_DAY = 24 * 60

const HALF_HOUR_VALUES: string[] = Array.from(
  { length: MINUTES_PER_DAY / STEP_MINUTES },
  (_, i) => {
    const total = i * STEP_MINUTES
    const h = Math.floor(total / 60)
    const m = total % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  }
)

function normalizeToHalfHourValue(raw: string): string {
  const m = /^(\d{1,2}):(\d{2})(?::(\d{2}))?/.exec(raw.trim())
  if (!m) return '00:00'
  const h = Number(m[1])
  const min = Number(m[2])
  const sec = m[3] != null ? Number(m[3]) : 0
  if (
    !Number.isFinite(h) ||
    !Number.isFinite(min) ||
    !Number.isFinite(sec) ||
    h < 0 ||
    h > 23 ||
    min < 0 ||
    min > 59 ||
    sec < 0 ||
    sec > 59
  ) {
    return '00:00'
  }
  const totalMinutes = h * 60 + min + sec / 60
  const snapped =
    (Math.round(totalMinutes / STEP_MINUTES) * STEP_MINUTES +
      MINUTES_PER_DAY) %
    MINUTES_PER_DAY
  const nh = Math.floor(snapped / 60)
  const nm = snapped % 60
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`
}

export type CalendarTimeSelectProps = {
  value: string
  onChange: (value: string) => void
  className?: string
  disabled?: boolean
  allowEmpty?: boolean
  emptyLabel?: string
  id?: string
  'aria-label'?: string
}

/**
 * 24h times in 30-minute steps only (:00 / :30). Custom scrollable list — no native
 * time input or select chrome (no chevron).
 */
const CalendarTimeSelect: FC<CalendarTimeSelectProps> = ({
  value,
  onChange,
  className,
  disabled,
  allowEmpty,
  emptyLabel = '–',
  id,
  'aria-label': ariaLabel,
}) => {
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const filterInputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [filterQuery, setFilterQuery] = useState('')

  useClickAway(() => setOpen(false), rootRef)

  useEffect(() => {
    if (!value) return
    if (HALF_HOUR_VALUES.includes(value)) return
    onChange(normalizeToHalfHourValue(value))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const selectValue = (() => {
    if (!value.trim()) return allowEmpty ? '' : HALF_HOUR_VALUES[0]
    return HALF_HOUR_VALUES.includes(value)
      ? value
      : normalizeToHalfHourValue(value)
  })()

  const triggerLabel =
    allowEmpty && !selectValue ? emptyLabel : selectValue

  useLayoutEffect(() => {
    if (!open || !listRef.current) return
    const active = listRef.current.querySelector<HTMLElement>(
      '[data-selected="true"]'
    )
    active?.scrollIntoView({ block: 'nearest' })
  }, [open, selectValue, allowEmpty])

  useEffect(() => {
    if (open) {
      setFilterQuery('')
      filterInputRef.current?.focus()
    }
  }, [open])

  const filteredValues = filterQuery
    ? HALF_HOUR_VALUES.filter((t) => t.includes(filterQuery))
    : HALF_HOUR_VALUES

  const pick = useCallback((next: string) => {
    onChange(next)
    setOpen(false)
  }, [onChange])

  return (
    <div ref={rootRef} className={classes.root}>
      <button
        type="button"
        id={id}
        className={classNames(classes.trigger, className)}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.stopPropagation()
            setOpen(false)
          }
        }}
      >
        {triggerLabel}
      </button>
      {open && !disabled && (
        <div className={classes.dropdown}>
          <input
            ref={filterInputRef}
            className={classes.filterInput}
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            onMouseDown={(e) => e.stopPropagation()}
            placeholder="..."
          />
          <ul
            ref={listRef}
            id={listId}
            className={classes.list}
            role="listbox"
            aria-label={ariaLabel}
          >
            {allowEmpty && (
              <li role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={selectValue === ''}
                  data-selected={selectValue === '' ? 'true' : undefined}
                  className={classNames(
                    classes.option,
                    selectValue === '' && classes.optionSelected
                  )}
                  onClick={() => pick('')}
                >
                  {emptyLabel}
                </button>
              </li>
            )}
            {filteredValues.map((t) => (
              <li key={t} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={selectValue === t}
                  data-selected={selectValue === t ? 'true' : undefined}
                  className={classNames(
                    classes.option,
                    selectValue === t && classes.optionSelected
                  )}
                  onClick={() => pick(t)}
                >
                  {t}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default CalendarTimeSelect
