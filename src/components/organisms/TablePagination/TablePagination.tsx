import React, { FC, useId } from 'react'
import { Link } from 'react-router-dom'
import classes from './styles.module.scss'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import { Table, PaginationState } from '@tanstack/react-table'

import { ReactComponent as Arrow } from 'assets/icons/arrow_pagination.svg'

import Button, {
  AppearanceTypes,
  SizeTypes,
  IconPositioningTypes,
} from 'components/molecules/Button/Button'

type PaginationProps = {
  hidden?: boolean
  table: Table<PaginationState>
}

const TablePagination: FC<PaginationProps> = ({ hidden, table }) => {
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

  return (
    <div className={classes.paginationWrapper}>
      {/* {table.getPageCount() * table.getState().pagination.pageSize >
        table.getState().pagination.pageSize && ( */}
      <div className={classes.pagination}>
        <Button
          appearance={AppearanceTypes.Text}
          size={SizeTypes.S}
          icon={Arrow}
          ariaLabel={t('label.button_arrow')}
          iconPositioning={IconPositioningTypes.Left}
          onClick={() => previousPage()}
          disabled={!getCanPreviousPage()}
        />

        <nav
          role="navigation"
          aria-label={t('label.pagination_navigation') || ''}
        >
          <ul className={classes.links}>
            {[...Array(getPageCount())].map((_, index) => (
              <li
                key={`${id}-${index}`}
                className={classNames({
                  [classes.active]: getState().pagination.pageIndex === index,
                })}
              >
                <Link
                  className={classes.pageNumber}
                  to={`?page=${index + 1}`}
                  onClick={() => setPageIndex(index)}
                  aria-label={t('label.go_to_page') + index}
                  aria-current={getState().pagination.pageIndex === index}
                >
                  {index + 1}
                </Link>
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
          onClick={() => {
            nextPage()
          }}
          disabled={!getCanNextPage()}
          className={classes.arrow}
        />
      </div>
      {/* )} */}
      <div className={classes.pageSizeWrapper}>
        <label htmlFor={id} className={classes.pageSizeLabel}>
          {t('label.pagination_result_count')}
        </label>
        <select
          className={classes.pageSizeSelect}
          id={id}
          value={getState().pagination.pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value))
          }}
        >
          {[1, 2, 3, 14, 50].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              {pageSize}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
export default TablePagination
