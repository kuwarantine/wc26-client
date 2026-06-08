import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { GroupTables } from './components/Group.tsx'
import { Matches } from './components/Match.tsx'
import { Standings } from './components/Standings.tsx'
import { Knockout } from './components/Knockout.tsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '',
        element: <GroupTables />,
      },
      {
        path: 'groups',
        element: <GroupTables />,
      },
      {
        path: 'matches',
        element: <Matches />
      },
      {
        path: 'standings',
        element: <Standings />
      },
      {
        path: 'knockouts',
        element: <Knockout />
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
