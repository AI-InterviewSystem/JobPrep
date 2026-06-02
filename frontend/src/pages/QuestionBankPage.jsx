import React, { useEffect, useMemo, useState } from 'react';
import { FiBookmark, FiBookOpen, FiChevronRight, FiRefreshCw, FiSearch, FiTag, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { experienceLevelsApi, questionBankApi } from '../services/api';

const typeOptions = [
    { value: '', label: 'All types' },
    { value: 'technical', label: 'Technical' },
    { value: 'HR', label: 'HR' },
    { value: 'behavioral', label: 'Behavioral' },
    { value: 'situation', label: 'Situation' },
    { value: 'JD', label: 'By JD' },
];

export default function QuestionBankPage() {
    const [questions, setQuestions] = useState([]);
    const [topics, setTopics] = useState([]);
    const [levels, setLevels] = useState([]);
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [showBookmarks, setShowBookmarks] = useState(false);
    const [filters, setFilters] = useState({
        role: '',
        level: '',
        topicId: '',
        questionType: '',
        keyword: '',
    });

    useEffect(() => {
        fetchBootstrap();
    }, []);

    useEffect(() => {
        fetchQuestions();
    }, [filters.role, filters.level, filters.topicId, filters.questionType, showBookmarks]);

    const roles = useMemo(() => {
        const values = questions.map(question => question.role || question.jobRoleName).filter(Boolean);
        return [...new Set(values)].sort();
    }, [questions]);

    const visibleQuestions = useMemo(() => {
        const keyword = filters.keyword.trim().toLowerCase();
        if (!keyword) return questions;
        return questions.filter(question => {
            const haystack = [
                question.questionText,
                question.topicName,
                question.role,
                question.level,
                ...(question.tags || [])
            ].filter(Boolean).join(' ').toLowerCase();
            return haystack.includes(keyword);
        });
    }, [questions, filters.keyword]);

    const fetchBootstrap = async () => {
        try {
            const [topicRes, levelRes] = await Promise.all([
                questionBankApi.getTopics(),
                experienceLevelsApi.getActive(),
            ]);
            setTopics(topicRes.data);
            setLevels(levelRes.data);
        } catch (error) {
            toast.error('Failed to load question bank filters');
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
            };
            const response = await questionBankApi.list(params);
            setQuestions(response.data);
            if (selectedQuestion && !response.data.some(question => question.id === selectedQuestion.id)) {
                setSelectedQuestion(null);
            }
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

    const renderMeta = (question) => (
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-700">{question.questionType || 'General'}</span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">{question.level || 'Any level'}</span>
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
                        onClick={() => setShowBookmarks(false)}
                        className={`rounded-xl px-4 py-2 text-sm font-semibold ${!showBookmarks ? 'bg-primary text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
                    >
                        All Questions
                    </button>
                    <button
                        onClick={() => setShowBookmarks(true)}
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
                        onChange={(e) => setFilters(prev => ({ ...prev, keyword: e.target.value }))}
                        placeholder="Search question, tag, topic"
                        className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-3 outline-none focus:border-primary"
                    />
                </div>
                <select value={filters.role} onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))} className="rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-primary">
                    <option value="">All roles</option>
                    {roles.map(role => <option key={role} value={role}>{role}</option>)}
                </select>
                <select value={filters.level} onChange={(e) => setFilters(prev => ({ ...prev, level: e.target.value }))} className="rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-primary">
                    <option value="">All levels</option>
                    {levels.map(level => <option key={level.id} value={level.code}>{level.name}</option>)}
                </select>
                <select value={filters.topicId} onChange={(e) => setFilters(prev => ({ ...prev, topicId: e.target.value }))} className="rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-primary">
                    <option value="">All topics</option>
                    {topics.map(topic => <option key={topic.id} value={topic.id}>{topic.name}</option>)}
                </select>
                <div className="flex gap-2">
                    <select value={filters.questionType} onChange={(e) => setFilters(prev => ({ ...prev, questionType: e.target.value }))} className="min-w-0 flex-1 rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-primary">
                        {typeOptions.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
                    </select>
                    <button onClick={resetFilters} className="rounded-xl border border-gray-200 p-3 text-gray-500 hover:bg-slate-50" title="Reset filters">
                        <FiRefreshCw />
                    </button>
                </div>
            </section>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
                <section className="rounded-2xl border border-slate-100 bg-white shadow-sm">
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
                        <div className="divide-y divide-gray-100">
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
                                <h3 className="mb-2 font-bold text-gray-900">Suggested Answer</h3>
                                <p className="whitespace-pre-line text-sm leading-6 text-gray-600">
                                    {selectedQuestion.sampleAnswer || 'No sample answer has been added yet.'}
                                </p>
                            </section>

                            <section>
                                <h3 className="mb-2 font-bold text-gray-900">Explanation</h3>
                                <p className="whitespace-pre-line text-sm leading-6 text-gray-600">
                                    {selectedQuestion.explanation || 'No explanation has been added yet.'}
                                </p>
                            </section>

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
