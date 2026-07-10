import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import { useSidePanel } from './SidePanelContext'
import classes from './classes.module.scss'

const OrderStatusBanners: FC = () => {
  const { t } = useTranslation()
  const {
    isConfirmingCancel,
    cancelReason,
    setCancelReason,
    isCancelled,
    isCancelPending,
    isTPM,
    handleDeclineCancel,
    isDecliningCancel,
    order,
  } = useSidePanel()

  const hasScheduledCancelAt =
    typeof order?.cancel_at === 'string' && order.cancel_at.trim().length > 0
  const showScheduledCancelBanner =
    hasScheduledCancelAt || (isCancelled && isCancelPending)

  return (
    <>
      {/* Cancel warning — shown while confirming */}
      {isConfirmingCancel && (
        <div className={classes.cancelWarning}>
          <strong>{t('calendar.cancel_warning_title')}</strong>
          <p>{t('calendar.cancel_warning_body')}</p>
          <textarea
            className={classes.textarea}
            placeholder={t('calendar.cancel_reason_placeholder')}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
        </div>
      )}

      {/* Pending cancel — delayed cancel scheduled or grace-period */}
      {showScheduledCancelBanner && (
        <div className={classes.pendingCancelBanner}>
          <strong>{t('calendar.cancel_pending_title')}</strong>
          <p>
            {hasScheduledCancelAt && order?.cancel_at
              ? t('calendar.cancel_pending_body', {
                  date: dayjs(order.cancel_at).format(
                    'DD.MM.YYYY [kell] HH:mm'
                  ),
                })
              : t('calendar.cancel_confirmed_body')}
          </p>
          <Button
            appearance={AppearanceTypes.Secondary}
            onClick={handleDeclineCancel}
            disabled={isDecliningCancel}
          >
            {t('calendar.decline_cancel')}
          </Button>
        </div>
      )}

      {/* Post-cancel — TPM immediate cancel fallback */}
      {isTPM && isCancelled && !hasScheduledCancelAt && !isCancelPending && (
        <div className={classes.cancelledBanner}>
          <strong>{t('calendar.cancel_confirmed_title')}</strong>
          <p>{t('calendar.cancel_confirmed_body')}</p>
        </div>
      )}
    </>
  )
}

export default OrderStatusBanners
