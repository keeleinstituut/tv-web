import { FC, RefObject, SVGProps, useRef, useState } from 'react'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import { ReactComponent as DropdownArrow } from 'assets/icons/arrow_down.svg'
import { createPortal } from 'react-dom'
import { useClickAway } from 'ahooks'
import { map } from 'lodash'
import classNames from 'classnames'
import useElementPosition from 'hooks/useElementPosition'
import classes from './classes.module.scss'
import useTableContext from 'hooks/useTableContext'

export interface SimpleDropdownOption {
  label: string
  onClick?: () => void
  href?: string
  download?: string
  target?: string
}

interface SimpleDropdownContentProps {
  isOpen?: boolean
  options: SimpleDropdownOption[]
  wrapperRef?: RefObject<HTMLDivElement>
}

const SimpleDropdownContent: FC<SimpleDropdownContentProps> = ({
  isOpen,
  wrapperRef,
  options,
}) => {
  const { horizontalWrapperId } = useTableContext()
  const { left, top } =
    useElementPosition({
      ref: wrapperRef,
      forceRecalculate: isOpen,
    }) || {}

  if (!isOpen) return null
  if (horizontalWrapperId) {
    return createPortal(
      <ul
        className={classes.content}
        style={{
          left: left || 0,
          top: (top || 0) + 24,
          // bottom: 'unset',
          // transform: 'translateY(-100%)',
        }}
      >
        {map(options, ({ label, ...rest }) => (
          <li key={label}>
            <Button appearance={AppearanceTypes.Text} {...rest}>
              {label}
            </Button>
          </li>
        ))}
      </ul>,
      document.getElementById('root') || document.body
    )
  }
  return (
    <ul className={classes.content}>
      {map(options, ({ label, ...rest }) => (
        <li key={label}>
          <Button appearance={AppearanceTypes.Text} {...rest}>
            {label}
          </Button>
        </li>
      ))}
    </ul>
  )
}

interface SimpleDropdownProps
  extends Pick<SimpleDropdownContentProps, 'options'> {
  title?: string
  label?: string
  icon?: FC<SVGProps<SVGSVGElement>>
  className?: string
  buttonClassName?: string
  disabled?: boolean
}

const SimpleDropdown: FC<SimpleDropdownProps> = ({
  title,
  label,
  icon,
  className,
  buttonClassName,
  disabled,
  ...rest
}) => {
  const clickAwayInputRef = useRef(null)

  const [isOpen, setIsOpen] = useState(false)

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  useClickAway(() => {
    setIsOpen(false)
  }, [clickAwayInputRef])

  return (
    <div
      className={classNames(
        classes.container,
        isOpen && classes.open,
        className
      )}
      ref={clickAwayInputRef}
    >
      <label>{title}</label>
      <Button
        onClick={toggleDropdown}
        appearance={AppearanceTypes.Text}
        icon={icon || DropdownArrow}
        ariaLabel={title}
        disabled={disabled}
        className={classNames(classes.iconButton, buttonClassName)}
      >
        {label}
      </Button>
      <SimpleDropdownContent
        isOpen={isOpen}
        {...rest}
        wrapperRef={clickAwayInputRef}
      />
    </div>
  )
}

export default SimpleDropdown
