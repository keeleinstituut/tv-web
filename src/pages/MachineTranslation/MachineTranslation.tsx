import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import MachineTranslationForm from 'components/organisms/MachineTranslationForm/MachineTranslationForm'
import MachineTranslationJobsTable from 'components/organisms/tables/MachineTranslationJobsTable/MachineTranslationJobsTable'
import classes from './classes.module.scss'
import Tooltip from 'components/organisms/Tooltip/Tooltip'

const MachineTranslation: FC = () => {
  const { t } = useTranslation()

  return (
    <>
      <div className={classes.header}>
        <h1>{t('machine_translation.title')}</h1>
        <Tooltip helpSectionKey="languageTools" />
      </div>

      <MachineTranslationForm
        className={classes.formContainer}
      />

      <div className={classes.historySection}>
        <h2>{t('machine_translation.history_title')}</h2>
        <MachineTranslationJobsTable />
      </div>
    </>
  )
}

export default MachineTranslation
