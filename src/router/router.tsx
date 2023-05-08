import PageNotFound from 'pages/PageNotFound/PageNotFound'
import MainLayout from 'components/organisms/MainLayout/MainLayout'
import Landing from 'pages/Landing/Landing'
import Test from 'pages/Test/Test'

import { createBrowserRouter } from 'react-router-dom'

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <PageNotFound />,
    children: [
      {
        path: '',
        element: <Landing />,
      },
      {
        path: 'test',
        element: <Test />,
      },
    ],
  },
])

export default router
