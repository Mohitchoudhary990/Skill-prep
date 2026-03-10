import React, { useState } from 'react'
import axios from 'axios'
import '../styles/interview.css'

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api'

const ROLES = [
    { key: 'SDE', icon: '💻', label: 'SDE' },
    { key: 'AIML', icon: '🧠', label: 'AI / ML' },
    { key: 'Data Analyst', icon: '📊', label: 'Data Analyst' },
]
const COMPANY_TYPES = [
    { key: 'Product', icon: '🚀', label: 'Product' },
    { key: 'Service', icon: '🏢', label: 'Service' },
]

const SCORE_COLOR = (s) => s >= 8 ? '#10b981' : s >= 6 ? '#6366f1' : s >= 4 ? '#f59e0b' : '#ef4444'

export default function MockInterview() {
    const [step, setStep] = useState('config')
    const [role, setRole] = useState('SDE')
    const [companyType, setCompanyType] = useState('Product')
    const [questionData, setQData] = useState(null)
    const [answer, setAnswer] = useState('')
    const [evaluation, setEval] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [qIdx, setQIdx] = useState(0)

    const fetchQuestion = async (idx = 0) => {
        setLoading(true); setError('')
        try {
            const { data } = await axios.post(`${API}/interview`, {
                role, company_type: companyType,
                action: 'get_question',
                question_idx: idx,
            })
            setQData(data)
            setAnswer('')
            setEval(null)
            setStep('question')
            setQIdx(idx)
        } catch (e) {
            setError('Cannot connect to backend.')
        } finally { setLoading(false) }
    }

    const submitAnswer = async () => {
        if (!answer.trim()) return
        setLoading(true); setError('')
        try {
            const { data } = await axios.post(`${API}/interview`, {
                role, company_type: companyType,
                action: 'evaluate',
                question_idx: qIdx,
                answer,
            })
            setEval(data)
            setStep('result')
        } catch (e) {
            setError('Could not evaluate answer.')
        } finally { setLoading(false) }
    }

    const nextQuestion = () => fetchQuestion(qIdx + 1)

    const totalDots = Math.min(questionData?.total_questions || 0, 10)

    return (
        <div className="page">
            <div className="container" style={{ maxWidth: 800 }}>
                <div className="page-header">
                    <h1>🎤 AI Mock <span className="gradient-text">Interview</span></h1>
                    <p>Role-specific questions evaluated on technical correctness, depth, and clarity.</p>
                </div>

                {/* ── Config ── */}
                {step === 'config' && (
                    <div className="card animate-fade-in">
                        <h3 style={{ marginBottom: '1.5rem' }}>Configure Your Interview</h3>

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
                            <label>Company Type</label>
                            <div className="role-selector" style={{ gridTemplateColumns: '1fr 1fr', maxWidth: 360 }}>
                                {COMPANY_TYPES.map(c => (
                                    <div key={c.key}
                                        className={`role-card ${companyType === c.key ? 'selected' : ''}`}
                                        onClick={() => setCompanyType(c.key)}>
                                        <span className="role-card-icon">{c.icon}</span>
                                        {c.label}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {error && <div className="info-box info-box-danger" style={{ marginBottom: '1rem' }}>{error}</div>}

                        <button className="btn btn-primary btn-lg" style={{ width: '100%' }}
                            onClick={() => fetchQuestion(0)} disabled={loading}>
                            {loading ? (
                                <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Loading…</>
                            ) : '🎤 Start Interview'}
                        </button>

                        <div className="info-box info-box-info" style={{ marginTop: '1rem' }}>
                            💡 <strong>Tips:</strong> Write as if explaining to an interviewer. Include key concepts, approach, and time complexity where relevant.
                        </div>
                    </div>
                )}

                {/* ── Question ── */}
                {step === 'question' && questionData && (
                    <div className="animate-fade-in">
                        {/* Progress header */}
                        <div className="interview-progress">
                            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                                Question <strong style={{ color: 'var(--text-primary)' }}>{qIdx + 1}</strong> of {questionData.total_questions}
                            </span>
                            <div className="interview-progress-dots">
                                {Array.from({ length: totalDots }).map((_, i) => (
                                    <div key={i} className={`progress-dot ${i < qIdx ? 'done' : i === qIdx ? 'current' : ''}`} />
                                ))}
                            </div>
                            <button className="btn btn-secondary btn-sm" onClick={() => setStep('config')}>
                                ← Change
                            </button>
                        </div>

                        <div className="question-card">
                            <div className="question-meta">
                                <span className={`difficulty-badge difficulty-${questionData.difficulty?.toLowerCase()}`}>
                                    {questionData.difficulty}
                                </span>
                                <span className="skill-tag skill-tag-user">{questionData.topic}</span>
                                <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    {role} · {companyType}
                                </span>
                            </div>
                            <h3 style={{ fontSize: '1.05rem', lineHeight: '1.65', marginBottom: '1.5rem' }}>
                                {questionData.question}
                            </h3>

                            <div className="form-group">
                                <label>Your Answer</label>
                                <textarea
                                    value={answer}
                                    onChange={e => setAnswer(e.target.value)}
                                    placeholder="Explain your approach, mention key concepts, time/space complexity, examples..."
                                    style={{ minHeight: 180 }}
                                />
                            </div>

                            {error && <div className="info-box info-box-danger" style={{ marginBottom: '1rem' }}>{error}</div>}

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button className="btn btn-primary" style={{ flex: 1 }}
                                    onClick={submitAnswer} disabled={loading || !answer.trim()}>
                                    {loading ? (
                                        <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Evaluating…</>
                                    ) : '📊 Submit & Evaluate'}
                                </button>
                                <button className="btn btn-secondary" onClick={nextQuestion} disabled={loading}>
                                    Skip →
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Result ── */}
                {step === 'result' && evaluation && (
                    <div className="animate-fade-in">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                            <h3>📊 Evaluation Results</h3>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button className="btn btn-primary btn-sm" onClick={nextQuestion}>Next Question →</button>
                                <button className="btn btn-outline btn-sm" onClick={() => setStep('config')}>Restart</button>
                            </div>
                        </div>

                        {/* Grade banner */}
                        <div className="grade-banner">
                            <div className="grade-letter">{evaluation.grade}</div>
                            <div>
                                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Overall Grade</div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{evaluation.feedback}</div>
                            </div>
                        </div>

                        {/* Scores */}
                        <div className="score-row" style={{ marginBottom: '1.25rem' }}>
                            {[
                                { label: 'Technical', val: evaluation.scores.technical },
                                { label: 'Depth', val: evaluation.scores.depth },
                                { label: 'Clarity', val: evaluation.scores.clarity },
                                { label: 'Overall', val: evaluation.scores.overall },
                            ].map((s, i) => (
                                <div className="score-item" key={s.label} style={{ animationDelay: `${i * 0.1}s` }}>
                                    <div className="score-value" style={{ color: SCORE_COLOR(s.val) }}>
                                        {s.val}<span style={{ fontSize: '1rem', opacity: 0.6 }}>/10</span>
                                    </div>
                                    <div className="score-label">{s.label}</div>
                                    <div className="progress-bar" style={{ height: 4 }}>
                                        <div className="progress-fill" style={{
                                            width: `${s.val * 10}%`,
                                            background: SCORE_COLOR(s.val),
                                        }} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Keywords matched */}
                        {evaluation.matched_keywords?.length > 0 && (
                            <div className="card" style={{ marginBottom: '1.25rem' }}>
                                <h4 style={{ marginBottom: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                    ✅ Key Concepts Covered
                                </h4>
                                <div className="tags-cloud">
                                    {evaluation.matched_keywords.map(k => (
                                        <span key={k} className="skill-tag skill-tag-matched">{k}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Model answer */}
                        <div className="card">
                            <h4 style={{ marginBottom: '0.875rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                🤖 Model Answer
                            </h4>
                            <div className="model-answer">{evaluation.model_answer}</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
