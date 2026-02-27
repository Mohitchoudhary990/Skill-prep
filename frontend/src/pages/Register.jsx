import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../styles/auth.css'
import { FiUser, FiMail, FiLock, FiUserPlus, FiEye, FiEyeOff } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'

export default function Register() {
    const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
    const [showPass, setShowPass] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const { register } = useAuth()
    const navigate = useNavigate()

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
        setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.name || !form.email || !form.password) { setError('All fields are required'); return }
        if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
        if (form.password !== form.confirm) { setError('Passwords do not match'); return }

        setLoading(true)
        try {
            await register(form.name, form.email, form.password)
            navigate('/')
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const strength = (() => {
        const p = form.password
        if (!p) return null
        if (p.length < 6) return { label: 'Too short', color: 'var(--danger)', width: '20%' }
        if (p.length < 8) return { label: 'Weak', color: 'var(--warning)', width: '40%' }
        if (/[A-Z]/.test(p) && /[0-9]/.test(p) && /[^A-Za-z0-9]/.test(p)) return { label: 'Strong', color: 'var(--success)', width: '100%' }
        return { label: 'Medium', color: '#f59e0b', width: '65%' }
    })()

    return (
        <div className="auth-page">
            <div className="auth-glow" />

            <div className="auth-card">
                <div className="auth-logo">
                    <span>🎯</span>
                    <span className="gradient-text">SmartPrep AI</span>
                </div>

                <div className="auth-header">
                    <h1>Create your account</h1>
                    <p>Start preparing smarter, land your dream job</p>
                </div>

                {error && (
                    <div className="info-box info-box-danger" style={{ marginBottom: '1.25rem' }}>
                        <span>⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                    <div className="form-group">
                        <label htmlFor="reg-name">Full name</label>
                        <div className="auth-input-wrapper">
                            <FiUser className="auth-input-icon" />
                            <input
                                id="reg-name"
                                type="text"
                                name="name"
                                placeholder="John Doe"
                                value={form.name}
                                onChange={handleChange}
                                autoComplete="name"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="reg-email">Email address</label>
                        <div className="auth-input-wrapper">
                            <FiMail className="auth-input-icon" />
                            <input
                                id="reg-email"
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
                        <label htmlFor="reg-password">Password</label>
                        <div className="auth-input-wrapper">
                            <FiLock className="auth-input-icon" />
                            <input
                                id="reg-password"
                                type={showPass ? 'text' : 'password'}
                                name="password"
                                placeholder="Min. 6 characters"
                                value={form.password}
                                onChange={handleChange}
                                autoComplete="new-password"
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
                        {/* Password strength bar */}
                        {strength && (
                            <div style={{ marginTop: '0.5rem' }}>
                                <div className="progress-bar" style={{ height: 4 }}>
                                    <div
                                        className="progress-fill"
                                        style={{ width: strength.width, background: strength.color }}
                                    />
                                </div>
                                <span style={{ fontSize: '0.75rem', color: strength.color, marginTop: '0.25rem', display: 'block' }}>
                                    {strength.label}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="reg-confirm">Confirm password</label>
                        <div className="auth-input-wrapper">
                            <FiLock className="auth-input-icon" />
                            <input
                                id="reg-confirm"
                                type={showPass ? 'text' : 'password'}
                                name="confirm"
                                placeholder="Repeat your password"
                                value={form.confirm}
                                onChange={handleChange}
                                autoComplete="new-password"
                                required
                            />
                        </div>
                    </div>

                    <button
                        id="register-submit-btn"
                        type="submit"
                        className="btn btn-primary btn-lg"
                        style={{ width: '100%', marginTop: '0.5rem' }}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                                Creating account…
                            </>
                        ) : (
                            <>
                                <FiUserPlus /> Create Account
                            </>
                        )}
                    </button>
                </form>

                <p className="auth-footer">
                    Already have an account?{' '}
                    <Link to="/login" className="auth-link">Sign in</Link>
                </p>
            </div>
        </div>
    )
}
