import { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, Check, AlertCircle, RefreshCw, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminTraining = () => {
    const [crops, setCrops] = useState([]);
    const [selectedCrop, setSelectedCrop] = useState('');
    const [selectedDisease, setSelectedDisease] = useState('');
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [signatures, setSignatures] = useState([]);

    useEffect(() => {
        fetchCrops();
        fetchSignatures();
    }, []);

    const fetchCrops = async () => {
        try {
            const { data } = await axios.get('/api/crops');
            setCrops(data);
        } catch (error) {
            console.error('Error fetching crops', error);
        }
    };

    const fetchSignatures = async () => {
        try {
            const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
            const { data } = await axios.get('/api/signatures', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSignatures(data);
        } catch (error) {
            console.error('Error fetching signatures', error);
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        if (selectedFile) {
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        const formData = new FormData();
        formData.append('image', file);
        formData.append('cropType', selectedCrop);
        formData.append('diseaseName', selectedDisease);

        try {
            const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
            const { data } = await axios.post('/api/signatures', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });
            setMessage({ type: 'success', text: data.message });
            setFile(null);
            setPreview(null);
            setSelectedCrop('');
            setSelectedDisease('');
            fetchSignatures(); // Refresh list
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Training failed'
            });
        } finally {
            setLoading(false);
        }
    };

    const getDiseasesForCrop = () => {
        const crop = crops.find(c => c.cropName === selectedCrop);
        return crop ? crop.diseases : [];
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="md:grid md:grid-cols-3 md:gap-6">

                    {/* Training Form */}
                    <div className="md:col-span-1">
                        <div className="px-4 sm:px-0">
                            <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center gap-2">
                                <Database className="text-amber-600" />
                                Train the AI
                            </h3>
                            <p className="mt-1 text-sm text-gray-600">
                                Upload an image and explicitly tell the system what disease it is.
                                Future scans of this exact image will return your label with 100% confidence.
                            </p>
                        </div>
                    </div>

                    <div className="mt-5 md:mt-0 md:col-span-2">
                        <form onSubmit={handleSubmit}>
                            <div className="shadow sm:rounded-md sm:overflow-hidden bg-white">
                                <div className="px-4 py-5 space-y-6 sm:p-6">

                                    {/* Crop Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Crop Type</label>
                                        <select
                                            required
                                            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-nature-500 focus:border-nature-500 sm:text-sm"
                                            value={selectedCrop}
                                            onChange={(e) => {
                                                setSelectedCrop(e.target.value);
                                                setSelectedDisease('');
                                            }}
                                        >
                                            <option value="">Select a crop</option>
                                            {crops.map(crop => (
                                                <option key={crop._id} value={crop.cropName}>{crop.cropName}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Disease Selection */}
                                    {selectedCrop && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                                            <label className="block text-sm font-medium text-gray-700">Disease Label</label>
                                            <select
                                                required
                                                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-nature-500 focus:border-nature-500 sm:text-sm"
                                                value={selectedDisease}
                                                onChange={(e) => setSelectedDisease(e.target.value)}
                                            >
                                                <option value="">Select the correct disease</option>
                                                {getDiseasesForCrop().map(d => (
                                                    <option key={d._id} value={d.name}>{d.name}</option>
                                                ))}
                                                <option value="Healthy">Healthy</option>
                                            </select>
                                        </motion.div>
                                    )}

                                    {/* Image Upload */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Reference Image</label>
                                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:bg-gray-50 transition-colors">
                                            <div className="space-y-1 text-center">
                                                {preview ? (
                                                    <div className="relative">
                                                        <img src={preview} alt="Preview" className="mx-auto h-48 object-cover rounded-md" />
                                                        <button
                                                            type="button"
                                                            onClick={() => { setFile(null); setPreview(null); }}
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                                                        >
                                                            <div className="w-4 h-4 flex items-center justify-center">x</div>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                                        <div className="flex text-sm text-gray-600 justify-center">
                                                            <label className="relative cursor-pointer bg-white rounded-md font-medium text-nature-600 hover:text-nature-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-nature-500">
                                                                <span>Upload a file</span>
                                                                <input type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                                                            </label>
                                                        </div>
                                                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Feedback Message */}
                                    <AnimatePresence>
                                        {message.text && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                className={`p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}
                                            >
                                                <div className="flex items-center">
                                                    {message.type === 'success' ? <Check size={20} className="mr-2" /> : <AlertCircle size={20} className="mr-2" />}
                                                    <p>{message.text}</p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                                <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                                    <button
                                        type="submit"
                                        disabled={loading || !file || !selectedCrop || !selectedDisease}
                                        className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${loading || !file ? 'bg-gray-400 cursor-not-allowed' : 'bg-nature-600 hover:bg-nature-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nature-500'}`}
                                    >
                                        {loading ? <RefreshCw className="animate-spin w-5 h-5" /> : 'Save Training Data'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="hidden sm:block" aria-hidden="true">
                    <div className="py-5">
                        <div className="border-t border-gray-200" />
                    </div>
                </div>

                {/* Existing Signatures List */}
                <div className="mt-10 sm:mt-0">
                    <div className="md:grid md:grid-cols-3 md:gap-6">
                        <div className="md:col-span-1">
                            <div className="px-4 sm:px-0">
                                <h3 className="text-lg font-medium leading-6 text-gray-900">Knowledge Base</h3>
                                <p className="mt-1 text-sm text-gray-600">
                                    List of all images currently trained in the system.
                                </p>
                            </div>
                        </div>
                        <div className="mt-5 md:mt-0 md:col-span-2">
                            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                                <ul className="divide-y divide-gray-200 p-4">
                                    {signatures.length === 0 ? (
                                        <li className="py-4 text-center text-gray-500 italic">No training data yet.</li>
                                    ) : (
                                        signatures.map((sig) => (
                                            <li key={sig._id} className="py-4 flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{sig.diseaseName}</p>
                                                    <p className="text-sm text-gray-500">{sig.cropType} • Hash: {sig.imageHash.substring(0, 8)}...</p>
                                                </div>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    Trained
                                                </span>
                                            </li>
                                        ))
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminTraining;
