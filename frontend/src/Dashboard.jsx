import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar, AreaChart, Area
} from 'recharts';
import Navbar from './components/Navbar';
import AnimatedBackground from './AnimatedBackground';
import { Activity, Clock, Database, ShieldCheck, ArrowUpRight, TrendingUp } from 'lucide-react';

/* --- MOCK DATA --- */
const PR_DATA = [
    { recall: 0.0, precision: 1.0, baseline: 0.59 },
    { recall: 0.1, precision: 0.95, baseline: 0.59 },
    { recall: 0.3, precision: 0.85, baseline: 0.59 },
    { recall: 0.5, precision: 0.75, baseline: 0.59 },
    { recall: 0.8, precision: 0.65, baseline: 0.59 },
    { recall: 1.0, precision: 0.59, baseline: 0.59 },
];

const COMP_METRICS_DATA = [
    { name: 'LogReg', Accuracy: 0.55, 'ROC AUC': 0.55, 'PR AUC': 0.63 },
    { name: 'R.Forest', Accuracy: 0.54, 'ROC AUC': 0.54, 'PR AUC': 0.67 },
    { name: 'Balanced', Accuracy: 0.52, 'ROC AUC': 0.53, 'PR AUC': 0.64 },
];

const ROC_DATA = [
    { fpr: 0, tpr_lr: 0, tpr_rf: 0, baseline: 0 },
    { fpr: 0.2, tpr_lr: 0.25, tpr_rf: 0.22, baseline: 0.2 },
    { fpr: 0.5, tpr_lr: 0.55, tpr_rf: 0.53, baseline: 0.5 },
    { fpr: 0.8, tpr_lr: 0.82, tpr_rf: 0.80, baseline: 0.8 },
    { fpr: 1, tpr_lr: 1, tpr_rf: 1, baseline: 1 },
];

const StatCard = ({ title, value, subtext, icon: Icon, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5 }}
        className="glass-card p-6 flex flex-col justify-between h-[140px]"
    >
        <div className="flex justify-between items-start">
            <div className="p-2.5 bg-white/5 rounded-xl text-white/80">
                <Icon size={20} />
            </div>
            {subtext && (
                <div className="flex items-center gap-1 text-[11px] font-medium px-2 py-1 bg-green-500/20 text-green-300 rounded-lg">
                    <TrendingUp size={12} />
                    {subtext}
                </div>
            )}
        </div>
        <div>
            <h3 className="text-white/40 text-xs font-medium uppercase tracking-wider mb-1">{title}</h3>
            <div className="text-3xl font-medium text-white tracking-tight">{value}</div>
        </div>
    </motion.div>
);

const ChartBlock = ({ title, subtitle, children, className, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5 }}
        className={`glass-panel p-8 relative overflow-hidden flex flex-col ${className}`}
    >
        <div className="flex justify-between items-start mb-6 z-10 relative">
            <div>
                <h2 className="text-lg font-medium text-white">{title}</h2>
                {subtitle && <p className="text-white/40 text-xs mt-1">{subtitle}</p>}
            </div>
            <button className="text-white/20 hover:text-white transition-colors">
                <ArrowUpRight size={20} />
            </button>
        </div>
        <div className="flex-1 w-full min-h-0 z-10 relative">
            {children}
        </div>
    </motion.div>
);

const Dashboard = ({ user, onLogout, activeTab, onTabChange }) => {
    const [stats, setStats] = useState({
        total: 0,
        weekly: 0,
        highRiskPct: 0,
        avgRiskScore: 0
    });

    React.useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('http://localhost:8000/reports');
                if (res.ok) {
                    const data = await res.json();

                    // 1. Total
                    const total = data.length;

                    // 2. Weekly (last 7 days)
                    const now = new Date();
                    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    const weekly = data.filter(r => new Date(r.timestamp) > oneWeekAgo).length;

                    // 3. High Risk %
                    const highRiskCount = data.filter(r => r.risk_category === 'High').length;
                    const highRiskPct = total > 0 ? Math.round((highRiskCount / total) * 100) : 0;

                    // 4. Avg Score
                    const scores = data.filter(r => r.risk_score !== null).map(r => r.risk_score);
                    const avgScore = scores.length > 0
                        ? (scores.reduce((a, b) => a + b, 0) / scores.length * 100).toFixed(1)
                        : 0;

                    setStats({ total, weekly, highRiskPct, avgRiskScore: avgScore });
                }
            } catch (err) {
                console.error("Failed to load dashboard stats", err);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="min-h-screen bg-[#050505] text-white font-['Outfit'] selection:bg-white/20 pb-20">
            <AnimatedBackground />

            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar activeTab={activeTab} onTabChange={onTabChange} userName={user} />

                <div className="flex-1 w-full max-w-[1200px] mx-auto px-6 pt-28">

                    {/* Greeting */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="mb-10"
                    >
                        <h1 className="text-3xl font-medium mb-2">Overview</h1>
                        <p className="text-white/40">Welcome back to the analysis platform.</p>
                    </motion.div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <StatCard title="Total Analyses" value={stats.total} icon={Database} delay={0.1} />
                        <StatCard title="Weekly Volume" value={stats.weekly} subtext="Last 7 Days" icon={Activity} delay={0.2} />
                        <StatCard title="High Risk %" value={`${stats.highRiskPct}%`} subtext="Of Total Cases" icon={ShieldCheck} delay={0.3} />
                        <StatCard title="Avg Risk Score" value={`${stats.avgRiskScore}%`} icon={Clock} delay={0.4} />
                    </div>

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 auto-rows-[400px]">

                        {/* 1. Main PR Curve (2 cols wide) */}
                        <ChartBlock title="Recall-Precision Analysis" subtitle="Model enriches high-risk cases (AUC 0.63)" className="lg:col-span-2" delay={0.5}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={PR_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorPr" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#fff" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#fff" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                                    <XAxis dataKey="recall" stroke="#ffffff30" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#ffffff30" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(20,20,20,0.9)', border: '1px solid #333', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                                    />
                                    <Area type="monotone" dataKey="precision" stroke="#fff" fillOpacity={1} fill="url(#colorPr)" strokeWidth={2} activeDot={{ r: 6 }} />
                                    <Line type="monotone" dataKey="baseline" stroke="#ffffff40" strokeDasharray="5 5" strokeWidth={1} dot={false} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </ChartBlock>

                        {/* 2. Model Comp (1 col wide) */}
                        <ChartBlock title="Model Comparison" subtitle="Key metrics overview" className="lg:col-span-1" delay={0.6}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={COMP_METRICS_DATA} layout="vertical" barGap={4} margin={{ left: -20 }}>
                                    <XAxis type="number" hide domain={[0, 0.8]} />
                                    <YAxis dataKey="name" type="category" stroke="#fff" width={80} tick={{ fontSize: 10, fill: '#ffffff80' }} axisLine={false} tickLine={false} />
                                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }} />
                                    <Bar dataKey="PR AUC" fill="#ffffff" radius={[0, 4, 4, 0]} barSize={16} />
                                    <Bar dataKey="ROC AUC" fill="#ffffff30" radius={[0, 4, 4, 0]} barSize={16} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartBlock>

                        {/* 3. ROC Curve (1 col wide) */}
                        <ChartBlock title="ROC Analysis" subtitle="Sensitivity vs 1-Specificity" className="lg:col-span-1" delay={0.7}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={ROC_DATA} margin={{ left: -20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                                    <XAxis dataKey="fpr" stroke="#ffffff30" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#ffffff30" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                                    <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }} />
                                    <Line type="monotone" dataKey="tpr_lr" stroke="#3b82f6" strokeWidth={2} dot={false} />
                                    <Line type="monotone" dataKey="tpr_rf" stroke="#a855f7" strokeWidth={2} dot={false} />
                                    <Line type="monotone" dataKey="baseline" stroke="#ffffff20" strokeDasharray="3 3" dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </ChartBlock>

                        {/* 4. Text Block (2 cols wide) */}
                        <ChartBlock title="Clinical Insights" subtitle="Automated analysis summary" className="lg:col-span-2 justify-center" delay={0.8}>
                            <div className="grid grid-cols-2 gap-8 h-full items-center">
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                    <h4 className="text-white text-sm font-medium mb-2">Primary Findings</h4>
                                    <p className="text-xs text-white/50 leading-relaxed">
                                        Logistic Regression and Random Forest models consistently demonstrate high predictive value for risk stratification (PR AUC ~0.67), outperforming baseline methods.
                                    </p>
                                </div>
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                    <h4 className="text-white text-sm font-medium mb-2">Recommendation</h4>
                                    <p className="text-xs text-white/50 leading-relaxed">
                                        Results should be used to complement standard histopathological assessment. High-risk classification warrants extended follow-up protocols.
                                    </p>
                                </div>
                            </div>
                        </ChartBlock>

                    </div>

                    <div className="mt-12 text-center">
                        <p className="text-white/20 text-[10px] uppercase tracking-widest">
                            Research Use Only • Not for Diagnostic Use
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Dashboard;
