import React, { useEffect, useMemo, useState } from 'react';
import { adminJobsApi } from '../services/api';
import { FiBriefcase, FiEdit2, FiFolder, FiGrid, FiPlus, FiTrash2, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

const emptyForm = { name: '', description: '', isActive: true, jobGroupId: '', jobCategoryId: '' };

export default function AdminJobsPage() {
    const [groups, setGroups] = useState([]);
    const [categories, setCategories] = useState([]);
    const [roles, setRoles] = useState([]);
    const [selectedGroupId, setSelectedGroupId] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState({ open: false, type: 'group', item: null });
    const [formData, setFormData] = useState(emptyForm);
    const [deleteModal, setDeleteModal] = useState({ open: false, type: '', id: null });

    const visibleCategories = useMemo(
        () => selectedGroupId ? categories.filter(item => item.jobGroupId === selectedGroupId) : categories,
        [categories, selectedGroupId]
    );
    const visibleRoles = useMemo(
        () => selectedCategoryId ? roles.filter(item => item.jobCategoryId === selectedCategoryId) : roles,
        [roles, selectedCategoryId]
    );

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [groupRes, categoryRes, roleRes] = await Promise.all([
                adminJobsApi.getGroups(),
                adminJobsApi.getCategories(),
                adminJobsApi.getRoles()
            ]);
            setGroups(groupRes.data);
            setCategories(categoryRes.data);
            setRoles(roleRes.data);
        } catch (error) {
            toast.error('Failed to load jobs data');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (type, item = null) => {
        setModal({ open: true, type, item });
        setFormData({
            name: item?.name || '',
            description: item?.description || '',
            isActive: item?.isActive ?? true,
            jobGroupId: item?.jobGroupId || selectedGroupId || '',
            jobCategoryId: item?.jobCategoryId || selectedCategoryId || ''
        });
    };

    const closeModal = () => {
        setModal({ open: false, type: 'group', item: null });
        setFormData(emptyForm);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                name: formData.name,
                description: formData.description,
                isActive: formData.isActive
            };
            if (modal.type === 'category') payload.jobGroupId = formData.jobGroupId;
            if (modal.type === 'role') payload.jobCategoryId = formData.jobCategoryId;

            const apiMap = {
                group: ['createGroup', 'updateGroup'],
                category: ['createCategory', 'updateCategory'],
                role: ['createRole', 'updateRole']
            };
            const [createMethod, updateMethod] = apiMap[modal.type];
            if (modal.item) {
                await adminJobsApi[updateMethod](modal.item.id, payload);
                toast.success('Updated successfully');
            } else {
                await adminJobsApi[createMethod](payload);
                toast.success('Created successfully');
            }
            closeModal();
            fetchData();
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Save failed');
            console.error(error);
        }
    };

    const confirmDelete = async () => {
        try {
            const deleteMap = {
                group: 'deleteGroup',
                category: 'deleteCategory',
                role: 'deleteRole'
            };
            await adminJobsApi[deleteMap[deleteModal.type]](deleteModal.id);
            toast.success('Deleted successfully');
            setDeleteModal({ open: false, type: '', id: null });
            fetchData();
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Delete failed');
            console.error(error);
        }
    };

    const renderStatus = (active) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {active ? 'Active' : 'Inactive'}
        </span>
    );

    const renderActions = (type, item) => (
        <div className="flex justify-end gap-2">
            <button onClick={() => openModal(type, item)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg">
                <FiEdit2 />
            </button>
            <button onClick={() => setDeleteModal({ open: true, type, id: item.id })} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                <FiTrash2 />
            </button>
        </div>
    );

    const TableShell = ({ title, icon, actionLabel, onAdd, children }) => (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 min-w-0">
            <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">{icon}</div>
                    <h3 className="text-lg font-bold text-gray-900 truncate">{title}</h3>
                </div>
                <button onClick={onAdd} className="bg-primary text-white px-3 py-2 rounded-xl flex items-center gap-2 hover:bg-primary-dark text-sm">
                    <FiPlus /> {actionLabel}
                </button>
            </div>
            {children}
        </div>
    );

    if (loading) {
        return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <TableShell title="Job Groups" icon={<FiGrid />} actionLabel="Group" onAdd={() => openModal('group')}>
                    <div className="space-y-2">
                        {groups.map(group => (
                            <button key={group.id} onClick={() => { setSelectedGroupId(String(group.id)); setSelectedCategoryId(''); }} className={`w-full text-left p-4 rounded-xl border transition-colors ${selectedGroupId === String(group.id) ? 'border-primary bg-primary/5' : 'border-gray-100 hover:bg-slate-50'}`}>
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="font-bold text-gray-900 truncate">{group.name}</p>
                                        <p className="text-sm text-gray-500 line-clamp-2">{group.description || 'No description'}</p>
                                        <div className="mt-2">{renderStatus(group.isActive)}</div>
                                    </div>
                                    {renderActions('group', group)}
                                </div>
                            </button>
                        ))}
                        {groups.length === 0 && <p className="py-8 text-center text-gray-500">No groups found.</p>}
                    </div>
                </TableShell>

                <TableShell title="Job Categories" icon={<FiFolder />} actionLabel="Category" onAdd={() => openModal('category')}>
                    <div className="mb-3">
                        <select value={selectedGroupId} onChange={(e) => { setSelectedGroupId(e.target.value); setSelectedCategoryId(''); }} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none">
                            <option value="">All groups</option>
                            {groups.map(group => <option key={group.id} value={group.id}>{group.name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        {visibleCategories.map(category => (
                            <button key={category.id} onClick={() => setSelectedCategoryId(String(category.id))} className={`w-full text-left p-4 rounded-xl border transition-colors ${selectedCategoryId === String(category.id) ? 'border-primary bg-primary/5' : 'border-gray-100 hover:bg-slate-50'}`}>
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="font-bold text-gray-900 truncate">{category.name}</p>
                                        <p className="text-xs text-gray-400">{category.jobGroupName}</p>
                                        <p className="text-sm text-gray-500 line-clamp-2">{category.description || 'No description'}</p>
                                        <div className="mt-2">{renderStatus(category.isActive)}</div>
                                    </div>
                                    {renderActions('category', category)}
                                </div>
                            </button>
                        ))}
                        {visibleCategories.length === 0 && <p className="py-8 text-center text-gray-500">No categories found.</p>}
                    </div>
                </TableShell>

                <TableShell title="Specialist Roles" icon={<FiBriefcase />} actionLabel="Role" onAdd={() => openModal('role')}>
                    <div className="mb-3">
                        <select value={selectedCategoryId} onChange={(e) => setSelectedCategoryId(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none">
                            <option value="">All categories</option>
                            {visibleCategories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        {visibleRoles.map(role => (
                            <div key={role.id} className="p-4 rounded-xl border border-gray-100 hover:bg-slate-50">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="font-bold text-gray-900 truncate">{role.name}</p>
                                        <p className="text-xs text-gray-400">{role.jobGroupName} / {role.jobCategoryName}</p>
                                        <p className="text-sm text-gray-500 line-clamp-2">{role.description || 'No description'}</p>
                                        <div className="mt-2">{renderStatus(role.isActive)}</div>
                                    </div>
                                    {renderActions('role', role)}
                                </div>
                            </div>
                        ))}
                        {visibleRoles.length === 0 && <p className="py-8 text-center text-gray-500">No roles found.</p>}
                    </div>
                </TableShell>
            </div>

            {modal.open && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-800">{modal.item ? 'Edit' : 'Add'} {modal.type}</h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><FiX className="text-xl" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {modal.type === 'category' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Group</label>
                                    <select required name="jobGroupId" value={formData.jobGroupId} onChange={(e) => setFormData(prev => ({ ...prev, jobGroupId: e.target.value }))} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none">
                                        <option value="">Select group</option>
                                        {groups.map(group => <option key={group.id} value={group.id}>{group.name}</option>)}
                                    </select>
                                </div>
                            )}
                            {modal.type === 'role' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Category</label>
                                    <select required name="jobCategoryId" value={formData.jobCategoryId} onChange={(e) => setFormData(prev => ({ ...prev, jobCategoryId: e.target.value }))} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none">
                                        <option value="">Select category</option>
                                        {categories.map(category => <option key={category.id} value={category.id}>{category.jobGroupName} / {category.name}</option>)}
                                    </select>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input required name="name" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea rows="3" name="description" value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none resize-none" />
                            </div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))} className="w-4 h-4 text-primary rounded border-gray-300" />
                                Active
                            </label>
                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={closeModal} className="px-5 py-2 border border-gray-200 text-gray-600 rounded-xl">Cancel</button>
                                <button type="submit" className="px-5 py-2 bg-primary text-white rounded-xl">{modal.item ? 'Update' : 'Create'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {deleteModal.open && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
                        <h3 className="font-black text-gray-900 mb-2">Delete {deleteModal.type}</h3>
                        <p className="text-sm text-gray-600 mb-6">This will remove the selected item. Records with child data may need children removed first.</p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setDeleteModal({ open: false, type: '', id: null })} className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm">Cancel</button>
                            <button onClick={confirmDelete} className="px-5 py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
