import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import classes from './classes.module.scss'

interface MetaSource {
  reference_number?: string
  client?: { name: string; institution: string; email: string; phone: string }
  coordinator?: { name: string; email: string; phone: string }
}

interface SlotMetaSectionProps {
  source: MetaSource | null | undefined
}

const SlotMetaSection: FC<SlotMetaSectionProps> = ({ source }) => {
  const { t } = useTranslation()

  return (
    <>
      <div className={classes.metaHeader}>
        <span>{t('calendar.order_meta')}</span>
      </div>
      <div className={classes.metaContent}>
        {source?.reference_number && (
          <div className={classes.metaGroup}>
            <span className={classes.metaLabel}>
              {t('calendar.reference_number')}
            </span>
            <span className={classes.metaValue}>
              {source.reference_number}
            </span>
          </div>
        )}
        {source?.client && (
          <>
            <div className={classes.metaRow}>
              <div className={classes.metaGroup}>
                <span className={classes.metaLabel}>
                  {t('calendar.client_name')}
                </span>
                <span className={classes.metaValue}>
                  {source.client.name}
                </span>
              </div>
              <div className={classes.metaGroup}>
                <span className={classes.metaLabel}>
                  {t('calendar.institution')}
                </span>
                <span className={classes.metaValue}>
                  {source.client.institution}
                </span>
              </div>
            </div>
            <div className={classes.metaRow}>
              <div className={classes.metaGroup}>
                <span className={classes.metaLabel}>
                  {t('calendar.email')}
                </span>
                <span className={classes.metaValue}>
                  {source.client.email}
                </span>
              </div>
              <div className={classes.metaGroup}>
                <span className={classes.metaLabel}>
                  {t('calendar.phone')}
                </span>
                <span className={classes.metaValue}>
                  {source.client.phone}
                </span>
              </div>
            </div>
          </>
        )}
        {source?.coordinator && (
          <>
            <div className={classes.metaGroup}>
              <span className={classes.metaLabel}>
                {t('calendar.coordinator_name')}
              </span>
              <span className={classes.metaValue}>
                {source.coordinator.name}
              </span>
            </div>
            <div className={classes.metaRow}>
              <div className={classes.metaGroup}>
                <span className={classes.metaLabel}>
                  {t('calendar.email')}
                </span>
                <span className={classes.metaValue}>
                  {source.coordinator.email}
                </span>
              </div>
              <div className={classes.metaGroup}>
                <span className={classes.metaLabel}>
                  {t('calendar.phone')}
                </span>
                <span className={classes.metaValue}>
                  {source.coordinator.phone}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default SlotMetaSection
