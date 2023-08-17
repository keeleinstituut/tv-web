import { FC } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import classes from './classes.module.scss'
import Button, {
  AppearanceTypes,
  SizeTypes,
} from 'components/molecules/Button/Button'

interface GenerateForTranslationSectionProps {
  hidden?: boolean
  className?: string
}

const GenerateForTranslationSection: FC<GenerateForTranslationSectionProps> = ({
  hidden,
  className,
}) => {
  const { t } = useTranslation()
  if (hidden) return null
  return (
    <div className={classNames(classes.container, className)}>
      <p>{t('orders.generate_for_translation_helper')}</p>
      <Button
        appearance={AppearanceTypes.Primary}
        size={SizeTypes.S}
        className={classes.generateButton}
      >
        {t('button.generate_for_translation')}
      </Button>
    </div>
  )
}

export default GenerateForTranslationSection
