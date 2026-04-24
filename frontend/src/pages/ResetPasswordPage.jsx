import { useState } from "react"
import { Link, useSearchParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { authApi } from "../services/api"
import logo from "../assets/images/jobprep-logo.png"

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams()
    const token = searchParams.get("token")
    const navigate = useNavigate()
    
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [status, setStatus] = useState({ text: "", type: "" })
    const [loading, setLoading] = useState(false)

    const validatePassword = (pass) => {
        const regex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/
        return regex.test(pass)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!token) {
            setStatus({ text: "Missing reset token", type: "error" })
            return
        }

        if (password !== confirmPassword) {
            setStatus({ text: "Passwords do not match", type: "error" })
            return
        }

        if (!validatePassword(password)) {
            setStatus({ text: "Password must be at least 8 characters long and contain at least one letter, one number, and one special character.", type: "error" })
            return
        }

        setStatus({ text: "", type: "" })
        setLoading(true)
        try {
            await authApi.resetPassword({ token, newPassword: password })
            setStatus({ text: "Password reset successful! Redirecting to login...", type: "success" })
            setTimeout(() => navigate("/login"), 3000)
        } catch (err) {
            const message = err.response?.data?.message || err.response?.data || "Something went wrong."
            setStatus({ text: typeof message === 'string' ? message : "Invalid password format.", type: "error" })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 font-display">
            <header className="border-b border-gray-100 bg-white px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <img src={logo} alt="JobPrep" className="h-8" />
                        <span className="font-bold text-gray-900">JobPrep</span>
                    </Link>
                </div>
            </header>

            <main className="flex flex-col items-center justify-center py-16 px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-md"
                >
                    <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-2">Create New Password</h1>
                    <p className="text-gray-500 text-center mb-8">
                        Almost there! Enter your new password below.
                    </p>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        {status.text && (
                            <div className={`p-4 rounded-xl mb-6 text-sm ${status.type === "success" ? "bg-green-50 text-green-600 border border-green-100" : "bg-red-50 text-red-600 border border-red-100"}`}>
                                {status.text}
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                            />
                            <p className="text-xs text-gray-400 mt-2">At least 8 chars, 1 letter, 1 number, 1 special char.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-white font-bold py-3.5 rounded-full hover:bg-primary-dark transition-all hover:shadow-lg disabled:opacity-50"
                        >
                            {loading ? "Resetting..." : "Reset Password"}
                        </button>
                    </form>
                </motion.div>
            </main>
        </div>
    )
}
