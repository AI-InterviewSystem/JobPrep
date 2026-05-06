import { useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { profileApi } from "../services/api"
import { storage } from "../services/storage"

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

            // Temporarily store token so the api interceptor can attach it
            // to the upcoming getProfile request, then finalize with setAuth.
            storage.setAuth(token, {}, true)
            try {
                const response = await profileApi.getProfile()
                const user = response.data
                // Re-persist with full user object
                storage.setAuth(token, user, true)
                window.dispatchEvent(new Event("jobprep:user-updated"))
                
                if (user?.role === "ADMIN") {
                    navigate("/admin")
                } else {
                    navigate("/dashboard")
                }
            } catch {
                navigate("/dashboard")
            }
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
