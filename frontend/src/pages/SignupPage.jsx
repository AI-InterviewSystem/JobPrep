import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import logo from "../assets/images/jobprep-logo.png"

export default function SignupPage() {
    return (
        <div className="min-h-screen bg-gray-50 font-display">
            {/* Minimal Navbar */}
            <header className="border-b border-gray-100 bg-white px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <img src={logo} alt="JobPrep" className="h-8" />
                        <span className="font-bold text-gray-900">JobPrep</span>
                    </Link>
                    <div className="text-sm text-gray-500">
                        Already have an account?{" "}
                        <Link to="/signup" className="text-primary font-semibold hover:underline">Log in</Link>
                    </div>
                </div>
            </header>

            {/* Form */}
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

                    {/* Social Sign-ups */}
                    <div className="flex gap-4 mb-6">
                        <button className="flex-1 flex items-center justify-center gap-3 bg-white border border-gray-200 rounded-full py-3 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Google
                        </button>
                        <button className="flex-1 flex items-center justify-center gap-3 bg-white border border-gray-200 rounded-full py-3 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#0A66C2">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                            </svg>
                            LinkedIn
                        </button>
                    </div>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-px flex-1 bg-gray-200"></div>
                        <span className="text-sm text-gray-400">Or continue with email</span>
                        <div className="h-px flex-1 bg-gray-200"></div>
                    </div>

                    {/* Email Form */}
                    <form className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email address</label>
                            <input
                                type="email"
                                placeholder="you@company.com"
                                className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                            <div className="relative">
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                />
                                <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </button>
                            </div>
                            <p className="text-xs text-gray-400 mt-2">Must be at least 8 characters long.</p>
                        </div>

                        <div className="flex items-start gap-3">
                            <input type="checkbox" id="terms" className="mt-0.5 w-4 h-4 rounded border-gray-300 accent-primary" />
                            <label htmlFor="terms" className="text-sm text-gray-600">
                                I agree to the{" "}
                                <a href="#" className="text-primary hover:underline font-medium">Terms of Service</a>
                                {" "}and{" "}
                                <a href="#" className="text-primary hover:underline font-medium">Privacy Policy</a>.
                            </label>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-primary text-white font-bold py-3.5 rounded-full hover:bg-primary-dark transition-all hover:shadow-lg"
                        >
                            Create Account
                        </button>
                    </form>

                    <div className="mt-4 flex justify-center">
                        <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 text-xs text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            Secure 256-bit encrypted connection
                        </div>
                    </div>
                </motion.div>
            </main>

            <footer className="text-center py-6 text-sm text-gray-400">
                © 2024 JobPrep Inc. All rights reserved.
            </footer>
        </div>
    )
}
