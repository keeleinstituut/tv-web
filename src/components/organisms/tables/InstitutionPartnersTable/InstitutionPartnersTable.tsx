import { FC, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { compact, debounce, isEmpty, map } from 'lodash'
import classNames from 'classnames'
import { ColumnDef, createColumnHelper } from '@tanstack/react-table'
import DataTable, {
  TableSizeTypes,
} from 'components/organisms/DataTable/DataTable'
import Button, {
  AppearanceTypes,
  IconPositioningTypes,
  SizeTypes,
} from 'components/molecules/Button/Button'
import TextInput from 'components/molecules/TextInput/TextInput'
import { useFetchInstitutionPartners } from 'hooks/requests/useInstitutionPartners'
import Loader from 'components/atoms/Loader/Loader'
import { Root } from '@radix-ui/react-form'
import ArrowRight from 'assets/icons/arrow_right.svg?react'
import classes from './classes.module.scss'

type PartnerRow = {
  id: string
  name?: string | null
  short_name?: string | null
  email?: string | null
  phone?: string | null
}

const columnHelper = createColumnHelper<PartnerRow>()

const InstitutionPartnersTable: FC = () => {
  const { t } = useTranslation()
  const { partners, paginationData, isLoading, handlePaginationChange, handleFilterChange } =
    useFetchInstitutionPartners({ per_page: 10, page: 1 }, true)

  const [searchValue, setSearchValue] = useState('')

  const debouncedChangeHandler = useCallback(
    debounce(handleFilterChange, 300, { leading: false, trailing: true }),
    [handleFilterChange]
  )

  const handleSearch = useCallback(
    (event: { target: { value: string } }) => {
      setSearchValue(event.target.value)
      debouncedChangeHandler({ q: event.target.value })
    },
    [debouncedChangeHandler]
  )

  const tableData = useMemo(
    () =>
      compact(
        map(partners, (p) =>
          p.partner_institution
            ? {
                id: p.id,
                name: p.partner_institution.name,
                short_name: p.partner_institution.short_name,
                email: p.partner_institution.email,
                phone: p.partner_institution.phone,
              }
            : null
        )
      ),
    [partners]
  )

  const columns = useMemo(
    () =>
      [
        columnHelper.accessor('name', {
          header: () => t('label.institution'),
          cell: ({ getValue }) => <span>{getValue()}</span>,
        }),
        columnHelper.accessor('short_name', {
          header: () => t('label.institution_short'),
          cell: ({ getValue }) => <span>{getValue()}</span>,
        }),
        columnHelper.accessor('email', {
          header: () => t('label.email_long'),
          cell: ({ getValue }) => <span>{getValue()}</span>,
        }),
        columnHelper.accessor('phone', {
          header: () => t('label.phone'),
          cell: ({ getValue }) => <span>{getValue()}</span>,
        }),
        columnHelper.accessor('id', {
          header: () => null,
          cell: ({ getValue }) => (
            <Button
              appearance={AppearanceTypes.Text}
              size={SizeTypes.M}
              href={`/institution-partners/${getValue()}`}
              icon={ArrowRight}
              iconPositioning={IconPositioningTypes.Left}
            >
              {t('button.view')}
            </Button>
          ),
          size: 80,
        }),
      ] as ColumnDef<PartnerRow>[],
    [t]
  )

  return (
    <Root onSubmit={(e) => e.preventDefault()}>
      <Loader loading={isLoading && isEmpty(partners)} />
      <DataTable
        data={tableData}
        columns={columns}
        tableSize={TableSizeTypes.M}
        paginationData={paginationData}
        onPaginationChange={handlePaginationChange}
        headComponent={
          <div className={classNames(classes.topSection)}>
            <TextInput
              name={'search'}
              ariaLabel={t('placeholder.search_by_name')}
              placeholder={t('placeholder.search_by_name')}
              value={searchValue}
              onChange={handleSearch}
              className={classes.searchInput}
              isSearch
            />
          </div>
        }
      />
    </Root>
  )
}

export default InstitutionPartnersTable
