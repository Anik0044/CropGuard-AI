import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gradient-to-br from-nature-900 via-nature-800 to-nature-900 text-white py-12 px-4 mt-16">
            <div className="max-w-7xl mx-auto">
                <div className="grid md:grid-cols-4 gap-8 mb-8">
                    {/* Company Info */}
                    <div>
                        <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <span className="text-amber-400">🌾</span> CropGuard AI
                        </h3>
                        <p className="text-nature-100 mb-4">
                            Protecting crops with AI precision. Empowering farmers with technology.
                        </p>
                        <div className="flex gap-3">
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition">
                                <Facebook size={20} />
                            </a>
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition">
                                <Twitter size={20} />
                            </a>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition">
                                <Instagram size={20} />
                            </a>
                            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
                                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition">
                                <Linkedin size={20} />
                            </a>
                            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer"
                                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition">
                                <Youtube size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-bold mb-4">Quick Links</h4>
                        <ul className="space-y-2">
                            <li><Link to="/" className="text-nature-100 hover:text-amber-400 transition">Home</Link></li>
                            <li><Link to="/about" className="text-nature-100 hover:text-amber-400 transition">About Us</Link></li>
                            <li><Link to="/education" className="text-nature-100 hover:text-amber-400 transition">Disease Library</Link></li>
                            <li><Link to="/how-it-works" className="text-nature-100 hover:text-amber-400 transition">How It Works</Link></li>
                            <li><Link to="/pricing" className="text-nature-100 hover:text-amber-400 transition">Pricing</Link></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="text-lg font-bold mb-4">Resources</h4>
                        <ul className="space-y-2">
                            <li><Link to="/scan" className="text-nature-100 hover:text-amber-400 transition">Disease Scanner</Link></li>
                            <li><Link to="/dashboard" className="text-nature-100 hover:text-amber-400 transition">Dashboard</Link></li>
                            <li><Link to="/contact" className="text-nature-100 hover:text-amber-400 transition">Contact Us</Link></li>
                            <li><a href="#" className="text-nature-100 hover:text-amber-400 transition">Privacy Policy</a></li>
                            <li><a href="#" className="text-nature-100 hover:text-amber-400 transition">Terms of Service</a></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-lg font-bold mb-4">Contact Us</h4>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-2">
                                <MapPin size={18} className="text-amber-400 mt-1 flex-shrink-0" />
                                <span className="text-nature-100">Dhaka, Bangladesh</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Mail size={18} className="text-amber-400 flex-shrink-0" />
                                <a href="mailto:aniktonmoy2000@gmail.com" className="text-nature-100 hover:text-amber-400 transition">
                                    aniktonmoy2000@gmail.com
                                </a>
                            </li>
                            <li className="flex items-center gap-2">
                                <Phone size={18} className="text-amber-400 flex-shrink-0" />
                                <a href="tel:01851541794" className="text-nature-100 hover:text-amber-400 transition">
                                    01851541794
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/10 pt-6 mt-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-nature-200 text-sm">
                            © {currentYear} CropGuard AI. All rights reserved.
                        </p>
                        <p className="text-nature-200 text-sm">
                            Made with ❤️ by Anik Hossain
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
