import { FC } from 'react'
import Button, {
  AppearanceTypes,
  IconPositioningTypes,
} from 'components/molecules/Button/Button'
import { ReactComponent as Edit } from 'assets/icons/edit.svg'
import { ReactComponent as AddIcon } from 'assets/icons/add.svg'
import { useTranslation } from 'react-i18next'
import { includes } from 'lodash'
import { ModalTypes, showModal } from 'components/organisms/modals/ModalRoot'
import useAuth from 'hooks/useAuth'
import { Privileges } from 'types/privileges'

import classes from './classes.module.scss'
import { GetPricesPayload } from 'types/price'

type VendorPriceManagementButtonProps = {
  vendor_id: string
  languageDirectionKey: string
  skillId?: string
  filters?: GetPricesPayload
}

export type SkillPrice = {
  id?: string | undefined
  isSelected?: boolean
  character_fee: number
  word_fee: number
  page_fee: number
  minute_fee: number
  hour_fee: number
  minimal_fee: number
  skill_id: string
  skill?: { id: string; name: string }
}

const VendorPriceManagementButton: FC<VendorPriceManagementButtonProps> = ({
  vendor_id,
  languageDirectionKey,
  skillId,
  filters,
}) => {
  const { t } = useTranslation()
  const { userPrivileges } = useAuth()

  const newLanguagePair = languageDirectionKey === 'new'

  const handleEditPriceModal = () => {
    showModal(ModalTypes.EditVendorPrices, {
      languageDirectionKey,
      skillId,
      vendor_id,
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

export default VendorPriceManagementButton
