import React, { useState, useEffect } from 'react';
import { adminExperienceLevelsApi } from '../services/api';
import { FiEdit2, FiTrash2, FiPlus, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function AdminExperienceLevelsPage() {
    const [levels, setLevels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
    const [currentLevel, setCurrentLevel] = useState(null);
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        description: '',
        minYears: '',
        maxYears: '',
        displayOrder: 0,
        isActive: true
    });

    useEffect(() => {
        fetchLevels();
    }, []);

    const fetchLevels = async () => {
        try {
            const response = await adminExperienceLevelsApi.getAll();
            setLevels(response.data);
        } catch (error) {
            toast.error('Failed to load experience levels');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (level = null) => {
        if (level) {
            setCurrentLevel(level);
            setFormData({
                code: level.code,
                name: level.name,
                description: level.description || '',
                minYears: level.minYears || '',
                maxYears: level.maxYears || '',
                displayOrder: level.displayOrder || 0,
                isActive: level.isActive
            });
        } else {
            setCurrentLevel(null);
            setFormData({
                code: '',
                name: '',
                description: '',
                minYears: '',
                maxYears: '',
                displayOrder: 0,
                isActive: true
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentLevel(null);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Convert empty strings to null for decimals
            const submitData = {
                ...formData,
                minYears: formData.minYears === '' ? null : Number(formData.minYears),
                maxYears: formData.maxYears === '' ? null : Number(formData.maxYears),
                displayOrder: Number(formData.displayOrder)
            };

            if (currentLevel) {
                await adminExperienceLevelsApi.update(currentLevel.id, submitData);
                toast.success('Experience level updated successfully');
            } else {
                await adminExperienceLevelsApi.create(submitData);
                toast.success('Experience level created successfully');
            }
            handleCloseModal();
            fetchLevels();
        } catch (error) {
            toast.error(currentLevel ? 'Failed to update level' : 'Failed to create level');
            console.error(error);
        }
    };

    const handleDeleteClick = (id) => setDeleteModal({ open: true, id });
    const closeDeleteModal = () => setDeleteModal({ open: false, id: null });

    const handleDeleteConfirm = async () => {
        if (!deleteModal.id) return;
        try {
            await adminExperienceLevelsApi.delete(deleteModal.id);
            toast.success('Experience level deleted successfully');
            closeDeleteModal();
            fetchLevels();
        } catch (error) {
            toast.error('Failed to delete experience level');
            console.error(error);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Experience Levels</h3>
                <button 
                    onClick={() => handleOpenModal()}
                    className="bg-primary text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-primary-dark transition-colors shadow-md shadow-primary/30"
                >
                    <FiPlus /> Add Level
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-gray-100 text-gray-500 font-medium">
                            <th className="pb-4 pl-4">Order</th>
                            <th className="pb-4">Code</th>
                            <th className="pb-4">Name</th>
                            <th className="pb-4">Years</th>
                            <th className="pb-4">Status</th>
                            <th className="pb-4 pr-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {levels.map((level) => (
                            <tr key={level.id} className="hover:bg-slate-50 transition-colors">
                                <td className="py-4 pl-4 font-medium text-gray-800">{level.displayOrder}</td>
                                <td className="py-4 text-gray-600">{level.code}</td>
                                <td className="py-4 font-medium text-gray-800">{level.name}</td>
                                <td className="py-4 text-gray-600">
                                    {level.minYears != null ? level.minYears : 0} - {level.maxYears != null ? level.maxYears : 'Any'} years
                                </td>
                                <td className="py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${level.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {level.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="py-4 pr-4 flex justify-end gap-2">
                                    <button 
                                        onClick={() => handleOpenModal(level)}
                                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        <FiEdit2 />
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteClick(level.id)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <FiTrash2 />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {levels.length === 0 && (
                            <tr>
                                <td colSpan="6" className="py-8 text-center text-gray-500">No experience levels found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Edit/Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
                            <h3 className="text-xl font-bold text-gray-800">{currentLevel ? 'Edit Level' : 'Add Level'}</h3>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                                <FiX className="text-xl" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                                    <input 
                                        type="text" 
                                        name="code"
                                        value={formData.code}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="e.g. INTERN"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input 
                                        type="text" 
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="e.g. Intern"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea 
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="2"
                                    placeholder="e.g. Still in university or recent grad"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                                ></textarea>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Years</label>
                                    <input 
                                        type="number" 
                                        step="0.1"
                                        name="minYears"
                                        value={formData.minYears}
                                        onChange={handleInputChange}
                                        placeholder="0"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Years</label>
                                    <input 
                                        type="number" 
                                        step="0.1"
                                        name="maxYears"
                                        value={formData.maxYears}
                                        onChange={handleInputChange}
                                        placeholder="1"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                                    <input 
                                        type="number" 
                                        name="displayOrder"
                                        value={formData.displayOrder}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input 
                                    type="checkbox" 
                                    id="isActive"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleInputChange}
                                    className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                                />
                                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active Status</label>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button 
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-6 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors shadow-md shadow-primary/30"
                                >
                                    {currentLevel ? 'Update Level' : 'Create Level'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {deleteModal.open && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                                    <FiTrash2 className="text-red-500 text-lg" />
                                </div>
                                <div>
                                    <h3 className="font-black text-gray-900">Delete Level</h3>
                                </div>
                            </div>
                            <button onClick={closeDeleteModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <FiX className="text-xl" />
                            </button>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-gray-600">
                                Are you sure you want to delete this experience level? This action cannot be undone.
                            </p>
                        </div>
                        <div className="p-6 pt-0 flex justify-end gap-3">
                            <button
                                onClick={closeDeleteModal}
                                className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                className="px-5 py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-colors flex items-center gap-2"
                            >
                                <FiTrash2 className="text-sm" />
                                Confirm Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
