import React, { useState, useRef } from 'react'
import axios from 'axios'
import ScoreGauge from '../components/ScoreGauge'
import '../styles/skillgap.css'

const API = 'http://localhost:5000/api'

const ROLES = [
    { key: 'SDE', icon: '💻', label: 'SDE' },
    { key: 'AIML', icon: '🧠', label: 'AI / ML' },
    { key: 'Data Analyst', icon: '📊', label: 'Data Analyst' },
]

export default function SkillGap() {
    const [role, setRole] = useState('SDE')
    const [skills, setSkills] = useState([])
    const [input, setInput] = useState('')
    const [dsaSolved, setDsaSolved] = useState('')
    const [projects, setProjects] = useState('')
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const inputRef = useRef()

    const addSkill = () => {
        const trimmed = input.trim()
        if (trimmed && !skills.includes(trimmed)) {
            setSkills(p => [...p, trimmed])
        }
        setInput('')
        inputRef.current?.focus()
    }

    const removeSkill = (s) => setSkills(p => p.filter(x => x !== s))

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addSkill() }
        if (e.key === 'Backspace' && !input && skills.length) {
            setSkills(p => p.slice(0, -1))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true); setError(''); setResult(null)
        try {
            const projectList = projects.split('\n').map(p => p.trim()).filter(Boolean)
            const { data } = await axios.post(`${API}/skill-gap`, {
                role,
                skills,
                dsa_solved: parseInt(dsaSolved || 0),
                projects: projectList,
            })
            setResult(data)
        } catch (err) {
            setError('Cannot connect to backend. Ensure backend + ML service are running.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="page">
            <div className="container">
                <div className="page-header">
                    <h1>🔍 Skill Gap <span className="gradient-text">Analyzer</span></h1>
                    <p>Compare your current skills against role-specific requirements and find exactly what's missing.</p>
                </div>

                <div className="two-col" style={{ alignItems: 'start', gap: '2rem' }}>
                    {/* ── Form ── */}
                    <div className="card">
                        <h3 style={{ marginBottom: '1.25rem' }}>Your Profile</h3>
                        <form onSubmit={handleSubmit}>
                            {/* Role selector */}
                            <div className="form-group">
                                <label>Target Role</label>
                                <div className="role-selector" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                                    {ROLES.map(r => (
                                        <div
                                            key={r.key}
                                            className={`role-card ${role === r.key ? 'selected' : ''}`}
                                            onClick={() => setRole(r.key)}
                                        >
                                            <span className="role-card-icon">{r.icon}</span>
                                            {r.label}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Skills input */}
                            <div className="form-group">
                                <label>Your Skills <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(press Enter or comma to add)</span></label>
                                <div className="input-tag-container" onClick={() => inputRef.current?.focus()}>
                                    {skills.map(s => (
                                        <span key={s} className="skill-tag skill-tag-user" onClick={() => removeSkill(s)}>
                                            {s} ×
                                        </span>
                                    ))}
                                    <input
                                        ref={inputRef}
                                        value={input}
                                        onChange={e => setInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder={skills.length === 0 ? 'e.g. C++, DSA, React, Python...' : ''}
                                        style={{ flex: 1, minWidth: 120 }}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>DSA Problems Solved (LeetCode / GFG)</label>
                                <input type="number" min="0" placeholder="e.g. 250"
                                    value={dsaSolved} onChange={e => setDsaSolved(e.target.value)} />
                            </div>

                            <div className="form-group">
                                <label>Projects <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(one per line)</span></label>
                                <textarea placeholder="e.g.&#10;ML Fraud Detection App&#10;Portfolio Website with React&#10;DSA Visualizer"
                                    value={projects} onChange={e => setProjects(e.target.value)} style={{ minHeight: 100 }} />
                            </div>

                            {error && <div className="info-box info-box-danger" style={{ marginBottom: '1rem' }}>{error}</div>}
                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                                {loading ? '⏳ Analyzing...' : '🔍 Analyze My Skill Gap'}
                            </button>
                        </form>
                    </div>

                    {/* ── Result ── */}
                    <div>
                        {!result && !loading && (
                            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎯</div>
                                <p style={{ color: 'var(--text-secondary)' }}>Your skill gap analysis will appear here.</p>
                            </div>
                        )}
                        {loading && (
                            <div className="card loading-center">
                                <div className="spinner"></div>
                                <span>Comparing against {role} requirements...</span>
                            </div>
                        )}
                        {result && (
                            <div className="results-panel">
                                {/* Readiness gauge */}
                                <div className="card" style={{ textAlign: 'center', marginBottom: '1.25rem', padding: '2rem' }}>
                                    <ScoreGauge value={Math.round(result.readiness_score)} label={`${result.role} Readiness`} />
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.75rem' }}>
                                        {result.total_matched} / {result.total_required} required skills matched
                                    </p>
                                </div>

                                {/* Missing skills */}
                                {Object.entries(result.missing_by_category || {}).map(([cat, skills]) => (
                                    skills.length > 0 && (
                                        <div className="card" style={{ marginBottom: '1rem' }} key={cat}>
                                            <h4 style={{ marginBottom: '0.875rem', textTransform: 'capitalize', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                                ❌ Missing — {cat}
                                            </h4>
                                            <div className="tags-cloud">
                                                {skills.map(s => <span key={s} className="skill-tag skill-tag-missing">{s}</span>)}
                                            </div>
                                        </div>
                                    )
                                ))}

                                {/* Matched skills */}
                                {result.matched_skills?.length > 0 && (
                                    <div className="card" style={{ marginBottom: '1rem' }}>
                                        <h4 style={{ marginBottom: '0.875rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                            ✅ Skills You Have
                                        </h4>
                                        <div className="tags-cloud">
                                            {result.matched_skills.map(s => <span key={s} className="skill-tag skill-tag-matched">{s}</span>)}
                                        </div>
                                    </div>
                                )}

                                {/* Weak areas */}
                                {result.weak_areas?.length > 0 && (
                                    <div className="card">
                                        <h4 style={{ marginBottom: '0.875rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                            ⚡ Weak Areas
                                        </h4>
                                        {result.weak_areas.map((w, i) => (
                                            <div key={i} className="info-box info-box-warning" style={{ marginBottom: '0.5rem' }}>
                                                <strong>{w.area}:</strong> {w.reason}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
