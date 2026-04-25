import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import logo from "../assets/images/jobprep-logo.png"

export default function AdminDashboard() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-display">
            <main className="flex-1 max-w-7xl mx-auto w-full p-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <h3 className="text-gray-500 text-sm font-medium mb-1">Total Users</h3>
                        <p className="text-3xl font-bold text-gray-900">1,284</p>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <h3 className="text-gray-500 text-sm font-medium mb-1">Total Interviews</h3>
                        <p className="text-3xl font-bold text-gray-900">5,432</p>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <h3 className="text-gray-500 text-sm font-medium mb-1">Revenue</h3>
                        <p className="text-3xl font-bold text-gray-900">$12,450</p>
                    </div>
                </motion.div>

                <div className="mt-8 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="font-bold text-gray-900">Recent Users</h2>
                        <button className="text-sm text-primary font-medium">View All</button>
                    </div>
                    <div className="p-6">
                        <p className="text-gray-500 text-center italic">User management interface goes here...</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
