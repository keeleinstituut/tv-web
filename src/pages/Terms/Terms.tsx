import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import ReactHtmlParser from 'html-react-parser'
import termsContent from 'static/terms.json'

import classes from './classes.module.scss'

const Manual: FC = () => {
  const { t } = useTranslation()

  return (
    <div className={classes.manualContainer}>
      <h1 className={classes.title}>{t('menu.manual')}</h1>
      <div className={classes.manualContentContainer}>
        {ReactHtmlParser(termsContent?.content) || ''}
      </div>
    </div>
  )
}

export default Manual
