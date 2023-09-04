import { map } from 'lodash'
import { FC, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import BaseButton from 'components/atoms/BaseButton/BaseButton'
import useHashState from 'hooks/useHashState'
import ReactHtmlParser from 'html-react-parser'
import helpSections from './helpSections.json'

import classes from './classes.module.scss'
import { HelpSections } from 'components/organisms/Tooltip/Tooltip'

const Manual: FC = () => {
  const { t } = useTranslation()

  const helpSectionsData: HelpSections = helpSections

  const date = '15.02.2022'
  const author = 'Interlex'
  const authorEmail = 'koostaja@interlex.ee'

  const { setHash, currentHash } = useHashState()

  const handleTitleClick = useCallback(
    (key: string) => {
      setHash(key)
      scrollToElement(key)
    },
    [setHash]
  )

  const scrollToElement = (key: string) => {
    const matchingElement = document.getElementById(key)
    if (matchingElement) {
      matchingElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
  }

  useEffect(() => {
    scrollToElement(currentHash)
  }, [currentHash])

  const manualTitle = map(helpSectionsData, (section, key) => {
    return (
      <BaseButton
        key={key}
        onClick={() => handleTitleClick(key)}
        className={
          currentHash === key ? classes.activeTitle : classes.manualTitle
        }
      >
        {section?.title}
      </BaseButton>
    )
  })

  const manualContent = map(helpSectionsData, (section, key) => {
    return (
      <div key={key} id={key} className={classes.sectionContent}>
        <h2>{section?.title}</h2>
        <div className={classes.section}>
          {ReactHtmlParser(section?.content)}
        </div>
      </div>
    )
  })

  return (
    <div className={classes.manualContainer}>
      <h1 className={classes.title}>{t('menu.manual')}</h1>
      <div className={classes.manualContentContainer}>
        <div className={classes.articleInfoContainer}>
          <p className={classes.articleInfo}>
            {t('menu.article_created_by', { author, authorEmail })}
          </p>
          <p className={classes.articleInfo}>
            {t('menu.last_changed', { date })}
          </p>
        </div>
        {manualContent}
      </div>
      <div className={classes.manualTitleContainer}>
        <p className={classes.tableOfContents}>{t('menu.table_of_contents')}</p>
        <p className={classes.manualTitles}>{manualTitle}</p>
      </div>
    </div>
  )
}

export default Manual
