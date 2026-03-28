import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import ArrowDownIcon from 'assets/icons/arrow_down.svg?react'
import classes from './classes.module.scss'

interface MetaSource {
  reference_number?: string
  client?: { name: string; institution: string; email: string; phone: string }
  coordinator?: { name: string; email: string; phone: string }
}

interface SlotMetaSectionProps {
  source: MetaSource | null | undefined
  isMetaOpen: boolean
  onToggle: () => void
}

const SlotMetaSection: FC<SlotMetaSectionProps> = ({
  source,
  isMetaOpen,
  onToggle,
}) => {
  const { t } = useTranslation()

  return (
    <>
      <button className={classes.metaToggle} onClick={onToggle}>
        <ArrowDownIcon
          className={classNames(classes.metaIcon, {
            [classes.metaIconOpen]: isMetaOpen,
          })}
        />
        <span>{t('calendar.order_meta')}</span>
      </button>
      {isMetaOpen && (
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
      )}
    </>
  )
}

export default SlotMetaSection
