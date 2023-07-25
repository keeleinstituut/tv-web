import Container from 'components/atoms/Container/Container'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import { groupBy, includes, map } from 'lodash'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { ReactComponent as EditIcon } from 'assets/icons/edit.svg'
import { ModalTypes, showModal } from '../modals/ModalRoot'
import { ModalSizeTypes } from '../ModalBase/ModalBase'
import DynamicForm, { FieldProps, InputTypes } from '../DynamicForm/DynamicForm'
import { TagType } from 'types/tags'
import { FormValues } from 'pages/Tags/Tags'
import { v4 as uuidv4 } from 'uuid'
import { Control } from 'react-hook-form'
import { Privileges } from 'types/privileges'
import useAuth from 'hooks/useAuth'

import classes from './classes.module.scss'

type TagCategoryTypes = {
  tags?: TagType[]
  control: Control<FormValues>
}

const TagCategory: FC<TagCategoryTypes> = ({ tags, control }) => {
  const { t } = useTranslation()
  const { userPrivileges } = useAuth()

  const groupedCategoryData = groupBy(tags, 'type')
  const uniqueCategoryTypes = Object.keys(groupedCategoryData)

  const editTagFields: FieldProps<FormValues>[] = [
    {
      inputType: InputTypes.Text,
      ariaLabel: t('tag.tag_name'),
      name: `tagInput.${uuidv4()}`,
      type: 'text',
    },
  ]

  const handleCategoryEdit = () => {
    showModal(ModalTypes.UserAndRoleManagement, {
      title: t('modal.edit_category_tag'),
      size: ModalSizeTypes.Narrow,
      cancelButtonContent: t('button.cancel'),
      proceedButtonContent: t('button.save'),
      dynamicForm: <DynamicForm fields={editTagFields} control={control} />,
    })
  }

  return (
    <div className={classes.categoryContainer}>
      {map(uniqueCategoryTypes, (type) => (
        <Container key={type} className={classes.category}>
          <span className={classes.tagCategoryNameContainer}>
            <div className={classes.categoryName}>{type}</div>
            <Button
              appearance={AppearanceTypes.Text}
              icon={EditIcon}
              className={classes.editIcon}
              onClick={handleCategoryEdit}
              hidden={!includes(userPrivileges, Privileges.EditTag)}
            >
              <span className={classes.tagName}>{t('button.change')}</span>
            </Button>
          </span>

          <div className={classes.tagCategorySeparator} />
          <ul>
            {map(groupedCategoryData[type], (tag) => (
              <li className={classes.tagName} key={tag?.id}>
                {tag?.name}
              </li>
            ))}
          </ul>
        </Container>
      ))}
    </div>
  )
}

export default TagCategory
