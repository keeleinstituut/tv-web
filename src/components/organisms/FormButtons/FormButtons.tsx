import { FC } from 'react'
import classNames from 'classnames'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import { useTranslation } from 'react-i18next'
import classes from './styles.module.scss'

interface FormButtonProps {
  loading: boolean
  isResetDisabled: boolean
  isSubmitDisabled: boolean
  hidden?: boolean
  resetForm: () => void
  className?: string
}

const FormButtons: FC<FormButtonProps> = ({
  loading,
  isResetDisabled,
  isSubmitDisabled,
  hidden,
  resetForm,
  className,
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
      />
    </div>
  )
}

export default FormButtons
