import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ScoreGauge from '../components/ScoreGauge'
import '../styles/dashboard.css'

// ── Animated counter hook ───────────────────────────────────────────────────
function useCountUp(target, duration = 1200) {
    const [val, setVal] = useState(0)
    useEffect(() => {
        if (!target) return
        let start = 0
        const increment = target / (duration / 16)
        const timer = setInterval(() => {
            start += increment
            if (start >= target) { setVal(target); clearInterval(timer) }
            else setVal(Math.floor(start))
        }, 16)
        return () => clearInterval(timer)
    }, [target, duration])
    return val
}

// ── Mini circular progress ring ─────────────────────────────────────────────
function Ring({ value = 0, size = 80, stroke = 7, color = '#6366f1', label }) {
    const r = (size - stroke) / 2
    const circ = 2 * Math.PI * r
    const offset = circ - (value / 100) * circ
    return (
        <div className="ring-wrapper">
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', display: 'block' }}>
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
                <circle
                    cx={size / 2} cy={size / 2} r={r} fill="none"
                    stroke={color} strokeWidth={stroke} strokeLinecap="round"
                    strokeDasharray={circ}
                    strokeDashoffset={offset}
                    style={{ transition: 'stroke-dashoffset 1.3s cubic-bezier(0.4,0,0.2,1)' }}
                />
            </svg>
            <div className="ring-label">{value}<span style={{ fontSize: '0.6em', opacity: 0.7 }}>%</span></div>
        </div>
    )
}

// ── Overall readiness computation ────────────────────────────────────────────
function computeReadiness(predictor, skillGap, interview, roadmap) {
    let total = 0, count = 0
    if (predictor?.probability != null) { total += predictor.probability; count++ }
    if (skillGap?.readinessScore != null) { total += skillGap.readinessScore; count++ }
    if (interview?.overallScore != null) { total += interview.overallScore * 10; count++ }
    if (roadmap?.completionPct != null) { total += roadmap.completionPct; count++ }
    return count === 0 ? 0 : Math.round(total / count)
}

const MODULE_LINKS = [
    { to: '/predict',       icon: '🎯', label: 'Run Predictor',      color: '#06b6d4' },
    { to: '/skill-gap',     icon: '🔍', label: 'Analyze Skills',     color: '#6366f1' },
    { to: '/mock-interview',icon: '🎤', label: 'Start Interview',     color: '#8b5cf6' },
    { to: '/roadmap',       icon: '🗺️', label: 'Get Roadmap',        color: '#10b981' },
]

export default function Dashboard() {
    const { user } = useAuth()

    // ── Load persisted results from localStorage ─────────────────────────────
    const [predictor, setPredictor] = useState(null)
    const [skillGap,  setSkillGap]  = useState(null)
    const [interview, setInterview] = useState(null)
    const [roadmap,   setRoadmap]   = useState(null)

    useEffect(() => {
        try { setPredictor(JSON.parse(localStorage.getItem('predictorResult'))) } catch {}
        try { setSkillGap(JSON.parse(localStorage.getItem('skillGapResult'))) }   catch {}
        try { setInterview(JSON.parse(localStorage.getItem('interviewResult'))) } catch {}
        try { setRoadmap(JSON.parse(localStorage.getItem('roadmapResult'))) }     catch {}
    }, [])

    const readiness = computeReadiness(predictor, skillGap, interview, roadmap)
    const completedModules = [predictor, skillGap, interview, roadmap].filter(Boolean).length
    const animatedReadiness = useCountUp(readiness)

    // greeting
    const hour = new Date().getHours()
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
    const firstName = user?.name?.split(' ')[0] || 'there'

    return (
        <div className="page">
            <div className="container">

                {/* ── Hero greeting ── */}
                <section className="dash-hero">
                    <div className="dash-hero-left">
                        <p className="dash-greeting">{greeting}, <span className="gradient-text">{firstName}</span> 👋</p>
                        <h1 className="dash-title">Your Placement Dashboard</h1>
                        <p className="dash-subtitle">
                            Track your readiness, review results, and pick up right where you left off.
                        </p>
                        <div className="dash-modules-badge">
                            <span className="badge-dot" style={{ background: completedModules === 4 ? '#10b981' : '#f59e0b' }} />
                            {completedModules} / 4 modules completed
                        </div>
                    </div>
                    <div className="dash-hero-right">
                        <div className="overall-ring-card">
                            <div className="overall-ring-label">Overall Readiness</div>
                            <div className="overall-ring-outer">
                                <ScoreGauge value={animatedReadiness} label="Readiness Score" />
                            </div>
                            <div className={`readiness-tier ${readiness >= 70 ? 'tier-excellent' : readiness >= 50 ? 'tier-good' : readiness >= 30 ? 'tier-average' : 'tier-weak'}`}>
                                {readiness >= 70 ? '🔥 Excellent' : readiness >= 50 ? '👍 Good' : readiness >= 30 ? '📈 Average' : readiness === 0 ? '—  Not Started' : '⚠️ Needs Work'}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── 4 Module Widget Cards ── */}
                <div className="dash-widgets">

                    {/* Predictor widget */}
                    <div className={`dash-widget card card-glow ${!predictor ? 'dash-widget-empty' : ''}`}
                        style={{ borderColor: 'rgba(6,182,212,0.2)' }}>
                        <div className="widget-header">
                            <div className="widget-icon" style={{ background: 'rgba(6,182,212,0.12)', color: '#06b6d4' }}>🎯</div>
                            <div>
                                <div className="widget-title">Placement Predictor</div>
                                <div className="widget-sub">ML Readiness Score</div>
                            </div>
                            {predictor && <div className="widget-status status-done">✓ Done</div>}
                        </div>
                        {predictor ? (
                            <>
                                <div className="widget-score" style={{ color: '#06b6d4' }}>
                                    {predictor.probability}<span className="score-unit">%</span>
                                </div>
                                <div className="progress-bar" style={{ margin: '0.5rem 0 0.75rem' }}>
                                    <div className="progress-fill" style={{ width: `${predictor.probability}%`, background: 'linear-gradient(90deg,#06b6d4,#6366f1)' }} />
                                </div>
                                <div className="widget-tier">
                                    <span className={`tier-pill ${predictor.probability >= 75 ? 'tier-excellent' : predictor.probability >= 55 ? 'tier-good' : predictor.probability >= 35 ? 'tier-average' : 'tier-weak'}`}>
                                        {predictor.tier}
                                    </span>
                                </div>
                            </>
                        ) : (
                            <div className="widget-empty-state">
                                <p>No prediction yet</p>
                                <Link to="/predict" className="btn btn-sm btn-outline">Run Predictor →</Link>
                            </div>
                        )}
                    </div>

                    {/* Skill Gap widget */}
                    <div className={`dash-widget card card-glow ${!skillGap ? 'dash-widget-empty' : ''}`}
                        style={{ borderColor: 'rgba(99,102,241,0.2)' }}>
                        <div className="widget-header">
                            <div className="widget-icon" style={{ background: 'rgba(99,102,241,0.12)', color: '#6366f1' }}>🔍</div>
                            <div>
                                <div className="widget-title">Skill Gap Analyzer</div>
                                <div className="widget-sub">{skillGap?.targetRole || 'Role Analysis'}</div>
                            </div>
                            {skillGap && <div className="widget-status status-done">✓ Done</div>}
                        </div>
                        {skillGap ? (
                            <>
                                <div className="widget-score" style={{ color: '#6366f1' }}>
                                    {skillGap.readinessScore}<span className="score-unit">%</span>
                                </div>
                                <div className="progress-bar" style={{ margin: '0.5rem 0 0.75rem' }}>
                                    <div className="progress-fill" style={{ width: `${skillGap.readinessScore}%`, background: 'linear-gradient(90deg,#6366f1,#8b5cf6)' }} />
                                </div>
                                <div className="widget-skill-row">
                                    <span className="skill-pill skill-pill-matched">✅ {skillGap.matchedCount} matched</span>
                                    <span className="skill-pill skill-pill-missing">❌ {skillGap.missingCount} missing</span>
                                </div>
                            </>
                        ) : (
                            <div className="widget-empty-state">
                                <p>No analysis yet</p>
                                <Link to="/skill-gap" className="btn btn-sm btn-outline">Analyze Skills →</Link>
                            </div>
                        )}
                    </div>

                    {/* Mock Interview widget */}
                    <div className={`dash-widget card card-glow ${!interview ? 'dash-widget-empty' : ''}`}
                        style={{ borderColor: 'rgba(139,92,246,0.2)' }}>
                        <div className="widget-header">
                            <div className="widget-icon" style={{ background: 'rgba(139,92,246,0.12)', color: '#8b5cf6' }}>🎤</div>
                            <div>
                                <div className="widget-title">AI Mock Interview</div>
                                <div className="widget-sub">{interview ? `${interview.role} · ${interview.companyType}` : 'Interview Score'}</div>
                            </div>
                            {interview && <div className="widget-status status-done">✓ Done</div>}
                        </div>
                        {interview ? (
                            <>
                                <div className="widget-score" style={{ color: '#8b5cf6' }}>
                                    {interview.overallScore}<span className="score-unit">/10</span>
                                </div>
                                <div className="progress-bar" style={{ margin: '0.5rem 0 0.75rem' }}>
                                    <div className="progress-fill" style={{ width: `${interview.overallScore * 10}%`, background: 'linear-gradient(90deg,#8b5cf6,#6366f1)' }} />
                                </div>
                                <div className="widget-sub-scores">
                                    <span>Tech: <strong>{interview.technicalScore}</strong></span>
                                    <span>Depth: <strong>{interview.depthScore}</strong></span>
                                    <span>Clarity: <strong>{interview.clarityScore}</strong></span>
                                </div>
                            </>
                        ) : (
                            <div className="widget-empty-state">
                                <p>No interview yet</p>
                                <Link to="/mock-interview" className="btn btn-sm btn-outline">Start Interview →</Link>
                            </div>
                        )}
                    </div>

                    {/* Roadmap widget */}
                    <div className={`dash-widget card card-glow ${!roadmap ? 'dash-widget-empty' : ''}`}
                        style={{ borderColor: 'rgba(16,185,129,0.2)' }}>
                        <div className="widget-header">
                            <div className="widget-icon" style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>🗺️</div>
                            <div>
                                <div className="widget-title">Learning Roadmap</div>
                                <div className="widget-sub">{roadmap?.jobRole || 'Personalized Plan'}</div>
                            </div>
                            {roadmap && <div className="widget-status status-done">✓ Done</div>}
                        </div>
                        {roadmap ? (
                            <>
                                <div className="widget-score" style={{ color: '#10b981' }}>
                                    {roadmap.totalTopics}<span className="score-unit"> topics</span>
                                </div>
                                <div className="widget-roadmap-meta">
                                    <div className="meta-item">
                                        <span className="meta-label">Duration</span>
                                        <span className="meta-val">{roadmap.targetWeeks} weeks</span>
                                    </div>
                                    <div className="meta-item">
                                        <span className="meta-label">Generated</span>
                                        <span className="meta-val">{roadmap.generatedAt ? new Date(roadmap.generatedAt).toLocaleDateString() : '—'}</span>
                                    </div>
                                </div>
                                <div className="progress-bar" style={{ marginTop: '0.75rem' }}>
                                    <div className="progress-fill" style={{ width: '100%', background: 'linear-gradient(90deg,#10b981,#06b6d4)' }} />
                                </div>
                            </>
                        ) : (
                            <div className="widget-empty-state">
                                <p>No roadmap yet</p>
                                <Link to="/roadmap" className="btn btn-sm btn-outline">Get Roadmap →</Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Quick Actions ── */}
                <div className="dash-section-label">Quick Actions</div>
                <div className="dash-quick-actions">
                    {MODULE_LINKS.map(m => (
                        <Link key={m.to} to={m.to} className="quick-action-btn" style={{ '--qa-color': m.color }}>
                            <span className="qa-icon">{m.icon}</span>
                            <span className="qa-label">{m.label}</span>
                            <span className="qa-arrow">→</span>
                        </Link>
                    ))}
                </div>

                {/* ── Tips / Next Steps ── */}
                {completedModules < 4 && (
                    <div className="dash-tips card" style={{ marginTop: '2rem', marginBottom: '3rem' }}>
                        <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>💡 Next Steps</h3>
                        <div className="tips-grid">
                            {!predictor && (
                                <Link to="/predict" className="tip-card">
                                    <span>🎯</span>
                                    <div>
                                        <strong>Run the ML Predictor</strong>
                                        <p>Get your placement probability based on 7 key factors.</p>
                                    </div>
                                </Link>
                            )}
                            {!skillGap && (
                                <Link to="/skill-gap" className="tip-card">
                                    <span>🔍</span>
                                    <div>
                                        <strong>Analyze Your Skill Gap</strong>
                                        <p>See what skills are missing for your target role.</p>
                                    </div>
                                </Link>
                            )}
                            {!interview && (
                                <Link to="/mock-interview" className="tip-card">
                                    <span>🎤</span>
                                    <div>
                                        <strong>Take a Mock Interview</strong>
                                        <p>Practice with AI-evaluated role-specific questions.</p>
                                    </div>
                                </Link>
                            )}
                            {!roadmap && (
                                <Link to="/roadmap" className="tip-card">
                                    <span>🗺️</span>
                                    <div>
                                        <strong>Generate Your Roadmap</strong>
                                        <p>Get a week-by-week personalized study plan.</p>
                                    </div>
                                </Link>
                            )}
                        </div>
                    </div>
                )}

                {completedModules === 4 && (
                    <div className="dash-complete-banner card" style={{ marginTop: '2rem', marginBottom: '3rem' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🎉</div>
                        <h3>All Modules Complete!</h3>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                            You've completed all 4 modules. Keep improving by re-running them to boost your readiness score!
                        </p>
                    </div>
                )}

            </div>
        </div>
    )
}
