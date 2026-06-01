import { FC } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const InstitutionPartnerPage: FC = () => {
  const { partnerId } = useParams()
  const { t } = useTranslation()

  return (
    <div>
      <h1>{t('menu.institution_partners')}</h1>
      <p>{partnerId}</p>
    </div>
  )
}

export default InstitutionPartnerPage
