import Tabs from 'components/molecules/Tabs/Tabs'
import {
  sortBy,
  compact,
  map,
  uniqBy,
  findIndex,
  isEmpty,
  groupBy,
  flatMap,
  filter,
} from 'lodash'
import { FC, useCallback, useMemo, useState } from 'react'
import { ReactComponent as DownloadFilled } from 'assets/icons/download_filled.svg'
import Feature from 'components/organisms/features/Feature'
import { SourceFile, SubProjectFeatures } from 'types/projects'
import { useTranslation } from 'react-i18next'
import { TabStyle } from 'components/molecules/Tab/Tab'

import classes from './classes.module.scss'
import { useSubProjectCache } from 'hooks/requests/useProjects'
import { ClassifierValue } from 'types/classifierValues'
import DataTable, {
  TableSizeTypes,
} from 'components/organisms/DataTable/DataTable'
import { useHandleFiles, CollectionType } from 'hooks/requests/useFiles'
import dayjs from 'dayjs'
import { ColumnDef, createColumnHelper } from '@tanstack/react-table'
import BaseButton from 'components/atoms/BaseButton/BaseButton'
import classNames from 'classnames'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import { AssignmentType } from 'types/assignments'

interface FilesSectionProps {
  id?: string
  files?: SourceFile[]
}

interface FileRow {
  name: string
  created_at: string
  download_button: number
}

interface AssignmentsSectionProps {
  assignments?: AssignmentType[]
}

interface RowProps {
  label?: string
  value?: string
  hidden?: boolean
}

const Row: FC<RowProps> = ({ label, value, hidden }) => {
  if (hidden) return null
  return (
    <div className={classes.row}>
      <span className={classes.label}>{label}</span>
      <span className={classes.value}>{value || '-'}</span>
    </div>
  )
}

const columnHelper = createColumnHelper<FileRow>()

const AssignmentsSection: FC<AssignmentsSectionProps> = ({ assignments }) => {
  const { t } = useTranslation()
  if (isEmpty(assignments)) return null
  const groupedAssignments = groupBy(assignments, 'job_definition.job_key')

  const assignmentsInfo = flatMap(groupedAssignments, (assignmentsByKey) =>
    map(
      assignmentsByKey,
      ({ job_definition, assignee, assignee_comments }, index) => ({
        title: `${t('task.vendor_title', { number: index + 1 })} (${
          job_definition?.job_short_name
        })`,
        institution_user: assignee?.institution_user,
        assignee_comments,
      })
    )
  )
  return (
    <div className={classes.assignmentsContainer}>
      {map(
        assignmentsInfo,
        ({ title, institution_user, assignee_comments }) => {
          const { user, email, phone } = institution_user || {}
          const fullName = user ? `${user?.forename} ${user?.surname}` : ''

          return (
            <div className={classes.assignmentContainer} key={title}>
              <h3>{title}</h3>
              <Row label={t('label.name')} value={fullName} />
              <Row label={t('label.phone')} value={phone} />
              <Row label={t('label.email')} value={email} />
              <Row
                label={t('label.assignee_comments')}
                value={assignee_comments}
                hidden={!assignee_comments}
              />
            </div>
          )
        }
      )}
    </div>
  )
}

const FilesSection: FC<FilesSectionProps> = ({ files, id }) => {
  const { t } = useTranslation()
  const { downloadFile } = useHandleFiles({
    reference_object_id: id || '',
    reference_object_type: 'subproject',
    collection: CollectionType.Source,
  })

  const handleDownload = useCallback(
    (index: number) => {
      if (files?.[index]) {
        downloadFile(files?.[index])
      }
    },
    [downloadFile, files]
  )

  const handleDownloadAll = useCallback(async () => {
    await Promise.allSettled(map(files, (file) => downloadFile(file)))
  }, [downloadFile, files])

  const filesData = useMemo(
    () =>
      map(files, (file, index) => ({
        name: file.name,
        created_at:
          'created_at' in file
            ? dayjs(file?.created_at).format('DD.MM.YYYY HH:mm')
            : '',
        download_button: index,
        // TODO: feature missing, not sure what field value will be or where it comes from
        feature: SubProjectFeatures.JobRevision,
      })),
    [files]
  )

  const columns = [
    columnHelper.accessor('name', {
      header: () => t('label.file_name'),
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('created_at', {
      header: () => t('label.added_at'),
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('download_button', {
      header: '',
      cell: ({ getValue }) => (
        <BaseButton
          className={classes.iconButton}
          onClick={() => handleDownload(getValue())}
          aria-label={t('button.download')}
        >
          <DownloadFilled />
        </BaseButton>
      ),
      footer: (info) => info.column.id,
    }),
  ] as ColumnDef<FileRow>[]

  if (isEmpty(files)) return null

  return (
    <DataTable
      data={filesData}
      columns={columns}
      tableSize={TableSizeTypes.M}
      className={classNames(
        classes.filesListContainer,
        classes.increasedSpecificity
      )}
      hidePagination
      headComponent={
        <div className={classes.titleRow}>
          <h3>{t('projects.ready_files_from_vendors')}</h3>
          <Button
            appearance={AppearanceTypes.Text}
            className={classes.downloadAllButton}
            icon={DownloadFilled}
            children={t('button.download_all')}
            onClick={handleDownloadAll}
          />
        </div>
      }
    />
  )
}

const orderMapping: {
  job_translation: number
  job_revision: number
  job_overview: number
  [key: string]: number
} = {
  job_translation: 1,
  job_revision: 2,
  job_overview: 3,
}

interface ClientContentProps {
  id?: string
}

const ClientContent: FC<ClientContentProps> = ({ id }) => {
  const subProject = useSubProjectCache(id)
  const { assignments, final_files } = subProject || {}

  return (
    <div className={classes.clientContentContainer}>
      <AssignmentsSection assignments={assignments} />
      <FilesSection
        files={filter(final_files, 'is_project_final_file')}
        id={id}
      />
    </div>
  )
}

interface ManagerContentProps {
  id?: string
  projectDomain?: ClassifierValue
}

interface SubProjectSectionContentProps extends ManagerContentProps {
  isClientView?: boolean
}

const ManagerContent: FC<ManagerContentProps> = ({ id, projectDomain }) => {
  const { t } = useTranslation()

  const [activeTab, setActiveTab] = useState<string | undefined>(
    SubProjectFeatures.GeneralInformation
  )
  const subProject = useSubProjectCache(id)

  const tabs = map(subProject?.assignments, ({ job_definition }) => {
    return {
      id: job_definition?.id,
      job_key: job_definition?.job_key,
      cat_tool_enabled: job_definition?.linking_with_cat_tool_jobs_enabled,
    }
  })

  const uniqueAssignments = uniqBy(tabs, 'id')

  const availableTabs = compact(
    map(uniqueAssignments, (feature) => {
      if (feature) {
        const catToolName = feature.cat_tool_enabled ? '(CAT)' : ''
        return {
          key: feature.id,
          id: feature.job_key,
          name: `${t(`projects.features.${feature.job_key}`)}${catToolName}`,
        }
      }
    })
  )

  const sortedAvailableTabs = sortBy(
    availableTabs,
    (tab) => orderMapping[tab.id]
  )

  const allTabs = [
    {
      id: 'general_information',
      name: t('projects.features.general_information'),
    },
    ...sortedAvailableTabs,
  ]
  return (
    <>
      <Tabs
        setActiveTab={setActiveTab}
        activeTab={activeTab}
        tabs={allTabs}
        tabStyle={TabStyle.Primary}
        className={classes.tabsContainer}
        addDisabled
        editDisabled
      />

      <Feature
        subProject={subProject}
        projectDomain={projectDomain}
        feature={activeTab as SubProjectFeatures}
        index={findIndex(allTabs, (tab) => {
          return tab.id === activeTab
        })}
      />
    </>
  )
}

const SubProjectSectionContent: FC<SubProjectSectionContentProps> = ({
  isClientView,
  ...rest
}) => {
  if (isClientView) {
    return <ClientContent id={rest?.id} />
  }
  return <ManagerContent {...rest} />
}

export default SubProjectSectionContent
