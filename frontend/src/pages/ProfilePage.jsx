import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { profileApi } from "../services/api"

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
    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        avatarUrl: "",
        role: ""
    })
    const [passwordData, setPasswordData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
    })
    const [loading, setLoading] = useState(true)
    const [msg, setMsg] = useState({ text: "", type: "" })

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        try {
            const response = await profileApi.getProfile()
            setProfile(response.data)

            try {
                const raw = localStorage.getItem("user")
                const current = raw ? JSON.parse(raw) : {}
                localStorage.setItem(
                    "user",
                    JSON.stringify({
                        ...current,
                        fullName: response.data.fullName ?? current.fullName,
                        avatarUrl: normalizeAvatarUrl(response.data.avatarUrl) || current.avatarUrl,
                        role: response.data.role ?? current.role,
                    })
                )
                window.dispatchEvent(new Event("jobprep:user-updated"))
            } catch {
                // ignore
            }

            setFormData({
                fullName: response.data.fullName || "",
                phone: response.data.phone || "",
                avatarUrl: response.data.avatarUrl || "",
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
                const raw = localStorage.getItem("user")
                const current = raw ? JSON.parse(raw) : {}
                localStorage.setItem(
                    "user",
                    JSON.stringify({
                        ...current,
                        fullName: response.data.fullName ?? current.fullName,
                        avatarUrl: normalizeAvatarUrl(response.data.avatarUrl) || current.avatarUrl,
                        role: response.data.role ?? current.role,
                    })
                )
                window.dispatchEvent(new Event("jobprep:user-updated"))
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
                    <span>Loading your profile...</span>
                </div>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-display text-slate-900">

            <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12 space-y-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Account Settings</h1>
                        <p className="text-slate-500 font-medium mt-1 text-lg">Manage your personal information and security.</p>
                    </div>
                </div>

                {/* Profile Card */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-12 relative overflow-hidden"
                >
                    {/* Background Accent */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>

                    <div className="flex items-center justify-between mb-10 relative">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">person</span>
                            <h2 className="text-2xl font-bold text-slate-800">Personal Information</h2>
                        </div>
                        <button 
                            onClick={() => setEditMode(!editMode)}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold transition-all ${
                                editMode 
                                ? "bg-slate-100 text-slate-600 hover:bg-slate-200" 
                                : "bg-primary/10 text-primary hover:bg-primary/20"
                            }`}
                        >
                            <span className="material-symbols-outlined text-sm">{editMode ? "close" : "edit"}</span>
                            {editMode ? "Cancel" : "Edit Profile"}
                        </button>
                    </div>

                    {msg.text && (
                        <div className={`p-4 rounded-2xl mb-8 text-sm font-semibold flex items-center gap-3 ${
                            msg.type === "success" 
                            ? "bg-green-50 text-green-700 border border-green-100" 
                            : "bg-red-50 text-red-700 border border-red-100"
                        }`}>
                            <span className="material-symbols-outlined text-lg">{msg.type === "success" ? "check_circle" : "error"}</span>
                            {msg.text}
                        </div>
                    )}

                    {!editMode ? (
                        <div className="flex flex-col lg:flex-row gap-12 lg:items-center">
                            {/* Avatar View */}
                            <div className="relative group">
                                <div className="w-40 h-40 rounded-3xl overflow-hidden bg-slate-100 border-4 border-white shadow-xl flex-shrink-0">
                                    {profile.avatarUrl ? (
                                        <img 
                                            src={profile.avatarUrl.startsWith('/') ? `${import.meta.env.VITE_API_BASE_URL}${profile.avatarUrl}` : profile.avatarUrl} 
                                            alt="Avatar" 
                                            className="w-full h-full object-cover" 
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
                                            <span className="material-symbols-outlined" style={{ fontSize: '64px' }}>account_circle</span>
                                        </div>
                                    )}
                                </div>
                                <div className="absolute -bottom-3 -right-3 h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg border-2 border-white">
                                    <span className="material-symbols-outlined text-xl">verified</span>
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 flex-1">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</p>
                                    <p className="text-slate-900 font-bold text-xl">{profile.fullName || "Not set"}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                                    <p className="text-slate-900 font-bold text-xl">{profile.email}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</p>
                                    <p className="text-slate-900 font-bold text-xl">{profile.phone || "Not set"}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Role</p>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-4 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${
                                            profile.role === 'ADMIN' ? "bg-red-50 text-red-600 border border-red-100" : "bg-primary/5 text-primary border border-primary/10"
                                        }`}>
                                            {profile.role || "USER"}
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                                    <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
                                        profile.emailVerified ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-amber-50 text-amber-700 border border-amber-100"
                                    }`}>
                                        <span className={`h-1.5 w-1.5 rounded-full ${profile.emailVerified ? "bg-emerald-500" : "bg-amber-500"}`}></span>
                                        {profile.emailVerified ? "Verified" : "Unverified"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleUpdateProfile} className="space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
                                    <input 
                                        type="text" 
                                        value={formData.phone}
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                        className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold"
                                        placeholder="+1 (555) 000-0000"
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Profile Photo</label>
                                    <div className="flex flex-col md:flex-row items-center gap-6 p-6 rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50/50">
                                        <div className="h-24 w-24 rounded-2xl border-4 border-white shadow-lg overflow-hidden shrink-0 bg-slate-100 flex items-center justify-center">
                                            {uploading ? (
                                                <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                formData.avatarUrl ? (
                                                    <img 
                                                        src={formData.avatarUrl.startsWith('/') ? `${import.meta.env.VITE_API_BASE_URL}${formData.avatarUrl}` : formData.avatarUrl} 
                                                        className="w-full h-full object-cover" 
                                                    />
                                                ) : (
                                                    <span className="material-symbols-outlined text-slate-300 text-4xl">add_a_photo</span>
                                                )
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-1 text-center md:text-left">
                                            <p className="text-sm font-bold text-slate-700">Upload a new photo</p>
                                            <p className="text-xs text-slate-400 font-medium">JPEG, PNG or GIF. Max size 2MB.</p>
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                <label className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer hover:bg-slate-50 transition-all shadow-sm">
                                                    Choose File
                                                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                                </label>
                                                {formData.avatarUrl && (
                                                    <button 
                                                        type="button"
                                                        onClick={() => setFormData({...formData, avatarUrl: ""})}
                                                        className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-red-100 transition-all"
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-50">
                                <button 
                                    type="button" 
                                    onClick={() => setEditMode(false)}
                                    className="px-8 py-3.5 rounded-2xl font-bold text-slate-400 hover:text-slate-600 transition-all uppercase text-xs tracking-widest"
                                >
                                    Discard Changes
                                </button>
                                <button 
                                    type="submit"
                                    disabled={uploading}
                                    className="bg-primary text-white px-10 py-4 rounded-2xl font-bold hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all uppercase text-xs tracking-widest disabled:opacity-50 disabled:translate-y-0"
                                >
                                    {uploading ? "Uploading..." : "Save Profile"}
                                </button>
                            </div>
                        </form>
                    )}
                </motion.div>

                {/* Password Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-12"
                >
                    <div className="flex items-center gap-2 mb-10">
                        <span className="material-symbols-outlined text-slate-800">lock</span>
                        <h2 className="text-2xl font-bold text-slate-800">Account Security</h2>
                    </div>

                    <form onSubmit={handleChangePassword} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Current Password</label>
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
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">New Password</label>
                                <input 
                                    type="password" 
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                    required
                                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold"
                                    placeholder="••••••••"
                                />
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider ml-1">Must be at least 8 characters with numbers & symbols.</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Confirm New Password</label>
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
                                className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold hover:bg-black transition-all hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 uppercase text-xs tracking-widest"
                            >
                                Update Password
                            </button>
                        </div>

                        <div className="bg-slate-50 rounded-[1.5rem] p-8 flex flex-col justify-center gap-4 border border-slate-100">
                            <h3 className="font-bold text-slate-800">Security Recommendation</h3>
                            <p className="text-sm text-slate-500 leading-relaxed font-medium">
                                We recommend using a unique password for JobPrep to ensure your account security. 
                                Avoid reusing passwords from other sensitive accounts.
                            </p>
                            <div className="flex items-center gap-2 text-primary font-bold text-sm mt-2">
                                <span className="material-symbols-outlined text-lg">shield</span>
                                Last changed 3 months ago
                            </div>
                        </div>
                    </form>
                </motion.div>
            </main>

            <footer className="py-12 px-6 border-t border-slate-200 text-center text-slate-400 text-sm font-medium">
                © 2024 JobPrep AI. Protected by bank-grade security.
            </footer>
        </div>
    )
}
