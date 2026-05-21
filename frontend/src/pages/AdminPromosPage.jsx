import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiPlus, FiEdit2, FiTrash2, FiTag, 
    FiCalendar, FiClock, FiCheck, FiX, FiAlertCircle,
    FiPercent, FiDollarSign
} from 'react-icons/fi';
import { adminPromosApi } from '../services/api';
import toast from 'react-hot-toast';

export default function AdminPromosPage() {
    const [promos, setPromos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState({ open: false, mode: 'create', data: null });
    const [confirmModal, setConfirmModal] = useState({ open: false, id: null });

    useEffect(() => {
        fetchPromos();
    }, []);

    const fetchPromos = async () => {
        setLoading(true);
        try {
            const res = await adminPromosApi.getAll();
            setPromos(res.data);
        } catch (err) {
            toast.error('Failed to load promotions');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const payload = {
            code: formData.get('code'),
            discountType: formData.get('discountType'),
            discountValue: parseFloat(formData.get('discountValue')),
            maxDiscountAmount: formData.get('maxDiscountAmount') ? parseFloat(formData.get('maxDiscountAmount')) : null,
            minOrderAmount: formData.get('minOrderAmount') ? parseFloat(formData.get('minOrderAmount')) : null,
            usageLimit: formData.get('usageLimit') ? parseInt(formData.get('usageLimit')) : null,
            isActive: formData.get('isActive') === 'true',
            startsAt: formData.get('startsAt') ? new Date(formData.get('startsAt')).toISOString() : null,
            expiresAt: formData.get('expiresAt') ? new Date(formData.get('expiresAt')).toISOString() : null,
        };

        try {
            if (modal.mode === 'create') {
                await adminPromosApi.create(payload);
                toast.success('Promo code created');
            } else {
                await adminPromosApi.update(modal.data.id, payload);
                toast.success('Promo code updated');
            }
            setModal({ open: false, mode: 'create', data: null });
            fetchPromos();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async () => {
        try {
            await adminPromosApi.delete(confirmModal.id);
            toast.success('Promo code deleted');
            setConfirmModal({ open: false, id: null });
            fetchPromos();
        } catch (err) {
            toast.error('Failed to delete');
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString();
    };

    const isExpired = (expiry) => {
        if (!expiry) return false;
        return new Date(expiry) < new Date();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-end">
                <button 
                    onClick={() => setModal({ open: true, mode: 'create', data: null })}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    <FiPlus /> Create Promo
                </button>
            </div>

            {/* Promo Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-64 bg-white rounded-3xl animate-pulse border border-gray-100" />
                    ))
                ) : promos.length === 0 ? (
                    <div className="col-span-full bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-100">
                        <FiTag className="text-4xl text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-400">No active promotions found.</p>
                    </div>
                ) : (
                    promos.map((promo) => (
                        <motion.div 
                            key={promo.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col"
                        >
                            <div className="p-6 flex-1">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary rounded-full">
                                        <FiTag className="text-xs" />
                                        <span className="text-xs font-black tracking-wider">{promo.code}</span>
                                    </div>
                                    <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                                        promo.isActive && !isExpired(promo.expiresAt) 
                                            ? 'bg-green-50 text-green-600' 
                                            : 'bg-red-50 text-red-600'
                                    }`}>
                                        {isExpired(promo.expiresAt) ? 'Expired' : (promo.isActive ? 'Active' : 'Inactive')}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <div className="text-3xl font-black text-gray-900 flex items-baseline gap-1">
                                            {promo.discountType === 'PERCENT' ? (
                                                <>
                                                    {promo.discountValue}<span className="text-lg font-bold text-gray-400">%</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="text-lg font-bold text-gray-400">$</span>{promo.discountValue}
                                                </>
                                            )}
                                            <span className="text-sm font-medium text-gray-400 ml-1">OFF</span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Min Order: ${promo.minOrderAmount || 0} 
                                            {promo.maxDiscountAmount && ` • Max: $${promo.maxDiscountAmount}`}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">Usage</p>
                                            <p className="text-xs font-bold text-gray-700">
                                                {promo.usedCount} / {promo.usageLimit || '∞'}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">Expiry</p>
                                            <p className="text-xs font-bold text-gray-700">
                                                {formatDate(promo.expiresAt)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => setModal({ open: true, mode: 'edit', data: promo })}
                                        className="p-2 text-gray-400 hover:text-primary hover:bg-white rounded-xl transition-all shadow-sm"
                                    >
                                        <FiEdit2 size={16} />
                                    </button>
                                    <button 
                                        onClick={() => setConfirmModal({ open: true, id: promo.id })}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-xl transition-all shadow-sm"
                                    >
                                        <FiTrash2 size={16} />
                                    </button>
                                </div>
                                <span className="text-[10px] text-gray-400">Created: {formatDate(promo.createdAt)}</span>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Promo Modal */}
            <AnimatePresence>
                {modal.open && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setModal({ open: false, mode: 'create', data: null })}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden"
                        >
                            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900">
                                        {modal.mode === 'create' ? 'Create Promo Code' : 'Edit Promo Code'}
                                    </h2>
                                    <p className="text-sm text-gray-400">Configure discount rules and limits</p>
                                </div>
                                <button 
                                    onClick={() => setModal({ open: false, mode: 'create', data: null })}
                                    className="p-2 hover:bg-gray-50 rounded-xl transition-all"
                                >
                                    <FiX className="text-gray-400" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 grid grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Code</label>
                                        <input 
                                            name="code"
                                            defaultValue={modal.data?.code || ''}
                                            required
                                            placeholder="SUMMER2024"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-mono uppercase"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Type</label>
                                            <select 
                                                name="discountType"
                                                defaultValue={modal.data?.discountType || 'PERCENT'}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                            >
                                                <option value="PERCENT">Percent (%)</option>
                                                <option value="FIXED">Fixed ($)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Value</label>
                                            <input 
                                                name="discountValue"
                                                type="number"
                                                step="0.01"
                                                defaultValue={modal.data?.discountValue || ''}
                                                required
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Min Order</label>
                                            <input 
                                                name="minOrderAmount"
                                                type="number"
                                                defaultValue={modal.data?.minOrderAmount || ''}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Max Cap</label>
                                            <input 
                                                name="maxDiscountAmount"
                                                type="number"
                                                defaultValue={modal.data?.maxDiscountAmount || ''}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Usage Limit</label>
                                        <input 
                                            name="usageLimit"
                                            type="number"
                                            defaultValue={modal.data?.usageLimit || ''}
                                            placeholder="Leave empty for unlimited"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Starts At</label>
                                            <input 
                                                name="startsAt"
                                                type="date"
                                                defaultValue={modal.data?.startsAt?.split('T')[0] || ''}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Expires At</label>
                                            <input 
                                                name="expiresAt"
                                                type="date"
                                                defaultValue={modal.data?.expiresAt?.split('T')[0] || ''}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Status</label>
                                        <div className="flex gap-4">
                                            <label className="flex-1 flex items-center gap-3 p-3 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition-all">
                                                <input type="radio" name="isActive" value="true" defaultChecked={modal.data?.isActive !== false} className="w-4 h-4 text-primary" />
                                                <span className="text-sm font-bold">Active</span>
                                            </label>
                                            <label className="flex-1 flex items-center gap-3 p-3 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition-all">
                                                <input type="radio" name="isActive" value="false" defaultChecked={modal.data?.isActive === false} className="w-4 h-4 text-primary" />
                                                <span className="text-sm font-bold">Inactive</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-span-2 pt-4">
                                    <button className="w-full bg-primary text-white py-4 rounded-3xl font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                                        {modal.mode === 'create' ? 'Create Promotion' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Confirm Delete Modal */}
            <AnimatePresence>
                {confirmModal.open && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setConfirmModal({ open: false, id: null })}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 text-center"
                        >
                            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <FiTrash2 size={32} />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 mb-2">Delete Promo Code</h3>
                            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                                Are you sure you want to delete this promotion? Users will no longer be able to use this code.
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={() => setConfirmModal({ open: false, id: null })}
                                    className="py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleDelete}
                                    className="py-4 rounded-2xl font-bold bg-red-500 text-white shadow-lg shadow-red-200 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                >
                                    Confirm
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
