import { FC, useEffect, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import DataTable, {
  TableSizeTypes,
} from 'components/organisms/DataTable/DataTable'
import { map, includes, find, isEmpty, intersection } from 'lodash'
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
import { useFetchSubProjects } from 'hooks/requests/useProjects'
import { SubProjectStatus } from 'types/projects'
import Tag from 'components/atoms/Tag/Tag'
import ProjectStatusTag from 'components/molecules/ProjectStatusTag/ProjectStatusTag'
import dayjs from 'dayjs'
import { Privileges } from 'types/privileges'
import useAuth from 'hooks/useAuth'
import { useLanguageDirections } from 'hooks/requests/useLanguageDirections'
import { FilterFunctionType } from 'types/collective'
import { useSearchParams } from 'react-router-dom'
import { useClassifierValuesFetch } from 'hooks/requests/useClassifierValues'
import { ClassifierValueType } from 'types/classifierValues'

type SubProjectTableRow = {
  ext_id: string
  reference_number?: string
  deadline_at: string
  type: string
  status?: SubProjectStatus
  price?: string
  language_direction: string[]
}

const columnHelper = createColumnHelper<SubProjectTableRow>()

interface FormValues {
  status?: SubProjectStatus[]
  only_show_personal_projects: boolean
  ext_id?: string
}

const SubProjectsTable: FC = () => {
  const { t } = useTranslation()
  const { userPrivileges } = useAuth()

  const onlyPersonalProjectsAllowed = isEmpty(
    intersection(userPrivileges, [
      Privileges.ViewInstitutionProjectList,
      Privileges.ViewInstitutionProjectDetail,
      Privileges.ViewInstitutionUnclaimedProjectDetail,
    ])
  )

  const [searchParams] = useSearchParams()
  const initialFilters = {
    per_page: 10,
    page: 1,
    ...Object.fromEntries(searchParams.entries()),
    status: searchParams.getAll('status'),
    language_direction: searchParams.getAll('language_direction'),
    only_show_personal_projects: Number(
      searchParams.get('only_show_personal_projects') || 0
    ),
    type_classifier_value_id: searchParams.getAll('type_classifier_value_id'),
  }

  const {
    subProjects,
    paginationData,
    filters,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
  } = useFetchSubProjects(initialFilters, true)

  const {
    languageDirectionFilters,
    loadMore,
    handleSearch,
    setSelectedValues,
  } = useLanguageDirections({})

  useEffect(() => {
    setSelectedValues(filters?.language_direction || [])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters?.language_direction])

  const defaultPaginationData = {
    per_page: Number(filters.per_page),
    page: Number(filters.page) - 1,
  }

  const statusFilters = map(SubProjectStatus, (status) => ({
    label: t(`projects.status.${status}`),
    value: status,
  }))
  const { classifierValuesFilters: typeFilters } = useClassifierValuesFetch({
    type: ClassifierValueType.ProjectType,
  })

  const projectRows = useMemo(
    () =>
      map(
        subProjects,
        ({
          deadline_at,
          ext_id,
          source_language_classifier_value,
          destination_language_classifier_value,
          status,
          project,
          price,
        }) => {
          return {
            ext_id,
            reference_number: project?.reference_number,
            deadline_at,
            type: project?.type_classifier_value?.name || '',
            status,
            price,
            language_direction: [
              `${source_language_classifier_value?.value} > ${destination_language_classifier_value?.value}`,
            ],
          }
        }
      ),
    [subProjects]
  )

  const defaultFilterValues = useMemo(
    () => ({
      status: (filters?.status as SubProjectStatus[]) || [],
      only_show_personal_projects: !!(
        Number(filters?.only_show_personal_projects) || 0
      ),
      ext_id: filters?.ext_id || '',
    }),
    [filters]
  )

  const { control, handleSubmit, watch } = useForm<FormValues>({
    mode: 'onChange',
    defaultValues: defaultFilterValues,
    resetOptions: {
      keepErrors: true,
    },
  })

  const handleModifiedFilterChange = useCallback(
    (filters?: FilterFunctionType) => {
      let currentFilters = filters
      if (filters && 'language_direction' in filters) {
        const { language_direction, ...rest } = currentFilters || {}
        const typedLanguageDirection = language_direction as string[]

        const modifiedLanguageDirections = map(
          typedLanguageDirection,
          (languageDirectionString) => {
            return languageDirectionString.replace('_', ':')
          }
        )

        currentFilters = {
          language_direction: modifiedLanguageDirections,
          ...rest,
        }
      }

      if (filters && 'type_classifier_value_id' in filters) {
        const { type_classifier_value_id, ...rest } = currentFilters || {}
        const typedTypeClassifierValueId = type_classifier_value_id as string

        currentFilters = {
          type_classifier_value_id: [typedTypeClassifierValueId],
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
      handleModifiedFilterChange({
        ...payload,
        only_show_personal_projects: payload?.only_show_personal_projects
          ? 1
          : 0,
      })
    },
    [handleModifiedFilterChange]
  )

  useEffect(() => {
    // Submit form every time it changes
    const subscription = watch(() => handleSubmit(onSubmit)())
    return () => subscription.unsubscribe()
  }, [handleSubmit, onSubmit, watch])

  const columns = [
    columnHelper.accessor('ext_id', {
      header: () => t('label.sub_project_id'),
      cell: ({ getValue }) => {
        const projectExtId = getValue()
        const subProject = find(subProjects, { ext_id: projectExtId })
        const parentProjectId = subProject?.project_id
        return (
          <Button
            appearance={AppearanceTypes.Text}
            size={SizeTypes.M}
            icon={ArrowRight}
            ariaLabel={t('label.to_project_view')}
            iconPositioning={IconPositioningTypes.Left}
            disabled={!includes(userPrivileges, Privileges.ViewPersonalProject)}
            href={`/projects/sub-projects/${parentProjectId}#${projectExtId}`}
          >
            {projectExtId}
          </Button>
        )
      },
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('reference_number', {
      header: () => t('label.associated_reference_number'),
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('language_direction', {
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
        filterOption: { language_direction: languageDirectionFilters },
        onEndReached: loadMore,
        onSearch: handleSearch,
        showSearch: true,
        filterValue: filters?.language_direction
          ? filters.language_direction.map((item) => item.replace(':', '_'))
          : [],
      },
    }),
    columnHelper.accessor('type', {
      header: () => t('label.type'),
      footer: (info) => info.column.id,
      meta: {
        filterOption: { type_classifier_value_id: typeFilters },
        filterValue: filters.type_classifier_value_id,
        isCustomSingleDropdown: true,
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
        currentSorting:
          filters?.sort_by === 'deadline_at' ? filters.sort_order : '',
      },
    }),
    columnHelper.accessor('deadline_at', {
      header: () => t('label.deadline_at'),
      footer: (info) => info.column.id,
      cell: ({ getValue, row }) => {
        const deadlineString = getValue()
        if (!deadlineString) {
          return null
        }
        const deadlineDate = dayjs(getValue())
        const currentDate = dayjs()
        const diff = deadlineDate.diff(currentDate)
        const formattedDate = dayjs(getValue()).format('DD.MM.YYYY HH:mm')
        const rowStatus = row.original.status
        const hasDeadlineError =
          diff < 0 &&
          !includes(
            [SubProjectStatus.Completed, SubProjectStatus.Cancelled],
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
        currentSorting:
          filters?.sort_by === 'deadline_at' ? filters.sort_order : '',
      },
    }),
  ] as ColumnDef<SubProjectTableRow>[]

  return (
    <Root onSubmit={(e) => e.preventDefault()}>
      <DataTable
        data={projectRows}
        columns={columns}
        tableSize={TableSizeTypes.M}
        paginationData={paginationData}
        onPaginationChange={handlePaginationChange}
        onFiltersChange={handleModifiedFilterChange}
        onSortingChange={handleSortingChange}
        defaultPaginationData={defaultPaginationData}
        headComponent={
          <div className={classes.topSection}>
            <FormInput
              name="status"
              control={control}
              options={statusFilters}
              inputType={InputTypes.TagsSelect}
            />
            <FormInput
              name="only_show_personal_projects"
              label={t('label.show_only_my_projects')}
              ariaLabel={t('label.show_only_my_projects')}
              className={classes.checkbox}
              control={control}
              inputType={InputTypes.Checkbox}
              disabled={onlyPersonalProjectsAllowed}
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

export default SubProjectsTable
