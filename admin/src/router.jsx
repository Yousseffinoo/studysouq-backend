import { createBrowserRouter, Navigate } from 'react-router-dom'
import { Login } from './pages/auth/Login'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { DashboardHome } from './pages/dashboard/DashboardHome'
import { Subjects } from './pages/subjects/Subjects'
import { Sections } from './pages/sections/Sections'
import { Lessons } from './pages/lessons/Lessons'
import { Notes } from './pages/notes/Notes'
import { Questions } from './pages/questions/Questions'
import { Users } from './pages/users/Users'
import { Payments } from './pages/payments/Payments'
import { Settings } from './pages/settings/Settings'
import { Images } from './pages/images/Images'
import { Pricing } from './pages/pricing/Pricing'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardHome />,
      },
      {
        path: 'subjects',
        element: <Subjects />,
      },
      {
        path: 'sections',
        element: <Sections />,
      },
      {
        path: 'lessons',
        element: <Lessons />,
      },
      {
        path: 'notes',
        element: <Notes />,
      },
      {
        path: 'questions',
        element: <Questions />,
      },
      {
        path: 'users',
        element: <Users />,
      },
      {
        path: 'payments',
        element: <Payments />,
      },
      {
        path: 'images',
        element: <Images />,
      },
      {
        path: 'pricing',
        element: <Pricing />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
    ],
  },
])






