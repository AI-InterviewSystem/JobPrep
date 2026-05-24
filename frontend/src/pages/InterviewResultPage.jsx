import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion"
import logo from "../assets/images/jobprep-logo.png"

const strengths = []
const areasToImprove = []




// Simple circular progress SVG
function CircularScore({ score }) {
    const R = 60
    const circumference = 2 * Math.PI * R
    const offset = circumference - (score / 100) * circumference

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width="160" height="160" className="-rotate-90">
                <circle cx="80" cy="80" r={R} fill="none" stroke="#e5e7eb" strokeWidth="12" />
                <motion.circle
                    cx="80" cy="80" r={R} fill="none"
                    stroke="#0058bd" strokeWidth="12"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    strokeLinecap="round"
                />
            </svg>
            <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="absolute flex flex-col items-center"
            >
                <span className="text-3xl font-extrabold text-gray-900">{score}%</span>
            </motion.div>
        </div>
    )
}

export default function InterviewResultPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const session = location.state?.session || {};
    const SCORE = session?.overallScore ?? 0;
    const sessionStrengths = session?.strengths ?? [];
    const sessionAreas = session?.weaknesses ?? [];

    return (
        <div className="min-h-screen bg-gray-50 font-display flex flex-col">
            <main className="max-w-6xl mx-auto w-full px-6 py-10 flex-1">
                {/* Page Title */}
                <div className="mb-8 animate-entry flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-extrabold text-gray-900 mb-1">Interview Analysis</h1>
                        <p className="text-gray-500">Detailed feedback for your simulation.</p>
                    </div>
                </div>

                {/* Top Row */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    {/* Overall Score */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center">
                        <p className="text-sm text-gray-500 mb-4">Overall Score</p>
                        <CircularScore score={SCORE} />
                        {SCORE > 0 && (
                            <div className="mt-4 bg-green-50 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full">
                                Analysis Complete
                            </div>
                        )}
                    </div>

                    {/* Strengths & Weaknesses */}
                    <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <div className="flex items-center gap-2 mb-5">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <h2 className="font-bold text-gray-900 text-lg">Strength & Weakness Analysis</h2>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="bg-green-50 rounded-xl p-4 text-center sm:text-left">
                                <div className="flex items-center gap-2 mb-3 justify-center sm:justify-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-sm font-bold text-green-700">Strengths</span>
                                </div>
                                <ul className="space-y-2 text-left">
                                    {sessionStrengths.length > 0 ? (
                                        sessionStrengths.map((s, i) => (
                                            <li key={i} className="text-xs text-green-800 flex gap-1.5">
                                                <span className="mt-1 shrink-0">•</span>
                                                {s}
                                            </li>
                                        ))
                                    ) : (
                                        <li className="text-xs text-green-500 italic">No specific strengths noted.</li>
                                    )}
                                </ul>
                            </div>
                            <div className="bg-orange-50 rounded-xl p-4 text-center sm:text-left">
                                <div className="flex items-center gap-2 mb-3 justify-center sm:justify-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-sm font-bold text-orange-600">Areas to Improve</span>
                                </div>
                                <ul className="space-y-2 text-left">
                                    {sessionAreas.length > 0 ? (
                                        sessionAreas.map((a, i) => (
                                            <li key={i} className="text-xs text-orange-800 flex gap-1.5">
                                                <span className="mt-1 shrink-0">•</span>
                                                {a}
                                            </li>
                                        ))
                                    ) : (
                                        <li className="text-xs text-orange-500 italic">No areas for improvement noted.</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Suggested Ideal Answer */}
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8 mb-8">
                    <div className="flex items-center gap-2 mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <h3 className="font-bold text-gray-900 text-lg">AI Summary & Feedback</h3>
                    </div>
                    <div className="bg-white rounded-xl p-5">
                        {session?.summaryText ? (
                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                                {session.summaryText}
                            </p>
                        ) : (
                            <p className="text-sm text-gray-400 italic">No summary available for this session.</p>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-center gap-4 flex-wrap pb-8">
                    <button
                        onClick={() => navigate("/interview-setup")}
                        className="border-2 border-gray-800 text-gray-800 font-bold px-8 py-3 rounded-xl hover:bg-gray-100 transition-all"
                    >
                        Retake Simulation
                    </button>
                    <button className="flex items-center gap-2 bg-primary text-white font-bold px-8 py-3 rounded-xl hover:bg-primary-dark transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download Full Report (PDF)
                    </button>
                </div>
            </main>
        </div>
    )
}
