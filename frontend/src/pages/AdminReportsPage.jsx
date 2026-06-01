import { useEffect, useState } from 'react';
import { FiDownload, FiFileText, FiRefreshCw, FiTrendingDown, FiTrendingUp, FiUsers } from 'react-icons/fi';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { adminInterviewApi } from '../services/api';
import toast from 'react-hot-toast';

function toNumber(value) {
    if (value == null) return 0;
    return Number(value);
}

function chartData(rows = []) {
    return rows.map(row => ({ label: row.label, value: toNumber(row.value) }));
}

function money(value) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(toNumber(value));
}

export default function AdminReportsPage() {
    const [analytics, setAnalytics] = useState(null);
    const [reports, setReports] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        setLoading(true);
        try {
            const [analyticsRes, reportsRes] = await Promise.all([
                adminInterviewApi.getAnalytics(),
                adminInterviewApi.getReports(),
            ]);
            setAnalytics(analyticsRes.data);
            setReports(reportsRes.data);
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to load admin reports');
        } finally {
            setLoading(false);
        }
    };

    const exportCsv = async () => {
        try {
            const res = await adminInterviewApi.exportReports();
            const url = URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
            const link = document.createElement('a');
            link.href = url;
            link.download = 'admin-reports.csv';
            link.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            toast.error('Could not export report');
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    if (loading) {
        return <div className="h-96 flex items-center justify-center text-sm font-bold text-slate-500">Loading reports...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <div className="flex gap-3">
                    <button onClick={loadData} className="h-11 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm flex items-center gap-2 hover:bg-white">
                        <FiRefreshCw /> Refresh
                    </button>
                    <button onClick={exportCsv} className="h-11 px-4 rounded-xl bg-primary text-white font-bold text-sm flex items-center gap-2 hover:bg-primary-dark">
                        <FiDownload /> Export CSV
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                <Stat title="Total Sessions" value={analytics?.totalSessions} icon={<FiFileText />} tone="bg-blue-500" />
                <Stat title="Completed" value={analytics?.completedSessions} icon={<FiTrendingUp />} tone="bg-emerald-500" sub={`${(analytics?.completionRate || 0).toFixed(1)}% completion`} />
                <Stat title="Abandoned" value={analytics?.abandonedSessions} icon={<FiTrendingDown />} tone="bg-rose-500" sub={`${(analytics?.abandonmentRate || 0).toFixed(1)}% abandonment`} />
                <Stat title="Active Users 30d" value={reports?.activeUsers30d} icon={<FiUsers />} tone="bg-violet-500" sub={`${reports?.returningUsers30d || 0} returning`} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <ChartCard title="Interview Usage" subtitle="Sessions created in the last 30 days">
                    <ResponsiveContainer width="100%" height={260}>
                        <AreaChart data={chartData(reports?.interviewUsage)}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f7" />
                            <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                            <YAxis hide />
                            <Tooltip />
                            <Area type="monotone" dataKey="value" stroke="#2563eb" fill="#dbeafe" strokeWidth={3} />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartCard>
                <ChartCard title="User Growth" subtitle="New users in the last 30 days">
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={chartData(reports?.userGrowth)}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f7" />
                            <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                            <YAxis hide />
                            <Tooltip />
                            <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
                <ChartCard title="Revenue" subtitle={`${money(reports?.totalRevenue)} total paid revenue`}>
                    <ResponsiveContainer width="100%" height={260}>
                        <AreaChart data={chartData(reports?.revenue)}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f7" />
                            <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                            <YAxis hide />
                            <Tooltip formatter={(value) => money(value)} />
                            <Area type="monotone" dataKey="value" stroke="#f59e0b" fill="#fef3c7" strokeWidth={3} />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                <ListCard title="Popular Roles" rows={analytics?.popularRoles} valueLabel="Sessions" />
                <ListCard title="Weak Topics" rows={analytics?.weakTopics} valueLabel="Avg score" valueMode="score" />
                <ListCard title="Most Used Questions" rows={reports?.questionUsage} valueLabel="Uses" />
                <ListCard title="Lowest Score Questions" rows={reports?.lowScoreQuestions} valueLabel="Avg score" valueMode="score" />
                <ListCard title="Subscription Performance" rows={reports?.subscriptionPerformance} valueLabel="Count" />
                <ListCard title="User Progress Trend" rows={reports?.progressTrend?.slice(-10)?.map(item => ({ label: item.label, count: Math.round(toNumber(item.value)), value: item.value }))} valueLabel="Avg score" valueMode="score" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <MiniReport title="Active subscriptions" value={reports?.activeSubscriptions} />
                <MiniReport title="Expiring in 7 days" value={reports?.expiringSubscriptions7d} />
                <MiniReport title="Cancelled subscriptions" value={reports?.cancelledSubscriptions} />
            </div>
        </div>
    );
}

function Stat({ title, value, icon, tone, sub }) {
    return (
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`h-12 w-12 rounded-xl ${tone} text-white flex items-center justify-center text-xl`}>{icon}</div>
            <div>
                <p className="text-xs font-black uppercase text-slate-400">{title}</p>
                <p className="text-2xl font-black text-slate-950">{value ?? 0}</p>
                {sub && <p className="text-xs text-slate-500">{sub}</p>}
            </div>
        </div>
    );
}

function ChartCard({ title, subtitle, children }) {
    return (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h3 className="text-lg font-black text-slate-950">{title}</h3>
            <p className="text-sm text-slate-500 mb-5">{subtitle}</p>
            {children}
        </div>
    );
}

function ListCard({ title, rows = [], valueLabel, valueMode }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between">
                <h3 className="font-black text-slate-950">{title}</h3>
                <span className="text-xs font-black uppercase text-slate-400">{valueLabel}</span>
            </div>
            <div className="divide-y divide-slate-50">
                {rows?.length ? rows.map((row, index) => (
                    <div key={`${row.label}-${index}`} className="p-4 flex items-center justify-between gap-4">
                        <p className="text-sm font-semibold text-slate-700 line-clamp-2">{row.label}</p>
                        <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">
                            {valueMode === 'score' ? Number(row.value ?? row.count ?? 0).toFixed(1) : row.count}
                        </span>
                    </div>
                )) : (
                    <div className="p-8 text-center text-sm text-slate-500">No data available.</div>
                )}
            </div>
        </div>
    );
}

function MiniReport({ title, value }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <p className="text-xs font-black uppercase text-slate-400">{title}</p>
            <p className="mt-2 text-2xl font-black text-slate-950">{value ?? 0}</p>
        </div>
    );
}
