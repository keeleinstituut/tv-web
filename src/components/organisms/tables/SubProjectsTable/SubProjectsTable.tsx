import { FC, useEffect, useMemo, useCallback, useRef } from 'react'
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
import ArrowRight from 'assets/icons/arrow_right.svg?react'
import classes from './classes.module.scss'
import { Root } from '@radix-ui/react-form'
import { SubmitHandler, useForm, useWatch } from 'react-hook-form'
import {
  FormInput,
  InputTypes,
} from 'components/organisms/DynamicForm/DynamicForm'
import {
  useFetchSubProjects,
  useProjectLanguagesFetch,
} from 'hooks/requests/useProjects'
import { SubProjectsPayloadType, SubProjectStatus } from 'types/projects'
import Tag from 'components/atoms/Tag/Tag'
import ProjectStatusTag from 'components/molecules/ProjectStatusTag/ProjectStatusTag'
import dayjs from 'dayjs'
import { Privileges } from 'types/privileges'
import { useAuth } from 'components/contexts/AuthContext'
import { useLanguageDirections } from 'hooks/requests/useLanguageDirections'
import { FilterFunctionType } from 'types/collective'
import { useSearchParams } from 'react-router-dom'
import { useClassifierValuesFetch } from 'hooks/requests/useClassifierValues'
import { ClassifierValueType } from 'types/classifierValues'
import { TypesWithStartTime } from 'types/projects'

const VERBAL_TYPE_VALUES = [
  TypesWithStartTime.OralTranslation,
  TypesWithStartTime.SynchronousTranslation,
  TypesWithStartTime.SignLanguage,
]
import { useFetchTags } from 'hooks/requests/useTags'
import { TagTypes } from 'types/tags'
import {
  TableDateFilter,
  TableSelectFilter,
} from 'components/organisms/TableHeaderGroup/TableHeaderGroup'
import { useFetchInfiniteProjectPerson } from 'hooks/requests/useUsers'

type SubProjectTableRow = {
  ext_id: string
  reference_number?: string
  deadline_at: string
  created_at: string
  event_start_at?: string
  type: string
  tags: string[]
  status?: SubProjectStatus
  price?: string
  language_direction: string[]
  client_name: string
}

const columnHelper = createColumnHelper<SubProjectTableRow>()

interface FormValues {
  status?: SubProjectStatus[]
  only_show_personal_projects: boolean
  q?: string
  order_category: string[]
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

  const onlyNewProjectsAllowed =
    includes(
      userPrivileges,
      Privileges.ViewInstitutionUnclaimedProjectDetail
    ) &&
    isEmpty(
      intersection(userPrivileges, [
        Privileges.ViewInstitutionProjectList,
        Privileges.ViewInstitutionProjectDetail,
      ])
    )

  const [searchParams] = useSearchParams()
  const initialFilters: SubProjectsPayloadType = {
    per_page: 50,
    sort_by: 'deadline_at',
    sort_order: 'asc',
    page: 1,
    ...Object.fromEntries(searchParams.entries()),
    status: onlyNewProjectsAllowed
      ? [SubProjectStatus.New]
      : searchParams.getAll('status'),
    language_direction: searchParams.getAll('language_direction'),
    only_show_personal_projects: onlyPersonalProjectsAllowed
      ? 1
      : Number(searchParams.get('only_show_personal_projects')) || 0,
    type_classifier_value_id: searchParams.getAll('type_classifier_value_id'),
    tag_ids: searchParams.getAll('tag_ids'),
    client_institution_user_ids: searchParams.getAll(
      'client_institution_user_ids'
    ),
  }

  const {
    subProjects,
    paginationData,
    filters,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
  } = useFetchSubProjects(initialFilters, true)

  const { tagsFilters = [] } = useFetchTags({
    type: TagTypes.Project,
  })

  const { languages: projectLanguages } = useProjectLanguagesFetch()

  const {
    languageDirectionFilters,
    loadMore,
    handleSearch,
    setSelectedValues,
  } = useLanguageDirections({ includeValues: projectLanguages })

  const {
    users: usersData,
    handleFilterChange: usersFetchHandleFilterChange,
    fetchNextPage: usersFetchFetchNextPage,
  } = useFetchInfiniteProjectPerson(
    {
      per_page: 50,
    },
    'client'
  )

  const userFilterValues = useMemo(() => {
    return map(usersData, (user) => {
      return {
        value: user.id,
        label: `${user.user.forename} ${user.user.surname}`,
      }
    })
  }, [usersData])

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
  const { classifierValues: allProjectTypes, classifierValuesFilters: allTypeFilters } =
    useClassifierValuesFetch({ type: ClassifierValueType.ProjectType })

  const verbalTypeIds = useMemo(
    () =>
      (allProjectTypes ?? [])
        .filter((t) => includes(VERBAL_TYPE_VALUES, t.value as TypesWithStartTime))
        .map((t) => t.id),
    [allProjectTypes]
  )

  const nonVerbalTypeIds = useMemo(
    () =>
      (allProjectTypes ?? [])
        .filter((t) => !includes(VERBAL_TYPE_VALUES, t.value as TypesWithStartTime))
        .map((t) => t.id),
    [allProjectTypes]
  )

  const typeFilters = useMemo(
    () =>
      (allTypeFilters ?? []).filter(
        (_, i) =>
          !includes(VERBAL_TYPE_VALUES, allProjectTypes?.[i]?.value as TypesWithStartTime)
      ),
    [allTypeFilters, allProjectTypes]
  )

  const verbalTypeFilters = useMemo(
    () =>
      (allTypeFilters ?? []).filter((_, i) =>
        includes(VERBAL_TYPE_VALUES, allProjectTypes?.[i]?.value as TypesWithStartTime)
      ),
    [allTypeFilters, allProjectTypes]
  )

  const projectRows = useMemo(
    () =>
      map(
        subProjects,
        ({
          deadline_at,
          created_at,
          ext_id,
          source_language_classifier_value,
          destination_language_classifier_value,
          status,
          project,
          price,
        }) => {
          const client_name = !project?.client_institution_user
            ? ''
            : project?.client_institution_user?.user.forename +
              ' ' +
              project?.client_institution_user?.user.surname

          return {
            ext_id,
            reference_number: project?.reference_number,
            deadline_at,
            created_at,
            event_start_at: project?.event_start_at,
            type: project?.type_classifier_value?.name || '',
            status,
            price,
            client_name,
            tags: map(project?.tags, 'name'),
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
      order_category: ['translation'],
    }),
    [filters]
  )

  const { control, handleSubmit, watch, setValue } = useForm<FormValues>({
    mode: 'onChange',
    defaultValues: defaultFilterValues,
    resetOptions: {
      keepErrors: true,
    },
  })

  const orderCategory = useWatch({ control, name: 'order_category' })

  // Enforce single-selection: when a new item is added alongside an existing one, keep only the latest
  const prevCategoryRef = useRef<string[]>(['translation'])
  useEffect(() => {
    const prev = prevCategoryRef.current
    const added = orderCategory?.filter((v) => !includes(prev, v))
    if (added?.length && orderCategory.length > 1) {
      prevCategoryRef.current = [added[0]]
      setValue('order_category', [added[0]])
    } else {
      prevCategoryRef.current = orderCategory ?? prev
    }
  }, [orderCategory, setValue])

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

        currentFilters = {
          type_classifier_value_id: Array.isArray(type_classifier_value_id)
            ? type_classifier_value_id
            : type_classifier_value_id
              ? [type_classifier_value_id as string]
              : [],
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
      const { order_category, ...rest } = payload
      const categoryTypeIds = includes(order_category, 'verbal')
        ? verbalTypeIds
        : includes(order_category, 'translation')
          ? nonVerbalTypeIds
          : []
      handleModifiedFilterChange({
        ...rest,
        only_show_personal_projects: payload?.only_show_personal_projects ? 1 : 0,
        type_classifier_value_id: categoryTypeIds,
      })
    },
    [handleModifiedFilterChange, verbalTypeIds, nonVerbalTypeIds]
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
      meta: {
        sortingParameterName: 'ext_id',
        sortingOption: ['asc', 'desc'],
        currentSorting: filters?.sort_by === 'ext_id' ? filters.sort_order : '',
      },
    }),
    columnHelper.accessor('reference_number', {
      header: () => t('label.associated_reference_number'),
      footer: (info) => info.column.id,
      meta: {
        sortingParameterName: 'project.reference_number',
        sortingOption: ['asc', 'desc'],
        currentSorting:
          filters?.sort_by === 'project.reference_number'
            ? filters.sort_order
            : '',
      },
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
        FilteringComponent: (
          <TableSelectFilter
            filterKey="language_direction"
            options={languageDirectionFilters}
            onEndReached={loadMore}
            onSearch={handleSearch}
            showSearch
            value={
              filters?.language_direction
                ? filters?.language_direction.map((item) =>
                    item.replace(':', '_')
                  )
                : []
            }
          />
        ),
      },
    }),
    columnHelper.accessor('type', {
      header: () => t('label.type'),
      footer: (info) => info.column.id,
      meta: {
        FilteringComponent: (
          <TableSelectFilter
            filterKey="type_classifier_value_id"
            options={includes(orderCategory, 'verbal') ? verbalTypeFilters : typeFilters}
            value={filters.type_classifier_value_id}
            isCustomSingleDropdown
          />
        ),
      },
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
        FilteringComponent: (
          <TableSelectFilter
            filterKey="tag_ids"
            options={tagsFilters}
            showSearch={true}
            value={filters?.tag_ids || []}
          />
        ),
      },
    }),
    columnHelper.accessor('status', {
      header: () => t('label.status'),
      footer: (info) => info.column.id,
      cell: ({ getValue }) => <ProjectStatusTag status={getValue()} />,
      meta: {
        sortingParameterName: 'status',
        sortingOption: ['asc', 'desc'],
        currentSorting: filters?.sort_by === 'status' ? filters.sort_order : '',
      },
    }),
    columnHelper.accessor('price', {
      header: () => t('label.cost'),
      footer: (info) => info.column.id,
      meta: {
        sortingParameterName: 'price',
        sortingOption: ['asc', 'desc'],
        currentSorting: filters?.sort_by === 'price' ? filters.sort_order : '',
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
        sortingParameterName: 'deadline_at',
        sortingOption: ['asc', 'desc'],
        currentSorting:
          filters?.sort_by === 'deadline_at' ? filters.sort_order : '',
        FilteringComponent: (
          <TableDateFilter
            filterKey="deadline_at"
            value={filters?.deadline_at}
          />
        ),
      },
    }),
    columnHelper.accessor('created_at', {
      header: () => t('label.created_at'),
      footer: (info) => info.column.id,
      meta: {
        sortingOption: ['asc', 'desc'],
        currentSorting:
          filters?.sort_by === 'created_at' ? filters.sort_order : '',
        FilteringComponent: (
          <TableDateFilter filterKey="created_at" value={filters?.created_at} />
        ),
      },
      cell: ({ getValue, row }) => {
        const formattedDate = dayjs(getValue()).format('DD.MM.YYYY HH:mm')

        return <span>{formattedDate}</span>
      },
    }),
    columnHelper.accessor('event_start_at', {
      header: () => t('label.event_start_at'),
      footer: (info) => info.column.id,
      meta: {
        sortingParameterName: 'project.event_start_at',
        sortingOption: ['asc', 'desc'],
        currentSorting:
          filters?.sort_by === 'project.event_start_at'
            ? filters.sort_order
            : '',
        FilteringComponent: (
          <TableDateFilter
            filterKey="event_start_at"
            value={filters?.event_start_at}
          />
        ),
      },
      cell: ({ getValue, row }) => {
        const value = getValue()

        if (!value) {
          return <span />
        }

        const formattedDate = dayjs(value).format('DD.MM.YYYY HH:mm')

        return <span>{formattedDate}</span>
      },
    }),
    columnHelper.accessor('client_name', {
      header: () => t('label.client'),
      footer: (info) => info.column.id,
      meta: {
        sortingParameterName: 'project.clientInstitutionUser.name',
        sortingOption: ['asc', 'desc'],
        currentSorting:
          filters?.sort_by === 'project.clientInstitutionUser.name'
            ? filters.sort_order
            : '',
        FilteringComponent: (
          <TableSelectFilter
            filterKey="client_institution_user_ids"
            options={userFilterValues}
            onEndReached={usersFetchFetchNextPage}
            value={filters?.client_institution_user_ids || []}
            showSearch
            onSearch={(value) =>
              usersFetchHandleFilterChange({
                fullname: value,
              })
            }
          />
        ),
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
              name="order_category"
              control={control}
              options={[
                { value: 'translation', label: t('projects.order_category_translation') },
                { value: 'verbal', label: t('projects.order_category_verbal') },
              ]}
              inputType={InputTypes.TagsSelect}
              hideAll
            />
            <FormInput
              name="status"
              control={control}
              options={statusFilters}
              inputType={InputTypes.TagsSelect}
              disabled={onlyNewProjectsAllowed}
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
              name="q"
              ariaLabel={t('label.search_by_id')}
              placeholder={t('placeholder.search_by_id_or_reference_number')}
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
