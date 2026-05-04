import { FC, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm, Controller } from 'react-hook-form'
import { includes } from 'lodash'
import Container from 'components/atoms/Container/Container'
import Button, {
  AppearanceTypes,
  SizeTypes,
} from 'components/molecules/Button/Button'
import TextInput from 'components/molecules/TextInput/TextInput'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import {
  useFetchAzureOpenAISettings,
  useUpdateAzureOpenAISettings,
} from 'hooks/requests/useMachineTranslationSettings'
import { showValidationErrorMessage } from 'api/errorHandler'
import { useAuth } from 'components/contexts/AuthContext'
import { Privileges } from 'types/privileges'
import { AzureOpenAISettingsPayload } from 'types/machineTranslation'
import EditIcon from 'assets/icons/edit.svg?react'
import CheckBoxInput from 'components/molecules/CheckBoxInput/CheckBoxInput'
import classes from './classes.module.scss'
import { Root } from '@radix-ui/react-form'

interface FormValues {
  endpoint: string
  api_key: string
  tenant_id: string
  application_id: string
  client_secret: string
  deployment: string
  show_confirmation: boolean
}

const AzureOpenAISettingsManagement: FC = () => {
  const { t } = useTranslation()
  const { userPrivileges } = useAuth()
  const canEdit = includes(
    userPrivileges,
    Privileges.EditMachineTranslationSettings
  )
  const [isEditing, setIsEditing] = useState(false)

  const { settings, isLoading: isFetching } = useFetchAzureOpenAISettings()
  const { updateSettings, isLoading: isSaving } = useUpdateAzureOpenAISettings()

  const { control, handleSubmit, reset } = useForm<FormValues>({
    values: {
      endpoint:          settings?.endpoint          ?? '',
      api_key:           '',
      tenant_id:         settings?.tenant_id         ?? '',
      application_id:    settings?.application_id    ?? '',
      client_secret:     '',
      deployment:        settings?.deployment        ?? '',
      show_confirmation: settings?.show_confirmation ?? false,
    },
  })

  const onSubmit = useCallback(
    async (values: FormValues) => {
      try {
        const payload: AzureOpenAISettingsPayload = {
          endpoint:          values.endpoint          || null,
          tenant_id:         values.tenant_id         || null,
          application_id:    values.application_id    || null,
          deployment:        values.deployment        || null,
          show_confirmation: values.show_confirmation,
        }
        if (values.api_key)      payload.api_key = values.api_key
        if (values.client_secret) payload.client_secret = values.client_secret

        await updateSettings(payload)
        showNotification({
          type: NotificationTypes.Success,
          title: t('notification.announcement'),
          content: t('success.azure_openai_settings_updated'),
        })
        setIsEditing(false)
      } catch (errorData) {
        showValidationErrorMessage(errorData)
      }
    },
    [updateSettings, t]
  )

  const handleCancel = useCallback(() => {
    reset()
    setIsEditing(false)
  }, [reset])

  if (!canEdit) return null

  return (
    <Container className={classes.container}>
      <Root>
        <div className={classes.header}>
          <h3 className={classes.title}>{t('azure_openai_settings.title')}</h3>
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
                loading={isSaving}
                onClick={handleSubmit(onSubmit)}
              >
                {t('calendar_settings.save_and_close')}
              </Button>
            </div>
          ) : (
            <Button
              appearance={AppearanceTypes.Text}
              size={SizeTypes.S}
              icon={EditIcon}
              onClick={() => setIsEditing(true)}
            >
              {t('button.change')}
            </Button>
          )}
        </div>

        <p className={classes.description}>
          {t('azure_openai_settings.description')}
        </p>

        <div className={classes.fields}>
          <div className={classes.field}>
            <Controller
              control={control}
              name="endpoint"
              render={({ field, fieldState }) => (
                <TextInput
                  {...field}
                  name="endpoint"
                  label={t('azure_openai_settings.endpoint')}
                  ariaLabel={t('azure_openai_settings.endpoint')}
                  disabled={!isEditing}
                  error={fieldState.error}
                />
              )}
            />
          </div>

          <div className={classes.field}>
            <Controller
              control={control}
              name="deployment"
              render={({ field, fieldState }) => (
                <TextInput
                  {...field}
                  name="deployment"
                  label={t('azure_openai_settings.deployment')}
                  ariaLabel={t('azure_openai_settings.deployment')}
                  disabled={!isEditing}
                  error={fieldState.error}
                />
              )}
            />
          </div>

          <div className={classes.field}>
            <Controller
              control={control}
              name="tenant_id"
              render={({ field, fieldState }) => (
                <TextInput
                  {...field}
                  name="tenant_id"
                  label={t('azure_openai_settings.tenant_id')}
                  ariaLabel={t('azure_openai_settings.tenant_id')}
                  disabled={!isEditing}
                  error={fieldState.error}
                />
              )}
            />
          </div>

          <div className={classes.field}>
            <Controller
              control={control}
              name="application_id"
              render={({ field, fieldState }) => (
                <TextInput
                  {...field}
                  name="application_id"
                  label={t('azure_openai_settings.application_id')}
                  ariaLabel={t('azure_openai_settings.application_id')}
                  disabled={!isEditing}
                  error={fieldState.error}
                />
              )}
            />
          </div>

          <div className={classes.field}>
            <Controller
              control={control}
              name="api_key"
              render={({ field, fieldState }) => (
                <TextInput
                  {...field}
                  name="api_key"
                  type="password"
                  label={
                    <span>
                      {t('azure_openai_settings.api_key')}
                      {settings?.has_api_key && !isEditing && (
                        <span className={classes.savedIndicator}>
                          {' '}
                          {t('azure_openai_settings.key_saved')}
                        </span>
                      )}
                    </span>
                  }
                  ariaLabel={t('azure_openai_settings.api_key')}
                  disabled={!isEditing}
                  error={fieldState.error}
                />
              )}
            />
          </div>

          <div className={classes.field}>
            <Controller
              control={control}
              name="client_secret"
              render={({ field, fieldState }) => (
                <TextInput
                  {...field}
                  name="client_secret"
                  type="password"
                  label={
                    <span>
                      {t('azure_openai_settings.client_secret')}
                      {settings?.has_client_secret && !isEditing && (
                        <span className={classes.savedIndicator}>
                          {' '}
                          {t('azure_openai_settings.key_saved')}
                        </span>
                      )}
                    </span>
                  }
                  ariaLabel={t('azure_openai_settings.client_secret')}
                  disabled={!isEditing}
                  error={fieldState.error}
                />
              )}
            />
          </div>

          <div className={classes.field}>
            <Controller
              control={control}
              name="show_confirmation"
              render={({ field }) => (
                <CheckBoxInput
                  name="show_confirmation"
                  ariaLabel={t('azure_openai_settings.show_confirmation_label')}
                  label={t('azure_openai_settings.show_confirmation_label')}
                  value={field.value}
                  onChange={(e) =>
                    field.onChange((e.target as HTMLInputElement).checked)
                  }
                  disabled={!isEditing}
                />
              )}
            />
          </div>
        </div>
      </Root>
    </Container>
  )
}

export default AzureOpenAISettingsManagement
