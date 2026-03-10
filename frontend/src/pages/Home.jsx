import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import '../styles/home.css'

const features = [
    {
        icon: '🔍',
        color: 'rgba(99,102,241,0.15)',
        borderColor: 'rgba(99,102,241,0.25)',
        title: 'Skill Gap Analyzer',
        desc: 'AI compares your skills against SDE / AIML / Data Analyst job requirements and reveals exactly what you are missing.',
        link: '/skill-gap',
        cta: 'Analyze Skills',
    },
    {
        icon: '🎤',
        color: 'rgba(139,92,246,0.15)',
        borderColor: 'rgba(139,92,246,0.25)',
        title: 'AI Mock Interview',
        desc: 'Role-specific questions evaluated on technical depth, clarity, and coverage. Get instant scores and model answers.',
        link: '/mock-interview',
        cta: 'Start Interview',
    },
    {
        icon: '🎯',
        color: 'rgba(6,182,212,0.15)',
        borderColor: 'rgba(6,182,212,0.25)',
        title: 'Placement Predictor',
        desc: 'A real Random Forest ML model takes your CGPA, DSA count, projects, and internship to predict your placement probability.',
        link: '/predict',
        cta: 'Predict Now',
    },
    {
        icon: '🗺️',
        color: 'rgba(16,185,129,0.15)',
        borderColor: 'rgba(16,185,129,0.25)',
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

const steps = [
    { step: '01', title: 'Enter Your Profile', desc: 'Add your CGPA, DSA count, skills, projects, and target role.' },
    { step: '02', title: 'Get AI Analysis', desc: 'Our ML model and rule-based AI engine evaluate your data instantly.' },
    { step: '03', title: 'Follow Your Plan', desc: 'Get a score, missing skills, and a week-by-week roadmap to improve.' },
]

export default function Home() {
    const featuresRef = useRef(null)

    // Animate feature cards on scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry, i) => {
                    if (entry.isIntersecting) {
                        entry.target.style.animationDelay = `${i * 0.1}s`
                        entry.target.classList.add('animate-fade-in-up')
                    }
                })
            },
            { threshold: 0.1 }
        )
        const cards = featuresRef.current?.querySelectorAll('.feature-card')
        cards?.forEach(card => observer.observe(card))
        return () => observer.disconnect()
    }, [])

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
                        <span className="gradient-text-shimmer">Placement Coach</span>
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
                <div className="stats-row stats-row-hero">
                    {stats.map(s => (
                        <div className="stat-card" key={s.label}>
                            <div className="stat-value">{s.value}</div>
                            <div className="stat-label">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* ── Features ── */}
                <div className="section-header" style={{ marginTop: '4rem' }}>
                    <h2>Everything You Need to Get Placed</h2>
                    <p>Four powerful AI tools that work together as your placement mentor</p>
                </div>

                <div className="features-grid" ref={featuresRef}>
                    {features.map(f => (
                        <div
                            className="card card-glow feature-card"
                            key={f.link}
                            style={{ borderColor: f.borderColor + '5a' }}
                        >
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
                <div className="section-header" style={{ marginTop: '5.5rem' }}>
                    <h2>How It Works</h2>
                    <p>Three simple steps to placement readiness</p>
                </div>

                <div className="steps-grid">
                    {steps.map(h => (
                        <div className="card" key={h.step}>
                            <div className="step-number">{h.step}</div>
                            <h3 style={{ marginBottom: '0.5rem' }}>{h.title}</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{h.desc}</p>
                        </div>
                    ))}
                </div>

                {/* ── CTA Banner ── */}
                <div className="cta-banner">
                    <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: '0.75rem' }}>
                        Ready to crack your placement?
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1rem' }}>
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
