import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import '../styles/navbar.css'
import { HiSparkles } from 'react-icons/hi2'
import { FiLogOut, FiLogIn, FiUserPlus } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'

const links = [
    { to: '/', label: 'Home' },
    { to: '/predict', label: '🎯 Predictor' },
    { to: '/skill-gap', label: '🔍 Skill Gap' },
    { to: '/mock-interview', label: '🎤 Interview' },
    { to: '/roadmap', label: '🗺️ Roadmap' },
]

export default function Navbar() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <nav className="navbar">
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
            </div>
        </nav>
    )
}
