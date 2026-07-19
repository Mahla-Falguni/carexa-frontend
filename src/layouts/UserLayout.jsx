import React, { useState } from 'react'

import { Navigate, Outlet } from 'react-router-dom'

import UserHeader from '../components/User/UserHeader'

import UserSidebar from '../components/User/UserSidebar'

import UserFooter from '../components/User/UserFooter'

const UserLayout = () => {

  const token = localStorage.getItem('UserToken')

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [globalSearch, setGlobalSearch] = useState('')

  // Redirect to login if not authenticated

  if (!token) return <Navigate to="/login" replace />

  return (

    <>

      <style>{`

    .ul-body {

      min-height: 100vh;

      display: flex;

      flex-direction: column;

      background: #f0f4f8;

    }

    .ul-main {

      flex: 1;

      margin-top: 64px;

      padding: 28px 32px 40px;

      width: 100%;

      box-sizing: border-box;

    }

    @media (max-width: 600px) {

      .ul-main { padding: 16px 14px 32px; }

    }

  `}</style>



      <div className="ul-body">

        <UserHeader

          onToggleSidebar={() => setSidebarOpen(o => !o)}

          sidebarOpen={sidebarOpen}

          onSearch={setGlobalSearch}

        />



        <UserSidebar

          isOpen={sidebarOpen}

          onClose={() => setSidebarOpen(false)}

        />



        <main className="ul-main">

          {/* Child route pages render here */}

          <Outlet context={{ globalSearch }} />

        </main>



        <UserFooter />

      </div>

    </>

  )

}

export default UserLayout