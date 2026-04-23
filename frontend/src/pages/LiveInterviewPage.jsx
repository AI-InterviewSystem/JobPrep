import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import logo from "../assets/images/jobprep-logo.png"

const TOTAL_QUESTIONS = 10
const INITIAL_QUESTION = 4

const currentQuestion = `"Can you describe a challenging project you've worked on recently and specifically how you handled the communication with difficult stakeholders?"`
const aiMessage = `AI: "Thank you for that background. Now, regarding your experience..."`

export default function LiveInterviewPage() {
    const navigate = useNavigate()
    const [questionNum, setQuestionNum] = useState(INITIAL_QUESTION)
    const [seconds, setSeconds] = useState(338) // 5:38
    const [isPaused, setIsPaused] = useState(false)
    const [sessionSecondsLeft, setSessionSecondsLeft] = useState(14 * 60 + 22) // 14:22

    // Countdown timers
    useEffect(() => {
        if (isPaused) return
        const t1 = setInterval(() => setSeconds(s => s + 1), 1000)
        const t2 = setInterval(() => setSessionSecondsLeft(s => Math.max(0, s - 1)), 1000)
        return () => { clearInterval(t1); clearInterval(t2) }
    }, [isPaused])

    const fmt = (secs) => {
        const m = String(Math.floor(secs / 60)).padStart(2, "0")
        const s = String(secs % 60).padStart(2, "0")
        return `${m}:${s}`
    }

    const progressPct = ((questionNum - 1) / TOTAL_QUESTIONS) * 100

    const handleNext = () => {
        if (questionNum < TOTAL_QUESTIONS) setQuestionNum(q => q + 1)
        else navigate("/interview-result")
    }

    return (
        <div className="min-h-screen bg-gray-50 font-display flex flex-col">
            {/* Top bar */}
            <header className="border-b border-gray-100 bg-white">
                <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
                    <img src={logo} alt="JobPrep" className="h-8" />
                    <div className="flex items-center gap-5">
                        <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Session Ends: <span className="font-bold text-gray-900">{fmt(sessionSecondsLeft)}</span>
                        </div>
                        <button className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </button>
                        <button className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </button>
                        <div className="w-9 h-9 rounded-full bg-orange-200 flex items-center justify-center">
                            <span className="text-orange-700 font-bold text-sm">A</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
                <div className="grid lg:grid-cols-5 gap-6">
                    {/* Left - AI Interviewer Video + Transcription */}
                    <div className="lg:col-span-3 space-y-5">
                        {/* AI Video feed */}
                        <div className="relative rounded-2xl overflow-hidden bg-gray-800 aspect-video">
                            <div className="absolute inset-0 flex items-center justify-center"
                                style={{ background: "linear-gradient(160deg,#1a1a2e,#16213e,#0f3460)" }}>
                                {/* AI Interviewer avatar placeholder */}
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-600 to-gray-400 flex items-center justify-center text-6xl">
                                        🧑‍💼
                                    </div>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <div
                                                key={i}
                                                className="w-1 bg-blue-400 rounded-full animate-pulse"
                                                style={{ height: `${8 + Math.random() * 24}px`, animationDelay: `${i * 0.1}s` }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="absolute bottom-4 left-4 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block"></span>
                                <span className="text-white text-xs font-semibold uppercase tracking-widest">AI Interviewer Live</span>
                            </div>
                        </div>

                        {/* Live Transcription */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span className="text-xs font-bold text-primary uppercase tracking-widest">Live Transcription</span>
                            </div>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={aiMessage}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="mb-3"
                                >
                                    <p className="text-sm text-gray-400 italic">{aiMessage}</p>
                                </motion.div>
                            </AnimatePresence>
                            <div className="border-l-4 border-primary pl-4 py-1">
                                <motion.p
                                    key={currentQuestion}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="text-gray-700 text-sm leading-relaxed font-medium"
                                >
                                    {currentQuestion}
                                </motion.p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right - Controls */}
                    <div className="lg:col-span-2 space-y-5">
                        {/* Progress */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <p className="text-xs text-gray-400 font-medium">Interview Progress</p>
                                    <p className="text-xl font-extrabold text-gray-900">Question {questionNum} of {TOTAL_QUESTIONS}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-400 font-medium">Time Elapsed</p>
                                    <p className="text-xl font-extrabold text-primary">{fmt(seconds)}</p>
                                </div>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden mt-3">
                                <motion.div
                                    className="h-full bg-primary rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressPct}%` }}
                                    transition={{ duration: 0.8, ease: "circOut" }}
                                />
                            </div>
                        </div>

                        {/* User Camera */}
                        <div className="rounded-2xl p-5 text-white flex flex-col items-center gap-3"
                            style={{ background: "linear-gradient(135deg,#013066,#0058bd)" }}>
                            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border-2 border-white/40">
                                <span className="text-2xl">👤</span>
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-sm">Your Mic is Active</p>
                                <p className="text-blue-200 text-xs">AI is listening to your response...</p>
                            </div>
                            <div className="flex gap-1 mt-1">
                                {[3, 6, 9, 5, 7, 4, 8, 6, 3].map((h, i) => (
                                    <div
                                        key={i}
                                        className="w-1 bg-white/60 rounded-full animate-pulse"
                                        style={{ height: `${h * 2}px`, animationDelay: `${i * 0.08}s` }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Control Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsPaused(p => !p)}
                                className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-3.5 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                            >
                                {isPaused ? (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                        </svg>
                                        Resume
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        Pause
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => navigate("/interview-result")}
                                className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white py-3.5 rounded-xl font-semibold hover:bg-red-600 transition-all"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                End Interview
                            </button>
                        </div>

                        <button
                            onClick={handleNext}
                            className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3.5 rounded-xl font-bold hover:bg-primary-dark transition-all"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                            Next Question
                        </button>

                        {/* Quick Tip */}
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            <div>
                                <p className="text-sm font-bold text-gray-800 mb-0.5">Quick Tip</p>
                                <p className="text-xs text-gray-500">Try to use the STAR method (Situation, Task, Action, Result) for this response.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Status Bar */}
            <div className="border-t border-gray-100 bg-white py-3 px-6">
                <div className="max-w-7xl mx-auto flex items-center justify-between text-xs font-semibold">
                    <div className="flex items-center gap-6">
                        <span className="flex items-center gap-1.5 text-green-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                            </svg>
                            CONNECTION: EXCELLENT
                        </span>
                        <span className="flex items-center gap-1.5 text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 016 0v6a3 3 0 01-3 3z" />
                            </svg>
                            INPUT: DEFAULT MACBOOK PRO
                        </span>
                    </div>
                    <span className="flex items-center gap-1.5 text-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 016 0v6a3 3 0 01-3 3z" />
                        </svg>
                        VOICE INTELLIGENCE: ACTIVE
                    </span>
                </div>
            </div>
        </div>
    )
}
