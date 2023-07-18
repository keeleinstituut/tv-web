import { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Tooltip from 'components/organisms/Tooltip/Tooltip'
import TagsCheatSheet from 'components/molecules/cheatSheets/TagManagementCheatSheet'
import Container from 'components/atoms/Container/Container'
import DynamicForm, {
  FieldProps,
  InputTypes,
} from 'components/organisms/DynamicForm/DynamicForm'
import { ReactComponent as Add } from 'assets/icons/add.svg'
import { useForm, useWatch } from 'react-hook-form'
import Button, {
  AppearanceTypes,
  IconPositioningTypes,
} from 'components/molecules/Button/Button'

import classes from './classes.module.scss'
// import { useFetchTags } from 'hooks/requests/useTags'

interface ObjectType {
  [key: string]: string
}

type FormValues = {
  // tagInput?: string
  tagInput?: ObjectType
  tagCategorySelection?: string
}

const Tags: FC = () => {
  const { t } = useTranslation()
  const { control, handleSubmit } = useForm<FormValues>({
    reValidateMode: 'onSubmit',
  })

  const tagFields: FieldProps<FormValues>[] = [
    {
      inputType: InputTypes.Text,
      ariaLabel: t('tag.tag_name'),
      label: 'Nimetus',
      // name: 'tagInput',
      name: `tagInput.${1}`,
      placeholder: t('tag.tag_input'),
      type: 'text',
      rules: {
        required: true,
      },
      className: classes.tagInputField,
    },
  ]

  const categoryFields: FieldProps<FormValues>[] = [
    {
      inputType: InputTypes.Selections,
      name: 'tagCategorySelection',
      ariaLabel: t('tag.select_tag_category'),
      options: [
        { label: 'Option 1', value: 'Option 1' },
        { label: 'Option 2', value: 'Option 2' },
        { label: 'Option 3', value: 'Option 3' },
        { label: 'Option 4', value: 'Option 4' },
      ],
      placeholder: t('tag.select_tag_category'),
      multiple: true,
      rules: {
        required: true,
      },
      buttons: true,
    },
  ]

  const [inputFields, setInputFields] = useState(tagFields)

  console.log('inputFields state', inputFields)

  const addInputField = () => {
    setInputFields([
      ...inputFields,
      {
        inputType: InputTypes.Text,
        ariaLabel: t('tag.tag_name'),
        label: 'Nimetus',
        name: `tagInput.${inputFields?.length + 1}`,
        placeholder: t('tag.tag_input'),
        type: 'text',
        rules: {
          required: true,
        },
        className: classes.tagInputField,
      },
    ])
  }

  // const handleInputChange = (
  //   event: ChangeEvent<HTMLInputElement>,
  //   id: number
  // ) => {
  //   const updatedInputFields = map(inputFields, (field) => {
  //     if (field?.id === id) {
  //       return { ...field, value: event.target.value }
  //     }
  //     return field
  //   })
  //   setInputFields(updatedInputFields)
  // }

  const formValue = useWatch({ control })
  console.log('formValue', formValue)

  return (
    <>
      <div className={classes.tagsHeader}>
        <h1>{t('tag.tag_management')}</h1>
        <Tooltip
          title={t('cheat_sheet.user_management.title')}
          modalContent={<TagsCheatSheet />}
        />
      </div>
      <Container className={classes.tagsContainer}>
        <div className={classes.gridItemOne}>
          <h4 className={classes.addingTag}>{t('tag.adding_tag')}</h4>
          <p>{t('tag.naming_tag')}</p>
        </div>

        <div className={classes.addingTagsSeparator} />

        <div className={classes.gridItemTwo}>
          <DynamicForm fields={inputFields} control={control} />
          <Button
            appearance={AppearanceTypes.Text}
            iconPositioning={IconPositioningTypes.Left}
            icon={Add}
            className={classes.addNewRow}
            children={t('tag.add_new_row')}
            onClick={addInputField}
          />
        </div>

        <div className={classes.gridItemThree}>
          <DynamicForm fields={categoryFields} control={control} />

          <Button
            children={t('button.add')}
            type="submit"
            ariaLabel={t('button.add')}
            className={classes.addButton}
          />
        </div>
      </Container>
      <div className={classes.categoryContainer}>
        <Container className={classes.category}>
          <div>Oskused</div>
          <div className={classes.tagCategorySeparator} />
          <div>Suuline tõlge</div>
        </Container>
        <Container className={classes.category}>
          <div>Teostajad</div>
          <div className={classes.tagCategorySeparator} />
          <div>tag</div>
        </Container>
        <Container className={classes.category}>
          <div>Tellimused</div>
          <div className={classes.tagCategorySeparator} />
          <div>Sisedokument</div>
        </Container>
        <Container className={classes.category}>
          <div>Tõlkemälud</div>
          <div className={classes.tagCategorySeparator} />
          <div>Lepingud</div>
        </Container>
      </div>
    </>
  )
}

export default Tags
