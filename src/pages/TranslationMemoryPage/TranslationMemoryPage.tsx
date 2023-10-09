import { FC } from 'react'
import { useParams } from 'react-router-dom'
import classes from './classes.module.scss'
import { useTranslation } from 'react-i18next'
import Tooltip from 'components/organisms/Tooltip/Tooltip'
import TranslationMemoryDetails from 'components/organisms/TranslationMemoryDetails/TranslationMemoryDetails'
import TranslationMemorySubOrdersTable from 'components/organisms/tables/TranslationMemorySubOrdersTable/TranslationMemorySubOrdersTable'
import { useFetchTranslationMemory } from 'hooks/requests/useTranslationMemories'
import useAuth from 'hooks/useAuth'

const TranslationMemoryPage: FC = () => {
  const { t } = useTranslation()
  const { memoryId = '' } = useParams()
  const { userInfo } = useAuth()
  const { selectedInstitution } = userInfo?.tolkevarav || {}
  const { translationMemory } = useFetchTranslationMemory({ id: memoryId })

  const isTmOwnedByUserInstitution =
    selectedInstitution?.id === translationMemory?.institution_id

  // if (isLoading) return <Loader loading={isLoading} />

  return (
    <>
      <div className={classes.titleRow}>
        <h1>{translationMemory?.name}</h1>
        <Tooltip helpSectionKey="translationMemory" />
      </div>
      <TranslationMemoryDetails
        translationMemory={translationMemory || {}}
        memoryId={memoryId}
        isTmOwnedByUserInstitution={isTmOwnedByUserInstitution}
      />
      {/* <TranslationMemorySubOrdersTable hidden={!isTmOwnedByUserInstitution} /> */}
    </>
  )
}

export default TranslationMemoryPage
