import { FC } from 'react'
import classes from './classes.module.scss'
import { useTranslation } from 'react-i18next'
import TranslationMemoryForm from 'components/organisms/forms/TranslationMemoryForm/TranslationMemoryForm'
import Tooltip from 'components/organisms/Tooltip/Tooltip'

const NewTranslationMemory: FC = () => {
  const { t } = useTranslation()

  return (
    <>
      <div className={classes.titleRow}>
        <h1>{t('translation_memories.new_translation_memory_title')}</h1>
        <Tooltip helpSectionKey="newTranslationMemory" />
      </div>

      <TranslationMemoryForm />
    </>
  )
}

export default NewTranslationMemory
