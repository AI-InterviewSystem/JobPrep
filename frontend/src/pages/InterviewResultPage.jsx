import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion"
import { useRef, useState } from "react";
import html2pdf from "html2pdf.js";
import logo from "../assets/images/jobprep-logo.png"

// Simple circular progress SVG
function CircularScore({ score, label, size = 160, color = "#0058bd" }) {
    const R = size / 2 - 12
    const circumference = 2 * Math.PI * R
    const safeScore = Math.max(0, Math.min(100, Number(score) || 0))
    const offset = circumference - (safeScore / 100) * circumference

    return (
        <div className="relative inline-flex items-center justify-center flex-col gap-1">
            <div className="relative inline-flex items-center justify-center">
                <svg width={size} height={size} className="-rotate-90">
                    <circle cx={size / 2} cy={size / 2} r={R} fill="none" stroke="#e5e7eb" strokeWidth="12" />
                    <motion.circle
                        cx={size / 2} cy={size / 2} r={R} fill="none"
                        stroke={color} strokeWidth="12"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        strokeLinecap="round"
                    />
                </svg>
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                    className="absolute flex flex-col items-center"
                >
                    <span className="text-2xl font-extrabold text-gray-900">{safeScore}%</span>
                </motion.div>
            </div>
            {label && <span className="text-xs font-semibold text-gray-500 mt-1">{label}</span>}
        </div>
    )
}

// Risk level badge colors
function RiskBadge({ riskLevel }) {
    const map = {
        low: "bg-green-100 text-green-700",
        medium: "bg-yellow-100 text-yellow-700",
        high: "bg-red-100 text-red-700",
        unknown: "bg-gray-100 text-gray-500",
    }
    const key = (riskLevel || "unknown").toLowerCase()
    return (
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${map[key] || map.unknown}`}>
            {key} risk
        </span>
    )
}

function formatBehaviorWarning(warning) {
    if (warning == null) return ""
    if (typeof warning === "string") return warning
    if (typeof warning === "object") {
        const parts = [
            warning.message || warning.type,
            warning.elapsed_seconds != null ? `${Math.round(Number(warning.elapsed_seconds))}s` : null,
        ].filter(Boolean)
        return parts.length > 0 ? parts.join(" - ") : JSON.stringify(warning)
    }
    return String(warning)
}

export default function InterviewResultPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const reportRef = useRef(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownloadPdf = async () => {
        const element = reportRef.current;
        if (!element) return;

        setIsDownloading(true);
        const opt = {
            margin: [0.5, 0.3, 0.5, 0.3], // top, right, bottom, left
            filename: 'JobPrep_Interview_Report.pdf',
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };

        try {
            await html2pdf().set(opt).from(element).save();
        } catch (error) {
            console.error("Error generating PDF:", error);
        } finally {
            setIsDownloading(false);
        }
    };
    const session = location.state?.session || {};
    const behaviorReport = location.state?.behaviorReport || null;

    const overallScore = Math.round(Number(session?.overallScore ?? 0))
    const interviewScore = session?.interviewScore != null ? Math.round(Number(session.interviewScore)) : null
    const cvScore = session?.cvScore != null ? Math.round(Number(session.cvScore)) : null
    const scoringBreakdown = session?.scoringBreakdown || null

    const sessionStrengths = session?.strengths ?? []
    const sessionAreas = session?.weaknesses ?? []
    const questions = Array.isArray(session?.questions) ? session.questions : []

    // Behavior report data
    const hasBehavior = behaviorReport && typeof behaviorReport === "object"
    const bSummary = hasBehavior ? (behaviorReport.summary || {}) : {}
    const bWarnings = hasBehavior && Array.isArray(behaviorReport.warnings)
        ? behaviorReport.warnings.map(formatBehaviorWarning).filter(Boolean)
        : []

    return (
        <div className="min-h-screen bg-gray-50 font-display flex flex-col">
            <main ref={reportRef} className="max-w-6xl mx-auto w-full px-6 py-10 flex-1 bg-gray-50">
                {/* Page Title */}
                <div className="mb-8 animate-entry flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-extrabold text-gray-900 mb-1">Interview Analysis</h1>
                        <p className="text-gray-500">Detailed feedback for your simulation.</p>
                    </div>
                </div>

                {/* ── Score Cards Row ─────────────────────────────────────── */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    {/* Overall Score */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center">
                        <p className="text-sm text-gray-500 mb-4">Overall Score</p>
                        <CircularScore score={overallScore} />
                        {overallScore > 0 && (
                            <div className="mt-4 bg-green-50 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full">
                                Analysis Complete
                            </div>
                        )}
                    </div>

                    {/* Score Breakdown */}
                    <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <div className="flex items-center gap-2 mb-5">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <h2 className="font-bold text-gray-900 text-lg">Score Breakdown</h2>
                        </div>
                        {(interviewScore != null || cvScore != null) ? (
                            <div className="grid sm:grid-cols-2 gap-6">
                                <div className="flex flex-col items-center">
                                    <CircularScore score={interviewScore ?? 0} color="#0058bd" size={120} />
                                    <p className="mt-2 text-xs font-semibold text-gray-600">Interview Score <span className="text-gray-400">(80%)</span></p>
                                </div>
                                <div className="flex flex-col items-center">
                                    <CircularScore score={cvScore ?? 0} color="#7c3aed" size={120} />
                                    <p className="mt-2 text-xs font-semibold text-gray-600">CV Match Score <span className="text-gray-400">(20%)</span></p>
                                </div>
                            </div>
                        ) : (
                            // Fallback: show skill scores if available
                            <div className="space-y-3">
                                {[
                                    { label: "Technical", value: session?.technicalScore },
                                    { label: "Communication", value: session?.communicationScore },
                                    { label: "Confidence", value: session?.confidenceScore },
                                    { label: "Problem Solving", value: session?.problemSolvingScore },
                                    { label: "Clarity", value: session?.clarityScore },
                                ].filter(s => s.value != null).map(({ label, value }) => (
                                    <div key={label} className="flex items-center gap-3">
                                        <span className="text-xs text-gray-500 w-28 shrink-0">{label}</span>
                                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-primary rounded-full"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min(100, Number(value))}%` }}
                                                transition={{ duration: 1, ease: "easeOut" }}
                                            />
                                        </div>
                                        <span className="text-xs font-bold text-gray-700 w-10 text-right">{Math.round(Number(value))}%</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Per-question scores from scoring_breakdown */}
                        {Array.isArray(scoringBreakdown?.question_scores) && scoringBreakdown.question_scores.length > 0 && (
                            <div className="mt-5 pt-4 border-t border-gray-100">
                                <p className="text-xs font-semibold text-gray-500 mb-3">Per-Question Scores</p>
                                <div className="flex flex-wrap gap-2">
                                    {scoringBreakdown.question_scores.map((score, i) => (
                                        <div key={i} className={`flex items-center justify-center w-12 h-12 rounded-xl text-sm font-bold border-2 ${Number(score) >= 70 ? 'bg-green-50 border-green-200 text-green-700' : Number(score) >= 50 ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
                                            {score}
                                        </div>
                                    ))}
                                </div>
                                {scoringBreakdown?.weights && (
                                    <p className="mt-2 text-xs text-gray-400">
                                        Formula: Interview ({Math.round((scoringBreakdown.weights.interview ?? 0.8) * 100)}%) × avg + CV ({Math.round((scoringBreakdown.weights.cv ?? 0.2) * 100)}%) = {overallScore}%
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Strengths & Weaknesses ─────────────────────────────── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
                    <div className="flex items-center gap-2 mb-5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <h2 className="font-bold text-gray-900 text-lg">Strength &amp; Weakness Analysis</h2>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="bg-green-50 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm font-bold text-green-700">Strengths</span>
                            </div>
                            <ul className="space-y-2">
                                {sessionStrengths.length > 0 ? (
                                    sessionStrengths.map((s, i) => (
                                        <li key={i} className="text-xs text-green-800 flex gap-1.5">
                                            <span className="mt-1 shrink-0">•</span>{s}
                                        </li>
                                    ))
                                ) : (
                                    <li className="text-xs text-green-500 italic">No specific strengths noted.</li>
                                )}
                            </ul>
                        </div>
                        <div className="bg-orange-50 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm font-bold text-orange-600">Areas to Improve</span>
                            </div>
                            <ul className="space-y-2">
                                {sessionAreas.length > 0 ? (
                                    sessionAreas.map((a, i) => (
                                        <li key={i} className="text-xs text-orange-800 flex gap-1.5">
                                            <span className="mt-1 shrink-0">•</span>{a}
                                        </li>
                                    ))
                                ) : (
                                    <li className="text-xs text-orange-500 italic">No areas for improvement noted.</li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* ── AI Summary ──────────────────────────────────────────── */}
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8 mb-8">
                    <div className="flex items-center gap-2 mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <h3 className="font-bold text-gray-900 text-lg">AI Summary &amp; Feedback</h3>
                    </div>
                    <div className="bg-white rounded-xl p-5">
                        {session?.summaryText ? (
                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{session.summaryText}</p>
                        ) : (
                            <p className="text-sm text-gray-400 italic">No summary available for this session.</p>
                        )}
                    </div>
                </div>

                {/* ── Behavior Monitoring Report ─────────────────────────── */}
                {hasBehavior && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
                        <div className="flex items-center gap-2 mb-5">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <h2 className="font-bold text-gray-900 text-lg">Behavior Monitoring Report</h2>
                            <RiskBadge riskLevel={bSummary?.risk_level} />
                        </div>

                        <div className="grid sm:grid-cols-3 gap-4 mb-5">
                            <div className="bg-gray-50 rounded-xl p-4 text-center">
                                <p className="text-2xl font-extrabold text-gray-900">
                                    {behaviorReport.total_frames ?? "—"}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">Total Frames Analyzed</p>
                            </div>
                            <div className="bg-green-50 rounded-xl p-4 text-center">
                                <p className="text-2xl font-extrabold text-green-700">
                                    {bSummary?.valid_face_ratio != null
                                        ? `${Math.round(Number(bSummary.valid_face_ratio) * 100)}%`
                                        : "—"}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">Valid Face Ratio</p>
                            </div>
                            <div className={`rounded-xl p-4 text-center ${Number(bSummary?.looking_away_ratio ?? 0) > 0.1 ? "bg-orange-50" : "bg-gray-50"}`}>
                                <p className={`text-2xl font-extrabold ${Number(bSummary?.looking_away_ratio ?? 0) > 0.1 ? "text-orange-600" : "text-gray-900"}`}>
                                    {bSummary?.looking_away_ratio != null
                                        ? `${Math.round(Number(bSummary.looking_away_ratio) * 100)}%`
                                        : "—"}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">Looking Away Ratio</p>
                            </div>
                        </div>

                        {/* Frame counts */}
                        <div className="grid grid-cols-3 gap-3 mb-4">
                            {[
                                { label: "No Face", value: behaviorReport.no_face_frames, color: "text-red-500" },
                                { label: "Multiple Faces", value: behaviorReport.multiple_face_frames, color: "text-yellow-600" },
                                { label: "Looking Away", value: behaviorReport.looking_away_frames, color: "text-orange-500" },
                            ].map(({ label, value, color }) => (
                                <div key={label} className="text-center">
                                    <p className={`text-xl font-bold ${color}`}>{value ?? 0}</p>
                                    <p className="text-xs text-gray-400">{label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Warnings */}
                        {bWarnings.length > 0 && (
                            <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                                <p className="text-xs font-bold text-red-700 mb-2 uppercase tracking-wide">Behavior Warnings</p>
                                <ul className="space-y-1">
                                    {bWarnings.map((w, i) => (
                                        <li key={i} className="text-xs text-red-700 flex gap-1.5">
                                            <span className="shrink-0">⚠</span>{w}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {bWarnings.length === 0 && (
                            <p className="text-xs text-green-600 font-medium">✓ No behavioral warnings recorded during the interview.</p>
                        )}
                    </div>
                )}

                {/* ── Answer Recordings ──────────────────────────────────── */}
                {questions.length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
                        <div className="flex items-center gap-2 mb-5">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <h2 className="font-bold text-gray-900 text-lg">Answer Recordings</h2>
                        </div>
                        <div className="space-y-5">
                            {questions.map((question, index) => {
                                const recording = question.recordings?.[0]
                                const qScore = Array.isArray(scoringBreakdown?.question_scores)
                                    ? scoringBreakdown.question_scores[index]
                                    : question.answer?.score
                                return (
                                    <div key={question.id || index} className="border border-gray-100 rounded-xl p-4">
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <p className="text-xs font-bold text-primary uppercase tracking-widest">
                                                Question {question.orderIndex || index + 1}
                                            </p>
                                            {qScore != null && (
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${Number(qScore) >= 70 ? 'bg-green-100 text-green-700' : Number(qScore) >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-600'}`}>
                                                    {qScore}/100
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm font-semibold text-gray-800 mb-3">{question.questionText}</p>
                                        {recording?.publicUrl ? (
                                            recording.recordingType === "audio" ? (
                                                <audio controls src={recording.publicUrl} className="w-full" />
                                            ) : (
                                                <video controls src={recording.publicUrl} className="w-full max-h-[360px] rounded-lg bg-black" />
                                            )
                                        ) : (
                                            <p className="text-sm text-gray-400 italic">No recording saved for this answer.</p>
                                        )}
                                        {question.answer?.answerText && (
                                            <p className="mt-3 text-sm text-gray-600 whitespace-pre-line">{question.answer.answerText}</p>
                                        )}
                                        {question.answer?.feedback && (
                                            <div className="mt-3 bg-blue-50 rounded-lg p-3">
                                                <p className="text-xs font-semibold text-primary mb-1">AI Feedback</p>
                                                <p className="text-xs text-gray-700">{question.answer.feedback}</p>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div data-html2canvas-ignore="true" className="flex items-center justify-center gap-4 flex-wrap pb-8">
                    <button
                        onClick={() => navigate("/interview-setup")}
                        className="border-2 border-gray-800 text-gray-800 font-bold px-8 py-3 rounded-xl hover:bg-gray-100 transition-all"
                    >
                        Retake Simulation
                    </button>
                    <button
                        onClick={handleDownloadPdf}
                        disabled={isDownloading}
                        className={`flex items-center gap-2 text-white font-bold px-8 py-3 rounded-xl transition-all ${isDownloading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primary-dark'}`}
                    >
                        {isDownloading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Generating PDF...
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download Full Report (PDF)
                            </>
                        )}
                    </button>
                </div>
            </main>
        </div>
    )
}
