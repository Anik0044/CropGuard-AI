import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Upload, X, Shield, AlertTriangle, CheckCircle, Info, Leaf, Droplet, Bug } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Scan = () => {
    const [selectedCrop, setSelectedCrop] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [customDisease, setCustomDisease] = useState('');
    const [allCrops, setAllCrops] = useState([]);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCrops = async () => {
            try {
                const { data } = await axios.get('/api/crops');
                setAllCrops(data);
            } catch (error) {
                console.error('Error fetching crops:', error);
            }
        };

        fetchCrops();
    }, [result]);

    const handleCropChange = (e) => {
        setSelectedCrop(e.target.value);
        setCustomDisease('');
        setResult(null);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setResult(null); // Reset result
        }
    };

    const handleScan = async () => {
        if (!selectedCrop || !imageFile) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('cropType', selectedCrop);

        // Handle custom crop/disease input for "Others"
        if (selectedCrop === 'Others' && customDisease) {
            formData.append('customDisease', customDisease);
        }

        try {
            const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            };

            const { data } = await axios.post('/api/detect', formData, config);
            setResult(data.data);
        } catch (error) {
            console.error('Scan error:', error);
            alert('Error during scanning. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const resetScan = () => {
        setImageFile(null);
        setPreviewUrl(null);
        setResult(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Scan Upload Section */}
            {!result ? (
                <div className="bg-white rounded-xl shadow-lg border border-stone-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-nature-700 to-nature-600 p-6 text-white text-center">
                        <h1 className="text-2xl font-bold">Crop Disease Detector</h1>
                        <p className="opacity-90">Upload a clear photo of the affected leaf</p>
                    </div>

                    <div className="p-8">
                        <div className="mb-6">
                            <label className="block text-sm font-bold text-stone-700 mb-2">Select Crop Type</label>
                            <select
                                value={selectedCrop}
                                onChange={handleCropChange}
                                className="input-field max-w-xs"
                            >
                                <option value="">-- Select Crop --</option>
                                {allCrops.map(crop => (
                                    <option key={crop._id} value={crop.cropName}>{crop.cropName}</option>
                                ))}
                                <option value="Others">Others</option>
                            </select>
                        </div>

                        {selectedCrop === 'Others' && (
                            <div className="mb-6 animate-fade-in">
                                <label className="block text-sm font-bold text-stone-700 mb-2">
                                    Specify Crop & Disease
                                </label>
                                <input
                                    type="text"
                                    value={customDisease}
                                    onChange={(e) => setCustomDisease(e.target.value)}
                                    placeholder="e.g. Guava - Rust"
                                    className="input-field max-w-xs"
                                    required
                                />
                            </div>
                        )}

                        <div
                            className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer ${imageFile ? 'border-green-500 bg-green-50' : 'border-stone-300 hover:border-green-400 hover:bg-stone-50'}`}
                            onClick={() => fileInputRef.current.click()}
                        >
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                            />

                            {previewUrl ? (
                                <div className="relative inline-block">
                                    <img src={previewUrl} alt="Preview" className="max-h-64 rounded-lg shadow-md" />
                                    <button
                                        onClick={(e) => { e.stopPropagation(); resetScan(); }}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-sm"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <Upload className="mx-auto h-12 w-12 text-stone-400 mb-4" />
                                    <p className="text-stone-600 font-medium">Click to upload image</p>
                                    <p className="text-xs text-stone-400 mt-1">JPG, PNG up to 10MB</p>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleScan}
                            disabled={
                                !selectedCrop ||
                                !imageFile ||
                                loading ||
                                (selectedCrop === 'Others' && !customDisease)
                            }
                            className="w-full btn-primary text-lg mt-8 py-3 flex justify-center items-center gap-2"
                        >
                            {loading ? 'Analyzing...' : <><Shield size={20} /> Run Analysis</>}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <button onClick={resetScan} className="text-stone-500 hover:text-green-700 flex items-center gap-1 font-medium">
                        &larr; Start New Scan
                    </button>

                    {result.status === 'pending_review' ? (
                        <div className="bg-amber-50 border-l-8 border-amber-500 p-8 rounded-lg shadow-lg">
                            <div className="flex items-start gap-6">
                                <div className="bg-amber-100 p-4 rounded-full">
                                    <Shield className="h-10 w-10 text-amber-600" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-amber-900 mb-2">Scan Under Expert Review</h2>
                                    <p className="text-amber-800 text-lg mb-4">
                                        Our AI could not confidently identify this disease (Confidence &lt; 70%).
                                    </p>
                                    <p className="text-stone-700 mb-6">
                                        Your scan has been automatically sent to our panel of agricultural experts for manual analysis.
                                        You will be notified via the Chatbot once the diagnosis is complete.
                                    </p>
                                    <div className="bg-white p-4 rounded border border-amber-200 text-sm text-stone-600">
                                        <strong className="block text-amber-800 mb-1">What happens next?</strong>
                                        1. An expert reviews your image.<br />
                                        2. They identify the condition and prescribe treatment.<br />
                                        3. Your dashboard is updated and you get a notification.
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className={`border-l-8 ${result.detectedDisease === 'Healthy' ? 'border-green-500' : 'border-red-500'} bg-white rounded-lg shadow-lg overflow-hidden`}>
                            {/* Header Section */}
                            <div className="bg-stone-50 p-6 border-b border-stone-200">
                                <div className="flex flex-col md:flex-row gap-6 items-start">
                                    <div className="w-full md:w-1/4">
                                        <img src={previewUrl} alt="Analyzed" className="rounded-lg shadow-md w-full" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-sm font-bold tracking-wider text-stone-500 uppercase">Detection Result</span>
                                            <span className="bg-stone-200 text-stone-700 text-xs px-3 py-1 rounded-full font-bold">{result.confidenceScore}% Confidence</span>
                                        </div>

                                        <h2 className={`text-4xl font-bold mb-2 ${result.detectedDisease === 'Healthy' ? 'text-green-600' : 'text-red-600'}`}>
                                            {result.detectedDisease}
                                        </h2>
                                        <p className="text-stone-600">Crop: <span className="font-semibold text-stone-800">{result.cropType}</span></p>
                                    </div>
                                </div>
                            </div>

                            {/* Content Section */}
                            <div className="p-8">
                                {result.detectedDisease === 'Healthy' ? (
                                    <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
                                        <p className="text-green-800 font-medium flex items-center gap-2 text-lg">
                                            <Shield className="h-6 w-6" /> No diseases detected. Your crop appears healthy! Keep up the good work!
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {/* Alert Box */}
                                        <div className="bg-amber-50 p-5 rounded-lg border-2 border-amber-300">
                                            <h4 className="font-bold text-amber-900 mb-2 flex items-center gap-2 text-lg">
                                                <AlertTriangle size={22} /> Requires Immediate Attention
                                            </h4>
                                            <p className="text-amber-900">Take action promptly to prevent disease spread and minimize crop damage.</p>
                                        </div>

                                        {/* Disease Details */}
                                        {(result.diseaseDetails || result.customDetails) ? (
                                            <div className="space-y-6">
                                                {/* Symptoms */}
                                                {(result.diseaseDetails?.symptoms?.length > 0 || result.customDetails?.symptoms?.length > 0) && (
                                                    <div className="card border-l-4 border-l-red-500">
                                                        <h3 className="font-bold text-stone-900 text-xl mb-4 flex items-center gap-2">
                                                            <AlertTriangle className="text-red-600" size={24} />
                                                            Symptoms
                                                        </h3>
                                                        <ul className="grid md:grid-cols-2 gap-3">
                                                            {(result.diseaseDetails?.symptoms || result.customDetails?.symptoms).map((symptom, idx) => (
                                                                <li key={idx} className="flex items-start gap-2 text-stone-700">
                                                                    <span className="text-red-500 mt-1">•</span>
                                                                    <span>{symptom}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                {/* Causes */}
                                                {(result.diseaseDetails?.causes?.length > 0 || result.customDetails?.causes?.length > 0) && (
                                                    <div className="card border-l-4 border-l-amber-500">
                                                        <h3 className="font-bold text-stone-900 text-xl mb-4 flex items-center gap-2">
                                                            <Info className="text-amber-600" size={24} />
                                                            Causes
                                                        </h3>
                                                        <ul className="grid md:grid-cols-2 gap-3">
                                                            {(result.diseaseDetails?.causes || result.customDetails?.causes).map((cause, idx) => (
                                                                <li key={idx} className="flex items-start gap-2 text-stone-700">
                                                                    <span className="text-amber-500 mt-1">•</span>
                                                                    <span>{cause}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                {/* Treatment Options */}
                                                {(result.diseaseDetails?.organicTreatment?.length > 0 ||
                                                    result.diseaseDetails?.chemicalTreatment?.length > 0 ||
                                                    result.customDetails?.organicTreatment?.length > 0 ||
                                                    result.customDetails?.chemicalTreatment?.length > 0) && (
                                                        <div className="card bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300">
                                                            <h3 className="font-bold text-green-900 text-2xl mb-6 flex items-center gap-2">
                                                                <Droplet className="text-green-700" size={28} />
                                                                Recommended Treatment
                                                            </h3>

                                                            <div className="grid md:grid-cols-2 gap-6">
                                                                {/* Organic Treatment */}
                                                                {(result.diseaseDetails?.organicTreatment?.length > 0 || result.customDetails?.organicTreatment?.length > 0) && (
                                                                    <div className="bg-white p-5 rounded-lg border border-green-200 shadow-sm">
                                                                        <div className="flex items-center gap-2 mb-4">
                                                                            <Leaf className="text-green-600" size={22} />
                                                                            <h4 className="font-bold text-green-800 text-lg">Organic Solutions</h4>
                                                                        </div>
                                                                        <ul className="space-y-2">
                                                                            {(result.diseaseDetails?.organicTreatment || result.customDetails?.organicTreatment).map((treatment, idx) => (
                                                                                <li key={idx} className="flex items-start gap-2 text-stone-700">
                                                                                    <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                                                                                    <span className="text-sm">{treatment}</span>
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                )}

                                                                {/* Chemical Treatment */}
                                                                {(result.diseaseDetails?.chemicalTreatment?.length > 0 || result.customDetails?.chemicalTreatment?.length > 0) && (
                                                                    <div className="bg-white p-5 rounded-lg border border-blue-200 shadow-sm">
                                                                        <div className="flex items-center gap-2 mb-4">
                                                                            <Bug className="text-blue-600" size={22} />
                                                                            <h4 className="font-bold text-blue-800 text-lg">Chemical Solutions</h4>
                                                                        </div>
                                                                        <ul className="space-y-2">
                                                                            {(result.diseaseDetails?.chemicalTreatment || result.customDetails?.chemicalTreatment).map((treatment, idx) => (
                                                                                <li key={idx} className="flex items-start gap-2 text-stone-700">
                                                                                    <CheckCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={18} />
                                                                                    <span className="text-sm">{treatment}</span>
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                {/* Prevention */}
                                                {(result.diseaseDetails?.prevention?.length > 0 || result.customDetails?.prevention?.length > 0) && (
                                                    <div className="card bg-blue-50 border-2 border-blue-300">
                                                        <h3 className="font-bold text-blue-900 text-xl mb-4 flex items-center gap-2">
                                                            <Shield className="text-blue-700" size={24} />
                                                            Prevention Methods
                                                        </h3>
                                                        <p className="text-blue-800 mb-3 font-medium">Follow these practices to prevent future outbreaks:</p>
                                                        <ul className="grid md:grid-cols-2 gap-3">
                                                            {(result.diseaseDetails?.prevention || result.customDetails?.prevention).map((method, idx) => (
                                                                <li key={idx} className="flex items-start gap-2 text-blue-900">
                                                                    <span className="text-blue-600 mt-1">✓</span>
                                                                    <span>{method}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                {/* Additional Info */}
                                                <div className="bg-stone-100 p-5 rounded-lg border border-stone-300">
                                                    <p className="text-stone-700 text-sm">
                                                        <strong className="text-stone-900">Note:</strong> These recommendations are for educational purposes. For severe infestations or critical crop decisions, please consult a local agricultural expert or extension service.
                                                    </p>
                                                </div>

                                                {/* Research Links Section */}
                                                {result.diseaseDetails.researchLinks && result.diseaseDetails.researchLinks.length > 0 && (
                                                    <div className="card border-l-4 border-l-nature-600 bg-nature-50">
                                                        <h3 className="font-bold text-nature-900 text-xl mb-4 flex items-center gap-2">
                                                            <Info className="text-nature-600" size={24} />
                                                            Verified Research Links
                                                        </h3>
                                                        <ul className="space-y-3">
                                                            {result.diseaseDetails.researchLinks.map((link, idx) => (
                                                                <li key={idx}>
                                                                    <a
                                                                        href={link}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-nature-700 hover:text-nature-900 font-medium underline flex items-center gap-2 group"
                                                                    >
                                                                        <div className="w-2 h-2 bg-nature-400 rounded-full group-hover:bg-nature-600 transition-colors"></div>
                                                                        Research Resource #{idx + 1}
                                                                    </a>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            // Fallback if disease details not found
                                            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                                                <h3 className="font-bold text-blue-900 text-lg mb-3">Detailed Information</h3>
                                                <p className="text-blue-800 mb-4">
                                                    For comprehensive treatment recommendations for <strong>{result.detectedDisease}</strong>, please visit our{' '}
                                                    <span className="font-bold text-green-700 cursor-pointer hover:underline" onClick={() => navigate('/education')}>
                                                        Disease Library
                                                    </span>.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Scan;
