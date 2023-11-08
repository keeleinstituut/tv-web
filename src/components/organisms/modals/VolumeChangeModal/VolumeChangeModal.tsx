import { FC, useCallback, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { closeModal } from '../ModalRoot'
import {
  map,
  toString,
  round,
  values,
  pick,
  mapKeys,
  reduce,
  toNumber,
  zipObject,
  pickBy,
  identity,
  join,
} from 'lodash'
import ConfirmationModalBase from '../ConfirmationModalBase/ConfirmationModalBase'
import { FieldPath, SubmitHandler, useForm } from 'react-hook-form'
import DynamicForm, {
  FieldProps,
  InputTypes,
} from 'components/organisms/DynamicForm/DynamicForm'
import { Price, PriceUnits } from 'types/price'
import {
  DiscountPercentageNames,
  DiscountPercentages,
  DiscountPercentagesAmountNames,
  DiscountPercentagesAmounts,
} from 'types/vendors'
import {
  useAssignmentAddCatVolume,
  useAssignmentAddVolume,
  useAssignmentEditCatVolume,
  useAssignmentEditVolume,
} from 'hooks/requests/useAssignments'
import VolumeCatPriceTable from 'components/organisms/tables/VolumeCatPriceTable/VolumeCatPriceTable'
import { Root } from '@radix-ui/react-form'
import { CatAnalysis } from 'types/orders'
import { CatVolumePayload, ManualVolumePayload } from 'types/assignments'

import classes from './classes.module.scss'
import {
  apiTypeToKey,
  keyToApiType,
} from 'components/molecules/AddVolumeInput/AddVolumeInput'
import { VolumeValue } from 'types/volumes'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { ValidationError } from 'api/errorHandler'

export interface VolumeChangeModalProps {
  assignmentId?: string
  catJobId?: string
  isCat?: boolean
  isModalOpen?: boolean
  id?: string
  vendorPrices?: Price
  discounts?: DiscountPercentages
  vendorName?: string
  volume_analysis?: CatAnalysis
  unit_fee?: number
  unit_type?: string
  unit_quantity?: number
  subOrderId?: string
  onChangeValue?: (volume: VolumeValue) => void
}

enum CatAnalysisVolumes {
  Tm101 = 'tm_101',
  Tmrepetitions = 'repetitions',
  Tm100 = 'tm_100',
  Tm9599 = 'tm_95_99',
  Tm8594 = 'tm_85_94',
  Tm7584 = 'tm_75_84',
  Tm5074 = 'tm_50_74',
  Tm049 = 'tm_0_49',
}

const analysisVolumeByDiscountPercentage = {
  [CatAnalysisVolumes.Tm049]: DiscountPercentageNames.DP_0_49,
  [CatAnalysisVolumes.Tm5074]: DiscountPercentageNames.DP_50_74,
  [CatAnalysisVolumes.Tm7584]: DiscountPercentageNames.DP_75_84,
  [CatAnalysisVolumes.Tm8594]: DiscountPercentageNames.DP_85_94,
  [CatAnalysisVolumes.Tm9599]: DiscountPercentageNames.DP_95_99,
  [CatAnalysisVolumes.Tm100]: DiscountPercentageNames.DP_100,
  [CatAnalysisVolumes.Tm101]: DiscountPercentageNames.DP_101,
  [CatAnalysisVolumes.Tmrepetitions]: DiscountPercentageNames.DP_repetitions,
}

type FormValues = {
  task_type: string
  unit: PriceUnits
  unit_fee: number
  minimum_price: number
  total_price: string
  vendor: string
  unit_quantity: number
} & DiscountPercentages &
  DiscountPercentagesAmounts

const VolumeChangeModal: FC<VolumeChangeModalProps> = ({
  // onSave,
  isCat,
  id,
  vendorName,
  vendorPrices,
  discounts,
  volume_analysis,
  assignmentId,
  catJobId,
  unit_fee: initialUnitFee,
  unit_quantity: initialUnitQuantity,
  unit_type,
  subOrderId,
  onChangeValue,
  ...rest
}) => {
  const { t } = useTranslation()

  const { addAssignmentVolume } = useAssignmentAddVolume({ subOrderId })
  const { addAssignmentCatVolume } = useAssignmentAddCatVolume({ subOrderId })
  const { editAssignmentVolume } = useAssignmentEditVolume({ subOrderId })
  const { editAssignmentCatVolume } = useAssignmentEditCatVolume({ subOrderId })

  const catAnalysisAmounts = useMemo(() => {
    const relevantValues = pick(volume_analysis, values(CatAnalysisVolumes))
    const keyedByDiscount = mapKeys(
      relevantValues,
      (_, key) =>
        `${
          analysisVolumeByDiscountPercentage[key as CatAnalysisVolumes]
        }_amount`
    )
    return keyedByDiscount
  }, [volume_analysis]) as DiscountPercentages

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    setError,
    formState: { isValid, isSubmitting },
  } = useForm<FormValues>({
    mode: 'onChange',
    defaultValues: {
      // TODO: might need to deal with task_type
      task_type: 'Tõlkimine',
      unit: isCat ? PriceUnits.WordFee : undefined,
      unit_fee: isCat ? vendorPrices?.word_fee : undefined,
      vendor: vendorName || undefined,
      ...discounts,
      ...catAnalysisAmounts,
    },
  })

  // Populate the modal when edit is opened
  useEffect(() => {
    reset({
      // TODO: might need to deal with task_type
      task_type: 'Tõlkimine',
      unit: isCat ? PriceUnits.WordFee : undefined,
      unit_fee: isCat ? vendorPrices?.word_fee : undefined,
      vendor: vendorName || undefined,
      ...discounts,
      ...catAnalysisAmounts,
    })
    setValue('unit_quantity', initialUnitQuantity ?? 0)
    setValue('unit_fee', initialUnitFee ?? 0)
    if (unit_type) {
      setValue('unit', apiTypeToKey(unit_type ?? ''))
    }
    // Only reset on id change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const [unit, unit_fee, unit_quantity] = watch([
    'unit',
    'unit_fee',
    'unit_quantity',
  ])

  const amountDiscounts = watch(values(DiscountPercentageNames)) as string[]
  const amountValues = watch(values(DiscountPercentagesAmountNames))

  const totalAmount = useMemo(
    () =>
      reduce(
        amountValues,
        (sum, n, i) => {
          return (
            sum +
            ((100 - toNumber(amountDiscounts[i] ?? 0)) / 100) *
              toNumber(amountValues[i])
          )
        },
        0
      ),
    [amountDiscounts, amountValues]
  )

  useEffect(() => {
    if (totalAmount === 0 || totalAmount) {
      setValue('unit_quantity', totalAmount, { shouldValidate: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalAmount])

  useEffect(() => {
    if (unit && vendorPrices?.[unit]) {
      setValue('unit_fee', vendorPrices?.[unit], { shouldValidate: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit])

  useEffect(() => {
    if (unit_fee && unit_quantity) {
      setValue('total_price', toString(round(unit_fee * unit_quantity, 2)), {
        shouldValidate: true,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit_fee, unit_quantity])

  const priceUnitOptions = map(PriceUnits, (unit) => ({
    label: t(`label.${unit}`),
    value: unit,
  }))

  const fields: FieldProps<FormValues>[] = useMemo(
    () => [
      {
        inputType: InputTypes.Text,
        ariaLabel: t('label.task_type'),
        label: `${t('label.task_type')}`,
        name: 'task_type',
        className: classes.inputInternalPosition,
        onlyDisplay: true,
        emptyDisplayText: '-',
      },
      {
        inputType: InputTypes.Selections,
        className: classes.inputInternalPosition,
        ariaLabel: t('label.unit'),
        placeholder: t('placeholder.pick'),
        emptyDisplayText: '-',
        label: t('label.unit'),
        name: 'unit',
        options: priceUnitOptions,
        onlyDisplay: isCat,
        rules: {
          required: true,
        },
      },
      {
        inputType: InputTypes.Text,
        type: 'number',
        className: classes.inputInternalPosition,
        label: t('label.cost_price'),
        ariaLabel: t('label.cost_price'),
        placeholder: '0.00',
        name: 'unit_fee',
        rules: {
          required: true,
        },
      },
      {
        inputType: InputTypes.Text,
        className: classes.inputInternalPosition,
        onlyDisplay: true,
        hidden: !isCat,
        emptyDisplayText: '0.00€',
        label: t('label.minimum_price'),
        ariaLabel: t('label.minimum_price'),
        name: 'minimum_price',
      },
      {
        inputType: InputTypes.Text,
        className: classes.inputInternalPosition,
        hidden: isCat,
        type: 'number',
        label: t('label.amount'),
        ariaLabel: t('label.amount'),
        placeholder: '0',
        name: 'unit_quantity',
        rules: {
          required: true,
        },
      },
      {
        inputType: InputTypes.Text,
        className: classes.inputInternalPosition,
        onlyDisplay: true,
        emptyDisplayText: '-',
        label: t('label.total_price'),
        ariaLabel: t('label.total_price'),
        name: 'total_price',
        type: 'number',
      },
      {
        inputType: InputTypes.Text,
        className: classes.inputInternalPosition,
        onlyDisplay: true,
        emptyDisplayText: '-',
        label: t('label.vendor'),
        ariaLabel: t('label.vendor'),
        name: 'vendor',
      },
    ],
    [isCat, priceUnitOptions, t]
  )

  // Probably can be improved a bit and unified with onSaveEdit
  const onSaveNew = useCallback(
    async (isCat: boolean, args: ManualVolumePayload | CatVolumePayload) => {
      let res: VolumeValue
      try {
        if (isCat) {
          const { data: response } = await addAssignmentCatVolume({
            data: {
              ...(args as CatVolumePayload),
              discounts: pickBy(
                (args as CatVolumePayload).discounts,
                identity
              ) as DiscountPercentages,
            },
          })
          res = response
        } else {
          const { data: response } = await addAssignmentVolume({
            data: args as ManualVolumePayload,
          })
          res = response
        }
        showNotification({
          type: NotificationTypes.Success,
          title: t('notification.announcement'),
          content: t('success.volume_added'),
        })
        if (onChangeValue) {
          onChangeValue(res)
        }
        closeModal()
      } catch (errorData) {
        const typedErrorData = errorData as ValidationError
        if (typedErrorData.errors) {
          map(typedErrorData.errors, (errorsArray, key) => {
            const typedKey = key as FieldPath<FormValues>
            const errorString = join(errorsArray, ',')
            setError(typedKey, { type: 'backend', message: errorString })
          })
        }
        // TODO: need to map errors to form
        showNotification({
          type: NotificationTypes.Error,
          title: t('notification.error'),
        })
      }
    },
    [addAssignmentCatVolume, addAssignmentVolume, onChangeValue, setError, t]
  )

  const onSaveEdit = useCallback(
    async (isCat: boolean, args: ManualVolumePayload | CatVolumePayload) => {
      delete args.assignment_id
      let res: VolumeValue
      try {
        if (isCat) {
          const { data: response } = await editAssignmentCatVolume({
            volumeId: id as string,
            data: args as CatVolumePayload,
          })
          res = response
        } else {
          const { data: response } = await editAssignmentVolume({
            volumeId: id as string,
            data: args as ManualVolumePayload,
          })
          res = response
        }
        showNotification({
          type: NotificationTypes.Success,
          title: t('notification.announcement'),
          content: t('success.volume_edited'),
        })
        if (onChangeValue) {
          onChangeValue(res)
        }
        closeModal()
      } catch (errorData) {
        const typedErrorData = errorData as ValidationError
        if (typedErrorData.errors) {
          map(typedErrorData.errors, (errorsArray, key) => {
            const typedKey = key as FieldPath<FormValues>
            const errorString = join(errorsArray, ',')
            setError(typedKey, { type: 'backend', message: errorString })
          })
        }
        // TODO: need to map errors to form
        showNotification({
          type: NotificationTypes.Error,
          title: t('notification.error'),
        })
      }
    },
    [
      editAssignmentCatVolume,
      editAssignmentVolume,
      id,
      onChangeValue,
      setError,
      t,
    ]
  )

  const onSave = useCallback(
    async (isCat: boolean, args: ManualVolumePayload | CatVolumePayload) => {
      if (id) {
        onSaveEdit(isCat, args)
      } else {
        onSaveNew(isCat, args)
      }
    },
    [id, onSaveEdit, onSaveNew]
  )

  const onSubmit: SubmitHandler<FormValues> = useCallback(
    async ({ unit_quantity, unit, unit_fee, ...rest }) => {
      // @ts-expect-error type mismatch
      const payload: ManualVolumePayload | CatVolumePayload = !isCat
        ? {
            assignment_id: assignmentId ?? '',
            unit_fee: toNumber(unit_fee),
            unit_quantity: toNumber(unit_quantity),
            unit_type: keyToApiType(unit),
          }
        : {
            assignment_id: assignmentId ?? '',
            unit_fee: toNumber(unit_fee),
            discounts: zipObject<DiscountPercentages>(
              values(DiscountPercentageNames),
              // @ts-expect-error type mismatch
              map(amountDiscounts, toNumber)
            ),
            custom_volume_analysis: zipObject<CatAnalysisVolumes>(
              values(CatAnalysisVolumes),
              // @ts-expect-error type mismatch
              map(amountValues, toNumber).reverse() // because the enum itself is in the reverse order
            ),
            cat_tool_job_id: catJobId ?? '',
          }
      onSave(!!isCat, payload)
    },
    [isCat, assignmentId, amountDiscounts, amountValues, catJobId, onSave]
  )

  return (
    <ConfirmationModalBase
      {...rest}
      handleProceed={handleSubmit(onSubmit)}
      cancelButtonContent={t('button.close')}
      cancelButtonDisabled={isSubmitting}
      proceedButtonContent={t('button.confirm')}
      proceedButtonDisabled={!isValid}
      proceedButtonLoading={isSubmitting}
      className={classes.modalContainer}
      title={
        isCat ? t('modal.pick_volume_by_cat') : t('modal.pick_volume_manually')
      }
      helperText={
        isCat ? (
          <>
            {t('modal.picked_analysis_for')}{' '}
            <b>{JSON.stringify(volume_analysis?.files_names)}</b>
            <br />
            {t('modal.pick_volume_by_cat_helper')}
          </>
        ) : (
          t('modal.pick_volume_manually_helper')
        )
      }
      closeModal={closeModal}
      modalContent={
        <Root>
          <DynamicForm
            control={control}
            fields={fields}
            className={classes.formContainer}
            useDivWrapper
          />
          <VolumeCatPriceTable control={control} hidden={!isCat} />
        </Root>
      }
    />
  )
}

export default VolumeChangeModal
