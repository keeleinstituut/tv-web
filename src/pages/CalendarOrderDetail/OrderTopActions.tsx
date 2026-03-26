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
    isChangingDuration,
    setIsChangingDuration,
    isConfirmingCancel,
    setIsConfirmingCancel,
    cancelReason,
    setCancelReason,
    setIsEditing,
    durationEndTime,
    isUpdating,
    isAccepting,
    isCancelling,
    handleSaveDuration,
    handleAccept,
    handleCancelOrder,
  } = useOrderDetail()

  if (isCreateMode) return null

  return (
    <div className={classes.topActions}>
      {isTPM && order?.status === 'NEW' && (
        <Button
          appearance={AppearanceTypes.Primary}
          onClick={handleAccept}
          disabled={isAccepting}
        >
          {t('calendar.confirm_order')}
        </Button>
      )}
      {isTranslator && order?.status === 'NEW' && (
        <Button
          appearance={AppearanceTypes.Primary}
          onClick={handleAccept}
          disabled={isAccepting}
        >
          {t('calendar.confirm_order')}
        </Button>
      )}
      {isTranslator &&
        (order?.status === 'IN_PROGRESS' || order?.status === 'DONE') &&
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
          <span className={classes.cancelPrompt}>
            {isTranslator
              ? t('calendar.cancel_booking_confirm')
              : t('calendar.cancel_order_confirm')}
          </span>
          <textarea
            className={classes.cancelReasonInput}
            placeholder={t('calendar.cancel_reason_placeholder')}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
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
