import { FC } from 'react'
import Button, {
  AppearanceTypes,
  IconPositioningTypes,
} from 'components/molecules/Button/Button'
import Edit from 'assets/icons/edit.svg?react'
import AddIcon from 'assets/icons/add.svg?react'
import { useTranslation } from 'react-i18next'
import { includes } from 'lodash'
import { ModalTypes, showModal } from 'components/organisms/modals/ModalRoot'
import { useAuth } from 'components/contexts/AuthContext'
import { Privileges } from 'types/privileges'

import classes from './classes.module.scss'
import { InstitutionPartnerPricesFilters } from 'types/outsourceRequests'

type InstitutionPartnerPriceManagementButtonProps = {
  institution_partner_id: string
  languageDirectionKey: string
  skillId?: string
  filters?: InstitutionPartnerPricesFilters
}

const InstitutionPartnerPriceManagementButton: FC<InstitutionPartnerPriceManagementButtonProps> =
  ({ institution_partner_id, languageDirectionKey, skillId, filters }) => {
    const { t } = useTranslation()
    const { userPrivileges } = useAuth()

    const newLanguagePair = languageDirectionKey === 'new'

    const handleEditPriceModal = () => {
      showModal(ModalTypes.EditInstitutionPartnerPrices, {
        languageDirectionKey,
        skillId,
        institution_partner_id,
        filters,
      })
    }

    return (
      <Button
        appearance={AppearanceTypes.Text}
        icon={newLanguagePair ? AddIcon : Edit}
        ariaLabel={t('vendors.edit_language_pair')}
        className={newLanguagePair ? classes.languageButton : classes.editIcon}
        onClick={handleEditPriceModal}
        hidden={!includes(userPrivileges, Privileges.EditVendorDb)}
        children={newLanguagePair && t('vendors.add_language_directions')}
        iconPositioning={newLanguagePair ? IconPositioningTypes.Left : undefined}
      />
    )
  }

export default InstitutionPartnerPriceManagementButton
