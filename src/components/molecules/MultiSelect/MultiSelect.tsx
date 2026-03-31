import { FC, useRef, useState } from 'react'
import classNames from 'classnames'
import { useClickAway } from 'ahooks'
import ChevronLeft from 'assets/icons/chevron_left.svg?react'
import classes from './classes.module.scss'

export interface MultiSelectOption {
  id: string
  name: string
}

interface Props {
  options: MultiSelectOption[]
  value: string[]
  onChange: (v: string[]) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

const MultiSelect: FC<Props> = ({
  options,
  value,
  onChange,
  placeholder = '—',
  className,
  disabled,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useClickAway(() => setIsOpen(false), containerRef)

  const toggleOption = (id: string) => {
    onChange(
      value.includes(id) ? value.filter((v) => v !== id) : [...value, id]
    )
  }

  const selectedLabels = options
    .filter((o) => value.includes(o.id))
    .map((o) => o.name)
    .join(', ')

  return (
    <div
      ref={containerRef}
      className={classNames(classes.container, className, {
        [classes.disabled]: disabled,
      })}
    >
      <button
        type="button"
        className={classNames(classes.trigger, { [classes.open]: isOpen })}
        onClick={() => !disabled && setIsOpen((v) => !v)}
        disabled={disabled}
      >
        <span
          className={classNames(classes.triggerLabel, {
            [classes.placeholder]: !selectedLabels,
          })}
        >
          {selectedLabels || placeholder}
        </span>
        <ChevronLeft
          className={classNames(classes.chevron, { [classes.chevronOpen]: isOpen })}
        />
      </button>

      {isOpen && (
        <div className={classes.dropdown}>
          {options.map((opt) => (
            <label key={opt.id} className={classes.option}>
              <input
                type="checkbox"
                checked={value.includes(opt.id)}
                onChange={() => toggleOption(opt.id)}
              />
              <span>{opt.name}</span>
            </label>
          ))}
          {options.length === 0 && (
            <span className={classes.empty}>—</span>
          )}
        </div>
      )}
    </div>
  )
}

export default MultiSelect
