import { useTranslation } from 'react-i18next'

const InstitutionManagementCheatSheet = () => {
  const { t } = useTranslation()

  return (
    <>
      <p>{t('cheat_sheet.institution_management.help_text')}</p>
      <br />
      <h6>{t('cheat_sheet.institution_management.working_hours_vacations')}</h6>

      <p>
        {t('cheat_sheet.institution_management.working_hours_vacations_text')}
      </p>
      <br />
      <h6>{t('cheat_sheet.institution_management.departments')}</h6>
      <p>{t('cheat_sheet.institution_management.departments_text')}</p>
    </>
  )
}

export default InstitutionManagementCheatSheet
