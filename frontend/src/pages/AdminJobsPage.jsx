import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiPlus, FiEdit2, FiTrash2, FiBriefcase,
    FiChevronDown, FiChevronRight, FiPlusCircle,
    FiX, FiLayers, FiTag
} from 'react-icons/fi';
import { adminJobsApi } from '../services/api';
import toast from 'react-hot-toast';

export default function AdminJobsPage() {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedGroups, setExpandedGroups] = useState(new Set());
    const [expandedCategories, setExpandedCategories] = useState(new Set());

    // Modals
    const [groupModal, setGroupModal] = useState({ open: false, mode: 'create', data: null });
    const [categoryModal, setCategoryModal] = useState({ open: false, mode: 'create', data: null, groupId: null });
    const [roleModal, setRoleModal] = useState({ open: false, mode: 'create', data: null, categoryId: null, groupId: null });
    const [confirmModal, setConfirmModal] = useState({ open: false, title: '', message: '', onConfirm: null });

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async (background = false) => {
        if (!background) setLoading(true);
        try {
            const res = await adminJobsApi.getGroups();
            setGroups(res.data);
        } catch (err) {
            toast.error('Failed to load job groups');
        } finally {
            if (!background) setLoading(false);
        }
    };

    const toggleGroup = (id) => {
        const next = new Set(expandedGroups);
        if (next.has(id)) next.delete(id); else next.add(id);
        setExpandedGroups(next);
    };

    const toggleCategory = (id) => {
        const next = new Set(expandedCategories);
        if (next.has(id)) next.delete(id); else next.add(id);
        setExpandedCategories(next);
    };

    // --- Group Handlers ---
    const handleGroupSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const payload = { name: formData.get('name'), description: formData.get('description'), isActive: true };
        try {
            if (groupModal.mode === 'create') {
                await adminJobsApi.createGroup(payload);
                toast.success('Job group created');
            } else {
                await adminJobsApi.updateGroup(groupModal.data.id, payload);
                toast.success('Job group updated');
            }
            setGroupModal({ open: false, mode: 'create', data: null });
            fetchGroups(true);
        } catch (err) {
            console.error('Create Group Error:', err.response?.data);
            const msg = err.response?.data?.message || (err.response?.data ? Object.values(err.response.data)[0] : 'Operation failed');
            toast.error(msg);
        }
    };

    const handleDeleteGroup = (id) => {
        setConfirmModal({
            open: true,
            title: 'Delete Job Group',
            message: 'Are you sure? All categories and roles inside will also be deleted.',
            onConfirm: async () => {
                try {
                    await adminJobsApi.deleteGroup(id);
                    toast.success('Group deleted');
                    fetchGroups(true);
                } catch (err) {
                    toast.error(err.response?.data?.message || 'Failed to delete');
                }
                setConfirmModal(prev => ({ ...prev, open: false }));
            }
        });
    };

    // --- Category Handlers ---
    const handleCategorySubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const payload = {
            name: formData.get('name'),
            description: formData.get('description'),
            groupId: categoryModal.groupId
        };
        try {
            if (categoryModal.mode === 'create') {
                await adminJobsApi.createCategory(payload);
                toast.success('Category created');
            } else {
                await adminJobsApi.updateCategory(categoryModal.data.id, payload);
                toast.success('Category updated');
            }
            setCategoryModal({ open: false, mode: 'create', data: null, groupId: null });
            fetchGroups(true);
        } catch (err) {
            console.error('Create Category Error:', err.response?.data);
            const msg = err.response?.data?.message || (err.response?.data && Object.keys(err.response.data).length > 0 ? Object.values(err.response.data)[0] : 'Operation failed');
            toast.error(msg);
        }
    };

    const handleDeleteCategory = (id) => {
        setConfirmModal({
            open: true,
            title: 'Delete Category',
            message: 'Are you sure? All roles inside this category will also be removed.',
            onConfirm: async () => {
                try {
                    await adminJobsApi.deleteCategory(id);
                    toast.success('Category deleted');
                    fetchGroups(true);
                } catch (err) {
                    toast.error(err.response?.data?.message || 'Failed to delete');
                }
                setConfirmModal(prev => ({ ...prev, open: false }));
            }
        });
    };

    // --- Role Handlers ---
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
            setRoleModal({ open: false, mode: 'create', data: null, categoryId: null, groupId: null });
            fetchGroups(true);
        } catch (err) {
            console.error('Create Role Error:', err.response?.data);
            const msg = err.response?.data?.message || (err.response?.data && Object.keys(err.response.data).length > 0 ? Object.values(err.response.data)[0] : 'Operation failed');
            toast.error(msg);
        }
    };

    const handleDeleteRole = (id) => {
        setConfirmModal({
            open: true,
            title: 'Delete Role',
            message: 'Are you sure you want to delete this role? This action cannot be undone.',
            onConfirm: async () => {
                try {
                    await adminJobsApi.deleteRole(id);
                    toast.success('Role deleted');
                    fetchGroups(true);
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
            <div className="flex items-center justify-end">
                <button
                    onClick={() => setGroupModal({ open: true, mode: 'create', data: null })}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    <FiPlus /> Add Job Group
                </button>
            </div>

            {/* Groups List */}
            <div className="grid gap-4">
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-20 bg-white rounded-2xl animate-pulse border border-gray-100" />
                    ))
                ) : groups.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-100">
                        <FiLayers className="text-4xl text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-400">No job groups defined yet. Start by adding one.</p>
                    </div>
                ) : (
                    groups.map((group) => (
                        <div key={group.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                            {/* Group Header */}
                            <div className="p-5 flex items-center justify-between group">
                                <div
                                    className="flex items-center gap-4 cursor-pointer flex-1"
                                    onClick={() => toggleGroup(group.id)}
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                        <FiLayers className="text-xl" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{group.name}</h3>
                                        <p className="text-xs text-gray-400">{group.categories?.length || 0} categories</p>
                                    </div>
                                    {expandedGroups.has(group.id)
                                        ? <FiChevronDown className="text-gray-300" />
                                        : <FiChevronRight className="text-gray-300" />}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setGroupModal({ open: true, mode: 'edit', data: group })}
                                        className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                                    >
                                        <FiEdit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteGroup(group.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    >
                                        <FiTrash2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => setCategoryModal({ open: true, mode: 'create', data: null, groupId: group.id })}
                                        className="ml-2 flex items-center gap-2 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-black transition-all"
                                    >
                                        <FiPlusCircle /> Add Category
                                    </button>
                                </div>
                            </div>

                            {/* Categories inside the Group */}
                            <AnimatePresence>
                                {expandedGroups.has(group.id) && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="bg-gray-50/50 border-t border-gray-50"
                                    >
                                        <div className="p-4 space-y-3">
                                            {!group.categories || group.categories.length === 0 ? (
                                                <p className="text-center py-4 text-xs text-gray-400">No categories in this group.</p>
                                            ) : (
                                                group.categories.map((category) => (
                                                    <div key={category.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                                                        {/* Category Header */}
                                                        <div className="p-4 flex items-center justify-between group/cat">
                                                            <div
                                                                className="flex items-center gap-3 cursor-pointer flex-1"
                                                                onClick={() => toggleCategory(category.id)}
                                                            >
                                                                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 group-hover/cat:bg-indigo-500 group-hover/cat:text-white transition-all">
                                                                    <FiBriefcase size={16} />
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-bold text-gray-800 text-sm">{category.name}</h4>
                                                                    <p className="text-[10px] text-gray-400">{category.roles?.length || 0} roles</p>
                                                                </div>
                                                                {expandedCategories.has(category.id)
                                                                    ? <FiChevronDown className="text-gray-300 text-sm" />
                                                                    : <FiChevronRight className="text-gray-300 text-sm" />}
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <button
                                                                    onClick={() => setCategoryModal({ open: true, mode: 'edit', data: category, groupId: group.id })}
                                                                    className="p-1.5 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-all"
                                                                >
                                                                    <FiEdit2 size={14} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteCategory(category.id)}
                                                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                                >
                                                                    <FiTrash2 size={14} />
                                                                </button>
                                                                <button
                                                                    onClick={() => setRoleModal({ open: true, mode: 'create', data: null, categoryId: category.id, groupId: group.id })}
                                                                    className="ml-1 flex items-center gap-1.5 bg-indigo-600 text-white px-2.5 py-1.5 rounded-lg text-[11px] font-bold hover:bg-indigo-700 transition-all"
                                                                >
                                                                    <FiPlusCircle size={11} /> Add Role
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Roles inside the Category */}
                                                        <AnimatePresence>
                                                            {expandedCategories.has(category.id) && (
                                                                <motion.div
                                                                    initial={{ height: 0, opacity: 0 }}
                                                                    animate={{ height: 'auto', opacity: 1 }}
                                                                    exit={{ height: 0, opacity: 0 }}
                                                                    className="border-t border-gray-50 bg-gray-50/80"
                                                                >
                                                                    <div className="p-3 space-y-1.5">
                                                                        {!category.roles || category.roles.length === 0 ? (
                                                                            <p className="text-center py-3 text-[11px] text-gray-400 italic">No roles in this category.</p>
                                                                        ) : (
                                                                            category.roles.map((role) => (
                                                                                <div key={role.id} className="bg-white px-4 py-3 rounded-xl border border-gray-100 flex items-center justify-between group/role">
                                                                                    <div className="flex items-center gap-2.5">
                                                                                        <FiTag size={12} className="text-emerald-500" />
                                                                                        <div>
                                                                                            <h5 className="text-xs font-bold text-gray-800">{role.name}</h5>
                                                                                            {role.description && <p className="text-[10px] text-gray-400">{role.description}</p>}
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="flex items-center gap-1 opacity-0 group-hover/role:opacity-100 transition-all">
                                                                                        <button
                                                                                            onClick={() => setRoleModal({ open: true, mode: 'edit', data: role, categoryId: category.id, groupId: group.id })}
                                                                                            className="p-1 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-all"
                                                                                        >
                                                                                            <FiEdit2 size={12} />
                                                                                        </button>
                                                                                        <button
                                                                                            onClick={() => handleDeleteRole(role.id)}
                                                                                            className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
                                                                                        >
                                                                                            <FiTrash2 size={12} />
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
                                    </motion.div>
                                )}
            </AnimatePresence>
                        </div>
                    ))
                )}
            </div>

            {/* Group Modal */}
            <Modal
                open={groupModal.open}
                onClose={() => setGroupModal({ open: false, mode: 'create', data: null })}
                title={groupModal.mode === 'create' ? 'Add Job Group' : 'Edit Job Group'}
                accentColor="primary"
            >
                <form onSubmit={handleGroupSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Group Name</label>
                        <input
                            name="name"
                            defaultValue={groupModal.data?.name || ''}
                            required
                            placeholder="e.g. Technology"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Description</label>
                        <textarea
                            name="description"
                            defaultValue={groupModal.data?.description || ''}
                            rows={3}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                        />
                    </div>
                    <button className="w-full bg-primary text-white py-4 rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                        {groupModal.mode === 'create' ? 'Create Group' : 'Save Changes'}
                    </button>
                </form>
            </Modal>

            {/* Category Modal */}
            <Modal
                open={categoryModal.open}
                onClose={() => setCategoryModal({ open: false, mode: 'create', data: null, groupId: null })}
                title={categoryModal.mode === 'create' ? 'Add Category' : 'Edit Category'}
                accentColor="indigo"
            >
                <form onSubmit={handleCategorySubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Category Name</label>
                        <input
                            name="name"
                            defaultValue={categoryModal.data?.name || ''}
                            required
                            placeholder="e.g. Software Engineering"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Description</label>
                        <textarea
                            name="description"
                            defaultValue={categoryModal.data?.description || ''}
                            rows={3}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-all resize-none"
                        />
                    </div>
                    <button className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-indigo-200 hover:scale-[1.02] active:scale-[0.98] transition-all">
                        {categoryModal.mode === 'create' ? 'Create Category' : 'Save Changes'}
                    </button>
                </form>
            </Modal>

            {/* Role Modal */}
            <Modal
                open={roleModal.open}
                onClose={() => setRoleModal({ open: false, mode: 'create', data: null, categoryId: null, groupId: null })}
                title={roleModal.mode === 'create' ? 'Add Role' : 'Edit Role'}
                accentColor="emerald"
            >
                <form onSubmit={handleRoleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Role Name</label>
                        <input
                            name="name"
                            defaultValue={roleModal.data?.name || ''}
                            required
                            placeholder="e.g. Backend Developer"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Description</label>
                        <textarea
                            name="description"
                            defaultValue={roleModal.data?.description || ''}
                            rows={3}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 outline-none transition-all resize-none"
                        />
                    </div>
                    <button className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-emerald-200 hover:scale-[1.02] active:scale-[0.98] transition-all">
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="relative bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 text-center">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <FiTrash2 size={32} />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm mb-8 leading-relaxed">{message}</p>
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={onClose} className="py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all">Cancel</button>
                    <button onClick={onConfirm} className="py-4 rounded-2xl font-bold bg-red-500 text-white shadow-lg shadow-red-200 hover:scale-[1.02] active:scale-[0.98] transition-all">Confirm</button>
                </div>
            </motion.div>
        </div>
    );
}

function Modal({ open, onClose, title, children }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                    <h2 className="text-xl font-black text-gray-900">{title}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-xl transition-all">
                        <FiX className="text-gray-400" />
                    </button>
                </div>
                <div className="p-6">{children}</div>
            </motion.div>
        </div>
    );
}
