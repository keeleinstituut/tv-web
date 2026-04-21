import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import MachineTranslationForm from 'components/organisms/MachineTranslationForm/MachineTranslationForm'
import classes from './classes.module.scss'
import Tooltip from 'components/organisms/Tooltip/Tooltip'

const MachineTranslation: FC = () => {
  const { t } = useTranslation()

  return (
    <>
      <div className={classes.header}>
        <h1>{t('machine_translation.title')}</h1>
        {/* <Tooltip helpSectionKey="technicalSettings" /> */}
      </div>

      <MachineTranslationForm
        className={classes.formContainer}
      />

      {/* <div className={classes.container}>
        <h1>{t('machine_translation.title')}</h1>
        <MachineTranslationForm />
      </div> */}
    </>
  )
}

export default MachineTranslation
