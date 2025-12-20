import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { Users, AlertCircle, Check } from 'lucide-react';
import axios from 'axios';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const [pendingScans, setPendingScans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingScan, setEditingScan] = useState(null);
    const [adminComment, setAdminComment] = useState('');
    const [detectedDisease, setDetectedDisease] = useState('');

    useEffect(() => {
        const fetchScans = async () => {
            try {
                const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const { data } = await axios.get('http://localhost:5000/api/detect/admin/all', config);
                // Filter locally for pending reviews, or backend could do it
                setPendingScans(data.filter(s => s.status === 'pending_review'));
                setLoading(false);
            } catch (error) {
                console.error('Error fetching scans:', error);
                setLoading(false);
            }
        };

        if (user && user.role === 'admin') {
            fetchScans();
        }
    }, [user]);

    const handleResolve = async (id, status) => {
        try {
            const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };

            await axios.put(`http://localhost:5000/api/detect/admin/${id}`, {
                detectedDisease,
                adminComment
            }, config);

            // Remove from local state
            setPendingScans(prev => prev.filter(s => s._id !== id));
            setEditingScan(null);
            setAdminComment('');
            setDetectedDisease('');
            alert('Scan resolved successfully');
        } catch (error) {
            console.error('Error resolving scan:', error);
            alert('Failed to resolve scan');
        }
    };

    if (!user || user.role !== 'admin') {
        return <div className="p-20 text-center font-bold text-red-600">Unauthorized Access</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-extrabold text-nature-900 tracking-tight">
                        Admin Dashboard
                    </h1>
                    <p className="text-stone-500 mt-2 text-lg">
                        Manage global crop data, research links, and system statistics.
                    </p>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
                <div className="card border-l-8 border-l-nature-600 transform hover:-translate-y-1">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-nature-100 rounded-lg text-nature-600">
                            <Users size={24} />
                        </div>
                        <h3 className="text-stone-500 font-medium uppercase tracking-wider text-xs">Total Farmers</h3>
                    </div>
                    <p className="text-4xl font-extrabold text-nature-800">124</p>
                </div>

                <div className="card border-l-8 border-l-amber-500 transform hover:-translate-y-1">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-amber-100 rounded-lg text-amber-600">
                            <AlertCircle size={24} />
                        </div>
                        <h3 className="text-stone-500 font-medium uppercase tracking-wider text-xs">Pending Reviews</h3>
                    </div>
                    <p className="text-4xl font-extrabold text-amber-700">{pendingScans.length}</p>
                </div>


            </div>

            {/* Pending Reviews Section */}
            <div className="mb-12">
                <h2 className="text-2xl font-bold text-nature-900 mb-6 flex items-center gap-2">
                    <AlertCircle className="text-amber-600" /> Pending Scan Reviews
                </h2>

                {loading ? (
                    <p>Loading pending reviews...</p>
                ) : pendingScans.length === 0 ? (
                    <div className="bg-white p-8 rounded-xl border border-stone-200 text-center text-stone-500">
                        <Check className="mx-auto h-12 w-12 text-green-500 mb-4" />
                        <p className="text-lg">No scans pending review. All good!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pendingScans.map(scan => (
                            <div key={scan._id} className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm flex flex-col md:flex-row gap-6">
                                <img
                                    src={`http://localhost:5000${scan.inputImageUrl}`}
                                    alt="Scan"
                                    className="w-32 h-32 object-cover rounded-lg border border-stone-100"
                                />
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-bold text-stone-800 mb-1">{scan.cropType}</h3>
                                            <p className="text-stone-600 text-sm mb-2">
                                                AI Prediction: <span className="font-semibold text-nature-700">{scan.detectedDisease}</span>
                                                <span className="ml-2 text-xs bg-stone-100 px-2 py-0.5 rounded text-stone-500">Confidence: {scan.confidenceScore}%</span>
                                            </p>
                                            <p className="text-xs text-stone-400">User ID: {scan.userId?._id || scan.userId}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide">Pending Review</span>
                                            <p className="text-xs text-stone-400 mt-1">{new Date(scan.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    {editingScan === scan._id ? (
                                        <div className="mt-4 bg-stone-50 p-4 rounded-lg border border-stone-200 animate-fade-in">
                                            <h4 className="font-bold text-stone-700 mb-3 text-sm uppercase tracking-wide">Admin Correction</h4>
                                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-stone-500 mb-1">Correct Diagnosis</label>
                                                    <input
                                                        type="text"
                                                        className="input-field w-full"
                                                        value={detectedDisease}
                                                        onChange={(e) => setDetectedDisease(e.target.value)}
                                                        placeholder="e.g. Bacterial Blight"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-stone-500 mb-1">Admin Comment</label>
                                                    <input
                                                        type="text"
                                                        className="input-field w-full"
                                                        value={adminComment}
                                                        onChange={(e) => setAdminComment(e.target.value)}
                                                        placeholder="Explain the correction..."
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex gap-2 justify-end">
                                                <button
                                                    onClick={() => setEditingScan(null)}
                                                    className="px-4 py-2 text-stone-600 hover:bg-stone-200 rounded-lg text-sm font-medium"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={() => handleResolve(scan._id)}
                                                    className="btn-primary px-4 py-2 text-sm flex items-center gap-2"
                                                >
                                                    <Check size={16} /> Mark Resolved
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mt-4 flex justify-end">
                                            <button
                                                onClick={() => {
                                                    setEditingScan(scan._id);
                                                    setDetectedDisease(scan.detectedDisease);
                                                    setAdminComment('');
                                                }}
                                                className="bg-nature-600 text-white hover:bg-nature-700 px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors"
                                            >
                                                Review & Correct
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
