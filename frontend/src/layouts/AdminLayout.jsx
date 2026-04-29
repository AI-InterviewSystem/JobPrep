import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
    FiHome, FiFileText, FiGrid, FiShoppingCart, FiShield, 
    FiBell, FiCalendar, FiMessageSquare, FiLogOut, FiSearch,
    FiChevronDown
} from 'react-icons/fi';
import AvatarMenu from '../components/layout/AvatarMenu';

export default function AdminLayout() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event("jobprep:user-updated"));
        navigate('/login');
    };

    const getPageTitle = () => {
        if (location.pathname.includes('/admin/profile')) return 'Admin Profile';
        return 'Dashboard';
    };

    return (
        <div className="min-h-screen bg-slate-50 flex font-display text-gray-800">
            {/* Sidebar */}
            <aside className="w-64 bg-white m-4 rounded-[2rem] shadow-sm flex flex-col justify-between py-8 px-6 fixed h-[calc(100vh-2rem)] z-10">
                <div>
                    <Link to="/admin" className="flex items-center gap-3 mb-10 px-2 cursor-pointer">
                        <div className="bg-gradient-to-br from-primary to-primary-dark text-white p-2 rounded-full shadow-md">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-primary">JobPrep</h1>
                    </Link>

                    <nav className="space-y-2">
                        <Link to="/admin" className={`flex items-center gap-4 px-4 py-3 rounded-2xl font-medium transition-transform ${location.pathname === '/admin' || location.pathname === '/admin/dashboard' ? 'bg-primary text-white shadow-md shadow-primary/30 hover:scale-105' : 'text-gray-500 hover:bg-slate-100 hover:text-gray-900'}`}>
                            <FiHome className="text-lg" />
                            Home
                        </Link>
                         <a href="#" className="flex items-center gap-4 text-gray-500 px-4 py-3 rounded-2xl font-medium hover:bg-slate-100 hover:text-gray-900 transition-colors">
                            <FiFileText className="text-lg" />
                            Users
                        </a>

                        <a href="#" className="flex items-center gap-4 text-gray-500 px-4 py-3 rounded-2xl font-medium hover:bg-slate-100 hover:text-gray-900 transition-colors">
                            <FiGrid className="text-lg" />
                            Pricing Plan
                        </a>
                        <a href="#" className="flex items-center gap-4 text-gray-500 px-4 py-3 rounded-2xl font-medium hover:bg-slate-100 hover:text-gray-900 transition-colors">
                            <FiShoppingCart className="text-lg" />
                            Ecommerce
                        </a>
                        <a href="#" className="flex items-center gap-4 text-gray-500 px-4 py-3 rounded-2xl font-medium hover:bg-slate-100 hover:text-gray-900 transition-colors">
                            <FiBell className="text-lg" />
                            Notification
                        </a>
                        <a href="#" className="flex items-center gap-4 text-gray-500 px-4 py-3 rounded-2xl font-medium hover:bg-slate-100 hover:text-gray-900 transition-colors">
                            <FiMessageSquare className="text-lg" />
                            Feedback
                        </a>
                    </nav>
                </div>

                <button onClick={handleLogout} className="flex items-center gap-4 text-red-500 px-4 py-3 rounded-2xl font-medium hover:bg-red-50 transition-colors mt-auto w-full text-left">
                    <FiLogOut className="text-lg" />
                    Log out
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-[18rem] p-8 overflow-y-auto h-screen relative">
                {/* Header */}
                <header className="flex justify-between items-center mb-8 sticky top-0 bg-slate-50/80 backdrop-blur-sm z-10 py-2 -mx-2 px-2 rounded-2xl">
                    <h2 className="text-2xl font-bold text-gray-900">{getPageTitle()}</h2>
                    
                    <div className="flex flex-1 max-w-md mx-8">
                        <div className="relative w-full">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <FiSearch className="text-gray-400" />
                            </div>
                            <input 
                                type="text" 
                                placeholder="Search..." 
                                className="w-full bg-white border border-slate-200 rounded-full py-2 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 shadow-sm"
                            />
                        </div>
                    </div>

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
