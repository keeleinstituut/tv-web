import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import ArrowDownIcon from 'assets/icons/arrow_down.svg?react'
import { useFetchCalendarClients } from 'hooks/requests/useUsers'
import TimeDropdownSelect from 'components/molecules/TimeDropdownSelect/TimeDropdownSelect'
import CalendarSelect from 'components/molecules/CalendarSelect/CalendarSelect'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { DatePickerComponent } from 'components/molecules/DatePickerInput/DatePickerInput'

import { useOrderDetail } from './OrderDetailContext'
import OrderTopActions from './OrderTopActions'
import classes from './classes.module.scss'

dayjs.extend(customParseFormat)

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

  const {
    clients,
    search: clientSearch,
    handleSearch: handleClientSearch,
  } = useFetchCalendarClients(isTPM)

  if (isCreateMode) {
    return (
      <>
        {isTPM && (
          <div className={classes.field}>
            <span className={classes.fieldLabel}>
              {t('calendar.client')}
              <span className={classes.requiredMark}>*</span>
            </span>
            <CalendarSelect
              value={clientInstitutionId}
              onChange={setClientInstitutionId}
              options={clients.map((c) => ({
                value: c.id,
                label: [c.user.forename, c.user.surname]
                  .filter(Boolean)
                  .join(' '),
              }))}
              placeholder={t('calendar.select_client')}
              searchQuery={clientSearch}
              onSearch={handleClientSearch}
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
          <CalendarSelect
            value={languageId}
            onChange={(v) => {
              setLanguageId(v)
              setVendorId('')
            }}
            options={languages.map((lang) => ({
              value: lang.language.id,
              label:
                lang.language.name +
                (lang.is_rare ? ` (${t('calendar.rare_language')})` : ''),
            }))}
            placeholder={t('calendar.select_language')}
            searchable
          />
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
            <div className={classes.datePickerWrap}>
              <DatePickerComponent
                name="selectedDate"
                value={
                  selectedDate ? dayjs(selectedDate).format('DD/MM/YYYY') : ''
                }
                onChange={(v) => {
                  const d = dayjs(v, 'DD/MM/YYYY')
                  setSelectedDate(d.isValid() ? d.format('YYYY-MM-DD') : '')
                }}
              />
            </div>
            <TimeDropdownSelect
              className={classes.editTimeSelect}
              value={startTimeInput}
              onChange={setStartTimeInput}
              freeInput
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
              onClick={() => setDurationMinutes((v) => Math.max(10, v - 10))}
            >
              −
            </button>
            <span className={classes.stepperValue}>
              {formatMins(durationMinutes)}
            </span>
            <button
              className={classes.stepperBtn}
              onClick={() => setDurationMinutes((v) => v + 10)}
            >
              +
            </button>
          </div>
        </div>
        {isTPM && (
          <div className={classes.field}>
            <span className={classes.fieldLabel}>
              {t('calendar.translator')}
            </span>
            <CalendarSelect
              value={vendorId}
              onChange={setVendorId}
              options={vendors.map((v) => ({
                value: v.id,
                label: v.name,
                isEmo: v.is_emo,
              }))}
              placeholder={t('calendar.select_translator')}
              disabled={!languageId || !startIso || !endIso}
            />
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
            <CalendarSelect
              value={clientInstitutionId}
              onChange={setClientInstitutionId}
              options={clients.map((c) => ({
                value: c.id,
                label: [c.user.forename, c.user.surname]
                  .filter(Boolean)
                  .join(' '),
              }))}
              placeholder={t('calendar.select_client')}
              searchQuery={clientSearch}
              onSearch={handleClientSearch}
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
          <div className={classes.datePickerWrap}>
            <DatePickerComponent
              name="editDate"
              value={
                selectedDate ? dayjs(selectedDate).format('DD/MM/YYYY') : ''
              }
              onChange={(v) => {
                const d = dayjs(v, 'DD/MM/YYYY')
                setSelectedDate(d.isValid() ? d.format('YYYY-MM-DD') : '')
              }}
            />
          </div>
          <TimeDropdownSelect
            className={classes.editTimeSelect}
            value={startTimeInput}
            onChange={setStartTimeInput}
            freeInput
          />
        </div>
      </div>
      <div className={classes.field}>
        <span className={classes.fieldLabel}>{t('calendar.duration')}</span>
        <div className={classes.durationStepper}>
          <button
            className={classes.stepperBtn}
            onClick={() => setDurationMinutes((v) => Math.max(10, v - 10))}
          >
            −
          </button>
          <span className={classes.stepperValue}>
            {formatMins(durationMinutes)}
          </span>
          <button
            className={classes.stepperBtn}
            onClick={() => setDurationMinutes((v) => v + 10)}
          >
            +
          </button>
        </div>
      </div>
      {isTPM && (
        <div className={classes.field}>
          <span className={classes.fieldLabel}>{t('calendar.translator')}</span>
          <CalendarSelect
            value={vendorId}
            onChange={setVendorId}
            options={vendors.map((v) => ({
              value: v.id,
              label: v.name,
              isEmo: v.is_emo,
            }))}
            placeholder={t('calendar.select_translator')}
            disabled={!languageId || !startIso || !endIso}
          />
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
