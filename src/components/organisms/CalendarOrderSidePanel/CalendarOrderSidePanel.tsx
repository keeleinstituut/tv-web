import { FC } from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import CloseIcon from 'assets/icons/close.svg?react'
import OpenBookingIcon from 'assets/icons/open_booking.svg?react'
import CalendarTranslatorBody from './CalendarTranslatorBody'
import CalendarOrderPastBody from './CalendarOrderPastBody'
import CalendarOrderViewBody from './CalendarOrderViewBody'
import CalendarOrderFormBody from './CalendarOrderFormBody'
import { SidePanelContext } from './SidePanelContext'
import { useCalendarOrderPanelState } from './useCalendarOrderPanelState'
import classes from './classes.module.scss'

const CalendarOrderSidePanel: FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { contextValue, display } = useCalendarOrderPanelState()
  const {
    isOpen,
    isViewMode,
    isTranslatorView,
    isClientPastView,
    isTPMPastView,
    showFooter,
    canEdit,
    isPastSlot,
    isEditing,
    isCancelPending,
    isConfirmingCancel,
    isCreating,
    isUpdating,
    isCancelling,
    projectId,
  } = display
  const {
    slot,
    isRequiredFilled,
    closeSidePanel,
    handleSubmit,
    handleStartEdit,
    handleCancelEdit,
    handleSaveEdit,
    handleVoidConfirm,
    setIsConfirmingCancel,
  } = contextValue

  return (
    <>
      {isOpen && <div className={classes.backdrop} onClick={closeSidePanel} />}
      <div className={`${classes.panel} ${isOpen ? classes.open : ''}`}>
        {/* Header */}
        <div className={classes.header}>
          <div className={classes.headerTitle}>
            {isViewMode
              ? t('calendar.order') +
                ' ' +
                (slot?.assignment?.sub_project.ext_id ?? t('calendar.order'))
              : t('calendar.new_order')}
          </div>
          <div className={classes.headerActions}>
            {isViewMode && projectId && (
              <button
                className={classes.headerBtn}
                onClick={() => navigate(`/calendar/${projectId}`)}
              >
                {t('calendar.open')}
                <OpenBookingIcon className={classes.headerBtnIcon} />
              </button>
            )}
            <button className={classes.headerBtn} onClick={closeSidePanel}>
              {t('calendar.close')}
              <CloseIcon className={classes.headerBtnIcon} />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <SidePanelContext.Provider value={contextValue}>
          <div className={classes.body}>
            {isTranslatorView ? (
              <CalendarTranslatorBody />
            ) : isClientPastView || isTPMPastView ? (
              <CalendarOrderPastBody />
            ) : isViewMode ? (
              <CalendarOrderViewBody />
            ) : (
              <CalendarOrderFormBody />
            )}
          </div>
        </SidePanelContext.Provider>

        {/* Footer */}
        {showFooter && (
          <div className={classes.footer}>
            {isViewMode ? (
              isCancelPending ? null : isEditing ? (
                <>
                  <Button
                    appearance={AppearanceTypes.Primary}
                    onClick={handleSaveEdit}
                    disabled={isUpdating || !isRequiredFilled}
                  >
                    {isUpdating ? t('calendar.saving') : t('calendar.save')}
                  </Button>
                  <Button
                    appearance={AppearanceTypes.Secondary}
                    onClick={handleCancelEdit}
                    disabled={isUpdating}
                  >
                    {t('calendar.cancel_changes')}
                  </Button>
                </>
              ) : isConfirmingCancel ? (
                <>
                  <Button
                    appearance={AppearanceTypes.Primary}
                    onClick={handleVoidConfirm}
                    disabled={isCancelling}
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
                  {canEdit && !isPastSlot && (
                    <Button
                      appearance={AppearanceTypes.Primary}
                      onClick={handleStartEdit}
                    >
                      {t('calendar.edit')}
                    </Button>
                  )}
                  {isPastSlot ? (
                    <Button
                      appearance={AppearanceTypes.Secondary}
                      onClick={closeSidePanel}
                    >
                      {t('calendar.close')}
                    </Button>
                  ) : (
                    <Button
                      appearance={AppearanceTypes.Secondary}
                      onClick={() => setIsConfirmingCancel(true)}
                    >
                      {canEdit
                        ? t('calendar.void')
                        : t('calendar.cancel_order')}
                    </Button>
                  )}
                </>
              )
            ) : (
              <>
                <Button
                  appearance={AppearanceTypes.Primary}
                  onClick={handleSubmit}
                  disabled={isCreating || !isRequiredFilled}
                >
                  {isCreating
                    ? t('calendar.saving')
                    : t('calendar.create_order')}
                </Button>
                <Button
                  appearance={AppearanceTypes.Secondary}
                  onClick={closeSidePanel}
                >
                  {t('calendar.cancel')}
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </>
  )
}

export default CalendarOrderSidePanel
