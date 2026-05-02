import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { publicPricingPlansApi, paymentApi } from "../services/api"
import AvatarMenu from "../components/layout/AvatarMenu"
import toast from "react-hot-toast"



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
    const navigate = useNavigate()
    const token = localStorage.getItem("token")
    const [plans, setPlans] = useState([])
    const [loading, setLoading] = useState(true)
    const [subscribingId, setSubscribingId] = useState(null)
    const [billingCycle, setBillingCycle] = useState("MONTHLY") 

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await publicPricingPlansApi.getAll()
                const mappedPlans = response.data.map((plan, index) => {
                    let parsedFeatures = []
                    try {
                        parsedFeatures = typeof plan.features === 'string' ? JSON.parse(plan.features) : plan.features
                    } catch (e) {
                        console.error("Failed to parse features for plan:", plan.name)
                    }

                    const formattedFeatures = Array.isArray(parsedFeatures) 
                        ? parsedFeatures.map(f => typeof f === 'string' ? { text: f, included: true } : f)
                        : []

                    return {
                        id: plan.id,
                        name: plan.name,
                        subtitle: plan.description || "Everything you need to succeed",
                        priceMonthly: plan.priceMonthly,
                        priceYearly: plan.priceYearly,
                        btnLabel: (billingCycle === "MONTHLY" ? plan.priceMonthly : plan.priceYearly) === 0 ? "Get Started" : "Subscribe Now",
                        btnStyle: (billingCycle === "MONTHLY" ? plan.priceMonthly : plan.priceYearly) > 0 && index === 1 
                            ? "bg-primary text-white hover:bg-primary-dark shadow-md shadow-primary/30" 
                            : "border border-primary text-primary hover:bg-blue-50",
                        popular: index === 1,
                        features: formattedFeatures
                    }
                })
                setPlans(mappedPlans)
            } catch (error) {
                console.error("Failed to fetch pricing plans:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchPlans()
    }, [])

    const handleSubscribe = async (plan) => {
        if (!token) {
            toast.error("Please login to subscribe")
            navigate("/login")
            return
        }

        const currentPrice = billingCycle === "MONTHLY" ? plan.priceMonthly : plan.priceYearly

        if (currentPrice === 0) {
            navigate("/dashboard")
            return
        }

        try {
            setSubscribingId(plan.id)
            const response = await paymentApi.subscribe({ 
                planId: plan.id, 
                cycle: billingCycle 
            })
            if (response.data && response.data.checkoutUrl) {
                window.location.href = response.data.checkoutUrl
            }
        } catch (error) {
            console.error("Subscription failed:", error)
            toast.error(error.response?.data?.message || "Failed to initiate payment")
        } finally {
            setSubscribingId(null)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 font-display">
            <main className="max-w-5xl mx-auto px-6 py-16">
                {/* Header */}
                <div className="text-center mb-16 animate-entry">
                    <span className="inline-block bg-blue-50 text-primary text-xs font-semibold px-3 py-1 rounded-full mb-4 tracking-widest uppercase">
                        Pricing Plans
                    </span>
                    <h1 className="text-5xl font-extrabold text-gray-900 mb-4">Invest in Your Future Career</h1>
                    <p className="text-gray-500 max-w-xl mx-auto mb-10">
                        Choose the perfect plan to master your interviews, build a winning resume, and land your dream job with AI-powered coaching.
                    </p>

                    {/* Billing Toggle */}
                    <div className="flex items-center justify-center gap-4 mb-8">
                        <span className={`text-sm font-bold ${billingCycle === "MONTHLY" ? "text-slate-900" : "text-slate-400"}`}>Monthly</span>
                        <button 
                            onClick={() => setBillingCycle(billingCycle === "MONTHLY" ? "YEARLY" : "MONTHLY")}
                            className="relative w-14 h-7 bg-slate-200 rounded-full p-1 transition-colors hover:bg-slate-300"
                        >
                            <motion.div 
                                animate={{ x: billingCycle === "MONTHLY" ? 0 : 28 }}
                                className="w-5 h-5 bg-primary rounded-full shadow-sm"
                            />
                        </button>
                        <span className={`text-sm font-bold ${billingCycle === "YEARLY" ? "text-slate-900" : "text-slate-400"}`}>
                            Yearly
                        </span>
                    </div>
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
                            key={plan.id}
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
                                <span className="text-4xl font-extrabold text-gray-900">
                                    ${billingCycle === "MONTHLY" ? plan.priceMonthly : plan.priceYearly}
                                </span>
                                <span className="text-gray-400 text-sm mb-1">
                                    /{billingCycle === "MONTHLY" ? "month" : "year"}
                                </span>
                            </div>
                            <button
                                onClick={() => handleSubscribe(plan)}
                                disabled={subscribingId === plan.id}
                                className={`block w-full py-2.5 rounded-xl font-semibold text-sm transition-all mb-6 ${plan.btnStyle} ${subscribingId === plan.id ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                                {subscribingId === plan.id ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                        Processing...
                                    </span>
                                ) : plan.btnLabel}
                            </button>
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

        </div>
    )
}
