import { FC, useCallback, useState } from 'react'
import { useForm, SubmitHandler, FieldPath } from 'react-hook-form'
import Button from 'components/molecules/Button/Button'
import {
  reduce,
  map,
  join,
  isEmpty,
  keys,
  includes,
  compact,
  size,
} from 'lodash'
import { InputTypes } from 'components/organisms/DynamicInputComponent/DynamicInputComponent'
import { Root } from '@radix-ui/react-form'
import classes from './classes.module.scss'
import { UserCsvType } from 'types/users'
import { useValidateUsers, useUploadUsers } from 'hooks/requests/useUsers'
import {
  convertUsersCsvToArray,
  objectsToCsvFile,
  usersCsvFieldsToKeys,
} from 'helpers'
import { CsvValidationError } from 'api/errorHandler'
import FileImport, {
  InputFileTypes,
} from 'components/organisms/FileImport/FileImport'
import { FormInput } from 'components/organisms/DynamicForm/DynamicForm'
import useValidators from 'hooks/useValidators'
import { useTranslation } from 'react-i18next'
import { useRolesFetch } from 'hooks/requests/useRoles'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { useNavigate } from 'react-router-dom'

interface FormValues {
  [key: string]: UserCsvType
}

interface ErrorsInRow {
  [key: string]: string[]
}

const AddUsersTableForm: FC = () => {
  const { validateUsers, isLoading } = useValidateUsers()
  const { uploadUsers, isLoading: isUploadLoading } = useUploadUsers()
  const [tableData, setTableData] = useState<UserCsvType[]>([])
  const [rowsWithErrors, setRowsWithErrors] = useState<ErrorsInRow>({})
  const { existingRoles = [] } = useRolesFetch()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { emailValidator, picValidator, rolesValidator, phoneValidator } =
    useValidators()

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

  const {
    control,
    handleSubmit,
    setError,
    formState: { isValid, isDirty },
  } = useForm<FormValues>({
    reValidateMode: 'onChange',
    mode: 'onChange',
    values: formValues,
    resetOptions: {
      keepErrors: true,
    },
  })

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
        case 'role':
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
          }
        default:
          return {}
      }
    },
    [emailValidator, phoneValidator, picValidator, rolesValidator]
  )

  const handleFileValidationAttempt = useCallback(
    async (file: File) => {
      try {
        await validateUsers(file)
        setRowsWithErrors({})
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
            setRowsWithErrors((prevRowsWithErrors) => ({
              ...prevRowsWithErrors,
              [`row-${row}`]: errorFields,
            }))
          })
        }
      }
      return false
    },
    [setError, validateUsers]
  )

  const handleFileUploaded = async (uploadedFile: File) => {
    const fileReader = new FileReader()
    fileReader.onload = async (event) => {
      if (event?.target?.result) {
        const tableRows = convertUsersCsvToArray(event?.target?.result)
        setTableData(tableRows)
      }
    }
    if (uploadedFile) {
      await handleFileValidationAttempt(uploadedFile)
      fileReader.readAsText(uploadedFile)
    }
  }

  const onSubmit: SubmitHandler<FormValues> = useCallback(
    async (formValues, e) => {
      const csvFile = objectsToCsvFile<UserCsvType>(
        formValues,
        keys(usersCsvFieldsToKeys)
      )
      const validationPassed = await handleFileValidationAttempt(csvFile)
      if (validationPassed) {
        try {
          await uploadUsers(csvFile)
          showNotification({
            type: NotificationTypes.Success,
            title: t('notification.announcement'),
            content: t('success.users_uploaded'),
          })
          navigate('/users')
        } catch (_) {
          // Do nothing, error notification is already displayed
        }
      }
    },
    [handleFileValidationAttempt, navigate, t, uploadUsers]
  )

  const onDeleteFile = useCallback(() => {
    setTableData([])
  }, [])

  const roleOptions = compact(
    map(existingRoles, ({ name }) => {
      if (name) {
        return {
          label: name,
          value: name,
        }
      }
    })
  )

  const columns = keys(tableData[0])

  return (
    <>
      <div className={classes.row}>
        <FileImport
          helperText={t('helper.csv_upload_helper')}
          fileButtonText={t('button.add_csv')}
          fileButtonChangeText={t('button.add_new_csv')}
          onChange={handleFileUploaded}
          inputFileType={InputFileTypes.Csv}
          onDelete={onDeleteFile}
          allowMultiple={false}
        />
        <Button
          onClick={handleSubmit(onSubmit)}
          type="submit"
          hidden={isEmpty(tableData)}
          loading={isLoading || isUploadLoading}
          disabled={!isDirty || !isValid}
        >
          {t('button.save_and_send_notifications')}
        </Button>
      </div>

      <Root onSubmit={handleSubmit(onSubmit)}>
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
              let errorZIndexModifier = 0
              return (
                <tr key={index}>
                  {map(item, (_, key) => {
                    // TODO: hack for now, hopefully we can get rid of this
                    // it currently seems that lodash map can't infer the type of key
                    const typedKey = key as unknown as keyof UserCsvType
                    errorZIndexModifier += 1
                    const errorZIndex =
                      index * 10 + size(item) - errorZIndexModifier
                    return (
                      <td key={key}>
                        <FormInput
                          name={`row-${index}.${key}`}
                          ariaLabel={key}
                          control={control}
                          onlyDisplay={!includes(rowErrors, typedKey)}
                          errorZIndex={errorZIndex}
                          {...(typedKey === 'role'
                            ? {
                                options: roleOptions,
                                inputType: InputTypes.Selections,
                                multiple: true,
                                buttons: true,
                                placeholder: t('placeholder.roles'),
                                tags: true,
                              }
                            : { inputType: InputTypes.Text })}
                          {...(typedKey === 'personal_identification_code'
                            ? { type: 'number' }
                            : {})}
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
