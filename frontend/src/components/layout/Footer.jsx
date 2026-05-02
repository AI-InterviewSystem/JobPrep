import { Link } from 'react-router-dom';
import logo from "../../assets/images/jobprep-logo.png"

export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Column 1: Logo & Tagline */}
                    <div className="col-span-1">
                        <Link to="/" className="flex items-center gap-3 mb-6">
                            <img src={logo} alt="JobPrep Logo" className="h-8" />
                            <span className="text-xl font-bold tracking-tight text-primary">JobPrep</span>
                        </Link>
                        <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
                            Accelerating career success for the next generation of talent.
                        </p>
                    </div>

                    {/* Column 2: Product */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 mb-5">Product</h3>
                        <ul className="space-y-3">
                            <li><a href="#" className="text-gray-500 hover:text-primary text-sm transition-colors">AI Interviewer</a></li>
                            <li><a href="#" className="text-gray-500 hover:text-primary text-sm transition-colors">Resume Builder</a></li>
                            <li><a href="#" className="text-gray-500 hover:text-primary text-sm transition-colors">Career Pathing</a></li>
                        </ul>
                    </div>

                    {/* Column 3: Resources */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 mb-5">Resources</h3>
                        <ul className="space-y-3">
                            <li><a href="#" className="text-gray-500 hover:text-primary text-sm transition-colors">Interview Guide</a></li>
                            <li><a href="#" className="text-gray-500 hover:text-primary text-sm transition-colors">Blog</a></li>
                            <li><a href="#" className="text-gray-500 hover:text-primary text-sm transition-colors">Success Stories</a></li>
                        </ul>
                    </div>

                    {/* Column 4: Legal */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 mb-5">Legal</h3>
                        <ul className="space-y-3">
                            <li><a href="#" className="text-gray-500 hover:text-primary text-sm transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="text-gray-500 hover:text-primary text-sm transition-colors">Terms of Service</a></li>
                            <li><a href="#" className="text-gray-500 hover:text-primary text-sm transition-colors">Cookies</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-50 pt-8 mt-8 flex flex-col md:flex-row justify-center items-center">
                    <p className="text-gray-400 text-xs">
                        © 2026 JobPrep AI. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}