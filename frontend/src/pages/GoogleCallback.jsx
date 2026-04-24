import { useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

export default function GoogleCallback() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()

    useEffect(() => {
        const token = searchParams.get("token")
        if (token) {
            localStorage.setItem("token", token)
            // Note: We'd ideally fetch user data here too if not in token
            navigate("/dashboard")
        } else {
            navigate("/login?error=google_failed")
        }
    }, [searchParams, navigate])

    return (
        <div className="min-h-screen flex items-center justify-center font-display">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <h1 className="text-xl font-semibold text-gray-900">Authenticating with Google...</h1>
            </div>
        </div>
    )
}
