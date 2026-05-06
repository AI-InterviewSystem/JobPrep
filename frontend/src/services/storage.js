/**
 * storage.js — Centralized auth storage helper.
 *
 * Strategy:
 *  - "Remember Me" login  → token & user stored in localStorage  (persists across browser restarts)
 *  - Normal login         → token & user stored in sessionStorage (cleared when tab/window closes)
 *
 * All reads check localStorage first, then sessionStorage as fallback.
 */

export const storage = {
    /** Read token from whichever store holds it. */
    getToken() {
        return localStorage.getItem('token') || sessionStorage.getItem('token') || null
    },

    /** Read user object from whichever store holds it. Returns null on missing/invalid JSON. */
    getUser() {
        try {
            const raw =
                localStorage.getItem('user') || sessionStorage.getItem('user')
            return raw ? JSON.parse(raw) : null
        } catch {
            return null
        }
    },

    /**
     * Persist token + user after a successful login.
     * @param {string} token
     * @param {object} user
     * @param {boolean} rememberMe
     */
    setAuth(token, user, rememberMe = false) {
        const store = rememberMe ? localStorage : sessionStorage
        const other = rememberMe ? sessionStorage : localStorage

        store.setItem('token', token)
        store.setItem('user', JSON.stringify(user))

        // Clear the other store so there is never a stale token lying around
        other.removeItem('token')
        other.removeItem('user')
    },

    /**
     * Merge updated user fields into whichever store currently holds the user.
     * Fires the 'jobprep:user-updated' event so UI components re-render.
     * @param {object} patch  — partial user object to merge
     */
    updateUser(patch) {
        const current = this.getUser() || {}
        const updated = { ...current, ...patch }
        const serialized = JSON.stringify(updated)

        if (localStorage.getItem('user') !== null) {
            localStorage.setItem('user', serialized)
        } else {
            sessionStorage.setItem('user', serialized)
        }

        window.dispatchEvent(new Event('jobprep:user-updated'))
    },

    /** Remove all auth data from both stores. */
    clearAuth() {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        sessionStorage.removeItem('token')
        sessionStorage.removeItem('user')
    },
}
