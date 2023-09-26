import { FC, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import DataTable, {
  TableSizeTypes,
} from 'components/organisms/DataTable/DataTable'
import { map, uniq, includes, find } from 'lodash'
import { createColumnHelper, ColumnDef } from '@tanstack/react-table'
import Button, {
  AppearanceTypes,
  SizeTypes,
  IconPositioningTypes,
} from 'components/molecules/Button/Button'
import classNames from 'classnames'
import { ReactComponent as ArrowRight } from 'assets/icons/arrow_right.svg'
import classes from './classes.module.scss'
import { Root } from '@radix-ui/react-form'
import { SubmitHandler, useForm } from 'react-hook-form'
import {
  FormInput,
  InputTypes,
} from 'components/organisms/DynamicForm/DynamicForm'
import { useFetchOrders } from 'hooks/requests/useOrders'
import Tag from 'components/atoms/Tag/Tag'
import { Privileges } from 'types/privileges'
import useAuth from 'hooks/useAuth'
import { useFetchTags } from 'hooks/requests/useTags'
import { TagTypes } from 'types/tags'
import { TranslationMemoryStatus } from 'types/translationMemories'
import { useClassifierValuesFetch } from 'hooks/requests/useClassifierValues'
import { ClassifierValueType } from 'types/classifierValues'
import { useFetchTranslationMemories } from 'hooks/requests/useTranslationMemories'

type TranslationMemoriesTableRow = {
  name: string
  id: string
  status: string
  tags: string[]
  translation_domain: string
  language_directions: string[]
}

const columnHelper = createColumnHelper<TranslationMemoriesTableRow>()
interface FormValues {
  status?: TranslationMemoryStatus[]
  own_orders: boolean
}

const TranslationMemoriesTable: FC = () => {
  const { t } = useTranslation()
  const { userPrivileges } = useAuth()
  const { translationMemories } = useFetchTranslationMemories()

  console.log('translationMemories', translationMemories)

  const { tagsFilters: tagsOptions } = useFetchTags({
    type: TagTypes.TranslationMemories,
  })

  const { classifierValuesFilters: domainOptions } = useClassifierValuesFetch({
    type: ClassifierValueType.TranslationDomain,
  })

  const tagsFilters = ['asutusesiseseks kasutuseks', 'turundus']

  const statusFilters = map(TranslationMemoryStatus, (status) => ({
    label: t(`translation_memories.status.${status}`),
    value: status,
  }))

  // TODO: remove default values, once we have actual data
  const tmRows = useMemo(
    () =>
      map(
        translationMemories,
        ({
          // sub_projects,
          // tags ,
          id,
          name,
          type,
        }) => {
          return {
            id,
            name,
            status: type,
            tags: ['asutusesiseseks kasutuseks', 'turundus'],
            translation_domain: 'Piirivalve',
            language_directions: [],
            // uniq(
            //   map(
            //     // sub_projects,
            //     ({
            //       source_language_classifier_value,
            //       destination_language_classifier_value,
            //     }) =>
            //       `${source_language_classifier_value?.value} > ${destination_language_classifier_value?.value}`
            //   )
            // ),
          }
        }
      ),
    [translationMemories]
  )
  console.log(tagsFilters)
  const { control, handleSubmit, watch } = useForm<FormValues>({
    mode: 'onChange',
    resetOptions: {
      keepErrors: true,
    },
  })

  // TODO: use function to pass in filters and sorting to our order fetch hook
  // Not sure yet, what keys these will have and how the params will be passed
  const onSubmit: SubmitHandler<FormValues> = (data) => console.log(data)

  useEffect(() => {
    // Submit form every time it changes
    const subscription = watch(() => handleSubmit(onSubmit)())
    return () => subscription.unsubscribe()
  }, [handleSubmit, watch])

  const columns = [
    columnHelper.accessor('name', {
      header: () => t('translation_memories.memory_title'),
      cell: ({ getValue, row }) => {
        return (
          <Button
            appearance={AppearanceTypes.Text}
            size={SizeTypes.M}
            icon={ArrowRight}
            ariaLabel={t('label.to_order_view')}
            iconPositioning={IconPositioningTypes.Left}
            disabled={
              !includes(userPrivileges, Privileges.ViewInstitutionProjectDetail)
            }
            href={`/memories/${row.original.id}`}
          >
            {getValue()}
          </Button>
        )
      },
      footer: (info) => info.column.id,
      size: 240,
    }),
    columnHelper.accessor('status', {
      header: () => '',
      footer: (info) => info.column.id,
      cell: ({ getValue }) => {
        const status = getValue() || 'INTERNAL'
        return <span className={classNames(classes.dot, classes[status])} />
      },
      size: 20,
    }),
    columnHelper.accessor('tags', {
      header: () => t('label.tags'),
      footer: (info) => info.column.id,
      cell: ({ getValue }) => {
        return (
          <div className={classes.tagsRow}>
            {map(getValue(), (value) => (
              <Tag label={value} value key={value} />
            ))}
          </div>
        )
      },
      size: 520,
      meta: {
        filterOption: { tags: tagsOptions },
        showSearch: true,
      },
    }),
    columnHelper.accessor('translation_domain', {
      header: () => t('label.translation_domain'),
      footer: (info) => info.column.id,
      size: 375,
      meta: {
        filterOption: { tags: domainOptions },
        showSearch: true,
      },
    }),
    columnHelper.accessor('language_directions', {
      header: () => t('label.language_directions'),
      footer: (info) => info.column.id,
      cell: ({ getValue }) => {
        return (
          <div className={classes.tagsRow}>
            {map(getValue(), (value) => (
              <Tag label={value} value key={value} />
            ))}
          </div>
        )
      },
      meta: {
        filterOption: { tags: statusFilters },
        showSearch: true,
      },
    }),
  ] as ColumnDef<TranslationMemoriesTableRow>[]

  return (
    <Root>
      <div className={classes.legend}>
        {map(TranslationMemoryStatus, (status) => {
          return (
            <div key={status}>
              <span className={classNames(classes.dot, classes[status])} />
              <span className={classes.statusName}>
                {t(`translation_memories.status.${status}`)}
              </span>
            </div>
          )
        })}
      </div>
      <DataTable
        data={tmRows}
        columns={columns}
        tableSize={TableSizeTypes.M}
        // paginationData={paginationData}
        // onPaginationChange={handlePaginationChange}
        // onFiltersChange={handleFilterChange}
        headComponent={
          <div className={classes.topSection}>
            <FormInput
              name="status"
              control={control}
              options={statusFilters}
              inputType={InputTypes.TagsSelect}
            />
          </div>
        }
      />
    </Root>
  )
}

export default TranslationMemoriesTable
