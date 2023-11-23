import { useState, FC, PropsWithChildren, useCallback, useEffect } from 'react'
import classes from './classes.module.scss'
import {
  useFetchSubProject,
  useSubProjectWorkflow,
} from 'hooks/requests/useProjects'
import Tag from 'components/atoms/Tag/Tag'
import Loader from 'components/atoms/Loader/Loader'
import Tabs from 'components/molecules/Tabs/Tabs'
import Feature from 'components/organisms/features/Feature'
import {
  compact,
  includes,
  map,
  toLower,
  find,
  findIndex,
  uniqBy,
  sortBy,
  isEmpty,
} from 'lodash'
import { ListSubProjectDetail, SubProjectFeatures } from 'types/projects'
import { useTranslation } from 'react-i18next'
import ExpandableContentContainer from 'components/molecules/ExpandableContentContainer/ExpandableContentContainer'
import classNames from 'classnames'
import ProjectStatusTag from 'components/molecules/ProjectStatusTag/ProjectStatusTag'
import dayjs from 'dayjs'
import Notification, {
  NotificationTypes,
} from 'components/molecules/Notification/Notification'
import { TabStyle } from 'components/molecules/Tab/Tab'
import useHashState from 'hooks/useHashState'
import Button from 'components/molecules/Button/Button'
import { showValidationErrorMessage } from 'api/errorHandler'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { ClassifierValue } from 'types/classifierValues'
import useAuth from 'hooks/useAuth'

interface ColumnProps {
  label?: string
}

const Column: FC<PropsWithChildren<ColumnProps>> = ({ label, children }) => (
  <div className={classes.column}>
    <span className={classes.label}>{label}</span>
    {children}
  </div>
)

interface LeftComponentProps {
  languageDirection?: string
  ext_id: string
  price?: string
  deadline_at?: string
  isTaskView?: boolean
}

export const LeftComponent: FC<LeftComponentProps> = ({
  languageDirection,
  ext_id,
  price,
  deadline_at,
  isTaskView,
}) => {
  const { t } = useTranslation()

  return (
    <>
      <Column label={t('label.language_direction')}>
        <Tag label={languageDirection || '-'} value />
      </Column>
      <Column
        label={
          isTaskView ? t('my_tasks.assignment_id') : t('label.sub_project_id')
        }
      >
        <span className={classes.valueText}>{ext_id}</span>
      </Column>
      <Column label={t('label.cost')}>
        <span className={classes.boldValueText}>
          {price ? `${price}€` : '-'}
        </span>
      </Column>
      <Column label={t('label.deadline_at')}>
        <span className={classes.valueText}>
          {deadline_at ? dayjs(deadline_at).format('DD.MM.YYYY HH:mm') : '-'}
        </span>
      </Column>
    </>
  )
}

type SubProjectProps = Pick<
  ListSubProjectDetail,
  | 'id'
  | 'ext_id'
  | 'source_language_classifier_value'
  | 'destination_language_classifier_value'
  | 'price'
  | 'status'
  | 'deadline_at'
  | 'active_job_definition'
> & {
  projectDomain?: ClassifierValue
  projectId?: string
}

const SubProjectSection: FC<SubProjectProps> = ({
  id,
  ext_id,
  source_language_classifier_value,
  destination_language_classifier_value,
  price,
  status,
  deadline_at,
  projectDomain,
  active_job_definition,
  projectId,
}) => {
  const { t } = useTranslation()
  // const { userPrivileges } = useAuth()
  // console.warn('userPrivileges', userPrivileges)
  const [activeTab, setActiveTab] = useState<string | undefined>(
    SubProjectFeatures.GeneralInformation
  )
  const { setHash, currentHash } = useHashState()
  const [isExpanded, setIsExpanded] = useState(includes(currentHash, ext_id))
  const { subProject, isLoading } = useFetchSubProject({ id }) || {}

  const { assignments = [], workflow_started } = subProject || {}
  const { job_short_name } = active_job_definition || {}

  const { startSubProjectWorkflow, isLoading: isStartingWorkflow } =
    useSubProjectWorkflow({ id, projectId })

  const attemptScroll = useCallback(() => {
    const matchingElement = document.getElementById(ext_id)
    if (matchingElement && !isLoading) {
      matchingElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    } else if (matchingElement && isLoading) setTimeout(attemptScroll, 300)
  }, [ext_id, isLoading])

  useEffect(() => {
    if (currentHash && includes(currentHash, ext_id)) {
      attemptScroll()
      if (!isExpanded) {
        setIsExpanded(true)
      }
    }
  }, [currentHash, ext_id, attemptScroll, isExpanded])

  const languageDirection = `${source_language_classifier_value?.value} > ${destination_language_classifier_value?.value}`

  const hasAnyFeaturesWithoutCandidates = find(
    assignments,
    ({ candidates, job_definition }) =>
      isEmpty(candidates) &&
      job_definition?.job_key !== SubProjectFeatures.JobOverview
  )

  const hasAnyAssignmentsWithoutDeadline = find(
    assignments,
    ({ deadline_at }) => !deadline_at
  )

  const canStartWorkflow =
    !hasAnyAssignmentsWithoutDeadline && !hasAnyFeaturesWithoutCandidates

  const tabs = map(assignments, ({ job_definition }) => {
    return {
      id: job_definition.id,
      job_key: job_definition.job_key,
      cat_tool_enabled: job_definition.linking_with_cat_tool_jobs_enabled,
    }
  })

  const handleOpenContainer = useCallback(
    (isExpanded: boolean) => {
      setHash(isExpanded ? ext_id : '')
      setIsExpanded(isExpanded)
    },
    [ext_id, setHash]
  )

  const handleStartWorkflow = useCallback(async () => {
    try {
      await startSubProjectWorkflow()
      showNotification({
        type: NotificationTypes.Success,
        title: t('notification.announcement'),
        content: t('success.workflow_started'),
      })
    } catch (errorData) {
      showValidationErrorMessage(errorData)
    }
  }, [startSubProjectWorkflow, t])

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

  if (isLoading) return <Loader loading={isLoading} />

  return (
    <ExpandableContentContainer
      className={classNames(
        classes.expandableContainer,
        status && classes[toLower(status)]
      )}
      onExpandedChange={handleOpenContainer}
      id={ext_id}
      isExpanded={isExpanded}
      rightComponent={
        <ProjectStatusTag status={status} jobName={job_short_name} />
      }
      wrapContent
      bottomComponent={
        <>
          <Notification
            content={t('warning.sub_project_tasks_missing_vendors')}
            type={NotificationTypes.Warning}
            className={classes.notificationStyle}
            hidden={canStartWorkflow || isExpanded || workflow_started}
          />
          <Notification
            content={t('warning.send_sub_project_to_vendor_warning')}
            hideIcon
            type={
              !canStartWorkflow
                ? NotificationTypes.Warning
                : NotificationTypes.Info
            }
            className={classNames(
              classes.notificationStyle,
              classes.startWorkFlowNotification,
              !canStartWorkflow && classes.warning
            )}
            hidden={!isExpanded}
            children={
              <Button
                children={t('button.send_sub_project_to_vendors')}
                disabled={!canStartWorkflow || workflow_started}
                loading={isStartingWorkflow}
                onClick={handleStartWorkflow}
              />
            }
          />
        </>
      }
      leftComponent={
        <LeftComponent {...{ ext_id, deadline_at, price, languageDirection }} />
      }
    >
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
    </ExpandableContentContainer>
  )
}

export default SubProjectSection
