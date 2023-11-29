import { FC, useEffect, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import DataTable, {
  TableSizeTypes,
} from 'components/organisms/DataTable/DataTable'
import { map, uniq, includes, find, isEmpty, intersection } from 'lodash'
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
import { useFetchTags } from 'hooks/requests/useTags'
import { TagTypes } from 'types/tags'
import { useLanguageDirections } from 'hooks/requests/useLanguageDirections'
import { FilterFunctionType } from 'types/collective'

// TODO: statuses might come from BE instead
// Currently unclear

type ProjectTableRow = {
  ext_id: string
  reference_number: string
  deadline_at: string
  type: string
  status: ProjectStatus
  tags: string[]
  price: string
  language_directions: string[]
}

const columnHelper = createColumnHelper<ProjectTableRow>()

// TODO: we keep all filtering and sorting options inside form
// This was we can do a new request easily every time form values change
interface FormValues {
  statuses?: ProjectStatus[]
  only_show_personal_projects: boolean
  ext_id?: string
}

const ProjectsTable: FC = () => {
  const { t } = useTranslation()
  const { userPrivileges } = useAuth()

  const onlyPersonalProjectsAllowed = isEmpty(
    intersection(userPrivileges, [
      Privileges.ViewInstitutionProjectList,
      Privileges.ViewInstitutionProjectDetail,
      Privileges.ViewInstitutionUnclaimedProjectDetail,
    ])
  )

  const {
    projects,
    paginationData,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
  } = useFetchProjects({
    only_show_personal_projects: onlyPersonalProjectsAllowed ? 1 : 0,
  })
  const { tagsFilters = [] } = useFetchTags({
    type: TagTypes.Project,
  })
  const { languageDirectionFilters, loadMore, handleSearch } =
    useLanguageDirections({})

  const statusFilters = map(ProjectStatus, (status) => ({
    label: t(`projects.status.${status}`),
    value: status,
  }))

  // TODO: remove default values, once we have actual data
  const projectRows = useMemo(
    () =>
      map(
        projects,
        ({
          reference_number,
          sub_projects,
          deadline_at,
          ext_id,
          type_classifier_value,
          status,
          tags,
          price,
        }) => {
          return {
            ext_id,
            reference_number,
            deadline_at,
            type: type_classifier_value?.name || '',
            status,
            tags: map(tags, 'name'),
            price,
            language_directions: uniq(
              map(
                sub_projects,
                ({
                  source_language_classifier_value,
                  destination_language_classifier_value,
                }) =>
                  `${source_language_classifier_value?.value} > ${destination_language_classifier_value?.value}`
              )
            ),
          }
        }
      ),
    [projects]
  )

  const { control, handleSubmit, watch } = useForm<FormValues>({
    mode: 'onChange',
    defaultValues: {
      only_show_personal_projects: onlyPersonalProjectsAllowed,
    },
    resetOptions: {
      keepErrors: true,
    },
  })

  const handleModifiedFilterChange = useCallback(
    (filters?: FilterFunctionType) => {
      let currentFilters = filters
      if (filters && 'language_directions' in filters) {
        const { language_directions, ...rest } = filters || {}
        const typedLanguageDirection = language_directions as string[]

        const modifiedLanguageDirections = map(
          typedLanguageDirection,
          (languageDirectionString) => {
            return languageDirectionString.replace('_', ':')
          }
        )

        currentFilters = {
          language_directions: modifiedLanguageDirections,
          ...rest,
        }
      }

      if (handleFilterChange) {
        handleFilterChange(currentFilters)
      }
    },
    [handleFilterChange]
  )

  const onSubmit: SubmitHandler<FormValues> = useCallback(
    (payload) => {
      handleFilterChange({
        ...payload,
        only_show_personal_projects: payload?.only_show_personal_projects
          ? 1
          : 0,
      })
    },
    [handleFilterChange]
  )

  useEffect(() => {
    // Submit form every time it changes
    const subscription = watch(() => handleSubmit(onSubmit)())
    return () => subscription.unsubscribe()
  }, [handleSubmit, watch, onSubmit])

  const columns = [
    columnHelper.accessor('ext_id', {
      header: () => t('label.project_id'),
      cell: ({ getValue }) => {
        const projectExtId = getValue()
        const project = find(projects, { ext_id: projectExtId })
        return (
          <Button
            appearance={AppearanceTypes.Text}
            size={SizeTypes.M}
            icon={ArrowRight}
            ariaLabel={t('label.to_project_view')}
            iconPositioning={IconPositioningTypes.Left}
            disabled={!includes(userPrivileges, Privileges.ViewPersonalProject)}
            href={`/projects/${project?.id}`}
          >
            {projectExtId}
          </Button>
        )
      },
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('reference_number', {
      header: () => t('label.reference_number'),
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('language_directions', {
      header: () => t('label.language_directions'),
      footer: (info) => info.column.id,
      cell: ({ getValue }) => {
        return (
          <div className={classes.tagsRow}>
            {map(getValue(), (value) => (
              <Tag label={value} value key={value} />
            ))}
          </div>
        )
      },
      meta: {
        filterOption: { language_directions: languageDirectionFilters },
        onEndReached: loadMore,
        onSearch: handleSearch,
        showSearch: true,
      },
    }),
    columnHelper.accessor('type', {
      header: () => t('label.type'),
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('tags', {
      header: () => t('label.project_tags'),
      footer: (info) => info.column.id,
      cell: ({ getValue }) => {
        return (
          <div className={classes.tagsRow}>
            {map(getValue(), (value) => (
              <Tag label={value} value key={value} />
            ))}
          </div>
        )
      },
      meta: {
        filterOption: { tag_ids: tagsFilters },
        showSearch: true,
      },
    }),
    columnHelper.accessor('status', {
      header: () => t('label.status'),
      footer: (info) => info.column.id,
      cell: ({ getValue }) => <ProjectStatusTag status={getValue()} />,
    }),
    columnHelper.accessor('price', {
      header: () => t('label.cost'),
      footer: (info) => info.column.id,
      meta: {
        sortingOption: ['asc', 'desc'],
      },
    }),
    columnHelper.accessor('deadline_at', {
      header: () => t('label.deadline_at'),
      footer: (info) => info.column.id,
      cell: ({ getValue, row }) => {
        const deadlineDate = dayjs(getValue())
        const currentDate = dayjs()
        const diff = deadlineDate.diff(currentDate)
        const formattedDate = dayjs(getValue()).format('DD.MM.YYYY HH:mm')
        const rowStatus = row.original.status
        const hasDeadlineError =
          diff < 0 &&
          !includes(
            [
              ProjectStatus.SubmittedToClient,
              ProjectStatus.Accepted,
              ProjectStatus.Cancelled,
              ProjectStatus.Corrected,
            ],
            rowStatus
          )
        return (
          <span
            className={classNames(
              classes.deadline,
              hasDeadlineError && classes.error
            )}
          >
            {formattedDate}
          </span>
        )
      },
      meta: {
        sortingOption: ['asc', 'desc'],
      },
    }),
  ] as ColumnDef<ProjectTableRow>[]

  return (
    <Root>
      <DataTable
        data={projectRows}
        columns={columns}
        tableSize={TableSizeTypes.M}
        paginationData={paginationData}
        onPaginationChange={handlePaginationChange}
        onFiltersChange={handleModifiedFilterChange}
        onSortingChange={handleSortingChange}
        headComponent={
          <div className={classes.topSection}>
            <FormInput
              name="statuses"
              control={control}
              options={statusFilters}
              inputType={InputTypes.TagsSelect}
            />
            <FormInput
              name="only_show_personal_projects"
              label={t('label.show_only_my_projects')}
              ariaLabel={t('label.show_only_my_projects')}
              disabled={onlyPersonalProjectsAllowed}
              className={classes.checkbox}
              control={control}
              inputType={InputTypes.Checkbox}
            />
            <FormInput
              name="ext_id"
              ariaLabel={t('label.search_by_id')}
              placeholder={t('placeholder.search_by_id')}
              inputType={InputTypes.Text}
              className={classes.searchInput}
              inputContainerClassName={classes.searchInnerContainer}
              control={control}
              isSearch
            />
          </div>
        }
      />
    </Root>
  )
}

export default ProjectsTable
