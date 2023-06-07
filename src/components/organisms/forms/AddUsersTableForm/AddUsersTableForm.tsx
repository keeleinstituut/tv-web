import { ChangeEventHandler, FC, useCallback, useState } from 'react'
import { useForm, SubmitHandler, FieldPath } from 'react-hook-form'
import Button from 'components/molecules/Button/Button'
import { reduce, map, join, isEmpty, keys, includes } from 'lodash'
import { InputTypes } from 'components/organisms/DynamicInputComponent/DynamicInputComponent'
import { Root } from '@radix-ui/react-form'
import classes from './styles.module.scss'
import { UserCsvType } from 'types/users'
import { useValidateUsers } from 'hooks/requests/useUsers'
import {
  convertUsersCsvToArray,
  objectsToCsvFile,
  usersCsvFieldsToKeys,
} from 'helpers'
import { CsvValidationError } from 'api/errorHandler'
import { FormInput } from 'components/organisms/DynamicForm/DynamicForm'
import useValidators from 'hooks/useValidators'
import { useTranslation } from 'react-i18next'

interface FormValues {
  [key: string]: UserCsvType
}

interface ErrorsInRow {
  [key: string]: string[]
}

const AddUsersTableForm: FC = () => {
  const { validateUsers } = useValidateUsers()
  const [tableData, setTableData] = useState<UserCsvType[]>([])
  const [rowsWithErrors, setRowsWithErrors] = useState<ErrorsInRow>({})
  const { t } = useTranslation()
  const {
    emailValidator,
    picValidator,
    rolesValidator,
    phoneValidator,
    nameValidator,
  } = useValidators()

  const getRulesByKey = useCallback(
    (key: keyof UserCsvType) => {
      switch (key) {
        case 'personal_identification_code':
          return {
            required: true,
            validate: (value: unknown) => {
              const typedValue = value as string
              return picValidator(typedValue)
            },
          }
        case 'email':
          return {
            required: true,
            validate: (value: unknown) => {
              const typedValue = value as string
              return emailValidator(typedValue)
            },
          }
        case 'roles':
          return {
            required: true,
            validate: (value: unknown) => {
              const typedValue = value as string[]
              return rolesValidator(typedValue)
            },
          }
        case 'phone':
          return {
            required: true,
            validate: (value: unknown) => {
              const typedValue = value as string
              return phoneValidator(typedValue)
            },
          }
        case 'name':
          return {
            required: true,
            validate: (value: unknown) => {
              const typedValue = value as string
              return nameValidator(typedValue)
            },
          }
        default:
          return {}
      }
    },
    [
      emailValidator,
      nameValidator,
      phoneValidator,
      picValidator,
      rolesValidator,
    ]
  )

  const formValues = isEmpty(tableData)
    ? {}
    : reduce(
        tableData,
        (result, row, index) => {
          if (!row) return result
          return {
            ...result,
            [`row-${index}`]: row,
          }
        },
        {}
      )

  const { control, handleSubmit, setError } = useForm<FormValues>({
    reValidateMode: 'onChange',
    mode: 'onChange',
    values: formValues,
    resetOptions: {
      keepErrors: true,
    },
  })

  const handleFileValidationAttempt = useCallback(
    async (file: File) => {
      try {
        await validateUsers(file)
        return true
      } catch (errorData) {
        const typedErrorData = errorData as CsvValidationError

        if (typedErrorData.errors) {
          map(typedErrorData.errors, (rowErrors) => {
            const { row, errors } = rowErrors
            const errorFields = map(errors, (errorsArray, key) => {
              const typedKey = key as FieldPath<FormValues>
              const errorString = join(errorsArray, ' ')
              setError(`row-${row}.${typedKey}`, {
                type: 'backend',
                message: errorString,
              })
              return typedKey
            })
            console.warn('fieldsWithErrors', errorFields)
            setRowsWithErrors({
              ...rowsWithErrors,
              [`row-${row}`]: errorFields,
            })
          })
        }
      }
      return false
    },
    [rowsWithErrors, setError, validateUsers]
  )

  const handleFileUploaded: ChangeEventHandler<HTMLInputElement> = async (
    event
  ) => {
    const uploadedFile = event.target.files?.[0]
    const fileReader = new FileReader()
    fileReader.onload = async (event) => {
      if (event?.target?.result) {
        const tableRows = convertUsersCsvToArray(event?.target?.result)
        setTableData(tableRows)
      }
    }
    if (uploadedFile) {
      const validationPassed = await handleFileValidationAttempt(uploadedFile)
      console.warn('file validate done, red file', validationPassed)
      fileReader.readAsText(uploadedFile)
    }
  }

  const columns = keys(tableData[0])

  const onSubmit: SubmitHandler<FormValues> = useCallback(
    async (formValues, e) => {
      const csvFile = objectsToCsvFile<UserCsvType>(
        formValues,
        keys(usersCsvFieldsToKeys)
      )
      const validationPassed = await handleFileValidationAttempt(csvFile)
      if (validationPassed) {
        // TODO: if validation has passed, upload the csv and navigate to users management view
      }
    },
    [handleFileValidationAttempt]
  )

  // TODO: might add loader here, while csv is uploading
  // if (isLoading) {
  //   return <Loader loading />
  // }

  return (
    <>
      <input type="file" onChange={handleFileUploaded} />
      <Root className={classes.container} onSubmit={handleSubmit(onSubmit)}>
        <Button type="submit">{t('button.save_and_send_notifications')}</Button>
        <table>
          <thead>
            <tr>
              {map(columns, (title) => (
                <th key={title}>{title}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {map(tableData, (item, index) => {
              const rowErrors = rowsWithErrors[`row-${index}`]
              return (
                <tr key={index}>
                  {map(item, (itemValue, key) => {
                    // TODO: hack for now, hopefully we can get rid of this
                    // it currently seems that lodash map can't infer the type of key
                    const typedKey = key as unknown as keyof UserCsvType
                    return (
                      <td key={key}>
                        <FormInput
                          name={`row-${index}.${key}`}
                          ariaLabel={key}
                          inputType={InputTypes.Text}
                          control={control}
                          onlyDisplay={!includes(rowErrors, typedKey)}
                          rules={getRulesByKey(typedKey)}
                        />
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </Root>
    </>
  )
}

export default AddUsersTableForm
