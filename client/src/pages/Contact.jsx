import { useState, useContext } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle, Microscope } from 'lucide-react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Contact = () => {
    const { user } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        setSubmitted(true);
        setTimeout(() => {
            setSubmitted(false);
            setFormData({ name: '', email: '', subject: '', message: '' });
        }, 3000);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="bg-earth-50 min-h-screen py-12 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-extrabold text-nature-900 mb-4">Get In Touch</h1>
                    <p className="text-xl text-stone-600 max-w-2xl mx-auto">
                        Have questions? We're here to help. Send us a message and we'll respond as soon as possible.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Contact Form */}
                    <div className="card">
                        <h2 className="text-2xl font-bold text-nature-900 mb-6">Send Us a Message</h2>

                        {submitted ? (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                                <CheckCircle className="mx-auto text-green-600 mb-4" size={64} />
                                <h3 className="text-2xl font-bold text-green-800 mb-2">Message Sent!</h3>
                                <p className="text-green-700">Thank you for contacting us. We'll get back to you soon.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-stone-700 mb-2">Your Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        className="input-field"
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-stone-700 mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        className="input-field"
                                        placeholder="john@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-stone-700 mb-2">Subject</label>
                                    <input
                                        type="text"
                                        name="subject"
                                        required
                                        className="input-field"
                                        placeholder="How can we help?"
                                        value={formData.subject}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-stone-700 mb-2">Message</label>
                                    <textarea
                                        name="message"
                                        required
                                        rows="5"
                                        className="input-field resize-none"
                                        placeholder="Tell us more..."
                                        value={formData.message}
                                        onChange={handleChange}
                                    ></textarea>
                                </div>
                                <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                                    <Send size={20} />
                                    Send Message
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-6">
                        <div className="card">
                            <h2 className="text-2xl font-bold text-nature-900 mb-6">Contact Information</h2>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-nature-100 rounded-lg">
                                        <MapPin className="text-nature-700" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-stone-800 mb-1">Office Address</h3>
                                        <p className="text-stone-600">Dhaka, Bangladesh</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-nature-100 rounded-lg">
                                        <Mail className="text-nature-700" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-stone-800 mb-1">Email Us</h3>
                                        <a href="mailto:aniktonmoy2000@gmail.com" className="text-nature-600 hover:underline">
                                            aniktonmoy2000@gmail.com
                                        </a>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-nature-100 rounded-lg">
                                        <Phone className="text-nature-700" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-stone-800 mb-1">Call Us</h3>
                                        <a href="tel:01851541794" className="text-nature-600 hover:underline">
                                            01851541794
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card bg-gradient-to-br from-nature-600 to-nature-700 text-white">
                            <h3 className="text-xl font-bold mb-3">Business Hours</h3>
                            <div className="space-y-2 text-nature-100">
                                <p><span className="font-semibold">Monday - Friday:</span> 9:00 AM - 6:00 PM</p>
                                <p><span className="font-semibold">Saturday:</span> 10:00 AM - 4:00 PM</p>
                                <p><span className="font-semibold">Sunday:</span> Closed</p>
                            </div>
                        </div>

                        {user && user.role === 'admin' && (
                            <div className="card bg-nature-700 text-white border-none shadow-lg transform hover:scale-[1.02] transition-transform cursor-pointer">
                                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                                    <Microscope className="text-amber-400" /> Research / Problem Issues
                                </h3>
                                <p className="text-nature-100 text-sm mb-4">
                                    Access the secure research module to manage problem reports and sync professional solutions.
                                </p>
                                <Link to="/admin/problems" className="block text-center bg-white text-nature-800 font-bold py-2 rounded-lg hover:bg-amber-50 transition-colors">
                                    Open Research Module
                                </Link>
                            </div>
                        )}

                        <div className="card bg-amber-50 border-l-4 border-l-amber-500">
                            <h3 className="text-lg font-bold text-amber-900 mb-2">Need Immediate Help?</h3>
                            <p className="text-amber-800 text-sm">
                                For urgent crop disease issues, please contact our support team or use our Live Support Chat for instant assistance.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
