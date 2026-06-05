import { useNavigate, useLocation } from "react-router-dom"
import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { interviewSessionApi, behaviorApi } from "../services/api"

const DEFAULT_TOTAL_QUESTIONS = 10
const INITIAL_QUESTION = 1
const FRAME_INTERVAL_MS = 2000   // capture a webcam frame every 2 seconds

const aiMessage = `AI: "Thank you for that background. Now, regarding your experience..."`

// ─── Behavior warning overlay ────────────────────────────────────────────────
function BehaviorWarningBanner({ warnings }) {
    if (!warnings || warnings.length === 0) return null
    const latestWarning = formatBehaviorWarning(warnings[warnings.length - 1])
    return (
        <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute top-3 left-3 right-3 z-10 bg-red-600/90 backdrop-blur-sm text-white text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-2"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 19H19a2 2 0 001.73-3L13.73 4a2 2 0 00-3.46 0L3.27 16A2 2 0 005.07 19z" />
            </svg>
            <span>{latestWarning}</span>
        </motion.div>
    )
}

function formatBehaviorWarning(warning) {
    if (warning == null) return ""
    if (typeof warning === "string") return warning
    if (typeof warning === "object") {
        return warning.message || warning.type || JSON.stringify(warning)
    }
    return String(warning)
}

// ─── Behavior status indicator ───────────────────────────────────────────────
function BehaviorStatusDot({ faceCount, isLookingAway }) {
    let color = "bg-green-400"
    let label = "Face OK"
    if (faceCount === 0) { color = "bg-red-500"; label = "No Face" }
    else if (faceCount > 1) { color = "bg-yellow-400"; label = "Multiple Faces" }
    else if (isLookingAway) { color = "bg-orange-400"; label = "Looking Away" }

    return (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
            <span className={`w-2 h-2 rounded-full ${color} animate-pulse`} />
            <span className="text-white text-[10px] font-semibold uppercase tracking-wide">{label}</span>
        </div>
    )
}

export default function LiveInterviewPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const videoRef = useRef(null)
    const canvasRef = useRef(null)

    const [sessionId, setSessionId] = useState(null)
    const [session, setSession] = useState(null)
    const [permissionsGranted, setPermissionsGranted] = useState(false)
    const [permissionLoading, setPermissionLoading] = useState(false)
    const [permissionError, setPermissionError] = useState("")

    const [sessionStarted, setSessionStarted] = useState(false)
    const [currentTranscript, setCurrentTranscript] = useState("")
    const [isRecording, setIsRecording] = useState(false)
    const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false)
    const [supportSpeechRecognition, setSupportSpeechRecognition] = useState(true)
    const [recordingError, setRecordingError] = useState("")

    const [mediaStream, setMediaStream] = useState(null)
    const [questionNum, setQuestionNum] = useState(INITIAL_QUESTION)
    const [seconds, setSeconds] = useState(0)
    const [isPaused, setIsPaused] = useState(false)
    const [sessionSecondsLeft, setSessionSecondsLeft] = useState(14 * 60 + 22)
    const [isAiMuted, setIsAiMuted] = useState(false)
    const [isAiSpeaking, setIsAiSpeaking] = useState(false)

    // ── Behavior monitoring state ─────────────────────────────────────────
    const [behaviorSessionId, setBehaviorSessionId] = useState(null)
    const [behaviorWarnings, setBehaviorWarnings] = useState([])
    const [behaviorFaceCount, setBehaviorFaceCount] = useState(1)
    const [behaviorLookingAway, setBehaviorLookingAway] = useState(false)
    const behaviorSessionIdRef = useRef(null)   // kept in sync with state for callbacks
    const frameIntervalRef = useRef(null)

    const mediaRecorderRef = useRef(null)
    const audioChunksRef = useRef([])
    const recognitionRef = useRef(null)
    const transcriptRef = useRef("")
    const questionStartTimeRef = useRef(null)

    // ── Keep behavior session ref in sync ─────────────────────────────────
    useEffect(() => { behaviorSessionIdRef.current = behaviorSessionId }, [behaviorSessionId])

    // ── Session loading ───────────────────────────────────────────────────
    useEffect(() => {
        const loadSession = async () => {
            const params = new URLSearchParams(location.search)
            const urlSessionId = params.get("sessionId")
            if (urlSessionId) { setSessionId(urlSessionId); return }

            const stored = localStorage.getItem("interview_setup")
            if (stored) {
                try {
                    const parsed = JSON.parse(stored)
                    if (parsed?.sessionId) { setSessionId(parsed.sessionId); return }
                } catch { /* ignore malformed */ }
            }

            try {
                const createRes = await interviewSessionApi.create({ jobDescriptionId: null })
                setSessionId(createRes.data.id)
                localStorage.setItem("interview_setup", JSON.stringify({ sessionId: createRes.data.id }))
            } catch (err) {
                console.error("Unable to create interview session", err)
                setPermissionError("Unable to create the interview session. Please refresh and try again.")
            }
        }
        loadSession()
    }, [location.search])

    // ── Timers ────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!sessionStarted || isPaused) return
        const t1 = setInterval(() => setSeconds((prev) => prev + 1), 1000)
        const t2 = setInterval(() => setSessionSecondsLeft((prev) => Math.max(0, prev - 1)), 1000)
        return () => { clearInterval(t1); clearInterval(t2) }
    }, [isPaused, sessionStarted])

    // ── Video element ─────────────────────────────────────────────────────
    useEffect(() => {
        if (videoRef.current && mediaStream) {
            videoRef.current.srcObject = mediaStream
        }
    }, [mediaStream])

    // ── Auto-request media permissions once session id is available ───────
    useEffect(() => {
        if (!sessionId) return
        requestMediaPermissions()
    }, [sessionId])

    // ── Start behavior monitoring when interview session starts ───────────
    useEffect(() => {
        if (!sessionStarted || !permissionsGranted) return

        let cancelled = false
        const start = async () => {
            try {
                const res = await behaviorApi.start()
                if (cancelled) return
                const id = res.data?.session_id
                if (id) {
                    setBehaviorSessionId(id)
                    console.log("[Behavior] session started:", id)
                }
            } catch (err) {
                console.warn("[Behavior] failed to start monitoring session:", err)
            }
        }
        start()
        return () => { cancelled = true }
    }, [sessionStarted, permissionsGranted])

    // ── Periodic frame capture ────────────────────────────────────────────
    const captureAndSendFrame = useCallback(async () => {
        const bId = behaviorSessionIdRef.current
        if (!bId || !videoRef.current || !canvasRef.current) return

        const video = videoRef.current
        if (video.readyState < 2 || video.videoWidth === 0) return

        const canvas = canvasRef.current
        canvas.width = 320
        canvas.height = 180
        const ctx = canvas.getContext("2d")
        ctx.drawImage(video, 0, 0, 320, 180)

        canvas.toBlob(async (blob) => {
            if (!blob) return
            try {
                const res = await behaviorApi.sendFrame(bId, blob, Date.now() / 1000)
                const data = res.data
                if (data) {
                    setBehaviorFaceCount(data.face_count ?? 1)
                    setBehaviorLookingAway(data.is_looking_away ?? false)
                    if (Array.isArray(data.warnings) && data.warnings.length > 0) {
                        setBehaviorWarnings(data.warnings.map(formatBehaviorWarning))
                    } else {
                        setBehaviorWarnings([])
                    }
                }
            } catch (err) {
                // silently skip failed frames
                console.warn("[Behavior] frame upload error:", err?.message)
            }
        }, "image/jpeg", 0.7)
    }, [])

    useEffect(() => {
        if (!behaviorSessionId || !sessionStarted) return
        frameIntervalRef.current = setInterval(captureAndSendFrame, FRAME_INTERVAL_MS)
        return () => clearInterval(frameIntervalRef.current)
    }, [behaviorSessionId, sessionStarted, captureAndSendFrame])

    // ── Media recorder setup ──────────────────────────────────────────────
    useEffect(() => {
        if (!sessionStarted || !mediaStream) return
        if (!window.MediaRecorder) {
            setRecordingError("Your browser does not support recording for this interview.")
            return
        }
        try {
            const mimeType = getSupportedRecordingMimeType()
            const recorder = new MediaRecorder(mediaStream, mimeType ? { mimeType } : undefined)
            recorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) audioChunksRef.current.push(event.data)
            }
            recorder.onerror = (event) => {
                console.error("MediaRecorder error", event)
                setRecordingError("Recording failed. Your session will continue without a saved video file.")
            }
            mediaRecorderRef.current = recorder
            audioChunksRef.current = []
            setRecordingError("")
            startQuestionCapture()
        } catch (err) {
            console.error("Failed to initialize recorder", err)
            setRecordingError("Unable to initialize the interview recorder.")
        }
        return () => {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
                mediaRecorderRef.current.stop()
            }
            mediaRecorderRef.current = null
            audioChunksRef.current = []
        }
    }, [sessionStarted, mediaStream])

    // ── Speech recognition ────────────────────────────────────────────────
    useEffect(() => {
        if (!sessionStarted || isSubmittingAnswer || isPaused || isAiSpeaking) {
            if (recognitionRef.current) {
                try { recognitionRef.current.stop() } catch (e) { /* ignore */ }
            }
            return
        }
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        if (!SpeechRecognition) { setSupportSpeechRecognition(false); return }

        setSupportSpeechRecognition(true)
        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = "en-US"
        recognition.onresult = (event) => {
            let interimTranscript = ""
            let finalTranscript = transcriptRef.current
            for (let i = event.resultIndex; i < event.results.length; i += 1) {
                const result = event.results[i]
                const transcript = result[0].transcript
                if (result.isFinal) { finalTranscript += transcript + " " }
                else { interimTranscript += transcript }
            }
            transcriptRef.current = finalTranscript
            setCurrentTranscript(finalTranscript + interimTranscript)
        }
        recognition.onerror = (event) => console.error("SpeechRecognition error", event)
        recognition.onend = () => {
            if (sessionStarted && !isSubmittingAnswer && !isPaused && !isAiSpeaking) {
                try { recognition.start() } catch (err) { console.error("Failed to restart speech recognition", err) }
            }
        }
        try { recognition.start() } catch (err) { console.error("Failed to start speech recognition", err) }
        recognitionRef.current = recognition
        return () => {
            recognition.onend = null
            try { recognition.stop() } catch (e) { }
            recognitionRef.current = null
        }
    }, [sessionStarted, isSubmittingAnswer, isPaused, isAiSpeaking])

    // ── Cleanup media stream ──────────────────────────────────────────────
    useEffect(() => {
        return () => {
            if (mediaStream) mediaStream.getTracks().forEach((track) => track.stop())
        }
    }, [mediaStream])

    // ── Cleanup behavior monitoring on unmount ────────────────────────────
    useEffect(() => {
        return () => {
            clearInterval(frameIntervalRef.current)
            const bId = behaviorSessionIdRef.current
            if (bId) {
                behaviorApi.end(bId).catch(() => { /* best-effort */ })
            }
        }
    }, [])

    // ── AI voice ─────────────────────────────────────────────────────────
    useEffect(() => {
        if (!sessionStarted || !currentQuestionText || isAiMuted || isPaused) {
            window.speechSynthesis.cancel(); return
        }
        const speak = () => {
            window.speechSynthesis.cancel()
            const utterance = new SpeechSynthesisUtterance(currentQuestionText)
            utterance.lang = "en-US"; utterance.rate = 0.95; utterance.pitch = 1.0
            utterance.onstart = () => setIsAiSpeaking(true)
            utterance.onend = () => setIsAiSpeaking(false)
            utterance.onerror = () => setIsAiSpeaking(false)
            const voices = window.speechSynthesis.getVoices()
            const voice = voices.find(v => v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Natural"))) || voices[0]
            if (voice) utterance.voice = voice
            window.speechSynthesis.speak(utterance)
        }
        if (window.speechSynthesis.getVoices().length === 0) {
            window.speechSynthesis.onvoiceschanged = speak
        } else { speak() }
        return () => { window.speechSynthesis.cancel(); setIsAiSpeaking(false) }
    }, [questionNum, sessionStarted, isAiMuted, isPaused])

    const fmt = (secs) => {
        const m = String(Math.floor(secs / 60)).padStart(2, "0")
        const s = String(secs % 60).padStart(2, "0")
        return `${m}:${s}`
    }

    const currentQuestionText = session?.questions?.[questionNum - 1]?.questionText || "Waiting for the AI interviewer to generate the next question..."
    const totalQuestions = Math.max(1, Number(session?.totalQuestions) || DEFAULT_TOTAL_QUESTIONS)
    const progressPct = ((questionNum - 1) / totalQuestions) * 100

    const getSupportedRecordingMimeType = () => {
        if (!window.MediaRecorder || !MediaRecorder.isTypeSupported) return ""
        const types = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm", "audio/webm"]
        return types.find((type) => MediaRecorder.isTypeSupported(type)) || ""
    }

    const startQuestionCapture = () => {
        if (!mediaRecorderRef.current || mediaRecorderRef.current.state !== "inactive") return
        audioChunksRef.current = []
        questionStartTimeRef.current = Date.now()
        try { mediaRecorderRef.current.start(); setIsRecording(true) } catch (err) {
            console.error("Failed to start recording", err)
            setRecordingError("Unable to start recording for the current response.")
        }
    }

    const stopQuestionCapture = () => {
        return new Promise((resolve) => {
            if (!mediaRecorderRef.current || mediaRecorderRef.current.state === "inactive") return resolve(null)
            const recorder = mediaRecorderRef.current
            recorder.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: audioChunksRef.current[0]?.type || "video/webm" })
                setIsRecording(false)
                resolve(blob)
            }
            recorder.stop()
        })
    }

    const getCurrentQuestionDuration = () => {
        if (!questionStartTimeRef.current) return 0
        return Math.max(0, Math.round((Date.now() - questionStartTimeRef.current) / 1000))
    }

    const uploadRecordingBlob = async (blob, questionId, answerId, durationSeconds, transcriptText) => {
        if (!blob || blob.size === 0) return null
        const rawType = blob.type || "video/webm"
        const cleanType = rawType.split(";")[0] || "video/webm"
        const isVideo = cleanType.startsWith("video/")
        const file = new File([blob], `interview-answer-${questionId}.webm`, { type: cleanType })
        const formData = new FormData()
        formData.append("file", file)
        formData.append("questionId", questionId)
        if (answerId) formData.append("answerId", answerId)
        formData.append("recordingType", isVideo ? "video" : "audio")
        formData.append("durationSeconds", String(durationSeconds || 0))
        formData.append("transcriptText", transcriptText || "")
        try {
            const uploadRes = await interviewSessionApi.uploadRecording(sessionId, formData)
            return uploadRes.data
        } catch (err) {
            console.error("Recording upload failed", err)
            setRecordingError("Unable to save the answer recording at this time.")
            return null
        }
    }

    const submitCurrentAnswer = async () => {
        const currentQuestion = session?.questions?.[questionNum - 1]
        if (!currentQuestion) {
            setPermissionError("No AI question is available for this session. Please restart from the setup page.")
            return false
        }
        setIsSubmittingAnswer(true)
        setRecordingError("")
        const answerText = currentTranscript || ""
        const durationSeconds = getCurrentQuestionDuration()
        const recordingBlob = await stopQuestionCapture()
        const answerData = {
            questionId: currentQuestion.id,
            answerText,
            inputType: recordingBlob && recordingBlob.size > 0 ? "VIDEO" : "TEXT",
            durationSeconds,
        }
        try {
            const answerRes = await interviewSessionApi.submitAnswer(sessionId, answerData)
            await uploadRecordingBlob(recordingBlob, currentQuestion.id, answerRes.data?.answerId, durationSeconds, answerText)
            const updated = await interviewSessionApi.get(sessionId)
            setSession(updated.data)
            transcriptRef.current = ""
            setCurrentTranscript("")
            return true
        } catch (err) {
            console.error("Failed to submit answer", err)
            const msg = err?.response?.data?.message || err?.response?.data || "Unable to save your answer. Please try again."
            setPermissionError(typeof msg === "string" ? msg : JSON.stringify(msg))
            return false
        } finally {
            setIsSubmittingAnswer(false)
        }
    }

    // ── Complete interview: stop behavior monitoring, then navigate ────────
    const completeInterviewSession = async () => {
        // Stop frame capture
        clearInterval(frameIntervalRef.current)
        frameIntervalRef.current = null

        // Fetch behavior report
        let behaviorReport = null
        const bId = behaviorSessionIdRef.current
        if (bId) {
            try {
                const endRes = await behaviorApi.end(bId)
                behaviorReport = endRes.data
                console.log("[Behavior] report:", behaviorReport)
                setBehaviorSessionId(null)
                behaviorSessionIdRef.current = null
            } catch (err) {
                console.warn("[Behavior] failed to fetch end report:", err)
            }
        }

        try {
            const completeRes = await interviewSessionApi.complete(sessionId)
            localStorage.removeItem("interview_setup")
            navigate("/interview-result", { state: { session: completeRes.data, behaviorReport } })
        } catch (err) {
            console.error("Failed to complete interview session", err)
            setPermissionError("Unable to finish the interview. Please try again.")
        }
    }

    const handleNext = async () => {
        if (isSubmittingAnswer) return
        const submitted = await submitCurrentAnswer()
        if (!submitted) return
        const latestSession = await interviewSessionApi.get(sessionId)
        const updatedSession = latestSession.data
        setSession(updatedSession)
        const availableQuestions = updatedSession?.questions?.length || 0
        const expectedQuestions = Math.max(1, Number(updatedSession?.totalQuestions) || totalQuestions)
        if (questionNum < availableQuestions) {
            transcriptRef.current = ""
            setQuestionNum((q) => q + 1)
            startQuestionCapture()
        } else if (questionNum < expectedQuestions) {
            setPermissionError("Waiting for the AI interviewer to generate the next question. Please try Next Question again in a moment.")
        } else {
            await completeInterviewSession()
        }
    }

    const handleEndInterview = async () => {
        if (isSubmittingAnswer) return
        const submitted = await submitCurrentAnswer()
        if (!submitted) return
        await completeInterviewSession()
    }

    const startInterviewSession = async (id) => {
        try {
            let setup = null
            const stored = localStorage.getItem("interview_setup")
            if (stored) {
                try { setup = JSON.parse(stored) } catch { setup = null }
            }
            const desiredQuestions = Number(setup?.numQuestions) || DEFAULT_TOTAL_QUESTIONS
            const currentSessionRes = await interviewSessionApi.get(id)
            const currentTotalQuestions = Number(currentSessionRes.data?.totalQuestions) || 0
            const canReuseSession =
                currentSessionRes.data?.status === "IN_PROGRESS" &&
                currentSessionRes.data?.aiStatus !== "DEGRADED" &&
                currentTotalQuestions >= desiredQuestions &&
                Array.isArray(currentSessionRes.data?.questions) &&
                currentSessionRes.data.questions.length > 0
            if (
                canReuseSession
            ) {
                setSession(currentSessionRes.data)
                setSessionStarted(true)
                setPermissionError("")
                return
            }

            let startSessionId = id
            if (
                currentSessionRes.data?.status === "IN_PROGRESS" &&
                Array.isArray(currentSessionRes.data?.questions) &&
                currentSessionRes.data.questions.length > 0
            ) {
                const createRes = await interviewSessionApi.create({
                    jobDescriptionId: setup?.jdId || null,
                    roleSnapshot: setup?.roleSnapshot || "",
                    title: setup?.selectedLevel ? `${setup?.selectedType || "Technical"} ${setup.selectedLevel} Interview` : "Technical Interview",
                })
                startSessionId = createRes.data.id
                setSessionId(startSessionId)
                localStorage.setItem("interview_setup", JSON.stringify({ ...(setup || {}), sessionId: startSessionId, numQuestions: desiredQuestions }))
            }
            const startRes = await interviewSessionApi.start(startSessionId, {
                interviewType: setup?.selectedType || "Technical",
                interviewLevel: setup?.selectedLevel || "Junior",
                numQuestions: desiredQuestions,
            })
            setSession(startRes.data)
            setSessionStarted(true)
            setPermissionError("")
        } catch (err) {
            console.error("Failed to start interview session", err)
            const msg = err?.response?.data?.message || err?.response?.data || "Unable to start the interview session. Please refresh and try again."
            setPermissionError(typeof msg === "string" ? msg : JSON.stringify(msg))
        }
    }

    const requestMediaPermissions = async () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setPermissionError("Your browser does not support camera and microphone access.")
            return
        }
        if (!sessionId) {
            setPermissionError("No active interview session found. Please start again from the setup page.")
            return
        }
        setPermissionLoading(true)
        setPermissionError("")
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
            setMediaStream(stream)
            setPermissionsGranted(true)
            await startInterviewSession(sessionId)
        } catch (err) {
            console.error("Media permission request failed", err)
            if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
                setPermissionError("Camera and microphone permission are required. Please allow access in your browser settings.")
            } else {
                setPermissionError("Unable to access camera and microphone. Please check your device and try again.")
            }
        } finally {
            setPermissionLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 font-display flex flex-col">
            {/* Hidden canvas for frame capture */}
            <canvas ref={canvasRef} style={{ display: "none" }} />

            <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
                {/* Session Status Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 font-medium bg-gray-50 px-3 py-1.5 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            AI Interviewer Live
                            <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-green-700">
                                Active
                            </span>
                        </div>
                        {/* Behavior monitoring indicator */}
                        {behaviorSessionId && (
                            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-lg">
                                <span className={`w-2 h-2 rounded-full animate-pulse ${behaviorFaceCount === 0 ? "bg-red-500" : behaviorFaceCount > 1 ? "bg-yellow-400" : behaviorLookingAway ? "bg-orange-400" : "bg-green-400"}`} />
                                Camera Monitor
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsAiMuted(prev => !prev)}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors border ${isAiMuted ? "bg-red-50 border-red-100 text-red-500" : "bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-100"}`}
                            title={isAiMuted ? "Unmute AI Voice" : "Mute AI Voice"}
                        >
                            {isAiMuted ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                </svg>
                            )}
                        </button>
                        <div className="flex items-center gap-2 text-sm text-gray-600 font-medium bg-gray-50 px-3 py-1.5 rounded-lg">
                            <span>Session Ends:</span>
                            <span className="font-bold text-gray-900">{fmt(sessionSecondsLeft)}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors border border-gray-100">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </button>
                        <button className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors border border-gray-100">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="grid lg:grid-cols-5 gap-6">
                    {/* Left - AI Interviewer Video + Transcription */}
                    <div className="lg:col-span-3 space-y-5">
                        {/* AI/Webcam video feed */}
                        <div className="relative rounded-2xl overflow-hidden bg-gray-800 aspect-video">
                            <video
                                ref={videoRef}
                                autoPlay
                                muted
                                playsInline
                                className="w-full h-full object-cover"
                            />

                            {(!mediaStream || !permissionsGranted) && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/50">
                                    <p className="text-lg font-semibold">Starting camera...</p>
                                    {permissionLoading && (
                                        <p className="text-xs text-gray-200 mt-2">Requesting permission</p>
                                    )}
                                    {permissionError && (
                                        <p className="text-xs text-red-200 mt-2">{permissionError}</p>
                                    )}
                                </div>
                            )}

                            {/* Behavior warning banner */}
                            <AnimatePresence>
                                {behaviorWarnings.length > 0 && (
                                    <BehaviorWarningBanner warnings={behaviorWarnings} />
                                )}
                            </AnimatePresence>

                            {/* Behavior status dot */}
                            {behaviorSessionId && permissionsGranted && (
                                <BehaviorStatusDot
                                    faceCount={behaviorFaceCount}
                                    isLookingAway={behaviorLookingAway}
                                />
                            )}

                            <div className="absolute bottom-4 left-4 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
                                <span className="text-white text-xs font-semibold uppercase tracking-widest">AI Interviewer Live</span>
                            </div>
                        </div>

                        {/* Live Transcription */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span className="text-xs font-bold text-primary uppercase tracking-widest">Live Transcription</span>
                            </div>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={aiMessage}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="mb-3"
                                >
                                    <p className="text-sm text-gray-400 italic">{aiMessage}</p>
                                </motion.div>
                            </AnimatePresence>
                            <div className="border-l-4 border-primary pl-4 py-1">
                                <motion.p
                                    key={currentQuestionText}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="text-gray-700 text-sm leading-relaxed font-medium"
                                >
                                    {currentQuestionText}
                                </motion.p>
                            </div>
                            <div className="mt-5 rounded-2xl border border-gray-100 bg-slate-50 p-4">
                                <div className="flex items-center justify-between mb-3 text-xs text-gray-500">
                                    <span>Your live answer transcript</span>
                                    <span>{isRecording ? "Recording video..." : "Listening..."}</span>
                                </div>
                                <p className="min-h-[5rem] text-gray-700 text-sm leading-relaxed">
                                    {currentTranscript || (isAiSpeaking ? "Waiting for AI to finish reading the question..." : "Speak clearly into your microphone. Your answer will appear here as you speak.")}
                                </p>
                                {recordingError && (
                                    <p className="mt-3 text-xs text-red-600">{recordingError}</p>
                                )}
                                {!supportSpeechRecognition && (
                                    <p className="mt-3 text-xs text-amber-600">Speech recognition is unavailable in this browser. Recording will still save your response if supported.</p>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* Right - Controls */}
                    <div className="lg:col-span-2 space-y-5">
                        {/* Progress */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <p className="text-xs text-gray-400 font-medium">Interview Progress</p>
                                    <p className="text-xl font-extrabold text-gray-900">Question {questionNum} of {totalQuestions}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-400 font-medium">Time Elapsed</p>
                                    <p className="text-xl font-extrabold text-primary">{fmt(seconds)}</p>
                                </div>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden mt-3">
                                <motion.div
                                    className="h-full bg-primary rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressPct}%` }}
                                    transition={{ duration: 0.8, ease: "circOut" }}
                                />
                            </div>
                        </div>

                        {/* User Camera preview placeholder */}
                        <div className="rounded-2xl p-5 text-white flex flex-col items-center gap-3"
                            style={{ background: "linear-gradient(135deg,#013066,#0058bd)" }}>
                            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border-2 border-white/40">
                                <span className="text-2xl">👤</span>
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-sm">AI Video</p>
                                <p className="text-blue-200 text-xs">Interviewer camera feed is active...</p>
                            </div>
                            <div className="flex gap-1 mt-1">
                                {[3, 6, 9, 5, 7, 4, 8, 6, 3].map((h, i) => (
                                    <div
                                        key={i}
                                        className="w-1 bg-white/60 rounded-full animate-pulse"
                                        style={{ height: `${h * 2}px`, animationDelay: `${i * 0.08}s` }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Control Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsPaused(p => !p)}
                                className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-3.5 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                            >
                                {isPaused ? (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                        </svg>
                                        Resume
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        Pause
                                    </>
                                )}
                            </button>
                            <button
                                onClick={handleEndInterview}
                                disabled={isSubmittingAnswer}
                                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold transition-all ${isSubmittingAnswer ? 'bg-red-300 text-white cursor-not-allowed' : 'bg-red-500 text-white hover:bg-red-600'}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                End Interview
                            </button>
                        </div>

                        <button
                            onClick={handleNext}
                            disabled={isSubmittingAnswer}
                            className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold transition-all ${isSubmittingAnswer ? 'bg-primary/50 cursor-not-allowed' : 'bg-primary text-white hover:bg-primary-dark'}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                            Next Question
                        </button>

                        {/* Quick Tip */}
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            <div>
                                <p className="text-sm font-bold text-gray-800 mb-0.5">Quick Tip</p>
                                <p className="text-xs text-gray-500">Try to use the STAR method (Situation, Task, Action, Result) for this response.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
