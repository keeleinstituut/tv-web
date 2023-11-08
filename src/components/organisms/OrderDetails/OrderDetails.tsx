import { FC, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import useAuth from 'hooks/useAuth'
import Container from 'components/atoms/Container/Container'
import PersonSection, {
  PersonSectionTypes,
} from 'components/molecules/PersonSection/PersonSection'
import DetailsSection from 'components/molecules/DetailsSection/DetailsSection'
import OrderFilesSection from 'components/molecules/OrderFilesSection/OrderFilesSection'
import { FieldPath, SubmitHandler, useForm } from 'react-hook-form'
import { useCreateOrder, useUpdateOrder } from 'hooks/requests/useOrders'
import { join, map, uniq, includes } from 'lodash'
import {
  getLocalDateOjectFromUtcDateString,
  getUtcDateStringFromLocalDateObject,
} from 'helpers'
import {
  DetailedOrder,
  NewOrderPayload,
  SourceFile,
  OrderStatus,
} from 'types/orders'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import OrderStatusTag from 'components/molecules/OrderStatusTag/OrderStatusTag'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { useNavigate } from 'react-router-dom'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import { ValidationError } from 'api/errorHandler'
import { Root } from '@radix-ui/react-form'
import dayjs from 'dayjs'
import ExpandableContentContainer from 'components/molecules/ExpandableContentContainer/ExpandableContentContainer'
import { Privileges } from 'types/privileges'

import classes from './classes.module.scss'
import { TagTypes } from 'types/tags'

export enum OrderDetailModes {
  New = 'new',
  Editable = 'editable',
}

interface FormButtonsProps {
  resetForm: () => void
  setIsEditable: (editable: boolean) => void
  onSubmit: () => void
  isNew?: boolean
  isEditable?: boolean
  isSubmitting?: boolean
  isLoading?: boolean
  isValid?: boolean
  hidden?: boolean
}

const FormButtons: FC<FormButtonsProps> = ({
  resetForm,
  isNew,
  isEditable,
  setIsEditable,
  isSubmitting,
  isLoading,
  isValid,
  onSubmit,
  hidden,
}) => {
  const { t } = useTranslation()

  const submitButtonLabel = useMemo(() => {
    if (isNew) return t('button.submit_order')
    if (isEditable) return t('button.save')
    return t('button.edit')
  }, [isEditable, isNew, t])

  if (hidden) return null

  return (
    <div className={classes.formButtons}>
      <Button
        appearance={AppearanceTypes.Secondary}
        onClick={resetForm}
        children={isNew ? t('button.quit') : t('button.cancel')}
        {...(isNew
          ? { href: '/orders' }
          : { onClick: () => setIsEditable(false) })}
        hidden={!isNew && !isEditable}
        disabled={isSubmitting || isLoading}
      />
      <Button
        children={submitButtonLabel}
        disabled={!isValid && isEditable}
        loading={isSubmitting || isLoading}
        onClick={isEditable ? onSubmit : () => setIsEditable(true)}
      />
    </div>
  )
}

interface FormValues {
  deadline_at: { date?: string; time?: string }
  type_classifier_value_id: string
  client_institution_user_id: string
  manager_institution_user_id: string
  reference_number?: string
  source_language_classifier_value_id: string
  destination_language_classifier_value_ids: string[]
  source_files: (File | SourceFile | undefined)[]
  help_files: (File | SourceFile | undefined)[]
  help_file_types: string[]
  translation_domain_classifier_value_id: string
  event_start_at?: { date?: string; time?: string }
  // TODO: Not sure about the structure of following
  comments?: string
  ext_id?: string
  tags?: TagTypes[]
}

interface OrderDetailsProps {
  mode?: OrderDetailModes
  order?: DetailedOrder
  isUserClientOfProject?: boolean
  className?: string
  isTaskView?: boolean
}

const OrderDetails: FC<OrderDetailsProps> = ({
  mode,
  order,
  isUserClientOfProject,
  className,
  isTaskView,
}) => {
  const { t } = useTranslation()
  const { institutionUserId, userPrivileges } = useAuth()
  const { createOrder, isLoading } = useCreateOrder()
  const { updateOrder, isLoading: isUpdatingOrder } = useUpdateOrder({
    id: order?.id,
  })
  const navigate = useNavigate()
  const isNew = mode === OrderDetailModes.New
  const [isEditable, setIsEditable] = useState(isNew)

  const { status = OrderStatus.Registered } = order || {}
  const hasManagerPrivilege = includes(userPrivileges, Privileges.ManageProject)

  const isEditableBySomeone =
    hasManagerPrivilege ||
    (isUserClientOfProject && includes(userPrivileges, Privileges.ChangeClient))

  const defaultValues = useMemo(() => {
    const {
      deadline_at,
      event_start_at,
      type_classifier_value,
      client_institution_user,
      manager_institution_user,
      reference_number = '',
      source_files,
      help_files,
      translation_domain_classifier_value,
      help_file_types = [],
      comments = '',
      ext_id = '',
      sub_projects,
      accepted_at = '',
      corrected_at = '',
      rejected_at = '',
      cancelled_at = '',
      created_at = '',
    } = order || {}

    const source_language_classifier_value_id =
      sub_projects?.[0]?.source_language_classifier_value_id || ''
    const destination_language_classifier_value_ids =
      uniq(map(sub_projects, 'destination_language_classifier_value_id')) || []

    return {
      type_classifier_value_id: type_classifier_value?.id,
      client_institution_user_id: isNew
        ? institutionUserId
        : client_institution_user?.id,
      manager_institution_user_id: manager_institution_user?.id,
      reference_number,
      source_files: isNew ? [] : source_files,
      help_files: isNew ? [] : help_files,
      ext_id,
      deadline_at: deadline_at
        ? getLocalDateOjectFromUtcDateString(deadline_at)
        : { date: '', time: '' },
      event_start_at: event_start_at
        ? getLocalDateOjectFromUtcDateString(event_start_at)
        : { date: '', time: '' },
      source_language_classifier_value_id,
      destination_language_classifier_value_ids,
      // TODO: not clear how BE will send the help_file_types back to FE
      help_file_types,
      translation_domain_classifier_value_id:
        translation_domain_classifier_value?.id,
      comments,
      accepted_at: accepted_at ? dayjs(accepted_at).format('DD.MM.YYYY') : '',
      corrected_at: corrected_at
        ? dayjs(corrected_at).format('DD.MM.YYYY')
        : '',
      rejected_at: rejected_at ? dayjs(rejected_at).format('DD.MM.YYYY') : '',
      cancelled_at: cancelled_at
        ? dayjs(cancelled_at).format('DD.MM.YYYY')
        : '',
      created_at: created_at ? dayjs(created_at).format('DD.MM.YYYY') : '',
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

  const { client_institution_user_id, manager_institution_user_id } = watch()

  const mapOrderValidationErrors = useCallback(
    (errorData: ValidationError) => {
      if (errorData.errors) {
        map(errorData.errors, (errorsArray, key) => {
          const typedKey = key as FieldPath<FormValues>
          const errorString = join(errorsArray, ',')
          setError(typedKey, {
            type: 'backend',
            message: errorString,
          })
        })
      }
    },
    [setError]
  )

  const handleNewOrderSubmit = useCallback(
    async (payload: NewOrderPayload) => {
      try {
        const createdOrder = await createOrder(payload)
        showNotification({
          type: NotificationTypes.Success,
          title: t('notification.announcement'),
          content: t('success.order_created'),
        })
        navigate(`/orders/${createdOrder?.data?.id}`)
      } catch (errorData) {
        const typedErrorData = errorData as ValidationError
        mapOrderValidationErrors(typedErrorData)
      }
    },
    [createOrder, mapOrderValidationErrors, navigate, t]
  )

  const handleUpdateOrderSubmit = useCallback(
    async (payload: NewOrderPayload) => {
      try {
        await updateOrder(payload)
        showNotification({
          type: NotificationTypes.Success,
          title: t('notification.announcement'),
          content: t('success.order_updated'),
        })
        setIsEditable(false)
      } catch (errorData) {
        const typedErrorData = errorData as ValidationError
        mapOrderValidationErrors(typedErrorData)
      }
    },
    [mapOrderValidationErrors, t, updateOrder]
  )

  const onSubmit: SubmitHandler<FormValues> = useCallback(
    async ({
      deadline_at: deadlineObject,
      event_start_at: startObject,
      source_files,
      help_files,
      client_institution_user_id,
      manager_institution_user_id,
      reference_number,
      source_language_classifier_value_id,
      destination_language_classifier_value_ids,
      help_file_types,
      translation_domain_classifier_value_id,
      comments,
      type_classifier_value_id,
      tags,
      ...rest
    }) => {
      // TODO: need to go over all of this once it's clear what can be updated and how
      const deadline_at = getUtcDateStringFromLocalDateObject(deadlineObject)
      const event_start_at =
        startObject?.date || startObject?.time
          ? getUtcDateStringFromLocalDateObject(startObject)
          : null

      const payload: NewOrderPayload = {
        type_classifier_value_id,
        deadline_at,
        source_files: source_files as File[],
        help_files: help_files as File[],
        client_institution_user_id,
        manager_institution_user_id,
        reference_number,
        source_language_classifier_value_id,
        destination_language_classifier_value_ids,
        help_file_types,
        translation_domain_classifier_value_id,
        comments,
        ...(!isNew ? { tags } : {}),
        ...(event_start_at ? { event_start_at } : {}),
      }
      if (isNew) {
        handleNewOrderSubmit(payload)
      } else {
        handleUpdateOrderSubmit(payload)
      }
    },
    [handleNewOrderSubmit, handleUpdateOrderSubmit, isNew]
  )

  const resetForm = useCallback(() => {
    reset(defaultValues)
  }, [reset, defaultValues])

  const formButtonsProps = useMemo(
    () => ({
      onSubmit: handleSubmit(onSubmit),
      resetForm,
      isNew,
      isEditable,
      setIsEditable,
      isSubmitting,
      isLoading: isLoading || isUpdatingOrder,
      isValid,
    }),
    [
      handleSubmit,
      isEditable,
      isLoading,
      isNew,
      isSubmitting,
      isUpdatingOrder,
      isValid,
      onSubmit,
      resetForm,
    ]
  )

  return (
    <ExpandableContentContainer
      hidden={isNew}
      contentAlwaysVisible={isNew}
      rightComponent={<OrderStatusTag status={status} />}
      leftComponent={
        <h2 className={classes.expandableContentTitle}>
          {t('orders.order_details_expandable')}
        </h2>
      }
      className={className}
    >
      <Root
        className={classNames(
          classes.wrapper,
          !isNew && classes.existingOrderWrapper,
          !isEditable && classes.viewModeWrapper
        )}
      >
        <Container className={classNames(classes.peopleContainer)}>
          <PersonSection
            type={PersonSectionTypes.Client}
            control={control}
            selectedUserId={client_institution_user_id}
            isNew={isNew}
            isEditable={
              includes(userPrivileges, Privileges.ChangeClient) &&
              isEditableBySomeone &&
              isEditable
            }
          />
          <PersonSection
            type={PersonSectionTypes.Manager}
            control={control}
            selectedUserId={manager_institution_user_id}
            isNew={isNew}
            isEditable={isEditableBySomeone && isEditable}
          />
        </Container>
        <Container className={classNames(classes.detailsContainer)}>
          <DetailsSection
            control={control}
            isNew={isNew}
            isEditable={isEditableBySomeone && isEditable}
          />
          <OrderFilesSection
            orderId={order?.id}
            control={control}
            isEditable={isEditableBySomeone && isEditable}
          />
          <FormButtons
            {...formButtonsProps}
            hidden={isNew || !isEditableBySomeone || isTaskView}
          />
        </Container>
        <FormButtons
          {...formButtonsProps}
          hidden={!isNew || !isEditableBySomeone}
        />
      </Root>
    </ExpandableContentContainer>
  )
}

export default OrderDetails
