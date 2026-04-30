import React, { useState, useEffect } from 'react';
import { adminPricingPlansApi } from '../services/api';
import { FiEdit2, FiTrash2, FiPlus, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function AdminPricingPlansPage() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPlan, setCurrentPlan] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        priceMonthly: '',
        priceYearly: '',
        features: '',
        isActive: true
    });

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const response = await adminPricingPlansApi.getAll();
            setPlans(response.data);
        } catch (error) {
            toast.error('Failed to load pricing plans');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (plan = null) => {
        if (plan) {
            setCurrentPlan(plan);
            setFormData({
                name: plan.name,
                description: plan.description,
                priceMonthly: plan.priceMonthly,
                priceYearly: plan.priceYearly,
                features: plan.features,
                isActive: plan.isActive
            });
        } else {
            setCurrentPlan(null);
            setFormData({
                name: '',
                description: '',
                priceMonthly: '',
                priceYearly: '',
                features: '',
                isActive: true
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentPlan(null);
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
            if (currentPlan) {
                await adminPricingPlansApi.update(currentPlan.id, formData);
                toast.success('Pricing plan updated successfully');
            } else {
                await adminPricingPlansApi.create(formData);
                toast.success('Pricing plan created successfully');
            }
            handleCloseModal();
            fetchPlans();
        } catch (error) {
            toast.error(currentPlan ? 'Failed to update plan' : 'Failed to create plan');
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this pricing plan?')) {
            try {
                await adminPricingPlansApi.delete(id);
                toast.success('Pricing plan deleted successfully');
                fetchPlans();
            } catch (error) {
                toast.error('Failed to delete pricing plan');
                console.error(error);
            }
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Pricing Plans</h3>
                <button 
                    onClick={() => handleOpenModal()}
                    className="bg-primary text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-primary-dark transition-colors shadow-md shadow-primary/30"
                >
                    <FiPlus /> Add Plan
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-gray-100 text-gray-500 font-medium">
                            <th className="pb-4 pl-4">Name</th>
                            <th className="pb-4">Monthly Price</th>
                            <th className="pb-4">Yearly Price</th>
                            <th className="pb-4">Status</th>
                            <th className="pb-4 pr-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {plans.map((plan) => (
                            <tr key={plan.id} className="hover:bg-slate-50 transition-colors">
                                <td className="py-4 pl-4 font-medium text-gray-800">{plan.name}</td>
                                <td className="py-4 text-gray-600">${plan.priceMonthly}</td>
                                <td className="py-4 text-gray-600">${plan.priceYearly}</td>
                                <td className="py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${plan.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {plan.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="py-4 pr-4 flex justify-end gap-2">
                                    <button 
                                        onClick={() => handleOpenModal(plan)}
                                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        <FiEdit2 />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(plan.id)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <FiTrash2 />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {plans.length === 0 && (
                            <tr>
                                <td colSpan="5" className="py-8 text-center text-gray-500">No pricing plans found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
                            <h3 className="text-xl font-bold text-gray-800">{currentPlan ? 'Edit Plan' : 'Add Plan'}</h3>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                                <FiX className="text-xl" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name</label>
                                <input 
                                    type="text" 
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea 
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="2"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                                ></textarea>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Price ($)</label>
                                    <input 
                                        type="number" 
                                        step="0.01"
                                        name="priceMonthly"
                                        value={formData.priceMonthly}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Yearly Price ($)</label>
                                    <input 
                                        type="number" 
                                        step="0.01"
                                        name="priceYearly"
                                        value={formData.priceYearly}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Features (JSON)</label>
                                <textarea 
                                    name="features"
                                    value={formData.features}
                                    onChange={handleInputChange}
                                    rows="4"
                                    placeholder='e.g. ["Feature 1", "Feature 2"]'
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-mono text-sm"
                                ></textarea>
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
                                    {currentPlan ? 'Update Plan' : 'Create Plan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
