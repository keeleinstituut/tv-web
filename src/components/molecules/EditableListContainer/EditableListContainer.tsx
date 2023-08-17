import Container from 'components/atoms/Container/Container'
import Button, {
  AppearanceTypes,
  SizeTypes,
} from 'components/molecules/Button/Button'
import { map } from 'lodash'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { ReactComponent as EditIcon } from 'assets/icons/edit.svg'

import classes from './classes.module.scss'

export interface ListDataType {
  name: string
  id: string
}

type EditableListTypes = {
  title?: string
  data?: ListDataType[]
  isEditable?: boolean
  handleEditList?: () => void
}

const EditableListContainer: FC<EditableListTypes> = ({
  title,
  data,
  isEditable,
  handleEditList,
}) => {
  const { t } = useTranslation()

  return (
    <Container className={classes.editableContainer}>
      <div className={classes.headerContent}>
        <span className={classes.title}>{title}</span>
        <Button
          appearance={AppearanceTypes.Text}
          size={SizeTypes.S}
          className={classes.editButton}
          icon={EditIcon}
          onClick={handleEditList}
          hidden={!isEditable}
        >
          {t('button.change')}
        </Button>
      </div>

      <ul>
        {map(data, ({ name, id }) => (
          <li key={id} className={classes.listItem}>
            {name}
          </li>
        ))}
      </ul>
    </Container>
  )
}

export default EditableListContainer
