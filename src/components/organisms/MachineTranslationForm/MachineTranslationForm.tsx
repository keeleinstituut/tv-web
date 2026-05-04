import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import SelectionControlsInput, { DropdownSizeTypes } from 'components/organisms/SelectionControlsInput/SelectionControlsInput'
import FileImport, {
  ProjectFileTypes,
} from 'components/organisms/FileImport/FileImport'
import Button, {
  AppearanceTypes,
  SizeTypes,
} from 'components/molecules/Button/Button'
import {
  useFetchMTProviders,
  useFetchMTProviderOptions,
  useTranslateText,
  useSubmitFileTranslation,
  usePollMTJobsStatus,
} from 'hooks/requests/useMachineTranslation'
import { endpoints } from 'api/endpoints'
import { MTProvider, MTProviderOptions } from 'types/machineTranslation'
import classes from './classes.module.scss'
import DownloadIcon from 'assets/icons/download.svg?react'
import { Root } from '@radix-ui/react-form'
import { useClassifierValuesFetch } from 'hooks/requests/useClassifierValues'
import { ClassifierValueType } from 'types/classifierValues'
import { orderClassifierByLangPriority } from 'helpers'
import { first, isEmpty, map, sortBy, split } from 'lodash'
import classNames from 'classnames'
import SwapHorizontal from 'assets/icons/swap_horizontal.svg?react'
import CloseIcon from 'assets/icons/close.svg?react'
import CopyIcon from 'assets/icons/copy.svg?react'
import ConfirmationModalBase from 'components/organisms/modals/ConfirmationModalBase/ConfirmationModalBase'

const SOURCE_TEXT_MAX_LENGTH = 5000
const MAX_FILE_COUNT = 3

type TranslationMode = 'text' | 'file'

interface MTFormValues {
  provider: string
  source_language: string
  target_language: string
  domain?: string
  text?: string
}

interface MachineTranslationFormProps {
  className: string
}

const MachineTranslationForm: FC<MachineTranslationFormProps> = (props) => {
  const { className } = props

  const { t } = useTranslation()
  const navigate = useNavigate()
  const { control, handleSubmit, watch, setValue, getValues } = useForm<MTFormValues>()
  const [mode, setMode] = useState<TranslationMode>('text')
  const [selectedFiles, setselectedFiles] = useState<File[]>([])
  const fileLimitExceeded = selectedFiles.length > MAX_FILE_COUNT
  const [textJobId, setTextJobId] = useState<string | null>(null)
  const [fileJobIds, setFileJobIds] = useState<string[]>([])
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [pendingProvider, setPendingProvider] = useState<MTProvider | null>(null)

  const selectedProvider = watch('provider')
  const { providers, isLoading: providersLoading } = useFetchMTProviders()
  const { options, isLoading: optionsLoading } =
    useFetchMTProviderOptions(selectedProvider ?? null)
  const { translateText, isLoading: isTranslatingText } = useTranslateText()
  const { submitFile, isLoading: isSubmittingFile } = useSubmitFileTranslation()
  const { jobs: textJobs } = usePollMTJobsStatus(textJobId ? [textJobId] : [])
  const textJob = textJobs[0] ?? null
  const { jobs: fileJobs } = usePollMTJobsStatus(fileJobIds)
  const sortedFileJobs = useMemo(() => sortBy(fileJobs, 'original_filename'), [fileJobs])
  const { classifierValues } = useClassifierValuesFetch(
    {
      type: ClassifierValueType.Language,
    },
    orderClassifierByLangPriority
  )

  const currentProvider = providers.find((p) => p.name === selectedProvider)
  const supportsFile = currentProvider?.supports_file_translation ?? false

  const providerCombinations =
    (options as MTProviderOptions | null)?.language_combinations ?? {}

  const selectedSource = watch('source_language')
  const selectedTarget = watch('target_language')

  const toLangOptions = useCallback(
    (codes: string[]) =>
      sortBy(codes.map((code) => ({
        value: code,
        label: t(`machine_translation.languages.${code}`, code),
      })), 'label'),
    [t]
  )

  const sourceLanguageOptions = useMemo(
    () => toLangOptions(Object.keys(providerCombinations)),
    [providerCombinations, toLangOptions]
  )

  const targetLanguageOptions = useMemo(() => {
    if (!selectedSource || !providerCombinations[selectedSource]) return []
    return toLangOptions(Object.keys(providerCombinations[selectedSource]))
  }, [providerCombinations, selectedSource, toLangOptions])

  const modeOptions = useMemo(() => {
    if (!selectedSource || !selectedTarget) return []

    const modes = providerCombinations[selectedSource]?.[selectedTarget] ?? []
    const ns = selectedProvider === 'azure_openai' ? 'templates' : 'domains'

    return modes.map((key) => ({
      value: key,
      label: t(`machine_translation.${ns}.${key}`, key),
    }))
  }, [providerCombinations, selectedSource, selectedTarget, selectedProvider, t])

  const providerOptions = providers.map((p) => ({
    value: p.name,
    label: p.label,
  }))

  const translatedText = textJob?.output_text ?? null
  const isTextJobInProgress =
    textJob?.status === 'pending' || textJob?.status === 'processing'
  const isFileJobInProgress =
    fileJobIds.length > 0 &&
    (fileJobs.length === 0 ||
      fileJobs.some((j) => j.status === 'pending' || j.status === 'processing'))

  const onSubmitText = handleSubmit(async (values) => {
    if (!values.text?.trim()) return
    setSubmitError(null)
    setTextJobId(null)
    try {
      const res = await translateText({
        provider: values.provider,
        text: values.text,
        source_language: values.source_language,
        target_language: values.target_language,
        options: {
          ...(values.domain
            ? selectedProvider === 'azure_openai'
              ? { template: values.domain }
              : { domain: values.domain }
            : {}),
        },
      })
      setTextJobId(res.data.id)
    } catch {
      setSubmitError(t('machine_translation.error_translation_failed'))
    }
  })

  const onSubmitFile = handleSubmit(async (values) => {
    if (!selectedFiles) return
    setSubmitError(null)
    setFileJobIds([])

    const promises = map(selectedFiles, async (file) => {
      try {
        const res = await submitFile({
          provider: values.provider,
          file,
          source_language: values.source_language,
          target_language: values.target_language,
          options: {
            ...(values.domain ? { domain: values.domain } : {}),
          },
        })
        return { success: true as const, job_id: res.data.id }
      } catch {
        return { success: false as const }
      }
    })

    const results = await Promise.all(promises)
    const jobIds = results.flatMap((r) => (r.success ? [r.job_id] : []))
    setFileJobIds(jobIds)
  })

  const textStatusLabel = isTextJobInProgress
    ? t(`machine_translation.file_status_${textJob?.status}`)
    : null

  const handleLanguageSwap = useCallback(() => {
    const { source_language, target_language } = getValues()
    setValue('source_language', target_language)
    setValue('target_language', source_language)
  }, [setValue, getValues])

  const handleFormAsOrder = useCallback(() => {
    const { source_language, target_language } = getValues()
    const sourceClassifier = (classifierValues ?? []).find(
      (cv) => first(split(cv.value, '-')) === source_language
    )
    const targetClassifier = (classifierValues ?? []).find(
      (cv) => first(split(cv.value, '-')) === target_language
    )
    navigate('/projects/new-project', {
      state: {
        sourceLanguageId: sourceClassifier?.id,
        targetLanguageId: targetClassifier?.id,
        sourceFiles: selectedFiles,
      },
    })
  }, [getValues, classifierValues, selectedFiles, navigate])

  const handleClearText = useCallback(() => {
    setValue('text', '')
    setTextJobId(null)
  }, [setValue])

  const handleProviderChange = (_value: string | string[]) => {
    setTextJobId(null)
    setFileJobIds([])
    setSubmitError(null)
  }

  useEffect(() => {
    if (!isEmpty(providers)) {
      setValue('provider', providers[0]?.name)
    }
  }, [providers, setValue])

  useEffect(() => {
    if (!supportsFile && mode == 'file') {
      setMode('text')
    }
  }, [supportsFile, mode, setMode])

  // Reset target (and mode) when source changes and current target is no longer valid
  useEffect(() => {
    const validTargets = Object.keys(providerCombinations[selectedSource] ?? {})
    if (getValues('target_language') && !validTargets.includes(getValues('target_language'))) {
      setValue('target_language', '')
      setValue('domain', '')
    }
  }, [selectedSource, providerCombinations, getValues, setValue])

  // Auto-select or reset mode when source+target changes
  useEffect(() => {
    const validModes = providerCombinations[selectedSource]?.[selectedTarget] ?? []
    const currentMode = getValues('domain')
    if (currentMode && !validModes.includes(currentMode)) {
      setValue('domain', validModes[0] ?? '')
    } else if (!currentMode && validModes.length) {
      setValue('domain', validModes[0])
    }
  }, [selectedSource, selectedTarget, providerCombinations, getValues, setValue])

  return (
    <div className={classNames(classes.machineTranslationFormContainer, className)}>
      <Root>

        {/* Language pair */}
        <span>
          Vali keelesuund
        </span>
        <div className={classes.formRow}>
          <Controller
            name="source_language"
            control={control}
            rules={{ required: true }}
            render={({ field, fieldState }) => (
              <SelectionControlsInput
                name="source_language"
                // label={t('machine_translation.source_language_label')}
                ariaLabel={t('machine_translation.source_language_label')}
                placeholder={t(
                  'machine_translation.source_language_placeholder'
                )}
                options={sourceLanguageOptions}
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error}
                dropdownSize={DropdownSizeTypes.WFULL}
                showSearch
                hideTags
              />
            )}
          />

          <Button
            onClick={handleLanguageSwap}
            appearance={AppearanceTypes.Text}
            size={SizeTypes.S}
            icon={SwapHorizontal}
            ariaLabel={t('button.sort')}
            className={classNames(classes.iconButton, classes.langSwapButton)}
          />

          <Controller
            name="target_language"
            control={control}
            rules={{ required: true }}
            render={({ field, fieldState }) => (
              <SelectionControlsInput
                name="target_language"
                disabled={!selectedSource}
                // label={t('machine_translation.target_language_label')}
                ariaLabel={t('machine_translation.target_language_label')}
                placeholder={t(
                  'machine_translation.target_language_placeholder'
                )}
                options={targetLanguageOptions}
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error}
                dropdownSize={DropdownSizeTypes.WFULL}
                showSearch
                hideTags
              />
            )}
          />
        </div>

        {/* Provider selector */}
        <div className={classes.formRow}>
          <div>
            <span>
              {t('machine_translation.provider_label')}
            </span>
            <Controller
              name="provider"
              control={control}
              rules={{ required: true }}
              render={({ field, fieldState }) => (
                <SelectionControlsInput
                  name="provider"
                  // label={t('machine_translation.provider_label')}
                  ariaLabel={t('machine_translation.provider_label')}
                  placeholder={t('machine_translation.provider_placeholder')}
                  options={providerOptions}
                  value={field.value}
                  onChange={(val) => {
                    const provider = providers.find(p => p.name === val)
                    if (provider?.show_confirmation && !sessionStorage.getItem('mt_azure_confirmed')) {
                      setPendingProvider(provider)
                    } else {
                      field.onChange(val)
                      handleProviderChange(val as string)
                    }
                  }}
                  error={fieldState.error}
                  loading={providersLoading}
                  hideTags
                />
              )}
            />
          </div>


          {/* Domain / template — shown once source+target are both selected */}
          <div>
            <span>
              {selectedProvider === 'azure_openai'
                ? t('machine_translation.template_label')
                : t('machine_translation.domain_label')}
            </span>
            <Controller
              name="domain"
              control={control}
              rules={{ required: true }}
              render={({ field, fieldState }) => (
                <SelectionControlsInput
                  disabled={modeOptions.length == 0}
                  name="domain"
                  ariaLabel={
                    selectedProvider === 'azure_openai'
                      ? t('machine_translation.template_label')
                      : t('machine_translation.domain_label')
                  }
                  placeholder={
                    selectedProvider === 'azure_openai'
                      ? t('machine_translation.template_placeholder')
                      : t('machine_translation.domain_placeholder')
                  }
                  options={modeOptions}
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error}
                  loading={optionsLoading}
                  hideTags
                />
              )}
            />
          </div>

          {/* Mode toggle (only for providers that support files) */}
          {selectedProvider && supportsFile && (
            <div className={classes.modeToggle}>
              <button
                type="button"
                className={classNames(classes.modeBtn, mode === 'text' ? classes.activeMode : '')}
                onClick={() => setMode('text')}
              >
                {t('machine_translation.mode_text')}
              </button>
              <button
                type="button"
                className={classNames(classes.modeBtn, mode === 'file' ? classes.activeMode : '')}
                onClick={() => setMode('file')}
              >
                {t('machine_translation.mode_file')}
              </button>
            </div>
          )}

          <div className={classes.translateButtonContainer}>
            {/* Text mode: submit for translation */}
            {selectedProvider && mode === 'text' && (
              <Button
                appearance={AppearanceTypes.Primary}
                size={SizeTypes.M}
                onClick={onSubmitText}
                disabled={isTranslatingText || isTextJobInProgress}
                loading={isTranslatingText || isTextJobInProgress}
              >
                {t('machine_translation.translate_button')}
              </Button>
            )}

            {/* File mode: submit for translation */}
            {selectedProvider && mode === 'file' && (
              <Button
                appearance={AppearanceTypes.Primary}
                size={SizeTypes.M}
                onClick={onSubmitFile}
                disabled={!selectedFiles.length || isSubmittingFile || fileLimitExceeded || isFileJobInProgress}
                loading={isSubmittingFile || isFileJobInProgress}
              >
                {t('machine_translation.translate_button')}
              </Button>
            )}
          </div>
        </div>



        {/* Text mode */}
        {selectedProvider && mode === 'text' && (
          <div className={classes.textSection}>
            <div className={classes.formRow}>
              <div className={classes.textAreaWrapper}>
                <label className={classes.label}>
                  {t('machine_translation.text_input_label')}
                </label>
                <div className={classes.textareaContainer}>
                  <Controller
                    name="text"
                    control={control}
                    render={({ field }) => (
                      <>
                        <textarea
                          {...field}
                          className={classes.textarea}
                          placeholder={t(
                            'machine_translation.text_input_placeholder'
                          )}
                          rows={20}
                          maxLength={SOURCE_TEXT_MAX_LENGTH}
                        />
                        <span className={classes.charCounter}>
                          {(field.value ?? '').length}/{SOURCE_TEXT_MAX_LENGTH}
                        </span>
                      </>
                    )}
                  />
                  <Button
                    appearance={AppearanceTypes.Text}
                    size={SizeTypes.S}
                    icon={CloseIcon}
                    ariaLabel={t('button.clear_filter')}
                    className={classNames(classes.iconButton, classes.textareaOverlayButton)}
                    onClick={handleClearText}
                  />
                </div>
              </div>

              <div className={classes.textAreaWrapper}>
                <label className={classes.label}>
                  {t('machine_translation.text_result_label')}
                </label>
                <div className={classes.textareaContainer}>
                  <textarea
                    className={classNames(classes.textarea, classes.resultTextarea)}
                    value={translatedText || ""}
                    readOnly
                    rows={20}
                  />
                  <Button
                    appearance={AppearanceTypes.Text}
                    size={SizeTypes.S}
                    icon={CopyIcon}
                    ariaLabel={t('button.copy')}
                    className={classNames(classes.iconButton, classes.textareaOverlayButton)}
                    disabled={!translatedText}
                    onClick={() => {
                      if (translatedText) navigator.clipboard.writeText(translatedText)
                    }}
                  />
                </div>
              </div>
            </div>

            {textJob?.status === 'failed' && (
              <span className={classes.errorText}>
                {t('machine_translation.error_translation_failed')}
              </span>
            )}
          </div>
        )}

        {/* File mode */}
        {selectedProvider && mode === 'file' && (
          <div className={classes.fileSection}>
            <div className={classes.formRow}>
              <FileImport
                className={classes.fileImport}
                listContainerClassName={classes.fileImportListContainer}
                fileButtonText={t('machine_translation.file_upload_button')}
                fileButtonChangeText={t('machine_translation.file_upload_change')}
                allowMultiple={true}
                files={selectedFiles}
                inputFileTypes={ProjectFileTypes}
                error={fileLimitExceeded ? t('machine_translation.error_too_many_files') : undefined}
                onChange={(files) => {
                  setselectedFiles(sortBy(files, 'name'))
                }}
              />

              {!isEmpty(selectedFiles) && (
                <div className={classes.fileTranslationJobsContainer}>
                  <Button
                    className={classes.formAsOrderButton}
                    disabled={isEmpty(sortedFileJobs) || isFileJobInProgress}
                    onClick={handleFormAsOrder}
                  >
                    Vormista tellimuseks
                  </Button>

                  <h5>
                    {t('label.translated_files')}
                  </h5>

                  <div className={classes.fileTranslationJobs}>
                    {sortedFileJobs.map((fileJob) => (
                      <div key={fileJob.id} className={classes.fileStatus}>
                        <span>
                          {fileJob.original_filename}
                        </span>
                        <span
                          className={classNames(classes.statusBadge, classes[`status_${fileJob.status}`])}
                        >
                          {t(`machine_translation.file_status_${fileJob.status}`)}
                        </span>

                        {fileJob.status === 'completed' && (
                          <a
                            href={endpoints.MT_FILE_DOWNLOAD(fileJob.id)}
                            download={`translated_${fileJob.original_filename}`}
                          >
                            <Button
                              appearance={AppearanceTypes.Secondary}
                              size={SizeTypes.M}
                              icon={DownloadIcon}
                             />
                          </a>
                        )}

                        {fileJob.status === 'failed' && fileJob.original_filename && (
                          <span className={classes.errorText}>
                            {t('machine_translation.error_translation_failed')}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Generic error */}
        {submitError && (
          <p className={classes.errorText}>{submitError}</p>
        )}

      </Root>

      <ConfirmationModalBase
        isModalOpen={pendingProvider !== null}
        title={t('machine_translation.usage_confirm_title', { provider_name: pendingProvider?.label })}
        modalContent={t('machine_translation.usage_confirm_description')}
        cancelButtonContent={t('machine_translation.usage_confirm_cancel')}
        proceedButtonContent={t('machine_translation.usage_confirm_proceed')}
        closeModal={() => setPendingProvider(null)}
        handleCancel={() => setPendingProvider(null)}
        handleProceed={() => {
          if (pendingProvider) {
            sessionStorage.setItem('mt_azure_confirmed', 'true')
            setValue('provider', pendingProvider.name)
            handleProviderChange(pendingProvider.name)
          }
          setPendingProvider(null)
        }}
      />
    </div>
  )
}

export default MachineTranslationForm
