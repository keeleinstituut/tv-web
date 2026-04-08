import { FC, useEffect, useMemo, useCallback, useRef } from 'react'
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
import ArrowRight from 'assets/icons/arrow_right.svg?react'
import classes from './classes.module.scss'
import { Root } from '@radix-ui/react-form'
import { SubmitHandler, useForm, useWatch } from 'react-hook-form'
import {
  FormInput,
  InputTypes,
} from 'components/organisms/DynamicForm/DynamicForm'
import {
  useFetchProjects,
  useProjectLanguagesFetch,
} from 'hooks/requests/useProjects'
import { ProjectsPayloadType, ProjectStatus } from 'types/projects'
import Tag from 'components/atoms/Tag/Tag'
import ProjectStatusTag from 'components/molecules/ProjectStatusTag/ProjectStatusTag'
import dayjs from 'dayjs'
import { Privileges } from 'types/privileges'
import { useAuth } from 'components/contexts/AuthContext'
import { useFetchTags } from 'hooks/requests/useTags'
import { TagTypes } from 'types/tags'
import { useLanguageDirections } from 'hooks/requests/useLanguageDirections'
import { FilterFunctionType } from 'types/collective'
import { useSearchParams } from 'react-router-dom'
import { useClassifierValuesFetch } from 'hooks/requests/useClassifierValues'
import { ClassifierValueType } from 'types/classifierValues'
import { TypesWithStartTime } from 'types/projects'
import {
  TableDateFilter,
  TableSelectFilter,
} from 'components/organisms/TableHeaderGroup/TableHeaderGroup'
import { useFetchInfiniteProjectPerson } from 'hooks/requests/useUsers'
import LanguageDirectionTags from 'components/atoms/LanguageDirectionTags/LanguageDirectionTags'

const VERBAL_TYPE_VALUES = [
  TypesWithStartTime.OralTranslation,
  TypesWithStartTime.SynchronousTranslation,
  TypesWithStartTime.SignLanguage,
]

// TODO: statuses might come from BE instead
// Currently unclear

type ProjectTableRow = {
  ext_id?: string
  reference_number?: string
  deadline_at?: string
  created_at: string
  event_start_at?: string
  type: string
  status?: ProjectStatus
  tags: string[]
  price?: string
  language_directions: string[]
  client_name: string
}

const columnHelper = createColumnHelper<ProjectTableRow>()

// TODO: we keep all filtering and sorting options inside form
// This was we can do a new request easily every time form values change
interface FormValues {
  statuses: ProjectStatus[]
  only_show_personal_projects: boolean
  q: string
  order_category: string[]
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
  const initialFilters: ProjectsPayloadType = {
    per_page: 50,
    sort_by: 'deadline_at',
    sort_order: 'asc',
    page: 1,
    ...Object.fromEntries(searchParams.entries()),
    statuses: onlyNewProjectsAllowed
      ? [ProjectStatus.New]
      : searchParams.getAll('statuses'),
    tag_ids: searchParams.getAll('tag_ids'),
    language_directions: searchParams.getAll('language_directions'),
    only_show_personal_projects: onlyPersonalProjectsAllowed
      ? 1
      : Number(searchParams.get('only_show_personal_projects')) || 0,
    type_classifier_value_ids: searchParams.getAll('type_classifier_value_ids'),
    client_institution_user_ids: searchParams.getAll(
      'client_institution_user_ids'
    ),
  }

  const {
    projects,
    paginationData,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
    filters,
  } = useFetchProjects(initialFilters, true)

  const { languages: projectLanguages } = useProjectLanguagesFetch()

  const { tagsFilters = [] } = useFetchTags({
    type: TagTypes.Project,
  })
  const {
    classifierValues: allProjectTypes,
    classifierValuesFilters: allTypeFilters,
  } = useClassifierValuesFetch({ type: ClassifierValueType.ProjectType })
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
    setSelectedValues(filters?.language_directions || [])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters?.language_directions])

  const statusFilters = map(ProjectStatus, (status) => ({
    label: t(`projects.status.${status}`),
    value: status,
  }))

  const defaultPaginationData = {
    per_page: Number(filters.per_page),
    page: Number(filters.page) - 1,
  }

  // TODO: remove default values, once we have actual data
  const projectRows = useMemo(
    () =>
      map(
        projects,
        ({
          reference_number,
          sub_projects,
          deadline_at,
          created_at,
          event_start_at,
          ext_id,
          type_classifier_value,
          status,
          tags,
          price,
          client_institution_user,
        }) => {
          const client_name = !client_institution_user
            ? ''
            : client_institution_user?.user.forename +
              ' ' +
              client_institution_user?.user.surname

          return {
            ext_id,
            reference_number,
            deadline_at,
            created_at,
            event_start_at,
            type: type_classifier_value?.name || '',
            status,
            tags: map(tags, 'name'),
            price,
            client_name,
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

  const verbalTypeIds = useMemo(
    () =>
      (allProjectTypes ?? [])
        .filter((t) =>
          includes(VERBAL_TYPE_VALUES, t.value as TypesWithStartTime)
        )
        .map((t) => t.id),
    [allProjectTypes]
  )

  const nonVerbalTypeIds = useMemo(
    () =>
      (allProjectTypes ?? [])
        .filter(
          (t) => !includes(VERBAL_TYPE_VALUES, t.value as TypesWithStartTime)
        )
        .map((t) => t.id),
    [allProjectTypes]
  )

  const typeFilters = useMemo(
    () =>
      (allTypeFilters ?? []).filter(
        (_, i) =>
          !includes(
            VERBAL_TYPE_VALUES,
            allProjectTypes?.[i]?.value as TypesWithStartTime
          )
      ),
    [allTypeFilters, allProjectTypes]
  )

  const verbalTypeFilters = useMemo(
    () =>
      (allTypeFilters ?? []).filter((_, i) =>
        includes(
          VERBAL_TYPE_VALUES,
          allProjectTypes?.[i]?.value as TypesWithStartTime
        )
      ),
    [allTypeFilters, allProjectTypes]
  )

  const defaultFilterValues = useMemo(
    () => ({
      statuses: (filters?.statuses as ProjectStatus[]) || [],
      only_show_personal_projects: !!(onlyPersonalProjectsAllowed
        ? 1
        : Number(filters?.only_show_personal_projects) || 0),
      ext_id: filters?.ext_id || '',
      order_category: ['translation'],
    }),
    [
      filters?.ext_id,
      filters?.only_show_personal_projects,
      filters?.statuses,
      onlyPersonalProjectsAllowed,
    ]
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
      if (filters && 'language_directions' in filters) {
        const { language_directions, ...rest } = currentFilters || {}
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

      if (filters && 'type_classifier_value_ids' in filters) {
        const { type_classifier_value_ids, ...rest } = currentFilters || {}

        currentFilters = {
          type_classifier_value_ids: Array.isArray(type_classifier_value_ids)
            ? type_classifier_value_ids
            : type_classifier_value_ids
              ? [type_classifier_value_ids as string]
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
      handleFilterChange({
        ...rest,
        only_show_personal_projects: payload?.only_show_personal_projects
          ? 1
          : 0,
        type_classifier_value_ids: categoryTypeIds,
      })
    },
    [handleFilterChange, verbalTypeIds, nonVerbalTypeIds]
  )

  useEffect(() => {
    // Submit form every time it changes
    const subscription = watch(() => handleSubmit(onSubmit)())
    return () => subscription.unsubscribe()
  }, [handleSubmit, watch, onSubmit])

  // Re-submit when type lists load (initial render fires before types are fetched)
  const prevNonVerbalLengthRef = useRef(0)
  useEffect(() => {
    if (nonVerbalTypeIds.length > 0 && prevNonVerbalLengthRef.current === 0) {
      prevNonVerbalLengthRef.current = nonVerbalTypeIds.length
      handleSubmit(onSubmit)()
    }
  }, [nonVerbalTypeIds, handleSubmit, onSubmit])

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
      meta: {
        sortingParameterName: 'ext_id',
        sortingOption: ['asc', 'desc'],
        currentSorting: filters?.sort_by === 'ext_id' ? filters.sort_order : '',
      },
    }),
    columnHelper.accessor('reference_number', {
      header: () => t('label.reference_number'),
      footer: (info) => info.column.id,
      meta: {
        sortingParameterName: 'reference_number',
        sortingOption: ['asc', 'desc'],
        currentSorting:
          filters?.sort_by === 'reference_number' ? filters.sort_order : '',
      },
    }),
    columnHelper.accessor('language_directions', {
      header: () => t('label.language_directions'),
      footer: (info) => info.column.id,
      cell: ({ getValue }) => <LanguageDirectionTags values={getValue()} />,
      meta: {
        FilteringComponent: (
          <TableSelectFilter
            filterKey="language_directions"
            options={languageDirectionFilters}
            onEndReached={loadMore}
            onSearch={handleSearch}
            showSearch
            value={
              filters?.language_directions
                ? filters?.language_directions.map((item) =>
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
            filterKey="type_classifier_value_ids"
            options={
              includes(orderCategory, 'verbal')
                ? verbalTypeFilters
                : typeFilters
            }
            value={filters?.type_classifier_value_ids || []}
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
            showSearch
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
        sortingOption: ['asc', 'desc'],
        currentSorting: filters?.sort_by === 'price' ? filters.sort_order : '',
      },
    }),
    ...(includes(orderCategory, 'verbal')
      ? []
      : [
          columnHelper.accessor('deadline_at', {
            header: () => t('label.deadline_at'),
            footer: (info) => info.column.id,
            cell: ({ getValue, row }) => {
              const value = getValue()
              if (!value) {
                return <span />
              }
              const deadlineDate = dayjs(value)
              if (!deadlineDate.isValid()) {
                return <span />
              }
              const currentDate = dayjs()
              const diff = deadlineDate.diff(currentDate)
              const formattedDate = deadlineDate.format('DD.MM.YYYY HH:mm')
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
              FilteringComponent: (
                <TableDateFilter
                  filterKey="deadline_at"
                  value={filters?.deadline_at}
                />
              ),
              sortingOption: ['asc', 'desc'],
              currentSorting:
                filters?.sort_by === 'deadline_at' ? filters.sort_order : '',
            },
          }),
        ]),
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
    ...(includes(orderCategory, 'verbal')
      ? [
          columnHelper.accessor('event_start_at', {
            header: () => t('label.event_start_at'),
            footer: (info) => info.column.id,
            meta: {
              sortingOption: ['asc', 'desc'],
              currentSorting:
                filters?.sort_by === 'event_start_at'
                  ? filters.sort_order
                  : '',
              FilteringComponent: (
                <TableDateFilter
                  filterKey="event_start_at"
                  value={filters?.event_start_at}
                />
              ),
            },
            cell: ({ getValue }) => {
              const value = getValue()

              if (!value) {
                return <span />
              }

              const formattedDate = dayjs(value).format('DD.MM.YYYY HH:mm')

              return <span>{formattedDate}</span>
            },
          }),
        ]
      : []),
    columnHelper.accessor('client_name', {
      header: () => t('label.client'),
      footer: (info) => info.column.id,
      meta: {
        sortingParameterName: 'clientInstitutionUser.name',
        sortingOption: ['asc', 'desc'],
        currentSorting:
          filters?.sort_by === 'clientInstitutionUser.name'
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
  ] as ColumnDef<ProjectTableRow>[]

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
                {
                  value: 'translation',
                  label: t('projects.order_category_translation'),
                },
                { value: 'verbal', label: t('projects.order_category_verbal') },
              ]}
              inputType={InputTypes.TagsSelect}
              hideAll
            />
            <FormInput
              name="statuses"
              control={control}
              options={statusFilters}
              inputType={InputTypes.TagsSelect}
              disabled={onlyNewProjectsAllowed}
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

export default ProjectsTable
