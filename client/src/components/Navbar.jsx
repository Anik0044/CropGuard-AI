import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { Leaf, LogOut, User, Menu, X, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-gradient-to-r from-nature-800 to-nature-900 text-white shadow-xl sticky top-0 z-50 border-b border-white/10 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link to="/" className="flex items-center space-x-2">
                        <Leaf className="h-8 w-8 text-amber-400" />
                        <span className="font-bold text-xl tracking-tight">CropGuard AI</span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-1">
                            <Link to="/" className="hover:bg-nature-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Home</Link>
                            <Link to="/about" className="hover:bg-nature-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">About</Link>
                            <Link to="/education" className="hover:bg-nature-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Education</Link>
                            <Link to="/pricing" className="hover:bg-nature-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Pricing</Link>
                            {user && user.role === 'admin' && (
                                <>
                                    <Link to="/admin" className="bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 px-3 py-2 rounded-md text-sm font-bold transition-colors flex items-center gap-1">
                                        <ShieldCheck size={16} className="text-amber-700" /> Admin
                                    </Link>
                                    <Link to="/admin/scans" className="bg-nature-700 hover:bg-nature-600 px-3 py-2 rounded-md text-sm font-medium transition-colors border border-nature-600">
                                        Admin Tools
                                    </Link>
                                    <Link to="/admin/training" className="bg-nature-700 hover:bg-nature-600 px-3 py-2 rounded-md text-sm font-medium transition-colors border border-nature-600">
                                        Train AI
                                    </Link>
                                </>
                            )}
                            <Link to="/contact" className="hover:bg-nature-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Contact</Link>
                            {user && (
                                <>
                                    <Link to="/scan" className="hover:bg-nature-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Scan</Link>
                                    <Link to="/dashboard" className="hover:bg-nature-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Dashboard</Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Desktop Auth Buttons */}
                    <div className="hidden md:block">
                        {user ? (
                            <div className="flex items-center space-x-4">
                                <span className="text-sm text-green-100 flex items-center gap-1"><User size={16} /> {user.name}</span>
                                <button
                                    onClick={handleLogout}
                                    className="bg-amber-600 hover:bg-amber-700 px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                                >
                                    <LogOut size={16} /> Logout
                                </button>
                            </div>
                        ) : (
                            <div className="space-x-2">
                                <Link
                                    to="/login"
                                    className="hover:bg-nature-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-amber-600 hover:bg-amber-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="-mr-2 flex md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="bg-green-800 inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-green-600 focus:outline-none"
                        >
                            {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <div className="md:hidden bg-green-800 py-2">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <Link to="/" className="block hover:bg-green-700 px-3 py-2 rounded-md text-base font-medium" onClick={() => setIsOpen(false)}>Home</Link>
                        <Link to="/about" className="block hover:bg-green-700 px-3 py-2 rounded-md text-base font-medium" onClick={() => setIsOpen(false)}>About</Link>
                        <Link to="/education" className="block hover:bg-green-700 px-3 py-2 rounded-md text-base font-medium" onClick={() => setIsOpen(false)}>Education</Link>
                        <Link to="/pricing" className="block hover:bg-green-700 px-3 py-2 rounded-md text-base font-medium" onClick={() => setIsOpen(false)}>Pricing</Link>
                        {user && user.role === 'admin' && (
                            <>
                                <Link to="/admin" className="block bg-amber-700 hover:bg-amber-600 px-3 py-2 rounded-md text-base font-bold flex items-center gap-2" onClick={() => setIsOpen(false)}>
                                    <ShieldCheck size={18} className="text-amber-200" /> Admin Panel
                                </Link>
                                <Link to="/admin/scans" className="block hover:bg-green-700 px-3 py-2 rounded-md text-base font-medium" onClick={() => setIsOpen(false)}>Admin Tools</Link>
                                <Link to="/admin/training" className="block hover:bg-green-700 px-3 py-2 rounded-md text-base font-medium" onClick={() => setIsOpen(false)}>Train AI</Link>
                            </>
                        )}
                        <Link to="/contact" className="block hover:bg-green-700 px-3 py-2 rounded-md text-base font-medium" onClick={() => setIsOpen(false)}>Contact</Link>
                        {user && (
                            <>
                                <Link to="/scan" className="block hover:bg-green-700 px-3 py-2 rounded-md text-base font-medium" onClick={() => setIsOpen(false)}>Scan</Link>
                                <Link to="/dashboard" className="block hover:bg-green-700 px-3 py-2 rounded-md text-base font-medium" onClick={() => setIsOpen(false)}>Dashboard</Link>
                            </>
                        )}

                        {/* Mobile Auth */}
                        {user ? (
                            <>
                                <div className="px-3 py-2 text-sm text-green-100 border-t border-green-700 mt-2 pt-2">
                                    Logged in as: <span className="font-semibold">{user.name}</span>
                                </div>
                                <button
                                    onClick={() => { handleLogout(); setIsOpen(false); }}
                                    className="w-full text-left block bg-amber-600 hover:bg-amber-700 px-3 py-2 rounded-md text-base font-medium"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="block hover:bg-green-700 px-3 py-2 rounded-md text-base font-medium border-t border-green-700 mt-2 pt-2" onClick={() => setIsOpen(false)}>Login</Link>
                                <Link to="/register" className="block bg-amber-600 hover:bg-amber-700 px-3 py-2 rounded-md text-base font-medium mt-2" onClick={() => setIsOpen(false)}>Get Started</Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
