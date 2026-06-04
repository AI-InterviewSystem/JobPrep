import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiBell, FiCheck, FiTrash2, FiSettings } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { notificationApi } from '../services/api';

const TYPE_LABELS = {
    PRACTICE_REMINDER: 'Practice Reminder',
    SUBSCRIPTION_EXPIRING: 'Subscription',
    WEAK_TOPIC_SUGGESTION: 'Learning Suggestion',
    RETRY_INTERVIEW: 'Interview Retry',
    ACHIEVEMENT_UNLOCKED: 'Achievement',
    GENERAL: 'Notification',
};

function formatTime(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function NotificationsPage() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [prefs, setPrefs] = useState(null);
    const [showPrefs, setShowPrefs] = useState(false);
    const [selected, setSelected] = useState(null);

    const load = async () => {
        try {
            setLoading(true);
            const [listRes, prefRes] = await Promise.all([
                notificationApi.list(),
                notificationApi.getPreferences(),
            ]);
            setNotifications(listRes.data || []);
            setPrefs(prefRes.data);
        } catch (e) {
            toast.error(e?.response?.data?.message || 'Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const handleMarkRead = async (id) => {
        try {
            await notificationApi.markRead(id);
            setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
            window.dispatchEvent(new Event('jobprep:notifications-updated'));
        } catch (e) {
            toast.error('Không cập nhật được');
        }
    };

    const handleMarkAll = async () => {
        try {
            await notificationApi.markAllRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            window.dispatchEvent(new Event('jobprep:notifications-updated'));
            toast.success('Marked all as read');
        } catch (e) {
            toast.error('Failed to update');
        }
    };

    const handleDelete = async (id) => {
        try {
            await notificationApi.delete(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            if (selected?.id === id) setSelected(null);
            window.dispatchEvent(new Event('jobprep:notifications-updated'));
        } catch (e) {
            toast.error('Failed to delete');
        }
    };

    const handlePrefChange = async (key, value) => {
        const next = { ...prefs, [key]: value };
        setPrefs(next);
        try {
            await notificationApi.updatePreferences({
                practiceReminders: next.practiceReminders,
                subscriptionAlerts: next.subscriptionAlerts,
                learningSuggestions: next.learningSuggestions,
            });
            toast.success('Settings saved');
        } catch (e) {
            toast.error('Failed to save settings');
            load();
        }
    };

    const unread = notifications.filter(n => !n.read).length;

    return (
        <div className="bg-[#f8fafc] min-h-screen py-8">
            <div className="max-w-4xl mx-auto px-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2">
                            <FiBell className="text-primary" />
                            Notifications
                        </h1>
                        <p className="text-slate-500 mt-1">{unread} unread</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setShowPrefs(v => !v)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-600 hover:bg-slate-50"
                        >
                            <FiSettings /> Settings
                        </button>
                        {unread > 0 && (
                            <button
                                type="button"
                                onClick={handleMarkAll}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-dark"
                            >
                                <FiCheck /> Mark all read
                            </button>
                        )}
                    </div>
                </div>

                {showPrefs && prefs && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
                        <h2 className="font-bold text-slate-800">Notification Preferences</h2>
                        {[
                            { key: 'practiceReminders', label: 'Practice reminders' },
                            { key: 'subscriptionAlerts', label: 'Subscription alerts' },
                            { key: 'learningSuggestions', label: 'Learning suggestions' },
                        ].map(({ key, label }) => (
                            <label key={key} className="flex items-center justify-between gap-4 cursor-pointer">
                                <span className="text-sm font-medium text-slate-700">{label}</span>
                                <input
                                    type="checkbox"
                                    checked={!!prefs[key]}
                                    onChange={e => handlePrefChange(key, e.target.checked)}
                                    className="h-5 w-5 rounded border-slate-300 text-primary"
                                />
                            </label>
                        ))}
                    </div>
                )}

                {loading ? (
                    <p className="text-slate-500 text-center py-12">Loading...</p>
                ) : notifications.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-500">
                        No notifications yet.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {notifications.map(n => (
                            <div
                                key={n.id}
                                className={`rounded-2xl border bg-white p-5 shadow-sm transition-all ${!n.read ? 'border-primary/30 bg-primary/5' : 'border-slate-200'}`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded">
                                                {TYPE_LABELS[n.type] || n.type}
                                            </span>
                                            {!n.read && (
                                                <span className="text-[10px] font-bold text-amber-600">Mới</span>
                                            )}
                                        </div>
                                        <h3 className="font-bold text-slate-900 mt-1">{n.title}</h3>
                                        <p className="text-sm text-slate-600 mt-1">{n.content}</p>
                                        <p className="text-xs text-slate-400 mt-2">{formatTime(n.createdAt)}</p>
                                        {n.actionUrl && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (!n.read) handleMarkRead(n.id);
                                                    if (n.actionUrl.startsWith('http')) {
                                                        window.location.href = n.actionUrl;
                                                    } else {
                                                        const path = n.actionUrl.replace(/^https?:\/\/[^/]+/, '') || n.actionUrl;
                                                        navigate(path.startsWith('/') ? path : `/${path}`);
                                                    }
                                                }}
                                                className="mt-3 text-sm font-bold text-primary hover:underline"
                                            >
                                                {n.actionLabel || 'Xem chi tiết'} →
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-2 shrink-0">
                                        {!n.read && (
                                            <button
                                                type="button"
                                                title="Đánh dấu đã đọc"
                                                onClick={() => handleMarkRead(n.id)}
                                                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
                                            >
                                                <FiCheck />
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            title="Xóa"
                                            onClick={() => handleDelete(n.id)}
                                            className="p-2 rounded-lg hover:bg-red-50 text-red-500"
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <Link to="/dashboard" className="inline-block text-sm font-bold text-primary hover:underline">
                    ← Back to Dashboard
                </Link>
            </div>
        </div>
    );
}
