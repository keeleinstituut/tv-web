import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import ArrowDownIcon from 'assets/icons/arrow_down.svg?react'
import { useFetchInfiniteProjectPerson } from 'hooks/requests/useUsers'
import CalendarTimeSelect from 'components/molecules/CalendarTimeSelect/CalendarTimeSelect'
import { openNativeDateTimePicker } from 'helpers/nativeDateTimeInput'
import { useOrderDetail } from './OrderDetailContext'
import OrderTopActions from './OrderTopActions'
import classes from './classes.module.scss'

const ClientSelect: FC<{
  value: string
  onChange: (v: string) => void
  isTPM: boolean
}> = ({ value, onChange, isTPM }) => {
  const { t } = useTranslation()
  const { users: clients } = useFetchInfiniteProjectPerson(
    undefined,
    'client',
    isTPM
  )
  return (
    <select
      className={classes.editSelect}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">{t('calendar.select_client')}</option>
      {clients.map((c) => (
        <option key={c.id} value={c.id}>
          {[c.user.forename, c.user.surname].filter(Boolean).join(' ')}
        </option>
      ))}
    </select>
  )
}

const SummaryFields: FC = () => {
  const { t } = useTranslation()
  const {
    order,
    isCreateMode,
    isTPM,
    isTranslator,
    isEditing,
    languages,
    vendors,
    selectedDate,
    setSelectedDate,
    startTimeInput,
    setStartTimeInput,
    durationMinutes,
    setDurationMinutes,
    clientInstitutionId,
    setClientInstitutionId,
    referenceNumber,
    setReferenceNumber,
    languageId,
    setLanguageId,
    vendorId,
    setVendorId,
    startIso,
    endIso,
    startDt,
    durationLabel,
    formatMins,
  } = useOrderDetail()

  if (isCreateMode) {
    return (
      <>
        {isTPM && (
          <div className={classes.field}>
            <span className={classes.fieldLabel}>
              {t('calendar.client')}
              <span className={classes.requiredMark}>*</span>
            </span>
            <ClientSelect
              value={clientInstitutionId}
              onChange={setClientInstitutionId}
              isTPM={isTPM}
            />
          </div>
        )}
        <div className={classes.field}>
          <span className={classes.fieldLabel}>
            {t('calendar.reference_number')}
            <span className={classes.requiredMark}>*</span>
          </span>
          <input
            className={classes.editInput}
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
            placeholder={t('calendar.enter_number')}
          />
        </div>
        <div className={classes.field}>
          <span className={classes.fieldLabel}>
            {t('calendar.language')}
            <span className={classes.requiredMark}>*</span>
          </span>
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
          {languageId &&
            languages.find((l) => l.language.id === languageId)?.is_rare && (
              <span className={classes.rareLanguageNote}>
                {t('calendar.rare_language_note')}
              </span>
            )}
        </div>
        <div className={classes.field}>
          <span className={classes.fieldLabel}>
            {t('calendar.date_and_start_time')}
            <span className={classes.requiredMark}>*</span>
          </span>
          <div className={classes.timeRow}>
            <input
              type="date"
              className={classes.editInput}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              onClick={openNativeDateTimePicker}
            />
            <CalendarTimeSelect
              className={classes.editTimeSelect}
              value={startTimeInput}
              onChange={setStartTimeInput}
            />
          </div>
        </div>
        <div className={classes.field}>
          <span className={classes.fieldLabel}>
            {t('calendar.duration')}
            <span className={classes.requiredMark}>*</span>
          </span>
          <div className={classes.durationStepper}>
            <button
              className={classes.stepperBtn}
              onClick={() => setDurationMinutes((v) => Math.max(30, v - 30))}
            >
              −
            </button>
            <span className={classes.stepperValue}>
              {formatMins(durationMinutes)}
            </span>
            <button
              className={classes.stepperBtn}
              onClick={() => setDurationMinutes((v) => v + 30)}
            >
              +
            </button>
          </div>
        </div>
        {isTPM && (
          <div className={classes.field}>
            <span className={classes.fieldLabel}>
              {t('calendar.translator')}
              <span className={classes.requiredMark}>*</span>
            </span>
            <select
              className={classes.editSelect}
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
              disabled={!languageId || !startIso || !endIso}
            >
              <option value="">{t('calendar.select_translator')}</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>
        )}
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
          <span className={classes.fieldLabel}>
            {t('calendar.date_and_time')}
          </span>
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

  if (!isEditing) {
    return (
      <>
        {isTPM && (
          <div className={classes.field}>
            <span className={classes.fieldLabel}>{t('calendar.client')}</span>
            <span className={classes.fieldValue}>
              {order!.client?.name || '–'}
            </span>
          </div>
        )}
        <div className={classes.field}>
          <span className={classes.fieldLabel}>
            {t('calendar.reference_number')}
          </span>
          <span className={classes.fieldValue}>
            {order!.reference_number || '–'}
          </span>
        </div>
        <div className={classes.field}>
          <span className={classes.fieldLabel}>{t('calendar.language')}</span>
          <span className={classes.fieldValue}>{order!.language.name}</span>
        </div>
        <div className={classes.field}>
          <span className={classes.fieldLabel}>
            {t('calendar.date_and_time')}
          </span>
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
            <ClientSelect
              value={clientInstitutionId}
              onChange={setClientInstitutionId}
              isTPM={isTPM}
            />
          </div>
          <div className={classes.field}>
            <span className={classes.fieldLabel}>
              {t('calendar.reference_number')}
            </span>
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
        <span className={classes.fieldLabel}>
          {t('calendar.date_and_start_time')}
        </span>
        <div className={classes.timeRow}>
          <input
            type="date"
            className={classes.editInput}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            onClick={openNativeDateTimePicker}
          />
          <CalendarTimeSelect
            className={classes.editTimeSelect}
            value={startTimeInput}
            onChange={setStartTimeInput}
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
          <span className={classes.stepperValue}>
            {formatMins(durationMinutes)}
          </span>
          <button
            className={classes.stepperBtn}
            onClick={() => setDurationMinutes((v) => v + 30)}
          >
            +
          </button>
        </div>
      </div>
      {isTPM && (
        <div className={classes.field}>
          <span className={classes.fieldLabel}>{t('calendar.translator')}</span>
          <select
            className={classes.editSelect}
            value={vendorId}
            onChange={(e) => setVendorId(e.target.value)}
            disabled={!languageId || !startIso || !endIso}
          >
            <option value="">{t('calendar.select_translator')}</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </>
  )
}

const OrderSummaryCard: FC = () => {
  const { t } = useTranslation()
  const {
    order,
    isCreateMode,
    isCreating,
    metaOpen,
    setMetaOpen,
    statusLabel,
    fmt,
    handleCreate,
    pendingComment,
    canCreateOrder,
    isRefetchingOrder,
  } = useOrderDetail()

  return (
    <div className={classes.card}>
      <div className={classes.cardHeader}>
        {isCreateMode ? (
          <>
            <h1 className={classes.orderTitle}>{t('calendar.add_order')}</h1>
            <div className={classes.cardHeaderActions}>
              <Button
                appearance={AppearanceTypes.Primary}
                onClick={() => handleCreate(pendingComment || undefined)}
                disabled={!canCreateOrder || isCreating}
              >
                {isCreating ? t('calendar.saving') : t('calendar.create_order')}
              </Button>
              <Button
                appearance={AppearanceTypes.Secondary}
                onClick={() => window.history.back()}
              >
                {t('calendar.cancel')}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className={classes.cardHeaderLeft}>
              <h1 className={classes.orderTitle}>
                {t('calendar.order_prefix')} {order!.ext_id}
              </h1>
              <span className={classes.statusBadge}>{statusLabel}</span>
              {isRefetchingOrder && (
                <span className={classes.refetchingHint} aria-live="polite">
                  {t('calendar.refetching_order')}
                </span>
              )}
            </div>
            <OrderTopActions />
          </>
        )}
      </div>

      {isCreateMode && (
        <p className={classes.requiredNotice}>
          {t('calendar.required_notice')}
        </p>
      )}

      <div className={classes.summaryGrid}>
        <div className={classes.summaryLeft}>
          <SummaryFields />
        </div>

        <div className={classes.timestamps}>
          <div className={classes.tsLabels}>
            <span className={classes.tsLabel}>
              {t('calendar.created_at_label')}
            </span>
            <span className={classes.tsLabel}>
              {t('calendar.updated_at_label')}
            </span>
            <span className={classes.tsLabel}>
              {t('calendar.accepted_at_label')}
            </span>
            <span className={classes.tsLabel}>
              {t('calendar.cancelled_at_label')}
            </span>
            <span className={classes.tsLabel}>
              {t('calendar.completed_at_label')}
            </span>
          </div>
          <div className={classes.tsValues}>
            <span className={classes.tsValue}>{fmt(order?.created_at)}</span>
            <span className={classes.tsValue}>{fmt(order?.updated_at)}</span>
            <span className={classes.tsValue}>{fmt(order?.accepted_at)}</span>
            <span className={classes.tsValue}>{fmt(order?.cancelled_at)}</span>
            <span className={classes.tsValue}>{fmt(order?.completed_at)}</span>
          </div>
        </div>
      </div>

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
                  <span className={classes.metaLabel}>
                    {t('calendar.order_id_label')}
                  </span>
                  <span className={classes.metaValue}>
                    {order!.reference_number}
                  </span>
                </div>
              )}
              {order!.client && (
                <>
                  <div className={classes.metaRow}>
                    <div className={classes.metaField}>
                      <span className={classes.metaLabel}>
                        {t('calendar.client_name')}
                      </span>
                      <span className={classes.metaValue}>
                        {order!.client.name}
                      </span>
                    </div>
                    <div className={classes.metaField}>
                      <span className={classes.metaLabel}>
                        {t('calendar.institution')}
                      </span>
                      <span className={classes.metaValue}>
                        {order!.client.institution}
                      </span>
                    </div>
                  </div>
                  <div className={classes.metaRow}>
                    <div className={classes.metaField}>
                      <span className={classes.metaLabel}>
                        {t('calendar.email')}
                      </span>
                      <span className={classes.metaValue}>
                        {order!.client.email}
                      </span>
                    </div>
                    <div className={classes.metaField}>
                      <span className={classes.metaLabel}>
                        {t('calendar.phone')}
                      </span>
                      <span className={classes.metaValue}>
                        {order!.client.phone}
                      </span>
                    </div>
                  </div>
                </>
              )}
              {order!.coordinator && (
                <>
                  <div className={classes.metaField}>
                    <span className={classes.metaLabel}>
                      {t('calendar.coordinator_name')}
                    </span>
                    <span className={classes.metaValue}>
                      {order!.coordinator.name}
                    </span>
                  </div>
                  <div className={classes.metaRow}>
                    <div className={classes.metaField}>
                      <span className={classes.metaLabel}>
                        {t('calendar.email')}
                      </span>
                      <span className={classes.metaValue}>
                        {order!.coordinator.email}
                      </span>
                    </div>
                    <div className={classes.metaField}>
                      <span className={classes.metaLabel}>
                        {t('calendar.phone')}
                      </span>
                      <span className={classes.metaValue}>
                        {order!.coordinator.phone}
                      </span>
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
