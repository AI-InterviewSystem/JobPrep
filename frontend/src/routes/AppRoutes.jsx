import { Routes, Route, useLocation, Navigate } from "react-router-dom"
import AnimatedPage from "../components/AnimatedPage"
import Navbar from "../components/layout/Navbar"

import LandingPage from "../pages/LandingPage"
import SignupPage from "../pages/SignupPage"
import LoginPage from "../pages/LoginPage"
import ProfilePage from "../pages/ProfilePage"
import ForgotPasswordPage from "../pages/ForgotPasswordPage"
import ResetPasswordPage from "../pages/ResetPasswordPage"
import GoogleCallback from "../pages/GoogleCallback"
import PricingPage from "../pages/PricingPage"
import DashboardPage from "../pages/DashboardPage"
import InterviewSetupPage from "../pages/InterviewSetupPage"
import LiveInterviewPage from "../pages/LiveInterviewPage"
import InterviewResultPage from "../pages/InterviewResultPage"
import OtpPage from "../pages/OtpPage"
import AdminDashboard from "../pages/AdminDashboard"

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem("token")
    if (!token) return <Navigate to="/login" />
    return children
}

const AdminRoute = ({ children }) => {
    const token = localStorage.getItem("token")
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    
    if (!token) return <Navigate to="/login" />
    if (user.role !== "ADMIN") return <Navigate to="/dashboard" />
    
    return children
}

export default function AppRoutes() {
    const location = useLocation();

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <div className="flex-1">
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/verify-otp" element={<OtpPage />} />
                    <Route path="/auth/google-callback" element={<GoogleCallback />} />

                    <Route path="/pricing" element={<PricingPage />} />

                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            <DashboardPage />
                        </ProtectedRoute>
                    } />

                    <Route path="/admin" element={
                        <AdminRoute>
                            <AdminDashboard />
                        </AdminRoute>
                    } />

                    <Route path="/profile" element={
                        <ProtectedRoute>
                            <ProfilePage />
                        </ProtectedRoute>
                    } />

                    <Route path="/interview-setup" element={
                        <ProtectedRoute>
                            <InterviewSetupPage />
                        </ProtectedRoute>
                    } />

                    <Route path="/live-interview" element={
                        <ProtectedRoute>
                            <LiveInterviewPage />
                        </ProtectedRoute>
                    } />

                    <Route path="/interview-result" element={
                        <ProtectedRoute>
                            <InterviewResultPage />
                        </ProtectedRoute>
                    } />
                </Routes>
            </div>
        </div>
    )
}