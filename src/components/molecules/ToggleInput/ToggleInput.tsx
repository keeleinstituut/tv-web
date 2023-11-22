import { forwardRef } from 'react'
import classNames from 'classnames'
import classes from './classes.module.scss'
import { InputHTMLAttributes } from 'react'
import SmallTooltip from 'components/molecules/SmallTooltip/SmallTooltip'
import BaseButton from 'components/atoms/BaseButton/BaseButton'
import { useTranslation } from 'react-i18next'

export interface ToggleInputProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'label' | 'placeholder' | 'value' | 'onChange'
  > {
  name: string
  className?: string
  tooltipContent?: string
  label: string
  value?: boolean
  onChange?: (newValue: boolean) => void
}

const ToggleInput = forwardRef<HTMLInputElement, ToggleInputProps>(
  function ToggleInput(
    {
      label,
      name,
      className,
      tooltipContent,
      disabled,
      value = false,
      onChange,
    },
    ref
  ) {
    const { t } = useTranslation()
    const handleChange = () => {
      if (onChange) {
        onChange(!value)
      }
    }
    return (
      <BaseButton
        onClick={handleChange}
        disabled={disabled}
        className={classNames(
          classes.toggleContainer,
          disabled && classes.disabled,
          className
        )}
      >
        <label htmlFor={name}>{label}</label>
        <SmallTooltip
          hidden={!tooltipContent}
          tooltipContent={tooltipContent}
        />
        <div className={classes.row}>
          <span>{t('label.no')}</span>
          <div className={classNames(classes.switch, value && classes.checked)}>
            <input
              type="checkbox"
              name={name}
              checked={!!value}
              readOnly
              ref={ref}
            />
            <span className={classNames(classes.slider)}></span>
          </div>
          <span>{t('label.yes')}</span>
        </div>
      </BaseButton>
    )
  }
)

export default ToggleInput
