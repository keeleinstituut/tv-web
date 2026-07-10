import { useEffect } from 'react'
import { Row } from '@tanstack/react-table'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import classes from './classes.module.scss'

type LanguageDirectionCellProps<T extends { language_direction?: string }> = {
  row: Row<T>
}

const LanguageDirectionCell = <T extends { language_direction?: string }>({
  row,
}: LanguageDirectionCellProps<T>) => {
  const canExpand = row?.getCanExpand() ?? false
  const languageDirection = row?.original?.language_direction

  useEffect(() => {
    if (canExpand) {
      row.toggleExpanded(true)
    }
  }, [canExpand, row])

  return (
    <>
      {canExpand && (
        <Button
          onClick={() => row.toggleExpanded()}
          appearance={AppearanceTypes.Text}
          hidden
        />
      )}
      <p className={languageDirection && classes.languageTag}>
        {languageDirection}
      </p>
    </>
  )
}

export default LanguageDirectionCell
