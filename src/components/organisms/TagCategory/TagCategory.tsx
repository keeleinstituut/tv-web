import Container from 'components/atoms/Container/Container'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import { flatMap, groupBy, includes, map } from 'lodash'
import { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ReactComponent as EditIcon } from 'assets/icons/edit.svg'
import { ModalTypes, showModal } from '../modals/ModalRoot'
import { ModalSizeTypes } from '../ModalBase/ModalBase'
import DynamicForm, { FieldProps, InputTypes } from '../DynamicForm/DynamicForm'
import { TagType } from 'types/tags'
import { FormValues } from 'pages/Tags/Tags'
import { useForm } from 'react-hook-form'
import { Privileges } from 'types/privileges'
import useAuth from 'hooks/useAuth'

import classes from './classes.module.scss'

type TagCategoryTypes = {
  tags?: TagType[]
  //   control: Control<FormValues>
}

const TagCategory: FC<TagCategoryTypes> = ({
  tags,
  //  control
}) => {
  const tags2 = [
    {
      id: '99aa96cd-6392-4dca-9f97-7168abc5188f',
      institution_id: null,
      name: 'Infovahetus',
      type: 'Oskused',
      created_at: '2023-07-17T07:38:55.000000Z',
      updated_at: '2023-07-17T07:38:55.000000Z',
    },
    {
      id: '99aa96cd-637b-429e-8ae3-64ec02320f5b',
      institution_id: null,
      name: 'Järeltõlge',
      type: 'Oskused',
      created_at: '2023-07-17T07:38:55.000000Z',
      updated_at: '2023-07-17T07:38:55.000000Z',
    },
    {
      id: '99aa96cd-638e-40d9-9588-8a41c2984c0f',
      institution_id: null,
      name: 'Käsikirjaline tõlge',
      type: 'Oskused',
      created_at: '2023-07-17T07:38:55.000000Z',
      updated_at: '2023-07-17T07:38:55.000000Z',
    },
    {
      id: '99aa96cd-6382-4210-b870-0bdf02f67aab',
      institution_id: null,
      name: 'Salvestise tõlge',
      type: 'Oskused',
      created_at: '2023-07-17T07:38:55.000000Z',
      updated_at: '2023-07-17T07:38:55.000000Z',
    },
    {
      id: '99aa96cd-6375-417e-9b94-5b9b5ce24a76',
      institution_id: null,
      name: 'Sünkroontõlge',
      type: 'Oskused',
      created_at: '2023-07-17T07:38:55.000000Z',
      updated_at: '2023-07-17T07:38:55.000000Z',
    },
    {
      id: '99aa96cd-6239-4fc1-b960-dc0332b58f34',
      institution_id: null,
      name: 'Suuline tõlge',
      type: 'Oskused',
      created_at: '2023-07-17T07:38:55.000000Z',
      updated_at: '2023-07-17T07:38:55.000000Z',
    },
    {
      id: '99aa96cd-6395-420f-a426-d0dfc6b27d78',
      institution_id: null,
      name: 'Terminoloogia töö',
      type: 'Oskused',
      created_at: '2023-07-17T07:38:55.000000Z',
      updated_at: '2023-07-17T07:38:55.000000Z',
    },
    {
      id: '99aa96cd-6388-4b98-a261-9d76b5245544',
      institution_id: null,
      name: 'Toimetamine',
      type: 'Oskused',
      created_at: '2023-07-17T07:38:55.000000Z',
      updated_at: '2023-07-17T07:38:55.000000Z',
    },
    {
      id: '99aa96cd-6385-4f09-bc98-3809434da5b0',
      institution_id: null,
      name: 'Tõlkimine',
      type: 'Oskused',
      created_at: '2023-07-17T07:38:55.000000Z',
      updated_at: '2023-07-17T07:38:55.000000Z',
    },
    {
      id: '99aa96cd-638b-4b06-a350-211737832308',
      institution_id: null,
      name: 'Tõlkimine + Toimetamine',
      type: 'Oskused',
      created_at: '2023-07-17T07:38:55.000000Z',
      updated_at: '2023-07-17T07:38:55.000000Z',
    },
    {
      id: '99aa96cd-6399-4aa9-b73a-8c75272588df',
      institution_id: null,
      name: 'Vandetõlge',
      type: 'Oskused',
      created_at: '2023-07-17T07:38:55.000000Z',
      updated_at: '2023-07-17T07:38:55.000000Z',
    },
    {
      id: '99aa96cd-637f-44d4-80e4-dbab8e8d240f',
      institution_id: null,
      name: 'Viipekeel',
      type: 'Oskused',
      created_at: '2023-07-17T07:38:55.000000Z',
      updated_at: '2023-07-17T07:38:55.000000Z',
    },
    {
      id: '99aa96cd-637f-44d4-80e4-dbab8e8d2401',
      institution_id: null,
      name: 'Dokument',
      type: 'Tellimused',
      created_at: '2023-07-17T07:38:55.000000Z',
      updated_at: '2023-07-17T07:38:55.000000Z',
    },
    {
      id: '99aa96cd-637f-44d4-80e4-dbab8e8d2402',
      institution_id: null,
      name: 'Fail',
      type: 'Tellimused',
      created_at: '2023-07-17T07:38:55.000000Z',
      updated_at: '2023-07-17T07:38:55.000000Z',
    },
    {
      id: '99aa96cd-637f-44d4-80e4-dbab8e8d2403',
      institution_id: null,
      name: 'Tõlge',
      type: 'Tellimused',
      created_at: '2023-07-17T07:38:55.000000Z',
      updated_at: '2023-07-17T07:38:55.000000Z',
    },
  ]

  const { t } = useTranslation()
  const { userPrivileges } = useAuth()

  const groupedCategoryData = groupBy(tags2, 'type')
  const uniqueCategoryTypes = Object.keys(groupedCategoryData)

  const defaultValues = map(uniqueCategoryTypes, (type) => {
    return {
      type: type,
      tags: map(groupedCategoryData[type], ({ id, name }) => ({ id, name })),
    }
  })

  console.log('defaultValues', defaultValues)

  const {
    control,
    handleSubmit,
    formState: { dirtyFields },
  } = useForm<FormValues>({
    reValidateMode: 'onSubmit',
    // values: defaultValues,
  })

  const editTagFields2: FieldProps<FormValues>[] = map(
    defaultValues,
    (tag) => ({
      inputType: InputTypes.Text,
      ariaLabel: 'bu',
      label: 'bubu',
      name: `tagInput.${tag}`,
    })
  )

  const editTagFields3: FieldProps<FormValues>[] = flatMap(
    defaultValues,
    (tag) =>
      map(tag.tags, ({ id, name }) => ({
        inputType: InputTypes.Text,
        ariaLabel: name,
        label: name,
        name: `tagInput.${id}`,
      }))
  )

  console.log('editTagFields3', editTagFields3)

  const handleCategoryEdit = (type: string) => {
    console.log('type editmodal', type)
    console.log('editTagFields modal', editTagFields3)
    showModal(ModalTypes.UserAndRoleManagement, {
      title: t('modal.edit_category_tag'),
      size: ModalSizeTypes.Narrow,
      cancelButtonContent: t('button.cancel'),
      proceedButtonContent: t('button.save'),
      dynamicForm: <DynamicForm fields={editTagFields3} control={control} />,
    })
  }

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
                onClick={() => handleCategoryEdit(type)}
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
