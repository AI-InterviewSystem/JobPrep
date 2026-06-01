import React, { useEffect, useMemo, useState } from 'react';
import { adminExperienceLevelsApi, adminJobsApi, adminQuestionBankApi } from '../services/api';
import { storage } from '../services/storage';
import { FiEdit2, FiFileText, FiPlus, FiRefreshCw, FiTrash2, FiUpload, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

const initialForm = {
    jobCategoryId: '',
    jobRoleId: '',
    questionText: '',
    difficulty: '',
    questionType: 'Technical',
    suggestedDuration: 120,
    tags: '',
    isActive: true
};

export default function AdminQuestionBankPage() {
    const [questions, setQuestions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [roles, setRoles] = useState([]);
    const [levels, setLevels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ categoryId: '', roleId: '', difficulty: '', questionType: '', isActive: '' });
    const [modal, setModal] = useState({ open: false, question: null });
    const [importModal, setImportModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
    const [formData, setFormData] = useState(initialForm);
    const [importText, setImportText] = useState('');

    const filteredRoles = useMemo(() => {
        return formData.jobCategoryId
            ? roles.filter(role => role.jobCategoryId === formData.jobCategoryId)
            : roles;
    }, [roles, formData.jobCategoryId]);

    useEffect(() => {
        fetchBootstrap();
    }, []);

    useEffect(() => {
        fetchQuestions();
    }, [filters]);

    const fetchBootstrap = async () => {
        try {
            const [categoryRes, roleRes, levelRes] = await Promise.all([
                adminJobsApi.getCategories(),
                adminJobsApi.getRoles(),
                adminExperienceLevelsApi.getAll()
            ]);
            setCategories(categoryRes.data);
            setRoles(roleRes.data);
            setLevels(levelRes.data);
        } catch (error) {
            toast.error('Failed to load selectors');
            console.error(error);
        }
    };

    const fetchQuestions = async () => {
        try {
            setLoading(true);
            const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== ''));
            const response = await adminQuestionBankApi.getAll(params);
            setQuestions(response.data);
        } catch (error) {
            toast.error('Failed to load questions');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (question = null) => {
        setModal({ open: true, question });
        setFormData(question ? {
            jobCategoryId: question.jobCategoryId || '',
            jobRoleId: question.jobRoleId || '',
            questionText: question.questionText || '',
            difficulty: question.difficulty || '',
            questionType: question.questionType || 'Technical',
            suggestedDuration: question.suggestedDuration || 120,
            tags: (question.tags || []).join(', '),
            isActive: question.isActive ?? true
        } : initialForm);
    };

    const closeModal = () => {
        setModal({ open: false, question: null });
        setFormData(initialForm);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!storage.getToken()) {
            toast.error('Login session expired. Please sign in again.');
            return;
        }
        try {
            const payload = {
                ...formData,
                jobCategoryId: formData.jobCategoryId || null,
                jobRoleId: formData.jobRoleId || null,
                suggestedDuration: Number(formData.suggestedDuration) || 120,
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
            };
            if (modal.question) {
                await adminQuestionBankApi.update(modal.question.id, payload);
                toast.success('Question updated successfully');
            } else {
                await adminQuestionBankApi.create(payload);
                toast.success('Question created successfully');
            }
            closeModal();
            fetchQuestions();
        } catch (error) {
            if (error?.response?.status === 401) {
                console.error('Question bank create/update unauthorized', {
                    hasToken: Boolean(storage.getToken()),
                    user: storage.getUser(),
                    requestUrl: error?.config?.url,
                    method: error?.config?.method,
                });
                toast.error('Unauthorized: please sign in again with an admin account.');
                return;
            }
            toast.error(error?.response?.data?.message || 'Save failed');
            console.error(error);
        }
    };

    const toggleActive = async (question) => {
        try {
            await adminQuestionBankApi.setActive(question.id, !question.isActive);
            toast.success(question.isActive ? 'Question deactivated' : 'Question activated');
            fetchQuestions();
        } catch (error) {
            toast.error('Status update failed');
            console.error(error);
        }
    };

    const handleImport = async () => {
        try {
            const parsed = JSON.parse(importText);
            if (!Array.isArray(parsed)) {
                toast.error('Import data must be a JSON array');
                return;
            }
            await adminQuestionBankApi.import(parsed);
            toast.success('Questions imported successfully');
            setImportModal(false);
            setImportText('');
            fetchQuestions();
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Invalid import data');
            console.error(error);
        }
    };

    const confirmDelete = async () => {
        try {
            await adminQuestionBankApi.delete(deleteModal.id);
            toast.success('Question deleted successfully');
            setDeleteModal({ open: false, id: null });
            fetchQuestions();
        } catch (error) {
            toast.error('Delete failed');
            console.error(error);
        }
    };

    const resetFilters = () => setFilters({ categoryId: '', roleId: '', difficulty: '', questionType: '', isActive: '' });

    return (
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div></div>
                <div className="flex gap-2">
                    <button onClick={() => setImportModal(true)} className="border border-gray-200 text-gray-700 px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-slate-50">
                        <FiUpload /> Import
                    </button>
                    <button onClick={() => openModal()} className="bg-primary text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-primary-dark">
                        <FiPlus /> Add Question
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
                <select value={filters.categoryId} onChange={(e) => setFilters(prev => ({ ...prev, categoryId: e.target.value, roleId: '' }))} className="px-4 py-2 border border-gray-200 rounded-xl outline-none">
                    <option value="">All categories</option>
                    {categories.map(category => <option key={category.id} value={category.id}>{category.jobGroupName} / {category.name}</option>)}
                </select>
                <select value={filters.roleId} onChange={(e) => setFilters(prev => ({ ...prev, roleId: e.target.value }))} className="px-4 py-2 border border-gray-200 rounded-xl outline-none">
                    <option value="">All roles</option>
                    {roles.filter(role => !filters.categoryId || role.jobCategoryId === filters.categoryId).map(role => <option key={role.id} value={role.id}>{role.name}</option>)}
                </select>
                <select value={filters.difficulty} onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value }))} className="px-4 py-2 border border-gray-200 rounded-xl outline-none">
                    <option value="">All levels</option>
                    {levels.map(level => (
                        <option key={level.id} value={level.code}>{level.name}</option>
                    ))}
                </select>
                <select value={filters.questionType} onChange={(e) => setFilters(prev => ({ ...prev, questionType: e.target.value }))} className="px-4 py-2 border border-gray-200 rounded-xl outline-none">
                    <option value="">All types</option>
                    <option value="HR">HR</option>
                    <option value="Technical">Technical</option>
                </select>
                <div className="flex gap-2">
                    <select value={filters.isActive} onChange={(e) => setFilters(prev => ({ ...prev, isActive: e.target.value }))} className="min-w-0 flex-1 px-4 py-2 border border-gray-200 rounded-xl outline-none">
                        <option value="">All status</option>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                    </select>
                    <button onClick={resetFilters} className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-slate-50" title="Reset filters"><FiRefreshCw /></button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full table-fixed text-left">
                    <colgroup>
                        <col className="w-[36%]" />
                        <col className="w-[25%]" />
                        <col className="w-[7%]" />
                        <col className="w-[7%]" />
                        <col className="w-[8%]" />
                        <col className="w-[9%]" />
                        <col className="w-[8%]" />
                    </colgroup>
                    <thead>
                        <tr className="border-b border-gray-100 text-gray-500 font-medium">
                            <th className="pb-4 pl-4 pr-4">Question</th>
                            <th className="pb-4 pr-4">Job</th>
                            <th className="pb-4 pr-3">Level</th>
                            <th className="pb-4 pr-3">Type</th>
                            <th className="pb-4 pr-3">Duration</th>
                            <th className="pb-4 pr-3">Status</th>
                            <th className="pb-4 pr-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr><td colSpan="7" className="py-10 text-center text-gray-500">Loading questions...</td></tr>
                        ) : questions.map(question => (
                            <tr key={question.id} className="hover:bg-slate-50 transition-colors">
                                <td className="py-4 pl-4 pr-4 align-top">
                                    <div className="flex gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0"><FiFileText /></div>
                                        <div className="min-w-0">
                                            <p className="font-medium text-gray-900 break-words leading-snug line-clamp-3">{question.questionText}</p>
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {(question.tags || []).map(tag => <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs">{tag}</span>)}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 pr-4 align-top text-sm text-gray-600">
                                    <p className="font-medium text-gray-800 truncate">{question.jobCategoryName || 'Unassigned'}</p>
                                    <p className="text-xs text-gray-400 truncate">{question.jobRoleName || question.jobGroupName || ''}</p>
                                </td>
                                <td className="py-4 pr-3 align-top text-gray-600 truncate">{question.difficulty || '-'}</td>
                                <td className="py-4 pr-3 align-top text-gray-600 truncate">{question.questionType || '-'}</td>
                                <td className="py-4 pr-3 align-top text-gray-600 whitespace-nowrap">{question.suggestedDuration || 120}s</td>
                                <td className="py-4 pr-3 align-top">
                                    <button onClick={() => toggleActive(question)} className={`px-3 py-1 rounded-full text-xs font-medium ${question.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {question.isActive ? 'Active' : 'Inactive'}
                                    </button>
                                </td>
                                <td className="py-4 pr-4 align-top">
                                    <div className="flex justify-end gap-2 whitespace-nowrap">
                                        <button onClick={() => openModal(question)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><FiEdit2 /></button>
                                        <button onClick={() => setDeleteModal({ open: true, id: question.id })} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><FiTrash2 /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {!loading && questions.length === 0 && (
                            <tr><td colSpan="7" className="py-10 text-center text-gray-500">No questions found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {modal.open && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
                            <h3 className="text-xl font-bold text-gray-800">{modal.question ? 'Edit Question' : 'Add Question'}</h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><FiX className="text-xl" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
                                <textarea required rows="4" value={formData.questionText} onChange={(e) => setFormData(prev => ({ ...prev, questionText: e.target.value }))} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none resize-none" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select value={formData.jobCategoryId} onChange={(e) => setFormData(prev => ({ ...prev, jobCategoryId: e.target.value, jobRoleId: '' }))} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none">
                                        <option value="">Select category</option>
                                        {categories.map(category => <option key={category.id} value={category.id}>{category.jobGroupName} / {category.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Specialist Role</label>
                                    <select value={formData.jobRoleId} onChange={(e) => setFormData(prev => ({ ...prev, jobRoleId: e.target.value }))} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none">
                                        <option value="">Any role</option>
                                        {filteredRoles.map(role => <option key={role.id} value={role.id}>{role.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                                    <select value={formData.difficulty} onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none">
                                        <option value="">Any level</option>
                                        {levels.map(level => (
                                            <option key={level.id} value={level.code}>{level.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                    <select value={formData.questionType} onChange={(e) => setFormData(prev => ({ ...prev, questionType: e.target.value }))} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none">
                                        <option value="HR">HR</option>
                                        <option value="Technical">Technical</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration Seconds</label>
                                    <input type="number" min="30" value={formData.suggestedDuration} onChange={(e) => setFormData(prev => ({ ...prev, suggestedDuration: e.target.value }))} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                                <input value={formData.tags} onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))} placeholder="java, spring, oop" className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none" />
                            </div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))} className="w-4 h-4 text-primary rounded border-gray-300" />
                                Active
                            </label>
                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={closeModal} className="px-5 py-2 border border-gray-200 text-gray-600 rounded-xl">Cancel</button>
                                <button type="submit" className="px-5 py-2 bg-primary text-white rounded-xl">{modal.question ? 'Update' : 'Create'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {importModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-800">Import Questions</h3>
                            <button onClick={() => setImportModal(false)} className="text-gray-400 hover:text-gray-600"><FiX className="text-xl" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <textarea rows="12" value={importText} onChange={(e) => setImportText(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none font-mono text-sm" placeholder='[{"jobCategoryId":"category-uuid","jobRoleId":"role-uuid","questionText":"Explain REST API design.","difficulty":"JUNIOR","questionType":"Technical","suggestedDuration":120,"tags":["api","backend"],"isActive":true}]' />
                            <div className="flex justify-end gap-3">
                                <button onClick={() => setImportModal(false)} className="px-5 py-2 border border-gray-200 text-gray-600 rounded-xl">Cancel</button>
                                <button onClick={handleImport} className="px-5 py-2 bg-primary text-white rounded-xl">Import</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {deleteModal.open && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
                        <h3 className="font-black text-gray-900 mb-2">Delete Question</h3>
                        <p className="text-sm text-gray-600 mb-6">This question will be removed from admin lists and hidden from users.</p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setDeleteModal({ open: false, id: null })} className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm">Cancel</button>
                            <button onClick={confirmDelete} className="px-5 py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
