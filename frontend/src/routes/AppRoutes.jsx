import { Routes, Route, useLocation, Navigate } from "react-router-dom"
import { lazy, Suspense } from "react"
import { storage } from "../services/storage"
import AnimatedPage from "../components/AnimatedPage"
import Navbar from "../components/layout/Navbar"
import Footer from "../components/layout/Footer"
import GlobalSpinner from "../components/GlobalSpinner"

const LandingPage = lazy(() => import("../pages/LandingPage"))
const SignupPage = lazy(() => import("../pages/SignupPage"))
const LoginPage = lazy(() => import("../pages/LoginPage"))
const ProfilePage = lazy(() => import("../pages/ProfilePage"))
const ForgotPasswordPage = lazy(() => import("../pages/ForgotPasswordPage"))
const ResetPasswordPage = lazy(() => import("../pages/ResetPasswordPage"))
const GoogleCallback = lazy(() => import("../pages/GoogleCallback"))
const PricingPage = lazy(() => import("../pages/PricingPage"))
const DashboardPage = lazy(() => import("../pages/DashboardPage"))
const NotificationsPage = lazy(() => import("../pages/NotificationsPage"))
const InterviewSetupPage = lazy(() => import("../pages/InterviewSetupPage"))
const LiveInterviewPage = lazy(() => import("../pages/LiveInterviewPage"))
const InterviewResultPage = lazy(() => import("../pages/InterviewResultPage"))
const InterviewHistoryPage = lazy(() => import("../pages/InterviewHistoryPage"))
const QuestionBankPage = lazy(() => import("../pages/QuestionBankPage"))
const AdminDashboard = lazy(() => import("../pages/AdminDashboard"))
const AdminUsersPage = lazy(() => import("../pages/AdminUsersPage"))
const AdminInterviewSessionsPage = lazy(() => import("../pages/AdminInterviewSessionsPage"))
const AdminReportsPage = lazy(() => import("../pages/AdminReportsPage"))
const AdminPricingPlansPage = lazy(() => import("../pages/AdminPricingPlansPage"))
const AdminPromosPage = lazy(() => import("../pages/AdminPromosPage"))
const AdminExperienceLevelsPage = lazy(() => import("../pages/AdminExperienceLevelsPage"))
const AdminJobsPage = lazy(() => import("../pages/AdminJobsPage"))
const AdminQuestionBankPage = lazy(() => import("../pages/AdminQuestionBankPage"))
const CheckoutPage = lazy(() => import("../pages/CheckoutPage"))
const AdminLayout = lazy(() => import("../layouts/AdminLayout"))
const PaymentResultPage = lazy(() => import("../pages/PaymentResultPage"))
const UserFeedbackPage = lazy(() => import("../pages/UserFeedbackPage"))
const AdminFeedbackPage = lazy(() => import("../pages/AdminFeedbackPage"))

const ProtectedRoute = ({ children }) => {
    const token = storage.getToken()
    if (!token) return <Navigate to="/login" />
    return children
}

const AdminRoute = ({ children }) => {
    const token = storage.getToken()
    const user = storage.getUser()

    if (!token) return <Navigate to="/login" />
    if (user?.role !== "ADMIN") return <Navigate to="/dashboard" />

    return children
}

export default function AppRoutes() {
    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith("/admin");

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            {!isAdminRoute && <Navbar />}
            <div className="flex-1">
                <Suspense fallback={<GlobalSpinner />}>
                    <Routes>
                        <Route path="/" element={<LandingPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/auth/google-callback" element={<GoogleCallback />} />

                    <Route path="/pricing" element={<PricingPage />} />
                    <Route
                        path="/checkout"
                        element={
                            <ProtectedRoute>
                                <CheckoutPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            <DashboardPage />
                        </ProtectedRoute>
                    } />

                    <Route path="/notifications" element={
                        <ProtectedRoute>
                            <NotificationsPage />
                        </ProtectedRoute>
                    } />

                    <Route path="/admin" element={
                        <AdminRoute>
                            <AdminLayout />
                        </AdminRoute>
                    }>
                        <Route index element={<Navigate to="dashboard" replace />} />
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="users" element={<AdminUsersPage />} />
                        <Route path="interviews" element={<AdminInterviewSessionsPage />} />
                        <Route path="reports" element={<AdminReportsPage />} />
                        <Route path="jobs" element={<AdminJobsPage />} />
                        <Route path="question-bank" element={<AdminQuestionBankPage />} />
                        <Route path="experience-levels" element={<AdminExperienceLevelsPage />} />
                        <Route path="promos" element={<AdminPromosPage />} />
                        <Route path="pricing-plans" element={<AdminPricingPlansPage />} />
                        <Route path="feedbacks" element={<AdminFeedbackPage />} />
                        <Route path="profile" element={<ProfilePage />} />
                    </Route>

                    <Route path="/feedback" element={
                        <ProtectedRoute>
                            <UserFeedbackPage />
                        </ProtectedRoute>
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

                    <Route path="/question-bank" element={
                        <ProtectedRoute>
                            <QuestionBankPage />
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

                    <Route path="/interview-history" element={
                        <ProtectedRoute>
                            <InterviewHistoryPage />
                        </ProtectedRoute>
                    } />

                    <Route path="/payment/success" element={<PaymentResultPage status="success" />} />
                    <Route path="/payment/cancel" element={<PaymentResultPage status="cancel" />} />
                </Routes>
                </Suspense>
            </div>
            {!isAdminRoute && <Footer />}
        </div>
    )
}
