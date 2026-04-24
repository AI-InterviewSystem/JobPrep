import { useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { profileApi } from "../services/api"

export default function GoogleCallback() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()

    useEffect(() => {
        const token = searchParams.get("token")
        const run = async () => {
            if (!token) {
                navigate("/login?error=google_failed")
                return
            }

            localStorage.setItem("token", token)
            try {
                const response = await profileApi.getProfile()
                localStorage.setItem("user", JSON.stringify(response.data))
                window.dispatchEvent(new Event("jobprep:user-updated"))
            } catch {
                // ignore
            }

            navigate("/dashboard")
        }

        run()
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
