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
}

const InputError: FC<InputErrorProps> = ({ type, message, className }) => {
  const { t } = useTranslation()
  if (!message) return null
  return (
    <div className={classNames(classes.errorContainer, className)}>
      <img src={errorOutline} alt={t('error.input_title')} />
      <span>
        <b>{t('error.input_title')}</b>
        {message}
      </span>
    </div>
  )
}

export default memo(InputError)
