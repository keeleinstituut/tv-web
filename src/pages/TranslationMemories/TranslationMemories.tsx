import { FC } from 'react'
import { includes } from 'lodash'
import Button from 'components/molecules/Button/Button'
import TranslationMemoriesTable from 'components/organisms/tables/TranslationMemoriesTable/TranslationMemoriesTable'
import Tooltip from 'components/organisms/Tooltip/Tooltip'
import useAuth from 'hooks/useAuth'
import { useTranslation } from 'react-i18next'
import { Privileges } from 'types/privileges'
import classes from './classes.module.scss'

const TranslationMemories: FC = () => {
  const { t } = useTranslation()
  const { userPrivileges } = useAuth()

  return (
    <>
      <div className={classes.titleRow}>
        <h1>{t('menu.translation_memories')}</h1>
        <Tooltip helpSectionKey="translationMemory" />
        <Button
          children={t('button.add_translation_memory')}
          href="/memories/new-memory"
          hidden={!includes(userPrivileges, Privileges.CreateTm)}
        />
      </div>
      <TranslationMemoriesTable />
    </>
  )
}

export default TranslationMemories
