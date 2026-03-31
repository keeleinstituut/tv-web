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
    isCancelPending,
    cancelCountdown,
    handleSave,
    handleCancelOrder,
    handleUndoCancel,
    resetFields,
  } = useOrderDetail()

  if (isCreateMode) return null
  console.log('isCancelPending', isCancelPending, order?.cancel_at)
  return (
    <div className={classes.topActions}>
      {order?.cancel_at && isCancelPending && (
        <div className={classes.pendingCancelBanner}>
          <strong>{t('calendar.cancel_pending_title')}</strong>
          <span className={classes.cancelPendingText}>
            {t('calendar.cancel_confirmed_body').replace(
              '30 s',
              `${cancelCountdown}s`
            )}
          </span>
          <Button
            appearance={AppearanceTypes.Secondary}
            onClick={handleUndoCancel}
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
            disabled={isUpdating || !canSaveEdits}
          >
            {isUpdating ? t('calendar.saving') : t('calendar.save')}
          </Button>
          <Button
            appearance={AppearanceTypes.Secondary}
            onClick={() => {
              resetFields()
              setIsEditing(false)
            }}
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
          >
            {t('calendar.edit')}
          </Button>
          <Button
            appearance={AppearanceTypes.Secondary}
            onClick={() => setIsConfirmingCancel(true)}
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
            />
          </div>
          <Button
            appearance={AppearanceTypes.Primary}
            onClick={handleCancelOrder}
            disabled={isCancelling || !cancelReason.trim()}
          >
            {t('calendar.void_confirm_yes')}
          </Button>
          <Button
            appearance={AppearanceTypes.Secondary}
            onClick={() => {
              setIsConfirmingCancel(false)
              setCancelReason('')
            }}
          >
            {t('calendar.void_confirm_no')}
          </Button>
        </>
      )}
    </div>
  )
}

export default OrderTopActions
