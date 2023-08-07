import { FC, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import classes from './classes.module.scss'
import useAuth from 'hooks/useAuth'
import Container from 'components/atoms/Container/Container'
import PersonSection, {
  PersonSectionTypes,
} from 'components/molecules/PersonSection/PersonSection'
import DetailsSection from 'components/molecules/DetailsSection/DetailsSection'
import FilesSection from 'components/molecules/FilesSection/FilesSection'
import { FieldPath, SubmitHandler, useForm } from 'react-hook-form'
import { useCreateOrder } from 'hooks/requests/useOrders'
import { isEmpty, join, map } from 'lodash'
import { getFormattedDateFromObject } from 'helpers'
import { NewOrderPayload } from 'types/orders'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { useNavigate } from 'react-router-dom'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import { ValidationError } from 'api/errorHandler'
interface FormValues {
  deadline_at: { date?: string; time?: string }
  type_classifier_value_id: string
  client_user_institution_id: string
  translation_manager_user_institution_id: string
  reference_number?: string
  src_lang: string
  dst_lang: string[]
  source_files: File[]
  help_files: File[]
  help_file_types: string[]
  // TODO: Not sure about the structure of following
  translation_domain: string
  start_at?: { date?: string; time?: string }
  comments?: string
}

interface OrderDetailsProps {
  isNew?: boolean
}

const OrderDetails: FC<OrderDetailsProps> = ({ isNew }) => {
  const { t } = useTranslation()
  const { institutionUserId } = useAuth()
  const { createOrder, isLoading } = useCreateOrder()
  const navigate = useNavigate()

  // TODO: will map default values of open order here instead, when isNew === false
  const defaultValues = useMemo(
    () => ({
      deadline_at: { date: '', time: '' },
      type_classifier_value_id: '',
      client_user_institution_id: institutionUserId,
      translation_manager_user_institution_id: '',
      reference_number: '',
      src_lang: '',
      dst_lang: [],
      source_files: [],
      help_files: [],
      help_file_types: [],
      translation_domain: '',
      start_at: { date: '', time: '' },
      comments: '',
    }),
    [institutionUserId]
  )

  const {
    control,
    watch,
    handleSubmit,
    reset,
    formState: { isSubmitting, isValid },
    setError,
  } = useForm<FormValues>({
    reValidateMode: 'onSubmit',
    defaultValues: defaultValues,
  })

  const {
    client_user_institution_id,
    translation_manager_user_institution_id,
  } = watch()

  const onSubmit: SubmitHandler<FormValues> = useCallback(
    async ({ deadline_at: deadlineObject, start_at: startObject, ...rest }) => {
      const deadline_at = getFormattedDateFromObject(deadlineObject)
      const start_at = !isEmpty(startObject)
        ? getFormattedDateFromObject(startObject)
        : null
      const payload: NewOrderPayload = {
        deadline_at,
        ...(start_at ? { start_at } : {}),
        ...rest,
      }
      if (isNew) {
        try {
          const { id } = await createOrder(payload)
          showNotification({
            type: NotificationTypes.Success,
            title: t('notification.announcement'),
            content: t('success.order_created'),
          })
          navigate(`/orders/${id}`)
        } catch (errorData) {
          const typedErrorData = errorData as ValidationError
          if (typedErrorData.errors) {
            map(typedErrorData.errors, (errorsArray, key) => {
              const typedKey = key as FieldPath<FormValues>
              const errorString = join(errorsArray, ',')
              if (typedKey === 'deadline_at' || typedKey === 'start_at') {
                setError(`${typedKey}.date`, {
                  type: 'backend',
                  message: errorString,
                })
              } else {
                setError(typedKey, { type: 'backend', message: errorString })
              }
            })
          }
        }
      }
    },
    [createOrder, isNew, navigate, setError, t]
  )

  const resetForm = useCallback(() => {
    reset(defaultValues)
  }, [reset, defaultValues])

  return (
    <>
      <Container
        className={classNames(
          classes.peopleContainer,
          !isNew && classes.overwriteContainerStyles
        )}
      >
        <PersonSection
          type={PersonSectionTypes.Client}
          control={control}
          selectedUserId={client_user_institution_id}
        />
        <PersonSection
          type={PersonSectionTypes.Manager}
          control={control}
          selectedUserId={translation_manager_user_institution_id}
        />
      </Container>
      <Container
        className={classNames(
          classes.detailsContainer,
          !isNew && classes.overwriteContainerStyles
        )}
      >
        <h2>{t('orders.new_orders')}</h2>
        <DetailsSection control={control} />
        <FilesSection control={control} />
      </Container>
      <div className={classes.formButtons}>
        <Button
          appearance={AppearanceTypes.Secondary}
          onClick={resetForm}
          children={t('button.quit')}
          href={'/orders'}
          disabled={isSubmitting || isLoading}
        />
        <Button
          children={t('button.submit_order')}
          disabled={!isValid}
          loading={isSubmitting || isLoading}
          onClick={handleSubmit(onSubmit)}
        />
      </div>
    </>
  )
}

export default OrderDetails
