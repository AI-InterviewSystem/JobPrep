import { useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { authApi } from "../services/api"
import logo from "../assets/images/jobprep-logo.png"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [status, setStatus] = useState({ text: "", type: "" })
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setStatus({ text: "", type: "" })
        setLoading(true)
        try {
            await authApi.forgotPassword({ email })
            setStatus({ text: "If an account exists with this email, you will receive reset instructions shortly.", type: "success" })
        } catch (err) {
            setStatus({ text: "Something went wrong. Please try again.", type: "error" })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 font-display">
            <main className="flex flex-col items-center justify-center py-16 px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-md"
                >
                    <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-2">Reset Password</h1>
                    <p className="text-gray-500 text-center mb-8">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        {status.text && (
                            <div className={`p-4 rounded-xl mb-6 text-sm ${status.type === "success" ? "bg-green-50 text-green-600 border border-green-100" : "bg-red-50 text-red-600 border border-red-100"}`}>
                                {status.text}
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@company.com"
                                required
                                className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-white font-bold py-3.5 rounded-full hover:bg-primary-dark transition-all hover:shadow-lg disabled:opacity-50"
                        >
                            {loading ? "Sending..." : "Send Reset Link"}
                        </button>

                        <div className="text-center mt-6">
                            <Link to="/login" className="text-sm text-primary font-semibold hover:underline">Back to log in</Link>
                        </div>
                    </form>
                </motion.div>
            </main>
        </div>
    )
}
