import { ChangeEvent, FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Tooltip from 'components/organisms/Tooltip/Tooltip'
import TagsCheatSheet from 'components/molecules/cheatSheets/TagManagementCheatSheet'
import Container from 'components/atoms/Container/Container'
import DynamicForm, {
  FieldProps,
  InputTypes,
} from 'components/organisms/DynamicForm/DynamicForm'
import { ReactComponent as Add } from 'assets/icons/add.svg'
import { useForm } from 'react-hook-form'
import Button, {
  AppearanceTypes,
  IconPositioningTypes,
} from 'components/molecules/Button/Button'

import classes from './classes.module.scss'
import { map } from 'lodash'
// import { useFetchTags } from 'hooks/requests/useTags'

type FormValues = {
  tagInput?: string
  tagCategorySelection?: string
}

const Tags: FC = () => {
  const { t } = useTranslation()
  const {
    control,
    // handleSubmit,
    // formState: { isSubmitting, isDirty, isValid },
    // setError,
  } = useForm<FormValues>({
    reValidateMode: 'onSubmit',
    // defaultValues: defaultValues,
  })

  const testFields: FieldProps<FormValues>[] = [
    {
      inputType: InputTypes.Text,
      ariaLabel: t('tag.tag_name'),
      label: 'Nimetus',
      name: 'tagInput',
      placeholder: t('tag.tag_input'),
      type: 'text',
      rules: {
        required: true,
        // validate: emailValidator,
      },
      className: classes.tagInputField,
    },
  ]

  const testFields2: FieldProps<FormValues>[] = [
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
    },
  ]

  const initialInput = { type: 'text', id: 1, value: '' }
  const [inputFields, setInputFields] = useState([initialInput])

  const addInputField = () => {
    setInputFields([
      ...inputFields,
      { type: 'text', id: inputFields.length + 1, value: '' },
    ])
  }

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement>,
    id: number
  ) => {
    const updatedInputFields = map(inputFields, (field) => {
      if (field.id === id) {
        return { ...field, value: event.target.value }
      }
      return field
    })
    setInputFields(updatedInputFields)
  }

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

        <div className={classes.tagSeparator} />

        <div className={classes.gridItemTwo}>
          {map(inputFields, (field) => (
            <input
              key={field.id}
              type={field.type}
              value={field.value}
              onChange={(event) => handleInputChange(event, field.id)}
              className={classes.tagInputField}
            />
          ))}
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
          <DynamicForm fields={testFields2} control={control} />
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
