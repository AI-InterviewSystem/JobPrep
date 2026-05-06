import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { profileApi, paymentApi } from "../services/api"
import { storage } from "../services/storage"
import toast from "react-hot-toast"

const normalizeAvatarUrl = (url) => {
    if (!url) return ""
    if (typeof url === "string" && url.startsWith("/")) {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/ai-interview"
        return `${baseUrl}${url}`
    }
    return url
}

export default function ProfilePage() {
    const [profile, setProfile] = useState(null)
    const [editMode, setEditMode] = useState(false)
    const [activeTab, setActiveTab] = useState("profile") 
    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        avatarUrl: "",
        dob: "",
        bio: "",
        role: ""
    })
    const [passwordData, setPasswordData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
    })
    const [loading, setLoading] = useState(true)
    const [msg, setMsg] = useState({ text: "", type: "" })

    // Payment related state
    const [subscription, setSubscription] = useState(null)
    const [transactions, setTransactions] = useState([])
    const [loadingPayment, setLoadingPayment] = useState(false)
    const [showCancelModal, setShowCancelModal] = useState(false)

    useEffect(() => {
        fetchProfile()
        if (activeTab === "payment") {
            fetchPaymentData()
        }
    }, [activeTab])

    const fetchPaymentData = async () => {
        setLoadingPayment(true)
        try {
            const [subRes, transRes] = await Promise.all([
                paymentApi.getCurrentSubscription(),
                paymentApi.getHistory()
            ])
            setSubscription(subRes.data)
            setTransactions(transRes.data)
        } catch (err) {
            console.error("Failed to load payment data", err)
        } finally {
            setLoadingPayment(false)
        }
    }

    const handleCancelSubscription = async () => {
        setLoadingPayment(true)
        try {
            await paymentApi.cancel()
            toast.success("Subscription cancellation scheduled.")
            setShowCancelModal(false)
            fetchPaymentData()
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to cancel subscription")
        } finally {
            setLoadingPayment(false)
        }
    }

    const fetchProfile = async () => {
        try {
            const response = await profileApi.getProfile()
            setProfile(response.data)

            try {
                storage.updateUser({
                    fullName: response.data.fullName,
                    avatarUrl: normalizeAvatarUrl(response.data.avatarUrl) || undefined,
                    role: response.data.role,
                })
            } catch {
                // ignore
            }

            setFormData({
                fullName: response.data.fullName || "",
                phone: response.data.phone || "",
                avatarUrl: response.data.avatarUrl || "",
                dob: response.data.dob || "",
                bio: response.data.bio || "",
                role: response.data.role || "USER"
            })
        } catch (err) {
            setMsg({ text: "Failed to load profile", type: "error" })
        } finally {
            setLoading(false)
        }
    }

    const [uploading, setUploading] = useState(false)

    const handleFileChange = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        setUploading(true)
        setMsg({ text: "", type: "" })
        try {
            const response = await profileApi.uploadFile(file)
            setFormData({ ...formData, avatarUrl: response.data.url })
            setMsg({ text: "Avatar uploaded! Save changes to apply.", type: "success" })
        } catch (err) {
            setMsg({ text: "Failed to upload avatar", type: "error" })
        } finally {
            setUploading(false)
        }
    }

    const handleUpdateProfile = async (e) => {
        e.preventDefault()
        setMsg({ text: "", type: "" })
        try {
            const response = await profileApi.updateProfile(formData)
            setProfile(response.data)

            try {
                storage.updateUser({
                    fullName: response.data.fullName,
                    avatarUrl: normalizeAvatarUrl(response.data.avatarUrl) || undefined,
                    role: response.data.role,
                })
            } catch {
                // ignore
            }

            setEditMode(false)
            setMsg({ text: "Profile updated successfully", type: "success" })
        } catch (err) {
            setMsg({ text: "Failed to update profile", type: "error" })
        }
    }

    const handleChangePassword = async (e) => {
        e.preventDefault()
        setMsg({ text: "", type: "" })

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMsg({ text: "New passwords do not match", type: "error" })
            return
        }

        try {
            await profileApi.changePassword({
                oldPassword: passwordData.oldPassword,
                newPassword: passwordData.newPassword
            })
            setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" })
            setMsg({ text: "Password changed successfully", type: "success" })
        } catch (err) {
            setMsg({ text: err.response?.data?.message || "Failed to change password", type: "error" })
        }
    }

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-display">
            <div className="flex-1 flex items-center justify-center p-8 text-slate-500 font-medium">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading profile information...</span>
                </div>
            </div>
        </div>
    )

    if (!profile) return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-display">
            <div className="flex-1 flex items-center justify-center p-8 text-slate-500 font-medium">
                <div className="flex flex-col items-center gap-4">
                    <span className="material-symbols-outlined text-4xl text-rose-500">error</span>
                    <span>Could not load profile. Please try again later.</span>
                    <button 
                        onClick={() => window.location.reload()}
                        className="mt-4 bg-primary text-white px-6 py-2 rounded-xl font-bold"
                    >
                        Reload Page
                    </button>
                </div>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-display text-slate-900">
            <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12 space-y-8">
                {/* Header Section */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Account Settings</h1>
                    <p className="text-slate-500 font-medium text-lg">Manage your personal information and security.</p>
                </div>

                {/* Tabs Navigation */}
                <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-[1.25rem] w-fit">
                    <button
                        onClick={() => setActiveTab("profile")}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                            activeTab === "profile" 
                            ? "bg-white text-primary shadow-sm" 
                            : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                        }`}
                    >
                        Profile Information
                    </button>
                    <button
                        onClick={() => setActiveTab("payment")}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                            activeTab === "payment" 
                            ? "bg-white text-primary shadow-sm" 
                            : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                        }`}
                    >
                        Payment History
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === "profile" ? (
                        <motion.div
                            key="profile-tab"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-8"
                        >
                            {/* Profile Card */}
                            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 p-8 md:p-12 relative overflow-hidden">
                                {/* Background Accent */}
                                <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full -mr-40 -mt-40 blur-3xl"></div>

                                <div className="flex items-center justify-between mb-12 relative">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-primary text-2xl">person</span>
                                        </div>
                                        <h2 className="text-2xl font-bold text-slate-800">Personal Details</h2>
                                    </div>
                                    <button 
                                        onClick={() => setEditMode(!editMode)}
                                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${
                                            editMode 
                                            ? "bg-slate-100 text-slate-600 hover:bg-slate-200" 
                                            : "bg-primary text-white hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0"
                                        }`}
                                    >
                                        <span className="material-symbols-outlined text-lg">{editMode ? "close" : "edit"}</span>
                                        {editMode ? "Cancel" : "Edit Profile"}
                                    </button>
                                </div>

                                {msg.text && (
                                    <div className={`p-4 rounded-2xl mb-8 text-sm font-semibold flex items-center gap-3 ${
                                        msg.type === "success" 
                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                                        : "bg-rose-50 text-rose-700 border border-rose-100"
                                    }`}>
                                        <span className="material-symbols-outlined text-lg">{msg.type === "success" ? "check_circle" : "error"}</span>
                                        {msg.text}
                                    </div>
                                )}

                                {!editMode ? (
                                    <div className="flex flex-col md:flex-row gap-12">
                                        {/* Left Side: Avatar */}
                                        <div className="flex flex-col items-center gap-4 shrink-0">
                                            <div className="relative group">
                                                <div className="w-44 h-44 rounded-full overflow-hidden bg-slate-100 border-4 border-white shadow-2xl flex-shrink-0 ring-8 ring-slate-50">
                                                    {profile.avatarUrl ? (
                                                        <img 
                                                            src={profile.avatarUrl.startsWith('/') ? `${import.meta.env.VITE_API_BASE_URL}${profile.avatarUrl}` : profile.avatarUrl} 
                                                            alt="Avatar" 
                                                            className="w-full h-full object-cover" 
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
                                                            <span className="material-symbols-outlined" style={{ fontSize: '80px' }}>account_circle</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="absolute bottom-2 right-2 h-10 w-10 bg-primary rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white">
                                                    <span className="material-symbols-outlined text-xl">verified</span>
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                    profile.role === 'ADMIN' ? "bg-rose-50 text-rose-600 border border-rose-100" : "bg-primary/5 text-primary border border-primary/10"
                                                }`}>
                                                    {profile.role || "USER"}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Right Side & Bottom: Info */}
                                        <div className="flex-1 space-y-10">
                                            <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-y-8 gap-x-8">
                                                <div className="space-y-1.5">
                                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Full Name</p>
                                                    <p className="text-slate-900 font-bold text-xl leading-tight">{profile.fullName || "Not set"}</p>
                                                </div>
                                                <div className="space-y-1.5 min-w-0">
                                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Email Address</p>
                                                    <p className="text-slate-900 font-bold text-xl leading-tight break-all">{profile.email}</p>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Phone Number</p>
                                                    <p className="text-slate-900 font-bold text-xl leading-tight">{profile.phone || "Not set"}</p>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Date of Birth</p>
                                                    <p className="text-slate-900 font-bold text-xl leading-tight">
                                                        {profile.dob ? (() => {
                                                            const d = new Date(profile.dob);
                                                            const day = String(d.getDate()).padStart(2, '0');
                                                            const month = String(d.getMonth() + 1).padStart(2, '0');
                                                            const year = d.getFullYear();
                                                            return `${day}-${month}-${year}`;
                                                        })() : "Not set"}
                                                    </p>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Account Status</p>
                                                    <div className="flex">
                                                        <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
                                                            profile.emailVerified ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-amber-50 text-amber-700 border border-amber-100"
                                                        }`}>
                                                            <span className={`h-1.5 w-1.5 rounded-full ${profile.emailVerified ? "bg-emerald-500" : "bg-amber-500"}`}></span>
                                                            {profile.emailVerified ? "Verified" : "Unverified"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-8 border-t border-slate-50">
                                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">About Me</p>
                                                <p className="text-slate-600 font-medium text-lg leading-relaxed italic">
                                                    {profile.bio ? `"${profile.bio}"` : "Add a brief introduction about yourself..."}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <form onSubmit={handleUpdateProfile} className="space-y-10">
                                        <div className="flex flex-col md:flex-row gap-12">
                                            {/* Left: Avatar Edit */}
                                            <div className="flex flex-col items-center gap-6 shrink-0">
                                                <div className="relative group">
                                                    <div className="h-44 w-44 rounded-full border-4 border-white shadow-2xl overflow-hidden shrink-0 bg-slate-100 flex items-center justify-center ring-8 ring-slate-50">
                                                        {uploading ? (
                                                            <div className="h-8 w-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                                                        ) : (
                                                            formData.avatarUrl ? (
                                                                <img 
                                                                    src={formData.avatarUrl.startsWith('/') ? `${import.meta.env.VITE_API_BASE_URL}${formData.avatarUrl}` : formData.avatarUrl} 
                                                                    className="w-full h-full object-cover" 
                                                                />
                                                            ) : (
                                                                <span className="material-symbols-outlined text-slate-300" style={{ fontSize: '64px' }}>add_a_photo</span>
                                                            )
                                                        )}
                                                    </div>
                                                    <label className="absolute bottom-2 right-2 h-12 w-12 bg-white rounded-full flex items-center justify-center text-primary shadow-xl border border-slate-100 cursor-pointer hover:bg-slate-50 transition-all">
                                                        <span className="material-symbols-outlined text-2xl">camera_alt</span>
                                                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                                    </label>
                                                </div>
                                                <div className="text-center space-y-1">
                                                    <p className="text-xs font-bold text-slate-700">Profile Photo</p>
                                                    <p className="text-[10px] text-slate-400 font-medium">JPEG, PNG. Max 2MB.</p>
                                                </div>
                                            </div>

                                            {/* Right: Info Edit */}
                                            <div className="flex-1 space-y-8">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                                                        <input 
                                                            type="text" 
                                                            value={formData.fullName}
                                                            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                                            className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold"
                                                            placeholder="Enter your full name"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Email Address (Read-only)</label>
                                                        <input 
                                                            type="email" 
                                                            value={profile.email}
                                                            disabled
                                                            className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed outline-none font-bold"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
                                                        <input 
                                                            type="text" 
                                                            value={formData.phone}
                                                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                                            className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold"
                                                            placeholder="+1 (555) 000-0000"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Date of Birth</label>
                                                        <input 
                                                            type="date" 
                                                            value={formData.dob}
                                                            onChange={(e) => setFormData({...formData, dob: e.target.value})}
                                                            className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold"
                                                        />
                                                    </div>
                                                </div>
                                                
                                                <div className="space-y-2">
                                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">About Me</label>
                                                    <textarea 
                                                        rows="4"
                                                        value={formData.bio}
                                                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                                        className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold resize-none"
                                                        placeholder="Write a few lines about yourself..."
                                                    ></textarea>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-end gap-4 pt-8 border-t border-slate-50">
                                            <button 
                                                type="button" 
                                                onClick={() => setEditMode(false)}
                                                className="px-8 py-4 rounded-2xl font-bold text-slate-400 hover:text-slate-600 transition-all uppercase text-xs tracking-widest"
                                            >
                                                Discard
                                            </button>
                                            <button 
                                                type="submit"
                                                disabled={uploading}
                                                className="bg-primary text-white px-10 py-4 rounded-2xl font-bold hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all uppercase text-xs tracking-widest disabled:opacity-50 disabled:translate-y-0"
                                            >
                                                {uploading ? "Uploading..." : "Save Changes"}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>

                            {/* Password Section */}
                            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 p-8 md:p-12">
                                <div className="flex items-center gap-3 mb-10">
                                    <div className="w-10 h-10 rounded-xl bg-slate-900/5 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-slate-800 text-2xl">lock</span>
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-800">Account Security</h2>
                                </div>

                                <form onSubmit={handleChangePassword} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-s font-black text-slate-500 tracking-widest ml-1">Current Password</label>
                                            <input 
                                                type="password" 
                                                value={passwordData.oldPassword}
                                                onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                                                required
                                                className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-s font-black text-slate-500 tracking-widest ml-1">New Password</label>
                                            <input 
                                                type="password" 
                                                value={passwordData.newPassword}
                                                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                                required
                                                className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold"
                                                placeholder="••••••••"
                                            />
                                            <p className="text-[10px] text-slate-400 font-bold tracking-wider ml-1">Minimum 8 characters with letters & numbers</p>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-s font-black text-slate-500 tracking-widest ml-1">Confirm New Password</label>
                                            <input 
                                                type="password" 
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                                required
                                                className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <button 
                                            type="submit"
                                            className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold hover:bg-black transition-all hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 uppercase text-xs tracking-widest w-full md:w-auto"
                                        >
                                            Update Password
                                        </button>
                                    </div>

                                    <div className="bg-slate-50 rounded-[2rem] p-8 flex flex-col justify-center gap-6 border border-slate-100 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-5">
                                            <span className="material-symbols-outlined" style={{ fontSize: '120px' }}>shield</span>
                                        </div>
                                        <div className="space-y-2 relative">
                                            <h3 className="font-bold text-slate-800 text-lg">Security Recommendations</h3>
                                            <p className="text-sm text-slate-500 leading-relaxed font-medium">
                                                We recommend using a unique password for JobPrep to ensure your account security. 
                                                Avoid reusing passwords from other sensitive accounts.
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-slate-100 relative">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                <span className="material-symbols-outlined text-xl">verified_user</span>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs font-black text-slate-800 uppercase tracking-widest">Security Status</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Your account is fully protected</p>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="payment-tab"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            {/* Current Subscription Card */}
                            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 p-8 md:p-12">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-primary text-2xl">card_membership</span>
                                        </div>
                                        <h2 className="text-2xl font-bold text-slate-800">Current Subscription</h2>
                                    </div>
                                    {subscription && subscription.status === "ACTIVE" && !subscription.cancelAtPeriodEnd && (
                                        <button
                                            onClick={() => setShowCancelModal(true)}
                                            className="px-6 py-2.5 rounded-xl border border-rose-100 text-rose-500 font-bold text-sm hover:bg-rose-50 transition-all"
                                        >
                                            Cancel Subscription
                                        </button>
                                    )}
                                </div>

                                {subscription ? (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Plan</p>
                                            <p className="text-xl font-bold text-primary">{subscription.planName}</p>
                                        </div>
                                        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                            <div className="flex items-center gap-2">
                                                <span className={`h-2 w-2 rounded-full ${['ACTIVE', 'ACTIVE_NON_RENEWING'].includes(subscription.status) ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                                                <p className="text-xl font-bold text-slate-700">
                                                    {subscription.cancelAtPeriodEnd ? "Cancelling soon" : subscription.status}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Next Billing Date</p>
                                            <p className="text-xl font-bold text-slate-700">
                                                {subscription.currentPeriodEnd ? (() => {
                                                    const d = new Date(subscription.currentPeriodEnd);
                                                    const day = String(d.getDate()).padStart(2, '0');
                                                    const month = String(d.getMonth() + 1).padStart(2, '0');
                                                    const year = d.getFullYear();
                                                    return `${day}/${month}/${year}`;
                                                })() : "N/A"}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-8 bg-slate-50 rounded-3xl text-center border border-dashed border-slate-200">
                                        <p className="text-slate-500 font-medium">You don't have an active subscription.</p>
                                        <button 
                                            className="mt-4 text-primary font-bold hover:underline"
                                            onClick={() => window.location.href = "/pricing"}
                                        >
                                            Upgrade Now
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Transaction History Card */}
                            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 p-8 md:p-12">
                                <div className="flex items-center gap-3 mb-10">
                                    <div className="w-10 h-10 rounded-xl bg-slate-900/5 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-slate-800 text-2xl">receipt_long</span>
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-800">Transaction History</h2>
                                </div>

                                {loadingPayment ? (
                                    <div className="flex justify-center py-12">
                                        <div className="h-8 w-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                ) : transactions.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-separate border-spacing-y-3">
                                            <thead>
                                                <tr>
                                                    <th className="px-6 pb-2 text-[11px] font-black text-slate-400 uppercase tracking-widest">Transaction ID</th>
                                                    <th className="px-6 pb-2 text-[11px] font-black text-slate-400 uppercase tracking-widest">Plan</th>
                                                    <th className="px-6 pb-2 text-[11px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                                    <th className="px-6 pb-2 text-[11px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                                                    <th className="px-6 pb-2 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {transactions.map((tx) => (
                                                    <tr key={tx.id} className="group">
                                                        <td className="px-6 py-4 bg-slate-50 first:rounded-l-2xl font-bold text-slate-700 text-sm group-hover:bg-slate-100 transition-colors">
                                                            #{tx.id ? tx.id.slice(0, 8) : "N/A"}
                                                        </td>
                                                        <td className="px-6 py-4 bg-slate-50 font-bold text-slate-700 text-sm group-hover:bg-slate-100 transition-colors">
                                                            {tx.planName}
                                                        </td>
                                                        <td className="px-6 py-4 bg-slate-50 font-bold text-slate-500 text-sm group-hover:bg-slate-100 transition-colors">
                                                            {(() => {
                                                                const d = new Date(tx.date);
                                                                const day = String(d.getDate()).padStart(2, '0');
                                                                const month = String(d.getMonth() + 1).padStart(2, '0');
                                                                const year = d.getFullYear();
                                                                return `${day}/${month}/${year}`;
                                                            })()}
                                                        </td>
                                                        <td className="px-6 py-4 bg-slate-50 font-black text-slate-900 text-sm group-hover:bg-slate-100 transition-colors">
                                                            {tx.amount.toLocaleString()} {tx.currency}
                                                        </td>
                                                        <td className="px-6 py-4 bg-slate-50 last:rounded-r-2xl text-center group-hover:bg-slate-100 transition-colors">
                                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                                tx.status === 'PAID' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : 
                                                                tx.status === 'PENDING' ? "bg-amber-50 text-amber-600 border border-amber-100" :
                                                                "bg-rose-50 text-rose-600 border border-rose-100"
                                                            }`}>
                                                                {tx.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                                            <span className="material-symbols-outlined text-slate-200 text-4xl">payments</span>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-800">No Transactions</h3>
                                        <p className="text-slate-500 text-sm font-medium">You haven't made any transactions yet.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Cancel Subscription Modal */}
            <AnimatePresence>
                {showCancelModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowCancelModal(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-8 md:p-10 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                            
                            <div className="flex flex-col items-center text-center gap-6 relative">
                                <div className="w-20 h-20 rounded-[2rem] bg-rose-50 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-rose-500 text-4xl animate-pulse">heart_broken</span>
                                </div>
                                
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Wait, don't go!</h3>
                                    <p className="text-slate-500 font-medium leading-relaxed">
                                        Are you sure you want to cancel? You'll lose access to premium AI features 
                                        after <span className="font-bold text-slate-700">
                                            {subscription?.currentPeriodEnd ? (() => {
                                                const d = new Date(subscription.currentPeriodEnd);
                                                const day = String(d.getDate()).padStart(2, '0');
                                                const month = String(d.getMonth() + 1).padStart(2, '0');
                                                const year = d.getFullYear();
                                                return `${day}/${month}/${year}`;
                                            })() : "the current period"}
                                        </span>.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 w-full gap-3 mt-4">
                                    <button
                                        onClick={handleCancelSubscription}
                                        disabled={loadingPayment}
                                        className="w-full bg-rose-500 text-white py-4 rounded-2xl font-bold hover:bg-rose-600 hover:shadow-lg hover:shadow-rose-200 transition-all uppercase text-xs tracking-widest disabled:opacity-50"
                                    >
                                        {loadingPayment ? "Processing..." : "Yes, Cancel Subscription"}
                                    </button>
                                    <button
                                        onClick={() => setShowCancelModal(false)}
                                        className="w-full bg-slate-50 text-slate-500 py-4 rounded-2xl font-bold hover:bg-slate-100 transition-all uppercase text-xs tracking-widest"
                                    >
                                        Keep My Plan
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
