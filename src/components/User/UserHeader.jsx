import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'

const UserHeader = ({ onToggleSidebar, sidebarOpen }) => {
  const navigate = useNavigate()
  const username = localStorage.getItem('username') || 'Patient'
  const initials = username.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => {
    Swal.fire({
      title: 'Logging out?',
      text: 'You will be redirected to the login page.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#1558b0',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Yes, logout',
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('UserToken')
        localStorage.removeItem('username')
        navigate('/login')
      }
    })
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500&display=swap');

        .uh-root {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          height: 64px;
          background: #fff;
          border-bottom: 1.5px solid #e8f0f8;
          display: flex;
          align-items: center;
          padding: 0 24px;
          gap: 16px;
          box-shadow: 0 2px 12px rgba(11,29,58,0.06);
          font-family: 'DM Sans', sans-serif;
        }

        .uh-hamburger {
          width: 38px; height: 38px;
          border: none;
          background: #f0f4f8;
          border-radius: 10px;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 5px;
          cursor: pointer;
          flex-shrink: 0;
          transition: background 0.2s;
        }
        .uh-hamburger:hover { background: #dceaf8; }
        .uh-bar {
          width: 18px; height: 2px;
          background: #1a3a6e;
          border-radius: 2px;
          transition: transform 0.25s, opacity 0.25s;
        }
        .uh-hamburger.open .uh-bar:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .uh-hamburger.open .uh-bar:nth-child(2) { opacity: 0; }
        .uh-hamburger.open .uh-bar:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

        .uh-brand {
          display: flex; align-items: center; gap: 10px;
          text-decoration: none;
        }
        .uh-brand-icon {
          width: 36px; height: 36px;
          background: linear-gradient(135deg, #1558b0, #2f80ed);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 17px;
          box-shadow: 0 4px 12px rgba(47,128,237,0.30);
        }
        .uh-brand-name {
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          font-weight: 700;
          color: #0b1d3a;
        }

        .uh-spacer { flex: 1; }

        .uh-search-wrap {
          position: relative;
          display: flex; align-items: center;
        }
        .uh-search-icon {
          position: absolute; left: 12px;
          font-size: 14px; color: #a0b0c8;
          pointer-events: none;
        }
        .uh-search {
          padding: 8px 16px 8px 36px;
          border: 1.5px solid #e8f0f8;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          color: #1a2f4a;
          background: #f8fafc;
          outline: none;
          width: 220px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .uh-search::placeholder { color: #b0c0d4; }
        .uh-search:focus {
          border-color: #2f80ed;
          box-shadow: 0 0 0 3px rgba(47,128,237,0.10);
          background: #fff;
        }

        .uh-notif {
          width: 38px; height: 38px;
          border: none;
          background: #f0f4f8;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          font-size: 17px;
          position: relative;
          transition: background 0.2s;
        }
        .uh-notif:hover { background: #dceaf8; }
        .uh-notif-dot {
          position: absolute; top: 7px; right: 7px;
          width: 8px; height: 8px;
          background: #e74c3c;
          border-radius: 50%;
          border: 2px solid #f0f4f8;
        }

        .uh-avatar-wrap {
          position: relative;
        }
        .uh-avatar-btn {
          display: flex; align-items: center; gap: 10px;
          background: none; border: none; cursor: pointer;
          padding: 4px 8px 4px 4px;
          border-radius: 12px;
          transition: background 0.2s;
        }
        .uh-avatar-btn:hover { background: #f0f4f8; }

        .uh-avatar {
          width: 36px; height: 36px;
          background: linear-gradient(135deg, #1558b0, #2f80ed);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 600; color: #fff;
          letter-spacing: 0.5px;
          flex-shrink: 0;
        }
        .uh-name-wrap { text-align: left; }
        .uh-name {
          font-size: 13px; font-weight: 500;
          color: #1a2f4a;
          display: block; line-height: 1.2;
        }
        .uh-role {
          font-size: 11px; color: #a0b0c8;
          display: block;
        }
        .uh-chevron { font-size: 10px; color: #a0b0c8; margin-left: 2px; }

        .uh-dropdown {
          position: absolute; top: calc(100% + 10px); right: 0;
          background: #fff;
          border: 1.5px solid #e8f0f8;
          border-radius: 14px;
          box-shadow: 0 12px 32px rgba(11,29,58,0.12);
          min-width: 200px;
          overflow: hidden;
          animation: dropIn 0.18s ease;
          z-index: 200;
        }
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .uh-drop-header {
          padding: 14px 16px;
          border-bottom: 1px solid #f0f4f8;
        }
        .uh-drop-name {
          font-size: 14px; font-weight: 500; color: #0b1d3a;
        }
        .uh-drop-email {
          font-size: 12px; color: #a0b0c8; margin-top: 2px;
        }
        .uh-drop-item {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 16px;
          font-size: 13px; color: #3d5170;
          cursor: pointer;
          transition: background 0.15s;
          border: none; background: none; width: 100%; text-align: left;
          font-family: 'DM Sans', sans-serif;
          text-decoration: none;
        }
        .uh-drop-item:hover { background: #f5f9ff; color: #2f80ed; }
        .uh-drop-item.danger { color: #e74c3c; }
        .uh-drop-item.danger:hover { background: #fff5f5; }
        .uh-drop-divider { height: 1px; background: #f0f4f8; margin: 4px 0; }

        @media (max-width: 600px) {
          .uh-search-wrap { display: none; }
          .uh-name-wrap { display: none; }
        }
      `}</style>

      <header className="uh-root">
        <button
          className={`uh-hamburger ${sidebarOpen ? 'open' : ''}`}
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <span className="uh-bar" />
          <span className="uh-bar" />
          <span className="uh-bar" />
        </button>

        <a href="/UserDashboard" className="uh-brand">
          <div className="uh-brand-icon">🏥</div>
          <span className="uh-brand-name">Carexa</span>
        </a>

        <div className="uh-spacer" />

        <div className="uh-search-wrap">
          <span className="uh-search-icon">🔍</span>
          <input className="uh-search" placeholder="Search doctors, hospitals…" />
        </div>

        <button className="uh-notif" aria-label="Notifications">
          🔔
          <span className="uh-notif-dot" />
        </button>

        <div className="uh-avatar-wrap" ref={dropRef}>
          <button className="uh-avatar-btn" onClick={() => setDropdownOpen(o => !o)}>
            <div className="uh-avatar">{initials}</div>
            <div className="uh-name-wrap">
              <span className="uh-name">{username}</span>
              <span className="uh-role">Patient</span>
            </div>
            <span className="uh-chevron">▾</span>
          </button>

          {dropdownOpen && (
            <div className="uh-dropdown">
              <div className="uh-drop-header">
                <div className="uh-drop-name">{username}</div>
                <div className="uh-drop-email">Patient Account</div>
              </div>
              <a href="/UserDashboard/profile" className="uh-drop-item">👤 &nbsp;My Profile</a>
              <a href="/UserDashboard/appointments" className="uh-drop-item">📅 &nbsp;Appointments</a>
              <a href="/UserDashboard/medical-records" className="uh-drop-item">📋 &nbsp;Medical Records</a>
              <div className="uh-drop-divider" />
              <button className="uh-drop-item danger" onClick={handleLogout}>🚪 &nbsp;Logout</button>
            </div>
          )}
        </div>
      </header>
    </>
  )
}

export default UserHeader