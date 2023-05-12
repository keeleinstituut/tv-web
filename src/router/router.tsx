import PageNotFound from 'pages/PageNotFound/PageNotFound'
import MainLayout from 'components/templates/MainLayout/MainLayout'
import AuthWrapper from 'components/templates/AuthWrapper/AuthWrapper'
import Test from 'pages/Test/Test'
import Components from 'pages/Components/Components'

import { createBrowserRouter } from 'react-router-dom'

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
        path: '/',
        element: <MainLayout />,
        errorElement: <PageNotFound />,
        children: [
          {
            path: 'dashboard',
            element: <Test />,
          },
        ],
      },
    ],
  },
])

export default router
