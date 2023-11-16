import { FC, useCallback, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import classes from './classes.module.scss'
import Tooltip from 'components/organisms/Tooltip/Tooltip'
import DiscountForm from 'components/organisms/forms/DiscountForm/DiscountForm'
import { FieldPath, SubmitHandler, useForm } from 'react-hook-form'
import { DiscountPercentages } from 'types/vendors'
import { ValidationError } from 'api/errorHandler'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { map, join, includes } from 'lodash'
import useAuth from 'hooks/useAuth'
import { Privileges } from 'types/privileges'
import {
  useFetchInstitutionDiscounts,
  useUpdateInstitutionDiscounts,
} from 'hooks/requests/useInstitutions'

const TechnicalSettings: FC = () => {
  const { t } = useTranslation()
  const { userPrivileges } = useAuth()
  const { institutionDiscounts } = useFetchInstitutionDiscounts()
  const { updateInstitutionDiscounts } = useUpdateInstitutionDiscounts()

  const defaultValues = useMemo(
    () => ({
      discount_percentage_0_49: String(
        institutionDiscounts?.discount_percentage_0_49 || '0'
      ),
      discount_percentage_50_74: String(
        institutionDiscounts?.discount_percentage_50_74 || '0'
      ),
      discount_percentage_75_84: String(
        institutionDiscounts?.discount_percentage_75_84 || '0'
      ),
      discount_percentage_85_94: String(
        institutionDiscounts?.discount_percentage_85_94 || '0'
      ),
      discount_percentage_95_99: String(
        institutionDiscounts?.discount_percentage_95_99 || '0'
      ),
      discount_percentage_100: String(
        institutionDiscounts?.discount_percentage_100 || '0'
      ),
      discount_percentage_101: String(
        institutionDiscounts?.discount_percentage_101 || '0'
      ),
      discount_percentage_repetitions: String(
        institutionDiscounts?.discount_percentage_repetitions || '0'
      ),
    }),
    [institutionDiscounts]
  )

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, isDirty, isValid, isSubmitSuccessful },
    setError,
  } = useForm<DiscountPercentages>({
    mode: 'onTouched',
    reValidateMode: 'onSubmit',
    values: defaultValues,
  })

  const onSubmit: SubmitHandler<DiscountPercentages> = useCallback(
    async (values) => {
      try {
        await updateInstitutionDiscounts(values)
        showNotification({
          type: NotificationTypes.Success,
          title: t('notification.announcement'),
          content: t('success.institution_discounts'),
        })
      } catch (errorData) {
        const typedErrorData = errorData as ValidationError
        if (typedErrorData.errors) {
          map(typedErrorData.errors, (errorsArray, key) => {
            const typedKey = key as FieldPath<DiscountPercentages>
            const errorString = join(errorsArray, ',')
            setError(typedKey, { type: 'backend', message: errorString })
          })
        }
      }
    },
    [updateInstitutionDiscounts, t, setError]
  )

  const resetForm = useCallback(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  useEffect(() => {
    resetForm()
  }, [isSubmitSuccessful, resetForm])

  return (
    <>
      <div className={classes.header}>
        <h1>{t('menu.technical_settings')}</h1>
        <Tooltip helpSectionKey="technicalSettings" />
      </div>

      <DiscountForm
        className={classes.formContainer}
        isSubmitDisabled={!isDirty || !isValid}
        isResetDisabled={!isDirty || isSubmitting}
        addFormButtons={true}
        handleOnSubmit={handleSubmit(onSubmit)}
        isEditDisabled={
          !includes(userPrivileges, Privileges.EditInstitutionPriceRate)
        }
        control={control}
        isSubmitting={isSubmitting}
        resetForm={resetForm}
      />
    </>
  )
}

export default TechnicalSettings
