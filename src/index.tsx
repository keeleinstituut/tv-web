import ReactDOM from 'react-dom/client'
import './styles/global.scss'
import './i18n/i18n'
import router from 'router/router'
import reportWebVitals from './reportWebVitals'
import NotificationRoot from 'components/organisms/NotificationRoot/NotificationRoot'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { RouterProvider } from 'react-router-dom'
import dayjs from 'dayjs'
import('dayjs/locale/et')

dayjs.locale('et')

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // default: true
    },
  },
})

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

root.render(
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
    <NotificationRoot />
  </QueryClientProvider>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
