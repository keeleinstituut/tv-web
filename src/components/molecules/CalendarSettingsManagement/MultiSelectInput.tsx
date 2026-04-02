import { FC, useRef, useState } from 'react'
import classNames from 'classnames'
import { useClickAway } from 'ahooks'
import { includes, without } from 'lodash'
import ChevronLeft from 'assets/icons/chevron_left.svg?react'
import CloseIcon from 'assets/icons/close.svg?react'
import classes from './multiSelectInput.module.scss'

export interface MultiSelectOption {
  value: string
  label: string
}

interface Props {
  options: MultiSelectOption[]
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  disabled?: boolean
}

const MultiSelectInput: FC<Props> = ({
  options,
  value,
  onChange,
  placeholder,
  disabled,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useClickAway(() => setIsOpen(false), containerRef)

  const selectedOptions = options.filter((o) => includes(value, o.value))
  const unselectedOptions = options.filter((o) => !includes(value, o.value))

  const handleRemove = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(without(value, optionValue))
  }

  const handleSelect = (optionValue: string) => {
    onChange([...value, optionValue])
  }

  return (
    <div
      ref={containerRef}
      className={classNames(classes.container, { [classes.disabled]: disabled })}
    >
      <div
        className={classNames(classes.trigger, { [classes.open]: isOpen })}
        onClick={() => !disabled && setIsOpen((v) => !v)}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') setIsOpen((v) => !v)
        }}
      >
        <div className={classes.chips}>
          {selectedOptions.length === 0 && (
            <span className={classes.placeholder}>{placeholder}</span>
          )}
          {selectedOptions.map((opt) => (
            <span key={opt.value} className={classes.chip}>
              {opt.label}
              <button
                type="button"
                className={classes.chipRemove}
                onClick={(e) => handleRemove(opt.value, e)}
                tabIndex={-1}
              >
                <CloseIcon className={classes.closeIcon} />
              </button>
            </span>
          ))}
        </div>
        <ChevronLeft
          className={classNames(classes.chevron, {
            [classes.chevronOpen]: isOpen,
          })}
        />
      </div>

      {isOpen && (
        <div className={classes.dropdown}>
          {unselectedOptions.length === 0 && selectedOptions.length > 0 && (
            <span className={classes.empty}>—</span>
          )}
          {unselectedOptions.map((opt) => (
            <div
              key={opt.value}
              className={classes.option}
              onMouseDown={(e) => {
                e.preventDefault()
                handleSelect(opt.value)
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MultiSelectInput
