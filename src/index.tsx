import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles/global.scss'
import './i18n/i18n'
import router from 'router/router'
import reportWebVitals from './reportWebVitals'

import { RouterProvider } from 'react-router-dom'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

root.render(<RouterProvider router={router} />)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
