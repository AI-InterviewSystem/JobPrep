import { Link } from "react-router-dom"
import logo from "../../assets/images/jobprep-logo.png"
import AvatarMenu from "./AvatarMenu"

export default function Navbar() {
    return (
        <header className="w-full border-b bg-white sticky top-0 z-50">
            <div className="max-w-7xl mx-auto flex items-center px-6 py-4">
                
                {/* Logo - Fixed width on the left */}
                <div className="w-48 flex-shrink-0">
                    <Link 
                        to={localStorage.getItem("token") ? "/dashboard" : "/"} 
                        className="flex items-center gap-3"
                    >
                        <img src={logo} alt="JobPrep Logo" className="h-8" />
                        <span className="font-bold text-xl text-blue-600">
                            JobPrep
                        </span>
                    </Link>
                </div>

                {/* Navigation - Centered */}
                <nav className="hidden md:flex flex-1 justify-center items-center gap-10 text-sm font-semibold text-gray-600">
                    <Link to="/#how-it-works" className="hover:text-blue-600 transition-colors">How It Works</Link>
                    <Link to="/#features" className="hover:text-blue-600 transition-colors">Features</Link>
                    <Link to="/pricing" className="hover:text-blue-600 transition-colors">Pricing</Link>
                </nav>

                {/* Right actions - Fixed width on the right */}
                <div className="w-48 flex-shrink-0 flex items-center justify-end gap-6">
                    {!localStorage.getItem("token") ? (
                        <>
                            <Link
                                to="/login"
                                className="text-sm font-bold text-gray-700 hover:text-blue-600 transition-colors"
                            >
                                Login
                            </Link>
                            <Link
                                to="/signup"
                                className="bg-blue-600 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-blue-700 transition-all hover:shadow-lg"
                            >
                                Get Started
                            </Link>
                        </>
                    ) : (
                        <AvatarMenu />
                    )}
                </div>

            </div>
        </header>
    )
}