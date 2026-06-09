// src/layouts/PublicLayout.jsx
//
// ✅ THE FIX:
//   Old broken version imported UserNavbar from '../layouts/UserNavbar' — wrong path
//   (PublicLayout IS inside layouts/, so '../layouts/' goes up and back into itself)
//   Also rendered an inline <footer> instead of the shared UserFooter component.
//
//   This version:
//   1. Imports UserNavbar from './UserNavbar'          (same folder — correct)
//   2. Imports UserFooter from '../components/User/UserFooter' (correct)
//   3. No navbar inside individual pages needed — <Outlet /> gets it automatically

import React from 'react'
import { Outlet } from 'react-router-dom'
import UserNavbar from './UserNavbar'
import UserFooter from '../components/User/UserFooter'

const PublicLayout = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <UserNavbar />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <UserFooter />
    </div>
  )
}

export default PublicLayout