import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import DataTable, {
  TableSizeTypes,
} from 'components/organisms/DataTable/DataTable'
import { map, find, debounce, omit } from 'lodash'
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
import { Control, useForm } from 'react-hook-form'
import {
  FormInput,
  InputTypes,
} from 'components/organisms/DynamicForm/DynamicForm'
import Tag from 'components/atoms/Tag/Tag'
import { useFetchTags } from 'hooks/requests/useTags'
import { TagTypes } from 'types/tags'
import { TMType, TranslationMemoryFilters } from 'types/translationMemories'
import { useClassifierValuesFetch } from 'hooks/requests/useClassifierValues'
import { ClassifierValueType } from 'types/classifierValues'
import { useFetchTranslationMemories } from 'hooks/requests/useTranslationMemories'
import TextInput from 'components/molecules/TextInput/TextInput'
import { useLanguageDirections } from 'hooks/requests/useLanguageDirections'
import { useSearchParams } from 'react-router-dom'

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
interface TranslationMemoriesTableTypes {
  isSelectingModal?: boolean
  tmKeyControl?: Control
  initialFilters?: TranslationMemoryFilters
}

const TranslationMemoriesTable: FC<TranslationMemoriesTableTypes> = ({
  isSelectingModal = false,
  tmKeyControl,
  initialFilters,
}) => {
  const { t } = useTranslation()

  const [searchParams, _] = useSearchParams()
  const combinedInitialFilters = {
    ...initialFilters,
    ...omit(Object.fromEntries(searchParams.entries()), ['page', 'per_page']),
    tv_tags: searchParams.getAll('tv_tags'),
    type: searchParams.getAll('type') as TMType[],
    tv_domain: searchParams.getAll('tv_domain'),
    lang_pair: searchParams.getAll('lang_pair'),
  }

  const { translationMemories = [], handleFilterChange } =
    useFetchTranslationMemories(combinedInitialFilters, true)

  const [searchValue, setSearchValue] = useState<string>(
    searchParams.get('name') || ''
  )

  const defaultPaginationData = {
    per_page: Number(searchParams.get('per_page')),
    page: Number(searchParams.get('page')),
  }

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

  const defaultFilterValues = useMemo(
    () => ({
      types: (searchParams.getAll('type') as TMType[]) || [],
    }),
    [searchParams]
  )

  const { control, watch } = useForm<FormValues>({
    mode: 'onChange',
    defaultValues: defaultFilterValues,
    resetOptions: {
      keepErrors: true,
    },
  })

  const handleSearchByName = useCallback(
    (event: { target: { value: string } }) => {
      setSearchValue(event.target.value)

      debounce(handleFilterChange, 300)({ name: event.target.value })
    },
    [handleFilterChange]
  )

  const [types] = watch(['types'])

  useEffect(() => {
    handleFilterChange({ type: types })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [types])

  const columns = useMemo(
    () =>
      [
        ...(isSelectingModal
          ? [
              columnHelper.accessor('id', {
                header: '',
                footer: (info) => info.column.id,
                cell: ({ getValue }) => {
                  return (
                    <FormInput
                      name={`${getValue()}`}
                      ariaLabel={t('label.file_type')}
                      control={tmKeyControl}
                      inputType={InputTypes.Checkbox}
                    />
                  )
                },
              }),
            ]
          : []),
        columnHelper.accessor('name', {
          header: () => t('translation_memories.memory_title'),
          cell: ({ getValue, row }) => {
            return (
              <>
                <Button
                  appearance={AppearanceTypes.Text}
                  size={SizeTypes.M}
                  icon={ArrowRight}
                  ariaLabel={t('label.to_project_view')}
                  iconPositioning={IconPositioningTypes.Left}
                  hidden={isSelectingModal}
                  href={`/memories/${row.original.id}`}
                >
                  {getValue()}
                </Button>
                <span hidden={!isSelectingModal}>{getValue()}</span>
              </>
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
            filterValue: combinedInitialFilters?.tv_tags,
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
            filterValue: combinedInitialFilters?.tv_domain,
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
          meta: !isSelectingModal
            ? {
                filterOption: { lang_pair: languageDirectionFilters },
                onEndReached: loadMore,
                onSearch: handleSearch,
                showSearch: true,
                filterValue: combinedInitialFilters?.lang_pair,
              }
            : {},
        }),
      ] as ColumnDef<TranslationMemoriesTableRow>[],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  return (
    <Root onSubmit={(e) => e.preventDefault()}>
      <div
        className={classNames(classes.legend, {
          [classes.padding]: isSelectingModal,
        })}
      >
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
        className={isSelectingModal ? classes.modalTable : undefined}
        tableSize={TableSizeTypes.M}
        // paginationData={paginationData}
        // onPaginationChange={handlePaginationChange}
        onFiltersChange={handleFilterChange}
        defaultPaginationData={defaultPaginationData}
        headComponent={
          <div
            className={classNames(classes.topSection, {
              [classes.padding]: isSelectingModal,
            })}
          >
            <FormInput
              name="types"
              control={control}
              options={statusFilters}
              inputType={InputTypes.TagsSelect}
              hidden={isSelectingModal}
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
        columnOrder={
          isSelectingModal
            ? ['id', 'lang_pair', 'name', 'tv_tags', 'tv_domains']
            : undefined
        }
      />
    </Root>
  )
}

export default TranslationMemoriesTable
