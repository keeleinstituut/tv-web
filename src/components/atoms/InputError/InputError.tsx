import { memo, FC, RefObject } from 'react'
import classes from './classes.module.scss'
import classNames from 'classnames'
import { FieldError } from 'react-hook-form'
import errorOutline from 'assets/icons/error_outline.svg'
import { useTranslation } from 'react-i18next'
import useElementPosition from 'hooks/useElementPosition'
import { createPortal } from 'react-dom'

interface InputErrorComponentProps {
  type?: FieldError['type']
  message?: FieldError['message']
  className?: string
  errorZIndex?: number
  wrapperRef?: RefObject<HTMLElement>
}

const InputErrorComponent: FC<InputErrorComponentProps> = ({
  type,
  message,
  className,
  errorZIndex,
  wrapperRef,
}) => {
  const isVisible = !message && type !== 'required'
  const { left, top } =
    useElementPosition({
      ref: wrapperRef,
      forceRecalculate: isVisible,
    }) || {}

  const { t } = useTranslation()
  if (!message && type !== 'required') return null
  const messageToShow = message || t('error.required')

  return (
    <div
      className={classNames(classes.errorContainer, className)}
      style={{
        zIndex: errorZIndex,
        left,
        top: (top || 0) + 16,
        transform: 'translateY(100%)',
      }}
    >
      <img src={errorOutline} alt={t('error.input_title')} />
      <span>
        <b>{t('error.input_title')}</b>
        {messageToShow}
      </span>
    </div>
  )
}

const InputError: FC<InputErrorComponentProps> = (props) => {
  return createPortal(
    <InputErrorComponent {...props} />,
    document.getElementById('root') || document.body
  )
}

export default memo(InputError)
