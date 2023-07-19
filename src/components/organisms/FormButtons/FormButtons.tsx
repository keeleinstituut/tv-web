import { FC } from 'react'
import classNames from 'classnames'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import { useTranslation } from 'react-i18next'
import classes from './classes.module.scss'

interface FormButtonProps {
  loading: boolean
  isResetDisabled: boolean
  isSubmitDisabled: boolean
  hidden?: boolean
  resetForm: () => void
  className?: string
  formId?: string
}

const FormButtons: FC<FormButtonProps> = ({
  loading,
  isResetDisabled,
  isSubmitDisabled,
  hidden,
  resetForm,
  className,
  formId,
}) => {
  const { t } = useTranslation()
  if (hidden) return null
  return (
    <div className={classNames(classes.formButtons, className)}>
      <Button
        appearance={AppearanceTypes.Secondary}
        onClick={resetForm}
        children={t('button.cancel')}
        disabled={isResetDisabled || loading}
      />
      <Button
        children={t('button.save_changes')}
        disabled={isSubmitDisabled}
        loading={loading}
        type="submit"
        form={formId}
      />
    </div>
  )
}

export default FormButtons
