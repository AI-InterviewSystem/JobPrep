import { useEffect, useMemo, useState } from 'react';
import { FiCalendar, FiChevronRight, FiClock, FiFilter, FiRefreshCw, FiSearch, FiUser } from 'react-icons/fi';
import { adminInterviewApi } from '../services/api';
import toast from 'react-hot-toast';

const emptyFilters = {
    keyword: '',
    status: '',
    fromDate: '',
    toDate: '',
    minScore: '',
    maxScore: '',
    role: '',
    level: '',
    interviewType: '',
};

function compact(params) {
    return Object.fromEntries(Object.entries(params).filter(([, value]) => value !== '' && value != null));
}

function formatDate(value) {
    if (!value) return 'N/A';
    return new Intl.DateTimeFormat('en', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

function formatDuration(seconds) {
    if (!seconds && seconds !== 0) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}

function scoreClass(score) {
    if (score == null) return 'bg-slate-100 text-slate-500';
    if (score >= 80) return 'bg-emerald-50 text-emerald-700';
    if (score >= 60) return 'bg-blue-50 text-blue-700';
    return 'bg-rose-50 text-rose-700';
}

export default function AdminInterviewSessionsPage() {
    const [filters, setFilters] = useState(emptyFilters);
    const [sessions, setSessions] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);

    const questions = useMemo(() => detail?.questions || [], [detail]);

    const loadSessions = async (nextFilters = filters) => {
        setLoading(true);
        try {
            const res = await adminInterviewApi.getSessions(compact(nextFilters));
            setSessions(res.data || []);
            if (!selectedId && res.data?.[0]?.id) setSelectedId(res.data[0].id);
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to load interview sessions');
        } finally {
            setLoading(false);
        }
    };

    const loadDetail = async (id) => {
        if (!id) return;
        setDetailLoading(true);
        try {
            const res = await adminInterviewApi.getSession(id);
            setDetail(res.data);
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to load session detail');
        } finally {
            setDetailLoading(false);
        }
    };

    useEffect(() => {
        loadSessions();
    }, []);

    useEffect(() => {
        loadDetail(selectedId);
    }, [selectedId]);

    const updateFilter = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));

    const applyFilters = (event) => {
        event.preventDefault();
        loadSessions(filters);
    };

    const resetFilters = () => {
        setFilters(emptyFilters);
        loadSessions(emptyFilters);
    };

    return (
        <div className="space-y-5">
            <form onSubmit={applyFilters} autoComplete="off" className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                <div className="grid grid-cols-1 lg:grid-cols-6 gap-3">
                    <div className="lg:col-span-2">
                        <label className="text-xs font-black uppercase text-slate-400">Search</label>
                        <div className="mt-1 h-11 rounded-xl border border-slate-200 px-3 flex items-center gap-2">
                            <FiSearch className="text-slate-400" />
                            <input name="admin_interview_keyword" autoComplete="off" value={filters.keyword} onChange={(e) => updateFilter('keyword', e.target.value)} className="w-full outline-none text-sm" placeholder="Email, role, level, JD" />
                        </div>
                    </div>
                    <FilterSelect label="Status" value={filters.status} onChange={(v) => updateFilter('status', v)} options={['', 'CREATED', 'IN_PROGRESS', 'COMPLETED', 'TERMINATED']} />
                    <FilterInput label="Role" name="admin_interview_role_filter" value={filters.role} onChange={(v) => updateFilter('role', v)} placeholder="Role or topic" />
                    <FilterSelect label="Level" value={filters.level} onChange={(v) => updateFilter('level', v)} options={['', 'Intern', 'Junior', 'Mid', 'Senior']} />
                    <FilterSelect label="Type" value={filters.interviewType} onChange={(v) => updateFilter('interviewType', v)} options={['', 'Technical', 'HR', 'Behavioral', 'mock']} />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-6 gap-3 mt-3">
                    <FilterInput type="date" label="From" value={filters.fromDate} onChange={(v) => updateFilter('fromDate', v)} />
                    <FilterInput type="date" label="To" value={filters.toDate} onChange={(v) => updateFilter('toDate', v)} />
                    <FilterInput type="number" label="Min score" value={filters.minScore} onChange={(v) => updateFilter('minScore', v)} />
                    <FilterInput type="number" label="Max score" value={filters.maxScore} onChange={(v) => updateFilter('maxScore', v)} />
                    <button type="submit" className="h-11 mt-5 rounded-xl bg-slate-900 text-white font-bold text-sm flex items-center justify-center gap-2">
                        <FiFilter /> Apply
                    </button>
                    <button type="button" onClick={resetFilters} className="h-11 mt-5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-50">
                        <FiRefreshCw /> Reset
                    </button>
                </div>
            </form>

            <div className="grid grid-cols-1 xl:grid-cols-[440px_minmax(0,1fr)] gap-5">
                <section className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                    <div className="h-14 px-5 border-b border-slate-100 flex items-center justify-between">
                        <p className="text-sm font-black text-slate-900">{sessions.length} sessions</p>
                        {loading && <p className="text-xs font-bold text-slate-400">Loading...</p>}
                    </div>
                    <div className="max-h-[720px] overflow-auto">
                        {sessions.length === 0 && !loading ? (
                            <div className="p-8 text-center text-sm text-slate-500">No sessions found.</div>
                        ) : sessions.map(session => (
                            <button key={session.id} onClick={() => setSelectedId(session.id)} className={`w-full text-left p-4 border-b border-slate-100 flex gap-3 hover:bg-slate-50 ${selectedId === session.id ? 'bg-blue-50/70' : 'bg-white'}`}>
                                <div className={`mt-1 w-14 rounded-xl py-2 text-center text-sm font-black ${scoreClass(session.overallScore)}`}>{session.overallScore ?? '--'}</div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-black text-sm text-slate-950 truncate">{session.candidateEmail}</p>
                                    <p className="text-xs text-slate-500 truncate">{session.title || session.roleSnapshot || 'Mock Interview'}</p>
                                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500">
                                        <span className="flex items-center gap-1"><FiUser />{session.candidateName || 'Candidate'}</span>
                                        <span>{session.status}</span>
                                        <span className="flex items-center gap-1"><FiCalendar />{formatDate(session.createdAt)}</span>
                                        <span className="flex items-center gap-1"><FiClock />{formatDuration(session.durationSeconds)}</span>
                                    </div>
                                </div>
                                <FiChevronRight className="mt-1 text-slate-300" />
                            </button>
                        ))}
                    </div>
                </section>

                <section className="bg-white border border-slate-100 rounded-2xl shadow-sm min-h-[720px]">
                    {detailLoading ? (
                        <div className="p-8 text-sm text-slate-500">Loading session detail...</div>
                    ) : detail ? (
                        <div>
                            <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-950">{detail.title || detail.roleSnapshot || 'Interview Session'}</h3>
                                    <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold text-slate-600">
                                        <span className="px-3 py-1 rounded-full bg-slate-100">{detail.status}</span>
                                        <span className="px-3 py-1 rounded-full bg-slate-100">{detail.roleSnapshot || 'General role'}</span>
                                        <span className="px-3 py-1 rounded-full bg-slate-100">{detail.levelSnapshot || 'No level'}</span>
                                        <span className="px-3 py-1 rounded-full bg-slate-100">{detail.interviewType || 'mock'}</span>
                                    </div>
                                </div>
                                <div className={`rounded-2xl px-6 py-4 text-center ${scoreClass(detail.overallScore)}`}>
                                    <p className="text-3xl font-black">{detail.overallScore ?? '--'}</p>
                                    <p className="text-xs font-black">Overall</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 p-6">
                                <Metric label="Technical" value={detail.technicalScore} />
                                <Metric label="Communication" value={detail.communicationScore} />
                                <Metric label="Confidence" value={detail.confidenceScore} />
                                <Metric label="Problem solving" value={detail.problemSolvingScore} />
                                <Metric label="Clarity" value={detail.clarityScore} />
                            </div>

                            <div className="px-6 pb-6">
                                <div className="rounded-2xl border border-slate-100 p-4">
                                    <p className="font-black text-sm text-slate-900 mb-2">AI Summary</p>
                                    <p className="text-sm leading-6 text-slate-600 whitespace-pre-line">{detail.summaryText || 'No summary available.'}</p>
                                </div>
                            </div>

                            <div className="px-6 pb-6 space-y-4">
                                <h4 className="text-lg font-black text-slate-950">Questions, Answers, Feedback</h4>
                                {questions.length === 0 ? <p className="text-sm text-slate-500">No questions saved.</p> : questions.map((question, index) => (
                                    <article key={question.id || index} className="rounded-2xl border border-slate-200 p-4">
                                        <div className="flex justify-between gap-4">
                                            <div>
                                                <p className="text-xs font-black uppercase text-primary">Question {question.orderIndex || index + 1}</p>
                                                <p className="mt-1 text-sm font-bold text-slate-900">{question.questionText}</p>
                                                {question.jobRequirementTag && <p className="mt-1 text-xs text-slate-500">{question.jobRequirementTag}</p>}
                                            </div>
                                            <span className={`h-fit px-3 py-1 rounded-full text-xs font-black ${scoreClass(question.answer?.score)}`}>{question.answer?.score ?? '--'} pts</span>
                                        </div>
                                        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-3">
                                            <TextBox title="Candidate answer" text={question.answer?.answerText || 'No text answer saved.'} />
                                            <TextBox title="AI feedback" text={question.answer?.feedback || 'No AI feedback saved.'} />
                                        </div>
                                        {question.answer?.improvedAnswer && <TextBox title="Suggested answer" text={question.answer.improvedAnswer} className="mt-3" />}
                                    </article>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="p-8 text-sm text-slate-500">Select a session to inspect.</div>
                    )}
                </section>
            </div>
        </div>
    );
}

function FilterInput({ label, name, value, onChange, placeholder, type = 'text' }) {
    return (
        <label>
            <span className="text-xs font-black uppercase text-slate-400">{label}</span>
            <input name={name || `admin_interview_${label.toLowerCase().replace(/\s+/g, '_')}`} autoComplete="off" type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none" />
        </label>
    );
}

function FilterSelect({ label, value, onChange, options }) {
    return (
        <label>
            <span className="text-xs font-black uppercase text-slate-400">{label}</span>
            <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none">
                {options.map(option => <option key={option} value={option}>{option || 'All'}</option>)}
            </select>
        </label>
    );
}

function Metric({ label, value }) {
    return (
        <div className="rounded-2xl border border-slate-100 p-4">
            <p className="text-[10px] font-black uppercase text-slate-400">{label}</p>
            <p className="mt-2 text-xl font-black text-slate-900">{value ?? '--'}</p>
        </div>
    );
}

function TextBox({ title, text, className = '' }) {
    return (
        <div className={`rounded-xl bg-slate-50 p-3 ${className}`}>
            <p className="text-[10px] font-black uppercase text-slate-400 mb-2">{title}</p>
            <p className="text-sm leading-6 text-slate-700 whitespace-pre-line">{text}</p>
        </div>
    );
}
