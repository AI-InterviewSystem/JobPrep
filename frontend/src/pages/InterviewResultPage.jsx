import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import logo from "../assets/images/jobprep-logo.png"

const strengths = [
    "Strong articulation of design systems.",
    "Excellent STAR method implementation.",
    "User-centric problem-solving approach.",
]

const areasToImprove = [
    "Maintain more consistent eye contact.",
    "Elaborate more on \"failure\" scenarios.",
    "Reduce use of filler words (um, like).",
]

const logicMetrics = [
    { label: "Contextual Depth", value: 90 },
    { label: "Actionable Steps", value: 65 },
    { label: "Result Quantifiability", value: 75 },
]

const SCORE = 85

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
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-gray-50 font-display flex flex-col">
            {/* Navbar */}
            <header className="border-b border-gray-100 bg-white">
                <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
                    <Link to="/" className="flex items-center gap-2">
                        <img src={logo} alt="JobPrep" className="h-8" />
                        <span className="font-bold text-primary">JobPrep</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <button className="flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-primary-dark transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download Report
                        </button>
                        <div className="w-9 h-9 rounded-full bg-orange-200 flex items-center justify-center">
                            <span className="text-orange-700 font-bold text-sm">A</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto w-full px-6 py-10 flex-1">
                {/* Page Title */}
                <div className="mb-8 animate-entry">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-1">Interview Analysis</h1>
                    <p className="text-gray-500">Detailed feedback for your Senior Product Designer role simulation.</p>
                </div>

                {/* Top Row */}
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                    {/* Overall Score */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center">
                        <p className="text-sm text-gray-500 mb-4">Overall Score</p>
                        <CircularScore score={SCORE} />
                        <div className="mt-4 bg-green-50 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full">
                            Top 15% of Candidates
                        </div>
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
                            <div className="bg-green-50 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-sm font-bold text-green-700">Strengths</span>
                                </div>
                                <ul className="space-y-2">
                                    {strengths.map((s, i) => (
                                        <li key={i} className="text-xs text-green-800 flex gap-1.5">
                                            <span className="mt-1 shrink-0">•</span>
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="bg-orange-50 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-sm font-bold text-orange-600">Areas to Improve</span>
                                </div>
                                <ul className="space-y-2">
                                    {areasToImprove.map((a, i) => (
                                        <li key={i} className="text-xs text-orange-800 flex gap-1.5">
                                            <span className="mt-1 shrink-0">•</span>
                                            {a}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Row */}
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                    {/* Confidence Meter */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-900">Confidence Meter</h3>
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <div className="relative h-2.5 bg-gray-100 rounded-full mb-2">
                            <div className="absolute h-full bg-primary rounded-full" style={{ width: "78%" }} />
                            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-primary rounded-full shadow" style={{ left: "78%" }} />
                        </div>
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>POOR</span>
                            <span className="text-primary font-bold">78% CONFIDENT</span>
                            <span>EXPERT</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-4 leading-relaxed">
                            Your tone was steady, but minor hesitations were noted during technical questions.
                        </p>
                    </div>

                    {/* Logic Structure */}
                    <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <div className="flex items-center gap-2 mb-5">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                            <h3 className="font-bold text-gray-900 text-lg">Logic Structure Analysis</h3>
                        </div>
                        <div className="space-y-5">
                            {logicMetrics.map(({ label, value }, index) => (
                                <div key={label}>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className="text-sm text-gray-700">{label}</span>
                                        <span className="text-sm font-bold text-primary">{value}%</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-primary rounded-full"
                                            initial={{ width: 0 }}
                                            whileInView={{ width: `${value}%` }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 1, delay: 0.2 + index * 0.1, ease: "circOut" }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Suggested Ideal Answer */}
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8 mb-8">
                    <div className="flex items-center gap-2 mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <h3 className="font-bold text-gray-900 text-lg">Suggested Ideal Answer</h3>
                    </div>
                    <p className="text-sm text-gray-500 italic mb-5">
                        "Based on your interview for 'Tell me about a time you had to pivot your design strategy'..."
                    </p>
                    <div className="bg-white rounded-xl p-5 space-y-3">
                        {[
                            { label: "Situation", text: "At my previous company, we were 3 weeks away from launching a new checkout flow when usability testing revealed a 40% drop-off rate on mobile." },
                            { label: "Task", text: "I needed to identify the root cause, propose a fix, and align the engineering team without delaying the launch by more than 2 days." },
                            { label: "Action", text: "I conducted a rapid 24-hour audit, simplified the form fields by 30%, and introduced a 'one-tap' payment option. I presented the data-backed prototype to stakeholders to gain instant buy-in." },
                            { label: "Result", text: "We launched with only a 48-hour delay. Post-launch metrics showed a 15% increase in conversion compared to the legacy system, and it became the new standard for our mobile experience." },
                        ].map(({ label, text }) => (
                            <p key={label} className="text-sm text-gray-700 leading-relaxed">
                                <strong>{label}:</strong>{" "}{text}
                            </p>
                        ))}
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

            <footer className="border-t border-gray-50 py-5 px-6 bg-white">
                <div className="max-w-6xl mx-auto flex justify-between items-center text-xs text-gray-400">
                    <div className="flex items-center gap-2">
                        <img src={logo} alt="JobPrep" className="h-5" />
                        <span className="text-gray-500 font-medium">JobPrep © 2024</span>
                    </div>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-primary transition-colors">Support</a>
                    </div>
                </div>
            </footer>
        </div>
    )
}
