import { range, slice, toString } from 'lodash'
import classes from './classes.module.scss'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import { Table, PaginationState } from '@tanstack/react-table'
import { ReactComponent as Arrow } from 'assets/icons/arrow_pagination.svg'
import { ReactComponent as SelectArrow } from 'assets/icons/select_arrow.svg'
import SelectionControlsInput, {
  DropdownSizeTypes,
} from 'components/organisms/SelectionControlsInput/SelectionControlsInput'
import Button, {
  AppearanceTypes,
  SizeTypes,
  IconPositioningTypes,
} from 'components/molecules/Button/Button'
import { useSearchParams } from 'react-router-dom'

type PaginationProps<TData> = {
  hidden?: boolean
  hidePaginationSelectionInput?: boolean
  table: Table<PaginationState> | Table<TData>
  pageSizeOptions?: { label: string; value: string }[]
}

const TablePagination = <TData,>({
  hidden,
  table,
  pageSizeOptions,
  hidePaginationSelectionInput = false,
}: PaginationProps<TData>) => {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const {
    previousPage,
    getCanPreviousPage,
    getPageCount,
    setPageIndex,
    getState,
    nextPage,
    getCanNextPage,
    setPageSize,
  } = table || {}

  const defaultPageSizeOptions = [
    { label: '10', value: '10' },
    { label: '15', value: '15' },
    { label: '50', value: '50' },
  ]

  const amountOfPages = getPageCount()
  const pagesArray = range(0, amountOfPages)
  const pageNumber = getState().pagination.pageIndex

  const startPage =
    pageNumber < 3 //first three pages
      ? 0
      : pageNumber > amountOfPages - 3 // last three pages
      ? Math.max(0, amountOfPages - 5)
      : pageNumber - 2

  const endPage =
    pageNumber < 3
      ? 5
      : pageNumber > amountOfPages - 3
      ? amountOfPages
      : pageNumber + 3

  if (hidden) return null

  return (
    <div className={classes.paginationWrapper}>
      <div className={classes.pagination}>
        <Button
          appearance={AppearanceTypes.Text}
          size={SizeTypes.S}
          icon={Arrow}
          ariaLabel={t('button.previous_page')}
          iconPositioning={IconPositioningTypes.Left}
          onClick={() => {
            previousPage()
            setSearchParams((prevParams) => {
              prevParams.set('page', `${getState().pagination.pageIndex}`)
              return searchParams
            })
          }}
          disabled={!getCanPreviousPage()}
          className={classes.arrows}
          hidden={!amountOfPages}
        />

        <nav role="navigation" aria-label={t('label.pagination_navigation')}>
          <ul className={classes.links}>
            {slice(pagesArray, startPage, endPage).map((index) => (
              <li
                key={index}
                className={classNames(classes.list, {
                  [classes.active]: getState().pagination.pageIndex === index,
                })}
              >
                <Button
                  className={classes.pageNumber}
                  onClick={() => {
                    setPageIndex(index)
                    setSearchParams((prevParams) => {
                      prevParams.set('page', `${index + 1}`)
                      return searchParams
                    })
                  }}
                  ariaLabel={t('label.go_to_page') + index}
                  aria-current={getState().pagination.pageIndex === index}
                >
                  {index + 1}
                </Button>
              </li>
            ))}
          </ul>
        </nav>
        <Button
          appearance={AppearanceTypes.Text}
          size={SizeTypes.S}
          icon={Arrow}
          ariaLabel={t('button.next_page')}
          iconPositioning={IconPositioningTypes.Left}
          onClick={() => {
            nextPage()
            setSearchParams((prevParams) => {
              prevParams.set('page', `${getState().pagination.pageIndex + 2}`)
              return searchParams
            })
          }}
          disabled={!getCanNextPage()}
          className={classNames(classes.arrows, classes.toRight)}
          hidden={!amountOfPages}
        />
      </div>
      <SelectionControlsInput
        hidden={hidePaginationSelectionInput}
        className={classes.pageSizeWrapper}
        name={t('label.pagination_result_count')}
        ariaLabel={t('label.pagination_result_count')}
        label={t('label.pagination_result_count')}
        options={pageSizeOptions || defaultPageSizeOptions}
        value={toString(getState().pagination.pageSize)}
        rules={{ required: true }}
        onChange={(value) => {
          setPageSize(Number(value))
          setSearchParams((prevParams) => {
            prevParams.set('per_page', `${Number(value)}`)
            return searchParams
          })
        }}
        hideTags
        placeholder={toString(getState().pagination.pageSize)}
        dropdownSize={DropdownSizeTypes.XS}
        selectIcon={SelectArrow}
      />
    </div>
  )
}
export default TablePagination
