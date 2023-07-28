import Container from 'components/atoms/Container/Container'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import { map } from 'lodash'
import { FC, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { ReactComponent as EditIcon } from 'assets/icons/edit.svg'
import { ModalTypes, showModal } from '../modals/ModalRoot'
import { EditTagType } from '../TagCategories/TagCategories'

import classes from './classes.module.scss'

type TagCategoryTypes = {
  category?: string
  categoryData?: EditTagType[]
}

const TagCategory: FC<TagCategoryTypes> = ({ category, categoryData }) => {
  const { t } = useTranslation()

  const handleCategoryEdit = () => {
    showModal(ModalTypes.TagEditModal, {
      categoryData: categoryData,
      category: category,
    })
  }

  return (
    <Container className={classes.category}>
      <span className={classes.tagCategoryNameContainer}>
        <div className={classes.categoryName}>{category}</div>
        <Button
          appearance={AppearanceTypes.Text}
          icon={EditIcon}
          className={classes.editIcon}
          onClick={handleCategoryEdit}
          // hidden={!includes(userPrivileges, Privileges.EditTag)}
        >
          <span className={classes.tagName}>{t('button.change')}</span>
        </Button>
      </span>

      <div className={classes.tagCategorySeparator} />
      <ul>
        {map(categoryData, (tag) => (
          <li key={tag?.id} className={classes.tagName}>
            {tag?.name}
          </li>
        ))}
      </ul>
    </Container>
  )
}

export default TagCategory
