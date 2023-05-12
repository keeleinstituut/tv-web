import PageNotFound from 'pages/PageNotFound/PageNotFound'
import MainLayout from 'components/templates/MainLayout/MainLayout'
import AuthWrapper from 'components/templates/AuthWrapper/AuthWrapper'
import { FC, SVGProps } from 'react'
import { map } from 'lodash'
import { deepOmit } from 'helpers'
import i18n from 'i18n/i18n'
import { createBrowserRouter, RouteObject } from 'react-router-dom'

// import pages
import Dashboard from 'pages/Dashboard/Dashboard'
import Orders from 'pages/Orders/Orders'
import SubOrders from 'pages/SubOrders/SubOrders'
import MyTasks from 'pages/MyTasks/MyTasks'
import PerformersDatabase from 'pages/PerformersDatabase/PerformersDatabase'
import TranslationMemories from 'pages/TranslationMemories/TranslationMemories'
import UsersManagement from 'pages/UsersManagement/UsersManagement'
import RolesManagement from 'pages/RolesManagement/RolesManagement'
import Logs from 'pages/Logs/Logs'
import Flags from 'pages/Flags/Flags'
import ReportExport from 'pages/ReportExport/ReportExport'
import InstitutionSettings from 'pages/InstitutionSettings/InstitutionSettings'
import TechnicalSettings from 'pages/TechnicalSettings/TechnicalSettings'
import Components from 'pages/Components/Components'

// import icons

import { ReactComponent as HomeIcon } from 'assets/icons/home.svg'
import { ReactComponent as OrdersIcon } from 'assets/icons/orders.svg'
import { ReactComponent as PerformersIcon } from 'assets/icons/performers.svg'
import { ReactComponent as MemoriesIcon } from 'assets/icons/memories.svg'
import { ReactComponent as UsersIcon } from 'assets/icons/users.svg'
import { ReactComponent as RolesIcon } from 'assets/icons/roles.svg'
import { ReactComponent as LogsIcon } from 'assets/icons/logs.svg'
import { ReactComponent as FlagsIcon } from 'assets/icons/flags.svg'
import { ReactComponent as ReportIcon } from 'assets/icons/download.svg'
import { ReactComponent as InstitutionIcon } from 'assets/icons/settings.svg'
import { ReactComponent as TechnicalIcon } from 'assets/icons/technical.svg'

export type FullRouteObject = Omit<RouteObject, 'children'> & {
  label: string
  Icon?: FC<SVGProps<SVGSVGElement>>
  children?: FullRouteObject[]
  isInterTitle?: boolean
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
    children: [
      {
        path: '',
        label: i18n.t('menu.sub_orders'),
        element: <Orders />,
      },
      {
        path: 'sub_orders',
        label: i18n.t('menu.sub_orders'),
        element: <SubOrders />,
      },
      {
        path: 'my_tasks',
        label: i18n.t('menu.my_tasks'),
        element: <MyTasks />,
      },
    ],
  },
  {
    path: 'performers',
    label: i18n.t('menu.performers_database'),
    element: <PerformersDatabase />,
    Icon: PerformersIcon,
  },
  {
    path: 'memories',
    label: i18n.t('menu.translation_memories'),
    element: <TranslationMemories />,
    Icon: MemoriesIcon,
  },
  {
    path: 'settings',
    label: i18n.t('menu.settings'),
    isInterTitle: true,
    children: [
      {
        path: 'users',
        label: i18n.t('menu.user_management'),
        element: <UsersManagement />,
        Icon: UsersIcon,
      },
      {
        path: 'roles',
        label: i18n.t('menu.role_management'),
        element: <RolesManagement />,
        Icon: RolesIcon,
      },
      {
        path: 'logs',
        label: i18n.t('menu.logs'),
        element: <Logs />,
        Icon: LogsIcon,
      },
      {
        path: 'flags',
        label: i18n.t('menu.flags'),
        element: <Flags />,
        Icon: FlagsIcon,
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
