import { useId } from 'react'
import { toString } from 'lodash'
import classes from './styles.module.scss'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import { Table, PaginationState } from '@tanstack/react-table'
import { ReactComponent as Arrow } from 'assets/icons/arrow_pagination.svg'
import { ReactComponent as SelectArrow } from 'assets/icons/select_arrow.svg'
import SelectionControlsInput from 'components/organisms/SelectionControlsInput/SelectionControlsInput'
import Button, {
  AppearanceTypes,
  SizeTypes,
  IconPositioningTypes,
} from 'components/molecules/Button/Button'
import { DropdownSizeTypes } from 'components/organisms/SelectionControlsInput/SelectionControlsInput'

type PaginationProps<TData> = {
  hidden?: boolean
  table: Table<PaginationState> | Table<TData>
}

const TablePagination = <TData extends object>({
  hidden,
  table,
}: PaginationProps<TData>) => {
  const { t } = useTranslation()
  const id = useId()
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

  if (hidden) return null
  const pageSizeOptions = [
    { label: '10', value: '10' },
    { label: '20', value: '20' },
    { label: '30', value: '30' },
    { label: '40', value: '40' },
    { label: '50', value: '50' },
  ]
  return (
    <div className={classes.paginationWrapper}>
      <div className={classes.pagination}>
        <Button
          appearance={AppearanceTypes.Text}
          size={SizeTypes.S}
          icon={Arrow}
          ariaLabel={t('label.button_arrow')}
          iconPositioning={IconPositioningTypes.Left}
          onClick={previousPage}
          disabled={!getCanPreviousPage()}
          className={classes.arrows}
        />

        <nav role="navigation" aria-label={t('label.pagination_navigation')}>
          <ul className={classes.links}>
            {[...Array(getPageCount())].map((_, index) => (
              <li
                key={`${id}-${index}`}
                className={classNames(classes.list, {
                  [classes.active]: getState().pagination.pageIndex === index,
                })}
              >
                <Button
                  className={classes.pageNumber}
                  href={`?page=${index + 1}`}
                  onClick={() => setPageIndex(index)}
                  aria-label={t('label.go_to_page') + index}
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
          ariaLabel={t('label.button_arrow')}
          iconPositioning={IconPositioningTypes.Left}
          onClick={nextPage}
          disabled={!getCanNextPage()}
          className={classNames(classes.arrows, classes.toRight)}
        />
      </div>
      <SelectionControlsInput
        className={classes.pageSizeWrapper}
        name={id}
        ariaLabel={t('label.pagination_result_count')}
        label={t('label.pagination_result_count')}
        options={pageSizeOptions}
        value={toString(getState().pagination.pageSize)}
        onChange={(value) => {
          setPageSize(Number(value))
        }}
        placeholder={toString(getState().pagination.pageSize)}
        multiple={false}
        dropdownSize={DropdownSizeTypes.XS}
        selectIcon={SelectArrow}
      />
    </div>
  )
}
export default TablePagination
