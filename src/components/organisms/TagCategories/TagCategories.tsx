import { groupBy, map } from 'lodash'
import { FC } from 'react'
import { TagType } from 'types/tags'
import TagCategory from '../TagCategory/TagCategory'

import classes from './classes.module.scss'

type TagCategoriesTypes = {
  tags?: TagType[]
}

export type EditTagType = {
  id?: string
  name?: string
}

export type FormValues = {
  tags: EditTagType[]
}

const TagCategories: FC<TagCategoriesTypes> = ({ tags }) => {
  const groupedCategoryData = groupBy(tags, 'type')
  const uniqueCategoryTypes = Object.keys(groupedCategoryData)

  return (
    <div className={classes.categoryContainer}>
      {map(uniqueCategoryTypes, (type) => {
        return (
          <TagCategory
            key={type}
            category={type}
            categoryData={groupedCategoryData[type]}
          />
        )
      })}
    </div>
  )
}

export default TagCategories
