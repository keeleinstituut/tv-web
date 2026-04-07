import { FC, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm, Controller } from 'react-hook-form'
import { includes } from 'lodash'
import Container from 'components/atoms/Container/Container'
import Button, { AppearanceTypes, SizeTypes } from 'components/molecules/Button/Button'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import {
  useFetchInstitutionMainLanguages,
  useSyncInstitutionMainLanguages,
} from 'hooks/requests/useInstitutions'
import { useClassifierValuesFetch } from 'hooks/requests/useClassifierValues'
import { ClassifierValueType } from 'types/classifierValues'
import { orderClassifierByLangPriority } from 'helpers'
import { showValidationErrorMessage } from 'api/errorHandler'
import { useAuth } from 'components/contexts/AuthContext'
import { Privileges } from 'types/privileges'
import EditIcon from 'assets/icons/edit.svg?react'
import MultiSelectInput from './MultiSelectInput'
import classes from './classes.module.scss'

interface FormValues {
  languages: string[]
}

const CalendarSettingsManagement: FC = () => {
  const { t } = useTranslation()
  const { userPrivileges } = useAuth()
  const canEdit = includes(userPrivileges, Privileges.EditInstitution)
  const [isEditing, setIsEditing] = useState(false)

  const { mainLanguages } = useFetchInstitutionMainLanguages()
  const { syncMainLanguages, isLoading } = useSyncInstitutionMainLanguages()

  const { classifierValuesFilters: languageOptions = [] } =
    useClassifierValuesFetch(
      { type: ClassifierValueType.Language },
      orderClassifierByLangPriority
    )

  const currentLanguageIds = mainLanguages.map((l) => l.language_id)

  const { control, handleSubmit, reset } = useForm<FormValues>({
    values: { languages: currentLanguageIds },
  })

  const onSubmit = useCallback(
    async (values: FormValues) => {
      try {
        await syncMainLanguages(values)
        showNotification({
          type: NotificationTypes.Success,
          title: t('notification.announcement'),
          content: t('success.calendar_settings_updated'),
        })
        setIsEditing(false)
      } catch (errorData) {
        showValidationErrorMessage(errorData)
      }
    },
    [syncMainLanguages, t]
  )

  const handleCancel = useCallback(() => {
    reset({ languages: currentLanguageIds })
    setIsEditing(false)
  }, [reset, currentLanguageIds])

  return (
    <Container className={classes.container}>
      <div className={classes.header}>
        <h3 className={classes.title}>{t('calendar_settings.title')}</h3>
        {isEditing ? (
          <div className={classes.actions}>
            <Button
              appearance={AppearanceTypes.Secondary}
              size={SizeTypes.S}
              onClick={handleCancel}
            >
              {t('button.cancel')}
            </Button>
            <Button
              size={SizeTypes.S}
              loading={isLoading}
              onClick={handleSubmit(onSubmit)}
            >
              {t('calendar_settings.save_and_close')}
            </Button>
          </div>
        ) : canEdit ? (
          <Button
            appearance={AppearanceTypes.Text}
            size={SizeTypes.S}
            icon={EditIcon}
            onClick={() => setIsEditing(true)}
          >
            {t('button.change')}
          </Button>
        ) : null}
      </div>
      <p className={classes.description}>
        {t('calendar_settings.description')}
      </p>
      <div className={classes.field}>
        <label className={classes.fieldLabel}>
          {t('calendar_settings.calendar_languages')}
        </label>
        <Controller
          control={control}
          name="languages"
          render={({ field }) => (
            <MultiSelectInput
              options={languageOptions.map((o) => ({
                value: o.value,
                label: o.label,
              }))}
              value={field.value}
              onChange={field.onChange}
              disabled={!isEditing}
            />
          )}
        />
      </div>
    </Container>
  )
}

export default CalendarSettingsManagement
