import { FC, useCallback, useEffect, useMemo } from 'react'
import { useForm, SubmitHandler, FieldPath } from 'react-hook-form'
import DynamicForm, {
  FieldProps,
  InputTypes,
} from 'components/organisms/DynamicForm/DynamicForm'
import { useTranslation } from 'react-i18next'
import { includes, join, map, mapValues, startsWith, toNumber } from 'lodash'
import { Privileges } from 'types/privileges'
import classes from './classes.module.scss'
import { useAuth } from 'components/contexts/AuthContext'
import { useUpdateInstitutionPartner } from 'hooks/requests/useInstitutionPartners'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { ValidationError } from 'api/errorHandler'
import { DiscountPercentages } from 'types/vendors'
import { InstitutionPartner, UpdateInstitutionPartnerPayload } from 'types/outsourceRequests'
import DiscountForm from '../DiscountForm/DiscountForm'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import dayjs from 'dayjs'

type FormValues = {
  name?: string
} & DiscountPercentages

export type InstitutionPartnerFormProps = {
  institutionPartner: InstitutionPartner
}

const InstitutionPartnerForm: FC<InstitutionPartnerFormProps> = ({
  institutionPartner,
}) => {
  const { t } = useTranslation()
  const { userPrivileges } = useAuth()
  const { updateInstitutionPartner } = useUpdateInstitutionPartner({
    id: institutionPartner.id,
  })

  const {
    partner_institution,
    created_at,
    updated_at,
    discount_percentage_0_49,
    discount_percentage_50_74,
    discount_percentage_75_84,
    discount_percentage_85_94,
    discount_percentage_95_99,
    discount_percentage_100,
    discount_percentage_101,
    discount_percentage_repetitions,
  } = institutionPartner

  const defaultValues = useMemo(
    () => ({
      name: partner_institution?.name || '',
      discount_percentage_0_49:
        String(100 - toNumber(discount_percentage_0_49)) || '100',
      discount_percentage_50_74:
        String(100 - toNumber(discount_percentage_50_74)) || '100',
      discount_percentage_75_84:
        String(100 - toNumber(discount_percentage_75_84)) || '100',
      discount_percentage_85_94:
        String(100 - toNumber(discount_percentage_85_94)) || '100',
      discount_percentage_95_99:
        String(100 - toNumber(discount_percentage_95_99)) || '100',
      discount_percentage_100:
        String(100 - toNumber(discount_percentage_100)) || '100',
      discount_percentage_101:
        String(100 - toNumber(discount_percentage_101)) || '100',
      discount_percentage_repetitions:
        String(100 - toNumber(discount_percentage_repetitions)) || '100',
    }),
    [
      partner_institution,
      discount_percentage_0_49,
      discount_percentage_50_74,
      discount_percentage_75_84,
      discount_percentage_85_94,
      discount_percentage_95_99,
      discount_percentage_100,
      discount_percentage_101,
      discount_percentage_repetitions,
    ]
  )

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, isDirty, isValid },
    setError,
  } = useForm<FormValues>({
    mode: 'onTouched',
    reValidateMode: 'onSubmit',
    defaultValues,
  })

  const isEditDisabled = !includes(userPrivileges, Privileges.EditVendorDb)
  const showDates = created_at && updated_at
  const createdAt = dayjs(created_at).format('DD.MM.YYYY hh:mm')
  const updatedAt = dayjs(updated_at).format('DD.MM.YYYY hh:mm')

  const resetForm = useCallback(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  useEffect(() => {
    resetForm()
  }, [defaultValues, resetForm])

  const onSubmit: SubmitHandler<FormValues> = useCallback(
    async (values) => {
      const { name, ...discounts } = values

      const payload: UpdateInstitutionPartnerPayload = {
        ...mapValues(discounts, (value) => 100 - toNumber(value)),
      }

      try {
        await updateInstitutionPartner(payload)
        showNotification({
          type: NotificationTypes.Success,
          title: t('notification.announcement'),
          content: t('success.vendor_updated', { name }),
        })
      } catch (errorData) {
        const typedErrorData = errorData as ValidationError
        if (typedErrorData.errors) {
          map(typedErrorData.errors, (errorsArray, key) => {
            const typedKey = key as FieldPath<FormValues>
            const errorString = join(errorsArray, ',')
            if (startsWith(typedKey, 'institution_partner')) {
              setError('name', { type: 'backend', message: errorString })
            } else {
              setError(typedKey, { type: 'backend', message: errorString })
            }
          })
        }
      }
    },
    [updateInstitutionPartner, t, setError]
  )

  return (
    <>
      <div className={classes.container}>
        <div className={classes.formContainer}>

          <DiscountForm
            control={control}
            isSubmitting={isSubmitting}
            resetForm={resetForm}
            isEditDisabled={isEditDisabled}
          />
        </div>
        <div className={classes.formButtons}>
          <Button
            appearance={AppearanceTypes.Secondary}
            onClick={resetForm}
            children={t('button.cancel')}
            disabled={!isDirty || isSubmitting}
          />
          <Button
            children={t('button.save')}
            disabled={!isDirty || !isValid}
            loading={isSubmitting}
            onClick={handleSubmit(onSubmit)}
          />
        </div>
      </div>
      <div hidden={!showDates} className={classes.datesContainer}>
        <p className={classes.dateText}>
          {t('vendors.vendor_created', { vendorCreated: createdAt })}
        </p>
        <p className={classes.dateText}>
          {t('vendors.vendor_updated_at', { vendorUpdated: updatedAt })}
        </p>
      </div>
    </>
  )
}

export default InstitutionPartnerForm
