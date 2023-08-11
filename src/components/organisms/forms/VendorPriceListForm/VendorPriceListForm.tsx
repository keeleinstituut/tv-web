import { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { filter, find, map } from 'lodash'
import { Root } from '@radix-ui/react-form'
import { useFetchSkills, useFetchVendorPrices } from 'hooks/requests/useVendors'
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
import { Control, useForm, useWatch } from 'react-hook-form'
import { ColumnDef, createColumnHelper } from '@tanstack/react-table'
import dayjs from 'dayjs'
import AddPricesTable from 'components/organisms/tables/AddPricesTable/AddPricesTable'

import classes from './classes.module.scss'
import { useClassifierValuesFetch } from 'hooks/requests/useClassifierValues'

type SkillsFormValue = {
  [key in string]?: string
}
export interface FormValues {
  source_language: string
  destination_language: string[]
  skills: SkillsFormValue
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
  skill: Skill
  language_direction: string
}

type VendorPriceListStepProps = {
  skillsFormFields: FieldProps<FormValues>[]
  control: Control<FormValues>
  languageOptions: { label: string; value: string }[]
}

type LanguageLabelsProps = Omit<VendorPriceListStepProps, 'skillsFormFields'>

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
    useWatch({ control }).source_language
  )

  const destinationLanguageLabels = findLabelByValue(
    useWatch({ control }).destination_language
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

const VendorPriceListSecondStep: FC<VendorPriceListStepProps> = ({
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

const VendorPriceListThirdStep: FC<VendorPriceListStepProps> = ({
  control,
  languageOptions,
}) => {
  const selectedSkills = useWatch({ control }).skills

  return (
    <>
      <LanguageLabels control={control} languageOptions={languageOptions} />
      <Root>
        <AddPricesTable selectedSkills={selectedSkills} />
      </Root>
    </>
  )
}

const VendorPriceListForm: FC = () => {
  const { t } = useTranslation()

  const { data: skillsData } = useFetchSkills()
  const { data: vendorPricesData } = useFetchVendorPrices()
  const { classifierValues } = useClassifierValuesFetch()

  const languageData = filter(classifierValues, { type: 'LANGUAGE' })

  const pricesData = [
    {
      id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      vendor_id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      skill_id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      src_lang_classifier_value_id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      dst_lang_classifier_Value_id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      updated_at: '2023-08-09T07:48:41.163Z',
      created_at: '2023-08-09T07:48:41.163Z',
      character_fee: 0,
      word_fee: 0,
      page_fee: 0,
      minute_fee: 0,
      hour_fee: 0,
      minimal_fee: 0,
      vendor: 'string',
      source_language_classifier_value: {
        id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        type: 'string',
        value: 'string',
        name: 'ee-ET',
      },
      destination_language_classifier_value: {
        id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        type: 'string',
        value: 'string',
        name: 'en-GB',
      },
      skill: {
        id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        name: 'Tõlkimine + toimetamine',
      },
    },
    {
      id: '3fa85f64-5717-4562-b3fc-2c963f66afa1',
      vendor_id: '3fa85f64-5717-4562-b3fc-2c963f66afa1',
      skill_id: '3fa85f64-5717-4562-b3fc-2c963f66afa1',
      src_lang_classifier_value_id: '3fa85f64-5717-4562-b3fc-2c963f66afa1',
      dst_lang_classifier_Value_id: '3fa85f64-5717-4562-b3fc-2c963f66afa1',
      updated_at: '2023-08-09T07:48:41.163Z',
      created_at: '2023-08-09T07:48:41.163Z',
      character_fee: 0,
      word_fee: 0,
      page_fee: 0,
      minute_fee: 0,
      hour_fee: 0,
      minimal_fee: 0,
      vendor: 'string',
      source_language_classifier_value: {
        id: '3fa85f64-5717-4562-b3fc-2c963f66afa1',
        type: 'string',
        value: 'string',
        name: 'ee-ET',
      },
      destination_language_classifier_value: {
        id: '3fa85f64-5717-4562-b3fc-2c963f66afa1',
        type: 'string',
        value: 'string',
        name: 'ru-RU',
      },
      skill: {
        id: '3fa85f64-5717-4562-b3fc-2c963f66afa1',
        name: 'Terminoloogia töö',
      },
    },
  ]

  const pricesValues = useMemo(() => {
    return (
      map(pricesData, (data) => {
        return {
          id: data.id,
          character_fee: data.character_fee,
          word_fee: data.word_fee,
          page_fee: data.page_fee,
          minute_fee: data.minimal_fee,
          hour_fee: data.hour_fee,
          minimal_fee: data.minimal_fee,
          skill: data.skill.name,
          language_direction: `${data.source_language_classifier_value.name} > ${data.destination_language_classifier_value.name}`,
        }
      }) || {}
    )
  }, [])

  // const defaultValues = {
  //   source_language: '',
  //   destination_language: [],
  //   skills: {},
  // }

  const { control, handleSubmit, watch, setValue } = useForm<FormValues>({
    reValidateMode: 'onChange',
    // defaultValues: defaultValues,
  })

  const languageOptions = map(languageData, ({ id, name }) => {
    return {
      label: name,
      value: id,
    }
  })

  const languagePairFormFields: FieldProps<FormValues>[] = [
    {
      inputType: InputTypes.Selections,
      name: 'source_language',
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
      name: 'destination_language',
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
    ({ id, name }) => ({
      key: id,
      inputType: InputTypes.Checkbox,
      ariaLabel: name || '',
      label: name,
      name: `skills.${name}`,
      // rules: {
      //   required: true,
      // },
      className: classes.skillsField,
    })
  )

  const columnHelper = createColumnHelper<Prices>()

  const columns = [
    columnHelper.accessor('language_direction', {
      header: () => t('vendors.language_direction'),
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('skill', {
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
              skillsFormFields={skillsFormFields}
              control={control}
              languageOptions={languageOptions}
            />
          ),
        },
      ],
    })
  }

  return (
    <>
      <Root>
        <DataTable
          data={pricesValues}
          columns={columns}
          tableSize={TableSizeTypes.M}
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
