import { useState, useEffect } from "react"
import { useSearchParams, useNavigate, Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { publicPricingPlansApi, paymentApi, promoApi } from "../services/api"
import toast from "react-hot-toast"
import { storage } from "../services/storage"

export default function CheckoutPage() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const planId = searchParams.get("planId")
    const cycle = searchParams.get("cycle") || "MONTHLY"
    
    const [plan, setPlan] = useState(null)
    const [loading, setLoading] = useState(true)
    const [promoCode, setPromoCode] = useState("")
    const [promoLoading, setPromoLoading] = useState(false)
    const [appliedPromo, setAppliedPromo] = useState(null)
    const [subscribing, setSubscribing] = useState(false)

    useEffect(() => {
        if (!storage.getToken()) {
            toast.error("Please login to continue")
            navigate("/login")
            return
        }

        if (!planId) {
            navigate("/pricing")
            return
        }

        const fetchPlan = async () => {
            try {
                const response = await publicPricingPlansApi.getAll()
                const foundPlan = response.data.find(p => p.id.toString() === planId)
                if (!foundPlan) {
                    toast.error("Plan not found")
                    navigate("/pricing")
                    return
                }
                setPlan(foundPlan)
            } catch (error) {
                console.error("Failed to fetch plan:", error)
                toast.error("Failed to load plan details")
            } finally {
                setLoading(false)
            }
        }
        fetchPlan()
    }, [planId, navigate])

    const handleApplyPromo = async () => {
        if (!promoCode.trim()) return

        setPromoLoading(true)
        try {
            const response = await promoApi.validate({
                code: promoCode,
                planId: parseInt(planId),
                cycle: cycle
            })
            setAppliedPromo(response.data)
            toast.success("Promo code applied!")
        } catch (error) {
            console.error("Promo validation failed:", error)
            toast.error(error.response?.data?.message || "Invalid promo code")
            setAppliedPromo(null)
        } finally {
            setPromoLoading(false)
        }
    }

    const handleConfirmPayment = async () => {
        setSubscribing(true)
        try {
            const response = await paymentApi.subscribe({
                planId: parseInt(planId),
                cycle: cycle,
                promoCode: appliedPromo ? promoCode : null
            })
            if (response.data && response.data.checkoutUrl) {
                window.location.href = response.data.checkoutUrl
            }
        } catch (error) {
            console.error("Subscription failed:", error)
            toast.error(error.response?.data?.message || "Failed to initiate payment")
        } finally {
            setSubscribing(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    const originalPrice = cycle === "YEARLY" ? plan.priceYearly : plan.priceMonthly
    const finalPrice = appliedPromo ? appliedPromo.finalAmount : originalPrice
    const discountAmount = appliedPromo ? appliedPromo.discountAmount : 0

    return (
        <div className="min-h-screen bg-gray-50 font-display py-12 px-6">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8 flex items-center gap-4">
                    <Link to="/pricing" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <span className="material-symbols-outlined text-gray-600">arrow_back</span>
                    </Link>
                    <h1 className="text-3xl font-extrabold text-gray-900">Confirm Order</h1>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Plan Summary */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
                        >
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">description</span>
                                Subscription Details
                            </h2>
                            <div className="flex justify-between items-start p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">{plan.name}</h3>
                                    <p className="text-gray-500 text-sm">Billed {cycle.toLowerCase()}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-black text-gray-900">${originalPrice}</span>
                                    <p className="text-gray-400 text-xs">/{cycle === "YEARLY" ? "year" : "month"}</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Promo Code */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
                        >
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">sell</span>
                                Promo Code
                            </h2>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={promoCode}
                                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                    placeholder="Enter code"
                                    disabled={appliedPromo}
                                    className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all disabled:bg-gray-50 disabled:text-gray-400"
                                />
                                {appliedPromo ? (
                                    <button
                                        onClick={() => {
                                            setAppliedPromo(null)
                                            setPromoCode("")
                                        }}
                                        className="px-6 py-3 bg-red-50 text-red-600 font-bold rounded-2xl hover:bg-red-100 transition-all text-sm"
                                    >
                                        Remove
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleApplyPromo}
                                        disabled={promoLoading || !promoCode}
                                        className="px-8 py-3 bg-primary text-white font-bold rounded-2xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 disabled:opacity-50 text-sm"
                                    >
                                        {promoLoading ? "Applying..." : "Apply"}
                                    </button>
                                )}
                            </div>
                            <AnimatePresence>
                                {appliedPromo && (
                                    <motion.p
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-4 text-sm text-green-600 font-medium flex items-center gap-1"
                                    >
                                        <span className="material-symbols-outlined text-sm">check_circle</span>
                                        {appliedPromo.message}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>

                    {/* Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 sticky top-12"
                        >
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
                            
                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-gray-500">
                                    <span>Subtotal</span>
                                    <span>${originalPrice}</span>
                                </div>
                                {appliedPromo && (
                                    <div className="flex justify-between text-green-600 font-medium">
                                        <span>Discount</span>
                                        <span>-${discountAmount}</span>
                                    </div>
                                )}
                                <div className="h-px bg-gray-100 my-4"></div>
                                <div className="flex justify-between items-end">
                                    <span className="text-gray-900 font-bold">Total</span>
                                    <div className="text-right">
                                        <span className="text-3xl font-black text-gray-900">${finalPrice}</span>
                                        <p className="text-gray-400 text-[10px]">Tax included where applicable</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleConfirmPayment}
                                disabled={subscribing}
                                className="w-full bg-primary text-white font-bold py-4 rounded-2xl hover:bg-primary-dark transition-all shadow-xl shadow-primary/25 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {subscribing ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        Confirm & Pay
                                        <span className="material-symbols-outlined">payments</span>
                                    </>
                                )}
                            </button>

                            <p className="mt-6 text-[10px] text-gray-400 text-center leading-relaxed">
                                By clicking "Confirm & Pay", you agree to our Terms of Service and Privacy Policy.
                                You will be redirected to PayOS to complete your purchase securely.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    )
}
