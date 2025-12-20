import { Target, Users, Lightbulb, Award, TrendingUp, Shield } from 'lucide-react';

const About = () => {
    return (
        <div className="bg-earth-50">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-nature-800 via-nature-700 to-nature-900 text-white py-20 px-4">
                <div className="max-w-5xl mx-auto text-center">
                    <h1 className="text-5xl md:text-6xl font-extrabold mb-6">About CropGuard AI</h1>
                    <p className="text-xl text-nature-100 max-w-3xl mx-auto">
                        Empowering farmers with cutting-edge AI technology to protect crops and ensure food security for generations to come.
                    </p>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-16 px-4">
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
                    <div className="card border-l-8 border-l-nature-600">
                        <Target className="text-nature-600 mb-4" size={48} />
                        <h2 className="text-3xl font-bold text-nature-900 mb-4">Our Mission</h2>
                        <p className="text-stone-600 leading-relaxed">
                            To revolutionize agriculture by providing farmers with accessible, AI-powered crop disease detection tools.
                            We believe every farmer deserves access to advanced technology that helps protect their livelihood and
                            ensures food security.
                        </p>
                    </div>
                    <div className="card border-l-8 border-l-amber-500">
                        <Lightbulb className="text-amber-500 mb-4" size={48} />
                        <h2 className="text-3xl font-bold text-nature-900 mb-4">Our Vision</h2>
                        <p className="text-stone-600 leading-relaxed">
                            A world where crop diseases are detected early, treated effectively, and prevented proactively.
                            We envision sustainable farming practices powered by AI, reducing crop loss and increasing
                            agricultural productivity globally.
                        </p>
                    </div>
                </div>
            </section>

            {/* What We Do */}
            <section className="bg-white py-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl font-bold text-center text-nature-900 mb-12">What We Do</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Shield className="text-green-600" size={40} />}
                            title="AI-Powered Detection"
                            description="Our advanced machine learning algorithms analyze crop images to identify diseases with high accuracy, providing instant results."
                        />
                        <FeatureCard
                            icon={<Users className="text-blue-600" size={40} />}
                            title="Expert Recommendations"
                            description="Get detailed treatment plans, both organic and chemical, along with prevention strategies from agricultural experts."
                        />
                        <FeatureCard
                            icon={<TrendingUp className="text-purple-600" size={40} />}
                            title="Actionable Insights"
                            description="Track your crop health over time with comprehensive analytics and historical data to make informed decisions."
                        />
                    </div>
                </div>
            </section>

            {/* Impact Statistics */}
            <section className="py-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl font-bold text-center text-nature-900 mb-12">Our Impact</h2>
                    <div className="grid md:grid-cols-4 gap-6">
                        <StatCard number="10,000+" label="Farmers Helped" />
                        <StatCard number="50,000+" label="Crops Scanned" />
                        <StatCard number="95%" label="Accuracy Rate" />
                        <StatCard number="15+" label="Countries" />
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="bg-gradient-to-br from-nature-50 to-earth-50 py-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl font-bold text-center text-nature-900 mb-12">Our Values</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <ValueCard
                            title="Innovation"
                            description="We continuously improve our AI models and expand our disease database to provide the best service."
                        />
                        <ValueCard
                            title="Accessibility"
                            description="Everyone deserves access to quality agricultural technology, regardless of their location or resources."
                        />
                        <ValueCard
                            title="Sustainability"
                            description="We promote organic and eco-friendly farming practices through our treatment recommendations."
                        />
                        <ValueCard
                            title="Trust"
                            description="We provide accurate, reliable information backed by scientific research and expert knowledge."
                        />
                    </div>
                </div>
            </section>

            {/* Technology */}
            <section className="py-16 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <Award className="mx-auto text-amber-500 mb-6" size={64} />
                    <h2 className="text-4xl font-bold text-nature-900 mb-6">Powered by Advanced Technology</h2>
                    <p className="text-lg text-stone-600 leading-relaxed mb-8">
                        CropGuard AI uses state-of-the-art deep learning models trained on thousands of crop disease images.
                        Our technology combines computer vision, natural language processing, and agricultural expertise to deliver
                        accurate disease detection and personalized treatment recommendations.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <span className="px-6 py-3 bg-nature-100 text-nature-800 rounded-full font-semibold">Machine Learning</span>
                        <span className="px-6 py-3 bg-nature-100 text-nature-800 rounded-full font-semibold">Computer Vision</span>
                        <span className="px-6 py-3 bg-nature-100 text-nature-800 rounded-full font-semibold">Cloud Computing</span>
                        <span className="px-6 py-3 bg-nature-100 text-nature-800 rounded-full font-semibold">Mobile First</span>
                    </div>
                </div>
            </section>
        </div>
    );
};

const FeatureCard = ({ icon, title, description }) => (
    <div className="card text-center hover:shadow-2xl transform hover:-translate-y-2 transition-all">
        <div className="bg-stone-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-stone-800 mb-3">{title}</h3>
        <p className="text-stone-600">{description}</p>
    </div>
);

const StatCard = ({ number, label }) => (
    <div className="card text-center border-t-8 border-t-nature-600">
        <p className="text-5xl font-extrabold text-nature-800 mb-2">{number}</p>
        <p className="text-stone-600 font-semibold">{label}</p>
    </div>
);

const ValueCard = ({ title, description }) => (
    <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-l-amber-500">
        <h3 className="text-xl font-bold text-stone-800 mb-2">{title}</h3>
        <p className="text-stone-600">{description}</p>
    </div>
);

export default About;
