import Container from 'components/atoms/Container/Container'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import { filter, flatMap, groupBy, includes, map } from 'lodash'
import { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ReactComponent as EditIcon } from 'assets/icons/edit.svg'
import { ModalTypes, showModal } from '../modals/ModalRoot'
import { ModalSizeTypes } from '../ModalBase/ModalBase'
import DynamicForm, { FieldProps, InputTypes } from '../DynamicForm/DynamicForm'
import { TagType } from 'types/tags'
import { useForm } from 'react-hook-form'
import { Privileges } from 'types/privileges'
import useAuth from 'hooks/useAuth'

import classes from './classes.module.scss'

type TagCategoryTypes = {
  tags?: TagType[]
  //   control: Control<FormValues>
}

// export type FormValues = {
//   type?: number
//   tags?: [
//     {
//       id?: string
//       name?: string
//     }
//   ]
// }

type EditTagType = {
  id?: string
  name?: string
}

// export type FormValues = {
//   tags?: EditTagType[]
// }

type FormValues = {
  tags: {
    [key: string]: EditTagType[]
  }
}

const TagCategory: FC<TagCategoryTypes> = ({
  tags,
  //  control
}) => {
  const { t } = useTranslation()
  const { userPrivileges } = useAuth()

  const groupedCategoryData = groupBy(tags, 'type')
  const uniqueCategoryTypes = Object.keys(groupedCategoryData)

  const defaultValues = map(uniqueCategoryTypes, (type) => {
    return {
      type: type,
      tags: map(groupedCategoryData[type], ({ id, name }) => ({ id, name })),
    }
  })

  console.log('defaultValues', defaultValues)

  const defaultValues2 = map(uniqueCategoryTypes, (type) => {
    return {
      type: type,
      tags: map(groupedCategoryData[type], ({ id, name }) => ({ id, name })),
    }
  })

  // const defaultValues4 = map(uniqueCategoryTypes, (type) => {
  //   return {
  //     tags: map(groupedCategoryData[type], ({ id, name }) => ({ id, name })),
  //   }
  // })

  const defaultValues3 = {
    type: undefined,
    tags: [],
  }

  // const defaultValues4 = useMemo(
  //   () =>
  //     map(uniqueCategoryTypes, (type) => {
  //       return {
  //         type: type,
  //         tags: map(groupedCategoryData[type], ({ id, name }) => ({
  //           id,
  //           name,
  //         })),
  //       }
  //     }),
  //   [groupedCategoryData, uniqueCategoryTypes]
  // )

  // const defaultValues8 = useMemo(() => {
  //   return {
  //     tags: tags2.map(({ id, name }) => ({
  //       id: id,
  //       name: name,
  //     })),
  //   }
  // }, [tags2])

  const {
    control,
    handleSubmit,
    formState: { dirtyFields },
  } = useForm<FormValues>({
    reValidateMode: 'onSubmit',
    // values: defaultValues8,
  })

  // const editTagFields: FieldProps<FormValues>[] = flatMap(
  //   defaultValues,
  //   (tag) =>
  //     map(tag.tags, ({ id, name }) => ({
  //       inputType: InputTypes.Text,
  //       ariaLabel: name,
  //       label: tag.type,
  //       name: `tagInput.${id}`,
  //     }))
  // )

  // const editTagFields: FieldProps<FormValues>[] = flatMap(
  //   defaultValues,
  //   (tag) =>
  //     map(tag.tags, ({ id, name }) => ({
  //       inputType: InputTypes.Text,
  //       ariaLabel: name,
  //       label: tag.type,
  //       name: 'tags',
  //     }))
  // )

  // const handleCategoryEdit = (type: string) => {
  //   const filteredArrayByType = filter(editTagFields, { label: type })

  //   console.log('type editmodal', type)
  //   console.log('editTagFields modal', editTagFields)
  //   showModal(ModalTypes.UserAndRoleManagement, {
  //     title: t('modal.edit_category_tag'),
  //     size: ModalSizeTypes.Narrow,
  //     cancelButtonContent: t('button.cancel'),
  //     proceedButtonContent: t('button.save'),
  //     dynamicForm: (
  //       <DynamicForm fields={filteredArrayByType} control={control} />
  //     ),
  //   })
  // }

  console.log('groupedCategoryData', groupedCategoryData)
  console.log('uniqueCategoryTypes', uniqueCategoryTypes)

  return (
    <div className={classes.categoryContainer}>
      {map(uniqueCategoryTypes, (type) => {
        console.log('type inside', type)
        return (
          <Container key={type} className={classes.category}>
            <span className={classes.tagCategoryNameContainer}>
              <div className={classes.categoryName}>{type}</div>
              <Button
                appearance={AppearanceTypes.Text}
                icon={EditIcon}
                className={classes.editIcon}
                // onClick={() => handleCategoryEdit(type)}
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
        )
      })}
    </div>
  )
}

export default TagCategory
