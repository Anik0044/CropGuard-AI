import { Link } from 'react-router-dom';
import { Camera, ShieldCheck, BookOpen, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Home = () => {
    return (
        <div className="bg-earth-50">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-nature-800 via-nature-700 to-nature-900 text-white py-24 px-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-nature-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-earth-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow"></div>

                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center relative z-10">
                    <div className="md:w-1/2 mb-12 md:mb-0 space-y-8">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight"
                        >
                            Protect Your Crops with <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">AI Precision</span>
                        </motion.h1>
                        <p className="text-xl text-nature-100 font-light leading-relaxed max-w-lg">
                            Detect diseases instantly, get expert treatment advice, and ensure a healthy harvest for generations to come.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Link to="/register" className="btn-secondary text-lg px-8 py-4 shadow-xl hover:shadow-earth-500/30 transform hover:-translate-y-1 transition-all">
                                Start Free Trial
                            </Link>
                            <Link to="/education" className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/20 px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center gap-2">
                                <BookOpen size={20} /> Learn More
                            </Link>
                        </div>
                    </div>
                    <div className="md:w-1/2 flex justify-center">
                        <div className="relative w-80 h-80 md:w-96 md:h-96 rounded-full flex items-center justify-center shadow-2xl overflow-hidden glass-panel ring-8 ring-white/10 animate-fade-in">
                            <ShieldCheck size={160} className="text-nature-600 drop-shadow-2xl" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 px-4">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl font-bold text-center text-green-900 mb-12">How It Works</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Camera className="text-amber-500 w-10 h-10" />}
                            title="1. Capture"
                            description="Upload a photo of your affected crop leaf using your phone or computer."
                        />
                        <FeatureCard
                            icon={<ShieldCheck className="text-green-500 w-10 h-10" />}
                            title="2. Analyze"
                            description="Our advanced AI analyzes the image to identify diseases with high accuracy."
                        />
                        <FeatureCard
                            icon={<BookOpen className="text-blue-500 w-10 h-10" />}
                            title="3. Treat"
                            description="Receive instant treatment plans (organic & chemical) and prevention tips."
                        />
                    </div>
                </div>
            </section>

            {/* Supported Crops */}
            <section className="bg-stone-100 py-16 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-green-900 mb-8">Supported Crops</h2>
                    <div className="flex flex-wrap justify-center gap-4">
                        {['Tomato', 'Potato', 'Rice', 'Wheat', 'Cotton'].map((crop) => (
                            <span key={crop} className="bg-white px-6 py-3 rounded-full shadow-md text-green-800 font-semibold border border-green-200">
                                {crop}
                            </span>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

const FeatureCard = ({ icon, title, description }) => (
    <div className="card text-center hover:shadow-xl transform transition hover:-translate-y-1">
        <div className="bg-stone-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-stone-800 mb-2">{title}</h3>
        <p className="text-stone-600">{description}</p>
    </div>
);

export default Home;
