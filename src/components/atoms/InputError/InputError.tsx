import { memo, FC } from 'react'
import classes from './styles.module.scss'
import classNames from 'classnames'
import { FieldError } from 'react-hook-form'
import errorOutline from 'assets/icons/error_outline.svg'
import { useTranslation } from 'react-i18next'

interface InputErrorProps {
  type?: FieldError['type']
  message?: FieldError['message']
  className?: string
  errorZIndex?: number
}

const InputError: FC<InputErrorProps> = ({
  type,
  message,
  className,
  errorZIndex,
}) => {
  const { t } = useTranslation()
  if (!message && type !== 'required') return null
  const messageToShow = message || t('error.required')
  return (
    <div
      className={classNames(classes.errorContainer, className)}
      style={{ zIndex: errorZIndex }}
    >
      <img src={errorOutline} alt={t('error.input_title')} />
      <span>
        <b>{t('error.input_title')}</b>
        {messageToShow}
      </span>
    </div>
  )
}

export default memo(InputError)
