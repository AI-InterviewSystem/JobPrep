import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    FiSearch, FiTag, FiUsers, FiDollarSign, FiMoreHorizontal, FiTrendingUp, FiActivity
} from 'react-icons/fi';
import { adminDashboardApi } from '../services/api';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    BarChart, Bar, Cell 
} from 'recharts';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await adminDashboardApi.getStats();
            setData(response.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    const { stats, revenueChart, userGrowthChart, topProducts, recentCustomers } = data;

    // Helper to format currency
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(value);
    };

    // Helper to format large numbers
    const formatNumber = (value) => {
        return new Intl.NumberFormat('en-US').format(value);
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 shadow-xl rounded-xl border border-slate-100">
                    <p className="text-xs font-bold text-gray-400 mb-1">{label}</p>
                    <p className="text-sm font-bold text-primary">
                        {payload[0].name === 'Revenue' ? formatCurrency(payload[0].value) : formatNumber(payload[0].value)}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Top Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Revenue Card */}
                <div className="bg-white p-6 rounded-[2rem] shadow-sm flex items-center gap-5 border border-slate-50">
                    <div className="w-16 h-16 rounded-2xl bg-teal-500 flex items-center justify-center text-white shadow-lg shadow-teal-100">
                        <FiTag className="text-2xl" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-gray-400 font-bold text-sm mb-1 uppercase tracking-wider">Total Revenue</h3>
                        <div className="flex items-end justify-between">
                            <div>
                                <p className="text-2xl font-black text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
                                <p className={`text-xs font-bold flex items-center gap-1 mt-1 ${stats.revenueGrowth >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {stats.revenueGrowth >= 0 ? '+' : ''}{stats.revenueGrowth.toFixed(1)}% 
                                    <span className="text-gray-400 font-normal">last 30 days</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Users Card */}
                <div className="bg-white p-6 rounded-[2rem] shadow-sm flex items-center gap-5 border border-slate-50">
                    <div className="w-16 h-16 rounded-2xl bg-sky-500 flex items-center justify-center text-white shadow-lg shadow-sky-100">
                        <FiUsers className="text-2xl" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-gray-400 font-bold text-sm mb-1 uppercase tracking-wider">Total Users</h3>
                        <div className="flex items-end justify-between">
                            <div>
                                <p className="text-2xl font-black text-gray-900">{formatNumber(stats.totalUsers)}</p>
                                <p className={`text-xs font-bold flex items-center gap-1 mt-1 ${stats.userGrowth >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {stats.userGrowth >= 0 ? '+' : ''}{stats.userGrowth.toFixed(1)}%
                                    <span className="text-gray-400 font-normal">last 30 days</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Avg Revenue Card */}
                <div className="bg-white p-6 rounded-[2rem] shadow-sm flex items-center gap-5 border border-slate-50">
                    <div className="w-16 h-16 rounded-2xl bg-rose-500 flex items-center justify-center text-white shadow-lg shadow-rose-100">
                        <FiDollarSign className="text-2xl" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-gray-400 font-bold text-sm mb-1 uppercase tracking-wider">Avg Order Value</h3>
                        <div className="flex items-end justify-between">
                            <div>
                                <p className="text-2xl font-black text-gray-900">{formatCurrency(stats.avgRevenuePerOrder)}</p>
                                <p className="text-xs text-emerald-500 font-bold flex items-center gap-1 mt-1">
                                    <FiActivity className="text-xs" />
                                    Active Platform
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Trend Chart */}
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-50">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="font-black text-xl text-gray-900">Revenue Trend</h3>
                            <p className="text-sm text-gray-400">Last 30 days performance</p>
                        </div>
                        <div className="px-4 py-2 bg-slate-50 rounded-2xl text-xs font-bold text-gray-500 border border-slate-100">
                            Monthly View
                        </div>
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueChart}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis 
                                    dataKey="label" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fill: '#94a3b8', fontSize: 10}}
                                    tickFormatter={(str) => {
                                        const date = new Date(str);
                                        return date.getDate();
                                    }}
                                />
                                <YAxis hide />
                                <Tooltip content={<CustomTooltip />} />
                                <Area 
                                    type="monotone" 
                                    dataKey="value" 
                                    name="Revenue"
                                    stroke="#4f46e5" 
                                    strokeWidth={3}
                                    fillOpacity={1} 
                                    fill="url(#colorRev)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* User Growth Chart */}
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-50">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="font-black text-xl text-gray-900">User Acquisition</h3>
                            <p className="text-sm text-gray-400">New signups per day</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <FiTrendingUp />
                        </div>
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={userGrowthChart}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis 
                                    dataKey="label" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fill: '#94a3b8', fontSize: 10}}
                                    tickFormatter={(str) => {
                                        const date = new Date(str);
                                        return date.getDate();
                                    }}
                                />
                                <YAxis hide />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="value" name="New Users" radius={[6, 6, 0, 0]}>
                                    {userGrowthChart.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#0ea5e9' : '#38bdf8'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top Selling Products */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-50">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="font-black text-xl text-gray-900">Top Performing Plans</h3>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiSearch className="text-gray-400 text-sm" />
                            </div>
                            <input 
                                type="text" 
                                placeholder="Search products..." 
                                className="bg-slate-50 border border-slate-200 rounded-full py-2 pl-9 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all w-48 focus:w-64"
                            />
                        </div>
                    </div>
                    <div className="overflow-x-auto -mx-2">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-gray-400 uppercase text-[10px] font-bold tracking-widest">
                                    <th className="pb-4 px-4">Plan Name</th>
                                    <th className="pb-4 px-4 text-center">Orders</th>
                                    <th className="pb-4 px-4 text-right">Revenue Generated</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {topProducts.length > 0 ? topProducts.map((product, idx) => (
                                    <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="py-5 px-4">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-sm ${idx === 0 ? 'bg-indigo-500' : idx === 1 ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                                                    {product.name.charAt(0)}
                                                </div>
                                                <span className="font-bold text-sm text-gray-900">{product.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-5 px-4 text-center">
                                            <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-gray-600">
                                                {product.orders}
                                            </span>
                                        </td>
                                        <td className="py-5 px-4 text-right">
                                            <span className="font-black text-sm text-gray-900">{formatCurrency(product.revenue)}</span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="3" className="py-10 text-center text-gray-400 italic text-sm">No sales data yet</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* New Customers */}
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-50">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="font-black text-xl text-gray-900">New Users</h3>
                        <button className="text-gray-300 hover:text-primary transition-colors">
                            <FiMoreHorizontal className="text-xl" />
                        </button>
                    </div>
                    <div className="space-y-4">
                        {recentCustomers.length > 0 ? recentCustomers.map((customer) => (
                            <div key={customer.id} className="flex justify-between items-center group bg-slate-50/50 p-4 rounded-2xl hover:bg-white hover:shadow-md transition-all cursor-pointer border border-transparent hover:border-slate-100">
                                <div className="flex items-center gap-4">
                                    <img 
                                        src={customer.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(customer.name)}&background=random`} 
                                        alt={customer.name} 
                                        className="w-12 h-12 rounded-2xl object-cover shadow-sm" 
                                    />
                                    <div>
                                        <h4 className="font-bold text-sm text-gray-900 group-hover:text-primary transition-colors">{customer.name}</h4>
                                        <p className="text-[10px] text-gray-400 font-medium truncate w-32">
                                            {customer.email}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Joined</p>
                                    <p className="text-[10px] font-black text-gray-900">
                                        {new Date(customer.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        )) : (
                            <div className="py-10 text-center text-gray-400 italic text-sm">No new users yet</div>
                        )}
                    </div>
                    <button className="w-full mt-6 py-4 rounded-2xl bg-primary/5 text-primary text-xs font-bold hover:bg-primary hover:text-white transition-all">
                        View All Users
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
