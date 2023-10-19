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
} from 'lodash'
import ConfirmationModalBase from '../ConfirmationModalBase/ConfirmationModalBase'
import { SubmitHandler, useForm } from 'react-hook-form'
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
import VolumeCatPriceTable from 'components/organisms/tables/VolumeCatPriceTable/VolumeCatPriceTable'
import { Root } from '@radix-ui/react-form'
import { CatAnalysis } from 'types/orders'
import { VolumePayload } from 'types/assignments'

import classes from './classes.module.scss'

export interface VolumeChangeModalProps {
  onSave?: (newVolume: VolumePayload) => void
  assignmentId?: string
  isCat?: boolean
  isModalOpen?: boolean
  id?: string
  vendorPrices?: Price
  vendorDiscounts?: DiscountPercentages
  vendorName?: string
  matchingCatAnalysis?: CatAnalysis
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
  cost_price: number
  minimum_price: number
  total_price: string
  vendor: string
  amount: number
} & DiscountPercentages &
  DiscountPercentagesAmounts

const VolumeChangeModal: FC<VolumeChangeModalProps> = ({
  onSave,
  isCat,
  id,
  vendorName,
  vendorPrices,
  vendorDiscounts,
  matchingCatAnalysis,
  assignmentId,
  ...rest
}) => {
  const { t } = useTranslation()

  const catAnalysisAmounts = useMemo(() => {
    const relevantValues = pick(matchingCatAnalysis, values(CatAnalysisVolumes))
    const keyedByDiscount = mapKeys(
      relevantValues,
      (_, key) =>
        `${
          analysisVolumeByDiscountPercentage[key as CatAnalysisVolumes]
        }_amount`
    )
    return keyedByDiscount
  }, [matchingCatAnalysis]) as DiscountPercentages

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { isValid, isSubmitting },
  } = useForm<FormValues>({
    mode: 'onChange',
    defaultValues: {
      // TODO: might need to deal with task_type
      task_type: 'Tõlkimine',
      unit: isCat ? PriceUnits.WordFee : undefined,
      cost_price: isCat ? vendorPrices?.word_fee : undefined,
      vendor: vendorName || undefined,
      ...vendorDiscounts,
      ...catAnalysisAmounts,
    },
  })

  const [unit, cost_price, amount] = watch(['unit', 'cost_price', 'amount'])

  const amountDiscounts = watch(values(DiscountPercentageNames))
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
      setValue('amount', totalAmount, { shouldValidate: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalAmount])

  useEffect(() => {
    if (unit && vendorPrices?.[unit]) {
      setValue('cost_price', vendorPrices?.[unit], { shouldValidate: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit])

  useEffect(() => {
    if (cost_price && amount) {
      setValue('total_price', toString(round(cost_price * amount, 2)), {
        shouldValidate: true,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cost_price, amount])

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
        name: 'cost_price',
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
        name: 'amount',
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

  const onSubmit: SubmitHandler<FormValues> = useCallback(
    async ({ amount, unit, cost_price, ...rest }) => {
      // const chunkId = matchingCatAnalysis?.chunk_id
      // const volumePayload: VolumeValue = {
      //   amount,
      //   unit,
      //   ...(chunkId ? { chunkId } : {}),
      //   ...(volumeId ? { volumeId } : {}),
      //   isCat: !!isCat,
      // }
      if (onSave) {
        onSave({
          assignment_id: assignmentId ?? '',
          unit_fee: cost_price,
          unit_quantity: amount,
          unit_type: 'CHARACTERS',
        })
      }
    },
    [assignmentId, onSave]
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
            <b>{JSON.stringify(matchingCatAnalysis?.files_names)}</b>
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
