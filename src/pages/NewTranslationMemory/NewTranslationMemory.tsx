import { FC } from 'react'
import classes from './classes.module.scss'
import { useTranslation } from 'react-i18next'
import OrderDetails, {
  OrderDetailModes,
} from 'components/organisms/OrderDetails/OrderDetails'
import TranslationMemoryForm from 'components/organisms/forms/TranslationMemoryForm/TranslationMemoryForm'

const NewTranslationMemory: FC = () => {
  const { t } = useTranslation()

  return (
    <div className={classes.container}>
      <h1>{t('translation_memories.new_translation_memory_title')}</h1>
      <TranslationMemoryForm />
    </div>
  )
}

export default NewTranslationMemory
