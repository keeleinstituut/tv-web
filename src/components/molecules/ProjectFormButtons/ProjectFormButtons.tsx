import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

interface ProjectFormButtonsProps {
  resetForm: () => void
  setIsEditEnabled: (editable: boolean) => void
  onSubmit: () => void
  isNew?: boolean
  isEditEnabled?: boolean
  isSubmitting?: boolean
  isLoading?: boolean
  isValid?: boolean
  hidden?: boolean
  isDirty?: boolean
  className?: string
}

const ProjectFormButtons: FC<ProjectFormButtonsProps> = ({
  resetForm,
  isNew,
  isEditEnabled,
  setIsEditEnabled,
  isSubmitting,
  isLoading,
  isValid,
  isDirty,
  onSubmit,
  hidden,
  className,
}) => {
  const { t } = useTranslation()

  const submitButtonLabel = useMemo(() => {
    if (isNew) return t('button.submit_project')
    if (isEditEnabled) return t('button.save')
    return t('button.edit')
  }, [isEditEnabled, isNew, t])

  if (hidden) return null

  return (
    <div className={className}>
      <Button
        appearance={AppearanceTypes.Secondary}
        children={isNew ? t('button.quit') : t('button.cancel')}
        {...(isNew
          ? { href: '/projects' }
          : {
              onClick: () => {
                setIsEditEnabled(false)
                resetForm()
              },
            })}
        hidden={!isNew && !isEditEnabled}
        disabled={isSubmitting || isLoading}
      />
      <Button
        children={submitButtonLabel}
        disabled={(!isValid || !isDirty) && isEditEnabled}
        loading={isSubmitting || isLoading}
        onClick={isEditEnabled ? onSubmit : () => setIsEditEnabled(true)}
      />
    </div>
  )
}

export default ProjectFormButtons
