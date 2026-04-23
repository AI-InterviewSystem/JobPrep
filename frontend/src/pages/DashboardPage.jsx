import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import logo from "../assets/images/jobprep-logo.png"

export default function DashboardPage() {
    return (
        <div className="bg-[#f8fafc] font-display text-slate-900 min-h-screen">
            <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden">
                <div className="layout-container flex h-full grow flex-col">
                    {/* TopNavBar */}
                    <header className="flex items-center justify-between border-b border-primary/10 bg-white px-6 lg:px-8 h-20 shrink-0 sticky top-0 z-50">
                        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Link to="/" className="flex items-center gap-2">
                                    <img src={logo} alt="JobPrep" className="h-8 w-auto" />
                                    <span className="text-xl font-bold text-primary">JobPrep</span>
                                </Link>
                            </div>

                            <div className="hidden md:flex items-center gap-8">
                                <Link to="/dashboard" className="text-sm font-bold text-primary">Dashboard</Link>
                                <Link to="/practice" className="text-sm font-medium text-[#0e141b] hover:text-primary transition-all">Practice</Link>
                                <Link to="/reports" className="text-sm font-medium text-[#0e141b] hover:text-primary transition-all">Reports</Link>
                                <Link to="/pricing" className="text-sm font-medium text-[#0e141b] hover:text-primary transition-all">Pricing</Link>
                            </div>

                            <div className="flex items-center gap-4">
                                <button className="bg-primary/5 hover:bg-primary/10 text-primary px-5 py-2 rounded-xl text-sm font-bold transition-all">
                                    Profile
                                </button>
                                <div className="h-10 w-10 rounded-full border-2 border-primary/20 p-0.5 overflow-hidden bg-slate-200 cursor-pointer">
                                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" alt="Avatar" className="h-full w-full rounded-full object-cover" />
                                </div>
                            </div>
                        </div>
                    </header>

                    <main className="flex-1 pb-12">
                        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 space-y-8">
                            {/* Welcome Banner */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="flex flex-col md:flex-row overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="md:w-1/4 bg-[#dbeafe] flex items-center justify-center p-8">
                                    <div className="text-primary">
                                        <span className="material-symbols-outlined" style={{ fontSize: '120px' }}>celebration</span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-3 p-10 flex-1">
                                    <div className="flex flex-col">
                                        <p className="text-[#4e7397] text-xs font-bold uppercase tracking-widest mb-1">OVERVIEW</p>
                                        <h1 className="text-[#0e141b] text-4xl font-black">Welcome back, Alex!</h1>
                                    </div>
                                    <p className="text-[#4e7397] text-lg font-medium leading-relaxed max-w-2xl">
                                        You've completed 12 practice sessions this month. Your preparation streak is <span className="text-primary font-bold">5 days</span>. Keep the momentum going!
                                    </p>
                                    <div className="flex items-center gap-6 mt-4">
                                        <Link to="/interview-setup" className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                                            Resume Practice
                                        </Link>
                                        <div className="flex items-center gap-2 text-[#4e7397]">
                                            <span className="material-symbols-outlined text-xl">schedule</span>
                                            <span className="text-sm font-medium">Last active 2h ago</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Main Content Grid */}
                            <div className="grid lg:grid-cols-12 gap-8 items-start">
                                {/* Left Column: Work & Performance */}
                                <div className="lg:col-span-8 space-y-8">
                                    {/* Start New Interview */}
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.5, delay: 0.1 }}
                                        className="flex flex-col gap-6 rounded-3xl bg-[#0d1d2f] p-10 text-white shadow-2xl shadow-blue-900/10"
                                    >
                                        <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-3xl">videocam</span>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <h2 className="text-4xl font-black tracking-tight">Start New Mock Interview</h2>
                                            <p className="text-slate-400 text-lg leading-relaxed max-w-xl">
                                                Practice with our AI-powered interviewer specialized in 50+ job roles including Product Management, SWE, and Marketing.
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4 mt-4">
                                            <Link to="/interview-setup" className="bg-primary hover:bg-primary-dark text-white px-10 py-4 rounded-xl font-bold shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                                                Start Now
                                            </Link>
                                            <button className="bg-white/10 hover:bg-white/20 text-white px-10 py-4 rounded-xl font-bold transition-all border border-white/10">
                                                View Roles
                                            </button>
                                        </div>
                                    </motion.div>

                                    {/* Performance Section */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 0.3 }}
                                        className="flex flex-col gap-6 rounded-3xl border border-[#e2e8f0] bg-white p-10 shadow-sm"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-[#0e141b] text-2xl font-black">Your Performance</h3>
                                                <p className="text-[#4e7397] font-medium">Skills growth over the last 30 days</p>
                                            </div>
                                            <select className="bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold py-2.5 px-4 outline-none">
                                                <option>Last 30 Days</option>
                                            </select>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                            {[
                                                { label: "COMMUNICATION", val: "84%" },
                                                { label: "TECHNICAL KNOWLEDGE", val: "72%" },
                                                { label: "CONFIDENCE", val: "91%" },
                                                { label: "PROBLEM SOLVING", val: "65%" },
                                            ].map((skill, i) => (
                                                <div key={i} className="flex flex-col gap-3 p-4 bg-slate-50 rounded-2xl">
                                                    <p className="text-[#4e7397] text-[10px] font-black uppercase tracking-widest">{skill.label}</p>
                                                    <p className="text-[#0e141b] text-2xl font-black">{skill.val}</p>
                                                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: skill.val }}
                                                            transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                                                            className="h-full bg-primary"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Abstract Bar Chart */}
                                        <div className="h-40 flex items-end gap-3 mt-6 px-4">
                                            {[20, 35, 25, 45, 40, 65, 55, 95, 90].map((h, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ height: 0 }}
                                                    animate={{ height: `${h}%` }}
                                                    transition={{ duration: 0.8, delay: 0.8 + i * 0.05 }}
                                                    className={`flex-1 rounded-t-xl ${i > 6 ? 'bg-primary' : 'bg-primary/20'}`}
                                                />
                                            ))}
                                        </div>
                                    </motion.div>
                                </div>

                                {/* Right Column: Sessions & Analytics */}
                                <div className="lg:col-span-4 space-y-8">
                                    {/* Recent Sessions */}
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.5, delay: 0.2 }}
                                        className="flex flex-col gap-6 rounded-3xl border border-[#e2e8f0] bg-white p-8 shadow-sm"
                                    >
                                        <div className="flex items-center justify-between px-2">
                                            <h2 className="text-[#0e141b] text-xl font-bold">Recent Sessions</h2>
                                            <button className="text-primary text-sm font-bold hover:underline">View All</button>
                                        </div>
                                        <div className="flex flex-col gap-3">
                                            {[
                                                { role: "Software Engineer", time: "Yesterday • 15:40", score: "8.5 / 10", color: "bg-[#e7f3ff] text-primary", icon: "code" },
                                                { role: "Product Manager", time: "Oct 24 • 09:15", score: "7.2 / 10", color: "bg-[#f5e7ff] text-[#8a2be2]", icon: "dashboard" },
                                                { role: "Marketing Lead", time: "Oct 22 • 11:00", score: "9.0 / 10", color: "bg-[#fff2e7] text-[#ff8c00]", icon: "campaign" },
                                            ].map((session, i) => (
                                                <motion.div
                                                    key={i}
                                                    whileHover={{ x: 6 }}
                                                    className="flex items-center gap-4 group cursor-pointer hover:bg-slate-50 p-3 rounded-2xl transition-all border border-transparent hover:border-slate-100"
                                                >
                                                    <div className={`h-11 w-11 flex items-center justify-center rounded-xl ${session.color} shadow-sm group-hover:shadow-md transition-shadow`}>
                                                        <span className="material-symbols-outlined text-2xl">{session.icon}</span>
                                                    </div>
                                                    <div className="flex flex-1 flex-col">
                                                        <span className="text-[#0e141b] text-[15px] font-bold group-hover:text-primary transition-colors">{session.role}</span>
                                                        <span className="text-[#4e7397] text-xs font-medium">{session.time}</span>
                                                    </div>
                                                    <div className="px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-[#0e141b] text-[11px] font-black">
                                                        {session.score}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                        <button className="w-full py-4 rounded-2xl border border-[#e2e8f0] text-[#4e7397] text-sm font-bold hover:bg-slate-50 transition-all mt-2">
                                            Download All Reports
                                        </button>
                                    </motion.div>

                                    {/* Practice Time Widget */}
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.5, delay: 0.4 }}
                                        className="flex flex-col justify-between rounded-3xl bg-primary p-8 text-white shadow-xl shadow-primary/20 bg-gradient-to-br from-primary to-primary-dark"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex flex-col gap-1">
                                                <p className="text-white/70 text-sm font-bold uppercase tracking-widest">Practice Time</p>
                                                <h2 className="text-5xl font-black">24.5h</h2>
                                            </div>
                                            <div className="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-3xl">timer</span>
                                            </div>
                                        </div>
                                        <div className="mt-8 pt-6 border-t border-white/10">
                                            <p className="text-white/80 text-sm font-medium flex items-center gap-2">
                                                <span className="material-symbols-outlined text-lg">trending_up</span>
                                                <span className="font-bold text-white">~12%</span> vs last week
                                            </p>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </main>

                    <footer className="bg-white border-t border-slate-200 py-10">
                        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-wrap justify-between items-center gap-6">
                            <div className="flex items-center gap-2">
                                <img src={logo} alt="JobPrep" className="h-6 w-auto opacity-50" />
                                <p className="text-slate-400 text-sm font-medium">© 2024 JobPrep AI. All rights reserved.</p>
                            </div>
                            <div className="flex gap-8">
                                <a href="#" className="text-sm font-bold text-slate-400 hover:text-primary transition-colors">Terms</a>
                                <a href="#" className="text-sm font-bold text-slate-400 hover:text-primary transition-colors">Privacy</a>
                                <a href="#" className="text-sm font-bold text-slate-400 hover:text-primary transition-colors">Help Center</a>
                            </div>
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    )
}

