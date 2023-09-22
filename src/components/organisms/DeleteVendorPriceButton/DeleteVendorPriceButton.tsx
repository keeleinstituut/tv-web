import { FC, useCallback } from 'react'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import { ReactComponent as Delete } from 'assets/icons/delete.svg'
import { useTranslation } from 'react-i18next'
import { includes } from 'lodash'
import useAuth from 'hooks/useAuth'
import { Privileges } from 'types/privileges'
import { showNotification } from '../NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { showValidationErrorMessage } from 'api/errorHandler'
import { useDeletePrices } from 'hooks/requests/useVendors'

import classes from './classes.module.scss'

export type DeleteVendorPriceButtonProps = {
  vendorId?: string
  languagePairIds: string[]
}

const DeleteVendorPriceButton: FC<DeleteVendorPriceButtonProps> = ({
  vendorId,
  languagePairIds,
}) => {
  const { t } = useTranslation()
  const { userPrivileges } = useAuth()

  const { deletePrices, isLoading: isDeletingPrices } =
    useDeletePrices(vendorId)

  const onDeletePrices = useCallback(async () => {
    const payload = {
      id: languagePairIds,
    }

    try {
      await deletePrices(payload)

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

export default DeleteVendorPriceButton
