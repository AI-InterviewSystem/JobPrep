import { Link, useNavigate } from "react-router-dom"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cvApi, interviewSessionApi, jobDescriptionApi, jobGroupApi, aiHelpersApi } from "../services/api"
import logo from "../assets/images/jobprep-logo.png"



const experienceLevels = [
    { label: "Intern", desc: "Still in university or recent grad" },
    { label: "Fresher", desc: "0-1 years of experience" },
    { label: "Junior", desc: "1-3 years of experience" },
]

const interviewTypes = [
    {
        label: "HR Interview",
        desc: "Culture fit & soft skills",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
        ),
    },
    {
        label: "Technical",
        desc: "Algorithms & domain knowledge",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
        ),
    },
    {
        label: "Behavioral",
        desc: "STAR method scenarios",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a4 4 0 00-5-3.87M9 20H4v-2a4 4 0 015-3.87m6-4.13a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
        ),
    },
]

export default function InterviewSetupPage() {
    const navigate = useNavigate()
    const [selectedLevel, setSelectedLevel] = useState("Intern")
    const [selectedType, setSelectedType] = useState("Technical")

    const [cvs, setCvs] = useState([])
    const [loadingCvs, setLoadingCvs] = useState(true)
    const [isScanning, setIsScanning] = useState(false)
    const [scanProgress, setScanProgress] = useState(0)
    const [cvName, setCvName] = useState("")
    const [isAutoSelected, setIsAutoSelected] = useState(false)
    const [deleteConfirmId, setDeleteConfirmId] = useState(null)
    const [jobDescription, setJobDescription] = useState("")
    const fileInputRef = useRef(null)

    const [groups, setGroups] = useState([])
    const [loadingGroups, setLoadingGroups] = useState(true)
    const [selectedGroup, setSelectedGroup] = useState(null)
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [selectedRole, setSelectedRole] = useState(null)
    const [keyRequirements, setKeyRequirements] = useState([])
    const [newRequirement, setNewRequirement] = useState("")
    const [isAnalyzingJD, setIsAnalyzingJD] = useState(false)
    const [cvParseStatus, setCvParseStatus] = useState(null)
    const [cvMatchResult, setCvMatchResult] = useState(null)
    const [jdAnalyzeError, setJdAnalyzeError] = useState("")
    const [isStartingInterview, setIsStartingInterview] = useState(false)
    const [startError, setStartError] = useState("")

    useEffect(() => {
        fetchCvs()
        fetchGroups()
    }, [])

    const fetchGroups = async () => {
        try {
            const res = await jobGroupApi.list()
            setGroups(res.data)
            if (res.data.length > 0) {
                setSelectedGroup(res.data[0])
            }
        } catch (err) {
            console.error("Failed to fetch job groups", err)
        } finally {
            setLoadingGroups(false)
        }
    }

    // Derived lists from selected group/category
    const availableCategories = selectedGroup ? selectedGroup.categories || [] : []
    const availableRoles = selectedCategory ? selectedCategory.roles || [] : []

    const handleAIAnalyze = async () => {
        if (!jobDescription || jobDescription.trim().length === 0) return

        setIsAnalyzingJD(true)
        setJdAnalyzeError("")
        setCvMatchResult(null)

        try {
            const res = await aiHelpersApi.checkCurrentCvJd({
                job_description: jobDescription,
            })
            const result = typeof res.data === "string" ? JSON.parse(res.data) : res.data

            setCvMatchResult(result)

            const tags = []
            if (Array.isArray(result.matched_skills)) {
                result.matched_skills.forEach((skill) => tags.push(skill))
            }
            if (Array.isArray(result.missing_skills)) {
                result.missing_skills.slice(0, 3).forEach((skill) => {
                    if (!tags.includes(skill)) tags.push(skill)
                })
            }
            if (tags.length > 0) {
                setKeyRequirements(tags)
            }
        } catch (err) {
            console.error("JD analysis failed", err)
            setJdAnalyzeError(
                err?.response?.data?.message ||
                "Unable to analyze CV against job description. Upload a PDF resume first, then try again."
            )
        } finally {
            setIsAnalyzingJD(false)
        }
    }

    const handleStartInterview = async () => {
        setIsStartingInterview(true)
        setStartError("")

        const currentCv = cvs.find(c => c.isCurrent) || cvs[0]
        if (currentCv && currentCv.parseStatus === "failed") {
            setStartError(
                currentCv.parseError ||
                "Your resume could not be parsed by AI. Please re-upload a PDF before starting."
            )
            setIsStartingInterview(false)
            return
        }

        let finalJdId = null
        try {
            if (jobDescription.trim().length > 0) {
                const jobCategoryId = selectedCategory ? selectedCategory.id : null
                const res = await jobDescriptionApi.create({
                    jobCategoryId,
                    jobDescriptionText: jobDescription,
                    keyRequirements,
                    isPublic: false
                })
                finalJdId = res.data.id
            }

            const createSessionRes = await interviewSessionApi.create({
                jobDescriptionId: finalJdId,
            })
            const startSessionRes = await interviewSessionApi.start(createSessionRes.data.id, {
                interviewType: selectedType,
                interviewLevel: selectedLevel,
                numQuestions: 5,
            })

            const setupState = {
                sessionId: startSessionRes.data.id,
                sessionStatus: startSessionRes.data.status,
                jobDescription,
                selectedGroup: selectedGroup?.name || "",
                selectedCategory: selectedCategory?.name || "",
                selectedRole: selectedRole?.name || "",
                selectedIndustry: selectedCategory?.name || selectedGroup?.name || "",
                selectedLevel,
                selectedType,
                keyRequirements,
                jdId: finalJdId,
                aiStarted: true
            }
            localStorage.setItem("interview_setup", JSON.stringify(setupState))
            navigate(`/live-interview?sessionId=${startSessionRes.data.id}`)
        } catch (err) {
            console.error("Failed to start interview session", err)
            const msg = err?.response?.data?.message || err?.response?.data || "Unable to start the interview. Please try again or check your connection."
            setStartError(typeof msg === "string" ? msg : JSON.stringify(msg))
        } finally {
            setIsStartingInterview(false)
        }
    }

    const fetchCvs = async () => {
        try {
            const res = await cvApi.list()
            setCvs(res.data)
        } catch (err) {
            console.error("Failed to fetch CVs", err)
        } finally {
            setLoadingCvs(false)
        }
    }

    const handleFileUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        const ext = file.name.split(".").pop()?.toLowerCase()
        if (ext !== "pdf") {
            setStartError("Please upload a PDF resume. The AI parser supports PDF format.")
            return
        }

        setIsScanning(true)
        setScanProgress(0)
        setCvName(file.name)
        setIsAutoSelected(false)
        setCvParseStatus(null)
        setStartError("")

        const interval = setInterval(() => {
            setScanProgress(p => p < 90 ? p + 5 : p)
        }, 200)

        try {
            const uploadRes = await cvApi.upload(file)
            clearInterval(interval)
            setScanProgress(100)
            setCvParseStatus(uploadRes.data.parseStatus)
            await fetchCvs()

            if (uploadRes.data.parseStatus === "failed") {
                setStartError(
                    uploadRes.data.parseError ||
                    "CV uploaded but AI parsing failed. Please verify the AI service URL in backend config."
                )
            }
        } catch (err) {
            console.error("Upload failed", err)
            setStartError("CV upload failed. Please try again.")
            setIsScanning(false)
            clearInterval(interval)
        } finally {
            setIsScanning(false)
        }
    }

    const handleDeleteCv = async (id, e) => {
        e.stopPropagation()
        setDeleteConfirmId(id)
    }

    const confirmDelete = async () => {
        if (!deleteConfirmId) return
        try {
            await cvApi.delete(deleteConfirmId)
            fetchCvs()
        } catch (err) {
            console.error("Delete failed", err)
        } finally {
            setDeleteConfirmId(null)
        }
    }

    const handleSelectCv = async (id) => {
        try {
            await cvApi.setCurrent(id)
            fetchCvs()
        } catch (err) {
            console.error("Selection failed", err)
        }
    }
    return (
        <div className="min-h-screen bg-gray-50 font-display flex flex-col">

            <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12">
                <div className="mb-10 animate-entry">
                    <div className="flex justify-between items-end mb-2">
                        <div>
                            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Interview Setup</h1>
                            <p className="text-gray-500">Configure your mock interview session to get started</p>
                        </div>
                        {isAutoSelected && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-primary/10 text-primary px-3 py-1.5 rounded-full text-xs font-bold border border-primary/20 flex items-center gap-1.5"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                                </svg>
                                AI Optimized
                            </motion.div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    {/* CV Upload Section */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 overflow-hidden relative">
                        <div className="flex items-center gap-2 mb-5">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h2 className="font-bold text-gray-900 text-lg">Upload Resume</h2>
                        </div>

                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all ${isScanning ? "border-primary bg-primary/5" : "border-gray-200 hover:border-primary/50 hover:bg-gray-50"
                                }`}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                className="hidden"
                                accept=".pdf"
                            />

                            <AnimatePresence mode="wait">
                                {isScanning ? (
                                    <motion.div
                                        key="scanning"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="w-full max-w-xs text-center"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-semibold text-primary">AI Scanning...</span>
                                            <span className="text-xs text-gray-400">{scanProgress}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-primary"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${scanProgress}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-400 mt-3 italic">Analyzing your profile to find the best match</p>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="idle"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="flex flex-col items-center gap-3"
                                    >
                                        <div className="w-14 h-14 rounded-full bg-primary/5 flex items-center justify-center text-primary/60">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-base font-bold text-gray-900">
                                                {cvName ? cvName : "Drag and drop your file here"}
                                            </p>
                                            <p className="text-sm text-gray-400 mt-1">or click to browse</p>
                                            <p className="text-[11px] text-gray-400 mt-4 font-medium uppercase tracking-wider">Supported format: PDF (Max size: 10MB)</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* My Resumes Section */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                    </svg>
                                </div>
                                <h2 className="font-bold text-gray-900 text-lg">My Resume</h2>
                            </div>
                            {cvs.length > 0 && (
                                <span className="bg-green-50 text-green-600 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border border-green-100">
                                    Active
                                </span>
                            )}
                        </div>

                        <div className="space-y-3">
                            {loadingCvs ? (
                                <div className="text-center py-4 text-gray-400 text-sm italic">Loading your resumes...</div>
                            ) : cvs.length === 0 ? (
                                <div className="text-center py-8 border-2 border-dashed border-gray-50 rounded-xl text-gray-400 text-sm italic">
                                    No resumes uploaded yet.
                                </div>
                            ) : (
                                cvs.map(cv => (
                                    <div 
                                        key={cv.id}
                                        onClick={() => handleSelectCv(cv.id)}
                                        className={`group relative flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${
                                            cv.isCurrent 
                                            ? "border-blue-600 bg-blue-50/30" 
                                            : "border-gray-50 hover:border-blue-200"
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                                                cv.isCurrent ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-blue-50 text-blue-600"
                                            }`}>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-base font-bold text-gray-900 line-clamp-1">{cv.fileName}</p>
                                                <p className="text-xs text-gray-400 font-medium font-sans">
                                                    Uploaded: {new Date(cv.createdAt).toLocaleDateString()}
                                                    {cv.parseStatus === "completed" && (
                                                        <span className="ml-2 text-green-600 font-bold">· AI Parsed</span>
                                                    )}
                                                    {cv.parseStatus === "failed" && (
                                                        <span className="ml-2 text-red-500 font-bold">· Parse Failed</span>
                                                    )}
                                                    {cv.parseStatus === "pending" && (
                                                        <span className="ml-2 text-amber-500 font-bold">· Parsing...</span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                            <a 
                                                href={cv.storagePath} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-100 text-gray-400 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
                                                title="View CV"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </a>
                                            <button 
                                                onClick={(e) => handleDeleteCv(cv.id, e)}
                                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-100 text-gray-400 hover:text-red-500 hover:border-red-200 transition-all shadow-sm"
                                                title="Delete CV"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Job Description Section */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <div className="flex items-center gap-2 mb-5">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            <h2 className="font-bold text-gray-900 text-lg">Job Description</h2>
                        </div>
                        <div className="space-y-3">
                            <textarea
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                placeholder="Paste the job description here to help AI tailor the interview questions to the specific role and requirements..."
                                className="w-full h-40 p-4 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none text-sm text-gray-700 placeholder-gray-400 transition-all"
                            />
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-gray-400">
                                    {jobDescription.length} characters
                                </p>
                                <div className="flex items-center gap-4">
                                    {jobDescription.trim().length > 0 && (
                                        <button
                                            type="button"
                                            onClick={handleAIAnalyze}
                                            disabled={isAnalyzingJD || cvs.length === 0}
                                            className="text-xs font-bold text-primary hover:underline flex items-center gap-1 disabled:opacity-50 disabled:no-underline"
                                            title={cvs.length === 0 ? "Upload a CV first" : ""}
                                        >
                                            {isAnalyzingJD ? (
                                                <>
                                                    <span className="w-3 h-3 rounded-full border-2 border-primary border-t-transparent animate-spin inline-block"></span>
                                                    Analyzing...
                                                </>
                                            ) : (
                                                <>Extract AI Tags</>
                                            )}
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setJobDescription("");
                                            setKeyRequirements([]);
                                        }}
                                        className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        Clear
                                    </button>
                                </div>
                            </div>

                            {jdAnalyzeError && (
                                <p className="text-xs text-red-500 mt-2">{jdAnalyzeError}</p>
                            )}

                            {cvMatchResult && (
                                <motion.div
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/20"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-primary uppercase tracking-wider">CV-JD Match Score</span>
                                        <span className="text-lg font-black text-primary">{cvMatchResult.match_score ?? "—"}%</span>
                                    </div>
                                    {cvMatchResult.analysis && (
                                        <p className="text-xs text-gray-600 mb-2">{cvMatchResult.analysis}</p>
                                    )}
                                    {cvMatchResult.recommendation && (
                                        <p className="text-xs text-gray-500 italic">{cvMatchResult.recommendation}</p>
                                    )}
                                </motion.div>
                            )}

                            {/* Requirements Tags */}
                            {keyRequirements.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-100 animate-entry">
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Key Requirements (AI Extracted)</label>
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {keyRequirements.map((req, idx) => (
                                            <span key={idx} className="bg-primary/5 border border-primary/20 text-primary text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-semibold">
                                                {req}
                                                <button type="button" onClick={() => setKeyRequirements(prev => prev.filter((_, i) => i !== idx))} className="hover:text-red-500 font-bold text-sm leading-none">×</button>
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            value={newRequirement} 
                                            onChange={e => setNewRequirement(e.target.value)} 
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    if (newRequirement.trim()) {
                                                        setKeyRequirements(prev => [...prev, newRequirement.trim()]);
                                                        setNewRequirement("");
                                                    }
                                                }
                                            }}
                                            placeholder="Add custom requirement tag & press Enter..." 
                                            className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-gray-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => {
                                                if (newRequirement.trim()) {
                                                    setKeyRequirements(prev => [...prev, newRequirement.trim()]);
                                                    setNewRequirement("");
                                                }
                                            }}
                                            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs font-bold transition-all"
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>

                    {/* Job Selection - 3 Columns */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <div className="flex items-center gap-2 mb-5">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <h2 className="font-bold text-gray-900 text-lg">Job Selection</h2>
                        </div>

                        {loadingGroups ? (
                            <div className="grid grid-cols-3 gap-4">
                                {[0,1,2].map(i => (
                                    <div key={i} className="h-48 bg-gray-50 rounded-xl animate-pulse" />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Column 1: Job Groups */}
                                <div className="flex flex-col gap-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 px-1">Job Groups</p>
                                    <div className="space-y-1 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
                                        {groups.length === 0 ? (
                                            <p className="text-xs text-gray-400 italic text-center py-4">No data available</p>
                                        ) : groups.map(group => (
                                            <button
                                                key={group.id}
                                                onClick={() => {
                                                    setSelectedGroup(group)
                                                    setSelectedCategory(null)
                                                    setSelectedRole(null)
                                                }}
                                                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                                    selectedGroup?.id === group.id
                                                        ? "bg-primary text-white shadow-md shadow-primary/20"
                                                        : "bg-gray-50 text-gray-600 hover:bg-primary/5 hover:text-primary"
                                                }`}
                                            >
                                                {group.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Column 2: Categories */}
                                <div className="flex flex-col gap-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 px-1">Categories</p>
                                    <div className="space-y-1 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
                                        {!selectedGroup ? (
                                            <p className="text-xs text-gray-400 italic text-center py-4">← Select a group first</p>
                                        ) : availableCategories.length === 0 ? (
                                            <p className="text-xs text-gray-400 italic text-center py-4">No categories available</p>
                                        ) : availableCategories.map(cat => (
                                            <button
                                                key={cat.id}
                                                onClick={() => {
                                                    setSelectedCategory(cat)
                                                    setSelectedRole(null)
                                                }}
                                                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                                    selectedCategory?.id === cat.id
                                                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                                                        : "bg-gray-50 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
                                                }`}
                                            >
                                                {cat.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Column 3: Roles */}
                                <div className="flex flex-col gap-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 px-1">Job Roles</p>
                                    <div className="space-y-1 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
                                        {!selectedCategory ? (
                                            <p className="text-xs text-gray-400 italic text-center py-4">← Select a category first</p>
                                        ) : availableRoles.length === 0 ? (
                                            <p className="text-xs text-gray-400 italic text-center py-4">No roles available</p>
                                        ) : availableRoles.map(role => (
                                            <button
                                                key={role.id}
                                                onClick={() => setSelectedRole(role)}
                                                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                                    selectedRole?.id === role.id
                                                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
                                                        : "bg-gray-50 text-gray-600 hover:bg-emerald-50 hover:text-emerald-600"
                                                }`}
                                            >
                                                {role.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Selection Summary */}
                        {(selectedGroup || selectedCategory || selectedRole) && (
                            <motion.div
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-2"
                            >
                                <span className="text-xs text-gray-400 font-semibold">Selected:</span>
                                {selectedGroup && <span className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-bold rounded-lg">{selectedGroup.name}</span>}
                                {selectedCategory && <><span className="text-gray-300">›</span><span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg">{selectedCategory.name}</span></>}
                                {selectedRole && <><span className="text-gray-300">›</span><span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg">{selectedRole.name}</span></>}
                            </motion.div>
                        )}
                    </div>

                    {/* Experience Level */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <div className="flex items-center gap-2 mb-5">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <h2 className="font-bold text-gray-900 text-lg">Experience Level</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {experienceLevels.map(({ label, desc }, index) => (
                                <motion.button
                                    key={label}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: index * 0.1 }}
                                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                                    onClick={() => setSelectedLevel(label)}
                                    className={`relative text-left p-4 rounded-xl border-2 transition-all ${selectedLevel === label
                                        ? "border-primary bg-blue-50"
                                        : "border-gray-100 bg-gray-50 hover:border-primary/40"
                                        }`}
                                >
                                    {selectedLevel === label && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute top-3 right-3 flex items-center gap-1.5"
                                        >
                                            {isAutoSelected && (
                                                <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-md uppercase tracking-wider">AI Choice</span>
                                            )}
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        </motion.div>
                                    )}
                                    <p className="font-bold text-gray-900 text-sm mb-1">{label}</p>
                                    <p className="text-xs text-gray-400">{desc}</p>
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Interview Type */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <div className="flex items-center gap-2 mb-5">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            <h2 className="font-bold text-gray-900 text-lg">Interview Type</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {interviewTypes.map(({ label, desc, icon }, index) => (
                                <motion.button
                                    key={label}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                                    onClick={() => setSelectedType(label)}
                                    className={`relative text-center p-6 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${selectedType === label
                                        ? "border-primary bg-blue-50 text-primary"
                                        : "border-gray-100 bg-gray-50 hover:border-primary/40 text-gray-500"
                                        }`}
                                >
                                    {selectedType === label && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute top-3 right-3 flex items-center gap-1.5"
                                        >
                                            {isAutoSelected && (
                                                <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-md uppercase tracking-wider">AI Pick</span>
                                            )}
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        </motion.div>
                                    )}
                                    {icon}
                                    <div>
                                        <p className="font-bold text-gray-900 text-sm">{label}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="mt-10 flex flex-col items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Estimated duration: 30-45 minutes
                    </div>
                    {startError && (
                        <div className="w-full rounded-2xl bg-red-50 border border-red-100 text-red-700 px-4 py-3 text-sm text-center mb-3">
                            {startError}
                        </div>
                    )}
                    <button
                        onClick={handleStartInterview}
                        disabled={isStartingInterview}
                        className={`flex items-center gap-3 px-12 py-4 rounded-2xl font-bold text-base transition-all ${isStartingInterview ? "bg-gray-300 text-gray-700 cursor-not-allowed" : "bg-primary text-white hover:bg-primary-dark hover:shadow-lg"}`}
                    >
                        {isStartingInterview ? "Starting Interview..." : "Start Interview"}
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </button>
                    <p className="text-xs text-gray-400">By starting, you agree to our terms of practice.</p>
                </div>
            </main>



            {/* Custom Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteConfirmId && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setDeleteConfirmId(null)}
                            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 overflow-hidden"
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mb-6">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Resume?</h3>
                                <p className="text-gray-500 text-sm mb-8">
                                    Are you sure you want to remove this resume? This action cannot be undone.
                                </p>
                                <div className="flex gap-3 w-full">
                                    <button
                                        onClick={() => setDeleteConfirmId(null)}
                                        className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmDelete}
                                        className="flex-1 py-3 px-4 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors shadow-lg shadow-red-200"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
