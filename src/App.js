import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import MainLayout from './layout/MainLayout'
import Profile from "./pages/Profile";
import Suppliers from "./pages/Suppliers";
import DailyEntriesPage from "./pages/DailyEntriesPage";

// Example of a Protected Route
function PrivateRoute({ children }) {
  const isAuthenticated = !!localStorage.getItem('supabase.auth.token')
  // Or, you can read from supabase.auth.getSession()
  // in a real app. The snippet here is simplified.

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return children
}

export default function App() {
  return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
            path="/"
            element={
              <PrivateRoute>
                <MainLayout />
              </PrivateRoute>
            }
        >
            {/* All routes inside the MainLayout are protected */}
            <Route index element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="suppliers" element={<Suppliers />} />
            <Route path="daily-entry" element={<DailyEntriesPage />} />
        </Route>
      </Routes>
  )
}
