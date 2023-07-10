import { useTranslation } from 'react-i18next'

const UserManagementCheatSheet = () => {
  const { t } = useTranslation()

  return (
    <>
      <h6>{t('cheat_sheet.user_management.adding_user')}</h6>
      <p>{t('cheat_sheet.user_management.adding_user_text')}</p>
      <br />
      <h6>{t('cheat_sheet.user_management.edit_user_details')}</h6>
      <p>{t('cheat_sheet.user_management.edit_user_details_text')}</p>
      <ul>
        <li>{t('cheat_sheet.user_management.assign_working_times')}</li>
        <li>{t('cheat_sheet.user_management.add_vacations')}</li>
        <li>{t('cheat_sheet.user_management.change_deails')}</li>
        <li>{t('cheat_sheet.user_management.change_role')}</li>
        <li>{t('cheat_sheet.user_management.deactive_account')}</li>
      </ul>
      <br />
      <h6>{t('cheat_sheet.user_management.activation_archiving')}</h6>
      <p>{t('cheat_sheet.user_management.activation_archiving_text')}</p>
    </>
  )
}

export default UserManagementCheatSheet
