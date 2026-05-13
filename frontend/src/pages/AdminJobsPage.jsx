import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiPlus, FiEdit2, FiTrash2, FiBriefcase,
    FiChevronDown, FiChevronRight, FiPlusCircle,
    FiX, FiCheck
} from 'react-icons/fi';
import { adminJobsApi } from '../services/api';
import toast from 'react-hot-toast';

export default function AdminJobsPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedCategories, setExpandedCategories] = useState(new Set());

    // Modals
    const [categoryModal, setCategoryModal] = useState({ open: false, mode: 'create', data: null });
    const [roleModal, setRoleModal] = useState({ open: false, mode: 'create', data: null, categoryId: null });
    const [confirmModal, setConfirmModal] = useState({ open: false, title: '', message: '', onConfirm: null });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await adminJobsApi.getCategories();
            setCategories(res.data);
        } catch (err) {
            toast.error('Failed to load job categories');
        } finally {
            setLoading(false);
        }
    };

    const toggleCategory = (id) => {
        const next = new Set(expandedCategories);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setExpandedCategories(next);
    };

    // Category Handlers
    const handleCategorySubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const payload = {
            name: formData.get('name'),
            description: formData.get('description')
        };

        try {
            if (categoryModal.mode === 'create') {
                await adminJobsApi.createCategory(payload);
                toast.success('Category created');
            } else {
                await adminJobsApi.updateCategory(categoryModal.data.id, payload);
                toast.success('Category updated');
            }
            setCategoryModal({ open: false, mode: 'create', data: null });
            fetchCategories();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Operation failed');
        }
    };

    const handleDeleteCategory = (id) => {
        setConfirmModal({
            open: true,
            title: 'Delete Category',
            message: 'Are you sure you want to delete this category? All associated roles will be removed. This action cannot be undone.',
            onConfirm: async () => {
                try {
                    await adminJobsApi.deleteCategory(id);
                    toast.success('Category deleted');
                    fetchCategories();
                } catch (err) {
                    toast.error(err.response?.data?.message || 'Failed to delete');
                }
                setConfirmModal(prev => ({ ...prev, open: false }));
            }
        });
    };

    // Role Handlers
    const handleRoleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const payload = {
            name: formData.get('name'),
            description: formData.get('description'),
            categoryId: roleModal.categoryId
        };

        try {
            if (roleModal.mode === 'create') {
                await adminJobsApi.createRole(payload);
                toast.success('Role created');
            } else {
                await adminJobsApi.updateRole(roleModal.data.id, payload);
                toast.success('Role updated');
            }
            setRoleModal({ open: false, mode: 'create', data: null, categoryId: null });
            fetchCategories();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Operation failed');
        }
    };

    const handleDeleteRole = (id) => {
        setConfirmModal({
            open: true,
            title: 'Delete Role',
            message: 'Are you sure you want to delete this specific role? This action cannot be undone.',
            onConfirm: async () => {
                try {
                    await adminJobsApi.deleteRole(id);
                    toast.success('Role deleted');
                    fetchCategories();
                } catch (err) {
                    toast.error(err.response?.data?.message || 'Failed to delete');
                }
                setConfirmModal(prev => ({ ...prev, open: false }));
            }
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Job Management</h1>
                    <p className="text-sm text-gray-500">Manage industries and specific roles</p>
                </div>
                <button
                    onClick={() => setCategoryModal({ open: true, mode: 'create', data: null })}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    <FiPlus /> Add Category
                </button>
            </div>

            {/* Categories List */}
            <div className="grid gap-4">
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-20 bg-white rounded-2xl animate-pulse border border-gray-100" />
                    ))
                ) : categories.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-100">
                        <FiBriefcase className="text-4xl text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-400">No job categories defined yet.</p>
                    </div>
                ) : (
                    categories.map((category) => (
                        <div key={category.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden transition-all">
                            {/* Category Header */}
                            <div className="p-5 flex items-center justify-between group">
                                <div
                                    className="flex items-center gap-4 cursor-pointer flex-1"
                                    onClick={() => toggleCategory(category.id)}
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                        <FiBriefcase className="text-xl" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{category.name}</h3>
                                        <p className="text-xs text-gray-400">{category.roles?.length || 0} roles</p>
                                    </div>
                                    {expandedCategories.has(category.id) ? <FiChevronDown className="text-gray-300" /> : <FiChevronRight className="text-gray-300" />}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCategoryModal({ open: true, mode: 'edit', data: category })}
                                        className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                                    >
                                        <FiEdit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteCategory(category.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    >
                                        <FiTrash2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => setRoleModal({ open: true, mode: 'create', data: null, categoryId: category.id })}
                                        className="ml-4 flex items-center gap-2 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-black transition-all"
                                    >
                                        <FiPlusCircle /> Add Role
                                    </button>
                                </div>
                            </div>

                            {/* Roles List */}
                            <AnimatePresence>
                                {expandedCategories.has(category.id) && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="bg-gray-50/50 border-t border-gray-50"
                                    >
                                        <div className="p-4 space-y-2">
                                            {category.roles?.length === 0 ? (
                                                <p className="text-center py-4 text-xs text-gray-400">No roles in this category.</p>
                                            ) : (
                                                category.roles.map((role) => (
                                                    <div key={role.id} className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between group/role">
                                                        <div>
                                                            <h4 className="text-sm font-bold text-gray-800">{role.name}</h4>
                                                            {role.description && <p className="text-[10px] text-gray-400 mt-0.5">{role.description}</p>}
                                                        </div>
                                                        <div className="flex items-center gap-1 opacity-0 group-hover/role:opacity-100 transition-all">
                                                            <button
                                                                onClick={() => setRoleModal({ open: true, mode: 'edit', data: role, categoryId: category.id })}
                                                                className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-md transition-all"
                                                            >
                                                                <FiEdit2 size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteRole(role.id)}
                                                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
                                                            >
                                                                <FiTrash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))
                )}
            </div>

            {/* Category Modal */}
            <Modal
                open={categoryModal.open}
                onClose={() => setCategoryModal({ open: false, mode: 'create', data: null })}
                title={categoryModal.mode === 'create' ? 'Add Job Category' : 'Edit Category'}
            >
                <form onSubmit={handleCategorySubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Category Name</label>
                        <input
                            name="name"
                            defaultValue={categoryModal.data?.name || ''}
                            required
                            placeholder="e.g. Software Engineering"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Description</label>
                        <textarea
                            name="description"
                            defaultValue={categoryModal.data?.description || ''}
                            rows={3}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                        />
                    </div>
                    <button className="w-full bg-primary text-white py-4 rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                        {categoryModal.mode === 'create' ? 'Create Category' : 'Save Changes'}
                    </button>
                </form>
            </Modal>

            {/* Role Modal */}
            <Modal
                open={roleModal.open}
                onClose={() => setRoleModal({ open: false, mode: 'create', data: null, categoryId: null })}
                title={roleModal.mode === 'create' ? 'Add Job Role' : 'Edit Role'}
            >
                <form onSubmit={handleRoleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Role Name</label>
                        <input
                            name="name"
                            defaultValue={roleModal.data?.name || ''}
                            required
                            placeholder="e.g. Backend Developer"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Description</label>
                        <textarea
                            name="description"
                            defaultValue={roleModal.data?.description || ''}
                            rows={3}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                        />
                    </div>
                    <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black shadow-xl shadow-slate-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                        {roleModal.mode === 'create' ? 'Add Role' : 'Save Changes'}
                    </button>
                </form>
            </Modal>

            {/* Confirm Delete Modal */}
            <ConfirmModal
                open={confirmModal.open}
                onClose={() => setConfirmModal(prev => ({ ...prev, open: false }))}
                title={confirmModal.title}
                message={confirmModal.message}
                onConfirm={confirmModal.onConfirm}
            />
        </div>
    );
}

function ConfirmModal({ open, onClose, title, message, onConfirm }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="relative bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 text-center"
            >
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <FiTrash2 size={32} />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                    {message}
                </p>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={onClose}
                        className="py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="py-4 rounded-2xl font-bold bg-red-500 text-white shadow-lg shadow-red-200 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        Confirm
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

function Modal({ open, onClose, title, children }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden"
            >
                <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                    <h2 className="text-xl font-black text-gray-900">{title}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-xl transition-all">
                        <FiX className="text-gray-400" />
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </motion.div>
        </div>
    );
}
