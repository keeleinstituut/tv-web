import { toString } from 'lodash'
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
import { useNavigate } from 'react-router-dom'

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
  const navigate = useNavigate()
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
    { label: '50', value: '50' },
    { label: '100', value: '100' },
  ]

  const amountOfPages = getPageCount()

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
            navigate({
              search: `?page=${getState().pagination.pageIndex}`,
            })
          }}
          disabled={!getCanPreviousPage()}
          className={classes.arrows}
          hidden={!amountOfPages}
        />

        <nav role="navigation" aria-label={t('label.pagination_navigation')}>
          <ul className={classes.links}>
            {[...Array(getPageCount())].map((_, index) => (
              <li
                key={index}
                className={classNames(classes.list, {
                  [classes.active]: getState().pagination.pageIndex === index,
                })}
              >
                <Button
                  className={classes.pageNumber}
                  href={`?page=${index + 1}`}
                  onClick={() => setPageIndex(index)}
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
            navigate({
              search: `?page=${getState().pagination.pageIndex + 2}`,
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
        onChange={(value) => {
          setPageSize(Number(value))
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
