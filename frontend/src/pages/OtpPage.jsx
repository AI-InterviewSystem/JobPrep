import { useState, useEffect } from "react"
import { useNavigate, useSearchParams, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { authApi } from "../services/api"
import { storage } from "../services/storage"
import logo from "../assets/images/jobprep-logo.png"

export default function OtpPage() {
    const [searchParams] = useSearchParams()
    const email = searchParams.get("email")
    const [otp, setOtp] = useState(["", "", "", "", "", ""])
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        if (!email) {
            navigate("/signup")
        }
    }, [email, navigate])

    const handleChange = (index, value) => {
        if (isNaN(value)) return
        const newOtp = [...otp]
        newOtp[index] = value.substring(value.length - 1)
        setOtp(newOtp)

        // Focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`)
            nextInput?.focus()
        }
    }

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`)
            prevInput?.focus()
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const otpCode = otp.join("")
        if (otpCode.length < 6) {
            setError("Please enter the full 6-digit code")
            return
        }

        setLoading(true)
        setError("")
        try {
            const response = await authApi.verifyOtp({ email, otpCode })
            // New account registration: default to session-only (no rememberMe)
            storage.setAuth(response.data.token, response.data.user, false)
            navigate("/dashboard")
        } catch (err) {
            setError(err.response?.data?.message || "Invalid or expired OTP code")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 font-display">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100"
            >
                <div className="text-center mb-8">
                    <img src={logo} alt="JobPrep" className="h-10 mx-auto mb-6" />
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Verify your email</h1>
                    <p className="text-gray-500">
                        We've sent a 6-digit verification code to <br />
                        <span className="font-semibold text-gray-900">{email}</span>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="flex justify-between gap-2">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                id={`otp-${index}`}
                                type="text"
                                inputMode="numeric"
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="w-12 h-16 text-center text-2xl font-bold border-2 border-gray-100 rounded-2xl bg-gray-50 focus:bg-white focus:border-primary focus:outline-none transition-all"
                                maxLength={1}
                                required
                            />
                        ))}
                    </div>

                    {error && (
                        <p className="text-sm text-red-500 text-center bg-red-50 py-2 rounded-xl border border-red-100">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white font-bold py-4 rounded-2xl hover:bg-primary-dark transition-all hover:shadow-lg disabled:opacity-50"
                    >
                        {loading ? "Verifying..." : "Verify & Continue"}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500">
                        Didn't receive the code?{" "}
                        <button className="text-primary font-semibold hover:underline">Resend code</button>
                    </p>
                    <Link to="/signup" className="inline-block mt-4 text-sm text-gray-400 hover:text-gray-600 transition-colors">
                        ← Back to registration
                    </Link>
                </div>
            </motion.div>
        </div>
    )
}
