import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import { useOrderDetail } from './OrderDetailContext'
import classes from './classes.module.scss'

const OrderTopActions: FC = () => {
  const { t } = useTranslation()
  const {
    order,
    isCreateMode,
    canModify,
    isEditing,
    canSaveEdits,
    isConfirmingCancel,
    setIsConfirmingCancel,
    cancelReason,
    setCancelReason,
    setIsEditing,
    isUpdating,
    isCancelling,
    cancelCountdown,
    handleSave,
    handleCancelOrder,
    handleUndoCancel,
    resetFields,
    showScheduledCancelBanner,
    isRefetchingOrder,
  } = useOrderDetail()

  const refetchBusy = isRefetchingOrder

  if (isCreateMode) return null
  return (
    <div className={classes.topActions}>
      {showScheduledCancelBanner && (
        <div
          className={classes.pendingCancelBanner}
          role="status"
          aria-live="polite"
        >
          <strong>{t('calendar.cancel_pending_title')}</strong>
          <span className={classes.cancelPendingText}>
            {order?.cancel_at
              ? t('calendar.cancel_pending_body', {
                  date: dayjs(order.cancel_at).format(
                    'DD.MM.YYYY [kell] HH:mm'
                  ),
                })
              : t('calendar.cancel_confirmed_body').replace(
                  '30 s',
                  `${cancelCountdown}s`
                )}
          </span>
          <Button
            appearance={AppearanceTypes.Secondary}
            onClick={handleUndoCancel}
            disabled={refetchBusy}
          >
            {t('calendar.decline_cancel')}
          </Button>
        </div>
      )}
      {isEditing && (
        <>
          <Button
            appearance={AppearanceTypes.Primary}
            onClick={handleSave}
            disabled={refetchBusy || isUpdating || !canSaveEdits}
          >
            {isUpdating ? t('calendar.saving') : t('calendar.save')}
          </Button>
          <Button
            appearance={AppearanceTypes.Secondary}
            onClick={() => {
              resetFields()
              setIsEditing(false)
            }}
            disabled={refetchBusy}
          >
            {t('calendar.cancel_changes')}
          </Button>
        </>
      )}
      {canModify && !isEditing && !isConfirmingCancel && (
        <>
          <Button
            appearance={AppearanceTypes.Secondary}
            onClick={() => setIsEditing(true)}
            disabled={refetchBusy}
          >
            {t('calendar.edit')}
          </Button>
          <Button
            appearance={AppearanceTypes.Secondary}
            onClick={() => setIsConfirmingCancel(true)}
            disabled={refetchBusy}
          >
            {t('calendar.cancel_order')}
          </Button>
        </>
      )}
      {isConfirmingCancel && (
        <>
          <div className={classes.cancelPromptGroup}>
            <span className={classes.cancelPrompt}>
              {t('calendar.cancel_order_confirm')}
            </span>
            <input
              type="text"
              className={classes.cancelReasonInput}
              placeholder={t('calendar.cancel_reason_placeholder')}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              disabled={refetchBusy}
            />
          </div>
          <Button
            appearance={AppearanceTypes.Primary}
            onClick={handleCancelOrder}
            disabled={refetchBusy || isCancelling || !cancelReason.trim()}
          >
            {t('calendar.void_confirm_yes')}
          </Button>
          <Button
            appearance={AppearanceTypes.Secondary}
            onClick={() => {
              setIsConfirmingCancel(false)
              setCancelReason('')
            }}
            disabled={refetchBusy}
          >
            {t('calendar.void_confirm_no')}
          </Button>
        </>
      )}
    </div>
  )
}

export default OrderTopActions
