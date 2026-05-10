import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiSearch, FiFilter, FiLock, FiUnlock, FiUser,
    FiChevronLeft, FiChevronRight, FiAlertTriangle, FiX, FiCheck
} from 'react-icons/fi';
import { adminUsersApi } from '../services/api';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = [
    { value: '', label: 'All Users' },
    { value: 'active', label: 'Active' },
    { value: 'banned', label: 'Banned' },
];

const PAGE_SIZE = 10;

export default function AdminUsersPage() {
    const [data, setData] = useState({ users: [], totalElements: 0, totalPages: 0 });
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // Ban modal state
    const [banModal, setBanModal] = useState({ open: false, user: null });
    const [banReason, setBanReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await adminUsersApi.getUsers({
                page,
                size: PAGE_SIZE,
                email: search || undefined,
                status: statusFilter || undefined,
            });
            setData(res.data);
        } catch (err) {
            toast.error('Failed to load users');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [page, search, statusFilter]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Debounced search: chỉ gọi API sau khi ngừng gõ
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput);
            setPage(0);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const handleStatusChange = (val) => {
        setStatusFilter(val);
        setPage(0);
    };

    // Ban
    const openBanModal = (user) => {
        setBanModal({ open: true, user });
        setBanReason('');
    };
    const closeBanModal = () => setBanModal({ open: false, user: null });

    const handleBan = async () => {
        if (!banModal.user) return;
        setActionLoading(true);
        try {
            await adminUsersApi.banUser(banModal.user.id, banReason || 'Violated terms of service');
            toast.success(`Banned ${banModal.user.email}`);
            closeBanModal();
            fetchUsers();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to ban user');
        } finally {
            setActionLoading(false);
        }
    };

    const handleUnban = async (user) => {
        if (!window.confirm(`Unban ${user.email}?`)) return;
        try {
            await adminUsersApi.unbanUser(user.id);
            toast.success(`Unblocked ${user.email}`);
            fetchUsers();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to unban user');
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    const getAvatarUrl = (user) => {
        if (user.avatarUrl) return user.avatarUrl;
        const name = encodeURIComponent(user.fullName || user.email);
        return `https://ui-avatars.com/api/?name=${name}&background=random&size=80`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Header Card */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-50 p-6">
                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-6">
                    <div>
                        <h3 className="font-black text-xl text-gray-900">User Management</h3>
                        <p className="text-sm text-gray-400 mt-0.5">
                            {data.totalElements} user{data.totalElements !== 1 ? 's' : ''} total
                        </p>
                    </div>

                    <div className="flex gap-3 w-full sm:w-auto">
                        {/* Search */}
                        <div className="relative flex-1 sm:flex-none sm:w-64">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                            <input
                                id="admin-user-search"
                                type="text"
                                placeholder="Search by email..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="relative">
                            <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                            <select
                                id="admin-user-status-filter"
                                value={statusFilter}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                className="pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none cursor-pointer transition-all"
                            >
                                {STATUS_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto -mx-2">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-gray-400 uppercase text-[10px] font-bold tracking-widest border-b border-slate-100">
                                <th className="pb-4 px-4">User</th>
                                <th className="pb-4 px-4">Status</th>
                                <th className="pb-4 px-4">Plan</th>
                                <th className="pb-4 px-4">Joined</th>
                                <th className="pb-4 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        {Array.from({ length: 5 }).map((_, j) => (
                                            <td key={j} className="py-4 px-4">
                                                <div className="h-4 bg-slate-100 rounded-full animate-pulse" style={{ width: j === 0 ? '60%' : '40%' }} />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : data.users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-16 text-center">
                                        <div className="flex flex-col items-center gap-3 text-gray-400">
                                            <FiUser className="text-4xl" />
                                            <p className="font-medium">No users found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                data.users.map((user) => (
                                    <motion.tr
                                        key={user.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="group hover:bg-slate-50/70 transition-colors"
                                    >
                                        {/* User info */}
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={getAvatarUrl(user)}
                                                    alt={user.fullName || user.email}
                                                    className="w-10 h-10 rounded-xl object-cover shadow-sm flex-shrink-0"
                                                />
                                                <div className="min-w-0">
                                                    <p className="font-bold text-sm text-gray-900 truncate">
                                                        {user.fullName || '—'}
                                                    </p>
                                                    <p className="text-xs text-gray-400 truncate max-w-[180px]">
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Status badge */}
                                        <td className="py-4 px-4">
                                            {user.isBanned ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold">
                                                    <FiLock className="text-[10px]" /> Banned
                                                </span>
                                            ) : user.isActive ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold">
                                                    <FiCheck className="text-[10px]" /> Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-xs font-bold">
                                                    Unverified
                                                </span>
                                            )}
                                        </td>

                                        {/* Plan */}
                                        <td className="py-4 px-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                user.currentPlan === 'Free'
                                                    ? 'bg-slate-100 text-gray-500'
                                                    : 'bg-primary/10 text-primary'
                                            }`}>
                                                {user.currentPlan}
                                            </span>
                                        </td>

                                        {/* Joined */}
                                        <td className="py-4 px-4 text-sm text-gray-500">
                                            {formatDate(user.createdAt)}
                                        </td>

                                        {/* Actions */}
                                        <td className="py-4 px-4">
                                            <div className="flex items-center justify-end gap-2">
                                                {user.isBanned ? (
                                                    <button
                                                        id={`unban-btn-${user.id}`}
                                                        onClick={() => handleUnban(user)}
                                                        title="Unban user"
                                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors"
                                                    >
                                                        <FiUnlock className="text-sm" /> Unban
                                                    </button>
                                                ) : (
                                                    <button
                                                        id={`ban-btn-${user.id}`}
                                                        onClick={() => openBanModal(user)}
                                                        title="Ban user"
                                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-500 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
                                                    >
                                                        <FiLock className="text-sm" /> Ban
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {data.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
                        <p className="text-xs text-gray-400">
                            Page {page + 1} of {data.totalPages}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                id="prev-page-btn"
                                onClick={() => setPage((p) => Math.max(0, p - 1))}
                                disabled={page === 0}
                                className="p-2 rounded-xl border border-slate-200 text-gray-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <FiChevronLeft />
                            </button>

                            {Array.from({ length: Math.min(5, data.totalPages) }).map((_, i) => {
                                const pageNum = Math.max(0, Math.min(page - 2, data.totalPages - 5)) + i;
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setPage(pageNum)}
                                        className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                                            pageNum === page
                                                ? 'bg-primary text-white shadow-md shadow-primary/30'
                                                : 'border border-slate-200 text-gray-500 hover:bg-slate-50'
                                        }`}
                                    >
                                        {pageNum + 1}
                                    </button>
                                );
                            })}

                            <button
                                id="next-page-btn"
                                onClick={() => setPage((p) => Math.min(data.totalPages - 1, p + 1))}
                                disabled={page >= data.totalPages - 1}
                                className="p-2 rounded-xl border border-slate-200 text-gray-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <FiChevronRight />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Ban Confirm Modal */}
            <AnimatePresence>
                {banModal.open && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl w-full max-w-md shadow-2xl"
                        >
                            {/* Modal Header */}
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                                        <FiAlertTriangle className="text-red-500 text-lg" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-gray-900">Ban User</h3>
                                        <p className="text-xs text-gray-400">{banModal.user?.email}</p>
                                    </div>
                                </div>
                                <button onClick={closeBanModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                                    <FiX className="text-xl" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 space-y-4">
                                <p className="text-sm text-gray-600">
                                    This will prevent <strong>{banModal.user?.email}</strong> from logging in or using the system.
                                </p>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Ban Reason <span className="text-gray-400">(optional)</span>
                                    </label>
                                    <textarea
                                        id="ban-reason-input"
                                        value={banReason}
                                        onChange={(e) => setBanReason(e.target.value)}
                                        placeholder="e.g. Inappropriate content, spam activity..."
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 resize-none transition-all"
                                    />
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-6 pt-0 flex justify-end gap-3">
                                <button
                                    onClick={closeBanModal}
                                    className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    id="confirm-ban-btn"
                                    onClick={handleBan}
                                    disabled={actionLoading}
                                    className="px-5 py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center gap-2"
                                >
                                    {actionLoading ? (
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <FiLock className="text-sm" />
                                    )}
                                    Confirm Ban
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
