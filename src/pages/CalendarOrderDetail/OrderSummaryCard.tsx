import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import ArrowDownIcon from 'assets/icons/arrow_down.svg?react'
import { useOrderDetail } from './OrderDetailContext'
import classes from './classes.module.scss'

const SummaryFields: FC = () => {
  const { t } = useTranslation()
  const {
    order,
    isCreateMode,
    isTPM,
    isTranslator,
    isEditing,
    isChangingDuration,
    setIsChangingDuration,
    isUpdating,
    languages,
    selectedDate,
    setSelectedDate,
    startTimeInput,
    setStartTimeInput,
    durationMinutes,
    setDurationMinutes,
    durationEndTime,
    setDurationEndTime,
    clientInstitutionId,
    setClientInstitutionId,
    referenceNumber,
    setReferenceNumber,
    languageId,
    setLanguageId,
    setVendorId,
    startDt,
    endDt,
    durationLabel,
    formatMins,
    handleSaveDuration,
  } = useOrderDetail()

  if (isCreateMode) {
    return (
      <>
        {isTPM && (
          <div className={classes.field}>
            <span className={classes.fieldLabel}>{t('calendar.client')}</span>
            <input
              className={classes.editInput}
              value={clientInstitutionId}
              onChange={(e) => setClientInstitutionId(e.target.value)}
              placeholder={t('calendar.enter_name')}
            />
          </div>
        )}
        <div className={classes.field}>
          <span className={classes.fieldLabel}>{t('calendar.reference_number')}</span>
          <input
            className={classes.editInput}
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
            placeholder={t('calendar.enter_number')}
          />
        </div>
        <div className={classes.field}>
          <span className={classes.fieldLabel}>{t('calendar.language')}</span>
          <select
            className={classes.editSelect}
            value={languageId}
            onChange={(e) => {
              setLanguageId(e.target.value)
              setVendorId('')
            }}
          >
            <option value="" disabled>
              {t('calendar.select_language')}
            </option>
            {languages.map((lang) => (
              <option key={lang.language.id} value={lang.language.id}>
                {lang.language.name}
                {lang.is_rare ? ` (${t('calendar.rare_language')})` : ''}
              </option>
            ))}
          </select>
          {languageId && languages.find((l) => l.language.id === languageId)?.is_rare && (
            <span className={classes.rareLanguageNote}>
              {t('calendar.rare_language_note')}
            </span>
          )}
        </div>
        <div className={classes.field}>
          <span className={classes.fieldLabel}>{t('calendar.date_and_start_time')}</span>
          <div className={classes.timeRow}>
            <input
              type="date"
              className={classes.editInput}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            <input
              type="time"
              className={classes.editInputNarrow}
              value={startTimeInput}
              onChange={(e) => setStartTimeInput(e.target.value)}
            />
          </div>
        </div>
        <div className={classes.field}>
          <span className={classes.fieldLabel}>{t('calendar.duration')}</span>
          <div className={classes.durationStepper}>
            <button
              className={classes.stepperBtn}
              onClick={() => setDurationMinutes((v) => Math.max(30, v - 30))}
            >
              −
            </button>
            <span className={classes.stepperValue}>{formatMins(durationMinutes)}</span>
            <button
              className={classes.stepperBtn}
              onClick={() => setDurationMinutes((v) => v + 30)}
            >
              +
            </button>
          </div>
        </div>
      </>
    )
  }

  if (isTranslator) {
    return (
      <>
        <div className={classes.field}>
          <span className={classes.fieldLabel}>{t('calendar.language')}</span>
          <span className={classes.fieldValue}>{order!.language.name}</span>
        </div>
        <div className={classes.field}>
          <span className={classes.fieldLabel}>{t('calendar.date_and_time')}</span>
          <span className={classes.fieldValue}>
            {startDt!.format('DD.MM.YYYY')} / {startDt!.format('HH:mm')}
          </span>
        </div>
        {isChangingDuration ? (
          <div className={classes.field}>
            <span className={classes.fieldLabel}>{t('calendar.duration_until')} *</span>
            <input
              type="time"
              className={classes.editInputNarrow}
              value={durationEndTime}
              onChange={(e) => setDurationEndTime(e.target.value)}
              autoFocus
            />
            <div style={{ marginTop: 8 }}>
              <Button
                appearance={AppearanceTypes.Primary}
                onClick={handleSaveDuration}
                disabled={isUpdating || !durationEndTime}
              >
                {isUpdating ? t('calendar.saving') : t('calendar.save')}
              </Button>
            </div>
          </div>
        ) : (
          <div className={classes.field}>
            <span className={classes.fieldLabel}>{t('calendar.duration')}</span>
            <span className={classes.fieldValue}>{durationLabel}</span>
            <Button
              appearance={AppearanceTypes.Secondary}
              onClick={() => {
                setDurationEndTime(endDt ? endDt.format('HH:mm') : '')
                setIsChangingDuration(true)
              }}
              disabled={order!.status === 'NEW'}
            >
              {t('calendar.change_duration_btn')}
            </Button>
          </div>
        )}
      </>
    )
  }

  if (!isEditing) {
    return (
      <>
        {isTPM && (
          <>
            <div className={classes.field}>
              <span className={classes.fieldLabel}>{t('calendar.client')}</span>
              <span className={classes.fieldValue}>{order!.client?.name || '–'}</span>
            </div>
            <div className={classes.field}>
              <span className={classes.fieldLabel}>{t('calendar.reference_number')}</span>
              <span className={classes.fieldValue}>{order!.reference_number || '–'}</span>
            </div>
          </>
        )}
        <div className={classes.field}>
          <span className={classes.fieldLabel}>{t('calendar.language')}</span>
          <span className={classes.fieldValue}>{order!.language.name}</span>
        </div>
        <div className={classes.field}>
          <span className={classes.fieldLabel}>{t('calendar.date_and_time')}</span>
          <span className={classes.fieldValue}>
            {startDt!.format('DD.MM.YYYY')} / {startDt!.format('HH:mm')}
          </span>
        </div>
        <div className={classes.field}>
          <span className={classes.fieldLabel}>{t('calendar.duration')}</span>
          <span className={classes.fieldValue}>{durationLabel}</span>
        </div>
      </>
    )
  }

  // Edit mode
  return (
    <>
      {isTPM && (
        <>
          <div className={classes.field}>
            <span className={classes.fieldLabel}>{t('calendar.client')}</span>
            <input
              className={classes.editInput}
              value={clientInstitutionId}
              onChange={(e) => setClientInstitutionId(e.target.value)}
              placeholder={t('calendar.enter_name')}
            />
          </div>
          <div className={classes.field}>
            <span className={classes.fieldLabel}>{t('calendar.reference_number')}</span>
            <input
              className={classes.editInput}
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder={t('calendar.enter_number')}
            />
          </div>
        </>
      )}
      <div className={classes.field}>
        <span className={classes.fieldLabel}>{t('calendar.language')}</span>
        <span className={classes.fieldValue}>{order!.language.name}</span>
      </div>
      <div className={classes.field}>
        <span className={classes.fieldLabel}>{t('calendar.date_and_start_time')}</span>
        <div className={classes.timeRow}>
          <input
            type="date"
            className={classes.editInput}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <input
            type="time"
            className={classes.editInputNarrow}
            value={startTimeInput}
            onChange={(e) => setStartTimeInput(e.target.value)}
          />
        </div>
      </div>
      <div className={classes.field}>
        <span className={classes.fieldLabel}>{t('calendar.duration')}</span>
        <div className={classes.durationStepper}>
          <button
            className={classes.stepperBtn}
            onClick={() => setDurationMinutes((v) => Math.max(30, v - 30))}
          >
            −
          </button>
          <span className={classes.stepperValue}>{formatMins(durationMinutes)}</span>
          <button
            className={classes.stepperBtn}
            onClick={() => setDurationMinutes((v) => v + 30)}
          >
            +
          </button>
        </div>
      </div>
    </>
  )
}

const OrderSummaryCard: FC = () => {
  const { t } = useTranslation()
  const {
    order,
    isCreateMode,
    isEditing,
    setIsEditing,
    isUpdating,
    metaOpen,
    setMetaOpen,
    statusLabel,
    fmt,
    resetFields,
    handleSave,
  } = useOrderDetail()

  return (
    <div className={classes.card}>
      <div className={classes.cardHeader}>
        {isCreateMode ? (
          <h1 className={classes.orderTitle}>{t('calendar.add_order')}</h1>
        ) : (
          <>
            <h1 className={classes.orderTitle}>
              {t('calendar.order_prefix')} {order!.ext_id}
            </h1>
            <span className={classes.statusBadge}>{statusLabel}</span>
          </>
        )}
      </div>

      <div className={classes.summaryGrid}>
        <div className={classes.summaryLeft}>
          <SummaryFields />
        </div>

        {!isCreateMode && (
          <div className={classes.timestamps}>
            <div className={classes.tsRow}>
              <span className={classes.tsLabel}>{t('calendar.created_at_label')}</span>
              <span className={classes.tsValue}>{fmt(order!.created_at)}</span>
            </div>
            <div className={classes.tsRow}>
              <span className={classes.tsLabel}>{t('calendar.updated_at_label')}</span>
              <span className={classes.tsValue}>{fmt(order!.updated_at)}</span>
            </div>
            <div className={classes.tsRow}>
              <span className={classes.tsLabel}>{t('calendar.accepted_at_label')}</span>
              <span className={classes.tsValue}>{fmt(order!.accepted_at)}</span>
            </div>
            <div className={classes.tsRow}>
              <span className={classes.tsLabel}>{t('calendar.cancelled_at_label')}</span>
              <span className={classes.tsValue}>{fmt(order!.cancelled_at)}</span>
            </div>
            <div className={classes.tsRow}>
              <span className={classes.tsLabel}>{t('calendar.completed_at_label')}</span>
              <span className={classes.tsValue}>{fmt(order!.completed_at)}</span>
            </div>
          </div>
        )}
      </div>

      {isEditing && (
        <div className={classes.editFooter}>
          <Button
            appearance={AppearanceTypes.Primary}
            onClick={handleSave}
            disabled={isUpdating}
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
        </div>
      )}

      {!isCreateMode && (
        <>
          <button
            className={classes.metaToggle}
            onClick={() => setMetaOpen((v) => !v)}
          >
            <ArrowDownIcon
              className={`${classes.metaIcon} ${metaOpen ? classes.metaIconOpen : ''}`}
            />
            <span>{t('calendar.order_metadata')}</span>
          </button>

          {metaOpen && (
            <div className={classes.metaContent}>
              {order!.reference_number && (
                <div className={classes.metaField}>
                  <span className={classes.metaLabel}>{t('calendar.order_id_label')}</span>
                  <span className={classes.metaValue}>{order!.reference_number}</span>
                </div>
              )}
              {order!.client && (
                <>
                  <div className={classes.metaRow}>
                    <div className={classes.metaField}>
                      <span className={classes.metaLabel}>{t('calendar.client_name')}</span>
                      <span className={classes.metaValue}>{order!.client.name}</span>
                    </div>
                    <div className={classes.metaField}>
                      <span className={classes.metaLabel}>{t('calendar.institution')}</span>
                      <span className={classes.metaValue}>{order!.client.institution}</span>
                    </div>
                  </div>
                  <div className={classes.metaRow}>
                    <div className={classes.metaField}>
                      <span className={classes.metaLabel}>{t('calendar.email')}</span>
                      <span className={classes.metaValue}>{order!.client.email}</span>
                    </div>
                    <div className={classes.metaField}>
                      <span className={classes.metaLabel}>{t('calendar.phone')}</span>
                      <span className={classes.metaValue}>{order!.client.phone}</span>
                    </div>
                  </div>
                </>
              )}
              {order!.coordinator && (
                <>
                  <div className={classes.metaField}>
                    <span className={classes.metaLabel}>{t('calendar.coordinator_name')}</span>
                    <span className={classes.metaValue}>{order!.coordinator.name}</span>
                  </div>
                  <div className={classes.metaRow}>
                    <div className={classes.metaField}>
                      <span className={classes.metaLabel}>{t('calendar.email')}</span>
                      <span className={classes.metaValue}>{order!.coordinator.email}</span>
                    </div>
                    <div className={classes.metaField}>
                      <span className={classes.metaLabel}>{t('calendar.phone')}</span>
                      <span className={classes.metaValue}>{order!.coordinator.phone}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default OrderSummaryCard
