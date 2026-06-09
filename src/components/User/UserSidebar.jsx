import React from 'react'

import { NavLink, useNavigate } from 'react-router-dom'

import Swal from 'sweetalert2'

const UserSidebar = ({ isOpen, onClose }) => {

  const navigate = useNavigate()

  const username = localStorage.getItem('username') || 'Patient'

  const initials = username.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  const handleLogout = () => {

    onClose()

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

  const handleDoctorsClick = (e) => {

    e.preventDefault()

    onClose()

    Swal.fire({

      title: 'Select a Hospital First',

      text: 'Please choose a hospital to view its available doctors.',

      icon: 'info',

      confirmButtonColor: '#2f80ed',

      confirmButtonText: 'Browse Hospitals',

    }).then((result) => {

      if (result.isConfirmed) {

        navigate('/userdashboard/hospitals')

      }

    })

  }

  return (

    <>

      <style>{`

    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500&display=swap');

    .us-backdrop { position: fixed; inset: 0; z-index: 150; background: rgba(11,29,58,0.35); backdrop-filter: blur(2px); opacity: 0; pointer-events: none; transition: opacity 0.3s; }

    .us-backdrop.open { opacity: 1; pointer-events: all; }

    .us-drawer { position: fixed; top: 0; left: 0; bottom: 0; z-index: 160; width: 280px; background: #0b1d3a; display: flex; flex-direction: column; transform: translateX(-100%); transition: transform 0.32s cubic-bezier(0.4,0,0.2,1); box-shadow: 6px 0 32px rgba(11,29,58,0.25); font-family: 'DM Sans', sans-serif; overflow: hidden; }

    .us-drawer.open { transform: translateX(0); }

    .us-drawer::before { content: ''; position: absolute; width: 320px; height: 320px; border-radius: 50%; background: rgba(47,128,237,0.07); top: -100px; right: -100px; pointer-events: none; }

    .us-drawer::after { content: ''; position: absolute; width: 200px; height: 200px; border-radius: 50%; background: rgba(255,255,255,0.03); bottom: 40px; left: -60px; pointer-events: none; }

    .us-head { padding: 20px 20px 0; display: flex; align-items: center; justify-content: space-between; }

    .us-brand { display: flex; align-items: center; gap: 10px; }

    .us-brand-icon { width: 36px; height: 36px; background: #2f80ed; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 17px; box-shadow: 0 4px 14px rgba(47,128,237,0.40); }

    .us-brand-name { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: #fff; }

    .us-close { width: 32px; height: 32px; border: none; background: rgba(255,255,255,0.08); border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 16px; color: rgba(255,255,255,0.6); transition: background 0.2s, color 0.2s; }

    .us-close:hover { background: rgba(255,255,255,0.15); color: #fff; }

    .us-profile { margin: 20px 16px; background: rgba(255,255,255,0.06); border-radius: 14px; padding: 16px; display: flex; align-items: center; gap: 12px; border: 1px solid rgba(255,255,255,0.08); }

    .us-avatar { width: 44px; height: 44px; flex-shrink: 0; background: linear-gradient(135deg, #2f80ed, #56aef8); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 600; color: #fff; letter-spacing: 0.5px; box-shadow: 0 4px 14px rgba(47,128,237,0.35); }

    .us-prof-name { font-size: 14px; font-weight: 500; color: #fff; display: block; line-height: 1.3; }

    .us-prof-badge { display: inline-block; margin-top: 4px; font-size: 10px; font-weight: 500; color: #56aef8; background: rgba(47,128,237,0.18); border-radius: 20px; padding: 2px 8px; letter-spacing: 0.5px; text-transform: uppercase; }

    .us-section-label { font-size: 10px; font-weight: 500; color: rgba(255,255,255,0.30); text-transform: uppercase; letter-spacing: 1.2px; padding: 0 20px; margin-bottom: 6px; }

    .us-nav { flex: 1; padding: 0 12px; overflow-y: auto; scrollbar-width: none; -ms-overflow-style: none; }

    .us-nav::-webkit-scrollbar { display: none; }

    .us-nav-item { display: flex; align-items: center; gap: 12px; padding: 11px 14px; border-radius: 12px; font-size: 14px; font-weight: 400; color: rgba(255,255,255,0.60); text-decoration: none; transition: background 0.18s, color 0.18s; margin-bottom: 2px; position: relative; }

    .us-nav-item:hover { background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.90); }

    .us-nav-item.active { background: linear-gradient(135deg, rgba(21,88,176,0.70), rgba(47,128,237,0.55)); color: #fff; font-weight: 500; box-shadow: 0 4px 16px rgba(47,128,237,0.20); }

    .us-nav-item.active::before { content: ''; position: absolute; left: 0; top: 20%; bottom: 20%; width: 3px; background: #56aef8; border-radius: 0 3px 3px 0; }

    .us-nav-icon { font-size: 17px; flex-shrink: 0; }

    .us-nav-btn { display: flex; align-items: center; gap: 12px; padding: 11px 14px; border-radius: 12px; font-size: 14px; font-weight: 400; color: rgba(255,255,255,0.60); background: none; border: none; cursor: pointer; width: 100%; text-align: left; transition: background 0.18s, color 0.18s; margin-bottom: 2px; font-family: 'DM Sans', sans-serif; }

    .us-nav-btn:hover { background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.90); }

    .us-nav-hint { font-size: 10px; color: rgba(255,255,255,0.25); margin-left: auto; background: rgba(255,255,255,0.06); padding: 2px 7px; border-radius: 20px; }

    .us-divider { height: 1px; background: rgba(255,255,255,0.07); margin: 10px 16px; }

    .us-footer { padding: 16px 12px 24px; }

    .us-logout { display: flex; align-items: center; gap: 12px; width: 100%; padding: 11px 14px; border-radius: 12px; font-size: 14px; font-weight: 400; color: rgba(231,76,60,0.80); background: none; border: none; cursor: pointer; transition: background 0.18s, color 0.18s; font-family: 'DM Sans', sans-serif; text-align: left; }

    .us-logout:hover { background: rgba(231,76,60,0.12); color: #e74c3c; }

    .us-version { text-align: center; font-size: 11px; color: rgba(255,255,255,0.18); margin-top: 10px; }

  `}</style>



      <div className={`us-backdrop ${isOpen ? 'open' : ''}`} onClick={onClose} />



      <aside className={`us-drawer ${isOpen ? 'open' : ''}`}>



        <div className="us-head">

          <div className="us-brand">

            <div className="us-brand-icon">🏥</div>

            <span className="us-brand-name">Carexa</span>

          </div>

          <button className="us-close" onClick={onClose}>✕</button>

        </div>



        <div className="us-profile">

          <div className="us-avatar">{initials}</div>

          <div className="us-prof-info">

            <span className="us-prof-name">{username}</span>

            <span className="us-prof-badge">Patient</span>

          </div>

        </div>



        <p className="us-section-label">Main Menu</p>



        <nav className="us-nav">



          <NavLink to="/userdashboard" end

            className={({ isActive }) => `us-nav-item${isActive ? ' active' : ''}`}

            onClick={onClose}>

            <span className="us-nav-icon">🏠</span> Dashboard

          </NavLink>



          <NavLink to="/userdashboard/hospitals"

            className={({ isActive }) => `us-nav-item${isActive ? ' active' : ''}`}

            onClick={onClose}>

            <span className="us-nav-icon">🏨</span> Hospitals

          </NavLink>



          <button className="us-nav-btn" onClick={handleDoctorsClick}>

            <span className="us-nav-icon">👨‍⚕️</span>

            Doctors

            <span className="us-nav-hint">Pick hospital</span>

          </button>



          <NavLink to="/userdashboard/appointments"

            className={({ isActive }) => `us-nav-item${isActive ? ' active' : ''}`}

            onClick={onClose}>

            <span className="us-nav-icon">📅</span> Appointments

          </NavLink>



          <NavLink to="/userdashboard/medical-records"

            className={({ isActive }) => `us-nav-item${isActive ? ' active' : ''}`}

            onClick={onClose}>

            <span className="us-nav-icon">📋</span> Medical Records

          </NavLink>



          <NavLink to="/userdashboard/profile"

            className={({ isActive }) => `us-nav-item${isActive ? ' active' : ''}`}

            onClick={onClose}>

            <span className="us-nav-icon">⚙️</span> Profile / Settings

          </NavLink>



          <NavLink to="/userdashboard/feedback"

            className={({ isActive }) => `us-nav-item${isActive ? ' active' : ''}`}

            onClick={onClose}>

            <span className="us-nav-icon">💬</span> Feedback

          </NavLink>



          <div className="us-divider" />

        </nav>



        <div className="us-footer">

          <button className="us-logout" onClick={handleLogout}>

            <span className="us-nav-icon">🚪</span>

            Logout

          </button>

          <p className="us-version">Carexa v1.0 · Patient Portal</p>

        </div>



      </aside>

    </>

  )

}

export default UserSidebar 