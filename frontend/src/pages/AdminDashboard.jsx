import React from 'react';
import { motion } from 'framer-motion';
import { 
    FiSearch, FiTag, FiUsers, FiDollarSign, FiMoreHorizontal, FiPieChart, FiTrendingUp
} from 'react-icons/fi';

const topProducts = [
    { id: 1, name: 'Premium Plan', orders: 124, price: '$49.00', ads: '$12.00', refunds: 2, image: 'https://ui-avatars.com/api/?name=P&background=e0e7ff&color=4f46e5' },
    { id: 2, name: 'Basic Plan', orders: 86, price: '$19.00', ads: '$5.00', refunds: 0, image: 'https://ui-avatars.com/api/?name=B&background=dcfce7&color=16a34a' },
    { id: 3, name: 'Enterprise', orders: 42, price: '$199.00', ads: '$45.00', refunds: 1, image: 'https://ui-avatars.com/api/?name=E&background=fef3c7&color=d97706' },
];

const newCustomers = [
    { id: 1, name: 'Roselle Ehrman', location: 'Brazil', avatar: 'https://ui-avatars.com/api/?name=Roselle+Ehrman&background=random' },
    { id: 2, name: 'James Smith', location: 'USA', avatar: 'https://ui-avatars.com/api/?name=James+Smith&background=random' },
    { id: 3, name: 'Linda Doe', location: 'UK', avatar: 'https://ui-avatars.com/api/?name=Linda+Doe&background=random' },
];

export default function AdminDashboard() {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Top Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Sales Card */}
                <div className="bg-white p-6 rounded-[2rem] shadow-sm flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-teal-400 flex items-center justify-center text-white shadow-lg shadow-teal-200">
                        <FiTag className="text-2xl" />
                    </div>
                    <div>
                        <h3 className="text-gray-900 font-bold text-lg mb-1">Sales</h3>
                        <p className="text-gray-500 text-xs mb-2">May 2026</p>
                        <div className="flex items-end gap-2">
                            <p className="text-2xl font-bold text-gray-900">$230,220</p>
                            <p className="text-sm text-primary font-medium flex items-center mb-1">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                                +55% last month
                            </p>
                        </div>
                    </div>
                </div>

                {/* Customers Card */}
                <div className="bg-white p-6 rounded-[2rem] shadow-sm flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-sky-400 flex items-center justify-center text-white shadow-lg shadow-sky-200">
                        <FiUsers className="text-2xl" />
                    </div>
                    <div>
                        <h3 className="text-gray-900 font-bold text-lg mb-1">Customers</h3>
                        <p className="text-gray-500 text-xs mb-2">May 2026</p>
                        <div className="flex items-end gap-2">
                            <p className="text-2xl font-bold text-gray-900">3,200</p>
                            <p className="text-sm text-primary font-medium flex items-center mb-1">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                                +12% last month
                            </p>
                        </div>
                    </div>
                </div>

                {/* Avg Revenue Card */}
                <div className="bg-white p-6 rounded-[2rem] shadow-sm flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-red-400 flex items-center justify-center text-white shadow-lg shadow-red-200">
                        <FiDollarSign className="text-2xl" />
                    </div>
                    <div>
                        <h3 className="text-gray-900 font-bold text-lg mb-1">Avg Revenue</h3>
                        <p className="text-gray-500 text-xs mb-2">May 2026</p>
                        <div className="flex items-end gap-2">
                            <p className="text-2xl font-bold text-gray-900">$2,300</p>
                            <p className="text-sm text-primary font-medium flex items-center mb-1">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                                +210% last month
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Middle Charts Grid Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-[2rem] shadow-sm flex flex-col justify-center items-center h-72">
                    <FiTrendingUp className="text-4xl text-gray-300 mb-4" />
                    <p className="text-gray-500 font-medium text-sm">Revenue chart will be displayed here</p>
                </div>
                <div className="bg-white p-6 rounded-[2rem] shadow-sm flex flex-col justify-center items-center h-72">
                    <FiPieChart className="text-4xl text-gray-300 mb-4" />
                    <p className="text-gray-500 font-medium text-sm">Visitor breakdown chart</p>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top Selling Product Table */}
                <div className="lg:col-span-2 bg-white p-6 rounded-[2rem] shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg text-gray-900">Top Selling Product</h3>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiSearch className="text-gray-400 text-sm" />
                            </div>
                            <input 
                                type="text" 
                                placeholder="Search..." 
                                className="bg-slate-50 border border-slate-200 rounded-full py-2 pl-9 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="py-3 px-2 text-sm font-bold text-gray-900">Product</th>
                                    <th className="py-3 px-2 text-sm font-bold text-gray-900">Orders</th>
                                    <th className="py-3 px-2 text-sm font-bold text-gray-900">Price</th>
                                    <th className="py-3 px-2 text-sm font-bold text-gray-900">Ads Spent</th>
                                    <th className="py-3 px-2 text-sm font-bold text-gray-900">Refunds</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topProducts.map((product) => (
                                    <tr key={product.id} className="border-b border-gray-50 last:border-0 hover:bg-slate-50 transition-colors">
                                        <td className="py-3 px-2">
                                            <div className="flex items-center gap-3">
                                                <img src={product.image} alt={product.name} className="w-8 h-8 rounded-lg object-cover" />
                                                <span className="font-medium text-sm text-gray-900">{product.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-2 text-sm text-gray-500 font-medium">{product.orders}</td>
                                        <td className="py-3 px-2 text-sm font-bold text-gray-900">{product.price}</td>
                                        <td className="py-3 px-2 text-sm text-gray-500 font-medium">{product.ads}</td>
                                        <td className="py-3 px-2 text-sm text-gray-500 font-medium">{product.refunds}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* New Customers */}
                <div className="bg-white p-6 rounded-[2rem] shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg text-gray-900">New Customers</h3>
                        <button className="text-gray-400 hover:text-gray-600 transition-colors">
                            <FiMoreHorizontal className="text-xl" />
                        </button>
                    </div>
                    <div className="space-y-4">
                        {newCustomers.map((customer) => (
                            <div key={customer.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl hover:bg-primary/5 transition-colors cursor-pointer border border-transparent hover:border-primary/10">
                                <div className="flex items-center gap-3">
                                    <img src={customer.avatar} alt={customer.name} className="w-10 h-10 rounded-full object-cover shadow-sm" />
                                    <div>
                                        <h4 className="font-bold text-sm text-gray-900">{customer.name}</h4>
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            <span className="w-1 h-1 bg-gray-300 rounded-full inline-block"></span>
                                            {customer.location}
                                        </p>
                                    </div>
                                </div>
                                <button className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-primary shadow-sm border border-gray-100 hover:bg-primary hover:text-white transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
