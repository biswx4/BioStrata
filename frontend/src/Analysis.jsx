import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Play, FileText, AlertCircle, Info, CheckCircle, Database } from 'lucide-react';
import Navbar from './components/Navbar';
import AnimatedBackground from './AnimatedBackground';

const GENES = [
    'HIF1A', 'CA9', 'VEGFA', 'SLC2A1', 'LDHA', 'HK2',
    'PFKP', 'PDK1', 'CD274', 'CTLA4', 'TGFB1'
];

const Analysis = ({ user, activeTab, onTabChange }) => {
    const [formData, setFormData] = useState({
        patient_id: '',
        ...Object.fromEntries(GENES.map(gene => [gene, '']))
    });
    const [mode, setMode] = useState('detailed'); // 'simple' or 'detailed'
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                // Support JSON or CSV
                if (file.name.endsWith('.json')) {
                    const json = JSON.parse(event.target.result);
                    // Filter only keys that match our GENES or patient_id
                    const newFormData = { ...formData };
                    Object.keys(json).forEach(key => {
                        if (GENES.includes(key) || key === 'patient_id') {
                            newFormData[key] = json[key];
                        }
                    });
                    setFormData(newFormData);
                    setError(null);
                } else {
                    // Assume CSV: "key,value" or header row
                    // Simple parser: look for "GENE,VALUE" lines
                    const text = event.target.result;
                    const lines = text.split(/\r?\n/);
                    const newFormData = { ...formData };

                    lines.forEach(line => {
                        const [key, val] = line.split(/[;,]/);
                        if (key && GENES.includes(key.trim().toUpperCase())) {
                            newFormData[key.trim().toUpperCase()] = val.trim();
                        } else if (key && key.trim().toLowerCase() === 'patient_id') {
                            newFormData.patient_id = val.trim();
                        }
                    });
                    setFormData(newFormData);
                    setError(null);
                }
            } catch (err) {
                setError("Failed to parse file. Please use valid JSON or CSV.");
            }
        };
        reader.readAsText(file);
    };

    const handleRunAnalysis = async () => {
        setIsLoading(true);
        setError(null);
        setResult(null);

        // Validate inputs (basic check)
        const features = {};
        for (const gene of GENES) {
            const val = parseFloat(formData[gene]);
            if (isNaN(val) || val < 0) {
                setError(`Invalid input for ${gene}. Please enter a positive number.`);
                setIsLoading(false);
                return;
            }
            features[gene] = val;
        }

        try {
            // Artificial Delay (10 seconds)
            await new Promise(resolve => setTimeout(resolve, 10000));

            const response = await fetch('http://localhost:8000/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patient_id: formData.patient_id || null,
                    mode: mode,
                    ...features
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || 'Analysis failed');
            }

            const data = await response.json();
            setResult(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white font-['Outfit'] selection:bg-white/20 pb-20">
            {/* Global Fluid Animation */}
            <div className="fixed inset-0 z-0">
                <AnimatedBackground />
            </div>

            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar activeTab="analysis" onTabChange={onTabChange} userName={user} />

                <main className="flex-1 w-full max-w-[1000px] mx-auto px-6 pt-28">

                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="mb-10 text-center"
                    >
                        <h1 className="text-3xl font-medium mb-2">Molecular Analysis</h1>
                        <p className="text-white/40 max-w-lg mx-auto">
                            Enter gene expression values to evaluate tumor microenvironment characteristics and estimate risk stratification.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* INPUT SECTION */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="lg:col-span-2 glass-panel p-8"
                        >
                            <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                                <Database className="text-emerald-400" size={20} />
                                <h2 className="text-lg font-medium">Patient Data</h2>
                            </div>

                            <div className="space-y-6">
                                {/* Patient ID */}
                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-white/40 mb-2">Patient ID (Optional)</label>
                                    <input
                                        type="text"
                                        name="patient_id"
                                        value={formData.patient_id}
                                        onChange={handleInputChange}
                                        className="modern-input w-full"
                                        placeholder="EX: PT-2024-001"
                                    />
                                </div>

                                {/* Genes Grid */}
                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-white/40 mb-3">Gene Expression Levels (TPM/FPKM)</label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {GENES.map(gene => (
                                            <div key={gene} className="relative group">
                                                <label className="absolute -top-2 left-3 bg-[#111] px-1 text-[10px] text-emerald-400 font-mono">{gene}</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    name={gene}
                                                    value={formData[gene]}
                                                    onChange={handleInputChange}
                                                    className="modern-input text-right font-mono text-sm focus:border-emerald-500/50"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Mode Selection */}
                                <div className="bg-white/5 rounded-xl p-1 flex relative">
                                    <button
                                        onClick={() => setMode('simple')}
                                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-300 relative z-10 ${mode === 'simple' ? 'text-black bg-white shadow-lg' : 'text-white/40 hover:text-white'}`}
                                    >
                                        Simple Mode
                                    </button>
                                    <button
                                        onClick={() => setMode('detailed')}
                                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-300 relative z-10 ${mode === 'detailed' ? 'text-black bg-white shadow-lg' : 'text-white/40 hover:text-white'}`}
                                    >
                                        Detailed Mode
                                    </button>
                                </div>

                                {/* Actions */}
                                <div className="pt-4 space-y-3">
                                    {error && (
                                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-200 text-sm">
                                            <AlertCircle size={16} />
                                            {error}
                                        </div>
                                    )}

                                    <div className="flex gap-4">
                                        {/* Upload Button */}
                                        <label className="flex-1 cursor-pointer">
                                            <input type="file" accept=".csv,.json,.txt" onChange={handleFileUpload} className="hidden" />
                                            <div className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/60 text-sm font-medium flex items-center justify-center gap-2 transition-all">
                                                <FileText size={16} />
                                                Upload Data
                                            </div>
                                        </label>

                                        {/* Run Button */}
                                        <button
                                            onClick={handleRunAnalysis}
                                            disabled={isLoading}
                                            className="flex-[2] primary-button bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isLoading ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                                    <span className="text-sm">Processing Genomic Data...</span>
                                                </div>
                                            ) : (
                                                <>
                                                    Run Analysis
                                                    <Play size={18} fill="currentColor" />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    {isLoading && (
                                        <p className="text-center text-[10px] text-emerald-400/80 animate-pulse mt-2">
                                            Analyzing tumor microenvironment signatures... Please wait.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </motion.div>

                        {/* RESULT SECTION */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="lg:col-span-1"
                        >
                            <AnimatePresence mode="wait">
                                {result ? (
                                    <motion.div
                                        key="result"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="glass-card h-full p-8 border-t-4 border-t-emerald-400 flex flex-col"
                                    >
                                        <div className="flex items-center gap-2 text-emerald-400 mb-6">
                                            <CheckCircle size={20} />
                                            <span className="text-sm font-bold tracking-wide uppercase">Analysis Complete</span>
                                        </div>

                                        <div className="mb-8 text-center">
                                            <div className="text-xs text-white/40 uppercase tracking-widest mb-2">Risk Category</div>
                                            <div className={`text-4xl font-bold ${result.risk_category === 'High' ? 'text-red-400' :
                                                    result.risk_category === 'Moderate' ? 'text-yellow-400' : 'text-emerald-400'
                                                }`}>
                                                {result.risk_category} Risk
                                            </div>

                                            {result.risk_score !== undefined && result.risk_score !== null && (
                                                <div className="mt-2 inline-block px-3 py-1 bg-white/5 rounded-full text-xs font-mono text-white/60">
                                                    Score: {(result.risk_score * 100).toFixed(1)}%
                                                </div>
                                            )}
                                        </div>

                                        {result.explanation && (
                                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                                <h4 className="text-white text-sm font-medium mb-3 flex items-center gap-2">
                                                    <Info size={14} /> Clinical Interpretation
                                                </h4>
                                                <p className="text-xs text-white/60 leading-relaxed whitespace-pre-line">
                                                    {result.explanation}
                                                </p>
                                            </div>
                                        )}

                                        <div className="mt-8 pt-6 border-t border-white/5">
                                            <p className="text-[10px] text-white/20 text-center leading-tight">
                                                {result.disclaimer}
                                            </p>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="placeholder"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="glass-panel h-full p-8 flex flex-col items-center justify-center text-center opacity-50"
                                    >
                                        <Activity size={48} className="text-white/20 mb-4" />
                                        <h3 className="text-lg font-medium text-white/40">Ready to Analyze</h3>
                                        <p className="text-xs text-white/20 mt-2 max-w-[200px]">
                                            Fill in the gene expression data and run the model to see results here.
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>

                    {/* Footer Disclaimer */}
                    <div className="mt-12 text-center pb-8 opacity-40 hover:opacity-100 transition-opacity duration-300">
                        <p className="text-[11px] text-white/60 max-w-2xl mx-auto">
                            <span className="text-emerald-400 font-bold">DISCLAIMER:</span> This system is intended for research and clinical decision support only.
                            It does not provide diagnoses or treatment recommendations. Always correlate findings with standard histopathological assessment.
                        </p>
                    </div>

                </main>
            </div>
        </div>
    );
};

export default Analysis;
