import { FC } from 'react'
import { useParams } from 'react-router-dom'
import { useFetchInstitutionPartner } from 'hooks/requests/useInstitutionPartners'
import InstitutionPartnerForm from 'components/organisms/forms/InstitutionPartnerForm/InstitutionPartnerForm'
import InstitutionPartnerPriceListForm from 'components/organisms/forms/InstitutionPartnerPriceListForm/InstitutionPartnerPriceListForm'
import classes from './classes.module.scss'

const InstitutionPartnerPage: FC = () => {
  const { institutionPartnerId } = useParams()
  const { institutionPartner, isLoading } = useFetchInstitutionPartner({
    id: institutionPartnerId,
  })

  if (!institutionPartner || isLoading) return null

  return (
    <>
      <h1>{institutionPartner.partner_institution?.name}</h1>
      <InstitutionPartnerPriceListForm institutionPartner={institutionPartner} />
      <div className={classes.form}>
        <InstitutionPartnerForm institutionPartner={institutionPartner} />
      </div>
    </>
  )
}

export default InstitutionPartnerPage
