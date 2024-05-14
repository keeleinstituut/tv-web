import Container from 'components/atoms/Container/Container'
import Tooltip from 'components/organisms/Tooltip/Tooltip'
import { FC } from 'react'
import classes from './classes.module.scss'
import {
  useInstitutionFetch,
  useInstitutionVacationsFetch,
} from 'hooks/requests/useInstitutions'
import { useAuth } from 'components/contexts/AuthContext'
import InstitutionForm from 'components/organisms/forms/InstitutionForm/InstitutionForm'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import DepartmentManagement from 'components/molecules/DepartmentManagement/DepartmentManagement'
import WorkingTimes from 'components/molecules/WorkingTimes/WorkingTimes'
import VacationTimes from 'components/molecules/VacationTimes/VacationTimes'

const InstitutionSettings: FC = () => {
  const { t } = useTranslation()
  const { userInfo } = useAuth()
  const { selectedInstitution } = userInfo?.tolkevarav || {}
  const institutionId = selectedInstitution?.id || ''
  const name = selectedInstitution?.name || ''

  const { institution } = useInstitutionFetch({
    id: institutionId,
  })
  const { institutionVacations } = useInstitutionVacationsFetch()

  const { updated_at, created_at } = institution || {}

  return (
    <>
      <div className={classes.institution}>
        <h1>{t('institution.institution_management')}</h1>
        <Tooltip helpSectionKey="institutionManagement" />
      </div>
      <Container className={classes.container}>
        <h3 className={classes.title}>{t('institution.institution_data')}</h3>
        <InstitutionForm
          name={name}
          id={institutionId}
          {...institution}
          workingTimes={
            <WorkingTimes name={name} id={institutionId} data={institution} />
          }
          vacationDays={
            <VacationTimes
              name={name}
              id={institutionId}
              data={institutionVacations}
            />
          }
        />
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
