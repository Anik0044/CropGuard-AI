import { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronDown, ChevronUp, AlertCircle, CheckCircle, BookOpen, Target, Users, AlertTriangle, Sparkles, TrendingUp } from 'lucide-react';

const Education = () => {
    const [crops, setCrops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedDisease, setExpandedDisease] = useState(null);
    const [activeTab, setActiveTab] = useState('about'); // 'about' or 'library'

    useEffect(() => {
        const fetchCrops = async () => {
            try {
                const { data } = await axios.get('http://localhost:5000/api/crops');
                setCrops(data);
            } catch (error) {
                console.error('Error fetching crops:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCrops();
    }, []);

    const toggleDisease = (id) => {
        setExpandedDisease(expandedDisease === id ? null : id);
    };

    return (
        <div className="bg-earth-50 min-h-screen">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-nature-800 via-nature-700 to-nature-900 text-white py-16 px-4">
                <div className="max-w-5xl mx-auto text-center">
                    <BookOpen className="mx-auto mb-4" size={64} />
                    <h1 className="text-5xl font-extrabold mb-4">Education Center</h1>
                    <p className="text-xl text-nature-100">
                        Learn about crop disease detection and protect your harvest
                    </p>
                </div>
            </section>

            {/* Tabs */}
            <div className="max-w-6xl mx-auto px-4 mt-8">
                <div className="flex gap-4 border-b border-stone-200">
                    <button
                        onClick={() => setActiveTab('about')}
                        className={`px-6 py-3 font-bold transition ${activeTab === 'about'
                                ? 'text-nature-700 border-b-4 border-nature-600'
                                : 'text-stone-500 hover:text-nature-600'
                            }`}
                    >
                        About the System
                    </button>
                    <button
                        onClick={() => setActiveTab('library')}
                        className={`px-6 py-3 font-bold transition ${activeTab === 'library'
                                ? 'text-nature-700 border-b-4 border-nature-600'
                                : 'text-stone-500 hover:text-nature-600'
                            }`}
                    >
                        Disease Library
                    </button>
                </div>
            </div>

            {/* About System Tab */}
            {activeTab === 'about' && (
                <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
                    {/* What is Crop Disease Detection */}
                    <section className="card">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="p-3 bg-nature-100 rounded-lg">
                                <Target className="text-nature-700" size={32} />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-nature-900 mb-3">What Is Crop Disease Detection?</h2>
                                <p className="text-stone-700 leading-relaxed mb-3">
                                    Crop Disease Detection is a web-based system that helps users identify possible plant diseases by analyzing images of crop leaves.
                                </p>
                                <p className="text-stone-700 leading-relaxed">
                                    The system is designed to raise awareness and support early decision-making rather than providing expert-level diagnosis.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Why It's Important */}
                    <section className="card bg-amber-50 border-l-8 border-l-amber-500">
                        <h2 className="text-3xl font-bold text-amber-900 mb-4 flex items-center gap-3">
                            <AlertCircle size={32} />
                            Why Crop Disease Detection Is Important
                        </h2>
                        <div className="space-y-3 text-amber-900">
                            <p className="leading-relaxed">
                                Crop diseases cause significant losses every year, especially in regions where farmers have limited access to agricultural experts.
                            </p>
                            <p className="leading-relaxed">
                                <strong>Early identification</strong> of plant diseases can help reduce damage, improve crop yield, and promote healthier farming practices.
                            </p>
                        </div>
                    </section>

                    {/* How the System Works */}
                    <section className="card">
                        <h2 className="text-3xl font-bold text-nature-900 mb-6 flex items-center gap-3">
                            <Sparkles size={32} className="text-nature-600" />
                            How the System Works
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <StepCard
                                number="1"
                                title="Upload Image"
                                description="The user uploads an image of a crop leaf showing symptoms."
                            />
                            <StepCard
                                number="2"
                                title="AI Processing"
                                description="The system processes the image using our disease detection model."
                            />
                            <StepCard
                                number="3"
                                title="Disease Detection"
                                description="A possible disease name and confidence score are generated."
                            />
                            <StepCard
                                number="4"
                                title="Get Recommendations"
                                description="General treatment and prevention suggestions are displayed."
                            />
                        </div>
                    </section>

                    {/* Information Provided */}
                    <section className="card bg-green-50">
                        <h2 className="text-3xl font-bold text-green-900 mb-6">Types of Information You Will Receive</h2>
                        <p className="text-green-800 mb-4">For each detected disease, the system provides:</p>
                        <div className="grid md:grid-cols-2 gap-3">
                            <InfoItem text="Disease name" />
                            <InfoItem text="Confidence level of detection" />
                            <InfoItem text="Basic explanation of the disease" />
                            <InfoItem text="Possible causes" />
                            <InfoItem text="General prevention tips" />
                            <InfoItem text="Chemical and non-chemical treatments" />
                        </div>
                    </section>

                    {/* Understanding Results */}
                    <section className="card border-l-8 border-l-blue-500">
                        <h2 className="text-3xl font-bold text-blue-900 mb-4">Understanding the Results</h2>
                        <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                            <p className="text-blue-900 flex items-start gap-2">
                                <AlertCircle className="flex-shrink-0 mt-1" size={20} />
                                <span>The results shown by this system are <strong>for educational and awareness purposes only</strong>.</span>
                            </p>
                            <p className="text-blue-900 flex items-start gap-2">
                                <AlertCircle className="flex-shrink-0 mt-1" size={20} />
                                <span>They should <strong>not be considered as professional agricultural advice</strong>.</span>
                            </p>
                            <p className="text-blue-900 flex items-start gap-2">
                                <CheckCircle className="flex-shrink-0 mt-1" size={20} />
                                <span>Farmers are encouraged to <strong>consult agricultural experts</strong> for critical decisions.</span>
                            </p>
                        </div>
                    </section>

                    {/* Who Can Use */}
                    <section className="card">
                        <h2 className="text-3xl font-bold text-nature-900 mb-6 flex items-center gap-3">
                            <Users size={32} className="text-nature-600" />
                            Who Can Use This System
                        </h2>
                        <p className="text-stone-700 mb-4">This platform is designed for:</p>
                        <div className="space-y-3">
                            <UserTypeCard
                                title="Farmers"
                                description="Farmers with basic internet access seeking quick crop health awareness"
                            />
                            <UserTypeCard
                                title="Students"
                                description="Students learning about plant diseases and agricultural practices"
                            />
                            <UserTypeCard
                                title="Anyone Interested"
                                description="Anyone seeking quick crop health awareness and education"
                            />
                        </div>
                        <p className="mt-4 text-green-700 font-semibold bg-green-50 p-3 rounded-lg">
                            ✓ No technical knowledge is required to use the system
                        </p>
                    </section>

                    {/* Limitations */}
                    <section className="card bg-amber-50 border-l-8 border-l-amber-500">
                        <h2 className="text-3xl font-bold text-amber-900 mb-6 flex items-center gap-3">
                            <AlertTriangle size={32} />
                            Limitations of the System
                        </h2>
                        <ul className="space-y-3 text-amber-900">
                            <li className="flex items-start gap-2">
                                <span className="text-amber-600 font-bold">•</span>
                                <span>Uses a placeholder model, not a real-world trained ML model</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-amber-600 font-bold">•</span>
                                <span>Accuracy may vary depending on image quality</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-amber-600 font-bold">•</span>
                                <span>Only supports basic disease awareness, not full diagnosis</span>
                            </li>
                        </ul>
                    </section>

                    {/* Future Improvements */}
                    <section className="card bg-gradient-to-br from-nature-600 to-nature-700 text-white">
                        <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                            <TrendingUp size={32} />
                            Future Improvements
                        </h2>
                        <p className="text-nature-100 mb-4">In the future, this system can be expanded to include:</p>
                        <div className="grid md:grid-cols-2 gap-4">
                            <FutureFeature text="Real machine learning models" />
                            <FutureFeature text="More crop and disease types" />
                            <FutureFeature text="Weather-based disease prediction" />
                            <FutureFeature text="AI chatbot for agricultural guidance" icon="✓" />
                        </div>
                        <p className="mt-4 text-sm text-nature-200 bg-white/10 p-3 rounded-lg">
                            Note: AI Chatbot feature is already available! Click the chat button in the bottom-right corner.
                        </p>
                    </section>
                </div>
            )}

            {/* Disease Library Tab */}
            {activeTab === 'library' && (
                <div className="max-w-6xl mx-auto px-4 py-12">
                    <h2 className="text-4xl font-bold text-center text-nature-900 mb-8">Disease Library</h2>
                    {loading ? (
                        <div className="text-center py-20">Loading disease library...</div>
                    ) : (
                        <div className="space-y-8">
                            {crops.map((crop) => (
                                <div key={crop._id} className="bg-white rounded-lg shadow-md overflow-hidden border border-stone-200">
                                    <div className="bg-green-100 px-6 py-4 border-b border-green-200">
                                        <h2 className="text-2xl font-bold text-green-800">{crop.cropName}</h2>
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-lg font-semibold text-stone-700 mb-4">Common Diseases:</h3>
                                        <div className="space-y-4">
                                            {crop.diseases.map((disease) => {
                                                const uniqueId = `${crop._id}-${disease.name}`;
                                                const isExpanded = expandedDisease === uniqueId;

                                                return (
                                                    <div key={uniqueId} className="border border-stone-200 rounded-lg">
                                                        <button
                                                            onClick={() => toggleDisease(uniqueId)}
                                                            className="w-full flex justify-between items-center px-4 py-3 bg-stone-50 hover:bg-stone-100 transition rounded-t-lg focus:outline-none"
                                                        >
                                                            <span className="font-semibold text-stone-800">{disease.name}</span>
                                                            {isExpanded ? <ChevronUp className="text-stone-500" /> : <ChevronDown className="text-stone-500" />}
                                                        </button>

                                                        {isExpanded && (
                                                            <div className="px-4 py-4 bg-white space-y-4 animate-fadeIn">
                                                                <div className="grid md:grid-cols-2 gap-4">
                                                                    <div>
                                                                        <h4 className="font-bold text-amber-600 flex items-center gap-2 mb-2"><AlertCircle size={18} /> Symptoms</h4>
                                                                        <ul className="list-disc list-inside text-sm text-stone-600 space-y-1">
                                                                            {disease.symptoms.map((s, i) => <li key={i}>{s}</li>)}
                                                                        </ul>
                                                                    </div>
                                                                    <div>
                                                                        <h4 className="font-bold text-stone-600 mb-2">Causes</h4>
                                                                        <ul className="list-disc list-inside text-sm text-stone-600 space-y-1">
                                                                            {disease.causes.map((c, i) => <li key={i}>{c}</li>)}
                                                                        </ul>
                                                                    </div>
                                                                </div>

                                                                <hr className="border-stone-100" />

                                                                <div>
                                                                    <h4 className="font-bold text-green-600 flex items-center gap-2 mb-2"><CheckCircle size={18} /> Treatments</h4>
                                                                    <div className="grid md:grid-cols-2 gap-4">
                                                                        <div className="bg-green-50 p-3 rounded">
                                                                            <h5 className="font-semibold text-green-800 text-sm mb-1">Organic</h5>
                                                                            <ul className="list-disc list-inside text-sm text-stone-600">
                                                                                {disease.organicTreatment.map((t, i) => <li key={i}>{t}</li>)}
                                                                            </ul>
                                                                        </div>
                                                                        <div className="bg-amber-50 p-3 rounded">
                                                                            <h5 className="font-semibold text-amber-800 text-sm mb-1">Chemical</h5>
                                                                            <ul className="list-disc list-inside text-sm text-stone-600">
                                                                                {disease.chemicalTreatment.map((t, i) => <li key={i}>{t}</li>)}
                                                                            </ul>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {crops.length === 0 && <p className="text-center text-stone-500">No crop data available yet.</p>}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// Helper Components
const StepCard = ({ number, title, description }) => (
    <div className="bg-stone-50 p-4 rounded-lg border-l-4 border-l-nature-600">
        <div className="flex items-center gap-3 mb-2">
            <span className="bg-nature-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">{number}</span>
            <h3 className="font-bold text-stone-800">{title}</h3>
        </div>
        <p className="text-sm text-stone-600">{description}</p>
    </div>
);

const InfoItem = ({ text }) => (
    <div className="flex items-center gap-2 text-green-800">
        <CheckCircle size={18} className="text-green-600 flex-shrink-0" />
        <span>{text}</span>
    </div>
);

const UserTypeCard = ({ title, description }) => (
    <div className="bg-nature-50 p-4 rounded-lg border-l-4 border-l-nature-600">
        <h3 className="font-bold text-nature-900 mb-1">{title}</h3>
        <p className="text-sm text-stone-600">{description}</p>
    </div>
);

const FutureFeature = ({ text, icon = "→" }) => (
    <div className="flex items-center gap-2 text-white">
        <span className="text-amber-300 font-bold">{icon}</span>
        <span>{text}</span>
    </div>
);

export default Education;
