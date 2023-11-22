import { FC, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import DataTable, {
  TableSizeTypes,
} from 'components/organisms/DataTable/DataTable'
import { map, uniq, includes, find } from 'lodash'
import { createColumnHelper, ColumnDef } from '@tanstack/react-table'
import Button, {
  AppearanceTypes,
  SizeTypes,
  IconPositioningTypes,
} from 'components/molecules/Button/Button'
import classNames from 'classnames'
import { ReactComponent as ArrowRight } from 'assets/icons/arrow_right.svg'
import classes from './classes.module.scss'
import { Root } from '@radix-ui/react-form'
import { SubmitHandler, useForm } from 'react-hook-form'
import {
  FormInput,
  InputTypes,
} from 'components/organisms/DynamicForm/DynamicForm'
import { useFetchProjects } from 'hooks/requests/useProjects'
import { ProjectStatus } from 'types/projects'
import Tag from 'components/atoms/Tag/Tag'
import ProjectStatusTag from 'components/molecules/ProjectStatusTag/ProjectStatusTag'
import dayjs from 'dayjs'
import { Privileges } from 'types/privileges'
import useAuth from 'hooks/useAuth'
import { useFetchTasks } from 'hooks/requests/useTasks'

// TODO: this is WIP code for tasks list view

// TODO: statuses might come from BE instead
// Currently unclear
const mockStatuses = [
  { label: 'Uus', value: 'NEW' },
  { label: 'Registreeritud', value: 'REGISTERED' },
  { label: 'Tellijale edastatud', value: 'FORWARDED' },
  { label: 'Tühistatud', value: 'CANCELLED' },
  { label: 'Vastuvõetud', value: 'ACCEPTED' },
  { label: 'Tagasi lükatud', value: 'REJECTED' },
]

type ProjectTableRow = {
  ext_id: string
  reference_number: string
  deadline_at: string
  type: string
  status: ProjectStatus
  tags: string[]
  cost: string
  language_directions: string[]
}

const columnHelper = createColumnHelper<any>()

// TODO: we keep all filtering and sorting options inside form
// This was we can do a new request easily every time form values change
interface FormValues {
  status?: string[]
  only_show_personal_projects: boolean
}

const TasksTable: FC = () => {
  const { t } = useTranslation()
  const { userPrivileges } = useAuth()

  const {
    tasks,
    paginationData,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
  } = useFetchTasks()

  // TODO: remove default values, once we have actual data
  const projectRows = useMemo(
    () =>
      map(
        tasks,
        ({
          id,
          // name,
          // sub_projects,
          // deadline_at,
          // ext_id,
          // type_classifier_value,
          // status = ProjectStatus.Registered,
          // tags = ['asutusesiseseks kasutuseks'],
          // cost = '500€',
        }) => {
          return {
            id,
            name: 'asd',
            //   ext_id,
            //   reference_number,
            //   deadline_at,
            //   type: type_classifier_value?.value || '',
            //   status,
            //   tags,
            //   cost,
            //   language_directions: uniq(
            //     map(
            //       sub_projects,
            //       ({
            //         source_language_classifier_value,
            //         destination_language_classifier_value,
            //       }) =>
            //         `${source_language_classifier_value?.value} > ${destination_language_classifier_value?.value}`
            //     )
            //   ),
          }
        }
      ),
    [tasks]
  )

  const { control, handleSubmit, watch } = useForm<FormValues>({
    mode: 'onChange',
    resetOptions: {
      keepErrors: true,
    },
  })

  // TODO: use function to pass in filters and sorting to our project fetch hook
  // Not sure yet, what keys these will have and how the params will be passed
  const onSubmit: SubmitHandler<FormValues> = (data) => console.log(data)

  useEffect(() => {
    // Submit form every time it changes
    const subscription = watch(() => handleSubmit(onSubmit)())
    return () => subscription.unsubscribe()
  }, [handleSubmit, watch])

  const columns = [
    columnHelper.accessor('id', {
      header: () => 'ID',
      footer: (info) => info.column.id,
      cell: ({ getValue, row }) => {
        const id = getValue() as string
        return (
          <Button
            appearance={AppearanceTypes.Text}
            size={SizeTypes.M}
            icon={ArrowRight}
            ariaLabel={t('label.to_project_view')}
            iconPositioning={IconPositioningTypes.Left}
            // disabled={
            //   !includes(userPrivileges, Privileges.ViewInstitutionProjectDetail)
            // }
            href={`/projects/my-tasks/${id}`}
          >
            {id}
          </Button>
        )
      },
    }),

    columnHelper.accessor('name', {
      header: () => 'Name',
      footer: (info) => info.column.id,
    }),
    // columnHelper.accessor('ext_id', {
    //   header: () => t('label.project_id'),
    //   cell: ({ getValue, row }) => {
    //     const projectExtId = getValue()
    //     const project = find(projects, { ext_id: projectExtId })
    //     return (
    //       <Button
    //         appearance={AppearanceTypes.Text}
    //         size={SizeTypes.M}
    //         icon={ArrowRight}
    //         ariaLabel={t('label.to_project_view')}
    //         iconPositioning={IconPositioningTypes.Left}
    //         // disabled={
    //         //   !includes(userPrivileges, Privileges.ViewInstitutionProjectDetail)
    //         // }
    //         href={`/projects/${project?.id}`}
    //       >
    //         {projectExtId}
    //       </Button>
    //     )
    //   },
    //   footer: (info) => info.column.id,
    // }),
    // columnHelper.accessor('reference_number', {
    //   header: () => t('label.reference_number'),
    //   footer: (info) => info.column.id,
    // }),
    // columnHelper.accessor('language_directions', {
    //   header: () => t('label.language_directions'),
    //   footer: (info) => info.column.id,
    //   cell: ({ getValue }) => {
    //     return (
    //       <div className={classes.tagsRow}>
    //         {map(getValue(), (value) => (
    //           <Tag label={value} value key={value} />
    //         ))}
    //       </div>
    //     )
    //   },
    // }),
    // columnHelper.accessor('type', {
    //   header: () => t('label.type'),
    //   footer: (info) => info.column.id,
    // }),
    // columnHelper.accessor('tags', {
    //   header: () => t('label.project_tags'),
    //   footer: (info) => info.column.id,
    //   cell: ({ getValue }) => {
    //     return (
    //       <div className={classes.tagsRow}>
    //         {map(getValue(), (value) => (
    //           <Tag label={value} value key={value} />
    //         ))}
    //       </div>
    //     )
    //   },
    // }),
    // columnHelper.accessor('status', {
    //   header: () => t('label.status'),
    //   footer: (info) => info.column.id,
    //   cell: ({ getValue }) => <ProjectStatusTag status={getValue()} />,
    // }),
    // columnHelper.accessor('cost', {
    //   header: () => t('label.cost'),
    //   footer: (info) => info.column.id,
    //   meta: {
    //     sortingOption: ['asc', 'desc'],
    //   },
    // }),
    // columnHelper.accessor('deadline_at', {
    //   header: (asd) => {
    //     console.warn('asd', asd)
    //     return t('label.deadline_at')
    //   },
    //   footer: (info) => info.column.id,
    //   cell: ({ getValue, row }) => {
    //     const deadlineDate = dayjs(getValue())
    //     const currentDate = dayjs()
    //     const diff = deadlineDate.diff(currentDate)
    //     const formattedDate = dayjs(getValue()).format('DD.MM.YYYY HH:mm')
    //     const rowStatus = row.original.status
    //     const hasDeadlineError =
    //       diff < 0 &&
    //       !includes(
    //         [
    //           ProjectStatus.SubmittedToClient,
    //           ProjectStatus.Accepted,
    //           ProjectStatus.Cancelled,
    //           ProjectStatus.Corrected,
    //         ],
    //         rowStatus
    //       )
    //     return (
    //       <span
    //         className={classNames(
    //           classes.deadline,
    //           hasDeadlineError && classes.error
    //         )}
    //       >
    //         {formattedDate}
    //       </span>
    //     )
    //   },
    //   meta: {
    //     sortingOption: ['asc', 'desc'],
    //   },
    // }),
  ] as ColumnDef<any>[]

  return (
    <Root>
      <DataTable
        data={projectRows}
        columns={columns}
        tableSize={TableSizeTypes.M}
        paginationData={paginationData}
        onPaginationChange={handlePaginationChange}
        onFiltersChange={handleFilterChange}
        onSortingChange={handleSortingChange}
        headComponent={
          <div className={classes.topSection}>
            {/* <FormInput
              name="status"
              control={control}
              options={mockStatuses}
              inputType={InputTypes.TagsSelect}
            />
            <FormInput
              name="only_show_personal_projects"
              label={t('label.show_only_my_projects')}
              ariaLabel={t('label.show_only_my_projects')}
              className={classes.checkbox}
              control={control}
              inputType={InputTypes.Checkbox}
            /> */}
          </div>
        }
      />
    </Root>
  )
}

export default TasksTable
