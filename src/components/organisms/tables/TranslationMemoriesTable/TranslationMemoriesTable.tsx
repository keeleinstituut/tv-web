import { FC, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import DataTable, {
  TableSizeTypes,
} from 'components/organisms/DataTable/DataTable'
import { map, find, debounce } from 'lodash'
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
import { useForm } from 'react-hook-form'
import {
  FormInput,
  InputTypes,
} from 'components/organisms/DynamicForm/DynamicForm'
import Tag from 'components/atoms/Tag/Tag'
import useAuth from 'hooks/useAuth'
import { useFetchTags } from 'hooks/requests/useTags'
import { TagTypes } from 'types/tags'
import { TMType } from 'types/translationMemories'
import { useClassifierValuesFetch } from 'hooks/requests/useClassifierValues'
import { ClassifierValueType } from 'types/classifierValues'
import { useFetchTranslationMemories } from 'hooks/requests/useTranslationMemories'
import TextInput from 'components/molecules/TextInput/TextInput'
import { useLanguageDirections } from 'hooks/requests/useLanguageDirections'

type TranslationMemoriesTableRow = {
  name: string
  id: string
  type?: string
  tv_tags?: string[]
  tv_domain?: string
  lang_pair?: string
}

const columnHelper = createColumnHelper<TranslationMemoriesTableRow>()
interface FormValues {
  [types: string]: TMType[]
}

const TranslationMemoriesTable: FC = () => {
  const { t } = useTranslation()
  const { userPrivileges } = useAuth()
  const { translationMemories = [], handleFilterChange } =
    useFetchTranslationMemories()
  const [searchValue, setSearchValue] = useState<string>('')
  const { tagsFilters: tagsOptions } = useFetchTags({
    type: TagTypes.TranslationMemories,
  })

  const { classifierValuesFilters: domainOptions } = useClassifierValuesFetch({
    type: ClassifierValueType.TranslationDomain,
  })

  const { languageDirectionFilters, loadMore, handleSearch } =
    useLanguageDirections({
      per_page: 40,
      isLangPair: true,
    })

  const statusFilters = map(TMType, (status) => ({
    label: t(`translation_memories.status.${status}`),
    value: status,
  }))

  const { control, watch } = useForm<FormValues>({
    mode: 'onChange',
    resetOptions: {
      keepErrors: true,
    },
  })
  const handleSearchByName = useCallback(
    (event: { target: { value: string } }) => {
      setSearchValue(event.target.value)
      debounce(handleFilterChange, 300)({ fullname: event.target.value })
    },
    [handleFilterChange]
  )

  const [types] = watch(['types'])
  useEffect(() => {
    handleFilterChange({ type: types })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [types])

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
            href={`/memories/${row.original.id}`}
          >
            {getValue()}
          </Button>
        )
      },
      footer: (info) => info.column.id,
      size: 240,
    }),
    columnHelper.accessor('type', {
      header: () => '',
      footer: (info) => info.column.id,
      cell: ({ getValue }) => {
        const type = getValue() || 'INTERNAL'
        return <span className={classNames(classes.dot, classes[type])} />
      },
      size: 20,
    }),
    columnHelper.accessor('tv_tags', {
      header: () => t('label.tags'),
      footer: (info) => info.column.id,
      cell: ({ getValue }) => {
        return (
          <div className={classes.tagsRow}>
            {map(getValue(), (value) => {
              const tagName = find(tagsOptions, { value })?.label || ''
              return !!tagName && <Tag label={tagName} value key={value} />
            })}
          </div>
        )
      },
      size: 520,
      meta: {
        filterOption: { tv_tags: tagsOptions },
        showSearch: true,
      },
    }),
    columnHelper.accessor('tv_domain', {
      header: () => t('label.translation_domain'),
      footer: (info) => info.column.id,

      cell: ({ getValue }) => {
        const domainName = find(domainOptions, { value: getValue() })?.label
        return <span>{domainName}</span>
      },
      size: 375,
      meta: {
        filterOption: { tv_domain: domainOptions },
        showSearch: false,
      },
    }),
    columnHelper.accessor('lang_pair', {
      header: () => t('label.language_directions'),
      footer: (info) => info.column.id,
      cell: ({ getValue }) => {
        const value = getValue() || ''
        return (
          <div className={classes.tagsRow}>
            <Tag label={value} value />
          </div>
        )
      },
      size: 100,
      meta: {
        filterOption: { lang_pair: languageDirectionFilters },
        onEndReached: loadMore,
        onSearch: handleSearch,
        showSearch: true,
      },
    }),
  ] as ColumnDef<TranslationMemoriesTableRow>[]

  return (
    <Root>
      <div className={classes.legend}>
        {map(TMType, (status) => {
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
        data={translationMemories}
        columns={columns}
        tableSize={TableSizeTypes.M}
        // paginationData={paginationData}
        // onPaginationChange={handlePaginationChange}
        onFiltersChange={handleFilterChange}
        headComponent={
          <div className={classes.topSection}>
            <FormInput
              name="types"
              control={control}
              options={statusFilters}
              inputType={InputTypes.TagsSelect}
            />
            <TextInput
              name="name"
              ariaLabel={t('label.search')}
              placeholder={t('placeholder.search_by_tm_name')}
              value={searchValue}
              onChange={handleSearchByName}
              className={classes.searchInput}
              inputContainerClassName={classes.searchInnerContainer}
              isSearch
            />
          </div>
        }
      />
    </Root>
  )
}

export default TranslationMemoriesTable
