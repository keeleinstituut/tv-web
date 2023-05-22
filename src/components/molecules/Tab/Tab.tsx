import { FC, useCallback, useState } from 'react'
import classNames from 'classnames'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import { ReactComponent as EditIcon } from 'assets/icons/edit.svg'
import classes from './styles.module.scss'

export interface TabType {
  name?: string
  id?: string
  isActive?: boolean
  onClick: (id?: string) => void
}

const Tab: FC<TabType> = ({ name, isActive, onClick, id }) => {
  // TODO: add outside click handler here to reset edit mode
  const [isEditMode, setIsEditMode] = useState(false)
  const isEditModeActive = isActive && isEditMode
  const toggleEditMode = useCallback(() => {
    setIsEditMode(!isEditMode)
  }, [isEditMode])
  const handleClick = useCallback(() => {
    onClick(id)
  }, [id, onClick])
  return (
    <Button
      appearance={AppearanceTypes.Text}
      children={isEditModeActive ? <input defaultValue={name} /> : name}
      icon={isEditModeActive ? undefined : EditIcon}
      className={classNames(
        classes.tab,
        isActive && classes.active,
        isEditModeActive && classes.editMode
      )}
      onClick={isActive ? toggleEditMode : handleClick}
    />
  )
}

export default Tab
