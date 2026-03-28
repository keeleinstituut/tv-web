import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import { useOrderDetail } from './OrderDetailContext'
import classes from './classes.module.scss'

const OrderTopActions: FC = () => {
  const { t } = useTranslation()
  const {
    order,
    isCreateMode,
    isTPM,
    isTranslator,
    canModify,
    isEditing,
    isDirty,
    isChangingDuration,
    setIsChangingDuration,
    isConfirmingCancel,
    setIsConfirmingCancel,
    cancelReason,
    setCancelReason,
    setIsEditing,
    durationEndTime,
    isUpdating,
    isCancelling,
    isCancelled,
    isCancelPending,
    cancelCountdown,
    handleSave,
    handleSaveDuration,
    handleCancelOrder,
    handleUndoCancel,
    resetFields,
  } = useOrderDetail()

  if (isCreateMode) return null

  if (isCancelPending) {
    return (
      <div className={classes.topActions}>
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
          {t('calendar.undo_cancel')}
        </Button>
      </div>
    )
  }

  return (
    <div className={classes.topActions}>
      {isEditing && (
        <>
          <Button
            appearance={AppearanceTypes.Primary}
            onClick={handleSave}
            disabled={isUpdating || !isDirty}
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
      {isTranslator &&
        !isCancelled &&
        order?.status !== 'ACCEPTED' &&
        order?.status !== 'CANCELLED' &&
        !isChangingDuration &&
        !isConfirmingCancel && (
          <Button
            appearance={AppearanceTypes.Secondary}
            onClick={() => setIsConfirmingCancel(true)}
          >
            {t('calendar.cancel_booking')}
          </Button>
        )}
      {isTranslator && isChangingDuration && (
        <Button
          appearance={AppearanceTypes.Primary}
          onClick={handleSaveDuration}
          disabled={isUpdating || !durationEndTime}
        >
          {isUpdating ? t('calendar.saving') : t('calendar.save_changes_btn')}
        </Button>
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
              {isTranslator
                ? t('calendar.cancel_booking_confirm')
                : t('calendar.cancel_order_confirm')}
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
