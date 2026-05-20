import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminFeedbackApi } from '../services/api';
import toast from 'react-hot-toast';
import { FiMessageSquare, FiClock, FiCheckCircle, FiInfo, FiXCircle, FiPaperclip, FiX, FiFilter, FiEdit2 } from 'react-icons/fi';

export default function AdminFeedbackPage() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [filterType, setFilterType] = useState('ALL');

    // Selected feedback state
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    // Status update state
    const [updateStatus, setUpdateStatus] = useState('');
    const [internalNote, setInternalNote] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const fetchFeedbacks = async () => {
        setLoading(true);
        try {
            const res = await adminFeedbackApi.getAll();
            setFeedbacks(res.data);
        } catch (err) {
            toast.error("Failed to load feedbacks");
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async (feedbackId) => {
        setLoadingHistory(true);
        try {
            const res = await adminFeedbackApi.getHistory(feedbackId);
            setHistory(res.data);
        } catch (error) {
            toast.error("Failed to load feedback history");
        } finally {
            setLoadingHistory(false);
        }
    };

    const openFeedback = (feedback) => {
        setSelectedFeedback(feedback);
        setUpdateStatus(feedback.status);
        setInternalNote('');
        fetchHistory(feedback.id);
    };

    const closeFeedback = () => {
        setSelectedFeedback(null);
        setHistory([]);
    };

    const handleUpdateStatus = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            const res = await adminFeedbackApi.updateStatus(selectedFeedback.id, {
                status: updateStatus,
                note: internalNote
            });

            toast.success("Feedback status updated successfully");

            // Update local state
            setFeedbacks(feedbacks.map(f => f.id === selectedFeedback.id ? res.data : f));

            // Re-fetch history to show the new entry and reset note
            setInternalNote('');
            setSelectedFeedback(res.data);
            fetchHistory(selectedFeedback.id);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update feedback");
        } finally {
            setIsUpdating(false);
        }
    };

    const StatusBadge = ({ status }) => {
        const config = {
            PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: FiClock, label: 'Pending' },
            IN_PROGRESS: { color: 'bg-blue-100 text-blue-800', icon: FiInfo, label: 'In Progress' },
            RESOLVED: { color: 'bg-green-100 text-green-800', icon: FiCheckCircle, label: 'Resolved' },
            REJECTED: { color: 'bg-red-100 text-red-800', icon: FiXCircle, label: 'Rejected' },
        };
        const st = config[status] || config.PENDING;
        const Icon = st.icon;
        return (
            <span className={`px-2.5 py-1 text-xs font-semibold flex items-center gap-1 rounded-full w-fit ${st.color}`}>
                <Icon className="w-3 h-3" /> {st.label}
            </span>
        );
    };

    const filteredFeedbacks = feedbacks.filter(f => {
        if (filterStatus !== 'ALL' && f.status !== filterStatus) return false;
        if (filterType !== 'ALL' && f.type !== filterType) return false;
        return true;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Feedback Management</h1>
                    <p className="text-gray-500 mt-1">Review, manage and resolve user feedbacks.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-500 font-medium mr-2">
                    <FiFilter /> Filters
                </div>
                <select
                    className="border-gray-200 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500 py-2 pl-3 pr-8"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                >
                    <option value="ALL">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="REJECTED">Rejected</option>
                </select>

                <select
                    className="border-gray-200 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500 py-2 pl-3 pr-8"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                >
                    <option value="ALL">All Types</option>
                    <option value="BUG">Bug</option>
                    <option value="SUGGESTION">Suggestion</option>
                    <option value="OTHER">Other</option>
                </select>
            </div>

            {/* Feedback List */}
            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                </div>
            ) : filteredFeedbacks.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <FiMessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No feedbacks found</h3>
                    <p className="text-gray-500 mt-1">There are no feedbacks matching your current filters.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredFeedbacks.map((item) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 cursor-pointer hover:border-primary-300 hover:shadow-md transition-all flex flex-col justify-between"
                            onClick={() => openFeedback(item)}
                        >
                            <div>
                                <div className="flex justify-between items-start gap-4 mb-2">
                                    <h3 className="font-semibold text-gray-900 truncate">{item.title}</h3>
                                    <StatusBadge status={item.status} />
                                </div>
                                <p className="text-gray-600 text-sm line-clamp-2 mb-3">{item.content}</p>
                            </div>
                            <div className="flex justify-between items-center text-xs text-gray-500 pt-3 border-t border-gray-100">
                                <span>{item.userName} • {item.userEmail}</span>
                                <span className="flex items-center gap-2">
                                    <span className="capitalize">{item.type.toLowerCase()}</span>
                                    <span>•</span>
                                    {new Date(item.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Detail & Process Modal */}
            <AnimatePresence>
                {selectedFeedback && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
                        >
                            <div className="flex justify-between items-center p-6 border-b border-gray-100">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                    <FiMessageSquare className="text-primary" />
                                    Feedback Details
                                </h2>
                                <button onClick={closeFeedback} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                                    <FiX className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 flex flex-col lg:flex-row gap-8">
                                {/* Left Col - Details */}
                                <div className="flex-1 space-y-6">
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <h3 className="font-bold text-lg text-gray-900">{selectedFeedback.title}</h3>
                                            <StatusBadge status={selectedFeedback.status} />
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span className="font-medium text-primary bg-blue-50 px-2 py-0.5 rounded capitalize">{selectedFeedback.type.toLowerCase()}</span>
                                            <span>From: {selectedFeedback.userName} ({selectedFeedback.userEmail})</span>
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1">Submitted at {new Date(selectedFeedback.createdAt).toLocaleString()}</div>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-xl text-gray-700 text-sm whitespace-pre-wrap border border-gray-100">
                                        {selectedFeedback.content}
                                    </div>

                                    {selectedFeedback.attachmentUrl && (
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900 mb-2">Attachment</p>
                                            <a href={selectedFeedback.attachmentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                                <FiPaperclip className="text-primary-600" />
                                                View Attachment
                                            </a>
                                        </div>
                                    )}

                                    {/* History Audit Trail */}
                                    <div className="pt-4 border-t border-gray-100">
                                        <p className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <FiClock className="text-gray-400" /> Process History
                                        </p>

                                        {loadingHistory ? (
                                            <div className="text-sm text-gray-500">Loading history...</div>
                                        ) : history.length === 0 ? (
                                            <div className="text-sm text-gray-500 italic">No status changes yet.</div>
                                        ) : (
                                            <div className="space-y-4">
                                                {history.map((h, i) => (
                                                    <div key={h.id} className="relative pl-4 border-l-2 border-gray-200 pb-2">
                                                        <div className="absolute w-2 h-2 bg-blue-400 rounded-full -left-[5px] top-1"></div>
                                                        <div className="flex justify-between items-start">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                Status: <span className="text-gray-600 line-through text-xs px-1">{h.oldStatus}</span> &rarr; <span className="font-semibold text-primary-600">{h.newStatus}</span>
                                                            </div>
                                                            <div className="text-xs text-gray-400">{new Date(h.createdAt).toLocaleString()}</div>
                                                        </div>
                                                        <div className="text-xs text-gray-500 mt-1">Processed by {h.changedByName}</div>
                                                        {h.internalNote && (
                                                            <div className="mt-2 text-sm text-gray-700 bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                                                                <span className="font-semibold block mb-1">Internal Note:</span>
                                                                {h.internalNote}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right Col - Action Form */}
                                <div className="lg:w-80 shrink-0">
                                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 sticky top-0">
                                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <FiEdit2 className="text-primary-600" />
                                            Update Status
                                        </h3>
                                        <form onSubmit={handleUpdateStatus} className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">New Status</label>
                                                <select
                                                    className="w-full border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
                                                    value={updateStatus}
                                                    onChange={(e) => setUpdateStatus(e.target.value)}
                                                >
                                                    <option value="PENDING">Pending</option>
                                                    <option value="IN_PROGRESS">In Progress</option>
                                                    <option value="RESOLVED">Resolved</option>
                                                    <option value="REJECTED">Rejected</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Internal Note (Optional)</label>
                                                <p className="text-xs text-gray-500 mb-2">Only visible to administrators.</p>
                                                <textarea
                                                    rows="4"
                                                    className="w-full border-gray-300 rounded-lg text-sm focus:ring-primary focus:border-primary resize-none"
                                                    placeholder="Add processing details..."
                                                    value={internalNote}
                                                    onChange={(e) => setInternalNote(e.target.value)}
                                                ></textarea>
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={isUpdating}
                                                className="w-full py-2 bg-primary text-white rounded-lg font-medium hover:opacity-90 focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 transition-all flex justify-center items-center gap-2"
                                            >
                                                {isUpdating ? (
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                ) : "Save Changes"}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
