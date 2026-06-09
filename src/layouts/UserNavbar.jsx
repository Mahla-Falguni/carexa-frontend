// src/layouts/UserNavbar.jsx
// 100% inline styles — no Tailwind classes used anywhere.
// This guarantees pixel-identical rendering on Home, About, Services, Contact, Hospitals.

import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
    FaHospital, FaBars, FaTimes,
    FaFacebook, FaInstagram, FaTwitter,
    FaPhone, FaEnvelope, FaUserCircle
} from 'react-icons/fa'

const NAV_BG        = 'linear-gradient(to right, #0f172a, #0f2a5e, #0f172a)'
const NAV_BG_SCROLL = 'rgba(15,23,42,0.97)'
const BLUE          = '#3b82f6'
const BLUE_DARK     = '#2563eb'

const UserNavbar = () => {
    const [menuOpen, setMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const [hovered,  setHovered]  = useState(null)   // tracks which nav link is hovered
    const location = useLocation()

    useEffect(() => {
        setScrolled(false)
        window.scrollTo(0, 0)
        const onScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [location.pathname])

    useEffect(() => { setMenuOpen(false) }, [location.pathname])

    const isActive = (path) => location.pathname === path

    const navLinks = [
        { label: 'Home',      path: '/' },
        { label: 'Hospitals', path: '/hospitals' },
        { label: 'About',     path: '/about' },
        { label: 'Services',  path: '/services' },
        { label: 'Contact',   path: '/contact' },
    ]

    // ── Shared style objects ──────────────────────────────────────────────────

    const wrapStyle = {
        position:        'sticky',
        top:             0,
        zIndex:          9999,
        fontFamily:      "'DM Sans', sans-serif",
        background:      scrolled ? NAV_BG_SCROLL : NAV_BG,
        backdropFilter:  scrolled ? 'blur(12px)' : 'none',
        boxShadow:       scrolled ? '0 4px 30px rgba(0,0,0,0.35)' : 'none',
        transition:      'background 0.3s, box-shadow 0.3s',
    }

    const topBarStyle = {
        background:    'rgba(2,6,23,0.80)',
        borderBottom:  '1px solid rgba(255,255,255,0.07)',
        overflow:      'hidden',
        maxHeight:     scrolled ? 0 : 40,
        opacity:       scrolled ? 0 : 1,
        transition:    'max-height 0.3s ease, opacity 0.3s ease',
    }

    const topInner = {
        maxWidth:      '1280px',
        margin:        '0 auto',
        padding:       '0 24px',
        height:        40,
        display:       'flex',
        alignItems:    'center',
        justifyContent:'space-between',
    }

    const topLinkStyle = {
        display:    'flex',
        alignItems: 'center',
        gap:        6,
        fontSize:   12,
        color:      'rgba(255,255,255,0.55)',
        textDecoration: 'none',
        transition: 'color 0.15s',
    }

    const mainInner = {
        maxWidth:       '1280px',
        margin:         '0 auto',
        padding:        '0 24px',
        height:         72,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        gap:            24,
    }

    const brandStyle = {
        display:        'flex',
        alignItems:     'center',
        gap:            12,
        textDecoration: 'none',
        flexShrink:     0,
    }

    const brandIconStyle = {
        width:           40,
        height:          40,
        background:      'linear-gradient(135deg, #3b82f6, #6366f1)',
        borderRadius:    12,
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        boxShadow:       '0 4px 14px rgba(99,102,241,0.45)',
        flexShrink:      0,
    }

    const brandTextStyle = {
        fontFamily:     "'Playfair Display', serif",
        fontSize:       30,
        fontWeight:     700,
        color:          '#ffffff',
        letterSpacing:  '-0.5px',
        lineHeight:     1,
    }

    const desktopLinksStyle = {
        display:    'flex',
        alignItems: 'center',
        gap:        36,
        flex:       1,
        justifyContent: 'center',
    }

    const linkStyle = (path) => ({
        position:       'relative',
        fontSize:       14,
        fontWeight:     500,
        color:          isActive(path) || hovered === path ? '#93c5fd' : 'rgba(255,255,255,0.80)',
        textDecoration: 'none',
        paddingBottom:  4,
        transition:     'color 0.2s',
        letterSpacing:  '0.1px',
    })

    const linkUnderlineStyle = (path) => ({
        position:   'absolute',
        bottom:     0,
        left:       0,
        height:     2,
        width:      isActive(path) || hovered === path ? '100%' : 0,
        background: '#60a5fa',
        borderRadius: 2,
        transition: 'width 0.25s ease',
    })

    const authWrap = {
        display:    'flex',
        alignItems: 'center',
        gap:        10,
        flexShrink: 0,
    }

    const loginBtnStyle = {
        display:        'flex',
        alignItems:     'center',
        gap:            7,
        fontSize:       14,
        fontWeight:     600,
        color:          '#ffffff',
        background:     'transparent',
        border:         '1.5px solid rgba(255,255,255,0.30)',
        borderRadius:   10,
        padding:        '9px 20px',
        cursor:         'pointer',
        textDecoration: 'none',
        transition:     'background 0.2s',
        whiteSpace:     'nowrap',
    }

    const registerBtnStyle = {
        display:        'flex',
        alignItems:     'center',
        gap:            7,
        fontSize:       14,
        fontWeight:     600,
        color:          '#ffffff',
        background:     'linear-gradient(135deg, #3b82f6, #6366f1)',
        border:         'none',
        borderRadius:   10,
        padding:        '9px 20px',
        cursor:         'pointer',
        textDecoration: 'none',
        boxShadow:      '0 4px 14px rgba(99,102,241,0.35)',
        transition:     'transform 0.2s, box-shadow 0.2s',
        whiteSpace:     'nowrap',
    }

    const hamburgerStyle = {
        display:        'none',   // shown via media query below
        background:     'transparent',
        border:         'none',
        color:          'rgba(255,255,255,0.80)',
        cursor:         'pointer',
        padding:        4,
        fontSize:       22,
    }

    const mobileMenuStyle = {
        borderTop:      '1px solid rgba(255,255,255,0.07)',
        background:     'rgba(15,23,42,0.99)',
        backdropFilter: 'blur(12px)',
        padding:        '12px 24px 20px',
    }

    const mobileLinkStyle = (path) => ({
        display:        'block',
        fontSize:       14,
        fontWeight:     500,
        color:          isActive(path) ? '#93c5fd' : 'rgba(255,255,255,0.75)',
        textDecoration: 'none',
        padding:        '11px 12px',
        borderRadius:   8,
        borderLeft:     isActive(path) ? '3px solid #60a5fa' : '3px solid transparent',
        background:     isActive(path) ? 'rgba(255,255,255,0.04)' : 'transparent',
        marginBottom:   2,
        transition:     'all 0.15s',
    })

    const mobileDivider = {
        height:         1,
        background:     'rgba(255,255,255,0.07)',
        margin:         '10px 0',
    }

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap');

                .un-top-link:hover  { color: #93c5fd !important; }
                .un-login-btn:hover { background: rgba(255,255,255,0.10) !important; }
                .un-reg-btn:hover   {
                    transform: translateY(-1px) !important;
                    box-shadow: 0 8px 22px rgba(99,102,241,0.48) !important;
                }
                .un-mobile-link:hover {
                    border-left-color: #60a5fa !important;
                    background: rgba(255,255,255,0.05) !important;
                    color: #fff !important;
                }
                .un-hamburger { display: none !important; }

                @media (max-width: 767px) {
                    .un-desktop-links { display: none !important; }
                    .un-auth-wrap     { display: none !important; }
                    .un-hamburger     { display: block !important; }
                    .un-top-contacts  { display: none !important; }
                }
                @media (min-width: 768px) {
                    .un-mobile-menu   { display: none !important; }
                }
            `}</style>

            {/* ── Outer wrapper ── */}
            <div style={wrapStyle}>

                {/* ── Top info bar ── */}
                <div style={topBarStyle}>
                    <div style={topInner}>
                        {/* Left: email + phone */}
                        <div className="un-top-contacts" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                            <a href="mailto:info@carexa.com" className="un-top-link" style={topLinkStyle}>
                                <FaEnvelope size={11} /> info@carexa.com
                            </a>
                            <a href="tel:+919876543210" className="un-top-link" style={topLinkStyle}>
                                <FaPhone size={11} /> +91 98765 43210
                            </a>
                        </div>
                        {/* Right: socials */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginLeft: 'auto' }}>
                            {[
                                { Icon: FaFacebook,  label: 'Facebook'  },
                                { Icon: FaInstagram, label: 'Instagram' },
                                { Icon: FaTwitter,   label: 'Twitter'   },
                            ].map(({ Icon, label }) => (
                                <a key={label} href="#" className="un-top-link" style={topLinkStyle}>
                                    <Icon size={12} />
                                    <span style={{ fontSize: 11 }}>{label}</span>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Main nav bar ── */}
                <nav>
                    <div style={mainInner}>

                        {/* Brand */}
                        <Link to="/" style={brandStyle}>
                            <div style={brandIconStyle}>
                                <FaHospital color="#fff" size={18} />
                            </div>
                            <span style={brandTextStyle}>Carexa</span>
                        </Link>

                        {/* Desktop nav links */}
                        <div className="un-desktop-links" style={desktopLinksStyle}>
                            {navLinks.map(({ label, path }) => (
                                <Link
                                    key={path}
                                    to={path}
                                    style={linkStyle(path)}
                                    onMouseEnter={() => setHovered(path)}
                                    onMouseLeave={() => setHovered(null)}
                                >
                                    {label}
                                    <span style={linkUnderlineStyle(path)} />
                                </Link>
                            ))}
                        </div>

                        {/* Desktop auth buttons */}
                        <div className="un-auth-wrap" style={authWrap}>
                            <Link to="/login" className="un-login-btn" style={loginBtnStyle}>
                                <FaUserCircle size={14} /> Login
                            </Link>
                            <Link to="/register" className="un-reg-btn" style={registerBtnStyle}>
                                Get Started
                            </Link>
                        </div>

                        {/* Mobile hamburger */}
                        <button
                            className="un-hamburger"
                            style={hamburgerStyle}
                            onClick={() => setMenuOpen(o => !o)}
                            aria-label="Toggle menu"
                        >
                            {menuOpen ? <FaTimes /> : <FaBars />}
                        </button>
                    </div>

                    {/* Mobile dropdown menu */}
                    {menuOpen && (
                        <div className="un-mobile-menu" style={mobileMenuStyle}>
                            {navLinks.map(({ label, path }) => (
                                <Link
                                    key={path}
                                    to={path}
                                    className="un-mobile-link"
                                    style={mobileLinkStyle(path)}
                                    onClick={() => setMenuOpen(false)}
                                >
                                    {label}
                                </Link>
                            ))}
                            <div style={mobileDivider} />
                            <Link to="/login" style={{ ...loginBtnStyle, display: 'flex', justifyContent: 'center', width: '100%', marginBottom: 8, borderRadius: 10 }}
                                onClick={() => setMenuOpen(false)}>
                                <FaUserCircle size={14} /> Login
                            </Link>
                            <Link to="/register" style={{ ...registerBtnStyle, display: 'flex', justifyContent: 'center', width: '100%', borderRadius: 10 }}
                                onClick={() => setMenuOpen(false)}>
                                Get Started
                            </Link>
                        </div>
                    )}
                </nav>
            </div>
        </>
    )
}

export default UserNavbar