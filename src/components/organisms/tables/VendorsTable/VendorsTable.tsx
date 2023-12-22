import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRolesFetch } from 'hooks/requests/useRoles'
import { useFetchTags } from 'hooks/requests/useTags'
import DataTable, {
  TableSizeTypes,
} from 'components/organisms/DataTable/DataTable'
import Button, {
  AppearanceTypes,
  SizeTypes,
  IconPositioningTypes,
} from 'components/molecules/Button/Button'
import { ReactComponent as ArrowRight } from 'assets/icons/arrow_right.svg'
import { map, join, compact, split, isEmpty, debounce } from 'lodash'
import { ColumnDef, createColumnHelper } from '@tanstack/react-table'
import Tag from 'components/atoms/Tag/Tag'
import { FilterFunctionType } from 'types/collective'
import classes from './classes.module.scss'
import { TagTypes } from 'types/tags'
import { useLanguageDirections } from 'hooks/requests/useLanguageDirections'
import { useSearchParams } from 'react-router-dom'
import TextInput from 'components/molecules/TextInput/TextInput'
import Loader from 'components/atoms/Loader/Loader'
import { Root } from '@radix-ui/react-form'
import { useVendorsFetch } from 'hooks/requests/useVendors'
import classNames from 'classnames'
import { parseLanguagePairs } from 'helpers'

type VendorsTableProps = {
  hidden?: boolean
}

type ProjectTableRow = {
  id?: string
  languageDirections: string[]
  tags: string[]
  name: string
  companyName: string
  roles: string[]
}

const VendorsTable: FC<VendorsTableProps> = ({ hidden }) => {
  const { t } = useTranslation()

  const { rolesFilters = [] } = useRolesFetch({})
  const { tagsFilters = [] } = useFetchTags({ type: TagTypes.Vendor })
  const {
    languageDirectionFilters,
    loadMore,
    handleSearch,
    setSelectedValues,
  } = useLanguageDirections({})

  const [searchParams] = useSearchParams()
  const initialFilters = useMemo(() => {
    const fullname = searchParams.get('fullname')
    return {
      page: Number(searchParams.get('page')) || 1,
      per_page: Number(searchParams.get('per_page')) || 10,
      role_id: searchParams.getAll('role_id'),
      tag_id: searchParams.getAll('tag_id'),
      lang_pair: parseLanguagePairs(searchParams),
      ...(fullname ? { fullname } : {}),
    }
  }, [searchParams])

  const {
    vendors,
    paginationData,
    filters,
    isLoading,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
  } = useVendorsFetch(initialFilters, true)
  useEffect(() => {
    setSelectedValues(filters?.lang_pair || [])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters?.lang_pair])

  const [searchValue, setSearchValue] = useState<string>(
    filters?.fullname || ''
  )

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedChangeHandler = useCallback(
    debounce(handleFilterChange, 300, {
      leading: false,
      trailing: true,
    }),
    [handleFilterChange]
  )

  const handleSearchVendors = useCallback(
    (event: { target: { value: string } }) => {
      setSearchValue(event.target.value)
      debouncedChangeHandler({ fullname: event.target.value })
    },
    [debouncedChangeHandler]
  )

  const defaultPaginationData = {
    per_page: Number(filters.per_page),
    page: Number(filters.page) - 1,
  }

  const columnHelper = createColumnHelper<ProjectTableRow>()

  const vendorsData = useMemo(() => {
    return (
      map(
        vendors,
        ({
          id,
          tags,
          prices,
          institution_user: { roles, user },
          company_name,
        }) => {
          const roleNames = compact(map(roles, 'name'))

          const languageDirections = map(
            prices,
            ({
              source_language_classifier_value: srcLang,
              destination_language_classifier_value: destLang,
            }) => `${srcLang.value} > ${destLang.value}`
          )

          const tagNames = map(tags, 'name')

          return {
            id,
            languageDirections,
            tags: tagNames,
            name: `${user?.forename} ${user?.surname}`,
            companyName: company_name,
            roles: roleNames,
          }
        }
      ) || {}
    )
  }, [vendors])

  const handleModifiedFilterChange = useCallback(
    (filters?: FilterFunctionType) => {
      // language_direction will be an array of strings
      let currentFilters = filters
      if (filters && 'language_direction' in filters) {
        const { language_direction, ...rest } = filters || {}
        const typedLanguageDirection = language_direction as string[]

        const langPair = map(
          typedLanguageDirection,
          (languageDirectionString) => {
            const [src, dst] = split(languageDirectionString, '_')
            return { src, dst }
          }
        )

        currentFilters = {
          lang_pair: langPair,
          ...rest,
        }
      }

      if (handleFilterChange) {
        handleFilterChange(currentFilters)
      }
    },
    [handleFilterChange]
  )

  const columns = [
    columnHelper.accessor('languageDirections', {
      header: () => t('label.language_directions'),
      cell: ({ getValue }) => {
        return (
          <div className={classes.languageRow}>
            {map(getValue(), (value, index) => (
              <Tag label={value} value key={index} />
            ))}
          </div>
        )
      },
      footer: (info) => info.column.id,
      meta: {
        filterOption: { language_direction: languageDirectionFilters },
        onEndReached: loadMore,
        onSearch: handleSearch,
        showSearch: true,
        filterValue: map(
          filters.lang_pair || [],
          ({ src, dst }) => `${src}_${dst}`
        ),
      },
    }),
    columnHelper.accessor('roles', {
      header: () => t('label.role'),
      cell: ({ renderValue }) => join(renderValue(), ', '),
      footer: (info) => info.column.id,
      meta: {
        filterOption: { role_id: rolesFilters },
        showSearch: true,
        filterValue: filters?.role_id || [],
      },
    }),
    columnHelper.accessor('name', {
      header: () => t('label.name'),
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('companyName', {
      header: () => t('label.company_name'),
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('tags', {
      header: () => t('label.vendor_tags'),
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
        filterOption: { tag_id: tagsFilters },
        filterValue: filters?.tag_id || [],
      },
    }),
    columnHelper.accessor('id', {
      header: () => <></>,
      cell: ({ getValue }) => (
        <Button
          appearance={AppearanceTypes.Text}
          size={SizeTypes.M}
          icon={ArrowRight}
          ariaLabel={t('label.to_project_view')}
          iconPositioning={IconPositioningTypes.Left}
          href={`/vendors/${getValue()}`}
        >
          {t('label.view')}
        </Button>
      ),
    }),
  ] as ColumnDef<ProjectTableRow>[]

  if (hidden) return null

  return (
    <Root onSubmit={(e) => e.preventDefault()}>
      <Loader loading={isLoading && isEmpty(vendors)} />
      <DataTable
        data={vendorsData}
        columns={columns}
        tableSize={TableSizeTypes.M}
        paginationData={paginationData}
        onPaginationChange={handlePaginationChange}
        onFiltersChange={handleModifiedFilterChange}
        onSortingChange={handleSortingChange}
        defaultPaginationData={defaultPaginationData}
        headComponent={
          <div className={classNames(classes.topSection)}>
            <TextInput
              name={'search'}
              ariaLabel={t('placeholder.search_by_name')}
              placeholder={t('placeholder.search_by_name')}
              value={searchValue}
              onChange={handleSearchVendors}
              className={classes.searchInput}
              inputContainerClassName={classes.generalVendorsListInput}
              isSearch
            />
          </div>
        }
      />
    </Root>
  )
}

export default VendorsTable
