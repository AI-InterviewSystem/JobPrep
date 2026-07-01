import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    FiHome, FiGrid, FiShoppingCart, FiShield,
    FiBell, FiCalendar, FiMessageSquare, FiLogOut,
    FiChevronDown,
    FiUser, FiBriefcase, FiTag, FiBarChart2, FiFileText, FiBookOpen
} from 'react-icons/fi';
import AvatarMenu from '../components/layout/AvatarMenu';
import logo from '../assets/images/jobprep-logo.png';
import { storage } from '../services/storage';

export default function AdminLayout() {
    const user = storage.getUser() || {};
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        storage.clearAuth();
        window.dispatchEvent(new Event("jobprep:user-updated"));
        navigate('/login');
    };

    const getPageTitle = () => {
        if (location.pathname.includes('/admin/profile')) return 'Admin Profile';
        if (location.pathname.includes('/admin/interviews')) return 'Interview Sessions';
        if (location.pathname.includes('/admin/reports')) return 'Reports & Analytics';
        if (location.pathname.includes('/admin/pricing-plans')) return 'Pricing Plans';
        if (location.pathname.includes('/admin/users')) return 'Users';
        if (location.pathname.includes('/admin/jobs')) return 'Jobs Management';
        if (location.pathname.includes('/admin/question-bank')) return 'Question Bank';
        if (location.pathname.includes('/admin/experience-levels')) return 'Experience Levels';
        if (location.pathname.includes('/admin/promos')) return 'Promotions';
        if (location.pathname.includes('/admin/feedbacks')) return 'Feedback Management';
        return 'Dashboard';
    };

    return (
        <div className="min-h-screen bg-slate-50 flex font-display text-gray-800">
            {/* Sidebar */}
            <aside className="w-64 bg-white m-4 rounded-[2rem] shadow-sm flex flex-col py-8 px-6 fixed h-[calc(100vh-2rem)] z-10 overflow-hidden">
                <div className="flex min-h-0 flex-1 flex-col">
                    <Link to="/admin" className="flex shrink-0 items-center gap-3 mb-8 px-2 cursor-pointer">
                        <img src={logo} alt="JobPrep Logo" className="h-8" />
                        <h1 className="text-2xl font-bold tracking-tight text-primary">JobPrep</h1>
                    </Link>

                    <nav className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1 pb-4">
                        <Link to="/admin" className={`flex items-center gap-4 px-4 py-3 rounded-2xl font-medium transition-transform ${location.pathname === '/admin' || location.pathname === '/admin/dashboard' ? 'bg-primary text-white shadow-md shadow-primary/30 hover:scale-105' : 'text-gray-500 hover:bg-slate-100 hover:text-gray-900'}`}>
                            <FiHome className="text-lg" />
                            Home
                        </Link>
                        <div className="pt-3 pb-1 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Admin Management</div>
                        <Link to="/admin/users" className={`flex items-center gap-4 px-4 py-3 rounded-2xl font-medium transition-transform ${location.pathname.includes('/admin/users') ? 'bg-primary text-white shadow-md shadow-primary/30 hover:scale-105' : 'text-gray-500 hover:bg-slate-100 hover:text-gray-900'}`}>
                            <FiUser className="text-lg" />
                            Users
                        </Link>
                        <Link to="/admin/interviews" className={`flex items-center gap-4 px-4 py-3 rounded-2xl font-medium transition-transform ${location.pathname.includes('/admin/interviews') ? 'bg-primary text-white shadow-md shadow-primary/30 hover:scale-105' : 'text-gray-500 hover:bg-slate-100 hover:text-gray-900'}`}>
                            <FiBarChart2 className="text-lg" />
                            Interviews
                        </Link>
                        <Link to="/admin/reports" className={`flex items-center gap-4 px-4 py-3 rounded-2xl font-medium transition-transform ${location.pathname.includes('/admin/reports') ? 'bg-primary text-white shadow-md shadow-primary/30 hover:scale-105' : 'text-gray-500 hover:bg-slate-100 hover:text-gray-900'}`}>
                            <FiFileText className="text-lg" />
                            Reports
                        </Link>
                        <div className="pt-3 pb-1 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Configuration</div>
                        <Link to="/admin/jobs" className={`flex items-center gap-4 px-4 py-3 rounded-2xl font-medium transition-transform ${location.pathname.includes('/admin/jobs') ? 'bg-primary text-white shadow-md shadow-primary/30 hover:scale-105' : 'text-gray-500 hover:bg-slate-100 hover:text-gray-900'}`}>
                            <FiGrid className="text-lg" />
                            Jobs
                        </Link>
                        <Link to="/admin/question-bank" className={`flex items-center gap-4 px-4 py-3 rounded-2xl font-medium transition-transform ${location.pathname.includes('/admin/question-bank') ? 'bg-primary text-white shadow-md shadow-primary/30 hover:scale-105' : 'text-gray-500 hover:bg-slate-100 hover:text-gray-900'}`}>
                            <FiBookOpen className="text-lg" />
                            Questions
                        </Link>
                        <Link to="/admin/experience-levels" className={`flex items-center gap-4 px-4 py-3 rounded-2xl font-medium transition-transform ${location.pathname.includes('/admin/experience-levels') ? 'bg-primary text-white shadow-md shadow-primary/30 hover:scale-105' : 'text-gray-500 hover:bg-slate-100 hover:text-gray-900'}`}>
                            <FiBriefcase className="text-lg" />
                            Exp Levels
                        </Link>
                        <Link to="/admin/promos" className={`flex items-center gap-4 px-4 py-3 rounded-2xl font-medium transition-transform ${location.pathname.includes('/admin/promos') ? 'bg-primary text-white shadow-md shadow-primary/30 hover:scale-105' : 'text-gray-500 hover:bg-slate-100 hover:text-gray-900'}`}>
                            <FiTag className="text-lg" />
                            Promotions
                        </Link>

                        <Link to="/admin/pricing-plans" className={`flex items-center gap-4 px-4 py-3 rounded-2xl font-medium transition-transform ${location.pathname.includes('/admin/pricing-plans') ? 'bg-primary text-white shadow-md shadow-primary/30 hover:scale-105' : 'text-gray-500 hover:bg-slate-100 hover:text-gray-900'}`}>
                            <FiShoppingCart className="text-lg" />
                            Pricing Plan
                        </Link>
                        <Link to="/admin/feedbacks" className={`flex items-center gap-4 px-4 py-3 rounded-2xl font-medium transition-transform ${location.pathname.includes('/admin/feedbacks') ? 'bg-primary text-white shadow-md shadow-primary/30 hover:scale-105' : 'text-gray-500 hover:bg-slate-100 hover:text-gray-900'}`}>
                            <FiMessageSquare className="text-lg" />
                            Feedback
                        </Link>
                    </nav>
                </div>

                <button onClick={handleLogout} className="mt-4 flex shrink-0 items-center gap-4 text-red-500 px-4 py-3 rounded-2xl font-medium hover:bg-red-50 transition-colors w-full text-left">
                    <FiLogOut className="text-lg" />
                    Log out
                </button>
            </aside>

            {/* Main Content */}
            <main className="ml-[18rem] min-h-screen w-[calc(100vw-18rem)] min-w-0 overflow-x-hidden p-8 relative">
                {/* Header */}
                <header className="flex justify-between items-center mb-8 sticky top-0 bg-slate-50/80 backdrop-blur-sm z-10 py-2 -mx-2 px-2 rounded-2xl">
                    <h2 className="text-2xl font-bold text-gray-900">{getPageTitle()}</h2>

                    <div className="flex items-center gap-6">
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 shrink-0">
                            <img src="https://flagcdn.com/w40/gb.png" alt="English" className="w-full h-full object-cover" />
                        </div>
                        <div className="relative shrink-0">
                            <FiBell className="text-xl text-gray-600" />
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">3</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                            <span className="font-medium text-sm text-gray-700 hidden sm:block">{user?.fullName || user?.full_name || 'Admin User'}</span>
                            <AvatarMenu />
                        </div>
                    </div>
                </header>

                <div className="pb-10">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

