import { FC, useCallback, useMemo, useState } from 'react'
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
import { Vendor } from 'types/vendors'
import { TagTypes } from 'types/tags'
import { useLanguageDirections } from 'hooks/requests/useLanguageDirections'
import { useSearchParams } from 'react-router-dom'
import TextInput from 'components/molecules/TextInput/TextInput'
import Loader from 'components/atoms/Loader/Loader'
import { Root } from '@radix-ui/react-form'
import { useVendorsFetch } from 'hooks/requests/useVendors'
import classNames from 'classnames'

type VendorsTableProps = {
  data?: Vendor[]
  hidden?: boolean
}

const VendorsTable: FC<VendorsTableProps> = ({ hidden }) => {
  const { t } = useTranslation()

  const [searchParams, _] = useSearchParams()
  const initialFilters = {
    ...Object.fromEntries(searchParams.entries()),
    role_id: searchParams.getAll('role_id'),
    tag_id: searchParams.getAll('tag_id'),
  }

  const {
    vendors,
    paginationData,
    isLoading,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
  } = useVendorsFetch(initialFilters, true)

  const { rolesFilters = [] } = useRolesFetch()
  const { tagsFilters = [] } = useFetchTags({ type: TagTypes.Vendor })
  const { languageDirectionFilters, loadMore, handleSearch } =
    useLanguageDirections({})

  const [searchValue, setSearchValue] = useState<string>(
    searchParams.get('fullname') || ''
  )

  const handleSearchVendors = useCallback(
    (event: { target: { value: string } }) => {
      setSearchValue(event.target.value)
      debounce(handleFilterChange, 300)({ fullname: event.target.value })
    },
    [handleFilterChange]
  )

  const defaultPaginationData = {
    per_page: Number(searchParams.get('per_page')),
    page: Number(searchParams.get('page')) - 1,
  }

  type ProjectTableRow = {
    id?: string
    languageDirections: string[]
    tags: string[]
    name: string
    companyName: string
    roles: string[]
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
          <div className={classes.tagsRow}>
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
      },
    }),
    columnHelper.accessor('roles', {
      header: () => t('label.role'),
      cell: ({ renderValue }) => join(renderValue(), ', '),
      footer: (info) => info.column.id,
      meta: {
        filterOption: { role_id: rolesFilters },
        showSearch: true,
        filterValue: initialFilters?.role_id,
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
        filterValue: initialFilters?.tag_id,
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
