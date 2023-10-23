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
  openSendToCatModal?: () => void
  disabled?: boolean
  isLoading?: boolean
  isProjectInProgress?: boolean
}

const GenerateForTranslationSection: FC<GenerateForTranslationSectionProps> = ({
  hidden,
  className,
  openSendToCatModal,
  disabled,
  isLoading,
  isProjectInProgress = false,
}) => {
  const { t } = useTranslation()
  if (hidden) return null
  const helperText = isProjectInProgress
    ? t('orders.generating_project_in_progress')
    : t('orders.generate_for_translation_helper')
  return (
    <div className={classNames(classes.container, className)}>
      <p>{helperText}</p>
      <Button
        appearance={AppearanceTypes.Primary}
        size={SizeTypes.S}
        className={classes.generateButton}
        onClick={openSendToCatModal}
        disabled={disabled}
        loading={isLoading}
      >
        {t('button.generate_for_translation')}
      </Button>
    </div>
  )
}

export default GenerateForTranslationSection
