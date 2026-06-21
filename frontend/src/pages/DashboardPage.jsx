import { useEffect, useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { FiAward, FiBell, FiCheck, FiCheckCircle, FiChevronRight, FiClock, FiSettings, FiStar, FiTrendingUp, FiActivity, FiTarget, FiZap, FiX } from 'react-icons/fi';
import { dashboardApi } from "../services/api"
import { storage } from "../services/storage"

function formatRelativeTime(iso) {
    if (!iso) return "—"
    const d = new Date(iso)
    const diff = Date.now() - d.getTime()
    const hours = Math.floor(diff / 3600000)
    if (hours < 1) return "Vừa xong"
    if (hours < 24) return `${hours}h trước`
    const days = Math.floor(hours / 24)
    if (days === 1) return "Hôm qua"
    return `${days} ngày trước`
}

function formatScore(score) {
    if (score == null) return "—"
    const n = Number(score)
    if (n <= 10) return `${n.toFixed(1)} / 10`
    return `${Math.round(n)}%`
}

function AchievementModal({ achievement, onClose }) {
    if (!achievement) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="relative h-32 bg-gradient-to-br from-primary to-primary-dark p-6 flex items-end">
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors">
                        <FiX />
                    </button>
                    <div className="p-3 rounded-2xl bg-white shadow-lg -mb-8">
                        <span className="material-symbols-outlined text-4xl text-amber-500">
                            {achievement.icon || "emoji_events"}
                        </span>
                    </div>
                </div>
                <div className="p-8 pt-12">
                    <h3 className="text-2xl font-black text-slate-900 mb-2">{achievement.name}</h3>
                    <div className="flex items-center gap-2 mb-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${achievement.unlocked ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                            {achievement.unlocked ? 'Unlocked' : 'Locked'}
                        </span>
                        {achievement.unlockedAt && (
                            <span className="text-xs text-slate-400">Achieved on {new Date(achievement.unlockedAt).toLocaleDateString()}</span>
                        )}
                    </div>
                    <div className="space-y-4">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Description</p>
                            <p className="text-slate-600 leading-relaxed">{achievement.description}</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Requirement</p>
                            <p className="text-slate-600 font-medium">{achievement.condition}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-full mt-8 py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors"
                    >
                        Got it!
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const user = storage.getUser() || {}
    const userName = user.fullName || "User"
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selectedAchievement, setSelectedAchievement] = useState(null)

    useEffect(() => {
        dashboardApi.get()
            .then(res => setData(res.data))
            .catch(err => setError(err?.response?.data?.message || "Failed to load dashboard insights"))
            .finally(() => setLoading(false))
    }, [])

    const overview = data?.overview
    const streak = data?.streak
    const scoreChart = data?.scoreChart || []
    const recentSessions = data?.recentSessions || []
    const weakTopics = data?.weakTopics || []
    const strongTopics = data?.strongTopics || []
    const topicCounts = data?.topicPracticeCounts || []
    const achievements = data?.achievements || []

    const chartData = useMemo(() => {
        const days = []
        for (let i = 29; i >= 0; i--) {
            const date = new Date()
            date.setDate(date.getDate() - i)
            const dateStr = date.toISOString().split('T')[0]
            const sessionsForDay = scoreChart.filter(p => {
                const pDate = p.date || (p.completedAt ? p.completedAt.split('T')[0] : '')
                return pDate === dateStr
            })
            const avg = sessionsForDay.length > 0
                ? sessionsForDay.reduce((acc, s) => acc + (Number(s.overallScore) || 0), 0) / sessionsForDay.length
                : 0

            let label = ''
            if (i === 29) label = '30d ago'
            if (i === 20) label = '20d ago'
            if (i === 10) label = '10d ago'
            if (i === 0) label = 'Today'

            days.push({ dateStr, avg, sessions: sessionsForDay, label })
        }
        return days
    }, [scoreChart])

    if (loading) {
        return (
            <div className="bg-[#f8fafc] min-h-screen font-display">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 space-y-8 animate-pulse">
                    {/* Skeleton Overview Card */}
                    <div className="flex flex-col md:flex-row overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm h-[300px]">
                        <div className="md:w-1/4 bg-slate-200" />
                        <div className="flex flex-col gap-4 p-10 flex-1">
                            <div className="h-4 bg-slate-200 rounded w-24" />
                            <div className="h-10 bg-slate-200 rounded w-1/2" />
                            <div className="h-6 bg-slate-200 rounded w-3/4 mt-4" />
                            <div className="flex gap-6 mt-6">
                                <div className="h-6 bg-slate-200 rounded w-32" />
                                <div className="h-6 bg-slate-200 rounded w-32" />
                                <div className="h-6 bg-slate-200 rounded w-32" />
                            </div>
                            <div className="flex gap-4 mt-8">
                                <div className="h-12 bg-slate-200 rounded-xl w-40" />
                                <div className="h-12 bg-slate-200 rounded-xl w-40" />
                            </div>
                        </div>
                    </div>

                    {/* Skeleton 4 Grid Cards */}
                    <div className="grid md:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm flex items-center gap-4 h-24">
                                <div className="w-12 h-12 rounded-xl bg-slate-200" />
                                <div className="flex-1">
                                    <div className="h-3 bg-slate-200 rounded w-20 mb-2" />
                                    <div className="h-6 bg-slate-200 rounded w-16" />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Skeleton Chart & Side Panels */}
                    <div className="grid lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-8 space-y-8">
                            <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm h-96">
                                <div className="h-8 bg-slate-200 rounded w-1/3 mb-4" />
                                <div className="h-4 bg-slate-200 rounded w-1/2 mb-10" />
                                <div className="h-48 bg-slate-100 rounded-lg w-full" />
                            </div>
                        </div>
                        <div className="lg:col-span-4 space-y-8">
                            <div className="rounded-3xl bg-slate-200 shadow-xl h-64" />
                            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm h-64">
                                <div className="h-6 bg-slate-200 rounded w-1/2 mb-6" />
                                <div className="space-y-4">
                                    <div className="h-16 bg-slate-100 rounded-2xl w-full" />
                                    <div className="h-16 bg-slate-100 rounded-2xl w-full" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] gap-4">
                <p className="text-red-600 font-medium">{error}</p>
                <button type="button" onClick={() => window.location.reload()} className="bg-primary text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all">
                    Retry
                </button>
            </div>
        )
    }

    const avgDisplay = overview?.averageOverallScore != null
        ? `${Number(overview.averageOverallScore).toFixed(1)}`
        : "—"

    return (
        <div className="bg-[#f8fafc] font-display text-slate-900 min-h-screen">
            <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
                <main className="flex-1 pb-12">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col md:flex-row overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-sm"
                        >
                            <div className="md:w-1/4 bg-[#dbeafe] flex items-center justify-center p-8">
                                <span className="material-symbols-outlined text-primary" style={{ fontSize: "120px" }}>insights</span>
                            </div>
                            <div className="flex flex-col gap-3 p-10 flex-1">
                                <p className="text-primary text-xs font-bold uppercase tracking-widest">OVERVIEW</p>
                                <h1 className="text-[#0e141b] text-4xl font-black">Welcome back, {userName}!</h1>
                                <p className="text-[#4e7397] text-lg font-medium leading-relaxed max-w-2xl">
                                    {data?.progressSummary || "Keep practicing to sharpen your interview skills and boost your confidence."}
                                </p>
                                <div className="flex flex-wrap items-center gap-6 mt-2 text-sm font-semibold text-slate-600">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary text-lg">hotel_class</span>
                                        <span>Avg Score: <strong className="text-primary">{avgDisplay}</strong></span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-orange-500 text-lg">local_fire_department</span>
                                        <span>Streak: <strong className="text-primary">{streak?.currentStreak ?? 0} days</strong></span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-blue-500 text-lg">fact_check</span>
                                        <span>Interviews: <strong>{overview?.completedInterviewSessions ?? 0}</strong></span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 mt-6">
                                    <Link to="/interview-setup" className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all flex items-center gap-2">
                                        <span className="material-symbols-outlined">play_arrow</span> Mock Interview
                                    </Link>
                                    <Link to="/question-bank" className="bg-white border border-slate-200 text-slate-700 px-8 py-3 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
                                        <span className="material-symbols-outlined">quiz</span> Question Bank
                                    </Link>
                                </div>
                                {overview?.lastActivityAt && (
                                    <p className="text-xs text-slate-400 mt-2">Last active: {formatRelativeTime(overview.lastActivityAt)}</p>
                                )}
                            </div>
                        </motion.div>

                        <div className="grid md:grid-cols-4 gap-6">
                            {[
                                { label: "TOTAL SESSIONS", value: overview?.totalInterviewSessions ?? 0, icon: "schedule", color: "text-blue-600" },
                                { label: "COMPLETED", value: overview?.completedInterviewSessions ?? 0, icon: "check_circle", color: "text-green-600" },
                                { label: "RETRIES", value: overview?.retryInterviewSessions ?? 0, icon: "history", color: "text-amber-600" },
                                { label: "QB PRACTICE", value: overview?.completedPracticeSessions ?? 0, icon: "menu_book", color: "text-purple-600" },
                            ].map((item, i) => (
                                <div key={i} className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm flex items-center gap-4">
                                    <div className={`p-3 rounded-xl bg-slate-50 ${item.color}`}>
                                        <span className="material-symbols-outlined">{item.icon}</span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.label}</p>
                                        <p className="text-2xl font-black text-slate-900">{item.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="grid lg:grid-cols-12 gap-8 items-start">
                            <div className="lg:col-span-8 space-y-8">
                                <motion.div className="rounded-3xl border border-[#e2e8f0] bg-white p-10 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-10">
                                        <span className="material-symbols-outlined text-primary" style={{ fontSize: "100px" }}>analytics</span>
                                    </div>
                                    <h3 className="text-2xl font-black text-[#0e141b]">Performance Progress</h3>
                                    <p className="text-[#4e7397] font-medium text-sm mt-1">Mock Interview overall scores over late 30 days</p>
                                    {scoreChart.length === 0 ? (
                                        <div className="h-64 flex flex-col items-center justify-center text-slate-300">
                                            <span className="material-symbols-outlined text-6xl mb-4 opacity-20">bar_chart</span>
                                            <p className="font-medium">No sessions recorded in the last 30 days.</p>
                                        </div>
                                    ) : (
                                        <div className="mt-10">
                                            <div className="h-48 flex items-end gap-[2px] sm:gap-1 px-2 relative">
                                                {/* Y-axis helper lines */}
                                                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none border-b border-slate-100">
                                                    <div className="w-full border-t border-slate-50 h-0" />
                                                    <div className="w-full border-t border-slate-50 h-0" />
                                                    <div className="w-full border-t border-slate-50 h-0" />
                                                </div>

                                                {chartData.map((day, i) => {
                                                    const hasData = day.avg > 0
                                                    return (
                                                        <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                                                            {hasData && (
                                                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1.5 px-2.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-xl whitespace-nowrap z-20 pointer-events-none scale-90 group-hover:scale-100">
                                                                    <div className="font-black border-b border-white/10 pb-1 mb-1">{new Date(day.dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
                                                                    {day.sessions.length} session(s) • <span className="text-primary-light font-black">{day.avg.toFixed(1)}%</span>
                                                                </div>
                                                            )}
                                                            <div
                                                                className={`w-full rounded-t-sm transition-all duration-500 relative ${hasData ? 'bg-gradient-to-t from-primary/60 to-primary-dark shadow-[0_0_10px_rgba(var(--primary-rgb),0.1)]' : 'bg-slate-50/50'}`}
                                                                style={{
                                                                    height: hasData ? `${Math.max(day.avg, 10)}%` : '4%',
                                                                    opacity: hasData ? 1 : 0.3
                                                                }}
                                                            >
                                                                {hasData && (
                                                                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-sm" />
                                                                )}
                                                            </div>
                                                            {day.label && (
                                                                <div className="absolute -bottom-10 flex flex-col items-center">
                                                                    <div className="w-px h-2 bg-slate-200 mb-1" />
                                                                    <span className="text-[9px] font-black text-slate-400 whitespace-nowrap uppercase tracking-tighter">
                                                                        {day.label}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                            <div className="mt-12 flex justify-center gap-6 text-[10px] font-bold text-slate-400">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-2.5 h-2.5 rounded-sm bg-primary" />
                                                    <span>Performance Score</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-2.5 h-2.5 rounded-sm bg-slate-100" />
                                                    <span>No Activity</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>

                                <section className="p-6 rounded-2xl bg-white border border-slate-200">
                                    <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                                        <FiStar className="text-amber-500" /> Strong Topics
                                    </h2>
                                    <div className="space-y-4">
                                        {strongTopics.length > 0 ? strongTopics.map(t => (
                                            <Link
                                                key={t.topicId}
                                                to={`/question-bank?topicId=${t.topicId}`}
                                                className="block p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-primary/30 hover:bg-white transition-all group"
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <span className="font-black text-slate-800 group-hover:text-primary transition-colors">{t.topicName}</span>
                                                        <div className="flex gap-3 mt-1">
                                                            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase">
                                                                <FiCheckCircle className="text-green-500" /> {t.correctCount}/{t.totalPracticed} Correct
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="block text-lg font-black text-primary leading-none">{t.avgScore}%</span>
                                                        <span className="text-[10px] font-bold text-slate-400 tracking-wider">AVERAGE</span>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-slate-500 bg-white/50 p-2 rounded-lg border border-slate-100">{t.suggestion}</p>
                                            </Link>
                                        )) : <p className="text-slate-400 text-sm">No strong topics identified yet.</p>}
                                    </div>
                                </section>

                                <section className="p-6 rounded-2xl bg-white border border-slate-200">
                                    <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                                        <FiTrendingUp className="text-primary" /> Areas to Improve
                                    </h2>
                                    <div className="space-y-4">
                                        {weakTopics.length > 0 ? weakTopics.map(t => (
                                            <Link
                                                key={t.topicId}
                                                to={`/question-bank?topicId=${t.topicId}`}
                                                className="block p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-rose-200 hover:bg-white transition-all group"
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <span className="font-black text-slate-800 group-hover:text-rose-500 transition-colors">{t.topicName}</span>
                                                        <div className="flex gap-3 mt-1">
                                                            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase">
                                                                <FiCheckCircle className="text-rose-300" /> {t.correctCount}/{t.totalPracticed} Correct
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="block text-lg font-black text-rose-500 leading-none">{t.avgScore}%</span>
                                                        <span className="text-[10px] font-bold text-slate-400 tracking-wider">AVERAGE</span>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-slate-500 bg-white/50 p-2 rounded-lg border border-slate-100">{t.suggestion}</p>
                                            </Link>
                                        )) : <p className="text-slate-400 text-sm">No areas identified for improvement yet.</p>}
                                    </div>
                                </section>
                            </div>

                            <div className="lg:col-span-4 space-y-8">
                                <motion.div className="rounded-3xl bg-slate-900 p-8 text-white shadow-xl relative overflow-hidden">
                                    <div className="absolute -bottom-4 -right-4 opacity-20">
                                        <span className="material-symbols-outlined" style={{ fontSize: "160px" }}>local_fire_department</span>
                                    </div>
                                    <p className="text-white/50 text-sm font-bold uppercase tracking-widest">Active Streak</p>
                                    <h2 className="text-6xl font-black mt-2">{streak?.currentStreak ?? 0} <span className="text-2xl font-medium text-white/50">days</span></h2>
                                    <p className="text-white/60 text-sm mt-2 font-medium">Your personal record: {streak?.longestStreak ?? 0} days</p>
                                    {streak?.practicedToday && (
                                        <div className="mt-6 flex items-center gap-2 text-sm font-bold text-emerald-400 bg-emerald-400/10 inline-flex px-4 py-2 rounded-xl">
                                            <span className="material-symbols-outlined text-lg">task_alt</span>
                                            Practiced Today
                                        </div>
                                    )}
                                </motion.div>

                                <motion.div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                                    <div className="flex justify-between items-center mb-6">
                                        <h4 className="font-black text-xl">Recent Sessions</h4>
                                        <Link to="/interview-history" className="text-primary text-xs font-bold hover:underline">View History</Link>
                                    </div>
                                    <div className="space-y-4">
                                        {recentSessions.length === 0 ? (
                                            <p className="text-sm text-slate-400 py-4 text-center">No recent activity</p>
                                        ) : recentSessions.map(s => (
                                            <Link
                                                key={s.id}
                                                to={s.status === "COMPLETED" ? `/interview-result?sessionId=${s.id}` : `/interview-setup`}
                                                className="block p-4 rounded-2xl hover:bg-slate-50 border border-slate-100 hover:border-primary/20 transition-all"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <p className="font-bold text-sm text-slate-800">{s.title || s.role || "Mock Interview"}</p>
                                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${s.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                                        {s.status}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-slate-500 mt-1">{formatRelativeTime(s.completedAt)} · {s.level || 'Mid Level'}</p>
                                                <div className="mt-3 flex items-center gap-2">
                                                    <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                                                        <div className="h-full bg-primary" style={{ width: `${Number(s.overallScore) || 0}%` }} />
                                                    </div>
                                                    <p className="text-[10px] font-black text-primary">{formatScore(s.overallScore)}</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </motion.div>

                                <motion.div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                                    <h4 className="font-black text-xl mb-6">Badges & Achievements</h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                                        {achievements.map(a => (
                                            <button
                                                key={a.code}
                                                onClick={() => setSelectedAchievement(a)}
                                                className={`p-4 rounded-2xl text-center flex flex-col items-center gap-2 transition-all hover:scale-105 active:scale-95 ${a.unlocked ? "bg-amber-50/50 border border-amber-200 shadow-sm" : "bg-slate-50 border border-transparent opacity-60 grayscale"}`}
                                            >
                                                <div className={`p-2 rounded-full ${a.unlocked ? 'bg-white shadow-sm' : ''}`}>
                                                    <span className={`material-symbols-outlined text-2xl ${a.unlocked ? 'text-amber-500' : 'text-slate-400'}`}>
                                                        {a.icon || "emoji_events"}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] font-black text-slate-800 leading-tight">{a.name}</p>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            <AchievementModal
                achievement={selectedAchievement}
                onClose={() => setSelectedAchievement(null)}
            />
        </div>
    )
}
