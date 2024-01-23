import { FC, useCallback } from 'react'
import classNames from 'classnames'
import classes from './classes.module.scss'
import BaseButton from '../BaseButton/BaseButton'

interface TagProps {
  label: string
  hidden?: boolean
  className?: string
  value?: boolean
  onChange?: () => void
  withBorder?: boolean
  disabled?: boolean
}

const Tag: FC<TagProps> = ({
  label,
  hidden,
  className,
  value,
  onChange,
  withBorder,
  disabled,
}) => {
  const WrapperTag = onChange ? BaseButton : 'span'
  const handleOnClick = useCallback(() => {
    if (onChange) {
      onChange()
    }
  }, [onChange])
  return (
    <WrapperTag
      hidden={hidden}
      className={classNames(
        classes.tag,
        withBorder && classes.border,
        value && classes.active,
        disabled && classes.disabled,
        className
      )}
      onClick={handleOnClick}
      disabled={disabled}
    >
      {label}
    </WrapperTag>
  )
}

export default Tag
