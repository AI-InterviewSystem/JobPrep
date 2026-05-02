import { useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { motion } from "framer-motion"
import toast from "react-hot-toast"
import { paymentApi } from "../services/api"

export default function PaymentResultPage({ status }) {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    useEffect(() => {
        const orderCode = searchParams.get("orderCode")
        if (orderCode) {
            paymentApi.syncStatus(orderCode).catch(err => console.error("Sync failed", err))
        }

        if (status === "success") {
            toast.success("Subscription activated successfully!")
        } else {
            toast.error("Payment was cancelled or failed.")
        }
    }, [status, searchParams])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl text-center border border-gray-100"
            >
                <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6 ${
                    status === "success" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                }`}>
                    {status === "success" ? (
                        <span className="material-symbols-outlined text-4xl font-bold">check</span>
                    ) : (
                        <span className="material-symbols-outlined text-4xl font-bold">close</span>
                    )}
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {status === "success" ? "Payment Successful!" : "Payment Failed"}
                </h1>
                <p className="text-gray-500 mb-8 leading-relaxed">
                    {status === "success" 
                        ? "Thank you for subscribing! Your premium features are now active. You can start preparing for your interviews with our AI coach."
                        : "We couldn't process your payment. If this was a mistake, you can try again from the pricing page."
                    }
                </p>

                <div className="space-y-3">
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
                    >
                        Go to Dashboard
                    </button>
                    {status !== "success" && (
                        <button
                            onClick={() => navigate("/pricing")}
                            className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all"
                        >
                            Back to Pricing
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    )
}
