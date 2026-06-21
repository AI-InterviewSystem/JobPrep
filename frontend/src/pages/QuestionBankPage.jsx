import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FiBookmark, FiBookOpen, FiChevronRight, FiMic, FiPlay, FiRefreshCw, FiSend, FiSearch, FiTag, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { experienceLevelsApi, questionBankApi, paymentApi } from '../services/api';

const typeOptions = [
    { value: '', label: 'All types' },
    { value: 'technical', label: 'Technical' },
    { value: 'HR', label: 'HR' },
    { value: 'behavioral', label: 'Behavioral' },
    { value: 'situation', label: 'Situation' },
    { value: 'JD', label: 'By JD' },
];

export default function QuestionBankPage() {
    const [searchParams] = useSearchParams();
    const [questions, setQuestions] = useState([]);
    const [topics, setTopics] = useState([]);
    const [levels, setLevels] = useState([]);
    const [roles, setRoles] = useState([]);
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [showBookmarks, setShowBookmarks] = useState(false);
    const [practiceSession, setPracticeSession] = useState(null);
    const [practiceAnswer, setPracticeAnswer] = useState('');
    const [practiceFeedback, setPracticeFeedback] = useState(null);
    const [practiceLoading, setPracticeLoading] = useState(false);
    const [listening, setListening] = useState(false);
    const [filters, setFilters] = useState({
        role: '',
        level: '',
        topicId: '',
        questionType: '',
        keyword: '',
    });

    const [subscription, setSubscription] = useState(null);
    const [practiceLimitReached, setPracticeLimitReached] = useState(false);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const pageSize = 10;

    useEffect(() => {
        fetchBootstrap();
    }, []);

    useEffect(() => {
        const topicId = searchParams.get('topicId');
        if (topicId) {
            setFilters(prev => ({ ...prev, topicId }));
            setCurrentPage(1);
        }
    }, [searchParams]);

    useEffect(() => {
        fetchQuestions();
    }, [currentPage, filters.role, filters.level, filters.topicId, filters.questionType, filters.keyword, showBookmarks]);

    const visibleQuestions = questions;

    const fetchBootstrap = async () => {
        try {
            const [topicRes, levelRes, subRes, roleRes] = await Promise.all([
                questionBankApi.getTopics(),
                experienceLevelsApi.getActive(),
                paymentApi.getCurrentSubscription(),
                questionBankApi.getRoles(),
            ]);
            setTopics(topicRes.data);
            setLevels(levelRes.data);
            setRoles(roleRes.data || []);

            const sub = subRes.data;
            setSubscription(sub);
            if (sub && sub.practiceQuestionsLimit !== -1 && sub.practiceQuestionsUsed >= sub.practiceQuestionsLimit) {
                setPracticeLimitReached(true);
            }
        } catch (error) {
            toast.error('Failed to load question bank');
            console.error(error);
        }
    };

    const fetchQuestions = async () => {
        try {
            setLoading(true);
            const params = {
                role: filters.role || undefined,
                level: filters.level || undefined,
                topicId: filters.topicId || undefined,
                questionType: filters.questionType || undefined,
                bookmarked: showBookmarks || undefined,
                keyword: filters.keyword.trim() || undefined,
                page: currentPage - 1,
                size: pageSize
            };
            const response = await questionBankApi.list(params);
            const data = response.data;
            setQuestions(data.questions || []);
            setTotalPages(data.totalPages || 1);
            setTotalElements(data.totalElements || 0);
        } catch (error) {
            toast.error('Failed to load questions');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const openQuestion = async (question) => {
        try {
            setDetailLoading(true);
            const response = await questionBankApi.get(question.id);
            setSelectedQuestion(response.data);
            setPracticeAnswer('');
            setPracticeFeedback(null);
        } catch (error) {
            toast.error('Failed to load question detail');
            console.error(error);
        } finally {
            setDetailLoading(false);
        }
    };

    const toggleBookmark = async (question) => {
        try {
            const nextBookmarked = !question.bookmarked;
            if (nextBookmarked) {
                await questionBankApi.bookmark(question.id);
                toast.success('Question bookmarked');
            } else {
                await questionBankApi.removeBookmark(question.id);
                toast.success('Bookmark removed');
            }
            setQuestions(prev => prev
                .map(item => item.id === question.id ? { ...item, bookmarked: nextBookmarked } : item)
                .filter(item => !showBookmarks || item.bookmarked)
            );
            if (selectedQuestion?.id === question.id) {
                setSelectedQuestion(prev => prev ? { ...prev, bookmarked: nextBookmarked } : prev);
            }
        } catch (error) {
            toast.error('Failed to update bookmark');
            console.error(error);
        }
    };

    const resetFilters = () => {
        setFilters({ role: '', level: '', topicId: '', questionType: '', keyword: '' });
        setShowBookmarks(false);
    };

    const startPractice = async (question = null) => {
        try {
            setPracticeLoading(true);
            const response = await questionBankApi.startPractice({
                questionId: question?.id || undefined,
                topicId: !question ? (filters.topicId || undefined) : (question.topicId || undefined),
                role: filters.role || question?.role || undefined,
                level: filters.level || question?.level || undefined,
                totalQuestions: question ? 1 : 5,
            });
            setPracticeSession(response.data);
            if (question) {
                setSelectedQuestion(question);
            } else if (response.data.questions?.length) {
                setSelectedQuestion(response.data.questions[0]);
            }
            setPracticeAnswer('');
            setPracticeFeedback(null);
            toast.success('Practice session started');
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to start practice');
            console.error(error);
        } finally {
            setPracticeLoading(false);
        }
    };

    const startSpeechToText = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            toast.error('Speech recognition is not supported in this browser.');
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = true;
        recognition.continuous = false;
        setListening(true);
        recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map(result => result[0]?.transcript || '')
                .join(' ');
            setPracticeAnswer(transcript);
        };
        recognition.onerror = () => {
            setListening(false);
            toast.error('Microphone transcription failed');
        };
        recognition.onend = () => setListening(false);
        recognition.start();
    };

    const submitPracticeAnswer = async () => {
        if (!selectedQuestion) {
            toast.error('Select a question first');
            return;
        }

        try {
            setPracticeLoading(true);
            let session = practiceSession;
            if (!session) {
                const response = await questionBankApi.startPractice({
                    questionId: selectedQuestion.id,
                    topicId: selectedQuestion.topicId || undefined,
                    totalQuestions: 1,
                });
                session = response.data;
                setPracticeSession(session);
            }
            const response = await questionBankApi.submitPracticeAnswer(session.id, {
                questionId: selectedQuestion.id,
                answerText: practiceAnswer,
                inputType: 'AUDIO',
                practiceMode: true,
            });
            setPracticeFeedback(response.data);
            setQuestions(prev => prev.map(question => question.id === selectedQuestion.id ? { ...question, practiced: true } : question));
            setSelectedQuestion(prev => prev ? { ...prev, practiced: true } : prev);
            toast.success('Answer submitted');

            // Refresh subscription usage after submit
            try {
                const subRes = await paymentApi.getCurrentSubscription();
                const sub = subRes.data;
                setSubscription(sub);
                if (sub && sub.practiceQuestionsLimit !== -1 && sub.practiceQuestionsUsed >= sub.practiceQuestionsLimit) {
                    setPracticeLimitReached(true);
                }
            } catch (_) {}
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to submit answer');
            console.error(error);
        } finally {
            setPracticeLoading(false);
        }
    };

    const renderMeta = (question) => (
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-700">{question.questionType || 'General'}</span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">{question.level || 'Any level'}</span>
            {question.practiced && <span className="rounded-full bg-green-50 px-2.5 py-1 font-semibold text-green-700">Practiced</span>}
            {(question.role || question.jobRoleName) && <span>{question.role || question.jobRoleName}</span>}
            {question.topicName && <span>{question.topicName}</span>}
        </div>
    );

    return (
        <main className="mx-auto max-w-7xl px-6 py-8 font-display">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Question Bank</h1>
                    <p className="text-sm text-gray-500">Browse practice questions by role, level, topic, and type.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => startPractice()}
                        disabled={practiceLoading || !filters.topicId}
                        className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-slate-50 disabled:opacity-50"
                    >
                        <FiPlay /> Start Topic Practice
                    </button>
                    <button
                        onClick={() => {
                            setShowBookmarks(false);
                            setCurrentPage(1);
                        }}
                        className={`rounded-xl px-4 py-2 text-sm font-semibold ${!showBookmarks ? 'bg-primary text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
                    >
                        All Questions
                    </button>
                    <button
                        onClick={() => {
                            setShowBookmarks(true);
                            setCurrentPage(1);
                        }}
                        className={`rounded-xl px-4 py-2 text-sm font-semibold ${showBookmarks ? 'bg-primary text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
                    >
                        Bookmarked
                    </button>
                </div>
            </div>

            <section className="mb-6 grid grid-cols-1 gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm md:grid-cols-6">
                <div className="relative md:col-span-2">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        value={filters.keyword}
                        onChange={(e) => {
                            setFilters(prev => ({ ...prev, keyword: e.target.value }));
                            setCurrentPage(1);
                        }}
                        placeholder="Search question, tag, topic"
                        className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-3 outline-none focus:border-primary"
                    />
                </div>
                <select value={filters.role} onChange={(e) => { setFilters(prev => ({ ...prev, role: e.target.value })); setCurrentPage(1); }} className="rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-primary">
                    <option value="">All roles</option>
                    {roles.map(role => <option key={role} value={role}>{role}</option>)}
                </select>
                <select value={filters.level} onChange={(e) => { setFilters(prev => ({ ...prev, level: e.target.value })); setCurrentPage(1); }} className="rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-primary">
                    <option value="">All levels</option>
                    {levels.map(level => <option key={level.id} value={level.code}>{level.name}</option>)}
                </select>
                <select value={filters.topicId} onChange={(e) => { setFilters(prev => ({ ...prev, topicId: e.target.value })); setCurrentPage(1); }} className="rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-primary">
                    <option value="">All topics</option>
                    {topics.map(topic => <option key={topic.id} value={topic.id}>{topic.name}</option>)}
                </select>
                <div className="flex gap-2">
                    <select value={filters.questionType} onChange={(e) => { setFilters(prev => ({ ...prev, questionType: e.target.value })); setCurrentPage(1); }} className="min-w-0 flex-1 rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-primary">
                        {typeOptions.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
                    </select>
                    <button onClick={resetFilters} className="rounded-xl border border-gray-200 p-3 text-gray-500 hover:bg-slate-50" title="Reset filters">
                        <FiRefreshCw />
                    </button>
                </div>
            </section>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
                <section className="rounded-2xl border border-slate-100 bg-white shadow-sm flex flex-col justify-between overflow-hidden">
                    {loading ? (
                        <div className="flex h-64 items-center justify-center">
                            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary"></div>
                        </div>
                    ) : visibleQuestions.length === 0 ? (
                        <div className="flex h-64 flex-col items-center justify-center text-center text-gray-500">
                            <FiBookOpen className="mb-3 text-3xl text-gray-300" />
                            <p className="font-medium">No questions found.</p>
                            <p className="text-sm">Try changing role, level, topic, or bookmark filters.</p>
                        </div>
                    ) : (
                        <>
                            <div className="divide-y divide-gray-100 flex-1">
                                {visibleQuestions.map(question => (
                                    <article key={question.id} className="flex gap-4 p-5 hover:bg-slate-50">
                                        <button onClick={() => openQuestion(question)} className="min-w-0 flex-1 text-left">
                                            <p className="mb-3 line-clamp-2 text-base font-bold text-gray-900">{question.questionText}</p>
                                            {renderMeta(question)}
                                            <div className="mt-3 flex flex-wrap gap-1.5">
                                                {(question.tags || []).slice(0, 5).map(tag => (
                                                    <span key={tag} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{tag}</span>
                                                ))}
                                            </div>
                                        </button>
                                        <div className="flex shrink-0 items-start gap-2">
                                            <button
                                                onClick={() => toggleBookmark(question)}
                                                className={`rounded-xl border p-2.5 ${question.bookmarked ? 'border-yellow-200 bg-yellow-50 text-yellow-600' : 'border-gray-200 text-gray-500 hover:bg-white'}`}
                                                title={question.bookmarked ? 'Remove bookmark' : 'Bookmark'}
                                            >
                                                <FiBookmark className={question.bookmarked ? 'fill-current' : ''} />
                                            </button>
                                            <button onClick={() => openQuestion(question)} className="rounded-xl border border-gray-200 p-2.5 text-gray-500 hover:bg-white" title="View detail">
                                                <FiChevronRight />
                                            </button>
                                        </div>
                                    </article>
                                ))}
                            </div>
                            
                            {/* Pagination Controls */}
                            <div className="flex flex-wrap items-center justify-between border-t border-gray-100 px-6 py-4 bg-slate-50/50">
                                <div className="text-sm text-gray-500 mb-2 sm:mb-0">
                                    Showing <span className="font-semibold text-gray-800">{((currentPage - 1) * pageSize) + 1}</span> to{' '}
                                    <span className="font-semibold text-gray-800">
                                        {Math.min(currentPage * pageSize, totalElements)}
                                    </span>{' '}
                                    of <span className="font-semibold text-gray-800">{totalElements}</span> questions
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-gray-600 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white cursor-pointer disabled:cursor-not-allowed transition-colors"
                                    >
                                        Previous
                                    </button>
                                    
                                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                                        .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                                        .map((page, index, array) => {
                                            const showEllipsis = index > 0 && page - array[index - 1] > 1;
                                            return (
                                                <React.Fragment key={page}>
                                                    {showEllipsis && <span className="px-2 text-gray-400 text-sm">...</span>}
                                                    <button
                                                        onClick={() => setCurrentPage(page)}
                                                        className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors cursor-pointer ${
                                                            currentPage === page
                                                                ? 'bg-primary text-white'
                                                                : 'border border-gray-200 bg-white text-gray-600 hover:bg-slate-50'
                                                        }`}
                                                    >
                                                        {page}
                                                    </button>
                                                </React.Fragment>
                                            );
                                        })}

                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-gray-600 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white cursor-pointer disabled:cursor-not-allowed transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </section>

                <aside className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                    {!selectedQuestion ? (
                        <div className="flex h-full min-h-80 flex-col items-center justify-center text-center text-gray-500">
                            <FiBookOpen className="mb-3 text-4xl text-gray-300" />
                            <p className="font-semibold">Select a question</p>
                            <p className="text-sm">Question detail, topic, role, level, and answer guide will appear here.</p>
                        </div>
                    ) : detailLoading ? (
                        <div className="flex h-80 items-center justify-center">
                            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <h2 className="text-xl font-bold leading-snug text-gray-900">{selectedQuestion.questionText}</h2>
                                    <div className="mt-3">{renderMeta(selectedQuestion)}</div>
                                </div>
                                <button onClick={() => setSelectedQuestion(null)} className="rounded-xl border border-gray-200 p-2 text-gray-500 hover:bg-slate-50">
                                    <FiX />
                                </button>
                            </div>

                            <button
                                onClick={() => toggleBookmark(selectedQuestion)}
                                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold ${selectedQuestion.bookmarked ? 'bg-yellow-50 text-yellow-700' : 'bg-primary text-white'}`}
                            >
                                <FiBookmark className={selectedQuestion.bookmarked ? 'fill-current' : ''} />
                                {selectedQuestion.bookmarked ? 'Bookmarked' : 'Bookmark Question'}
                            </button>

                            <section className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
                                <div className="mb-3 flex items-center justify-between gap-3">
                                    <div>
                                        <h3 className="font-bold text-gray-900">Practice Mode</h3>
                                        <p className="text-xs text-gray-500">Speak your answer, review the transcript, then submit for quick AI feedback.</p>
                                    </div>
                                    <button
                                        onClick={() => startPractice(selectedQuestion)}
                                        disabled={practiceLoading}
                                        className="flex shrink-0 items-center gap-2 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                                    >
                                        <FiPlay /> Start
                                    </button>
                                </div>

                                {practiceLimitReached && (
                                    <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
                                        You have reached your limit of 10 free questions for this month.{' '}
                                        <Link to="/pricing" className="underline font-bold">Upgrade</Link> to continue practicing.
                                    </div>
                                )}

                                <textarea
                                    value={practiceAnswer}
                                    onChange={(e) => setPracticeAnswer(e.target.value)}
                                    rows="4"
                                    placeholder="Click mic and answer verbally, or type your answer here."
                                    className="w-full resize-none rounded-xl border border-blue-100 bg-white px-3 py-2 text-sm outline-none focus:border-primary"
                                />
                                <div className="mt-3 flex flex-wrap gap-2">
                                    <button
                                        onClick={startSpeechToText}
                                        disabled={listening || practiceLoading}
                                        className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold ${listening ? 'bg-red-100 text-red-700' : 'bg-white text-gray-700 border border-blue-100'}`}
                                    >
                                        <FiMic /> {listening ? 'Listening...' : 'Speak'}
                                    </button>
                                    <button
                                        onClick={submitPracticeAnswer}
                                        disabled={practiceLoading || !practiceAnswer.trim()}
                                        className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                                    >
                                        <FiSend /> Submit Answer
                                    </button>
                                </div>
                                {practiceFeedback && (
                                    <div className="mt-4 rounded-xl bg-white p-4 text-sm">
                                        <div className="mb-2 flex items-center justify-between">
                                            <p className="font-bold text-gray-900">Practice Feedback</p>
                                            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                                                {practiceFeedback.score != null ? `${practiceFeedback.score}/100` : 'Saved'}
                                            </span>
                                        </div>
                                        <p className="whitespace-pre-line leading-6 text-gray-600">{practiceFeedback.feedbackSummary}</p>
                                        {practiceFeedback.suggestedImprovements?.length > 0 && (
                                            <ul className="mt-3 list-disc space-y-1 pl-5 text-gray-600">
                                                {practiceFeedback.suggestedImprovements.map((item, index) => <li key={index}>{item}</li>)}
                                            </ul>
                                        )}
                                    </div>
                                )}
                            </section>

                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="rounded-xl bg-slate-50 p-3">
                                    <p className="text-gray-400">Role</p>
                                    <p className="font-semibold text-gray-800">{selectedQuestion.role || selectedQuestion.jobRoleName || 'General'}</p>
                                </div>
                                <div className="rounded-xl bg-slate-50 p-3">
                                    <p className="text-gray-400">Level</p>
                                    <p className="font-semibold text-gray-800">{selectedQuestion.level || 'Any level'}</p>
                                </div>
                                <div className="rounded-xl bg-slate-50 p-3">
                                    <p className="text-gray-400">Topic</p>
                                    <p className="font-semibold text-gray-800">{selectedQuestion.topicName || 'General'}</p>
                                </div>
                                <div className="rounded-xl bg-slate-50 p-3">
                                    <p className="text-gray-400">Duration</p>
                                    <p className="font-semibold text-gray-800">{selectedQuestion.suggestedDuration || 120}s</p>
                                </div>
                            </div>

                            <section>
                                <h3 className="mb-2 flex items-center gap-2 font-bold text-gray-900"><FiTag /> Tags</h3>
                                <div className="flex flex-wrap gap-2">
                                    {(selectedQuestion.tags || []).length > 0 ? selectedQuestion.tags.map(tag => (
                                        <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">{tag}</span>
                                    )) : <span className="text-sm text-gray-400">No tags</span>}
                                </div>
                            </section>
                        </div>
                    )}
                </aside>
            </div>
        </main>
    );
}
