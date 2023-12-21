import { getLocalDateOjectFromUtcDateString } from 'helpers'
import { filter, find, isEmpty, map, uniq, compact } from 'lodash'
import { ProjectDetail, SourceFile } from 'types/projects'

import dayjs from 'dayjs'
import { ClassifierValue, HelperFileTypes } from 'types/classifierValues'
import { CollectionType } from 'hooks/requests/useFiles'

export const getProjectDefaultValues = ({
  institutionUserId,
  isNew,
  project,
  defaultDomainClassifier,
  defaultProjectTypeClassifier,
}: {
  institutionUserId: string
  isNew: boolean
  project?: ProjectDetail
  defaultDomainClassifier?: ClassifierValue
  defaultProjectTypeClassifier?: ClassifierValue
}) => {
  const {
    deadline_at,
    event_start_at,
    type_classifier_value,
    client_institution_user,
    manager_institution_user,
    reference_number = '',
    source_files,
    help_files,
    review_files,
    translation_domain_classifier_value,
    comments = '',
    ext_id = '',
    sub_projects,
    accepted_at = '',
    corrected_at = '',
    rejected_at = '',
    cancelled_at = '',
    created_at = '',
    tags = [],
  } = project || {}
  const source_language_classifier_value_id =
    sub_projects?.[0]?.source_language_classifier_value_id || ''
  const destination_language_classifier_value_ids =
    uniq(map(sub_projects, 'destination_language_classifier_value_id')) || []

  const help_file_types = map(
    help_files,
    ({ custom_properties }) => custom_properties?.type
  )

  return {
    type_classifier_value_id:
      type_classifier_value?.id || defaultProjectTypeClassifier?.id,
    client_institution_user_id: isNew
      ? institutionUserId
      : client_institution_user?.id,
    manager_institution_user_id: manager_institution_user?.id,
    reference_number,
    source_files: isNew ? [] : source_files,
    help_files: isNew ? [] : help_files,
    review_files: isNew ? [] : review_files,
    ext_id,
    deadline_at: deadline_at
      ? getLocalDateOjectFromUtcDateString(deadline_at)
      : { date: '', time: '23:59:59' },
    event_start_at: event_start_at
      ? getLocalDateOjectFromUtcDateString(event_start_at)
      : { date: '', time: '' },
    source_language_classifier_value_id,
    destination_language_classifier_value_ids,
    help_file_types,
    translation_domain_classifier_value_id:
      translation_domain_classifier_value?.id || defaultDomainClassifier?.id,
    comments,
    tags: map(tags, 'id'),
    accepted_at: accepted_at ? dayjs(accepted_at).format('DD.MM.YYYY') : '',
    corrected_at: corrected_at ? dayjs(corrected_at).format('DD.MM.YYYY') : '',
    rejected_at: rejected_at ? dayjs(rejected_at).format('DD.MM.YYYY') : '',
    cancelled_at: cancelled_at ? dayjs(cancelled_at).format('DD.MM.YYYY') : '',
    created_at: created_at ? dayjs(created_at).format('DD.MM.YYYY') : '',
  }
}

export const mapFilesForApi = ({
  previousHelpFiles,
  previousSourceFiles,
  help_files,
  help_file_types,
  source_files,
}: {
  previousHelpFiles?: SourceFile[]
  previousSourceFiles?: SourceFile[]
  help_files?: (File | SourceFile)[]
  help_file_types?: HelperFileTypes[]
  source_files?: (File | SourceFile)[]
}) => {
  // 1. Get deleted files

  // 1.1. Check for files that existed before, but don't anymore

  const deletedHelpFiles = isEmpty(previousHelpFiles)
    ? []
    : filter(previousHelpFiles, ({ id }) => {
        const fileStillExists = find(
          help_files,
          (existingHelpFile) => id === (existingHelpFile as SourceFile)?.id
        )
        return !fileStillExists
      })

  const deletedSourceFiles = isEmpty(previousSourceFiles)
    ? []
    : filter(previousSourceFiles, ({ id }) => {
        const fileStillExists = find(
          source_files,
          (existingHelpFile) => id === (existingHelpFile as SourceFile)?.id
        )
        return !fileStillExists
      })

  // 1.2. Add correct collection to deleted files
  const deletedSourceFilesWithCollection = map(deletedSourceFiles, (file) => ({
    file,
    collection: CollectionType.Source,
  }))
  const deletedHelpFilesWithCollection = map(deletedHelpFiles, (file) => ({
    file,
    collection: CollectionType.Help,
  }))

  // 1.3. Combine deleted files

  const deletedFiles = compact([
    ...deletedSourceFilesWithCollection,
    ...deletedHelpFilesWithCollection,
  ])

  // 2. Get all new files

  // 2.1. Attach type and collection to all help files

  const helpFilesWithType = map(help_files, (file, index) => {
    const typeForThisFile = help_file_types?.[index]
    return {
      file,
      collection: CollectionType.Help,
      ...(typeForThisFile
        ? {
            help_file_type: typeForThisFile,
          }
        : {}),
    }
  })

  // 2.2. Collect all new files by checking for missing 'id' field

  const newSourceFiles = filter(
    source_files,
    (newSourceFile) => !('id' in newSourceFile)
  )

  const newHelpFiles = filter(
    helpFilesWithType,
    (newHelpFile) => !('id' in newHelpFile?.file)
  )

  // 2.3. Add collection to new source files

  const newSourceFilesWithCollection = map(newSourceFiles, (file) => ({
    file,
    collection: CollectionType.Source,
  }))

  // 2.4. Combine new files

  const newFiles = compact([...newHelpFiles, ...newSourceFilesWithCollection])

  // 3. Get updated help files

  const updatedFiles = compact(
    filter(helpFilesWithType, ({ file, help_file_type }) => {
      const previousHelpFile = find(previousHelpFiles, {
        id: (file as SourceFile)?.id,
      })
      if (!previousHelpFile) return false
      return previousHelpFile?.custom_properties?.type !== help_file_type
    })
  )

  // 4. return everything

  return {
    deletedFiles,
    newFiles,
    updatedFiles,
  }
}
