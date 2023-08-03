import { FC } from 'react'
import classNames from 'classnames'
import { map, includes, without, isEmpty, compact } from 'lodash'
import classes from './classes.module.scss'
import Tag from 'components/atoms/Tag/Tag'
import { useTranslation } from 'react-i18next'

interface OptionProp {
  label: string
  value: string
}

export interface TagsSelectProps {
  options?: OptionProp[]
  value?: string[]
  onChange?: (values: string[]) => void
  className?: string
  label?: string
}

const TagsSelect: FC<TagsSelectProps> = ({
  options,
  value,
  onChange,
  className,
}) => {
  const { t } = useTranslation()
  const currentValue = value || []
  const handleChange = (optionValue: string) => {
    if (optionValue === 'all' && !isEmpty(currentValue)) {
      // All button clears choices, if any are picked
      onChange && onChange([])
    } else if (includes(currentValue, optionValue)) {
      // If option is selected, we remove it
      onChange && onChange(without(currentValue, optionValue))
    } else {
      // If option is not selected we add it
      onChange && onChange([...currentValue, optionValue])
    }
  }
  return (
    <div className={classNames(classes.tagsContainer, className)}>
      <Tag
        label={t('label.all')}
        value={isEmpty(currentValue)}
        onChange={() => handleChange('all')}
        withBorder
      />
      {map(compact(options), ({ label, value: optionValue }) => (
        <Tag
          label={label}
          value={includes(currentValue, optionValue)}
          key={optionValue}
          onChange={() => handleChange(optionValue)}
          withBorder
        />
      ))}
    </div>
  )
}

export default TagsSelect
