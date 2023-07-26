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
}

const Tag: FC<TagProps> = ({
  label,
  hidden,
  className,
  value,
  onChange,
  withBorder,
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
        className
      )}
      onClick={handleOnClick}
    >
      {label}
    </WrapperTag>
  )
}

export default Tag
