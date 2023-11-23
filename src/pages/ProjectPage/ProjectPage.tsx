import Loader from 'components/atoms/Loader/Loader'
import { useFetchProject } from 'hooks/requests/useProjects'
import { FC, useCallback } from 'react'
import { map, includes, sortBy, isEmpty } from 'lodash'
import { useParams } from 'react-router-dom'
import classes from './classes.module.scss'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import { useTranslation } from 'react-i18next'
import useAuth from 'hooks/useAuth'
import { Privileges } from 'types/privileges'
import { ListSubProjectDetail, ProjectStatus } from 'types/projects'
import ProjectDetails, {
  ProjectDetailModes,
} from 'components/organisms/ProjectDetails/ProjectDetails'
import useProjectPageRedirect from 'hooks/useProjectPageRedirect'
import SubProjectSection from 'components/templates/SubProjectSection/SubProjectSection'
import { ModalTypes, showModal } from 'components/organisms/modals/ModalRoot'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { showValidationErrorMessage } from 'api/errorHandler'
import { useCompleteTask, useFetchTasks } from 'hooks/requests/useTasks'
import { TaskType } from 'types/tasks'
interface ProjectButtonProps {
  status?: ProjectStatus
  isUserClientOfProject?: boolean
  projectId?: string
  sub_projects?: ListSubProjectDetail[]
}

const ProjectButtons: FC<ProjectButtonProps> = ({
  status,
  isUserClientOfProject,
  projectId,
  sub_projects,
}) => {
  const { t } = useTranslation()
  const { userPrivileges } = useAuth()
  const { tasks, isLoading } = useFetchTasks({
    project_id: projectId,
    task_type: TaskType.ClientReview,
  })

  const { completeTask, isLoading: isCompletingTask } = useCompleteTask({
    id: tasks?.[0]?.id,
  })

  // There will only be a maximum of 1 CLIENT_REVIEW task per project
  const clientReviewTaskExists = !isLoading && !isEmpty(tasks)

  const isProjectCancellable = includes(
    [ProjectStatus.New, ProjectStatus.Registered],
    status
  )
  const canCancelPersonalProject =
    includes(userPrivileges, Privileges.ViewPersonalProject) &&
    isUserClientOfProject

  const canCancelInstitutionProject = includes(
    userPrivileges,
    Privileges.ManageProject
  )

  const canCancelProject =
    isProjectCancellable &&
    (canCancelPersonalProject || canCancelInstitutionProject)

  const canAcceptProject =
    isUserClientOfProject &&
    clientReviewTaskExists &&
    includes([ProjectStatus.Corrected, ProjectStatus.SubmittedToClient], status)

  const openConfirmCancelModal = useCallback(() => {
    showModal(ModalTypes.ConfirmCancelProject, {
      projectId,
    })
  }, [projectId])

  const openConfirmRejectModal = useCallback(() => {
    showModal(ModalTypes.ConfirmRejectProject, {
      projectId,
      taskId: tasks?.[0]?.id,
      subProjectsOptions: map(sub_projects, ({ ext_id, id }) => ({
        label: ext_id,
        value: id,
      })),
    })
  }, [projectId, sub_projects, tasks])

  const handleAcceptProject = useCallback(async () => {
    try {
      await completeTask({ accepted: 1 })
      showNotification({
        type: NotificationTypes.Success,
        title: t('notification.announcement'),
        content: t('success.project_accepted'),
      })
    } catch (errorData) {
      showValidationErrorMessage(errorData)
    }
  }, [t, completeTask])

  // TODO: mapped buttons:
  // Left:
  // 1. Delegate to other manager (Registreeritud status + )
  // Right:
  // 1. Cancel project --
  if (!status) return null
  return (
    <div className={classes.buttonsContainer}>
      <Button
        appearance={AppearanceTypes.Secondary}
        children={t('button.delegate_to_other_manager')}
        // TODO: disabled for now, we don't have endpoint for this
        // open confirmation modal from here
        disabled
        // hidden={!includes(userPrivileges, Privileges.DeactivateUser)}
      />
      {/* Reject button */}
      <Button
        appearance={AppearanceTypes.Secondary}
        children={t('button.reject_project')}
        onClick={openConfirmRejectModal}
        hidden={!canAcceptProject}
      />
      {/* Cancel button */}
      <Button
        appearance={AppearanceTypes.Primary}
        children={t('button.cancel_project')}
        onClick={openConfirmCancelModal}
        hidden={!canCancelProject}
      />
      {/* Accept button */}
      <Button
        appearance={AppearanceTypes.Primary}
        children={t('button.accept_project')}
        onClick={handleAcceptProject}
        hidden={!canAcceptProject}
        loading={isCompletingTask}
      />
    </div>
  )
}

const ProjectPage: FC = () => {
  // const { t } = useTranslation()
  const { projectId } = useParams()
  const { institutionUserId } = useAuth()
  const { project, isLoading } = useFetchProject({ id: projectId })
  const {
    ext_id,
    status,
    sub_projects,
    client_institution_user,
    manager_institution_user,
    translation_domain_classifier_value,
  } = project || {}

  useProjectPageRedirect({
    client_institution_user_id: client_institution_user?.id,
    manager_institution_user_id: manager_institution_user?.id,
    isLoading,
  })

  const isUserClientOfProject =
    institutionUserId === client_institution_user?.id

  if (isLoading) return <Loader loading={isLoading} />
  return (
    <>
      <div className={classes.titleRow}>
        <h1>{ext_id}</h1>
        <ProjectButtons
          {...{ status, isUserClientOfProject, projectId, sub_projects }}
        />
      </div>

      <ProjectDetails mode={ProjectDetailModes.Editable} project={project} />

      <div className={classes.separator} />

      {map(sortBy(sub_projects, 'ext_id'), (subProject) => (
        <SubProjectSection
          {...subProject}
          projectId={projectId}
          key={subProject.id}
          projectDomain={translation_domain_classifier_value}
        />
      ))}
    </>
  )
}

export default ProjectPage
