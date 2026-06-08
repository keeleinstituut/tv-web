import { FC, useCallback } from 'react'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import Delete from 'assets/icons/delete.svg?react'
import { useTranslation } from 'react-i18next'
import { includes } from 'lodash'
import { useAuth } from 'components/contexts/AuthContext'
import { Privileges } from 'types/privileges'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { showValidationErrorMessage } from 'api/errorHandler'
import { useDeleteInstitutionPartnerPrices } from 'hooks/requests/useInstitutionPartners'

import classes from './classes.module.scss'

export type DeleteInstitutionPartnerPriceButtonProps = {
  institution_partner_id?: string
  languagePairIds: string[]
}

const DeleteInstitutionPartnerPriceButton: FC<DeleteInstitutionPartnerPriceButtonProps> =
  ({ institution_partner_id, languagePairIds }) => {
    const { t } = useTranslation()
    const { userPrivileges } = useAuth()

    const { deletePrices, isLoading: isDeletingPrices } =
      useDeleteInstitutionPartnerPrices(institution_partner_id)

    const onDeletePrices = useCallback(async () => {
      try {
        await deletePrices({ id: languagePairIds })

        showNotification({
          type: NotificationTypes.Success,
          title: t('notification.announcement'),
          content: t('success.language_pairs_prices_deleted'),
        })
      } catch (errorData) {
        showValidationErrorMessage(errorData)
      }
    }, [deletePrices, languagePairIds, t])

    return (
      <Button
        appearance={AppearanceTypes.Text}
        icon={Delete}
        ariaLabel={t('vendors.delete')}
        onClick={onDeletePrices}
        className={classes.deleteIcon}
        hidden={!includes(userPrivileges, Privileges.EditVendorDb)}
        loading={isDeletingPrices}
      />
    )
  }

export default DeleteInstitutionPartnerPriceButton
