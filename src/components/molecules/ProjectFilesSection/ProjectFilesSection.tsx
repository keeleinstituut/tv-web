import { useTranslation } from 'react-i18next'
import { map } from 'lodash'
import { Control, FieldValues } from 'react-hook-form'
import ProjectFilesList from 'components/molecules/ProjectFilesList/ProjectFilesList'
import { HelperFileTypes } from 'types/classifierValues'

interface ProjectFilesSectionProps<TFormValues extends FieldValues> {
  control: Control<TFormValues>
  isEditable?: boolean
  projectId?: string
}

const ProjectFilesSection = <TFormValues extends FieldValues>({
  control,
  isEditable,
  projectId,
}: ProjectFilesSectionProps<TFormValues>) => {
  const { t } = useTranslation()
  const fileTypeFilters = map(HelperFileTypes, (filterValue) => ({
    value: filterValue,
    label: t(`projects.file_types.${filterValue}`),
  }))

  return (
    <div>
      <h2>{isEditable ? '' : t('projects.files')}</h2>
      <ProjectFilesList
        projectId={projectId}
        name="source_files"
        title={t('projects.source_files')}
        tooltipContent={t('tooltip.file_format_helper')}
        control={control}
        isEditable={isEditable}
      />
      <ProjectFilesList
        projectId={projectId}
        title={t('projects.help_files')}
        control={control}
        name="help_files"
        typeOptions={fileTypeFilters}
        isEditable={isEditable}
      />
      {/* TODO: currently not sure where these come from */}
      <ProjectFilesList
        projectId={projectId}
        title={t('projects.feedback_files')}
        control={control}
        name="feedback_files"
        typeOptions={fileTypeFilters}
        hiddenIfNoValue
        isEditable={isEditable}
      />
    </div>
  )
}

export default ProjectFilesSection
