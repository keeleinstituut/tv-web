import { FC, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  find,
  findIndex,
  flatMap,
  get,
  keys,
  map,
  pickBy,
  toNumber,
} from 'lodash'
import { Root } from '@radix-ui/react-form'
import { useCreatePrices, useFetchSkills } from 'hooks/requests/useVendors'
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
import AddPricesTable from 'components/organisms/tables/AddPricesTable/AddPricesTable'
import { useClassifierValuesFetch } from 'hooks/requests/useClassifierValues'
import { VendorFormProps } from '../VendorForm/VendorForm'
import { ClassifierValueType } from 'types/classifierValues'
import { UpdatePricesPayload } from 'types/vendors'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { showValidationErrorMessage } from 'api/errorHandler'

import classes from './classes.module.scss'

export type FormValues = {
  src_lang_classifier_value_id: string
  dst_lang_classifier_value_id: string
  skill_id?: { [key: string]: boolean }
} & {
  [key: string]: number | string
}

export type Skill = {
  id?: string
  name?: string
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

type VendorPriceListSecondStepProps = {
  skillsFormFields: FieldProps<FormValues>[]
  control: Control<FormValues>
  languageOptions: { label: string; value: string }[]
}

type VendorPriceListThirdStepProps = Omit<
  VendorPriceListSecondStepProps,
  'skillsFormFields'
>

type LanguageLabelsProps = Omit<
  VendorPriceListSecondStepProps,
  'skillsFormFields'
>

const LanguageLabels: FC<LanguageLabelsProps> = ({
  control,
  languageOptions,
}) => {
  const { t } = useTranslation()

  const findLabelByValue = (values: string[] | string | undefined) => {
    const valueArray = Array.isArray(values) ? values : [values]
    return map(valueArray, (value) => find(languageOptions, { value })?.label)
  }

  const sourceLanguageLabel = findLabelByValue(
    useWatch({ control }).src_lang_classifier_value_id
  )

  const destinationLanguageLabels = findLabelByValue(
    useWatch({ control }).dst_lang_classifier_value_id
  )

  return (
    <div hidden={!sourceLanguageLabel || !destinationLanguageLabels}>
      <p className={classes.sourceLanguage}>{t('vendors.source_language')}</p>
      <p className={classes.languageTag}>{sourceLanguageLabel}</p>
      <p className={classes.destinationLanguage}>
        {t('vendors.destination_language')}
      </p>
      <p className={classes.languageTag}>{destinationLanguageLabels}</p>
    </div>
  )
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
        <AddPricesTable selectedSkills={selectedSkills} control={control} />
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
  const { prices, id: userId } = vendor

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

  const { handleSubmit, control } = useForm<FormValues>({
    reValidateMode: 'onChange',
  })

  const { createPrices, isLoading: isCreatingPrices } = useCreatePrices(userId)

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
      label: t('vendors.source_language'),
      placeholder: t('button.choose'),
      options: languageOptions,
      // rules: {
      //   required: true,
      // },
      usePortal: true,
      className: classes.languagePairSelection,
    },
    {
      inputType: InputTypes.Selections,
      name: 'dst_lang_classifier_value_id',
      ariaLabel: t('vendors.destination_language'),
      label: t('vendors.destination_language'),
      placeholder: t('button.choose'),
      options: languageOptions,
      multiple: true,
      buttons: true,
      // rules: {
      //   required: true,
      // },
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
        // rules: {
        //   required: true,
        // },
        className: classes.skillsField,
      }
    }
  )

  const columnHelper = createColumnHelper<Prices>()

  const columns = [
    columnHelper.accessor('language_direction', {
      header: () => t('vendors.language_direction'),
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
      cell: () => (
        <div className={classes.iconsContainer}>
          <Button
            appearance={AppearanceTypes.Text}
            icon={Edit}
            ariaLabel={t('vendors.edit_language_pair')}
            className={classes.editIcon}
            // handle modal open
          />
          <Button
            appearance={AppearanceTypes.Text}
            icon={Delete}
            ariaLabel={t('vendors.delete')}
            className={classes.deleteIcon}
            // handle delete
          />
        </div>
      ),
    }),
  ] as ColumnDef<any>[]

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
                vendor_id: userId,
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

      // console.log('transformedArray', transformedArray)

      const payload: UpdatePricesPayload = {
        data: [...transformedArray],
      }

      try {
        await createPrices(payload)
        showNotification({
          type: NotificationTypes.Success,
          title: t('notification.announcement'),
          content: t('success.vendor_updated'),
        })
      } catch (errorData) {
        showValidationErrorMessage(errorData)
      }
    },
    [createPrices, t, userId]
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
    })
  }

  return (
    <>
      <Root>
        <DataTable
          data={pricesValues}
          columns={columns}
          tableSize={TableSizeTypes.M}
          className={classes.vendorPricesContainer}
          hidePagination
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
        {t('vendors.price_list_created', {
          time: dayjs().format('DD.MM.YYYY hh:mm') || '',
        })}
      </p>
      <p className={classes.dateText}>
        {t('vendors.price_list_updated_at', {
          time: dayjs().format('DD.MM.YYYY hh:mm') || '',
        })}
      </p>
    </>
  )
}

export default VendorPriceListForm
