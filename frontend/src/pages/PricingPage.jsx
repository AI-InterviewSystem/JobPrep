import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import logo from "../assets/images/jobprep-logo.png"

const plans = [
    {
        name: "Free Plan",
        subtitle: "Best for exploring features",
        price: "0",
        btnLabel: "Get Started",
        btnStyle: "border border-primary text-primary hover:bg-blue-50",
        popular: false,
        features: [
            { text: "Basic Resume Builder", included: true },
            { text: "2 Mock Interviews / mo", included: true },
            { text: "Community Access", included: true },
            { text: "AI Feedback", included: false },
        ],
    },
    {
        name: "Basic Plan",
        subtitle: "Everything you need to succeed",
        price: "19",
        btnLabel: "Subscribe Now",
        btnStyle: "bg-primary text-white hover:bg-primary-dark",
        popular: true,
        features: [
            { text: "Advanced Resume Builder", included: true },
            { text: "10 Mock Interviews / mo", included: true },
            { text: "Priority Support", included: true },
            { text: "Detailed AI Feedback", included: true },
        ],
    },
    {
        name: "Premium Plan",
        subtitle: "For high-stakes roles",
        price: "49",
        btnLabel: "Go Pro",
        btnStyle: "border border-primary text-primary hover:bg-blue-50",
        popular: false,
        features: [
            { text: "Unlimited Mock Interviews", included: true },
            { text: "1-on-1 Human Coaching", included: true },
            { text: "Expert Resume Review", included: true },
            { text: "Exclusive Masterclasses", included: true },
        ],
    },
]

const comparison = [
    { feature: "Resume Templates", free: "Basic", basic: "Advanced", premium: "All Premium", basicBadge: true, premiumBadge: true },
    { feature: "Mock Interviews", free: "2 / month", basic: "10 / month", premium: "Unlimited" },
    { feature: "AI Instant Feedback", free: false, basic: true, premium: true },
    { feature: "Human Expert Coaching", free: false, basic: false, premium: "Weekly Sessions" },
    { feature: "Priority Support", free: false, basic: true, premium: true },
    { feature: "Job Board Access", free: true, basic: true, premium: true },
]

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
)

const XIcon = () => (
    <span className="text-gray-300 text-lg font-light">—</span>
)

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-gray-50 font-display">
            {/* Navbar */}
            <header className="border-b border-gray-100 bg-white">
                <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
                    <Link to="/" className="flex items-center gap-2">
                        <img src={logo} alt="JobPrep" className="h-8" />
                        <span className="font-bold text-gray-900">JobPrep</span>
                    </Link>
                    <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
                        <a href="#" className="hover:text-primary transition-colors">Features</a>
                        <Link to="/pricing" className="text-primary font-semibold">Pricing</Link>
                        <a href="#" className="hover:text-primary transition-colors">About</a>
                        <a href="#" className="hover:text-primary transition-colors">Contact</a>
                    </nav>
                    <div className="flex items-center gap-4">
                        <Link to="/signup" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Log In</Link>
                        <Link to="/signup" className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors">Get Started</Link>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-16">
                {/* Header */}
                <div className="text-center mb-16 animate-entry">
                    <span className="inline-block bg-blue-50 text-primary text-xs font-semibold px-3 py-1 rounded-full mb-4 tracking-widest uppercase">
                        Pricing Plans
                    </span>
                    <h1 className="text-5xl font-extrabold text-gray-900 mb-4">Invest in Your Future Career</h1>
                    <p className="text-gray-500 max-w-xl mx-auto">
                        Choose the perfect plan to master your interviews, build a winning resume, and land your dream job with AI-powered coaching.
                    </p>
                </div>

                {/* Pricing Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="grid md:grid-cols-3 gap-6 mb-20"
                >
                    {plans.map((plan, index) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{ y: -8, transition: { duration: 0.2 } }}
                            className={`relative bg-white rounded-2xl p-8 border-2 shadow-sm ${plan.popular ? "border-primary shadow-xl" : "border-gray-100 hover:shadow-md"} transition-shadow`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <span className="bg-primary text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wide">Most Popular</span>
                                </div>
                            )}
                            <h3 className="font-bold text-gray-900 text-lg mb-1">{plan.name}</h3>
                            <p className="text-gray-400 text-sm mb-6">{plan.subtitle}</p>
                            <div className="flex items-end gap-1 mb-6">
                                <span className="text-4xl font-extrabold text-gray-900">${plan.price}</span>
                                <span className="text-gray-400 text-sm mb-1">/month</span>
                            </div>
                            <Link
                                to="/signup"
                                className={`block text-center w-full py-2.5 rounded-xl font-semibold text-sm transition-all mb-6 ${plan.btnStyle}`}
                            >
                                {plan.btnLabel}
                            </Link>
                            <ul className="space-y-3">
                                {plan.features.map((f, i) => (
                                    <li key={i} className={`flex items-center gap-2 text-sm ${f.included ? "text-gray-700" : "text-gray-300 line-through"}`}>
                                        {f.included
                                            ? <CheckIcon />
                                            : <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-200" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                        }
                                        {f.text}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Comparison Table */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Compare Plan Features</h2>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700 w-1/2">Feature</th>
                                    <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">Free</th>
                                    <th className="text-center px-6 py-4 text-sm font-semibold text-primary">Basic</th>
                                    <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">Premium</th>
                                </tr>
                            </thead>
                            <tbody>
                                {comparison.map((row, i) => (
                                    <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-700">{row.feature}</td>
                                        <td className="px-6 py-4 text-center text-sm text-gray-500">
                                            {row.free === true ? <span className="flex justify-center"><CheckIcon /></span>
                                                : row.free === false ? <span className="flex justify-center"><XIcon /></span>
                                                    : <span className="bg-gray-100 text-gray-600 rounded px-2 py-0.5 text-xs font-medium">{row.free}</span>}
                                        </td>
                                        <td className="px-6 py-4 text-center text-sm text-gray-500">
                                            {row.basic === true ? <span className="flex justify-center"><CheckIcon /></span>
                                                : row.basic === false ? <span className="flex justify-center"><XIcon /></span>
                                                    : <span className="bg-blue-100 text-primary rounded px-2 py-0.5 text-xs font-medium">{row.basic}</span>}
                                        </td>
                                        <td className="px-6 py-4 text-center text-sm text-gray-500">
                                            {row.premium === true ? <span className="flex justify-center"><CheckIcon /></span>
                                                : row.premium === false ? <span className="flex justify-center"><XIcon /></span>
                                                    : typeof row.premium === "string" && row.premium !== "All Premium"
                                                        ? <span className="text-primary font-medium">{row.premium}</span>
                                                        : <span className="bg-primary text-white rounded px-2 py-0.5 text-xs font-medium">{row.premium}</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Enterprise CTA */}
                <div className="bg-blue-50 border border-blue-100 rounded-2xl px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h3 className="font-bold text-gray-900 text-xl mb-2">Need a custom plan for your school or team?</h3>
                        <p className="text-gray-500 text-sm">We offer specialized enterprise and educational volume pricing for organizations looking to help their members succeed.</p>
                    </div>
                    <Link to="/signup" className="shrink-0 bg-primary text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-primary-dark transition-all whitespace-nowrap">
                        Contact Enterprise Sales
                    </Link>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-100 bg-white py-16 px-6 mt-8">
                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
                        <div>
                            <Link to="/" className="flex items-center gap-2 mb-4">
                                <img src={logo} alt="JobPrep" className="h-6" />
                                <span className="font-bold text-gray-900 text-sm">JobPrep</span>
                            </Link>
                            <p className="text-xs text-gray-400 leading-relaxed">Accelerating career success for the next generation of talent.</p>
                        </div>
                        {[
                            { title: "Product", links: ["AI Interviewer", "Resume Builder", "Career Pathing"] },
                            { title: "Resources", links: ["Interview Guide", "Blog", "Success Stories"] },
                            { title: "Legal", links: ["Privacy Policy", "Terms of Service", "Cookies"] },
                        ].map(({ title, links }) => (
                            <div key={title}>
                                <h4 className="font-semibold text-gray-900 text-sm mb-4">{title}</h4>
                                <ul className="space-y-2">
                                    {links.map(l => <li key={l}><a href="#" className="text-xs text-gray-400 hover:text-primary transition-colors">{l}</a></li>)}
                                </ul>
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-gray-100 pt-6 text-center text-xs text-gray-400">
                        © 2024 JobPrep AI. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    )
}
