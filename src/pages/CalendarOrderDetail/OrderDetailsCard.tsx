import React, { FC } from 'react'
import MultiSelect from 'components/molecules/MultiSelect/MultiSelect'
import CalendarSelect from 'components/molecules/CalendarSelect/CalendarSelect'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import {
  useCalendarDownloadFile,
  useCalendarDeleteFile,
} from 'hooks/requests/useCalendar'
import { useOrderDetail } from './OrderDetailContext'
import classes from './classes.module.scss'

const OrderDetailsCard: FC = () => {
  const { t } = useTranslation()
  const {
    order,
    isCreateMode,
    isTPM,
    isTranslator,
    isClient,
    isEditing,
    domains,
    serviceType,
    setServiceType,
    address,
    setAddress,
    domainIds,
    setDomainIds,
    localFiles,
    setLocalFiles,
    fileInputRef,
  } = useOrderDetail()

  const { mutate: downloadFile } = useCalendarDownloadFile({
    projectId: order?.id,
  })
  const { mutate: deleteFile } = useCalendarDeleteFile(order?.id)

  const isServiceEditable = isCreateMode || isEditing
  const activeServiceType = isServiceEditable
    ? serviceType
    : order?.service_type

  return (
    <div className={classes.card}>
      <h2 className={classes.sectionTitle}>
        {t('calendar.order_details_title')}
      </h2>
      <div className={classes.detailsGrid}>
        <div className={classes.detailsLeft}>
          <div className={classes.field}>
            <span className={classes.fieldLabel}>
              {t('calendar.order_way')}
              {isCreateMode && <span className={classes.requiredMark}>*</span>}
            </span>
            {isServiceEditable ? (
              <CalendarSelect
                value={serviceType}
                onChange={(v) => {
                  setServiceType(v as 'REMOTE' | 'ON_SITE')
                  setAddress('')
                }}
                options={[
                  { value: 'ON_SITE', label: t('calendar.service_type_contact') },
                  { value: 'REMOTE', label: t('calendar.service_type_remote') },
                ]}
                placeholder={t('calendar.select_type')}
              />
            ) : order?.service_type ? (
              <span className={classes.fieldValue}>
                {order.service_type === 'ON_SITE'
                  ? t('calendar.service_type_contact')
                  : t('calendar.service_type_remote')}
              </span>
            ) : null}
          </div>

          {(isServiceEditable || order?.service_type) && (
          <div className={classes.field}>
            <span className={classes.fieldLabel}>
              {activeServiceType === 'ON_SITE'
                ? t('calendar.location')
                : t('calendar.meeting_link')}
              {isCreateMode && <span className={classes.requiredMark}>*</span>}
            </span>
            {isServiceEditable ? (
              <input
                className={classes.editInput}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={
                  activeServiceType === 'ON_SITE'
                    ? t('calendar.enter_address')
                    : t('calendar.enter_link')
                }
              />
            ) : isTranslator ? (
              order!.service_type === 'ON_SITE' ? (
                <div className={classes.readonlyInput}>{order!.location || '–'}</div>
              ) : order?.meeting_link ? (
                <a
                  className={classes.meetingLink}
                  href={order.meeting_link}
                  target="_blank"
                  rel="noreferrer"
                >
                  {order.meeting_link}
                </a>
              ) : (
                <span className={classes.fieldValue}>–</span>
              )
            ) : (
              <span className={classes.fieldValue}>
                {order!.service_type === 'ON_SITE'
                  ? order!.location || '–'
                  : order!.meeting_link || '–'}
              </span>
            )}
          </div>
          )}

          <div className={classes.field}>
            <span className={classes.fieldLabel}>{t('calendar.domain')}</span>
            {isCreateMode || isEditing ? (
              <MultiSelect
                options={domains ?? []}
                value={domainIds}
                onChange={setDomainIds}
                placeholder={t('calendar.select_domain')}
              />
            ) : order!.tags?.length ? (
              <div className={classes.tagList}>
                {order!.tags.map((tag) => (
                  <span key={tag.id} className={classes.domainChip}>
                    {tag.name}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className={classes.detailsRight}>
          <div className={classes.filesSection}>
            <div className={classes.filesSectionHeader}>
              <span className={classes.filesSectionTitle}>
                {isClient
                  ? t('calendar.files_and_links')
                  : t('calendar.attachments')}
              </span>
              {(isCreateMode || isEditing) && (isTPM || isClient) && (
                <>
                  <Button
                    appearance={AppearanceTypes.Primary}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {t('calendar.add_file')}
                  </Button>
                  <input
                    ref={fileInputRef as React.RefObject<HTMLInputElement>}
                    type="file"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) setLocalFiles((prev) => [...prev, file])
                      e.target.value = ''
                    }}
                  />
                </>
              )}
            </div>
            {(!isCreateMode && (order!.source_files?.length ?? 0) > 0) ||
            localFiles.length > 0 ? (
              <div className={classes.fileTable}>
                <div className={classes.fileTableHeader}>
                  <span>{t('calendar.file_list_header')}</span>
                  <span>{t('calendar.updated_at_label')}</span>
                </div>
                {!isCreateMode &&
                  order!.source_files?.map((file) => (
                    <div key={file.id} className={classes.fileRow}>
                      <span>{file.name || file.file_name}</span>
                      <div className={classes.fileRowActions}>
                        <button
                          className={classes.fileIconBtn}
                          title={t('calendar.download_file')}
                          onClick={() =>
                            downloadFile({
                              id: file.id,
                              file_name: file.file_name,
                              collection: file.collection_name ?? 'help',
                            })
                          }
                        >
                          ↓
                        </button>
                        {isEditing && (
                          <button
                            className={classes.fileIconBtn}
                            title={t('calendar.remove_file')}
                            onClick={() =>
                              deleteFile({
                                id: file.id,
                                collection: file.collection_name ?? 'help',
                              })
                            }
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                {localFiles.map((file, i) => (
                  <div key={`local-${i}`} className={classes.fileRow}>
                    <span>{file.name}</span>
                    <div className={classes.fileRowActions}>
                      <span className={classes.fileDate}>
                        {dayjs().format('DD.MM.YYYY HH:mm')}
                      </span>
                      <button
                        className={classes.fileIconBtn}
                        title={t('calendar.remove_file')}
                        onClick={() =>
                          setLocalFiles((prev) =>
                            prev.filter((_, j) => j !== i)
                          )
                        }
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={classes.noFilesRow}>
                <span>{t('calendar.no_files_msg')}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetailsCard
