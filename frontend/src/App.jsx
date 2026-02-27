import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import SkillGap from './pages/SkillGap'
import MockInterview from './pages/MockInterview'
import Predictor from './pages/Predictor'
import Roadmap from './pages/Roadmap'

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Navbar />
                <Routes>
                    {/* Public */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Protected */}
                    <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                    <Route path="/skill-gap" element={<ProtectedRoute><SkillGap /></ProtectedRoute>} />
                    <Route path="/mock-interview" element={<ProtectedRoute><MockInterview /></ProtectedRoute>} />
                    <Route path="/predict" element={<ProtectedRoute><Predictor /></ProtectedRoute>} />
                    <Route path="/roadmap" element={<ProtectedRoute><Roadmap /></ProtectedRoute>} />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    )
}
