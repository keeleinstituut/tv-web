import { FC, useEffect, useRef, useState } from 'react'
import classNames from 'classnames'
import { useClickAway } from 'ahooks'
import ChevronLeft from 'assets/icons/chevron_left.svg?react'
import classes from './classes.module.scss'

export interface CalendarSelectOption {
  value: string
  label: string
  isEmo?: boolean
}

interface Props {
  options: CalendarSelectOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  /** Remove trigger border/padding so the parent container provides the visual frame. */
  flat?: boolean
  searchable?: boolean
}

const CalendarSelect: FC<Props> = ({
  options,
  value,
  onChange,
  placeholder = '—',
  className,
  disabled,
  flat,
  searchable,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useClickAway(() => setIsOpen(false), containerRef)

  useEffect(() => {
    if (isOpen && searchable) {
      setQuery('')
      searchInputRef.current?.focus()
    }
  }, [isOpen, searchable])

  const selected = options.find((o) => o.value === value)
  const filteredOptions =
    searchable && query
      ? options.filter((o) =>
          o.label.toLowerCase().includes(query.toLowerCase())
        )
      : options

  return (
    <div
      ref={containerRef}
      className={classNames(classes.container, className, {
        [classes.disabled]: disabled,
      })}
    >
      <button
        type="button"
        className={classNames(classes.trigger, {
          [classes.open]: isOpen,
          [classes.flat]: flat,
        })}
        onClick={() => !disabled && setIsOpen((v) => !v)}
        disabled={disabled}
      >
        <span
          className={classNames(classes.triggerLabel, {
            [classes.placeholder]: !selected,
          })}
        >
          {selected ? (
            <>
              {selected.label}
              {selected.isEmo && <span className={classes.emoBadge}>EMO</span>}
            </>
          ) : placeholder}
        </span>
        <ChevronLeft
          className={classNames(classes.chevron, {
            [classes.chevronOpen]: isOpen,
          })}
        />
      </button>

      {isOpen && (
        <div className={classes.dropdown}>
          {searchable && (
            <input
              ref={searchInputRef}
              className={classes.searchInput}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onMouseDown={(e) => e.stopPropagation()}
              placeholder="..."
            />
          )}
          {filteredOptions.map((opt) => (
            <div
              key={opt.value}
              className={classNames(classes.option, {
                [classes.selected]: opt.value === value,
              })}
              onMouseDown={() => {
                onChange(opt.value)
                setIsOpen(false)
              }}
            >
              {opt.label}
              {opt.isEmo && <span className={classes.emoBadge}>EMO</span>}
            </div>
          ))}
          {filteredOptions.length === 0 && (
            <span className={classes.empty}>—</span>
          )}
        </div>
      )}
    </div>
  )
}

export default CalendarSelect
