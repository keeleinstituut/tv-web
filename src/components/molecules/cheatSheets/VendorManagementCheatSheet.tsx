import { useTranslation } from 'react-i18next'

const UserManagementCheatSheet = () => {
  const { t } = useTranslation()

  return (
    <>
      <p>{t('cheat_sheet.vendor_management.description')}</p>
      <br />
      <ul>
        <li>{t('cheat_sheet.vendor_management.manage_prices')}</li>
        <li>{t('cheat_sheet.vendor_management.view_tasks')}</li>
        <li>{t('cheat_sheet.vendor_management.privacy')}</li>
      </ul>
    </>
  )
}

export default UserManagementCheatSheet
