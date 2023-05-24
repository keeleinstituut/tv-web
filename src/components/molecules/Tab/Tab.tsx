import { FC, useCallback, useState, useEffect } from 'react'
import classNames from 'classnames'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import { ReactComponent as EditIcon } from 'assets/icons/edit.svg'
import { startsWith } from 'lodash'
import classes from './styles.module.scss'
import { useTranslation } from 'react-i18next'

export interface TabType {
  name?: string
  id?: string
  isActive?: boolean
  onClick: (id?: string) => void
  onChangeName: (id: string, newValue: string) => void
}

interface InnerInputProps {
  hidden: boolean
  value: string
  setIsEditMode: (isEditMode: boolean) => void
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onBlur: () => void
}

const InnerInput: FC<InnerInputProps> = ({
  hidden,
  value,
  setIsEditMode,
  onChange,
  onBlur,
}) => {
  const { t } = useTranslation()
  if (hidden) return null
  return (
    <input
      value={value}
      className={classes.innerInput}
      placeholder={t('placeholder.write_new_role_here')}
      aria-label={t('label.role_name_input')}
      onKeyDown={(e) => {
        if (e.code === 'Enter') {
          setIsEditMode(false)
        }
      }}
      onChange={onChange}
      onBlur={onBlur}
      autoFocus
    />
  )
}

const Tab: FC<TabType> = ({ name, isActive, onClick, id, onChangeName }) => {
  const { t } = useTranslation()
  const [tempName, setTempName] = useState(name || '')
  const [isEditMode, setIsEditMode] = useState(false)

  useEffect(() => {
    if (startsWith(id, 'temp') && !name) {
      setIsEditMode(true)
    }
    // This is meant to run only when component mounts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!isEditMode && tempName !== name && id) {
      onChangeName(id, tempName)
    }
    // We only want to run this, when isEditMode changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode])

  useEffect(() => {
    if (name !== tempName) {
      setTempName(name || '')
    }
    // This is for changing internal state, when external state changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name])

  const isEditModeActive = isActive && isEditMode
  const handleEnterEditMode = useCallback(() => {
    if (!isEditMode) {
      setIsEditMode(!isEditMode)
    }
  }, [isEditMode])
  const handleExitEditMode = useCallback(() => {
    if (isEditMode) {
      setIsEditMode(!isEditMode)
    }
  }, [isEditMode])
  const handleClick = useCallback(() => {
    onClick(id)
  }, [id, onClick])
  const handleNameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setTempName(event.target.value)
    },
    []
  )

  return (
    <Button
      appearance={AppearanceTypes.Text}
      onKeyUp={(e) => {
        // disable keyboard spacebar on button, while input is active
        if (e.code === 'Space' && isEditModeActive) {
          e.preventDefault()
        }
      }}
      icon={isEditModeActive ? undefined : EditIcon}
      className={classNames(
        classes.tab,
        isActive && classes.active,
        isEditModeActive && classes.editMode
      )}
      onClick={isActive ? handleEnterEditMode : handleClick}
    >
      <InnerInput
        hidden={!isEditModeActive}
        value={tempName}
        setIsEditMode={setIsEditMode}
        onChange={handleNameChange}
        onBlur={handleExitEditMode}
      />
      <span className={classes.valueContainer}>
        {tempName || t('placeholder.write_new_role_here')}
      </span>
    </Button>
  )
}

export default Tab
