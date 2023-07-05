import { FC, useCallback, useState } from 'react'
import { useForm, SubmitHandler, FieldPath } from 'react-hook-form'
import Button from 'components/molecules/Button/Button'
import { reduce, map, join, isEmpty, keys } from 'lodash'
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
import { useTranslation } from 'react-i18next'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { useNavigate } from 'react-router-dom'
import AddUsersTable, {
  ErrorsInRow,
} from 'components/organisms/tables/AddUsersTable/AddUsersTable'

interface FormValues {
  [key: string]: UserCsvType
}

const AddUsersTableForm: FC = () => {
  const { validateUsers, isLoading } = useValidateUsers()
  const { uploadUsers, isLoading: isUploadLoading } = useUploadUsers()
  const [tableData, setTableData] = useState<UserCsvType[]>([])
  const [rowsWithErrors, setRowsWithErrors] = useState<ErrorsInRow>({})
  const [rowsWithExistingUsers, setRowsWithExistingUsers] = useState<number[]>(
    []
  )
  const { t } = useTranslation()
  const navigate = useNavigate()

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

  const handleFileValidationAttempt = useCallback(
    async (file: File) => {
      try {
        await validateUsers(file)
        setRowsWithErrors({})
        return true
      } catch (errorData) {
        const typedErrorData = errorData as CsvValidationError
        const { errors, rowsWithExistingInstitutionUsers } = typedErrorData

        if (rowsWithExistingInstitutionUsers) {
          setRowsWithExistingUsers(rowsWithExistingInstitutionUsers)
        }

        if (errors) {
          map(errors, (rowErrors) => {
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
        <AddUsersTable
          tableData={tableData}
          rowsWithErrors={rowsWithErrors}
          rowsWithExistingUsers={rowsWithExistingUsers}
          control={control}
        />
      </Root>
    </>
  )
}

export default AddUsersTableForm
