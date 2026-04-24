import { Routes, Route, useLocation, Navigate } from "react-router-dom"
import { AnimatePresence } from "framer-motion"
import AnimatedPage from "../components/AnimatedPage"

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

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem("token")
    if (!token) return <Navigate to="/login" />
    return children
}

export default function AppRoutes() {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>

                <Route path="/" element={<AnimatedPage><LandingPage /></AnimatedPage>} />

                <Route path="/signup" element={<AnimatedPage><SignupPage /></AnimatedPage>} />
                <Route path="/login" element={<AnimatedPage><LoginPage /></AnimatedPage>} />
                <Route path="/forgot-password" element={<AnimatedPage><ForgotPasswordPage /></AnimatedPage>} />
                <Route path="/reset-password" element={<AnimatedPage><ResetPasswordPage /></AnimatedPage>} />
                <Route path="/verify-otp" element={<AnimatedPage><OtpPage /></AnimatedPage>} />
                <Route path="/auth/google-callback" element={<GoogleCallback />} />

                <Route path="/pricing" element={<AnimatedPage><PricingPage /></AnimatedPage>} />

                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <AnimatedPage><DashboardPage /></AnimatedPage>
                    </ProtectedRoute>
                } />

                <Route path="/profile" element={
                    <ProtectedRoute>
                        <AnimatedPage><ProfilePage /></AnimatedPage>
                    </ProtectedRoute>
                } />

                <Route path="/interview-setup" element={
                    <ProtectedRoute>
                        <AnimatedPage><InterviewSetupPage /></AnimatedPage>
                    </ProtectedRoute>
                } />

                <Route path="/live-interview" element={
                    <ProtectedRoute>
                        <AnimatedPage><LiveInterviewPage /></AnimatedPage>
                    </ProtectedRoute>
                } />

                <Route path="/interview-result" element={
                    <ProtectedRoute>
                        <AnimatedPage><InterviewResultPage /></AnimatedPage>
                    </ProtectedRoute>
                } />

            </Routes>
        </AnimatePresence>
    )

}