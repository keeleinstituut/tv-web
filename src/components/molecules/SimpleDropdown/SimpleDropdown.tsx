import { FC, useRef, useState } from 'react'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import { ReactComponent as DropdownArrow } from 'assets/icons/arrow_down.svg'
import { useClickAway } from 'ahooks'
import { map } from 'lodash'
import classNames from 'classnames'
import classes from './classes.module.scss'

export interface SimpleDropdownOption {
  label: string
  onClick?: () => void
  href?: string
}

interface SimpleDropdownProps {
  title: string
  label: string
  options: SimpleDropdownOption[]
}

const SimpleDropdown: FC<SimpleDropdownProps> = ({ title, label, options }) => {
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
      className={classNames(classes.container, isOpen && classes.open)}
      ref={clickAwayInputRef}
    >
      <label>{title}</label>
      <Button
        onClick={toggleDropdown}
        appearance={AppearanceTypes.Text}
        icon={DropdownArrow}
        ariaLabel={title}
        className={classes.iconButton}
      >
        {label}
      </Button>
      <ul className={classes.content}>
        {map(options, ({ label, ...rest }) => (
          <li key={label}>
            <Button appearance={AppearanceTypes.Text} {...rest}>
              {label}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default SimpleDropdown
