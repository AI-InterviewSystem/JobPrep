import { useEffect, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { profileApi } from "../../services/api"

function safeParseUser() {
    try {
        const raw = localStorage.getItem("user")
        if (!raw) return null
        return JSON.parse(raw)
    } catch {
        return null
    }
}

function getAvatarUrl(user) {
    if (!user) return ""
    return (
        user.avatarUrl ||
        user.picture ||
        user.imageUrl ||
        user.avatar ||
        user.photoUrl ||
        ""
    )
}

function normalizeAvatarUrl(url) {
    if (!url) return ""
    if (typeof url === "string" && url.startsWith("/")) {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/ai-interview"
        return `${baseUrl}${url}`
    }
    return url
}

export default function AvatarMenu() {
    const navigate = useNavigate()
    const [open, setOpen] = useState(false)
    const [user, setUser] = useState(() => safeParseUser())
    const [cacheKey, setCacheKey] = useState(0)
    const [imgError, setImgError] = useState(false)

    const rootRef = useRef(null)

    const rawAvatarUrl = getAvatarUrl(user)
    const avatarUrl = normalizeAvatarUrl(rawAvatarUrl)
    const defaultAvatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=JobPrep"

    useEffect(() => {
        setImgError(false)
        if (rawAvatarUrl) setCacheKey(Date.now())
    }, [rawAvatarUrl])

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem("token")
            if (!token) return

            try {
                const response = await profileApi.getProfile()
                const userData = response.data
                const raw = localStorage.getItem("user")
                const current = raw ? JSON.parse(raw) : {}
                
                const updatedUser = {
                    ...current,
                    fullName: userData.fullName ?? current.fullName,
                    avatarUrl: normalizeAvatarUrl(userData.avatarUrl) || current.avatarUrl,
                    role: userData.role ?? current.role,
                }
                
                localStorage.setItem("user", JSON.stringify(updatedUser))
                setUser(updatedUser)
            } catch (err) {
                console.error("Failed to fetch user profile in AvatarMenu:", err)
            }
        }

        fetchUserData()

        const handleStorage = (e) => {
            if (e.key && e.key !== "user") return
            setUser(safeParseUser())
        }

        const handleUserUpdated = () => {
            setUser(safeParseUser())
        }

        window.addEventListener("storage", handleStorage)
        window.addEventListener("jobprep:user-updated", handleUserUpdated)
        return () => {
            window.removeEventListener("storage", handleStorage)
            window.removeEventListener("jobprep:user-updated", handleUserUpdated)
        }
    }, [])

    useEffect(() => {
        const handleMouseDown = (e) => {
            if (!rootRef.current) return
            if (rootRef.current.contains(e.target)) return
            setOpen(false)
        }

        window.addEventListener("mousedown", handleMouseDown)
        return () => window.removeEventListener("mousedown", handleMouseDown)
    }, [])

    const handleLogout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        setOpen(false)
        window.dispatchEvent(new Event("jobprep:user-updated"))
        navigate("/")
    }

    const profileLink = user?.role === "ADMIN" ? "/admin/profile" : "/profile"

    return (
        <div ref={rootRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen(v => !v)}
                className="h-10 w-10 rounded-full border-2 border-primary/20 p-0.5 overflow-hidden bg-slate-200 cursor-pointer"
                aria-haspopup="menu"
                aria-expanded={open}
            >
                <img
                    src={imgError || !avatarUrl ? defaultAvatar : `${avatarUrl}${avatarUrl.includes("?") ? "&" : "?"}v=${cacheKey}`}
                    alt="Avatar"
                    className="h-full w-full rounded-full object-cover"
                    onError={() => setImgError(true)}
                />
            </button>

            {open && (
                <div
                    role="menu"
                    className="absolute right-0 mt-3 w-44 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl"
                >
                    <Link
                        to={profileLink}
                        role="menuitem"
                        onClick={() => setOpen(false)}
                        className="block px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                        Profile
                    </Link>
                    <button
                        type="button"
                        role="menuitem"
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
                    >
                        Logout
                    </button>
                </div>
            )}
        </div>
    )
}
