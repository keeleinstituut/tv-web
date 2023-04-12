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
}) => {
  if (hidden) return null

  const onClickHandler = <T extends HTMLElement>(
    event: MouseEvent<T> | KeyboardEvent
  ) => {
    if (disabled || loading || !onClick) return
    if (isKeyboardEvent(event))
      (onClick as unknown as KeyboardEventHandler)(event)
    else (onClick as unknown as MouseEventHandler<T>)(event)
  }

  // make sure our buttons and links behave the same way, when using the keyboard
  const keyPressHandler = <T extends HTMLElement>(event: KeyboardEvent<T>) => {
    const { key } = event
    if (key === 'Enter' && onClick) onClickHandler<T>(event)
  }

  // For links we use <a>
  // TODO: implement Link component from whatever routing library we choose
  if (href) {
    return (
      <a
        href={href}
        onClick={onClickHandler}
        onKeyDown={keyPressHandler}
        role="button"
        tabIndex={0}
        className={className}
      >
        {loading ? <Loader loading={loading} /> : children}
      </a>
    )
  }

  // For other clickable elements that are not links, we use a button
  return (
    <button
      // {...rest}
      type={type}
      className={classNames(className)}
      onClick={onClickHandler}
      onKeyDown={keyPressHandler}
    >
      {loading ? <Loader loading={loading} /> : children}
    </button>
  )
}

export default memo(BaseButton, isEqual)
