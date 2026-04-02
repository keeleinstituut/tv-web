import { FC, useRef, useState } from 'react'
import classNames from 'classnames'
import { useClickAway } from 'ahooks'
import ChevronLeft from 'assets/icons/chevron_left.svg?react'
import classes from './classes.module.scss'

export interface CalendarSelectOption {
  value: string
  label: string
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
}

const CalendarSelect: FC<Props> = ({
  options,
  value,
  onChange,
  placeholder = '—',
  className,
  disabled,
  flat,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useClickAway(() => setIsOpen(false), containerRef)

  const selected = options.find((o) => o.value === value)

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
          {selected ? selected.label : placeholder}
        </span>
        <ChevronLeft
          className={classNames(classes.chevron, {
            [classes.chevronOpen]: isOpen,
          })}
        />
      </button>

      {isOpen && (
        <div className={classes.dropdown}>
          {options.map((opt) => (
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
            </div>
          ))}
          {options.length === 0 && (
            <span className={classes.empty}>—</span>
          )}
        </div>
      )}
    </div>
  )
}

export default CalendarSelect
