import Loader from 'components/atoms/Loader/Loader'
import { FC } from 'react'
import { map, includes, sortBy } from 'lodash'
import { useParams } from 'react-router-dom'
import classes from './classes.module.scss'
import { useTranslation } from 'react-i18next'
import useAuth from 'hooks/useAuth'
import { Privileges } from 'types/privileges'
import useOrderPageRedirect from 'hooks/useOrderPageRedirect'
import Tooltip from 'components/organisms/Tooltip/Tooltip'
import TranslationMemoryDetails from 'components/organisms/TranslationMemoryDetails/TranslationMemoryDetails'
import TranslationMemorySubOrdersTable from 'components/organisms/tables/TranslationMemorySubOrdersTable/TranslationMemorySubOrdersTable'

// TODO: WIP - implement this page

const TranslationMemoryPage: FC = () => {
  const { t } = useTranslation()

  const { orderId } = useParams()
  const { institutionUserId } = useAuth()

  // useOrderPageRedirect({
  //   client_user_institution_id,
  //   translation_manager_user_institution_id,
  //   isLoading,
  // })

  // const isUserClientOfProject = institutionUserId === client_user_institution_id

  // if (isLoading) return <Loader loading={isLoading} />

  //Todo change the title
  return (
    <>
      <div className={classes.titleRow}>
        <h1>{t('translation_memories.new_translation_memory_title')}</h1>
        <Tooltip helpSectionKey="translationMemory" />
      </div>
      <TranslationMemoryDetails memoryId={orderId} />
      <TranslationMemorySubOrdersTable />
    </>
  )
}

export default TranslationMemoryPage
