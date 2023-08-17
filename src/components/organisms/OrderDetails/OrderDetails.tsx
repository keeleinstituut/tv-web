import { FC, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import useAuth from 'hooks/useAuth'
import Container from 'components/atoms/Container/Container'
import PersonSection, {
  PersonSectionTypes,
} from 'components/molecules/PersonSection/PersonSection'
import DetailsSection from 'components/molecules/DetailsSection/DetailsSection'
import FilesSection from 'components/molecules/FilesSection/FilesSection'
import { FieldPath, SubmitHandler, useForm } from 'react-hook-form'
import { useCreateOrder, useUpdateOrder } from 'hooks/requests/useOrders'
import { isEmpty, join, map, uniq, includes, find } from 'lodash'
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
  isUserClientOfProject?: boolean
}

const OrderDetails: FC<OrderDetailsProps> = ({
  mode,
  order,
  isUserClientOfProject,
}) => {
  const { t } = useTranslation()
  const { institutionUserId, userPrivileges } = useAuth()
  const { createOrder, isLoading } = useCreateOrder()
  const { updateOrder, isLoading: isUpdatingOrder } = useUpdateOrder({
    orderId: order?.id,
  })
  const navigate = useNavigate()
  const isNew = mode === OrderDetailModes.New
  const [isEditable, setIsEditable] = useState(isNew)

  const { status = OrderStatus.Registered } = order || {}
  const hasManagerPrivilege = find(
    [Privileges.ManageProject, Privileges.ReceiveAndManageProject],
    (privilege) => includes(userPrivileges, privilege)
  )

  // const isEditableByManager = hasManagerPrivilege
  // const isEditableByManager = hasManagerPrivilege && isEditable
  // const isEditableByClient = isNew && isEditable

  const isEditableBySomeone =
    hasManagerPrivilege ||
    (isUserClientOfProject && includes(userPrivileges, Privileges.ChangeClient))

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
      accepted_at = '',
      corrected_at = '',
      rejected_at = '',
      cancelled_at = '',
      created_at = '',
    } = order || {}

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

  const {
    client_user_institution_id,
    translation_manager_user_institution_id,
  } = watch()

  const mapOrderValidationErrors = useCallback(
    (errorData: ValidationError) => {
      if (errorData.errors) {
        map(errorData.errors, (errorsArray, key) => {
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
    },
    [setError]
  )

  const handleNewOrderSubmit = useCallback(
    async (payload: NewOrderPayload) => {
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
      start_at: startObject,
      source_files,
      help_files,
      client_user_institution_id,
      translation_manager_user_institution_id,
      reference_number,
      src_lang,
      dst_lang,
      help_file_types,
      translation_domain,
      comments,
      ...rest
    }) => {
      // TODO: need to go over all of this once it's clear what can be updated and how
      const deadline_at = getUtcDateStringFromLocalDateObject(deadlineObject)
      const start_at = !isEmpty(startObject)
        ? getUtcDateStringFromLocalDateObject(startObject)
        : null
      const payload: NewOrderPayload = {
        deadline_at,
        source_files: source_files as File[],
        help_files: help_files as File[],
        client_user_institution_id,
        translation_manager_user_institution_id,
        reference_number,
        src_lang,
        dst_lang,
        help_file_types,
        translation_domain,
        comments,
        ...(start_at ? { start_at } : {}),
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
      extraComponent={<OrderStatusTag status={status} />}
      title={t('orders.order_details_expandable')}
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
            selectedUserId={client_user_institution_id}
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
            selectedUserId={translation_manager_user_institution_id}
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
          <FilesSection
            control={control}
            isEditable={isEditableBySomeone && isEditable}
          />
          <FormButtons
            {...formButtonsProps}
            hidden={isNew || !isEditableBySomeone}
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
