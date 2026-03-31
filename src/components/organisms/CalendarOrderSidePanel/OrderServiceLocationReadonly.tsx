import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { normalizeUrl } from 'helpers/calendar'
import classes from './classes.module.scss'

type Variant = 'past' | 'translator' | 'view'

interface Props {
  serviceType?: 'REMOTE' | 'ON_SITE' | null
  location?: string | null
  meetingLink?: string | null
  variant: Variant
}

/** Shared read-only “order way” + address / meeting link blocks for side panel bodies. */
const OrderServiceLocationReadonly: FC<Props> = ({
  serviceType,
  location,
  meetingLink,
  variant,
}) => {
  const { t } = useTranslation()

  if (!serviceType) return null

  const loc = location?.trim()
  const link = meetingLink?.trim()

  return (
    <>
      <div className={classes.formGroup}>
        <span className={classes.label}>{t('calendar.order_way')}</span>
        <span className={classes.readValue}>
          {serviceType === 'REMOTE'
            ? t('calendar.service_type_remote')
            : t('calendar.service_type_contact')}
        </span>
      </div>

      {serviceType === 'ON_SITE' && loc && (
        <div className={classes.formGroup}>
          <span className={classes.label}>{t('calendar.location')}</span>
          <span
            className={
              variant === 'translator'
                ? classes.readValue
                : classes.readValueBlue
            }
          >
            {loc}
          </span>
        </div>
      )}

      {serviceType === 'REMOTE' && link && (
        <div className={classes.formGroup}>
          <span className={classes.label}>{t('calendar.meeting_link')}</span>
          {variant === 'translator' ? (
            <div className={classes.meetingLinkRow}>
              <a
                className={classes.meetingLink}
                href={normalizeUrl(link)}
                target="_blank"
                rel="noreferrer"
              >
                {link}
              </a>
              <button
                type="button"
                className={classes.copyBtn}
                onClick={() =>
                  navigator.clipboard.writeText(normalizeUrl(link))
                }
                title={t('label.copy' as never)}
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                >
                  <rect
                    x="7"
                    y="7"
                    width="10"
                    height="10"
                    rx="1.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M13 7V5C13 4.17 12.33 3.5 11.5 3.5H4.5C3.67 3.5 3 4.17 3 5v7c0 .83.67 1.5 1.5 1.5H7"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          ) : (
            <a
              className={classes.meetingLink}
              href={normalizeUrl(link)}
              target="_blank"
              rel="noreferrer"
            >
              {link}
            </a>
          )}
        </div>
      )}
    </>
  )
}

export default OrderServiceLocationReadonly
