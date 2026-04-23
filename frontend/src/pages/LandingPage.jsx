import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import logo from "../assets/images/jobprep-logo.png"

const steps = [
    {
        number: "1",
        icon: "work",
        title: "Choose Your Role",
        desc: "Select from over 100+ specialized job roles and industries to customize your mock interview experience.",
    },
    {
        number: "2",
        icon: "record_voice_over",
        title: "Voice Interview",
        desc: "Speak naturally with our conversational AI that mimics a real recruiter's tone and dynamic questioning.",
    },
    {
        number: "3",
        icon: "insights",
        title: "Get Feedback",
        desc: "Receive an instant, detailed performance report highlighting your strengths and specific areas to improve.",
    },
]

const features = [
    {
        icon: "voice_chat",
        title: "Intelligent Voice AI",
        desc: "Experience fluid, lag-free conversations using state-of-the-art speech recognition and generative AI response systems.",
        color: "blue"
    },
    {
        icon: "work",
        title: "Industry-Specific Roles",
        desc: "Our AI is trained on thousands of real interview transcripts across it, finance, healthcare, and more.",
        color: "indigo"
    },
    {
        icon: "monitoring",
        title: "Performance Analytics",
        desc: "Track your improvement over time with visual dashboards showing your growth across different skill categories.",
        color: "sky"
    },
    {
        icon: "video_chat",
        title: "Realistic Mock Environment",
        desc: "Simulate the pressure of a real interview with timed responses and follow-up questions based on your input.",
        color: "blue"
    }
]

const footerLinks = {
    Product: ["Features", "Pricing", "Integrations", "Enterprise"],
    Support: ["Help Center", "Guides", "Privacy", "Terms"],
    Company: ["About", "Blog", "Careers", "Contact"],
}

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-background-light font-display">
            {/* Navbar */}
            <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center gap-12">
                            <Link to="/" className="flex items-center gap-2">
                                <img src={logo} alt="JobPrep" className="h-8 w-auto" />
                                <span className="text-xl font-bold text-primary">JobPrep</span>
                            </Link>

                            <nav className="hidden md:flex items-center gap-8">
                                <a href="#how-it-works" className="text-sm font-semibold text-slate-700 hover:text-primary transition-colors">How It Works</a>
                                <a href="#features" className="text-sm font-semibold text-slate-700 hover:text-primary transition-colors">Features</a>
                                <Link to="/pricing" className="text-sm font-semibold text-slate-700 hover:text-primary transition-colors">Pricing</Link>
                            </nav>
                        </div>

                        <div className="flex items-center gap-4">
                            <Link to="/signup" className="text-sm font-bold text-slate-700 hover:text-primary transition-colors">Login</Link>
                            <Link to="/register" className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-xl shadow-primary/25 transition-all">
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <main className="relative pt-20 pb-20 lg:pt-32 lg:pb-32 overflow-hidden bg-background-light">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="text-center lg:text-left space-y-8 animate-entry">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest shadow-sm">
                                AI-Powered Career Coaching
                            </div>

                            <h1 className="text-5xl lg:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight">
                                Practice Interview with <span className="text-primary">AI in Real Time</span>
                            </h1>

                            <p className="text-lg lg:text-xl text-slate-700 leading-relaxed font-medium">
                                Master your next interview with our advanced AI coach. Get real-time feedback, personalized coaching, and the confidence you need to land your dream job.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                                <Link to="/interview-setup" className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl shadow-primary/25 flex items-center justify-center gap-2 transition-all hover:bg-primary-dark">
                                    Start Free Practice
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                </Link>
                                <button className="w-full sm:w-auto bg-white border border-slate-200 hover:bg-slate-50 px-8 py-4 rounded-xl text-lg font-bold transition-all flex items-center justify-center gap-2 hover:border-primary hover:text-primary">
                                    <span className="material-symbols-outlined">play_circle</span>
                                    See Demo
                                </button>
                            </div>

                            <div className="flex items-center gap-4 text-slate-600 justify-center lg:justify-start">
                                <div className="flex -space-x-2">
                                    <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                                        <img alt="User 1" src="https://lh3.googleusercontent.com/aida-public/AB6AXuALUO359PeI0xkcW5MB-2UoSFCLkyXtfPJn3k7AS48GwYqNqinBQ_ct-jRsGeBDxGnPVP6EQWC6IByHWTgDJ6xll-2EsoI7cfIf1oeXellEzacQLUqZQZ0-MOmcNPVQTU1_axM-Dxtt6X0_MOnaWRF6fh1SVe3I5ZGvAadIRV4kmZye3hM5yHJHlgjS5-xqUnwbosHNbbLofuh3D5dT9kcb9PjTA-w0pNzS0VnHk1VVCPUXehbkdZgwz_--8u-jcnqKhB_rV22x_R0" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                                        <img alt="User 2" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCmJP6kQkD9pd316QX03jvUiSl_pCgCRDS4NKVpNL0F7UL3LWPkg1bEVTuifN_hr_jTpZ6YYVBklRNZ0Afns-3wfi-RsjKBYLpXjVDbdcby98xF9USrvYM0lBSlFcqffZJ41wmgB3UsAGU__QYIAg59MCcaRJJycFWrPehoqoVB3hfC01tMdQN8_paczwQ1YAEJeeamSHN3zNw_mBuivqrCfYXelHe12jAn8gPxt5W505g_02UPnjrnSbLuQYGKF2hxflM54eNRf80" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                                        <img alt="User 3" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBLOoNgGHi1eDIEOWNDVboMSSJZHzsTjvG2VWs3LpRoRn_X3lcwjt785bGNuXTiqGGWkRFyZQgSXZWLRLCCiHsvsTIPGT2rq1peNBAk4nuKA2eBGbPPcMyhkMzXnLcaRE79ch9vbcPmvX1XteT1ew1wrI_wLAoN_0JfYtWewOBI1tazVmea7gID1D2ySmWvsMbyCkLPYuGlvbxjx9BQL6gnaYQb-agAx67NaDvadeSMGp8Ch9Gyohvb-J7SSV3I8X93nzW__kLjQpI" className="w-full h-full object-cover" />
                                    </div>
                                </div>
                                <span className="text-sm font-medium">Joined by 10k+ candidates this month</span>
                            </div>
                        </div>

                        <div className="relative animate-entry" style={{ animationDelay: '200ms' }}>
                            <div className="absolute -inset-4 bg-primary/20 rounded-3xl blur-3xl"></div>
                            <div className="relative bg-white p-4 rounded-3xl shadow-2xl border border-slate-200">
                                <div className="rounded-2xl overflow-hidden aspect-video bg-slate-100 flex items-center justify-center group relative cursor-pointer">
                                    <img alt="Interview dashboard" className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDWmLG5cMrdF18dY9oyaRUG9ZwGAqMV0OetlgHwLZ__nowu-VRNMl77ySgybJi_sFC8Ohkp5H0wAOGFNbPpAjYCd7ygmOU11Zt8mJT_wn7JKHO_YJ_QigPwrA1WEdSkTQAc7BtQ8H7e1J4pby-V7K8oLjYNJJrUsUOVKheQ6Ape1i9fjyeeud-Y3vQuI7Tw1APqqMb3ZoTVm5JWcTPJhf7Be-sZGJirkO-GkzouChjwDXg2HAB1SZfxkqxHChTkZOlIQJpuqaRlOxc" />
                                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                            <span className="material-symbols-outlined text-primary text-3xl">play_arrow</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <div className="h-2 w-32 bg-slate-200 rounded-full"></div>
                                        <div className="h-2 w-12 bg-primary/30 rounded-full"></div>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full"></div>
                                    <div className="h-2 w-2/3 bg-slate-100 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <section id="how-it-works" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-primary font-bold uppercase tracking-widest text-sm mb-4">The Process</h2>
                        <h3 className="text-4xl font-extrabold text-[#0f172a] mb-6">Three Simple Steps to Success</h3>
                        <p className="text-slate-700 text-lg">Our AI-driven platform is designed to take you from nervous candidate to confident hire in record time.</p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="grid md:grid-cols-3 gap-8"
                    >
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="relative p-8 bg-background-light rounded-2xl border border-slate-200"
                            >
                                <div className="absolute -top-4 -left-4 w-10 h-10 bg-primary text-white rounded-lg flex items-center justify-center font-bold shadow-lg">
                                    {step.number}
                                </div>
                                <div className="mb-6 inline-flex p-3 rounded-xl bg-primary/10 text-primary">
                                    <span className="material-symbols-outlined text-3xl">{step.icon}</span>
                                </div>
                                <h4 className="text-xl font-bold text-[#0f172a] mb-3">{step.title}</h4>
                                <p className="text-slate-700">{step.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            <section id="features" className="py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="text-primary font-bold uppercase tracking-widest text-sm mb-4">Core Features</h2>
                            <h3 className="text-4xl font-extrabold text-[#0f172a] mb-8">Everything you need to master your communication</h3>
                            <div className="flex flex-col gap-8">
                                <div className="flex gap-6">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                        <span className="material-symbols-outlined">mic_none</span>
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-[#0f172a] mb-2">Natural Voice Interview</h4>
                                        <p className="text-slate-700">Experience fluid, lag-free conversations using state-of-the-art speech recognition and generative AI response systems.</p>
                                    </div>
                                </div>
                                <div className="flex gap-6">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                        <span className="material-symbols-outlined">analytics</span>
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-[#0f172a] mb-2">Instant AI Feedback</h4>
                                        <p className="text-slate-700">Our AI analyzes your body language (optional), tone, grammar, and content to provide actionable tips within seconds.</p>
                                    </div>
                                </div>
                                <div className="flex gap-6">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                        <span className="material-symbols-outlined">trending_up</span>
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-[#0f172a] mb-2">Personalized Progress</h4>
                                        <p className="text-slate-700">Track your improvement over time with visual dashboards showing your growth across different skill categories.</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-4 pt-12">
                                <div className="p-4 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
                                    <div className="w-full aspect-square rounded-xl bg-primary/5 mb-4 flex items-center justify-center overflow-hidden">
                                        <img alt="Feature 1" className="object-cover w-full h-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDkSSLu9kq9qviOTKvcz3VXy75Tuf4jgJDTew8GboKC8j6zd4AdtLQ_5z0nF4yhSW-jTrzhUgLtEUcVjFztK94lebloWNbv86of9POdKhwX6UyNL4SFnR6UrPAYjjoOXW_T1X1yG3GKKnpgElS7sL4wVfUnnRZgPDG8jY-8-bgYZUptsvyYhCfqTmRf16e4QUk2Yos5wSRm7KPxgn6rIQw_FmHSidu-DacdU2GPV1Zo8xWvdhb1DqmZiXCEHV3jLc7ycz9FKlZ__7Y" />
                                    </div>
                                    <div className="h-2 w-20 bg-primary/20 rounded-full mb-2"></div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full"></div>
                                </div>
                                <div className="p-4 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
                                    <div className="h-2 w-24 bg-primary/20 rounded-full mb-3"></div>
                                    <div className="space-y-2">
                                        <div className="h-2 w-full bg-slate-100 rounded-full"></div>
                                        <div className="h-2 w-4/5 bg-slate-100 rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="p-4 bg-primary rounded-2xl shadow-xl shadow-primary/30 border border-primary/20 text-white">
                                    <span className="material-symbols-outlined text-4xl mb-4">star</span>
                                    <div className="font-bold text-lg mb-1">98% Match</div>
                                    <p className="text-primary-100 text-xs opacity-80">Candidate readiness score based on role requirements.</p>
                                </div>
                                <div className="p-4 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
                                    <div className="w-full aspect-video rounded-xl bg-slate-50 mb-4 flex items-center justify-center overflow-hidden">
                                        <img alt="Feature 2" className="object-cover w-full h-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA89enhRq4XPBQwzq--X9ax4y19Dcutoet6YeUaz6zQFth71Go58nC8C6rQiP8UKHbA1M7UkhazFtJIMwhfEZAwucFcSgyqvbMuiwYNFErPIRXAOiexgesWAbk2JptuiMsTB41SNEscIUQ_pXKIhBlku6AUCFtJAK3Q9jYCdglNQ4AV-nZHRcgk16pDxQ1vUidRMGRcbflOa2JGLwAzWtsLC9-CAQW1uMYFImQ30MsJnuv2GofJF-K2Yn6JvxUhyEM5W1k_ZeAuwhQ" />
                                    </div>
                                    <div className="h-2 w-28 bg-slate-200 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-primary rounded-[2rem] p-8 md:p-16 text-center text-white relative overflow-hidden shadow-2xl shadow-primary/40">
                        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-black/10 rounded-full blur-3xl"></div>
                        <div className="relative z-10 max-w-2xl mx-auto">
                            <h3 className="text-3xl md:text-5xl font-black mb-6">Ready to land that dream job offer?</h3>
                            <p className="text-lg text-primary-50 opacity-90 mb-10">Join thousands of successful candidates who used JobPrep to ace their interviews at top-tier companies.</p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link to="/interview-setup" className="w-full sm:w-auto bg-white text-primary hover:bg-slate-50 px-10 py-4 rounded-xl text-lg font-bold transition-all shadow-lg hover:bg-primary-dark">
                                    Get Started Now
                                </Link>
                                <Link to="/pricing" className="w-full sm:w-auto bg-primary border border-white/30 hover:bg-white/10 px-10 py-4 rounded-xl text-lg font-bold transition-all">
                                    View Pricing
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="bg-white border-t border-slate-200 pt-16 pb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-16">
                        <div className="col-span-2 lg:col-span-2">
                            <div className="flex items-center gap-2 mb-6">
                                <img src={logo} alt="JobPrep Logo" className="h-8 w-auto" />
                                <span className="text-xl font-bold text-primary">JobPrep</span>
                            </div>
                            <p className="text-slate-700 mb-6">
                                Empowering candidates with next-generation AI coaching to master the art of data-driven interviewing.
                            </p>
                            <div className="flex gap-4">
                                {['facebook', 'twitter', 'linkedin'].map((social) => (
                                    <a key={social} href="#" className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 hover:text-primary transition-colors">
                                        <span className="material-symbols-outlined">share</span>
                                    </a>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-[#0f172a] mb-6">Product</h4>
                            <ul className="space-y-4">
                                <li><a href="#" className="text-slate-700 hover:text-primary">Features</a></li>
                                <li><a href="#" className="text-slate-700 hover:text-primary">Pricing</a></li>
                                <li><a href="#" className="text-slate-700 hover:text-primary">Testimonials</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-[#0f172a] mb-6">Company</h4>
                            <ul className="space-y-4">
                                <li><a href="#" className="text-slate-700 hover:text-primary">About Us</a></li>
                                <li><a href="#" className="text-slate-700 hover:text-primary">Careers</a></li>
                                <li><a href="#" className="text-slate-700 hover:text-primary">Contact</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-[#0f172a] mb-6">Legal</h4>
                            <ul className="space-y-4">
                                <li><a href="#" className="text-slate-700 hover:text-primary">Privacy Policy</a></li>
                                <li><a href="#" className="text-slate-700 hover:text-primary">Terms of Service</a></li>
                                <li><a href="#" className="text-slate-700 hover:text-primary">Cookie Policy</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-slate-600 text-sm">© 2024 JobPrep AI. All rights reserved.</p>
                        <div className="flex gap-6 text-sm">
                            <a href="#" className="text-slate-600 hover:text-primary">Privacy</a>
                            <a href="#" className="text-slate-600 hover:text-primary">Terms</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
