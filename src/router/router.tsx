import PageNotFound from 'pages/PageNotFound/PageNotFound'
import MainLayout from 'components/templates/MainLayout/MainLayout'
import AuthWrapper from 'components/templates/AuthWrapper/AuthWrapper'
import { FC, SVGProps } from 'react'
import { map } from 'lodash'
import { deepOmit } from 'helpers'
import i18n from 'i18n/i18n'
import { createBrowserRouter, RouteObject } from 'react-router-dom'
import { Privileges } from 'types/privileges'

// import pages
import Dashboard from 'pages/Dashboard/Dashboard'
import Orders from 'pages/Orders/Orders'
import SubOrders from 'pages/SubOrders/SubOrders'
import MyTasks from 'pages/MyTasks/MyTasks'
import VendorsDatabase from 'pages/VendorsDatabase/VendorsDatabase'
import VendorPage from 'pages/VendorPage/VendorPage'
import TranslationMemories from 'pages/TranslationMemories/TranslationMemories'
import UsersManagement from 'pages/UsersManagement/UsersManagement'
import AddUsersPage from 'pages/AddUsersPage/AddUsersPage'
import UserPage from 'pages/UserPage/UserPage'
import RolesManagement from 'pages/RolesManagement/RolesManagement'
import Logs from 'pages/Logs/Logs'
import NewOrder from 'pages/NewOrder/NewOrder'
import Tags from 'pages/Tags/Tags'
import ReportExport from 'pages/ReportExport/ReportExport'
import InstitutionSettings from 'pages/InstitutionSettings/InstitutionSettings'
import TechnicalSettings from 'pages/TechnicalSettings/TechnicalSettings'
import OrderPage from 'pages/OrderPage/OrderPage'
import UserDetails from 'pages/UserDetails/UserDetails'
import Manual from 'pages/Manual/Manual'
import TaskPage from 'pages/TaskPage/TaskPage'
import Components from 'pages/Components/Components'

// import icons

import { ReactComponent as HomeIcon } from 'assets/icons/home.svg'
import { ReactComponent as OrdersIcon } from 'assets/icons/orders.svg'
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

export type FullRouteObject = Omit<RouteObject, 'children'> & {
  label?: string
  Icon?: FC<SVGProps<SVGSVGElement>>
  children?: FullRouteObject[]
  isInterTitle?: boolean
  privileges?: Privileges[]
}

export const protectedRoutes: FullRouteObject[] = [
  {
    path: '',
    element: <Dashboard />,
    label: i18n.t('menu.landing'),
    Icon: HomeIcon,
  },
  {
    path: 'orders',
    label: i18n.t('menu.orders'),
    Icon: OrdersIcon,
    privileges: [
      Privileges.CreateProject,
      Privileges.ManageProject,
      Privileges.ReceiveAndManageProject,
      Privileges.ViewInstitutionProjectList,
      Privileges.ViewInstitutionProjectDetail,
      Privileges.ViewPersonalProject,
    ],
    children: [
      {
        path: '',
        label: i18n.t('menu.orders'),
        privileges: [
          Privileges.ViewInstitutionProjectList,
          Privileges.ViewInstitutionProjectDetail,
          Privileges.ViewPersonalProject,
          Privileges.ViewPersonalTask,
        ],
        children: [
          {
            path: '',
            element: <Orders />,
            privileges: [
              Privileges.ViewPersonalProject,
              Privileges.ViewInstitutionProjectList,
              Privileges.ViewInstitutionProjectDetail,
            ],
          },
          {
            path: 'new-order',
            element: <NewOrder />,
            privileges: [Privileges.CreateProject],
          },
        ],
      },
      {
        path: 'sub-orders',
        label: i18n.t('menu.sub_orders'),
        element: <SubOrders />,
        privileges: [
          Privileges.ViewPersonalProject,
          Privileges.ViewInstitutionProjectList,
          Privileges.ViewInstitutionProjectDetail,
        ],
      },
      {
        path: 'my-tasks',
        label: i18n.t('menu.my_tasks'),
        children: [
          {
            path: '',
            element: <MyTasks />,
            privileges: [Privileges.ViewPersonalTask],
          },
          {
            path: ':taskId',
            element: <TaskPage />,
            privileges: [],
          },
        ],
      },
      {
        path: ':orderId',
        element: <OrderPage />,
        privileges: [Privileges.ViewInstitutionProjectDetail],
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
      },
      {
        path: ':vendorId',
        element: <VendorPage />,
        privileges: [Privileges.EditVendorDb],
      },
    ],
  },
  {
    path: 'memories',
    label: i18n.t('menu.translation_memories'),
    element: <TranslationMemories />,
    Icon: MemoriesIcon,
    privileges: [
      Privileges.CreateTm,
      Privileges.ViewTm,
      Privileges.ImportTm,
      Privileges.ExportTm,
      Privileges.EditTmMetadata,
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
        privileges: [
          Privileges.AddUser,
          Privileges.ViewUser,
          Privileges.EditUser,
          Privileges.DeactivateUser,
          Privileges.ActivateUser,
          Privileges.ArchiveUser,
          Privileges.ExportUser,
          Privileges.EditUserVacation,
          Privileges.EditUserWorktime,
        ],
        Icon: UsersIcon,
        children: [
          {
            path: '',
            element: <UsersManagement />,
            privileges: [
              Privileges.AddUser,
              Privileges.ViewUser,
              Privileges.EditUser,
              Privileges.DeactivateUser,
              Privileges.ActivateUser,
              Privileges.ArchiveUser,
              Privileges.ExportUser,
              Privileges.EditUserVacation,
              Privileges.EditUserWorktime,
            ],
          },
          {
            path: ':userId',
            element: <UserPage />,
            privileges: [Privileges.ViewUser],
          },
          {
            path: 'add',
            element: <AddUsersPage />,
            privileges: [Privileges.AddUser],
          },
        ],
      },
      {
        path: 'roles',
        label: i18n.t('menu.role_management'),
        element: <RolesManagement />,
        Icon: RolesIcon,
        privileges: [
          Privileges.AddRole,
          Privileges.ViewRole,
          Privileges.EditRole,
          Privileges.DeleteRole,
        ],
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
      },
    ],
  },
  {
    path: 'manual',
    label: i18n.t('menu.manual'),
    element: <Manual />,
    Icon: ManualIcon,
  },
]

const protectedRoutesForReactRouter: RouteObject[] = map(
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
