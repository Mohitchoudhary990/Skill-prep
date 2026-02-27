import React, { useState } from 'react'
import axios from 'axios'
import '../styles/roadmap.css'

const API = 'http://localhost:5000/api'

const ROLES = [
    { key: 'SDE', icon: '💻', label: 'SDE' },
    { key: 'AIML', icon: '🧠', label: 'AI / ML' },
    { key: 'Data Analyst', icon: '📊', label: 'Data Analyst' },
]

const RT_CLASS = { video: 'rt-video', article: 'rt-article', course: 'rt-course', practice: 'rt-practice' }

export default function Roadmap() {
    const [role, setRole] = useState('SDE')
    const [weakInput, setWeakInput] = useState('')
    const [weakAreas, setWeakAreas] = useState([])
    const [dsa, setDsa] = useState('')
    const [targetWeeks, setTargetWeeks] = useState('12')
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const addWeak = () => {
        const t = weakInput.trim()
        if (t && !weakAreas.includes(t)) setWeakAreas(p => [...p, t])
        setWeakInput('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true); setError(''); setResult(null)
        try {
            const { data } = await axios.post(`${API}/roadmap`, {
                role,
                weak_areas: weakAreas,
                dsa_solved: parseInt(dsa || 0),
                target_weeks: parseInt(targetWeeks || 12),
            })
            setResult(data)
        } catch (err) {
            setError('Cannot connect to backend. Ensure backend + ML service are running.')
        } finally { setLoading(false) }
    }

    return (
        <div className="page">
            <div className="container">
                <div className="page-header">
                    <h1>🗺️ Personalized Learning <span className="gradient-text">Roadmap</span></h1>
                    <p>Tell us your weak areas and target role. Get a curated week-by-week study plan with resources.</p>
                </div>

                <div className="two-col" style={{ alignItems: 'start', gap: '2rem' }}>
                    {/* ── Form ── */}
                    <div className="card">
                        <h3 style={{ marginBottom: '1.25rem' }}>Build Your Roadmap</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Target Role</label>
                                <div className="role-selector">
                                    {ROLES.map(r => (
                                        <div key={r.key}
                                            className={`role-card ${role === r.key ? 'selected' : ''}`}
                                            onClick={() => setRole(r.key)}>
                                            <span className="role-card-icon">{r.icon}</span>
                                            {r.label}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>
                                    Weak Areas / Topics to Improve{' '}
                                    <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(leave blank for auto-detect)</span>
                                </label>
                                <div className="input-tag-container" onClick={() => document.getElementById('weak-inp')?.focus()}>
                                    {weakAreas.map(w => (
                                        <span key={w} className="skill-tag skill-tag-user"
                                            onClick={() => setWeakAreas(p => p.filter(x => x !== w))}>
                                            {w} ×
                                        </span>
                                    ))}
                                    <input
                                        id="weak-inp"
                                        value={weakInput}
                                        onChange={e => setWeakInput(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addWeak() } }}
                                        placeholder={weakAreas.length === 0 ? 'e.g. Graphs, DP, Communication...' : ''}
                                    />
                                </div>
                                <div className="tags-cloud" style={{ marginTop: '0.5rem' }}>
                                    {['Graphs', 'Dynamic Programming', 'System Design', 'Machine Learning', 'SQL', 'Communication', 'React'].map(s => (
                                        <span key={s}
                                            className="skill-tag"
                                            style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}
                                            onClick={() => { if (!weakAreas.includes(s)) setWeakAreas(p => [...p, s]) }}>
                                            + {s}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="two-col">
                                <div className="form-group">
                                    <label>DSA Problems Solved</label>
                                    <input type="number" min="0" placeholder="e.g. 150"
                                        value={dsa} onChange={e => setDsa(e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label>Target (weeks)</label>
                                    <input type="number" min="4" max="52" placeholder="12"
                                        value={targetWeeks} onChange={e => setTargetWeeks(e.target.value)} />
                                </div>
                            </div>

                            {error && <div className="info-box info-box-danger" style={{ marginBottom: '1rem' }}>{error}</div>}
                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                                {loading ? '⏳ Generating...' : '🗺️ Generate My Roadmap'}
                            </button>
                        </form>
                    </div>

                    {/* ── Result ── */}
                    <div>
                        {!result && !loading && (
                            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🗺️</div>
                                <p style={{ color: 'var(--text-secondary)' }}>Your personalized roadmap will appear here.</p>
                            </div>
                        )}
                        {loading && (
                            <div className="card loading-center">
                                <div className="spinner"></div>
                                <span>Generating roadmap for {role}...</span>
                            </div>
                        )}
                        {result && (
                            <div className="results-panel">
                                <div className="card" style={{ marginBottom: '1.25rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        <div>
                                            <h3>{role} Roadmap</h3>
                                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                                {result.total_topics} topic{result.total_topics !== 1 ? 's' : ''} · {result.target_weeks} week plan
                                            </p>
                                        </div>
                                    </div>
                                    <div className="info-box info-box-info" style={{ marginTop: '1rem' }}>
                                        💡 {result.tip}
                                    </div>
                                </div>

                                {/* Roadmap timeline */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    {result.roadmap.map((item, idx) => (
                                        <div className="roadmap-item" key={idx}>
                                            <div className="roadmap-dot">{idx + 1}</div>
                                            <div className="roadmap-content">
                                                <div className="card card-glow" style={{ marginBottom: 0 }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.875rem' }}>
                                                        <h4 style={{ fontSize: '1rem' }}>{item.title}</h4>
                                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                            <span className={`skill-tag ${item.priority === 'High' ? 'skill-tag-missing' : 'skill-tag-user'}`}>
                                                                {item.priority} Priority
                                                            </span>
                                                            <span className="skill-tag" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '0.72rem' }}>
                                                                ⏱ {item.duration}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Resources */}
                                                    <div className="resource-list">
                                                        {item.resources.map((r, ri) => (
                                                            <a key={ri} href={r.url} target="_blank" rel="noopener noreferrer" className="resource-item">
                                                                <span className={`resource-type ${RT_CLASS[r.type] || ''}`}>{r.type}</span>
                                                                {r.title}
                                                                <span style={{ marginLeft: 'auto', fontSize: '0.75rem', opacity: 0.5 }}>↗</span>
                                                            </a>
                                                        ))}
                                                    </div>

                                                    {/* Practice problems */}
                                                    <div style={{ marginTop: '0.875rem' }}>
                                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                            Practice Problems
                                                        </p>
                                                        <div className="tags-cloud">
                                                            {item.practice_problems.map(p => (
                                                                <span key={p} className="skill-tag" style={{
                                                                    background: 'rgba(99,102,241,0.08)',
                                                                    border: '1px solid rgba(99,102,241,0.2)',
                                                                    color: '#c7d2fe',
                                                                    fontSize: '0.75rem',
                                                                }}>
                                                                    {p}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
