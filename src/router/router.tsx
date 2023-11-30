import PageNotFound from 'pages/PageNotFound/PageNotFound'
import MainLayout from 'components/templates/MainLayout/MainLayout'
import AuthWrapper from 'components/templates/AuthWrapper/AuthWrapper'
import { FC, SVGProps } from 'react'
import { map } from 'lodash'
import { deepOmit } from 'helpers'
import i18n from 'i18n/i18n'
import { createBrowserRouter, RouteObject } from 'react-router-dom'
import { Privileges } from 'types/privileges'
import BreadcrumbsTitle from 'components/molecules/Breadcrumbs/BreadcrumbsTitle'
import { BreadcrumbComponentType } from 'use-react-router-breadcrumbs'

// import pages
import Dashboard from 'pages/Dashboard/Dashboard'
import Projects from 'pages/Projects/Projects'
import SubProjects from 'pages/SubProjects/SubProjects'
import MyTasks from 'pages/MyTasks/MyTasks'
import VendorsDatabase from 'pages/VendorsDatabase/VendorsDatabase'
import VendorPage from 'pages/VendorPage/VendorPage'
import TranslationMemories from 'pages/TranslationMemories/TranslationMemories'
import TranslationMemoryPage from 'pages/TranslationMemoryPage/TranslationMemoryPage'
import NewTranslationMemory from 'pages/NewTranslationMemory/NewTranslationMemory'
import UsersManagement from 'pages/UsersManagement/UsersManagement'
import AddUsersPage from 'pages/AddUsersPage/AddUsersPage'
import UserPage from 'pages/UserPage/UserPage'
import RolesManagement from 'pages/RolesManagement/RolesManagement'
import Logs from 'pages/Logs/Logs'
import NewProject from 'pages/NewProject/NewProject'
import Tags from 'pages/Tags/Tags'
import ReportExport from 'pages/ReportExport/ReportExport'
import InstitutionSettings from 'pages/InstitutionSettings/InstitutionSettings'
import TechnicalSettings from 'pages/TechnicalSettings/TechnicalSettings'
import ProjectPage from 'pages/ProjectPage/ProjectPage'
import UserDetails from 'pages/UserDetails/UserDetails'
import Manual from 'pages/Manual/Manual'
import TaskPage from 'pages/TaskPage/TaskPage'
import Components from 'pages/Components/Components'

// import icons

import { ReactComponent as HomeIcon } from 'assets/icons/home.svg'
import { ReactComponent as ProjectsIcon } from 'assets/icons/projects.svg'
import { ReactComponent as VendorsIcon } from 'assets/icons/vendors.svg'
import { ReactComponent as MemoriesIcon } from 'assets/icons/memories.svg'
import { ReactComponent as UsersIcon } from 'assets/icons/users.svg'
import { ReactComponent as RolesIcon } from 'assets/icons/roles.svg'
import { ReactComponent as LogsIcon } from 'assets/icons/logs.svg'
import { ReactComponent as TagsIcon } from 'assets/icons/tags.svg'
import { ReactComponent as ReportIcon } from 'assets/icons/download.svg'
import { ReactComponent as InstitutionIcon } from 'assets/icons/settings.svg'
import { ReactComponent as TechnicalIcon } from 'assets/icons/technical.svg'
import { ReactComponent as ManualIcon } from 'assets/icons/question_mark.svg'
import GeneralPriceList from 'pages/GeneralPriceList/GeneralPriceList'

export type FullRouteObject<ParamKey extends string = string> = Omit<
  RouteObject,
  'children'
> & {
  label?: string
  Icon?: FC<SVGProps<SVGSVGElement>>
  children?: FullRouteObject[]
  isInterTitle?: boolean
  privileges?: Privileges[]
  breadcrumb?: BreadcrumbComponentType<ParamKey> | string | null
}

export const protectedRoutes: FullRouteObject[] = [
  {
    path: '',
    element: <Dashboard />,
    label: i18n.t('menu.landing'),
    Icon: HomeIcon,
  },
  {
    path: 'projects',
    label: i18n.t('menu.projects'),
    Icon: ProjectsIcon,
    privileges: [Privileges.ViewPersonalProject],
    children: [
      {
        path: '',
        label: i18n.t('menu.projects'),
        privileges: [Privileges.ViewPersonalProject],
        children: [
          {
            path: '',
            element: <Projects />,
            privileges: [Privileges.ViewPersonalProject],
            breadcrumb: i18n.t('projects.project_tile'),
          },
          {
            path: 'new-project',
            element: <NewProject />,
            privileges: [Privileges.CreateProject],
            breadcrumb: i18n.t('projects.new_project_title'),
          },
        ],
      },
      {
        path: 'sub-projects',
        label: i18n.t('menu.sub_projects'),
        element: <SubProjects />,
        privileges: [Privileges.ViewPersonalProject],
        breadcrumb: i18n.t('projects.sub_project_tile'),
      },
      {
        path: 'my-tasks',
        label: i18n.t('menu.my_tasks'),
        children: [
          {
            path: '',
            element: <MyTasks />,
            breadcrumb: i18n.t('menu.my_tasks'),
          },
          {
            path: ':taskId',
            element: <TaskPage />,
            breadcrumb: BreadcrumbsTitle,
            children: [
              {
                path: ':isHistoryView',
                element: <TaskPage />,
                breadcrumb: BreadcrumbsTitle,
              },
            ],
          },
        ],
      },
      {
        path: ':projectId',
        element: <ProjectPage />,
        privileges: [Privileges.ViewPersonalProject],
        breadcrumb: BreadcrumbsTitle,
      },
    ],
  },
  {
    path: 'vendors',
    label: i18n.t('menu.vendors_database'),
    Icon: VendorsIcon,
    privileges: [Privileges.ViewVendorDb],
    children: [
      {
        path: '',
        element: <VendorsDatabase />,
        privileges: [Privileges.ViewVendorDb],
        breadcrumb: i18n.t('menu.vendors_database'),
      },
      {
        path: ':vendorId',
        element: <VendorPage />,
        privileges: [Privileges.EditVendorDb, Privileges.ViewVendorDb],
        breadcrumb: BreadcrumbsTitle,
      },
      {
        path: 'price-list',
        element: <GeneralPriceList />,
        privileges: [Privileges.ViewGeneralPricelist],
        breadcrumb: i18n.t('vendors.price_list'),
      },
    ],
  },
  {
    path: 'memories',
    label: i18n.t('menu.translation_memories'),
    Icon: MemoriesIcon,
    privileges: [
      Privileges.CreateTm,
      Privileges.ViewTm,
      Privileges.ImportTm,
      Privileges.ExportTm,
      Privileges.EditTmMetadata,
      Privileges.EditTm,
      Privileges.DeleteTm,
    ],
    children: [
      {
        path: '',
        element: <TranslationMemories />,
        breadcrumb: i18n.t('menu.translation_memories'),
      },
      {
        path: 'new-memory',
        element: <NewTranslationMemory />,
        privileges: [Privileges.CreateTm],
        breadcrumb: i18n.t('translation_memories.new_translation_memory_title'),
      },
      {
        path: ':memoryId',
        element: <TranslationMemoryPage />,
        breadcrumb: BreadcrumbsTitle,
        privileges: [
          Privileges.CreateTm,
          Privileges.ViewTm,
          Privileges.ImportTm,
          Privileges.ExportTm,
          Privileges.EditTmMetadata,
          Privileges.EditTm,
          Privileges.DeleteTm,
        ],
      },
    ],
  },
  {
    path: 'user-details',
    element: <UserDetails />,
  },
  {
    path: 'settings',
    label: i18n.t('menu.settings'),
    isInterTitle: true,
    children: [
      {
        path: 'users',
        label: i18n.t('menu.user_management'),
        privileges: [Privileges.ViewUser],
        Icon: UsersIcon,
        children: [
          {
            path: '',
            element: <UsersManagement />,
            privileges: [Privileges.ViewUser],
            breadcrumb: i18n.t('menu.user_management'),
          },
          {
            path: ':userId',
            element: <UserPage />,
            privileges: [Privileges.ViewUser],
            breadcrumb: BreadcrumbsTitle,
          },
          {
            path: 'add',
            element: <AddUsersPage />,
            privileges: [Privileges.AddUser],
            breadcrumb: i18n.t('users.add_users'),
          },
        ],
      },
      {
        path: 'roles',
        label: i18n.t('menu.role_management'),
        element: <RolesManagement />,
        Icon: RolesIcon,
        privileges: [Privileges.ViewRole],
      },
      {
        path: 'logs',
        label: i18n.t('menu.logs'),
        element: <Logs />,
        Icon: LogsIcon,
        privileges: [Privileges.ViewAuditLog],
      },
      {
        path: 'tags',
        label: i18n.t('menu.tags'),
        element: <Tags />,
        Icon: TagsIcon,
        privileges: [
          Privileges.AddTag,
          Privileges.EditTag,
          Privileges.DeleteTag,
        ],
      },
      {
        path: 'report',
        label: i18n.t('menu.report_export'),
        element: <ReportExport />,
        Icon: ReportIcon,
      },
      {
        path: 'institution-settings',
        label: i18n.t('menu.institution_settings'),
        element: <InstitutionSettings />,
        Icon: InstitutionIcon,
      },
      {
        path: 'technical',
        label: i18n.t('menu.technical_settings'),
        element: <TechnicalSettings />,
        Icon: TechnicalIcon,
        privileges: [Privileges.ViewInstitutionPriceRate],
      },
    ],
  },
  {
    path: 'manual',
    label: i18n.t('menu.sidebar_manual'),
    element: <Manual />,
    Icon: ManualIcon,
  },
]

export const protectedRoutesForReactRouter: RouteObject[] = map(
  protectedRoutes,
  (route) => deepOmit<FullRouteObject, RouteObject>(route, ['label'])
)

const router = createBrowserRouter([
  {
    path: 'test',
    element: <Components />,
  },
  {
    path: '/',
    element: <AuthWrapper />,
    children: [
      {
        path: '',
        element: <MainLayout />,
        errorElement: <PageNotFound />,
        children: protectedRoutesForReactRouter,
      },
    ],
  },
])

export default router
