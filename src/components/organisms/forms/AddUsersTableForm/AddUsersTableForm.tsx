import { FC, useCallback, useState, useMemo } from 'react'
import {
  useForm,
  SubmitHandler,
  FieldPath,
  useFormState,
  Control,
} from 'react-hook-form'
import Button, { ButtonProps } from 'components/molecules/Button/Button'
import { reduce, map, join, isEmpty, keys, filter, find } from 'lodash'
import { Root } from '@radix-ui/react-form'
import classes from './classes.module.scss'
import { UserCsvType } from 'types/users'
import { useValidateUsers, useUsersUpload } from 'hooks/requests/useUsers'
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
import { useRolesFetch } from 'hooks/requests/useRoles'

interface FormValues {
  [key: string]: UserCsvType
}

interface SubmitButtonProps extends ButtonProps {
  control: Control
}

// TODO: might move to component, if it will be reused in other forms
const SubmitButton: FC<SubmitButtonProps> = ({ control, ...rest }) => {
  // Accessing form state directly in this component
  // to avoid rerendering the entire AddUsersTableForm component
  const formState = useFormState({ control })
  return (
    <Button
      {...rest}
      disabled={!formState.isValid || !isEmpty(formState.errors)}
    ></Button>
  )
}

const AddUsersTableForm: FC = () => {
  const { existingRoles = [] } = useRolesFetch({})
  const { validateUsers, isLoading } = useValidateUsers()
  const { uploadUsers, isLoading: isUploadLoading } = useUsersUpload()
  const [tableData, setTableData] = useState<UserCsvType[]>([])
  const [rowsWithErrors, setRowsWithErrors] = useState<ErrorsInRow>({})
  const [fileName, setFileName] = useState('')
  const [rowsWithExistingUsers, setRowsWithExistingUsers] = useState<number[]>(
    []
  )
  const { t } = useTranslation()
  const navigate = useNavigate()

  const formValues = useMemo(
    () =>
      isEmpty(tableData)
        ? {}
        : reduce(
            tableData,
            (result, row, index) => {
              if (!row) return result
              const rowData = {
                ...row,
                role: filter(row.role, (role) =>
                  find(existingRoles, { name: role })
                ),
              }
              return {
                ...result,
                [`row-${index}`]: rowData,
              }
            },
            {}
          ),
    [tableData, existingRoles]
  )

  const { control, handleSubmit, setError, clearErrors } = useForm<FormValues>({
    reValidateMode: 'onChange',
    mode: 'onChange',
    values: formValues,
    resetOptions: {
      keepErrors: true,
    },
  })

  const handleFileValidationAttempt = useCallback(
    async (file: File) => {
      setFileName(file.name)
      try {
        const response = await validateUsers(file)
        const { rowsWithExistingInstitutionUsers } = response
        if (rowsWithExistingInstitutionUsers) {
          setRowsWithExistingUsers(rowsWithExistingInstitutionUsers)
        }
        setRowsWithErrors({})
        return true
      } catch (errorData) {
        setRowsWithErrors({})
        clearErrors()
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
    [clearErrors, setError, validateUsers]
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
            content: t('success.users_uploaded', { fileName }),
          })
          navigate('/settings/users')
        } catch (_) {
          // Do nothing, error notification is already displayed
        }
      }
    },
    [fileName, handleFileValidationAttempt, navigate, t, uploadUsers]
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
          inputFileTypes={[InputFileTypes.Csv]}
          onDelete={onDeleteFile}
          allowMultiple={false}
        />
        <SubmitButton
          onClick={handleSubmit(onSubmit)}
          type="submit"
          hidden={isEmpty(tableData)}
          loading={isLoading || isUploadLoading}
          control={control}
        >
          {t('button.save_and_send_notifications')}
        </SubmitButton>
      </div>
      {!isEmpty(tableData) && (
        <Root onSubmit={handleSubmit(onSubmit)}>
          <AddUsersTable
            tableData={tableData}
            rowsWithErrors={rowsWithErrors}
            rowsWithExistingUsers={rowsWithExistingUsers}
            existingRoles={existingRoles}
            control={control}
          />
        </Root>
      )}
    </>
  )
}

export default AddUsersTableForm
