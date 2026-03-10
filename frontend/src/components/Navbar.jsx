import React, { useState, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import '../styles/navbar.css'
import { HiSparkles } from 'react-icons/hi2'
import { FiLogOut, FiLogIn, FiUserPlus, FiHome, FiTarget, FiSearch, FiMic, FiMap } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'

const links = [
    { to: '/', label: 'Home', icon: <FiHome /> },
    { to: '/predict', label: 'Predictor', icon: <FiTarget /> },
    { to: '/skill-gap', label: 'Skill Gap', icon: <FiSearch /> },
    { to: '/mock-interview', label: 'Interview', icon: <FiMic /> },
    { to: '/roadmap', label: 'Roadmap', icon: <FiMap /> },
]

export default function Navbar() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [scrolled, setScrolled] = useState(false)
    const [drawerOpen, setDrawerOpen] = useState(false)

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    // Close drawer on route change
    useEffect(() => {
        setDrawerOpen(false)
    }, [location.pathname])

    const handleLogout = () => {
        logout()
        navigate('/login')
        setDrawerOpen(false)
    }

    return (
        <>
            <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
                <div className="navbar-inner">
                    <NavLink to="/" className="navbar-logo">
                        <HiSparkles /> SmartPrep AI
                    </NavLink>

                    <ul className="navbar-links">
                        {user && links.map(l => (
                            <li key={l.to}>
                                <NavLink
                                    to={l.to}
                                    className={({ isActive }) => isActive ? 'active' : ''}
                                    end={l.to === '/'}
                                >
                                    {l.label}
                                </NavLink>
                            </li>
                        ))}
                    </ul>

                    <div className="navbar-auth">
                        {user ? (
                            <>
                                <span className="navbar-user">👤 {user.name.split(' ')[0]}</span>
                                <button className="btn btn-secondary btn-sm" onClick={handleLogout} id="logout-btn">
                                    <FiLogOut /> Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <NavLink to="/login" className="btn btn-secondary btn-sm" id="nav-login-btn">
                                    <FiLogIn /> Login
                                </NavLink>
                                <NavLink to="/register" className="btn btn-primary btn-sm" id="nav-register-btn">
                                    <FiUserPlus /> Sign Up
                                </NavLink>
                            </>
                        )}
                    </div>

                    {/* Hamburger */}
                    <button
                        className={`navbar-hamburger ${drawerOpen ? 'open' : ''}`}
                        onClick={() => setDrawerOpen(v => !v)}
                        aria-label="Toggle menu"
                    >
                        <span />
                        <span />
                        <span />
                    </button>
                </div>
            </nav>

            {/* Mobile Drawer */}
            <div className={`navbar-drawer ${drawerOpen ? 'open' : ''}`}>
                {user ? (
                    <>
                        <ul className="drawer-links">
                            {links.map(l => (
                                <li key={l.to}>
                                    <NavLink
                                        to={l.to}
                                        className={({ isActive }) => isActive ? 'active' : ''}
                                        end={l.to === '/'}
                                    >
                                        {l.icon} {l.label}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                        <div className="drawer-auth">
                            <span className="navbar-user" style={{ textAlign: 'center' }}>👤 {user.name}</span>
                            <button className="btn btn-secondary" onClick={handleLogout}>
                                <FiLogOut /> Logout
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="drawer-auth">
                        <NavLink to="/login" className="btn btn-secondary btn-lg" onClick={() => setDrawerOpen(false)}>
                            <FiLogIn /> Login
                        </NavLink>
                        <NavLink to="/register" className="btn btn-primary btn-lg" onClick={() => setDrawerOpen(false)}>
                            <FiUserPlus /> Sign Up
                        </NavLink>
                    </div>
                )}
            </div>
        </>
    )
}
