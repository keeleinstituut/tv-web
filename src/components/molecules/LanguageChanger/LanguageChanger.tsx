import { FC } from 'react'
import classNames from 'classnames'
import classes from './classes.module.scss'
import { useTranslation } from 'react-i18next'

// TODO: implement once we have dropdown select component
const LanguageChanger: FC = () => {
  const { t } = useTranslation()
  return (
    <div className={classNames(classes.container)}>
      <label>{t('header.language')}</label>
      <span className={classNames(classes.fakeIconButton)}>
        {t('language_option.estonian')}
      </span>
    </div>
  )
}

export default LanguageChanger
