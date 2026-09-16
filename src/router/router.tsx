import PageNotFound from 'pages/PageNotFound/PageNotFound'
import MainLayout from 'components/templates/MainLayout/MainLayout'
import AuthWrapper from 'components/templates/AuthWrapper/AuthWrapper'
import { FC, SVGProps } from 'react'
import { map } from 'lodash'
import { deepOmit } from 'helpers'
import i18n from 'i18n/i18n'
import { createBrowserRouter, Outlet, RouteObject } from 'react-router-dom'
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
import LogsOld from 'pages/LogsOld/Logs'
import NewProject from 'pages/NewProject/NewProject'
import Tags from 'pages/Tags/Tags'
import ReportExport from 'pages/ReportExport/ReportExport'
import InstitutionSettings from 'pages/InstitutionSettings/InstitutionSettings'
import TechnicalSettings from 'pages/TechnicalSettings/TechnicalSettings'
import ProjectPage from 'pages/ProjectPage/ProjectPage'
import UserDetails from 'pages/UserDetails/UserDetails'
import Manual from 'pages/Manual/Manual'
import TaskPage from 'pages/TaskPage/TaskPage'
import Calendar from 'pages/Calendar/Calendar'
import CalendarAccessGuard from 'components/templates/CalendarAccessGuard/CalendarAccessGuard'
import CalendarOrderDetail from 'pages/CalendarOrderDetail/CalendarOrderDetail'
import CalendarOrderBreadcrumb from 'components/molecules/Breadcrumbs/CalendarOrderBreadcrumb'
import GeneralPriceList from 'pages/GeneralPriceList/GeneralPriceList'
import VendorTasks from 'pages/VendorTasks/VendorTasks'
import Terms from 'pages/Terms/Terms'
import MachineTranslation from 'pages/MachineTranslation/MachineTranslation'
import OutsourceOffer from 'pages/OutsourceOffer/OutsourceOffer'
import OutsourceOfferDetailPage from 'pages/OutsourceOfferDetailPage/OutsourceOfferDetailPage'
import InstitutionPartnersDatabase from 'pages/InstitutionPartnersDatabase/InstitutionPartnersDatabase'
import InstitutionPartnerPage from 'pages/InstitutionPartnerPage/InstitutionPartnerPage'
import Statistics from 'pages/Statistics/Statistics'

// import icons

import HomeIcon from 'assets/icons/home.svg?react'
import ProjectsIcon from 'assets/icons/projects.svg?react'
import VendorsIcon from 'assets/icons/vendors.svg?react'
import MemoriesIcon from 'assets/icons/memories.svg?react'
import UsersIcon from 'assets/icons/users.svg?react'
import RolesIcon from 'assets/icons/roles.svg?react'
import LogsIcon from 'assets/icons/logs.svg?react'
import TagsIcon from 'assets/icons/tags.svg?react'
import ReportIcon from 'assets/icons/download.svg?react'
import InstitutionIcon from 'assets/icons/settings.svg?react'
import TechnicalIcon from 'assets/icons/technical.svg?react'
import ManualIcon from 'assets/icons/question_mark.svg?react'
import TermsIcon from 'assets/icons/terms_icon.svg?react'
import CalendarIcon from 'assets/icons/calendar_menu.svg?react'
import MachineTranslationIcon from 'assets/icons/memories.svg?react'
import StatisticsIcon from 'assets/icons/logs.svg?react'

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
  isHiddenForTranslationAgency?: boolean
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
          {
            path: ':projectId',
            element: <ProjectPage />,
            privileges: [Privileges.ViewPersonalProject],
            breadcrumb: BreadcrumbsTitle,
          },
        ],
      },
      {
        path: 'sub-projects',
        label: i18n.t('menu.sub_projects'),
        privileges: [Privileges.ViewPersonalProject],
        children: [
          {
            path: '',
            element: <SubProjects />,
            privileges: [Privileges.ViewPersonalProject],
            breadcrumb: i18n.t('projects.sub_project_tile'),
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
        path: 'outsource-offers',
        label: i18n.t('menu.requests'),
        privileges: [Privileges.ViewRequests],
        children: [
          {
            path: '',
            element: <OutsourceOffer />,
            privileges: [Privileges.ViewRequests],
            breadcrumb: i18n.t('menu.requests'),
          },
          {
            path: ':offerId',
            element: <OutsourceOfferDetailPage />,
            privileges: [Privileges.ViewRequests],
            breadcrumb: BreadcrumbsTitle,
          },
        ],
      },
    ],
  },
  {
    path: 'calendar',
    label: i18n.t('menu.calendar'),
    Icon: CalendarIcon,
    isHiddenForTranslationAgency: true,
    element: (
      <CalendarAccessGuard>
        <Outlet />
      </CalendarAccessGuard>
    ),
    children: [
      {
        path: '',
        element: <Calendar />,
        breadcrumb: i18n.t('menu.calendar'),
      },
      {
        path: 'new-order',
        element: <CalendarOrderDetail />,
        breadcrumb: i18n.t('calendar.add_order'),
      },
      {
        path: ':orderId',
        element: <CalendarOrderDetail />,
        breadcrumb: CalendarOrderBreadcrumb,
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
        children: [
          {
            path: '',
            element: <VendorPage />,
            privileges: [Privileges.EditVendorDb, Privileges.ViewVendorDb],
            breadcrumb: BreadcrumbsTitle,
          },
          {
            path: 'vendor-tasks',
            element: <VendorTasks />,
            privileges: [Privileges.ViewVendorTask],
            breadcrumb: BreadcrumbsTitle,
          },
        ],
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
    path: 'institution-partners',
    label: i18n.t('menu.institution_partners'),
    Icon: VendorsIcon,
    privileges: [Privileges.ViewExternalPartner],
    children: [
      {
        path: '',
        element: <InstitutionPartnersDatabase />,
        privileges: [Privileges.ViewExternalPartner],
        breadcrumb: i18n.t('menu.institution_partners'),
      },
      {
        path: ':institutionPartnerId',
        element: <InstitutionPartnerPage />,
        privileges: [Privileges.ViewExternalPartner],
        breadcrumb: BreadcrumbsTitle,
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
          Privileges.EditTm,
          Privileges.DeleteTm,
        ],
      },
    ],
  },
  {
    path: 'machine-translation',
    label: i18n.t('menu.language_tools'),
    element: <MachineTranslation />,
    Icon: MachineTranslationIcon,
    privileges: [
      Privileges.UseMachineTranslationETranslation,
      Privileges.UseMachineTranslationAzureOpenAI,
    ],
  },
  {
    path: 'statistics',
    label: i18n.t('menu.statistics'),
    element: <Statistics />,
    Icon: StatisticsIcon,
    privileges: [Privileges.ViewStatistic],
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
      // {
      //   path: 'logs-old',
      //   label: i18n.t('menu.logs') + " VANA",
      //   element: <LogsOld />,
      //   Icon: LogsIcon,
      //   privileges: [Privileges.ViewAuditLog],
      // },
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
        privileges: [Privileges.ExportInstitutionGeneralReport],
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
    path: 'terms',
    label: i18n.t('menu.sidebar_terms'),
    element: <Terms />,
    Icon: TermsIcon,
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
