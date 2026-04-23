import { Link } from "react-router-dom"
import logo from "../../assets/images/jobprep-logo.png"

export default function Navbar() {
    return (
        <header className="w-full border-b bg-white">

            <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">

                {/* Logo */}
                <Link to="/" className="flex items-center gap-3">
                    <img src={logo} alt="JobPrep Logo" className="h-8" />
                    <span className="font-semibold text-lg text-gray-800">
                        JobPrep
                    </span>
                </Link>

                {/* Navigation */}
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">

                    <Link to="/">Home</Link>

                    <Link to="/pricing">Pricing</Link>

                    <Link to="/dashboard">Dashboard</Link>

                    <Link to="/interview-setup">Practice</Link>

                </nav>

                {/* Right actions */}
                <div className="flex items-center gap-3">

                    <Link
                        to="/signup"
                        className="text-sm text-gray-700"
                    >
                        Log in
                    </Link>

                    <Link
                        to="/signup"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
                    >
                        Start Practice
                    </Link>

                </div>

            </div>

        </header>
    )
}