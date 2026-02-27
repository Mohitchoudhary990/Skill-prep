import React from 'react'
import { Link } from 'react-router-dom'
import '../styles/home.css'

const features = [
    {
        icon: '🔍',
        color: 'rgba(99,102,241,0.15)',
        title: 'Skill Gap Analyzer',
        desc: 'AI compares your skills against SDE / AIML / Data Analyst job requirements and reveals exactly what you are missing.',
        link: '/skill-gap',
        cta: 'Analyze Skills',
    },
    {
        icon: '🎤',
        color: 'rgba(139,92,246,0.15)',
        title: 'AI Mock Interview',
        desc: 'Role-specific questions evaluated on technical depth, clarity, and coverage. Get instant scores and model answers.',
        link: '/mock-interview',
        cta: 'Start Interview',
    },
    {
        icon: '🎯',
        color: 'rgba(6,182,212,0.15)',
        title: 'Placement Predictor',
        desc: 'A real Random Forest ML model takes your CGPA, DSA count, projects, and internship to predict your placement probability.',
        link: '/predict',
        cta: 'Predict Now',
    },
    {
        icon: '🗺️',
        color: 'rgba(16,185,129,0.15)',
        title: 'Personalized Roadmap',
        desc: 'Enter your weak areas and target role. Instantly get a week-by-week study plan with curated resources and practice problems.',
        link: '/roadmap',
        cta: 'Get Roadmap',
    },
]

const stats = [
    { value: '4', label: 'AI Modules' },
    { value: 'RF', label: 'ML Model' },
    { value: '∞', label: 'Mock Questions' },
    { value: '100%', label: 'Free' },
]

export default function Home() {
    return (
        <div className="page">
            {/* ── Hero ── */}
            <section className="hero">
                <div className="container">
                    <div className="hero-badge">
                        <span>✨</span> AI-Powered Placement Mentor
                    </div>
                    <h1 className="hero-title">
                        Your Personal<br />
                        <span className="gradient-text">Placement Coach</span>
                    </h1>
                    <p className="hero-subtitle">
                        Analyze your readiness, ace mock interviews, predict placement probability,
                        and get a personalized roadmap — all powered by real AI and ML.
                    </p>
                    <div className="hero-cta">
                        <Link to="/predict" className="btn btn-primary btn-lg">
                            🎯 Check Readiness
                        </Link>
                        <Link to="/skill-gap" className="btn btn-secondary btn-lg">
                            🔍 Analyze Skills
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── Stats ── */}
            <div className="container">
                <div className="stats-row">
                    {stats.map(s => (
                        <div className="stat-card" key={s.label}>
                            <div className="stat-value">{s.value}</div>
                            <div className="stat-label">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* ── Features ── */}
                <div className="section-header" style={{ marginTop: '3rem' }}>
                    <h2>Everything You Need to Get Placed</h2>
                    <p>Four powerful AI tools that work together as your placement mentor</p>
                </div>

                <div className="features-grid">
                    {features.map(f => (
                        <div className="card card-glow feature-card" key={f.link}>
                            <div className="feature-icon" style={{ background: f.color }}>
                                {f.icon}
                            </div>
                            <h3>{f.title}</h3>
                            <p style={{ marginBottom: '1.5rem' }}>{f.desc}</p>
                            <Link to={f.link} className="btn btn-outline btn-sm">
                                {f.cta} →
                            </Link>
                        </div>
                    ))}
                </div>

                {/* ── How it works ── */}
                <div className="section-header" style={{ marginTop: '5rem' }}>
                    <h2>How It Works</h2>
                    <p>Three simple steps to placement readiness</p>
                </div>

                <div className="features-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                    {[
                        { step: '01', title: 'Enter Your Profile', desc: 'Add your CGPA, DSA count, skills, projects, and target role.' },
                        { step: '02', title: 'Get AI Analysis', desc: 'Our ML model and rule-based AI engine evaluate your data instantly.' },
                        { step: '03', title: 'Follow Your Plan', desc: 'Get a score, missing skills, and a week-by-week roadmap to improve.' },
                    ].map(h => (
                        <div className="card" key={h.step}>
                            <div style={{
                                fontSize: '3rem',
                                fontWeight: '800',
                                background: 'var(--gradient-hero)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                marginBottom: '0.75rem',
                                fontFamily: "'JetBrains Mono', monospace",
                            }}>{h.step}</div>
                            <h3>{h.title}</h3>
                            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.875rem' }}>{h.desc}</p>
                        </div>
                    ))}
                </div>

                {/* ── CTA Banner ── */}
                <div className="card" style={{
                    marginTop: '4rem',
                    marginBottom: '4rem',
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.1) 100%)',
                    border: '1px solid rgba(99,102,241,0.25)',
                    textAlign: 'center',
                    padding: '3rem',
                }}>
                    <h2 style={{ marginBottom: '0.75rem' }}>Ready to crack your placement?</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                        Start with the ML predictor to see where you stand today.
                    </p>
                    <Link to="/predict" className="btn btn-primary btn-lg">
                        🚀 Get Started Free
                    </Link>
                </div>
            </div>
        </div>
    )
}
