import { FC, useRef, useState, useMemo, ComponentType } from 'react'
import { useTranslation } from 'react-i18next'
import { useClickAway } from 'ahooks'
import classNames from 'classnames'
import { Root as FormRoot } from '@radix-ui/react-form'
import CloseIcon from 'assets/icons/close.svg?react'
import classes from './CalendarMoreButton.module.scss'
import SimpleDropdown from 'components/molecules/SimpleDropdown/SimpleDropdown'
import ToggleInput from 'components/molecules/ToggleInput/ToggleInput'

export interface CalendarMoreButtonProps {
  triggerLabel?: string
  TriggerIcon?: ComponentType<{ className?: string }>
  triggerClassName?: string
}

const SECTION_TITLE_KEY = 'calendar.search_dropdown_section_heading'

const TOGGLE_INPUTS = [
  {
    name: 'calendar-allow-action',
    labelKey: 'calendar.search_dropdown_allow_action',
    defaultValue: false,
  },
  {
    name: 'calendar-allow-absence',
    labelKey: 'calendar.search_dropdown_allow_absence',
    defaultValue: true,
  },
  {
    name: 'calendar-allow-change',
    labelKey: 'calendar.search_dropdown_allow_change',
    defaultValue: false,
  },
  {
    name: 'calendar-allow-overwrite',
    labelKey: 'calendar.search_dropdown_allow_overwrite',
    defaultValue: true,
  },
  {
    name: 'calendar-parameter',
    labelKey: 'calendar.search_dropdown_parameter',
    defaultValue: true,
  },
] as const

const DROPDOWN_OPTION_KEYS = [
  'calendar.search_dropdown_default',
  'calendar.search_dropdown_allowed',
] as const

type SectionConfig =
  | {
      type: 'toggles'
      toggleKeys: readonly (typeof TOGGLE_INPUTS)[number]['name'][]
    }
  | { type: 'dropdowns'; count: number }

const SECTIONS: SectionConfig[] = [
  { type: 'toggles', toggleKeys: ['calendar-allow-action'] },
  {
    type: 'toggles',
    toggleKeys: [
      'calendar-allow-absence',
      'calendar-allow-change',
      'calendar-allow-overwrite',
    ],
  },
  { type: 'dropdowns', count: 2 },
  { type: 'toggles', toggleKeys: ['calendar-parameter'] },
]

const CalendarMoreButton: FC<CalendarMoreButtonProps> = ({
  triggerLabel,
  TriggerIcon,
  triggerClassName,
}) => {
  const { t } = useTranslation()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const useCustomTrigger = Boolean(triggerLabel && triggerClassName)

  const initialToggleState = useMemo(
    () =>
      TOGGLE_INPUTS.reduce(
        (acc, { name, defaultValue }) => {
          acc[name] = defaultValue
          return acc
        },
        {} as Record<string, boolean>
      ),
    []
  )
  const [toggleValues, setToggleValues] =
    useState<Record<string, boolean>>(initialToggleState)

  useClickAway(() => setIsOpen(false), wrapperRef)

  const dropdownOptions = useMemo(
    () => DROPDOWN_OPTION_KEYS.map((key) => ({ label: t(key) })),
    [t]
  )

  const getToggleConfig = (name: (typeof TOGGLE_INPUTS)[number]['name']) =>
    TOGGLE_INPUTS.find((t) => t.name === name)!

  return (
    <div className={classes.searchDropdownWrapper} ref={wrapperRef}>
      <button
        type="button"
        className={classNames(
          useCustomTrigger ? triggerClassName : classes.triggerButton
        )}
        aria-label={t('calendar.tellija_find_suitable_time')}
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>
          {useCustomTrigger
            ? triggerLabel
            : t('calendar.tellija_find_suitable_time')}
        </span>
        {useCustomTrigger && TriggerIcon && (
          <TriggerIcon className={classes.triggerIcon} aria-hidden />
        )}
      </button>
      {isOpen && (
        <div className={classes.searchDropdownPanel}>
          <div className={classes.searchDropdownHeader}>
            <button
              type="button"
              className={classes.searchDropdownClose}
              onClick={() => setIsOpen(false)}
              aria-label={t('calendar.search_dropdown_close')}
            >
              <span>{t('calendar.search_dropdown_close')}</span>
              <CloseIcon
                className={classes.searchDropdownCloseIcon}
                aria-hidden
              />
            </button>
          </div>
          <FormRoot>
            {SECTIONS.map((section, sectionIndex) => (
              <div key={sectionIndex} className={classes.searchDropdownSection}>
                <h3 className={classes.searchDropdownSectionTitle}>
                  {t(SECTION_TITLE_KEY).toUpperCase()}
                </h3>
                {section.type === 'toggles' &&
                  section.toggleKeys.map((name) => {
                    const config = getToggleConfig(name)
                    return (
                      <ToggleInput
                        key={name}
                        name={config.name}
                        label={t(config.labelKey)}
                        value={toggleValues[config.name] ?? config.defaultValue}
                        onChange={(value) =>
                          setToggleValues((prev) => ({
                            ...prev,
                            [config.name]: value,
                          }))
                        }
                        dynamicWidth
                      />
                    )
                  })}
                {section.type === 'dropdowns' &&
                  Array.from({ length: section.count }, (_, i) => (
                    <SimpleDropdown
                      key={i}
                      label={t(
                        i === 0
                          ? 'calendar.search_dropdown_default'
                          : 'calendar.search_dropdown_allowed'
                      )}
                      className={classes.searchDropdownSelect}
                      options={dropdownOptions}
                    />
                  ))}
              </div>
            ))}
          </FormRoot>
        </div>
      )}
    </div>
  )
}

export default CalendarMoreButton
