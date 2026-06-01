import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { FiCalendar, FiChevronRight, FiClock, FiFilter, FiRefreshCw, FiSearch, FiTarget } from "react-icons/fi"
import { interviewSessionApi } from "../services/api"

const statusOptions = ["", "CREATED", "IN_PROGRESS", "COMPLETED"]
const levelOptions = ["", "Intern", "Junior", "Mid", "Senior"]
const typeOptions = ["", "Technical", "HR", "Behavioral", "mock"]

function formatDate(value) {
    if (!value) return "N/A"
    return new Intl.DateTimeFormat("en", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value))
}

function formatDuration(seconds) {
    if (!seconds && seconds !== 0) return "N/A"
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    if (mins <= 0) return `${secs}s`
    return `${mins}m ${secs}s`
}

function scoreTone(score) {
    if (score == null) return "bg-slate-100 text-slate-500"
    if (score >= 80) return "bg-emerald-50 text-emerald-700"
    if (score >= 70) return "bg-blue-50 text-blue-700"
    if (score >= 50) return "bg-amber-50 text-amber-700"
    return "bg-rose-50 text-rose-700"
}

function compactParams(filters) {
    return Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== "" && value != null)
    )
}

export default function InterviewHistoryPage() {
    const navigate = useNavigate()
    const [filters, setFilters] = useState({
        keyword: "",
        status: "",
        fromDate: "",
        toDate: "",
        minScore: "",
        maxScore: "",
        role: "",
        level: "",
        interviewType: "",
        topic: "",
    })
    const [sessions, setSessions] = useState([])
    const [selectedId, setSelectedId] = useState(null)
    const [selected, setSelected] = useState(null)
    const [loading, setLoading] = useState(false)
    const [detailLoading, setDetailLoading] = useState(false)
    const [error, setError] = useState("")

    const selectedQuestions = useMemo(() => selected?.questions || [], [selected])
    const metrics = [
        ["Technical", selected?.technicalScore],
        ["Communication", selected?.communicationScore],
        ["Confidence", selected?.confidenceScore],
        ["Problem solving", selected?.problemSolvingScore],
        ["Clarity", selected?.clarityScore],
    ]

    const loadSessions = async (nextFilters = filters) => {
        setLoading(true)
        setError("")
        try {
            const res = await interviewSessionApi.list(compactParams(nextFilters))
            setSessions(res.data || [])
            if (!selectedId && res.data?.[0]?.id) {
                setSelectedId(res.data[0].id)
            }
        } catch (err) {
            setError(err?.response?.data?.message || "Could not load interview history.")
        } finally {
            setLoading(false)
        }
    }

    const loadDetail = async (id) => {
        if (!id) {
            setSelected(null)
            return
        }
        setDetailLoading(true)
        try {
            const res = await interviewSessionApi.get(id)
            setSelected(res.data)
        } catch (err) {
            setError(err?.response?.data?.message || "Could not load interview detail.")
        } finally {
            setDetailLoading(false)
        }
    }

    useEffect(() => {
        loadSessions()
    }, [])

    useEffect(() => {
        loadDetail(selectedId)
    }, [selectedId])

    const updateFilter = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }))
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        loadSessions(filters)
    }

    const handleReset = () => {
        const empty = {
            keyword: "",
            status: "",
            fromDate: "",
            toDate: "",
            minScore: "",
            maxScore: "",
            role: "",
            level: "",
            interviewType: "",
            topic: "",
        }
        setFilters(empty)
        loadSessions(empty)
    }

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-slate-950">Interview History</h1>
                        <p className="mt-1 text-sm text-slate-500">Review previous practice sessions, feedback, questions, and answers.</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate("/interview-setup")}
                        className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-bold text-white hover:bg-primary-dark"
                    >
                        New Interview
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="mb-5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
                        <label className="xl:col-span-2">
                            <span className="mb-1 block text-xs font-bold uppercase text-slate-500">Search</span>
                            <div className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-3">
                                <FiSearch className="text-slate-400" />
                                <input
                                    value={filters.keyword}
                                    onChange={(e) => updateFilter("keyword", e.target.value)}
                                    className="w-full text-sm outline-none"
                                    placeholder="Position, tech, company, JD, date"
                                />
                            </div>
                        </label>
                        <label>
                            <span className="mb-1 block text-xs font-bold uppercase text-slate-500">Status</span>
                            <select value={filters.status} onChange={(e) => updateFilter("status", e.target.value)} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm">
                                {statusOptions.map(option => <option key={option} value={option}>{option || "All"}</option>)}
                            </select>
                        </label>
                        <label>
                            <span className="mb-1 block text-xs font-bold uppercase text-slate-500">Level</span>
                            <select value={filters.level} onChange={(e) => updateFilter("level", e.target.value)} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm">
                                {levelOptions.map(option => <option key={option} value={option}>{option || "All"}</option>)}
                            </select>
                        </label>
                        <label>
                            <span className="mb-1 block text-xs font-bold uppercase text-slate-500">Type</span>
                            <select value={filters.interviewType} onChange={(e) => updateFilter("interviewType", e.target.value)} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm">
                                {typeOptions.map(option => <option key={option} value={option}>{option || "All"}</option>)}
                            </select>
                        </label>
                        <label>
                            <span className="mb-1 block text-xs font-bold uppercase text-slate-500">Topic</span>
                            <input value={filters.topic} onChange={(e) => updateFilter("topic", e.target.value)} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" placeholder="Backend Java" />
                        </label>
                    </div>
                    <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
                        <label>
                            <span className="mb-1 block text-xs font-bold uppercase text-slate-500">From</span>
                            <input type="date" value={filters.fromDate} onChange={(e) => updateFilter("fromDate", e.target.value)} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" />
                        </label>
                        <label>
                            <span className="mb-1 block text-xs font-bold uppercase text-slate-500">To</span>
                            <input type="date" value={filters.toDate} onChange={(e) => updateFilter("toDate", e.target.value)} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" />
                        </label>
                        <label>
                            <span className="mb-1 block text-xs font-bold uppercase text-slate-500">Min score</span>
                            <input type="number" min="0" max="100" value={filters.minScore} onChange={(e) => updateFilter("minScore", e.target.value)} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" />
                        </label>
                        <label>
                            <span className="mb-1 block text-xs font-bold uppercase text-slate-500">Max score</span>
                            <input type="number" min="0" max="100" value={filters.maxScore} onChange={(e) => updateFilter("maxScore", e.target.value)} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" />
                        </label>
                        <label>
                            <span className="mb-1 block text-xs font-bold uppercase text-slate-500">Role</span>
                            <input value={filters.role} onChange={(e) => updateFilter("role", e.target.value)} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" placeholder="Backend" />
                        </label>
                        <div className="flex items-end gap-2">
                            <button type="submit" className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-bold text-white">
                                <FiFilter />
                                Apply
                            </button>
                            <button type="button" onClick={handleReset} className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50" aria-label="Reset filters">
                                <FiRefreshCw />
                            </button>
                        </div>
                    </div>
                </form>

                {error && <div className="mb-4 rounded-lg border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div>}

                <div className="grid gap-5 lg:grid-cols-[420px_minmax(0,1fr)]">
                    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
                        <div className="flex h-14 items-center justify-between border-b border-slate-100 px-4">
                            <p className="text-sm font-black text-slate-900">{sessions.length} sessions</p>
                            {loading && <span className="text-xs font-semibold text-slate-400">Loading...</span>}
                        </div>
                        <div className="max-h-[760px] overflow-auto">
                            {sessions.length === 0 && !loading ? (
                                <div className="p-8 text-center text-sm text-slate-500">No interview sessions found.</div>
                            ) : (
                                sessions.map(session => (
                                    <button
                                        key={session.id}
                                        type="button"
                                        onClick={() => setSelectedId(session.id)}
                                        className={`flex w-full items-start gap-3 border-b border-slate-100 p-4 text-left hover:bg-slate-50 ${selectedId === session.id ? "bg-blue-50/60" : "bg-white"}`}
                                    >
                                        <div className={`mt-1 rounded-lg px-3 py-2 text-center text-sm font-black ${scoreTone(session.overallScore)}`}>
                                            {session.overallScore ?? "--"}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-black text-slate-950">{session.title || session.roleSnapshot || "Mock Interview"}</p>
                                            <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-500">
                                                <span>{session.roleSnapshot || "General role"}</span>
                                                <span>{session.levelSnapshot || "No level"}</span>
                                                <span>{session.interviewType || "mock"}</span>
                                            </div>
                                            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500">
                                                <span className="inline-flex items-center gap-1"><FiCalendar />{formatDate(session.createdAt)}</span>
                                                <span className="inline-flex items-center gap-1"><FiClock />{formatDuration(session.durationSeconds)}</span>
                                                <span>{session.status}</span>
                                                <span>{session.completedQuestions || 0}/{session.totalQuestions || 0} questions</span>
                                            </div>
                                        </div>
                                        <FiChevronRight className="mt-1 text-slate-300" />
                                    </button>
                                ))
                            )}
                        </div>
                    </section>

                    <section className="min-h-[760px] rounded-lg border border-slate-200 bg-white shadow-sm">
                        {detailLoading ? (
                            <div className="p-8 text-sm text-slate-500">Loading detail...</div>
                        ) : selected ? (
                            <div>
                                <div className="border-b border-slate-100 p-5">
                                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                                        <div>
                                            <h2 className="text-2xl font-black text-slate-950">{selected.title || selected.roleSnapshot || "Mock Interview"}</h2>
                                            <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold text-slate-600">
                                                <span className="rounded-full bg-slate-100 px-3 py-1">{selected.status}</span>
                                                <span className="rounded-full bg-slate-100 px-3 py-1">{selected.levelSnapshot || "No level"}</span>
                                                <span className="rounded-full bg-slate-100 px-3 py-1">{selected.interviewType || "mock"}</span>
                                                <span className="rounded-full bg-slate-100 px-3 py-1">{formatDate(selected.createdAt)}</span>
                                            </div>
                                        </div>
                                        <div className={`rounded-lg px-5 py-3 text-center font-black ${scoreTone(selected.overallScore)}`}>
                                            <div className="text-2xl">{selected.overallScore ?? "--"}</div>
                                            <div className="text-xs">Overall</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-4 p-5 xl:grid-cols-5">
                                    {metrics.map(([label, score]) => (
                                        <div key={label} className="rounded-lg border border-slate-100 p-4">
                                            <p className="text-xs font-bold uppercase text-slate-400">{label}</p>
                                            <p className="mt-2 text-xl font-black text-slate-900">{score ?? "--"}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid gap-4 px-5 pb-5 xl:grid-cols-2">
                                    <FeedbackBlock title="Strengths" items={selected.strengths} tone="emerald" />
                                    <FeedbackBlock title="Weaknesses" items={selected.weaknesses} tone="amber" />
                                </div>

                                <div className="px-5 pb-5">
                                    <div className="rounded-lg border border-slate-100 p-4">
                                        <p className="mb-2 text-sm font-black text-slate-900">AI Summary</p>
                                        <p className="whitespace-pre-line text-sm leading-6 text-slate-600">{selected.summaryText || "No summary available."}</p>
                                        {selected.nextSteps && (
                                            <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">{selected.nextSteps}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="border-t border-slate-100 p-5">
                                    <div className="mb-4 flex items-center gap-2">
                                        <FiTarget className="text-primary" />
                                        <h3 className="text-lg font-black text-slate-950">Questions and Answers</h3>
                                    </div>
                                    <div className="space-y-4">
                                        {selectedQuestions.length === 0 ? (
                                            <p className="text-sm text-slate-500">No questions were saved for this session.</p>
                                        ) : selectedQuestions.map((question, index) => (
                                            <QuestionDetail key={question.id || index} question={question} index={index} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-8 text-sm text-slate-500">Select a session to view detail.</div>
                        )}
                    </section>
                </div>
            </div>
        </main>
    )
}

function FeedbackBlock({ title, items, tone }) {
    const colors = tone === "emerald"
        ? "border-emerald-100 bg-emerald-50 text-emerald-800"
        : "border-amber-100 bg-amber-50 text-amber-800"
    return (
        <div className={`rounded-lg border p-4 ${colors}`}>
            <p className="mb-3 text-sm font-black">{title}</p>
            {items?.length ? (
                <ul className="space-y-2 text-sm">
                    {items.map((item, index) => <li key={index}>- {item}</li>)}
                </ul>
            ) : (
                <p className="text-sm opacity-70">No feedback recorded.</p>
            )}
        </div>
    )
}

function QuestionDetail({ question, index }) {
    const answer = question.answer
    return (
        <article className="rounded-lg border border-slate-200 p-4">
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <p className="text-xs font-black uppercase tracking-wide text-primary">Question {question.orderIndex || index + 1}</p>
                    <p className="mt-1 text-sm font-bold text-slate-900">{question.questionText}</p>
                    {question.jobRequirementTag && <p className="mt-1 text-xs text-slate-500">{question.jobRequirementTag}</p>}
                </div>
                <span className={`w-fit rounded-full px-3 py-1 text-xs font-black ${scoreTone(answer?.score)}`}>
                    {answer?.score ?? "--"} pts
                </span>
            </div>
            <div className="grid gap-3 xl:grid-cols-2">
                <div className="rounded-lg bg-slate-50 p-3">
                    <p className="mb-2 text-xs font-black uppercase text-slate-400">Your answer</p>
                    <p className="whitespace-pre-line text-sm text-slate-700">{answer?.answerText || "No text answer saved."}</p>
                </div>
                <div className="rounded-lg bg-blue-50 p-3">
                    <p className="mb-2 text-xs font-black uppercase text-blue-500">AI feedback</p>
                    <p className="whitespace-pre-line text-sm text-slate-700">{answer?.feedback || "No AI feedback saved."}</p>
                </div>
            </div>
            {answer?.improvedAnswer && (
                <div className="mt-3 rounded-lg border border-slate-100 p-3">
                    <p className="mb-2 text-xs font-black uppercase text-slate-400">Suggested answer</p>
                    <p className="whitespace-pre-line text-sm text-slate-700">{answer.improvedAnswer}</p>
                </div>
            )}
        </article>
    )
}
