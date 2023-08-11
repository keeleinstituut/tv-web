import { FC, useCallback, useMemo, useState } from 'react'
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
import { isEmpty, join, map, uniq } from 'lodash'
import {
  getLocalDateOjectFromUtcDateString,
  getUtcDateStringFromLocalDateObject,
} from 'helpers'
import { DetailedOrder, NewOrderPayload, SourceFile } from 'types/orders'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { useNavigate } from 'react-router-dom'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import { ValidationError } from 'api/errorHandler'
import { Root } from '@radix-ui/react-form'

export enum OrderDetailModes {
  New = 'new',
  Editable = 'editable',
}

interface FormValues {
  deadline_at: { date?: string; time?: string }
  type_classifier_value_id: string
  client_user_institution_id: string
  translation_manager_user_institution_id: string
  reference_number?: string
  src_lang: string
  dst_lang: string[]
  source_files: (File | SourceFile | undefined)[]
  help_files: (File | SourceFile | undefined)[]
  help_file_types: string[]
  // TODO: Not sure about the structure of following
  translation_domain: string
  start_at?: { date?: string; time?: string }
  comments?: string
  ext_id?: string
}

interface OrderDetailsProps {
  mode?: OrderDetailModes
  order?: DetailedOrder
}

const OrderDetails: FC<OrderDetailsProps> = ({ mode, order }) => {
  const { t } = useTranslation()
  const { institutionUserId } = useAuth()
  const { createOrder, isLoading } = useCreateOrder()
  const navigate = useNavigate()
  const isNew = mode === OrderDetailModes.New
  const [isEditable, setIsEditable] = useState(isNew)

  console.warn('institutionUserId', institutionUserId)

  // TODO: will map default values of open order here instead, when isNew === false

  const defaultValues = useMemo(() => {
    const {
      deadline_at,
      start_at,
      type_classifier_value_id = '',
      client_user_institution_id = '',
      translation_manager_user_institution_id = '',
      reference_number = '',
      source_files,
      help_files,
      translation_domain = '',
      help_file_types = [],
      comments = '',
      ext_id = '',
      sub_projects,
    } = order || {}

    console.warn('calculating value for', deadline_at)

    const src_lang =
      sub_projects?.[0]?.source_language_classifier_value_id || ''
    const dst_lang =
      uniq(map(sub_projects, 'destination_language_classifier_value_id')) || []
    return {
      type_classifier_value_id,
      client_user_institution_id: isNew
        ? institutionUserId
        : client_user_institution_id,
      translation_manager_user_institution_id,
      reference_number,
      source_files: isNew ? [] : source_files,
      help_files: isNew ? [] : help_files,
      ext_id,
      deadline_at: deadline_at
        ? getLocalDateOjectFromUtcDateString(deadline_at)
        : { date: '', time: '' },
      start_at: start_at
        ? getLocalDateOjectFromUtcDateString(start_at)
        : { date: '', time: '' },
      src_lang,
      dst_lang,
      // TODO: not clear how BE will send the help_file_types back to FE
      help_file_types,
      translation_domain,
      comments,
      // TODO: these Need extra mapping
    }
  }, [institutionUserId, isNew, order])

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
    async ({
      deadline_at: deadlineObject,
      start_at: startObject,
      source_files,
      help_files,
      ...rest
    }) => {
      const deadline_at = getUtcDateStringFromLocalDateObject(deadlineObject)
      const start_at = !isEmpty(startObject)
        ? getUtcDateStringFromLocalDateObject(startObject)
        : null
      if (isNew) {
        const payload: NewOrderPayload = {
          deadline_at,
          source_files: source_files as File[],
          help_files: help_files as File[],
          ...(start_at ? { start_at } : {}),
          ...rest,
        }
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
    <Root
      className={classNames(
        classes.wrapper,
        !isNew && classes.overwriteContainerStyles
      )}
    >
      <Container className={classNames(classes.peopleContainer)}>
        <PersonSection
          type={PersonSectionTypes.Client}
          control={control}
          selectedUserId={client_user_institution_id}
          isNew={isNew}
          isEditable={isEditable}
        />
        <PersonSection
          type={PersonSectionTypes.Manager}
          control={control}
          selectedUserId={translation_manager_user_institution_id}
          isNew={isNew}
          isEditable={mode === OrderDetailModes.New}
        />
      </Container>
      <Container className={classNames(classes.detailsContainer)}>
        <DetailsSection
          control={control}
          isNew={isNew}
          isEditable={isEditable}
          // isEditable={mode === OrderDetailModes.New}
        />
        <FilesSection
          control={control}
          isNew={isNew}
          // isEditable={mode === OrderDetailModes.New}
        />
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
    </Root>
  )
}

export default OrderDetails
