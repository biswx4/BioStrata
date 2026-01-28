import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Download, ChevronRight, Search, Calendar, User, Activity, X } from 'lucide-react';
import Navbar from './components/Navbar';
import AnimatedBackground from './AnimatedBackground';
import { jsPDF } from 'jspdf';

const Reports = ({ user, activeTab, onTabChange }) => {
    const [reports, setReports] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch reports on mount
    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const response = await fetch('http://localhost:8000/reports');
            if (response.ok) {
                const data = await response.json();
                setReports(data);
            }
        } catch (error) {
            console.error('Failed to fetch reports:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchReportDetails = async (analysisId) => {
        try {
            const response = await fetch(`http://localhost:8000/reports/${analysisId}`);
            if (response.ok) {
                const data = await response.json();
                setSelectedReport(data);
            }
        } catch (error) {
            console.error('Failed to fetch report details:', error);
        }
    };

    const handleExportPDF = () => {
        if (!selectedReport) return;

        const doc = new jsPDF();
        const lineHeight = 10;
        let y = 20;

        // Header
        doc.setFontSize(22);
        doc.setTextColor(16, 185, 129); // Emerald color
        doc.text("BioStrata Analysis Report", 20, y);
        y += 15;

        // Meta Data
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Analysis ID: ${selectedReport.analysis_id}`, 20, y);
        y += 6;
        doc.text(`Date: ${new Date(selectedReport.timestamp).toLocaleString()}`, 20, y);
        y += 6;
        if (selectedReport.patient_id) {
            doc.text(`Patient ID: ${selectedReport.patient_id}`, 20, y);
            y += 6;
        }
        y += 10;

        // Result Section
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text("Risk Assessment", 20, y);
        y += 10;

        doc.setFontSize(12);
        const riskText = `Category: ${selectedReport.risk_category} Risk`;
        doc.text(riskText, 20, y);

        if (selectedReport.risk_score !== null) {
            y += 6;
            doc.text(`Probability Score: ${(selectedReport.risk_score * 100).toFixed(1)}%`, 20, y);
        }
        y += 15;

        // Explanation
        if (selectedReport.explanation) {
            doc.setFontSize(14);
            doc.text("Clinical Interpretation", 20, y);
            y += 10;

            doc.setFontSize(10);
            const splitText = doc.splitTextToSize(selectedReport.explanation, 170);
            doc.text(splitText, 20, y);
            y += splitText.length * 5 + 10;
        }

        // Disclaimer
        doc.setFontSize(8);
        doc.setTextColor(150);
        const disclaimer = "DISCLAIMER: This system is intended for research and clinical decision support only. It does not provide diagnoses or treatment recommendations.";
        const splitDisclaimer = doc.splitTextToSize(disclaimer, 170);
        doc.text(splitDisclaimer, 20, 280);

        doc.save(`BioStrata_Report_${selectedReport.patient_id || 'v1'}.pdf`);
    };

    // Filter logic
    const filteredReports = reports.filter(r =>
        (r.patient_id && r.patient_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (r.risk_category && r.risk_category.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-[#050505] text-white font-['Outfit'] selection:bg-white/20 pb-20">
            <div className="fixed inset-0 z-0">
                <AnimatedBackground />
            </div>

            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar activeTab="reports" onTabChange={onTabChange} userName={user} />

                <main className="flex-1 w-full max-w-[1200px] mx-auto px-6 pt-28">

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-between items-end mb-8"
                    >
                        <div>
                            <h1 className="text-3xl font-medium mb-1">Analysis History</h1>
                            <p className="text-white/40 text-sm">Review past molecular analysis reports.</p>
                        </div>

                        {/* Search Bar */}
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                            <input
                                type="text"
                                placeholder="Search Patient ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-all"
                            />
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">

                        {/* LIST COLUMN */}
                        <div className="lg:col-span-1 glass-panel flex flex-col overflow-hidden">
                            <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
                                <span className="text-xs font-medium uppercase tracking-wider text-white/50">Recent Analyses</span>
                                <span className="text-xs text-white/30">{filteredReports.length} Found</span>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                                {isLoading ? (
                                    <div className="flex justify-center items-center h-40">
                                        <div className="w-6 h-6 border-2 border-white/10 border-t-emerald-400 rounded-full animate-spin" />
                                    </div>
                                ) : filteredReports.length === 0 ? (
                                    <div className="text-center py-10 text-white/20 text-sm">No reports found.</div>
                                ) : (
                                    filteredReports.map((report) => (
                                        <button
                                            key={report.analysis_id}
                                            onClick={() => fetchReportDetails(report.analysis_id)}
                                            className={`w-full text-left p-4 rounded-xl border transition-all duration-200 group relative overflow-hidden ${selectedReport?.analysis_id === report.analysis_id
                                                    ? 'bg-white/10 border-emerald-500/50'
                                                    : 'bg-white/5 border-transparent hover:bg-white/10 hover:border-white/10'
                                                }`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-2 h-2 rounded-full ${report.risk_category === 'High' ? 'bg-red-400' :
                                                            report.risk_category === 'Moderate' ? 'bg-yellow-400' : 'bg-emerald-400'
                                                        }`} />
                                                    <span className="text-sm font-medium text-white">{report.risk_category} Risk</span>
                                                </div>
                                                <span className="text-[10px] text-white/30 font-mono">
                                                    {new Date(report.timestamp).toLocaleDateString()}
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <div className="text-xs text-white/60 flex items-center gap-1 mb-1">
                                                        <User size={10} />
                                                        {report.patient_id || 'N/A'}
                                                    </div>
                                                </div>
                                                <ChevronRight size={14} className={`text-white/20 transition-transform ${selectedReport?.analysis_id === report.analysis_id ? 'translate-x-1 text-emerald-400' : 'group-hover:translate-x-1'}`} />
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* DETAIL COLUMN */}
                        <div className="lg:col-span-2 glass-panel relative overflow-hidden flex flex-col">
                            <AnimatePresence mode="wait">
                                {selectedReport ? (
                                    <motion.div
                                        key="content"
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        className="flex-1 flex flex-col h-full"
                                    >
                                        {/* Detail Header */}
                                        <div className="p-6 border-b border-white/5 flex justify-between items-start bg-white/[0.02]">
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h2 className="text-xl font-medium text-white">Analysis Report</h2>
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${selectedReport.risk_category === 'High' ? 'bg-red-500/10 border-red-500/20 text-red-300' :
                                                            selectedReport.risk_category === 'Moderate' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-300' :
                                                                'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                                                        }`}>
                                                        {selectedReport.risk_category.toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="flex gap-4 text-xs text-white/40">
                                                    <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(selectedReport.timestamp).toLocaleString()}</span>
                                                    <span className="flex items-center gap-1"><User size={12} /> {selectedReport.patient_id || 'Anonymous'}</span>
                                                    <span className="font-mono text-white/20">ID: {selectedReport.analysis_id.slice(0, 8)}...</span>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setSelectedReport(null)}
                                                    className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Detail Content */}
                                        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">

                                            {/* Score Visualization */}
                                            {selectedReport.risk_score !== null && (
                                                <div className="mb-8 p-6 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-6">
                                                    <div className="relative w-20 h-20 flex items-center justify-center">
                                                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#222" strokeWidth="3" />
                                                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={selectedReport.risk_category === 'High' ? '#f87171' : selectedReport.risk_category === 'Moderate' ? '#facc15' : '#34d399'} strokeWidth="3" strokeDasharray={`${selectedReport.risk_score * 100}, 100`} />
                                                        </svg>
                                                        <div className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                                                            {(selectedReport.risk_score * 100).toFixed(0)}%
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-medium text-white/90">AI Confidence Score</h3>
                                                        <p className="text-xs text-white/50 mt-1 max-w-sm">
                                                            The model indicates a {(selectedReport.risk_score * 100).toFixed(1)}% probability alignment with the {selectedReport.risk_category.toLowerCase()} risk profile based on the provided gene expression signature.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Explanation Text */}
                                            {selectedReport.explanation && (
                                                <div className="mb-8">
                                                    <h3 className="text-sm font-medium text-white/80 mb-3 flex items-center gap-2">
                                                        <FileText size={16} className="text-emerald-400" />
                                                        Clinical Interpretation
                                                    </h3>
                                                    <div className="text-sm text-white/70 leading-relaxed space-y-4 whitespace-pre-line p-5 rounded-xl bg-white/5 border border-white/5">
                                                        {selectedReport.explanation}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Disclaimer */}
                                            <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 flex gap-3">
                                                <Activity className="text-blue-400 shrink-0" size={18} />
                                                <p className="text-xs text-blue-200/70 leading-relaxed">
                                                    <strong className="text-blue-300">Note:</strong> This report is generated by an AI model (Random Forest/Logistic Regression Ensemble) and is intended for research use only. Results should be validated by standard clinical protocols.
                                                </p>
                                            </div>

                                        </div>

                                        {/* Footer Actions */}
                                        <div className="p-6 border-t border-white/10 flex justify-end bg-white/[0.02]">
                                            <button
                                                onClick={handleExportPDF}
                                                className="flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-xl font-medium text-sm hover:bg-gray-200 transition-colors shadow-lg shadow-white/5"
                                            >
                                                <Download size={16} />
                                                Export PDF
                                            </button>
                                        </div>

                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="empty"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="h-full flex flex-col items-center justify-center text-center opacity-40 p-10"
                                    >
                                        <FileText size={64} className="mb-4 text-white/20" strokeWidth={1} />
                                        <h3 className="text-xl font-light text-white">Select a Report</h3>
                                        <p className="text-sm text-white/50 mt-2 max-w-xs">
                                            Choose an analysis from the list on the left to view detailed insights and export options.
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                </main>
            </div>
        </div>
    );
};

export default Reports;
