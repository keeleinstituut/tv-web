import {
  memo,
  FC,
  MouseEvent,
  KeyboardEvent,
  ButtonHTMLAttributes,
  AnchorHTMLAttributes,
  KeyboardEventHandler,
  MouseEventHandler,
} from 'react'
import { Link } from 'react-router-dom'
import Loader from 'components/atoms/Loader/Loader'
import classNames from 'classnames'
import { isEqual } from 'lodash'

interface SharedProps {
  hidden?: boolean
  loading?: boolean
  disabled?: boolean
  className?: string
}

export type BaseButtonProps = SharedProps &
  AnchorHTMLAttributes<HTMLAnchorElement> &
  ButtonHTMLAttributes<HTMLButtonElement>

const isKeyboardEvent = (
  event: MouseEvent | KeyboardEvent
): event is KeyboardEvent => {
  return (event as KeyboardEvent).getModifierState !== undefined
}

const BaseButton: FC<BaseButtonProps> = ({
  onClick,
  disabled,
  className,
  children,
  href,
  loading,
  hidden,
  type = 'button',
  ...rest
}) => {
  if (hidden) return null

  const onClickHandler = <T extends HTMLElement>(
    event: MouseEvent<T> | KeyboardEvent
  ) => {
    if (disabled || loading || !onClick) return
    if (isKeyboardEvent(event)) {
      const handlePress = onClick as unknown as KeyboardEventHandler
      handlePress(event)
    } else (onClick as unknown as MouseEventHandler<T>)(event)
  }

  // For links we use <Link> from react-router-dom
  if (href) {
    return (
      <Link
        {...rest}
        to={disabled ? '#' : href}
        onClick={onClickHandler}
        role="button"
        tabIndex={0}
        className={className}
      >
        {loading ? <Loader loading={loading} /> : children}
      </Link>
    )
  }

  // For other clickable elements that are not links, we use a button
  return (
    <button
      {...rest}
      disabled={disabled}
      type={type}
      className={classNames(className)}
      onClick={onClickHandler}
      disabled={disabled}
    >
      {loading ? <Loader loading={loading} /> : children}
    </button>
  )
}

export default memo(BaseButton, isEqual)
