import { FC, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import { formatDuration } from 'helpers/calendar'
import { useCalendarContext } from 'components/contexts/CalendarContext'
import { useAuth } from 'components/contexts/AuthContext'
import { Privileges } from 'types/privileges'
import { useCreateCalendarOrder } from 'hooks/requests/useCalendar'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import CloseIcon from 'assets/icons/close.svg?react'
import AttachIcon from 'assets/icons/attach.svg?react'
import ChevronLeft from 'assets/icons/chevron_left.svg?react'
import classes from './classes.module.scss'

type ServiceType = 'kaugtolge' | 'kontakttolge' | ''

const CalendarOrderSidePanel: FC = () => {
  const { t } = useTranslation()
  const { sidePanelSelection, closeSidePanel } = useCalendarContext()
  const { userPrivileges } = useAuth()
  const navigate = useNavigate()
  const isTPM = userPrivileges.includes(Privileges.ManageProject)
  const { mutate: createOrder, isPending } = useCreateCalendarOrder()

  const [viitenumber, setViitenumber] = useState('')
  const [serviceType, setServiceType] = useState<ServiceType>('')
  const [location, setLocation] = useState('')
  const [tellija, setTellija] = useState('')

  const isOpen = sidePanelSelection !== null
  const isViewMode = !!sidePanelSelection?.slot

  // Reset form when panel closes
  useEffect(() => {
    if (!isOpen) {
      setViitenumber('')
      setServiceType('')
      setLocation('')
      setTellija('')
    }
  }, [isOpen])

  const language = sidePanelSelection?.language
  const startIso = sidePanelSelection?.startIso
  const endIso = sidePanelSelection?.endIso
  const slot = sidePanelSelection?.slot

  const date = startIso ? dayjs(startIso).format('DD.MM.YYYY') : ''
  const startTime = startIso ? dayjs(startIso).format('HH:mm') : ''
  const duration = startIso && endIso ? formatDuration(startIso, endIso) : ''

  const projectId = slot?.assignment?.sub_project?.id

  const handleSubmit = () => {
    if (!language || !startIso || !endIso) return
    createOrder(
      {
        language_id: language.language.id,
        start_at: startIso,
        end_at: endIso,
        service_type: serviceType === 'kaugtolge' ? 'remote' : 'on-site',
        reference_number: viitenumber || undefined,
        location: serviceType === 'kontakttolge' ? location : undefined,
        meeting_link: serviceType === 'kaugtolge' ? location : undefined,
        client_institution_id: isTPM ? tellija || undefined : undefined,
      },
      { onSuccess: closeSidePanel }
    )
  }

  return (
    <>
      {isOpen && <div className={classes.backdrop} onClick={closeSidePanel} />}
      <div className={`${classes.panel} ${isOpen ? classes.open : ''}`}>
        {/* Header */}
        <div className={classes.header}>
          <div className={classes.headerTitle}>
            {isViewMode
              ? (slot?.assignment?.sub_project.ext_id ?? t('calendar.order'))
              : t('calendar.new_order')}
          </div>
          <div className={classes.headerActions}>
            {isViewMode && projectId && (
              <button
                className={classes.headerBtn}
                onClick={() => navigate(`/projects/${projectId}`)}
              >
                {t('calendar.open')}
                <span className={classes.headerBtnArrow}>↗</span>
              </button>
            )}
            <button className={classes.headerBtn} onClick={closeSidePanel}>
              {t('calendar.close')}
              <CloseIcon className={classes.headerBtnIcon} />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className={classes.body}>
          <div className={classes.form}>
            {/* Tellija — TPM only, create mode only */}
            {isTPM && !isViewMode && (
              <div className={classes.formGroup}>
                <label className={classes.label}>{t('calendar.client')}</label>
                <input
                  className={classes.input}
                  placeholder={t('calendar.enter_name')}
                  value={tellija}
                  onChange={(e) => setTellija(e.target.value)}
                />
              </div>
            )}

            {/* Viitenumber — create mode only */}
            {!isViewMode && (
              <div className={classes.formGroup}>
                <label className={classes.label}>
                  {t('calendar.reference_number')}
                </label>
                <input
                  className={classes.input}
                  placeholder={t('calendar.enter_number')}
                  value={viitenumber}
                  onChange={(e) => setViitenumber(e.target.value)}
                />
              </div>
            )}

            {/* Keel */}
            <div className={classes.formGroup}>
              <label className={classes.label}>{t('calendar.language')}</label>
              <div className={classes.inputReadonly}>
                {language?.language.name ?? ''}
              </div>
            </div>

            {/* Kuupäev */}
            <div className={classes.formGroup}>
              <label className={classes.label}>{t('calendar.date')}</label>
              <div className={classes.inputReadonly}>{date}</div>
            </div>

            {/* Alates + Kestus */}
            <div className={classes.formRow}>
              <div className={classes.formGroup}>
                <label className={classes.label}>{t('calendar.from')}</label>
                <div className={classes.inputReadonly}>{startTime}</div>
              </div>
              <div className={classes.formGroup}>
                <label className={classes.label}>
                  {t('calendar.duration')}
                </label>
                <div className={classes.inputReadonly}>{duration}</div>
              </div>
            </div>

            {/* Tellimuse tüüp — editable in create, read-only placeholder in view */}
            {!isViewMode && (
              <div className={classes.formGroup}>
                <label className={classes.label}>
                  {t('calendar.order_type')}
                </label>
                <select
                  className={classes.select}
                  value={serviceType}
                  onChange={(e) => {
                    setServiceType(e.target.value as ServiceType)
                    setLocation('')
                  }}
                >
                  <option value="" disabled>
                    {t('calendar.select_type')}
                  </option>
                  <option value="kaugtolge">
                    {t('calendar.service_type_remote')}
                  </option>
                  <option value="kontakttolge">
                    {t('calendar.service_type_contact')}
                  </option>
                </select>
              </div>
            )}

            {/* Conditional location / meeting link — create mode */}
            {!isViewMode && serviceType === 'kontakttolge' && (
              <div className={classes.formGroup}>
                <label className={classes.label}>
                  {t('calendar.location')}
                </label>
                <input
                  className={classes.input}
                  placeholder={t('calendar.enter_address')}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            )}
            {!isViewMode && serviceType === 'kaugtolge' && (
              <div className={classes.formGroup}>
                <label className={classes.label}>
                  {t('calendar.meeting_link')}
                </label>
                <input
                  className={classes.input}
                  placeholder={t('calendar.enter_link')}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Lisamaterjal */}
          <div className={classes.divider} />
          <div className={classes.sectionRow}>
            <div className={classes.sectionLabel}>
              <AttachIcon className={classes.sectionIcon} />
              <span>{t('calendar.attachments')}</span>
            </div>
            <button className={classes.sectionBtn}>
              {t('calendar.add_attachment')}
            </button>
          </div>

          {/* Kommentaarid */}
          <div className={classes.divider} />
          <div className={classes.sectionRow}>
            <div className={classes.sectionLabel}>
              <ChevronLeft className={classes.sectionChevron} />
              <span>{t('calendar.comments')}</span>
            </div>
            <button className={classes.sectionBtn}>
              {t('calendar.add_comment')}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className={classes.footer}>
          {isViewMode ? (
            <>
              <Button appearance={AppearanceTypes.Primary}>
                {t('calendar.edit')}
              </Button>
              <Button
                appearance={AppearanceTypes.Secondary}
                onClick={closeSidePanel}
              >
                {t('calendar.close')}
              </Button>
            </>
          ) : (
            <>
              <Button
                appearance={AppearanceTypes.Primary}
                onClick={handleSubmit}
                disabled={isPending || !serviceType}
              >
                {isPending ? t('calendar.saving') : t('calendar.create_order')}
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
      </div>
    </>
  )
}

export default CalendarOrderSidePanel
