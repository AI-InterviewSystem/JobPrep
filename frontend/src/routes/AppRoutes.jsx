import { Routes, Route, useLocation } from "react-router-dom"
import { AnimatePresence } from "framer-motion"
import AnimatedPage from "../components/AnimatedPage"

import LandingPage from "../pages/LandingPage"
import SignupPage from "../pages/SignupPage"
import PricingPage from "../pages/PricingPage"
import DashboardPage from "../pages/DashboardPage"
import InterviewSetupPage from "../pages/InterviewSetupPage"
import LiveInterviewPage from "../pages/LiveInterviewPage"
import InterviewResultPage from "../pages/InterviewResultPage"

export default function AppRoutes() {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>

                <Route path="/" element={<AnimatedPage><LandingPage /></AnimatedPage>} />

                <Route path="/signup" element={<AnimatedPage><SignupPage /></AnimatedPage>} />

                <Route path="/pricing" element={<AnimatedPage><PricingPage /></AnimatedPage>} />

                <Route path="/dashboard" element={<AnimatedPage><DashboardPage /></AnimatedPage>} />

                <Route path="/interview-setup" element={<AnimatedPage><InterviewSetupPage /></AnimatedPage>} />

                <Route path="/live-interview" element={<AnimatedPage><LiveInterviewPage /></AnimatedPage>} />

                <Route path="/interview-result" element={<AnimatedPage><InterviewResultPage /></AnimatedPage>} />

            </Routes>
        </AnimatePresence>
    )

}