import { FC, useCallback, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  find,
  findIndex,
  flatMap,
  get,
  isEmpty,
  keys,
  map,
  pickBy,
  toNumber,
} from 'lodash'
import { Root } from '@radix-ui/react-form'
import {
  useCreatePrices,
  useFetchPrices,
  useFetchSkills,
} from 'hooks/requests/useVendors'
import Button, {
  AppearanceTypes,
  IconPositioningTypes,
} from 'components/molecules/Button/Button'
import DataTable, {
  TableSizeTypes,
} from 'components/organisms/DataTable/DataTable'
import { ReactComponent as AddIcon } from 'assets/icons/add.svg'
import { ReactComponent as Edit } from 'assets/icons/edit.svg'
import { ReactComponent as Delete } from 'assets/icons/delete.svg'
import { ModalTypes, showModal } from 'components/organisms/modals/ModalRoot'
import DynamicForm, {
  FieldProps,
  InputTypes,
} from 'components/organisms/DynamicForm/DynamicForm'
import { Control, SubmitHandler, useForm, useWatch } from 'react-hook-form'
import { ColumnDef, createColumnHelper } from '@tanstack/react-table'
import dayjs from 'dayjs'
import AddVendorPricesTable from 'components/organisms/tables/AddVendorPricesTable/AddVendorPricesTable'
import { useClassifierValuesFetch } from 'hooks/requests/useClassifierValues'
import { VendorFormProps } from '../VendorForm/VendorForm'
import { ClassifierValueType } from 'types/classifierValues'
import {
  OrderBy,
  OrderDirection,
  PricesData,
  UpdatePricesPayload,
} from 'types/vendors'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import LanguageLabels from 'components/atoms/LanguageLabels/LanguageLabels'
import { showValidationErrorMessage } from 'api/errorHandler'
import VendorPriceListButtons from 'components/molecules/VendorPriceListButtons/VendorPriceListButtons'

import classes from './classes.module.scss'
import { Price } from 'types/price'
import EditVendorPricesTable, {
  AddPrices,
} from 'components/organisms/tables/EditVendorPricesTable/EditVendorPricesTable'

export type FormValues = {
  src_lang_classifier_value_id: string
  dst_lang_classifier_value_id: string
  skill_id?: { [key: string]: boolean }
} & {
  [key: string]: number | string
}

export type Prices = {
  id: string
  character_fee: number
  word_fee: number
  page_fee: number
  minute_fee: number
  hour_fee: number
  minimal_fee: number
  skill_id: Skill
  language_direction: string
}

export type Skill = {
  id?: string
  name?: string
}

export type VendorPriceListSecondStepProps = {
  skillsFormFields: FieldProps<FormValues>[]
  control: Control<FormValues>
  languageOptions: { label: string; value: string }[]
}

export type VendorPriceListThirdStepProps = Omit<
  VendorPriceListSecondStepProps,
  'skillsFormFields'
>

export type VendorPriceListEditContentProps = {
  control: Control<FormValues>
  languageOptions: { label: string; value: string }[]
  skillRowId: string
  vendor_id?: string
  prices: PricesData[]
}

const VendorPriceListSecondStep: FC<VendorPriceListSecondStepProps> = ({
  skillsFormFields,
  control,
  languageOptions,
}) => {
  return (
    <>
      <LanguageLabels control={control} languageOptions={languageOptions} />
      <DynamicForm
        fields={skillsFormFields}
        control={control}
        className={classes.skillsDynamicForm}
      />
    </>
  )
}

const VendorPriceListThirdStep: FC<VendorPriceListThirdStepProps> = ({
  control,
  languageOptions,
}) => {
  const selectedSkills = useWatch({ control, name: 'skill_id' })

  return (
    <>
      <LanguageLabels control={control} languageOptions={languageOptions} />
      <Root>
        <AddVendorPricesTable
          selectedSkills={selectedSkills}
          control={control}
        />
      </Root>
    </>
  )
}

const VendorPriceListEditContent: FC<VendorPriceListEditContentProps> = ({
  control,
  languageOptions,
  skillRowId,
  vendor_id,
  prices,
}) => {
  const selectedSkill = [find(prices, { id: skillRowId })].filter(
    Boolean
  ) as PricesData[]

  console.log('selectedSkill', selectedSkill)

  return (
    <>
      <LanguageLabels control={control} languageOptions={languageOptions} />
      <Root>
        <EditVendorPricesTable
          selectedSkill={selectedSkill}
          control={control}
        />
      </Root>
    </>
  )
}

const VendorPriceListForm: FC<VendorFormProps> = ({ vendor }) => {
  const { t } = useTranslation()

  const { data: skillsData } = useFetchSkills()
  const { classifierValuesFilters: languageFilter } = useClassifierValuesFetch({
    type: ClassifierValueType.Language,
  })
  const { prices, id: vendor_id } = vendor

  const { createPrices, isLoading: isCreatingPrices } =
    useCreatePrices(vendor_id)

  const { data: pricesData } = useFetchPrices({
    vendor_id,
    limit: 1,
    order_by: OrderBy.CreatedAt,
    order_direction: OrderDirection.Asc,
  })

  const priceListCreated = dayjs(
    pricesData ? pricesData[0]?.created_at : ''
  ).format('DD.MM.YYYY hh:mm')
  const priceListUpdated = dayjs(
    pricesData ? pricesData[0]?.updated_at : ''
  ).format('DD.MM.YYYY hh:mm')

  const pricesValues = useMemo(() => {
    return (
      map(
        prices,
        ({
          id,
          character_fee,
          word_fee,
          page_fee,
          minute_fee,
          hour_fee,
          minimal_fee,
          skill_id,
          source_language_classifier_value,
          destination_language_classifier_value,
        }) => {
          return {
            id: id,
            character_fee: character_fee,
            word_fee: word_fee,
            page_fee: page_fee,
            minute_fee: minute_fee,
            hour_fee: hour_fee,
            minimal_fee: minimal_fee,
            skill_id: get(skillsData, [
              findIndex(skillsData, { id: skill_id }),
              'name',
            ]),
            language_direction: `${source_language_classifier_value.name} > ${destination_language_classifier_value.name}`,
          }
        }
      ) || {}
    )
  }, [skillsData, prices])

  console.log('pricesData', pricesData)
  console.log('prices', prices)

  const { handleSubmit, control, reset } = useForm<FormValues>({
    reValidateMode: 'onChange',
  })

  const languageOptions = map(languageFilter, ({ value, label }) => {
    return {
      label: label,
      value: value,
    }
  })

  const languagePairFormFields: FieldProps<FormValues>[] = [
    {
      inputType: InputTypes.Selections,
      name: 'src_lang_classifier_value_id',
      ariaLabel: t('vendors.source_language'),
      label: `${t('vendors.source_language')}*`,
      placeholder: t('button.choose'),
      options: languageOptions,
      rules: {
        required: true,
      },
      usePortal: true,
      className: classes.languagePairSelection,
    },
    {
      inputType: InputTypes.Selections,
      name: 'dst_lang_classifier_value_id',
      ariaLabel: t('vendors.destination_language'),
      label: `${t('vendors.destination_language')}*`,
      placeholder: t('button.choose'),
      options: languageOptions,
      multiple: true,
      buttons: true,
      rules: {
        required: true,
      },
      usePortal: true,
      className: classes.languagePairSelection,
    },
  ]

  const skillsFormFields: FieldProps<FormValues>[] = map(
    skillsData,
    ({ id, name }, index) => {
      return {
        key: index,
        inputType: InputTypes.Checkbox,
        ariaLabel: name || '',
        label: name,
        name: `skill_id.${id}_${index}`,
        className: classes.skillsField,
      }
    }
  )

  const handleEditPriceModal = (skillRowId: string) => {
    showModal(ModalTypes.EditableVendorPriceList, {
      // submitForm: handleSubmit(onSubmit),
      // resetForm: resetForm(),
      // buttonComponent: (
      //   <VendorPriceListButtons
      //     control={control}
      //     isLoading={isCreatingPrices}
      //   />
      // ),
      title: t('vendors.price_list_change'),
      helperText: t('vendors.price_list_change_description'),
      modalContent: (
        <VendorPriceListEditContent
          control={control}
          languageOptions={languageOptions}
          skillRowId={skillRowId}
          vendor_id={vendor_id}
          prices={prices}
        />
      ),
    })
  }

  const columnHelper = createColumnHelper<Prices>()

  const columns = [
    columnHelper.accessor('language_direction', {
      header: () => t('vendors.language_direction'),
      cell: (info) => {
        return <div className={classes.languageTag}>{info.renderValue()}</div>
      },
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('skill_id', {
      header: () => t('vendors.skill'),
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('character_fee', {
      header: () => t('vendors.character_fee'),
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('word_fee', {
      header: () => t('vendors.word_fee'),
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('page_fee', {
      header: () => t('vendors.page_fee'),
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('minute_fee', {
      header: () => t('vendors.minute_fee'),
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('hour_fee', {
      header: () => t('vendors.hour_fee'),
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('minimal_fee', {
      header: () => t('vendors.minimal_fee'),
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('id', {
      header: () => <></>,
      cell: ({ row }) => {
        const skillRowId = row.original.id
        return (
          <div className={classes.iconsContainer}>
            <Button
              appearance={AppearanceTypes.Text}
              icon={Edit}
              ariaLabel={t('vendors.edit_language_pair')}
              className={classes.editIcon}
              onClick={() => handleEditPriceModal(skillRowId)}
            />
            <Button
              appearance={AppearanceTypes.Text}
              icon={Delete}
              ariaLabel={t('vendors.delete')}
              className={classes.deleteIcon}
              // handle delete
            />
          </div>
        )
      },
    }),
  ] as ColumnDef<any>[]

  const resetForm = useCallback(() => {
    reset()
  }, [reset])

  useEffect(() => {
    resetForm()
  }, [resetForm])

  const onSubmit: SubmitHandler<FormValues> = useCallback(
    async (values) => {
      const transformedArray = flatMap(
        values.dst_lang_classifier_value_id,
        (dstValue) => {
          return map(
            keys(pickBy(values.skill_id, (value) => value === true)),
            (key) => {
              const number = key.split('_').pop()

              return {
                vendor_id: vendor_id,
                skill_id: key.replace(/_\d+$/, ''),
                src_lang_classifier_value_id:
                  values['src_lang_classifier_value_id'],
                dst_lang_classifier_value_id: dstValue,
                character_fee: toNumber(values[`character_fee-${number}`]) || 0,
                word_fee: toNumber(values[`word_fee-${number}`]) || 0,
                page_fee: toNumber(values[`page_fee-${number}`]) || 0,
                minute_fee: toNumber(values[`minute_fee-${number}`]) || 0,
                hour_fee: toNumber(values[`hour_fee-${number}`]) || 0,
                minimal_fee: toNumber(values[`minimal_fee-${number}`]) || 0,
              }
            }
          )
        }
      )

      const payload: UpdatePricesPayload = {
        data: [...transformedArray],
      }

      try {
        await createPrices(payload)

        showNotification({
          type: NotificationTypes.Success,
          title: t('notification.announcement'),
          content: t('success.language_pairs_prices_added'),
        })
        resetForm()
      } catch (errorData) {
        showValidationErrorMessage(errorData)
      }
    },
    [createPrices, resetForm, t, vendor_id]
  )

  const handleModalOpen = () => {
    showModal(ModalTypes.FormProgress, {
      formData: [
        {
          label: t('vendors.add_language_pairs'),
          title: t('vendors.choose_language_pairs'),
          helperText: t('vendors.language_pairs_helper_text'),
          modalContent: (
            <DynamicForm
              fields={languagePairFormFields}
              control={control}
              className={classes.languagePairDynamicForm}
            />
          ),
        },
        {
          label: t('vendors.add_skills'),
          title: t('vendors.choose_skills'),
          helperText: t('vendors.skills_helper_text'),
          modalContent: (
            <VendorPriceListSecondStep
              skillsFormFields={skillsFormFields}
              control={control}
              languageOptions={languageOptions}
            />
          ),
        },
        {
          label: t('vendors.add_price_list'),
          title: t('vendors.set_price_list'),
          helperText: t('vendors.price_list_helper_text'),
          modalContent: (
            <VendorPriceListThirdStep
              control={control}
              languageOptions={languageOptions}
            />
          ),
        },
      ],
      submitForm: handleSubmit(onSubmit),
      resetForm: resetForm(),
      buttonComponent: (
        <VendorPriceListButtons
          control={control}
          isLoading={isCreatingPrices}
        />
      ),
    })
  }

  return (
    <>
      <Root>
        <DataTable
          data={pricesValues}
          columns={columns}
          tableSize={TableSizeTypes.M}
          className={
            !isEmpty(pricesValues)
              ? classes.vendorPricesContainer
              : classes.hiddenVendorPrices
          }
          title={
            <div className={classes.pricesDataTableHeader}>
              {t('vendors.vendor_price_list_title')}
              <Button
                appearance={AppearanceTypes.Text}
                icon={AddIcon}
                iconPositioning={IconPositioningTypes.Left}
                onClick={handleModalOpen}
                className={classes.pricesLanguageButton}
              >
                {t('vendors.add_language_directions')}
              </Button>
            </div>
          }
        />
      </Root>

      <p className={classes.dateText}>
        {t('vendors.price_list_created', { priceListCreated })}
      </p>
      <p className={classes.dateText}>
        {t('vendors.price_list_updated_at', { priceListUpdated })}
      </p>
    </>
  )
}

export default VendorPriceListForm
