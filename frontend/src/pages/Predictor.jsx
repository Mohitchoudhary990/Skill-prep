import React, { useState } from 'react'
import axios from 'axios'
import ScoreGauge from '../components/ScoreGauge'
import '../styles/predictor.css'

const API = 'http://localhost:5000/api'

const defaults = {
    cgpa: '',
    dsa_solved: '',
    ml_projects: '',
    internship: '0',
    communication: '',
    open_source_contribs: '',
    hackathons: '',
}

export default function Predictor() {
    const [form, setForm] = useState(defaults)
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

    const handleSubmit = async e => {
        e.preventDefault()
        setLoading(true); setError(''); setResult(null)
        try {
            const payload = {
                cgpa: parseFloat(form.cgpa),
                dsa_solved: parseInt(form.dsa_solved),
                ml_projects: parseInt(form.ml_projects),
                internship: parseInt(form.internship),
                communication: parseFloat(form.communication),
                open_source_contribs: parseInt(form.open_source_contribs || 0),
                hackathons: parseInt(form.hackathons || 0),
            }
            const { data } = await axios.post(`${API}/predict`, payload)
            setResult(data)
        } catch (err) {
            setError('Could not connect to the backend. Make sure backend + ML service are running.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="page">
            <div className="container">
                <div className="page-header">
                    <h1>🎯 Placement Readiness <span className="gradient-text">Predictor</span></h1>
                    <p>Our Random Forest ML model analyzes 7 key factors to predict your placement probability.</p>
                </div>

                <div className="two-col" style={{ alignItems: 'start', gap: '2rem' }}>
                    {/* ── Form ── */}
                    <div className="card">
                        <h3 style={{ marginBottom: '1.25rem' }}>Enter Your Profile</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="two-col">
                                <div className="form-group">
                                    <label>CGPA (0 – 10)</label>
                                    <input type="number" name="cgpa" placeholder="e.g. 8.2" min="0" max="10" step="0.1"
                                        value={form.cgpa} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>DSA Problems Solved</label>
                                    <input type="number" name="dsa_solved" placeholder="e.g. 250" min="0"
                                        value={form.dsa_solved} onChange={handleChange} required />
                                </div>
                            </div>
                            <div className="two-col">
                                <div className="form-group">
                                    <label>ML / Tech Projects</label>
                                    <input type="number" name="ml_projects" placeholder="e.g. 3" min="0"
                                        value={form.ml_projects} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Communication Score (1–10)</label>
                                    <input type="number" name="communication" placeholder="Self-rate 1–10" min="1" max="10" step="0.5"
                                        value={form.communication} onChange={handleChange} required />
                                </div>
                            </div>
                            <div className="two-col">
                                <div className="form-group">
                                    <label>Open Source Contributions</label>
                                    <input type="number" name="open_source_contribs" placeholder="PRs / commits" min="0"
                                        value={form.open_source_contribs} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>Hackathons Participated</label>
                                    <input type="number" name="hackathons" placeholder="e.g. 2" min="0"
                                        value={form.hackathons} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Internship Experience</label>
                                <select name="internship" value={form.internship} onChange={handleChange}>
                                    <option value="0">No internship</option>
                                    <option value="1">Yes, I've interned</option>
                                </select>
                            </div>
                            {error && <div className="info-box info-box-danger" style={{ marginBottom: '1rem' }}>{error}</div>}
                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                                {loading ? '⏳ Predicting...' : '🚀 Predict Placement Probability'}
                            </button>
                        </form>
                    </div>

                    {/* ── Result ── */}
                    <div>
                        {!result && !loading && (
                            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🤖</div>
                                <p style={{ color: 'var(--text-secondary)' }}>
                                    Fill the form and submit to see your placement probability.
                                </p>
                            </div>
                        )}
                        {loading && (
                            <div className="card loading-center">
                                <div className="spinner"></div>
                                <span>Analyzing with ML model...</span>
                            </div>
                        )}
                        {result && (
                            <div className="results-panel">
                                <div className="card" style={{ textAlign: 'center', marginBottom: '1.25rem', padding: '2rem' }}>
                                    <ScoreGauge value={result.probability} label="Placement Probability" />
                                    <div style={{
                                        fontSize: '1.1rem',
                                        fontWeight: '700',
                                        color: result.color,
                                        marginTop: '0.75rem',
                                    }}>
                                        {result.tier}
                                    </div>
                                </div>

                                <div className={`info-box ${result.probability >= 60 ? 'info-box-success' : result.probability >= 40 ? 'info-box-warning' : 'info-box-danger'}`}
                                    style={{ marginBottom: '1.25rem' }}>
                                    {result.message}
                                </div>

                                {result.recommendations?.length > 0 && (
                                    <div className="card">
                                        <h4 style={{ marginBottom: '1rem' }}>💡 Recommendations</h4>
                                        <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                                            {result.recommendations.map((r, i) => (
                                                <li key={i} style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{r}</li>
                                            ))}
                                        </ul>
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
