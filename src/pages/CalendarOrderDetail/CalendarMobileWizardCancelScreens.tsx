import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import classes from './mobile.module.scss'

type CancelPendingScreenProps = {
  cancelCountdown: number
  onUndoCancel: () => void
}

export const CalendarMobileWizardCancelPendingScreen: FC<
  CancelPendingScreenProps
> = ({ cancelCountdown, onUndoCancel }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  return (
    <div className={classes.wizard}>
      <div className={classes.cancelScreen}>
        <h2 className={classes.cancelScreenTitle}>
          {t('calendar.cancel_pending_title')}
        </h2>
        <p className={classes.cancelScreenBody}>
          {t('calendar.cancel_confirmed_body').replace(
            '30 s',
            `${cancelCountdown}s`
          )}
        </p>
      </div>
      <div className={classes.footer}>
        <Button
          appearance={AppearanceTypes.Primary}
          className={classes.footerBtn}
          onClick={onUndoCancel}
        >
          {t('calendar.undo_cancel')}
        </Button>
        <Button
          appearance={AppearanceTypes.Secondary}
          className={classes.footerBtn}
          onClick={() => navigate('/calendar')}
        >
          {t('calendar.back_to_calendar')}
        </Button>
      </div>
    </div>
  )
}

type CancelConfirmScreenProps = {
  cancelReason: string
  onCancelReasonChange: (value: string) => void
  isCancelling: boolean
  onConfirmCancel: () => void
  onDismiss: () => void
}

export const CalendarMobileWizardCancelConfirmScreen: FC<
  CancelConfirmScreenProps
> = ({
  cancelReason,
  onCancelReasonChange,
  isCancelling,
  onConfirmCancel,
  onDismiss,
}) => {
  const { t } = useTranslation()
  return (
    <div className={classes.wizard}>
      <div className={classes.cancelScreen}>
        <p className={classes.cancelScreenPrompt}>
          {t('calendar.cancel_order_confirm')}
        </p>
        <input
          type="text"
          className={classes.cancelReasonInput}
          placeholder={t('calendar.cancel_reason_placeholder')}
          value={cancelReason}
          onChange={(e) => onCancelReasonChange(e.target.value)}
          autoFocus
        />
      </div>
      <div className={classes.footer}>
        <Button
          appearance={AppearanceTypes.Primary}
          className={classes.footerBtn}
          onClick={onConfirmCancel}
          disabled={isCancelling || !cancelReason.trim()}
        >
          {isCancelling
            ? t('calendar.voiding')
            : t('calendar.void_confirm_yes')}
        </Button>
        <Button
          appearance={AppearanceTypes.Secondary}
          className={classes.footerBtn}
          onClick={onDismiss}
        >
          {t('calendar.void_confirm_no')}
        </Button>
      </div>
    </div>
  )
}
