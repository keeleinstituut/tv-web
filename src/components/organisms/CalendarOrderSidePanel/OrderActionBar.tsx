import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import ChevronLeft from 'assets/icons/chevron_left.svg?react'
import { useSidePanel } from './SidePanelContext'
import classes from './classes.module.scss'

const OrderActionBar: FC = () => {
  const { t } = useTranslation()
  const {
    isEditing,
    isConfirmingCancel,
    setIsConfirmingCancel,
    isCancelled,
    isCancelPending,
    isPastSlot,
    isTPM,
    isUpdating,
    isRequiredFilled,
    cancelReason,
    isCancelling,
    handleCancelEdit,
    handleSaveEdit,
    handleStartEdit,
    handleVoidConfirm,
    order,
  } = useSidePanel()

  const hasScheduledCancelAt =
    typeof order?.cancel_at === 'string' && order.cancel_at.trim().length > 0
  const showScheduledCancelBanner =
    hasScheduledCancelAt || (isCancelled && isCancelPending)

  if (showScheduledCancelBanner || (isTPM && isCancelled)) return null

  if (isEditing) {
    return (
      <div className={classes.clientEditBar}>
        <button className={classes.loobuLink} onClick={handleCancelEdit}>
          <ChevronLeft style={{ width: 14, height: 14 }} />
          {t('calendar.abandon_editing')}
        </button>
        <Button
          appearance={AppearanceTypes.Primary}
          onClick={handleSaveEdit}
          disabled={isUpdating || !isRequiredFilled}
        >
          {isUpdating ? t('calendar.saving') : t('calendar.save')}
        </Button>
      </div>
    )
  }

  if (isTPM && isConfirmingCancel) {
    return (
      <div className={classes.clientEditBar}>
        <button
          className={classes.loobuLink}
          onClick={() => setIsConfirmingCancel(false)}
        >
          <ChevronLeft style={{ width: 14, height: 14 }} />
          {t('calendar.abandon_cancelling')}
        </button>
        <button
          className={classes.dangerBtn}
          onClick={handleVoidConfirm}
          disabled={isCancelling || !cancelReason.trim()}
        >
          {isCancelling
            ? t('calendar.voiding')
            : t('calendar.void_confirm_yes_full')}
        </button>
      </div>
    )
  }

  if (isPastSlot) return null

  return (
    <div className={classes.translatorActions}>
      {!isTPM && isConfirmingCancel ? (
        <>
          <Button
            appearance={AppearanceTypes.Primary}
            onClick={handleVoidConfirm}
            disabled={isCancelling || !cancelReason.trim()}
          >
            {isCancelling
              ? t('calendar.voiding')
              : t('calendar.void_confirm_yes')}
          </Button>
          <Button
            appearance={AppearanceTypes.Secondary}
            onClick={() => setIsConfirmingCancel(false)}
            disabled={isCancelling}
          >
            {t('calendar.void_confirm_no')}
          </Button>
        </>
      ) : (
        <>
          <Button
            appearance={AppearanceTypes.Secondary}
            onClick={handleStartEdit}
          >
            {t('calendar.edit')}
          </Button>
          <Button
            appearance={AppearanceTypes.Secondary}
            onClick={() => setIsConfirmingCancel(true)}
          >
            {isTPM ? t('calendar.void') : t('calendar.cancel_order')}
          </Button>
        </>
      )}
    </div>
  )
}

export default OrderActionBar
