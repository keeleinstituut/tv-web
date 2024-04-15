import { FC, useCallback, useMemo, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import { useAuth } from 'components/contexts/AuthContext'
import Container from 'components/atoms/Container/Container'
import PersonSection, {
  PersonSectionTypes,
} from 'components/molecules/PersonSection/PersonSection'
import DetailsSection from 'components/molecules/DetailsSection/DetailsSection'
import ProjectFilesSection from 'components/molecules/ProjectFilesSection/ProjectFilesSection'
import { FieldPath, SubmitHandler, useForm } from 'react-hook-form'
import { useCreateProject, useUpdateProject } from 'hooks/requests/useProjects'
import {
  join,
  map,
  includes,
  isEmpty,
  pick,
  keys,
  compact,
  find,
  split,
  toNumber,
} from 'lodash'
import { getUtcDateStringFromLocalDateObject } from 'helpers'
import {
  NewProjectPayload,
  SourceFile,
  ProjectStatus,
  ProjectDetail,
} from 'types/projects'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import ProjectStatusTag from 'components/molecules/ProjectStatusTag/ProjectStatusTag'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { useNavigate } from 'react-router-dom'
import { ValidationError } from 'api/errorHandler'
import { Root } from '@radix-ui/react-form'
import ExpandableContentContainer from 'components/molecules/ExpandableContentContainer/ExpandableContentContainer'
import { Privileges } from 'types/privileges'
import { useClassifierValuesFetch } from 'hooks/requests/useClassifierValues'
import { ClassifierValueType } from 'types/classifierValues'
import { getProjectDefaultValues, mapFilesForApi } from 'helpers/project'
import { HelperFileTypes } from 'types/classifierValues'
import { useHandleBulkFiles, CollectionType } from 'hooks/requests/useFiles'
import ProjectFormButtons from 'components/molecules/ProjectFormButtons/ProjectFormButtons'

import classes from './classes.module.scss'
import { AxiosError } from 'axios'

export enum ProjectDetailModes {
  New = 'new',
  Editable = 'editable',
  View = 'view',
}

interface FormValues {
  deadline_at: { date?: string; time?: string }
  type_classifier_value_id: string
  client_institution_user_id: string
  manager_institution_user_id: string
  reference_number?: string
  source_language_classifier_value_id: string
  destination_language_classifier_value_ids: string[]
  source_files: (File | SourceFile | undefined)[]
  help_files: (File | SourceFile | undefined)[]
  help_file_types: HelperFileTypes[]
  translation_domain_classifier_value_id: string
  event_start_at?: { date?: string; time?: string }
  comments?: string
  ext_id?: string
  tags?: string[]
}

interface ProjectDetailsProps {
  mode?: ProjectDetailModes
  project?: ProjectDetail
  className?: string
}

const ProjectDetails: FC<ProjectDetailsProps> = ({
  mode,
  project,
  className,
}) => {
  const {
    workflow_started,
    id,
    status = ProjectStatus.Registered,
    help_files,
    source_files,
    client_institution_user,
    manager_institution_user,
  } = project || {}

  const { t } = useTranslation()
  const { institutionUserId, userPrivileges } = useAuth()
  const { createProject, isLoading } = useCreateProject()
  const { updateProject, isLoading: isUpdatingProject } = useUpdateProject({
    id,
  })

  const {
    deleteBulkFiles,
    addBulkFiles,
    updateBulkFiles,
    isAddLoading,
    isDeleteLoading,
    isUpdateLoading,
  } = useHandleBulkFiles({
    reference_object_id: project?.id ?? '',
    reference_object_type: 'project',
  })

  const isSubmitLoading =
    isAddLoading ||
    isDeleteLoading ||
    isUpdatingProject ||
    isLoading ||
    isUpdateLoading

  const navigate = useNavigate()
  const isNew = mode === ProjectDetailModes.New
  const { classifierValues: domainValues } = useClassifierValuesFetch({
    type: ClassifierValueType.TranslationDomain,
  })
  const { classifierValues: projectTypes } = useClassifierValuesFetch({
    type: ClassifierValueType.ProjectType,
  })

  const defaultDomainClassifier = find(domainValues, { value: 'ASP' })
  const defaultProjectTypeClassifier = find(projectTypes, {
    value: 'TRANSLATION',
  })

  const [isEditEnabled, setIsEditEnabled] = useState(isNew)

  const defaultValues = useMemo(
    () =>
      getProjectDefaultValues({
        institutionUserId,
        isNew,
        project,
        defaultDomainClassifier,
        defaultProjectTypeClassifier,
      }),
    [
      defaultDomainClassifier,
      defaultProjectTypeClassifier,
      institutionUserId,
      isNew,
      project,
    ]
  )

  const {
    control,
    watch,
    handleSubmit,
    reset,
    formState: { isSubmitting, isValid, dirtyFields },
    setError,
  } = useForm<FormValues>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: defaultValues,
  })

  const isDirty = !isEmpty(dirtyFields)

  const { client_institution_user_id, manager_institution_user_id } = watch()

  // Privilege checks
  const hasManagerPrivilege = includes(userPrivileges, Privileges.ManageProject)
  const isUserClientOfProject = client_institution_user_id === institutionUserId

  const isManagerEditable = isNew || hasManagerPrivilege
  const isClientEditable =
    (isUserClientOfProject || hasManagerPrivilege) &&
    includes(userPrivileges, Privileges.ChangeClient)
  const isRestEditable = isNew || hasManagerPrivilege

  const isSomethingEditable =
    status !== ProjectStatus.Accepted &&
    (isManagerEditable || isClientEditable || isRestEditable)

  // Validation errors
  const mapProjectValidationErrors = useCallback(
    (errorData: ValidationError) => {
      if (errorData.errors) {
        map(errorData.errors, (errorsArray, key) => {
          const typedKey = key as FieldPath<FormValues>
          const errorString = join(errorsArray, ',')
          setError(typedKey, {
            type: 'backend',
            message: errorString,
          })
        })
      }
    },
    [setError]
  )

  const mapProjectNewFilesErrors = useCallback(
    (
      errorData: ValidationError,
      newFiles?: {
        file: SourceFile | File
        collection: CollectionType
        originalIndex: number
      }[]
    ) => {
      if (errorData.errors) {
        map(errorData.errors, (errorsArray, key) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const [_, index, __] = split(key, '.')
          const indexAsANumber = toNumber(index)
          const matchingFile = newFiles?.[indexAsANumber]
          const errorString = join(errorsArray, ',')
          if (matchingFile && matchingFile.collection === CollectionType.Help) {
            setError(`help_files.${matchingFile?.originalIndex}`, {
              type: 'backend',
              message: errorString,
            })
          }
          if (
            matchingFile &&
            matchingFile.collection === CollectionType.Source
          ) {
            setError(`source_files.${matchingFile?.originalIndex}`, {
              type: 'backend',
              message: errorString,
            })
          }
        })
      }
    },
    [setError]
  )

  const handleNewProjectSubmit = useCallback(
    async (payload: NewProjectPayload) => {
      try {
        const createdProject = await createProject(payload)
        showNotification({
          type: NotificationTypes.Success,
          title: t('notification.announcement'),
          content: t('success.project_created'),
        })
        navigate(`/projects/${createdProject?.data?.id}`)
      } catch (errorData) {
        const typedErrorData = errorData as ValidationError
        mapProjectValidationErrors(typedErrorData)
      }
    },
    [createProject, mapProjectValidationErrors, navigate, t]
  )

  const resetForm = useCallback(() => {
    reset(defaultValues)
  }, [reset, defaultValues])

  useEffect(() => {
    reset(defaultValues)
    // Only run when defaultValues change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues])

  const handleUpdateProjectSubmit = useCallback(
    async (payload: NewProjectPayload) => {
      const {
        help_files: newHelpFiles,
        help_file_types,
        source_files: newSourceFiles,
        ...rest
      } = payload
      const actualPayload = pick(rest, keys(dirtyFields))

      const { newFiles, deletedFiles, updatedFiles } = mapFilesForApi({
        previousHelpFiles: help_files,
        previousSourceFiles: source_files,
        help_files: newHelpFiles,
        help_file_types,
        source_files: newSourceFiles,
      })

      if (!isEmpty(newFiles)) {
        try {
          await addBulkFiles(newFiles)
        } catch (error) {
          const typedError = error as AxiosError
          const errors = typedError?.response?.data as ValidationError

          mapProjectNewFilesErrors(errors, newFiles)
          return
          // Handle file adding errors
        }
      }

      try {
        if (!isEmpty(actualPayload)) {
          await updateProject(actualPayload)
        }

        if (!isEmpty(deletedFiles)) {
          await deleteBulkFiles(deletedFiles)
        }

        if (!isEmpty(updatedFiles)) {
          await updateBulkFiles(updatedFiles)
        }
        showNotification({
          type: NotificationTypes.Success,
          title: t('notification.announcement'),
          content: t('success.project_updated'),
        })
        setIsEditEnabled(false)
      } catch (errorData) {
        const typedErrorData = errorData as ValidationError
        mapProjectValidationErrors(typedErrorData)
      }
    },
    [
      dirtyFields,
      help_files,
      source_files,
      addBulkFiles,
      mapProjectNewFilesErrors,
      deleteBulkFiles,
      updateBulkFiles,
      t,
      updateProject,
      mapProjectValidationErrors,
    ]
  )

  const onSubmit: SubmitHandler<FormValues> = useCallback(
    async ({
      deadline_at: deadlineObject,
      event_start_at: startObject,
      source_files,
      help_files,
      tags,
      ext_id,
      ...rest
    }) => {
      const deadline_at = getUtcDateStringFromLocalDateObject(deadlineObject)
      const event_start_at =
        startObject?.date || startObject?.time
          ? getUtcDateStringFromLocalDateObject(startObject)
          : null

      const payload: NewProjectPayload = {
        deadline_at,
        source_files: compact(source_files),
        help_files: compact(help_files),
        ...rest,
        ...(!isNew ? { tags } : {}),
        ...(event_start_at ? { event_start_at } : {}),
      }

      if (isNew) {
        handleNewProjectSubmit(payload)
      } else {
        handleUpdateProjectSubmit(payload)
      }
    },
    [handleNewProjectSubmit, handleUpdateProjectSubmit, isNew]
  )

  const formButtonsProps = useMemo(
    () => ({
      onSubmit: handleSubmit(onSubmit),
      resetForm,
      isNew,
      isEditEnabled,
      setIsEditEnabled,
      isSubmitting,
      isLoading: isSubmitLoading,
      isValid,
      isDirty,
      className: classes.formButtons,
    }),
    [
      handleSubmit,
      isEditEnabled,
      isSubmitLoading,
      isNew,
      isSubmitting,
      isDirty,
      isValid,
      onSubmit,
      resetForm,
    ]
  )

  return (
    <ExpandableContentContainer
      hidden={isNew}
      contentAlwaysVisible={isNew}
      rightComponent={<ProjectStatusTag status={status} />}
      leftComponent={
        <h2 className={classes.expandableContentTitle}>
          {t('projects.project_details_expandable')}
        </h2>
      }
      className={className}
    >
      <Root
        className={classNames(
          classes.wrapper,
          !isNew && classes.existingProjectWrapper,
          !isEditEnabled && classes.viewModeWrapper
        )}
      >
        <Container className={classNames(classes.peopleContainer)}>
          <PersonSection
            type={PersonSectionTypes.Client}
            control={control}
            selectedUser={client_institution_user}
            selectedUserId={client_institution_user_id}
            isEditable={isClientEditable && isEditEnabled}
          />
          <PersonSection
            type={PersonSectionTypes.Manager}
            control={control}
            selectedUserId={manager_institution_user_id}
            selectedUser={manager_institution_user}
            isEditable={isManagerEditable && isEditEnabled}
          />
        </Container>
        <Container className={classNames(classes.detailsContainer)}>
          <DetailsSection
            control={control}
            isNew={isNew}
            isEditable={isRestEditable && isEditEnabled}
            workflow_started={workflow_started}
          />
          <ProjectFilesSection
            projectId={id}
            control={control}
            isEditable={isRestEditable && isEditEnabled}
          />
          <ProjectFormButtons
            {...formButtonsProps}
            hidden={
              isNew || !isSomethingEditable || mode === ProjectDetailModes.View
            }
          />
        </Container>
        <ProjectFormButtons
          {...formButtonsProps}
          hidden={!isNew || !isSomethingEditable}
        />
      </Root>
    </ExpandableContentContainer>
  )
}

export default ProjectDetails
