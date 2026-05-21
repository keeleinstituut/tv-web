import {
  FC,
  useCallback,
  useEffect,
  useMemo,
} from 'react'
import { useTranslation } from 'react-i18next'
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
  replace,
  includes,
  mapValues,
} from 'lodash'
import { FieldPath, SubmitHandler, useForm } from 'react-hook-form'
import { Root } from '@radix-ui/react-form'
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
} from 'hooks/requests/useVolumes'
import VolumeCatPriceTable from 'components/organisms/tables/VolumeCatPriceTable/VolumeCatPriceTable'
import { CatAnalysis } from 'types/projects'
import { CatVolumePayload, ManualVolumePayload } from 'types/assignments'
import {
  apiTypeToKey,
  keyToApiType,
} from 'components/molecules/AddVolumeInput/AddVolumeInput'
import { VolumeValue } from 'types/volumes'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { ValidationError } from 'api/errorHandler'
import { ProjectDetailModes } from 'components/organisms/ProjectDetails/ProjectDetails'
import useValidators from 'hooks/useValidators'

import classes from './classes.module.scss'

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

const defaultDiscounts = reduce(
  DiscountPercentageNames,
  (result, value) => {
    if (!value) return result
    return { ...result, [value]: 0 }
  },
  {}
)

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

export interface VolumeFormState {
  submit: () => void
  isValid: boolean
  isLoading: boolean
}

export interface VolumeFormProps {
  assignmentId?: string
  id?: string
  isCat?: boolean
  catJobId?: string
  volume_analysis?: CatAnalysis
  unit_fee?: number
  unit_type?: string
  unit_quantity?: number
  discounts?: DiscountPercentages
  vendorPrices?: Price
  vendorName?: string
  sub_project_id?: string
  mode?: ProjectDetailModes
  taskViewPricesClass?: string
  hideVendor?: boolean
  onSuccess: (volume: VolumeValue) => void
  onFormStateChange?: (state: VolumeFormState) => void
}

const VolumeForm: FC<VolumeFormProps> = ({
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
  sub_project_id,
  hideVendor,
  onSuccess,
  onFormStateChange,
  mode,
  taskViewPricesClass,
}) => {
  const { t } = useTranslation()
  const validators = useValidators()

  const inverseDiscounts = mapValues(
    discounts || defaultDiscounts,
    (value: number) => 100 - value
  )

  const { addAssignmentVolume, isLoading: isAddingVolume } =
    useAssignmentAddVolume({ subProjectId: sub_project_id })
  const { addAssignmentCatVolume, isLoading: isAddingCatVolume } =
    useAssignmentAddCatVolume({ subProjectId: sub_project_id })
  const { editAssignmentVolume, isLoading: isEditingVolume } =
    useAssignmentEditVolume({ subProjectId: sub_project_id })
  const { editAssignmentCatVolume, isLoading: isEditingCatVolume } =
    useAssignmentEditCatVolume({ subProjectId: sub_project_id })

  const isLoading =
    isAddingVolume || isAddingCatVolume || isEditingVolume || isEditingCatVolume

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
    formState: { isValid },
  } = useForm<FormValues>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      task_type: 'Tõlkimine',
      unit: isCat ? PriceUnits.WordFee : undefined,
      unit_fee: isCat ? vendorPrices?.word_fee : undefined,
      vendor: vendorName || undefined,
      ...inverseDiscounts,
      ...catAnalysisAmounts,
    },
  })

  useEffect(() => {
    reset({
      task_type: 'Tõlkimine',
      unit: isCat ? PriceUnits.WordFee : undefined,
      unit_fee: isCat ? vendorPrices?.word_fee : undefined,
      vendor: vendorName || undefined,
      ...inverseDiscounts,
      ...catAnalysisAmounts,
    })
    setValue('unit_quantity', initialUnitQuantity ?? 0)
    setValue('unit_fee', initialUnitFee ?? 0)
    if (unit_type) {
      setValue('unit', apiTypeToKey(unit_type ?? ''))
    }
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
      round(
        reduce(
          amountValues,
          (sum, n, i) =>
            sum +
            (toNumber(amountDiscounts[i] ?? 0) / 100) *
              toNumber(amountValues[i]),
          0
        ),
        3
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
        onlyDisplay: isCat || mode === ProjectDetailModes.View,
        rules: { required: true },
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
          validate: (value: unknown) => {
            const typedValue = value as string
            return validators.priceValidator(typedValue)
          },
        },
        onlyDisplay: mode === ProjectDetailModes.View,
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
        hidden: isCat || mode === ProjectDetailModes.View,
        type: 'number',
        label: t('label.amount'),
        ariaLabel: t('label.amount'),
        placeholder: '0',
        name: 'unit_quantity',
        rules: { required: true },
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
        hidden: hideVendor,
        label: t('label.vendor'),
        ariaLabel: t('label.vendor'),
        name: 'vendor',
      },
    ],
    [hideVendor, isCat, mode, priceUnitOptions, t]
  )

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
        onSuccess(res)
      } catch (errorData) {
        const typedErrorData = errorData as ValidationError
        if (typedErrorData.errors) {
          map(typedErrorData.errors, (errorsArray, key) => {
            const errorString = join(errorsArray, ',')
            if (includes(['unit', 'unit_fee', 'unit_quantity'], key)) {
              setError(key as FieldPath<FormValues>, {
                type: 'backend',
                message: errorString,
              })
            } else {
              const errorKey = replace(
                key,
                'custom_volume_analysis.',
                ''
              ) as CatAnalysisVolumes
              const typedKey =
                `${analysisVolumeByDiscountPercentage[errorKey]}_amount` as FieldPath<FormValues>
              setError(typedKey, { type: 'backend', message: errorString })
            }
          })
        }
      }
    },
    [addAssignmentCatVolume, addAssignmentVolume, onSuccess, setError, t]
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
        onSuccess(res)
      } catch (errorData) {
        const typedErrorData = errorData as ValidationError
        if (typedErrorData.errors) {
          map(typedErrorData.errors, (errorsArray, key) => {
            const errorString = join(errorsArray, ',')
            if (includes(['unit', 'unit_fee', 'unit_quantity'], key)) {
              setError(key as FieldPath<FormValues>, {
                type: 'backend',
                message: errorString,
              })
            } else {
              const errorKey = replace(
                key,
                'custom_volume_analysis.',
                ''
              ) as CatAnalysisVolumes
              const typedKey =
                `${analysisVolumeByDiscountPercentage[errorKey]}_amount` as FieldPath<FormValues>
              setError(typedKey, { type: 'backend', message: errorString })
            }
          })
        }
      }
    },
    [editAssignmentCatVolume, editAssignmentVolume, id, onSuccess, setError, t]
  )

  const onSubmit: SubmitHandler<FormValues> = useCallback(
    async ({ unit_quantity, unit, unit_fee }) => {
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
            discounts: mapValues(
              zipObject<DiscountPercentages>(
                values(DiscountPercentageNames),
                // @ts-expect-error type mismatch
                map(amountDiscounts, toNumber)
              ),
              (value: number) => 100 - value
            ),
            custom_volume_analysis: zipObject<CatAnalysisVolumes>(
              values(CatAnalysisVolumes),
              // @ts-expect-error type mismatch
              map(amountValues, toNumber).reverse()
            ),
            cat_tool_job_id: catJobId ?? '',
          }
      if (id) {
        onSaveEdit(!!isCat, payload)
      } else {
        onSaveNew(!!isCat, payload)
      }
    },
    [isCat, assignmentId, amountDiscounts, amountValues, catJobId, id, onSaveEdit, onSaveNew]
  )

  const submit = useCallback(
    () => handleSubmit(onSubmit)(),
    [handleSubmit, onSubmit]
  )

  useEffect(() => {
    onFormStateChange?.({ submit, isValid, isLoading })
  }, [submit, isValid, isLoading, onFormStateChange])

  return (
    <Root>
      <DynamicForm
        control={control}
        fields={fields}
        className={classes.formContainer}
        useDivWrapper
      />
      <VolumeCatPriceTable
        control={control}
        hidden={!isCat}
        isEditable={mode !== ProjectDetailModes.View}
        taskViewPricesClass={taskViewPricesClass}
      />
    </Root>
  )
}

export default VolumeForm
