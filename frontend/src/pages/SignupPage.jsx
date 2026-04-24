import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { authApi } from "../services/api"
import logo from "../assets/images/jobprep-logo.png"

export default function SignupPage() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        fullName: ""
    })
    const [error, setError] = useState({})
    const [passwordError, setPasswordError] = useState("")
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError({})
        setPasswordError("")

        // Frontend validation
        if (formData.password !== formData.confirmPassword) {
            setPasswordError("Passwords do not match")
            return
        }

        const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/
        if (!passwordRegex.test(formData.password)) {
            setPasswordError("Password must be at least 8 characters and contain a letter, a number, and a special character")
            return
        }

        setLoading(true)
        try {
            // Send only required data to backend
            const { confirmPassword, ...registerData } = formData
            await authApi.register(registerData)
            // Redirect to OTP page instead of dashboard
            navigate(`/verify-otp?email=${encodeURIComponent(formData.email)}`)
        } catch (err) {
            if (err.response?.data) {
                setError(err.response.data)
            } else {
                setError({ message: "Something went wrong" })
            }
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleLogin = () => {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/ai-interview"
        window.location.href = `${baseUrl}/oauth2/authorization/google`
    }

    return (
        <div className="min-h-screen bg-gray-50 font-display">
            <header className="border-b border-gray-100 bg-white px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <img src={logo} alt="JobPrep" className="h-8" />
                        <span className="font-bold text-gray-900">JobPrep</span>
                    </Link>
                    <div />
                </div>
            </header>

            <main className="flex flex-col items-center justify-center py-16 px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-md"
                >
                    <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-2">Start your journey</h1>
                    <p className="text-gray-500 text-center mb-8">
                        Join JobPrep today and land your dream role with AI-powered interview prep.
                    </p>

                    <div className="flex gap-4 mb-6">
                        <button 
                            onClick={handleGoogleLogin}
                            className="flex-1 flex items-center justify-center gap-3 bg-white border border-gray-200 rounded-full py-3 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Google
                        </button>
                    </div>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-px flex-1 bg-gray-200"></div>
                        <span className="text-sm text-gray-400">Or continue with email</span>
                        <div className="h-px flex-1 bg-gray-200"></div>
                    </div>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        {error.message && (
                            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100">
                                {error.message}
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="John Doe"
                                required
                                className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                            />
                            {error.fullName && <p className="text-xs text-red-500 mt-1">{error.fullName}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="you@company.com"
                                required
                                className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                            />
                            {error.email && <p className="text-xs text-red-500 mt-1">{error.email}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required
                                className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required
                                className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                            />
                            {passwordError && <p className="text-xs text-red-500 mt-1">{passwordError}</p>}
                            {error.password && <p className="text-xs text-red-500 mt-1">{error.password}</p>}
                            <p className="text-xs text-gray-400 mt-2">
                                Must be at least 8 characters, include a letter, a number, and a special character.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-white font-bold py-3.5 rounded-full hover:bg-primary-dark transition-all hover:shadow-lg disabled:opacity-50"
                        >
                            {loading ? "Creating Account..." : "Create Account"}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-500">
                        Already have an account?{" "}
                        <Link to="/login" className="text-primary font-semibold hover:underline">Log in</Link>
                    </div>
                </motion.div>
            </main>

            <footer className="text-center py-6 text-sm text-gray-400">
                © 2024 JobPrep Inc. All rights reserved.
            </footer>
        </div>
    )
}
