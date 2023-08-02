import { useTranslation } from 'react-i18next'

const TagManagementCheatSheet = () => {
  const { t } = useTranslation()

  return (
    <>
      <p>{t('cheat_sheet.tag_management.tags_description')}</p>
      <h6>{t('cheat_sheet.tag_management.skills')}</h6>
      <p>{t('cheat_sheet.tag_management.skills_tag_description')}</p>
      <h6>{t('cheat_sheet.tag_management.vendors')}</h6>
      <p>{t('cheat_sheet.tag_management.vendors_tag_description')}</p>
      <h6>{t('cheat_sheet.tag_management.translation_memories')}</h6>
      <p>
        {t('cheat_sheet.tag_management.translation_memories_tag_description')}
      </p>
      <h6>{t('cheat_sheet.tag_management.orders')}</h6>
      <p>{t('cheat_sheet.tag_management.orders_tag_description')}</p>
    </>
  )
}

export default TagManagementCheatSheet
