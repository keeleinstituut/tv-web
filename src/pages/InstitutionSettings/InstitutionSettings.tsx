import Container from 'components/atoms/Container/Container'
import Tooltip from 'components/organisms/Tooltip/Tooltip'
import { FC } from 'react'
import classes from './classes.module.scss'
import { useInstitutionFetch } from 'hooks/requests/useInstitutions'
import useAuth from 'hooks/useAuth'
import InstitutionForm from 'components/organisms/forms/InstitutionForm/InstitutionForm'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import InstitutionManagementCheatSheet from 'components/molecules/cheatSheets/InstitutionManagementCheatSheet'
import DepartmentManagement from 'components/molecules/DepartmentManagement/DepartmentManagement'

const InstitutionSettings: FC = () => {
  const { t } = useTranslation()
  const { userInfo } = useAuth()
  const { selectedInstitution } = userInfo?.tolkevarav || {}
  const institutionId = selectedInstitution?.id || ''
  const name = selectedInstitution?.name || ''

  const { institution } = useInstitutionFetch({
    institutionId: institutionId,
  })

  const { updated_at, created_at } = institution || {}

  return (
    <>
      <div className={classes.institution}>
        <h1>{t('institution.institution_management')}</h1>
        <Tooltip
          title={t('cheat_sheet.institution_management.title')}
          modalContent={<InstitutionManagementCheatSheet />}
        />
      </div>
      <Container className={classes.container}>
        <h3 className={classes.title}>{t('institution.institution_data')}</h3>
        <InstitutionForm name={name} id={institutionId} {...institution} />
      </Container>

      <p className={classes.dateText}>
        {t('institution.created_at', {
          time: dayjs(created_at).format('DD.MM.YYYY HH:mm') || '',
        })}
      </p>
      <p className={classes.dateText}>
        {t('institution.updated_at', {
          time: dayjs(updated_at).format('DD.MM.YYYY HH:mm') || '',
        })}
      </p>
      <DepartmentManagement />
    </>
  )
}

export default InstitutionSettings
