import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { profileApi } from "../services/api"

export default function ProfilePage() {
    const [profile, setProfile] = useState(null)
    const [editMode, setEditMode] = useState(false)
    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        avatarUrl: "",
        timezone: ""
    })
    const [passwordData, setPasswordData] = useState({
        oldPassword: "",
        newPassword: ""
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
                        avatarUrl: response.data.avatarUrl ?? current.avatarUrl,
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
                timezone: response.data.timezone || ""
            })
        } catch (err) {
            setMsg({ text: "Failed to load profile", type: "error" })
        } finally {
            setLoading(false)
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
                        avatarUrl: response.data.avatarUrl ?? current.avatarUrl,
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
        try {
            await profileApi.changePassword(passwordData)
            setPasswordData({ oldPassword: "", newPassword: "" })
            setMsg({ text: "Password changed successfully", type: "success" })
        } catch (err) {
            setMsg({ text: err.response?.data?.message || "Failed to change password", type: "error" })
        }
    }

    if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8 font-display">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8"
            >
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Personal Profile</h1>
                    <button 
                        onClick={() => setEditMode(!editMode)}
                        className="text-primary font-semibold hover:underline"
                    >
                        {editMode ? "Cancel" : "Edit Profile"}
                    </button>
                </div>

                {msg.text && (
                    <div className={`p-4 rounded-xl mb-6 text-sm ${msg.type === "success" ? "bg-green-50 text-green-600 border border-green-100" : "bg-red-50 text-red-600 border border-red-100"}`}>
                        {msg.text}
                    </div>
                )}

                {!editMode ? (
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="w-32 h-32 rounded-3xl overflow-hidden bg-gray-100 border-4 border-white shadow-md flex-shrink-0">
                            {profile.avatarUrl ? (
                                <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 flex-1">
                            <div>
                                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Full Name</p>
                                <p className="text-gray-900 font-semibold text-lg">{profile.fullName || "Not set"}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Email Address</p>
                                <p className="text-gray-900 font-semibold text-lg">{profile.email}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Phone Number</p>
                                <p className="text-gray-900 font-semibold text-lg">{profile.phone || "Not set"}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Timezone</p>
                                <p className="text-gray-900 font-semibold text-lg">{profile.timezone || "UTC"}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Status</p>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${profile.emailVerified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                                    {profile.emailVerified ? "Verified" : "Unverified"}
                                </span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                <input 
                                    type="text" 
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                                <input 
                                    type="text" 
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Avatar URL</label>
                                <input 
                                    type="text" 
                                    value={formData.avatarUrl}
                                    onChange={(e) => setFormData({...formData, avatarUrl: e.target.value})}
                                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                                <input 
                                    type="text" 
                                    value={formData.timezone}
                                    onChange={(e) => setFormData({...formData, timezone: e.target.value})}
                                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button 
                                type="button" 
                                onClick={() => setEditMode(false)}
                                className="px-6 py-3 rounded-full font-bold text-gray-500 hover:bg-gray-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                className="bg-primary text-white px-8 py-3 rounded-full font-bold hover:shadow-lg hover:bg-primary-dark transition-all"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                )}
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8"
            >
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Security</h2>
                <form onSubmit={handleChangePassword} className="max-w-md space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                        <input 
                            type="password" 
                            value={passwordData.oldPassword}
                            onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                            required
                            className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            placeholder="••••••••"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                        <input 
                            type="password" 
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                            required
                            className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            placeholder="••••••••"
                        />
                        <p className="text-xs text-gray-400 mt-2">Must be at least 8 characters long.</p>
                    </div>
                    <button 
                        type="submit"
                        className="bg-gray-900 text-white px-8 py-3 rounded-full font-bold hover:bg-black transition-all hover:shadow-lg"
                    >
                        Change Password
                    </button>
                </form>
            </motion.div>
        </div>
    )
}
