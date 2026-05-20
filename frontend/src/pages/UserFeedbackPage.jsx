import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageSquare, FiSend, FiPaperclip, FiX, FiCheckCircle, FiClock, FiCheck, FiXCircle, FiInfo } from 'react-icons/fi';
import { feedbackApi, profileApi } from '../services/api';
import toast from 'react-hot-toast';

export default function UserFeedbackPage() {
    const [activeTab, setActiveTab] = useState('submit'); // 'submit' | 'history'
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [type, setType] = useState('SUGGESTION');
    const [file, setFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Fetch history
    const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
            const res = await feedbackApi.getMine();
            setHistory(res.data);
        } catch (error) {
            toast.error("Failed to load feedback history");
        } finally {
            setLoadingHistory(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'history') {
            fetchHistory();
        }
    }, [activeTab]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        let attachmentUrl = null;

        try {
            // Upload file if exists
            if (file) {
                const uploadRes = await profileApi.uploadFile(file);
                attachmentUrl = uploadRes.data.url;
            }

            // Submit feedback
            await feedbackApi.submit({
                title,
                content,
                type,
                attachmentUrl
            });

            toast.success("Feedback submitted successfully. Thank you!");

            // Reset form
            setTitle('');
            setContent('');
            setType('SUGGESTION');
            setFile(null);

            // Switch to history tab to show the new submission
            setActiveTab('history');
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to submit feedback");
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'PENDING': return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 flex items-center gap-1"><FiClock /> Pending</span>;
            case 'IN_PROGRESS': return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 flex items-center gap-1"><FiInfo /> In Progress</span>;
            case 'RESOLVED': return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 flex items-center gap-1"><FiCheckCircle /> Resolved</span>;
            case 'REJECTED': return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 flex items-center gap-1"><FiXCircle /> Rejected</span>;
            default: return null;
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-primary-100 text-primary-600 rounded-xl">
                    <FiMessageSquare className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Feedback & Support</h1>
                    <p className="text-gray-500">Help us improve by sharing your thoughts or reporting issues.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200 mb-8 w-fit">
                <button
                    onClick={() => setActiveTab('submit')}
                    className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'submit' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Submit Feedback
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'history' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    My History
                </button>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'submit' && (
                    <motion.div
                        key="submit"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Feedback Type</label>
                                    <div className="flex gap-4">
                                        {['SUGGESTION', 'BUG', 'OTHER'].map((t) => (
                                            <label key={t} className={`flex-1 flex justify-center items-center p-3 border rounded-xl cursor-pointer transition-all ${type === t ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                                                }`}>
                                                <input type="radio" className="hidden" name="type" value={t} checked={type === t} onChange={() => setType(t)} />
                                                <span className="text-sm font-semibold capitalize">{t.toLowerCase()}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        placeholder="Brief summary of your feedback"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
                                    <textarea
                                        required
                                        rows="5"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                                        placeholder="Please provide as much detail as possible..."
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                    ></textarea>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Attachment (Optional)</label>
                                    <div className="flex items-center justify-center w-full">
                                        <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${file ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-blue-400'
                                            }`}>
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                {file ? (
                                                    <>
                                                        <FiCheck className="w-8 h-8 text-blue-600 mb-2" />
                                                        <p className="text-sm text-blue-600 font-semibold">{file.name}</p>
                                                        <p className="text-xs text-blue-500 mt-1 cursor-pointer" onClick={(e) => {
                                                            e.preventDefault();
                                                            setFile(null);
                                                        }}>Click to remove</p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <FiPaperclip className="w-8 h-8 text-gray-400 mb-2" />
                                                        <p className="text-sm text-gray-500 font-semibold"><span className="text-primary">Click to upload</span> or drag and drop</p>
                                                        <p className="text-xs text-gray-400 mt-1">PNG, JPG, PDF up to 10MB</p>
                                                    </>
                                                )}
                                            </div>
                                            <input type="file" className="hidden" onChange={(e) => setFile(e.target.files[0])} accept="image/*,.pdf" />
                                        </label>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100">
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full md:w-auto px-8 py-3 bg-primary text-white rounded-xl font-semibold shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {submitting ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <FiSend /> Submit Feedback
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </motion.div>
                )}

                {activeTab === 'history' && (
                    <motion.div
                        key="history"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4"
                    >
                        {loadingHistory ? (
                            <div className="text-center py-12 text-gray-500">Loading history...</div>
                        ) : history.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 shadow-sm">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FiMessageSquare className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">No feedback yet</h3>
                                <p className="text-gray-500 mt-1">You haven't submitted any feedback.</p>
                            </div>
                        ) : (
                            history.map((item) => (
                                <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:border-primary-200 transition-colors">
                                    <div className="flex justify-between items-start gap-4 mb-3">
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{item.title}</h3>
                                            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                                <span className="capitalize">{item.type.toLowerCase()}</span>
                                                <span>•</span>
                                                <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        {getStatusBadge(item.status)}
                                    </div>
                                    <div className="mt-3 p-4 bg-gray-50 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">
                                        {item.content}
                                    </div>
                                    {item.attachmentUrl && (
                                        <div className="mt-3">
                                            <a href={item.attachmentUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:opacity-80 text-sm font-medium flex items-center gap-1 w-fit">
                                                <FiPaperclip /> View Attachment
                                            </a>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
