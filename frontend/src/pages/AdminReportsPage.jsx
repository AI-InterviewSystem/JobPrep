import { useEffect, useState } from 'react';
import { FiDownload, FiFileText, FiRefreshCw, FiTrendingDown, FiTrendingUp, FiUsers } from 'react-icons/fi';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { adminInterviewApi } from '../services/api';
import toast from 'react-hot-toast';

const CHART_COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

function toNumber(value) {
    if (value == null) return 0;
    return Number(value);
}

function chartData(rows = []) {
    return rows.map(row => ({ label: row.label, value: toNumber(row.value) }));
}

function labelCountData(rows = [], valueMode) {
    return rows.map((row, index) => ({
        label: row.label || 'Unknown',
        shortLabel: compactLabel(row.label || 'Unknown'),
        count: toNumber(valueMode === 'score' ? (row.value ?? row.count) : row.count),
        fill: CHART_COLORS[index % CHART_COLORS.length],
    }));
}

function compactLabel(label) {
    if (!label) return 'Unknown';
    return label.length > 28 ? `${label.slice(0, 25)}...` : label;
}

function money(value) {
    return `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(toNumber(value))} VN\u0110`;
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
                <RankingBarCard title="Popular Roles" rows={analytics?.popularRoles} valueLabel="Sessions" color="#2563eb" />
                <RankingBarCard title="Weak Topics" rows={analytics?.weakTopics} valueLabel="Avg score" valueMode="score" color="#ef4444" />
                <RankingBarCard title="Most Used Questions" rows={reports?.questionUsage} valueLabel="Uses" color="#8b5cf6" />
                <RankingBarCard title="Lowest Score Questions" rows={reports?.lowScoreQuestions} valueLabel="Avg score" valueMode="score" color="#f59e0b" />
                <PieSummaryCard title="Subscription Performance" rows={reports?.subscriptionPerformance} />
                <TrendScoreCard title="User Progress Trend" rows={reports?.progressTrend?.slice(-10)} />
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
            <div className="min-w-0">
                <p className="text-xs font-black uppercase text-slate-400 leading-tight">{title}</p>
                <p className="text-2xl font-black text-slate-950 leading-tight">{value ?? 0}</p>
                {sub && <p className="text-xs text-slate-500 leading-tight">{sub}</p>}
            </div>
        </div>
    );
}

function ChartCard({ title, subtitle, children }) {
    return (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm overflow-hidden">
            <h3 className="text-lg font-black text-slate-950">{title}</h3>
            <p className="text-sm text-slate-500 mb-5">{subtitle}</p>
            {children}
        </div>
    );
}

function RankingBarCard({ title, rows = [], valueLabel, valueMode, color }) {
    const data = labelCountData(rows, valueMode).slice(0, 8);

    return (
        <ChartCard title={title} subtitle={valueLabel}>
            {data.length ? (
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data} layout="vertical" margin={{ top: 4, right: 18, left: 12, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eef2f7" />
                        <XAxis type="number" hide />
                        <YAxis
                            type="category"
                            dataKey="shortLabel"
                            width={150}
                            tick={{ fontSize: 11, fill: '#64748b' }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            formatter={(value) => valueMode === 'score' ? Number(value).toFixed(1) : Number(value).toLocaleString('en-US')}
                            labelFormatter={(_, payload) => payload?.[0]?.payload?.label || ''}
                        />
                        <Bar dataKey="count" fill={color} radius={[0, 8, 8, 0]} barSize={18}>
                            {data.map((entry, index) => <Cell key={`${entry.label}-${index}`} fill={entry.fill || color} />)}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <EmptyChart />
            )}
        </ChartCard>
    );
}

function PieSummaryCard({ title, rows = [] }) {
    const data = labelCountData(rows).filter(item => item.count > 0).slice(0, 6);

    return (
        <ChartCard title={title} subtitle="Plan distribution">
            {data.length ? (
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie data={data} dataKey="count" nameKey="shortLabel" innerRadius={64} outerRadius={104} paddingAngle={3}>
                            {data.map((entry, index) => <Cell key={`${entry.label}-${index}`} fill={entry.fill} />)}
                        </Pie>
                        <Tooltip formatter={(value) => Number(value).toLocaleString('en-US')} />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                    </PieChart>
                </ResponsiveContainer>
            ) : (
                <EmptyChart />
            )}
        </ChartCard>
    );
}

function TrendScoreCard({ title, rows = [] }) {
    const data = chartData(rows);

    return (
        <ChartCard title={title} subtitle="Average score over recent periods">
            {data.length ? (
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={data} margin={{ top: 8, right: 18, left: 0, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f7" />
                        <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                        <Tooltip formatter={(value) => Number(value).toFixed(1)} />
                        <Area type="monotone" dataKey="value" stroke="#10b981" fill="#dcfce7" strokeWidth={3} />
                    </AreaChart>
                </ResponsiveContainer>
            ) : (
                <EmptyChart />
            )}
        </ChartCard>
    );
}

function EmptyChart() {
    return (
        <div className="h-[300px] rounded-2xl border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-sm font-semibold text-slate-400">
            No data available.
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
