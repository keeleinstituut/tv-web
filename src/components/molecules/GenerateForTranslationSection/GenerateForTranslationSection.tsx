import { FC, useMemo } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import classes from './classes.module.scss'
import Button, {
  AppearanceTypes,
  SizeTypes,
} from 'components/molecules/Button/Button'
import { CatProjectStatus } from 'types/projects'

interface GenerateForTranslationSectionProps {
  hidden?: boolean
  className?: string
  openSendToCatModal?: () => void
  disabled?: boolean
  isLoading?: boolean
  isProjectInProgress?: boolean
  catSetupStatus?: CatProjectStatus
}

const GenerateForTranslationSection: FC<GenerateForTranslationSectionProps> = ({
  hidden,
  className,
  openSendToCatModal,
  disabled,
  isLoading,
  catSetupStatus,
}) => {
  const { t } = useTranslation()

  const helperText = useMemo(() => {
    switch (catSetupStatus) {
      case CatProjectStatus.InProgress: {
        return t('projects.generating_project_in_progress')
      }
      case CatProjectStatus.Failed: {
        return t('projects.generating_project_failed')
      }
      default: {
        return t('projects.generate_for_translation_helper')
      }
    }
  }, [catSetupStatus, t])

  if (hidden) return null
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
