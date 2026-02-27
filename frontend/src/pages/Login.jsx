import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import '../styles/auth.css'
import { FiMail, FiLock, FiLogIn, FiEye, FiEyeOff } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'

export default function Login() {
    const [form, setForm] = useState({ email: '', password: '' })
    const [showPass, setShowPass] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const { login } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const from = location.state?.from?.pathname || '/'

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
        setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.email || !form.password) { setError('Both fields are required'); return }
        setLoading(true)
        try {
            await login(form.email, form.password)
            navigate(from, { replace: true })
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            {/* Background glow */}
            <div className="auth-glow" />

            <div className="auth-card">
                {/* Logo */}
                <div className="auth-logo">
                    <span>🎯</span>
                    <span className="gradient-text">SmartPrep AI</span>
                </div>

                <div className="auth-header">
                    <h1>Welcome back</h1>
                    <p>Sign in to continue your placement journey</p>
                </div>

                {error && (
                    <div className="info-box info-box-danger" style={{ marginBottom: '1.25rem' }}>
                        <span>⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                    <div className="form-group">
                        <label htmlFor="login-email">Email address</label>
                        <div className="auth-input-wrapper">
                            <FiMail className="auth-input-icon" />
                            <input
                                id="login-email"
                                type="email"
                                name="email"
                                placeholder="you@example.com"
                                value={form.email}
                                onChange={handleChange}
                                autoComplete="email"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="login-password">Password</label>
                        <div className="auth-input-wrapper">
                            <FiLock className="auth-input-icon" />
                            <input
                                id="login-password"
                                type={showPass ? 'text' : 'password'}
                                name="password"
                                placeholder="Enter your password"
                                value={form.password}
                                onChange={handleChange}
                                autoComplete="current-password"
                                required
                            />
                            <button
                                type="button"
                                className="auth-eye-btn"
                                onClick={() => setShowPass((v) => !v)}
                                tabIndex={-1}
                                aria-label="Toggle password visibility"
                            >
                                {showPass ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                    </div>

                    <button
                        id="login-submit-btn"
                        type="submit"
                        className="btn btn-primary btn-lg"
                        style={{ width: '100%', marginTop: '0.5rem' }}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                                Signing in…
                            </>
                        ) : (
                            <>
                                <FiLogIn /> Sign In
                            </>
                        )}
                    </button>
                </form>

                <p className="auth-footer">
                    Don't have an account?{' '}
                    <Link to="/register" className="auth-link">Create one free</Link>
                </p>
            </div>
        </div>
    )
}
