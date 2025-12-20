import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { Check, X, Edit2, AlertCircle, Save } from 'lucide-react';
import axios from 'axios';

const AdminScanManager = () => {
    const { user } = useContext(AuthContext);
    const [scans, setScans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({
        detectedDisease: '',
        confidenceScore: '',
        adminComment: '',
        symptoms: '',
        causes: '',
        organicTreatment: '',
        chemicalTreatment: '',
        prevention: ''
    });

    useEffect(() => {
        fetchScans();
    }, [user]);

    const fetchScans = async () => {
        try {
            const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('/api/detect/admin/all', config);
            // Sort to put pending_review at the top
            const sortedScans = data.sort((a, b) => {
                if (a.status === 'pending_review' && b.status !== 'pending_review') return -1;
                if (a.status !== 'pending_review' && b.status === 'pending_review') return 1;
                return new Date(b.date) - new Date(a.date);
            });
            setScans(sortedScans);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching scans:', error);
            setLoading(false);
        }
    };

    const handleEdit = (scan) => {
        setEditingId(scan._id);
        const cd = scan.customDetails || {};
        setEditForm({
            detectedDisease: scan.detectedDisease,
            confidenceScore: scan.confidenceScore,
            adminComment: scan.adminComment || '',
            symptoms: (cd.symptoms || []).join('\n'),
            causes: (cd.causes || []).join('\n'),
            organicTreatment: (cd.organicTreatment || []).join('\n'),
            chemicalTreatment: (cd.chemicalTreatment || []).join('\n'),
            prevention: (cd.prevention || []).join('\n')
        });
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditForm({
            detectedDisease: '',
            confidenceScore: '',
            adminComment: '',
            symptoms: '',
            causes: '',
            organicTreatment: '',
            chemicalTreatment: '',
            prevention: ''
        });
    };

    const handlePublish = async (id) => {
        if (!window.confirm('Are you sure you want to publish this result? The user will be notified.')) return;

        try {
            const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };

            // We use the existing update endpoint. 
            // The controller logic we added previously handles:
            // 1. Updating the scan (status -> resolved/approved)
            // 2. Learning the signature (if image exists)
            // 3. Notifying the user
            // Process custom inputs into arrays
            const processLines = (text) => text ? text.split('\n').filter(line => line.trim() !== '') : [];

            await axios.put(`/api/detect/admin/${id}`, {
                detectedDisease: editForm.detectedDisease,
                adminComment: editForm.adminComment,
                customDetails: {
                    symptoms: processLines(editForm.symptoms),
                    causes: processLines(editForm.causes),
                    organicTreatment: processLines(editForm.organicTreatment),
                    chemicalTreatment: processLines(editForm.chemicalTreatment),
                    prevention: processLines(editForm.prevention)
                }
            }, config);

            // Refresh list
            fetchScans();
            setEditingId(null);
            alert('Scan published successfully!');

        } catch (error) {
            console.error('Error publishing:', error);
            alert('Failed to publish scan.');
        }
    };

    if (!user || user.role !== 'admin') {
        return <div className="p-20 text-center font-bold text-red-600">Unauthorized Access</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-extrabold text-nature-900 tracking-tight mb-2">Scan Management</h1>
            <p className="text-stone-500 mb-8">Review, edit, and publish user scans.</p>

            {loading ? (
                <div className="text-center py-10">Loading pending scans...</div>
            ) : scans.length === 0 ? (
                <div className="bg-white p-12 rounded-xl border border-stone-200 text-center shadow-sm">
                    <Check className="mx-auto h-16 w-16 text-green-500 mb-4" />
                    <h3 className="text-xl font-bold text-stone-800">All Caught Up!</h3>
                    <p className="text-stone-500">No pending scans to review.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {scans.map(scan => (
                        <div key={scan._id} className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden flex flex-col md:flex-row">
                            {/* Image Section */}
                            <div className="w-full md:w-64 h-64 md:h-auto bg-stone-100 relative group flex-none">
                                {scan.inputImageUrl ? (
                                    <img
                                        src={`${scan.inputImageUrl}`}
                                        alt={scan.cropType}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-stone-400">No Image</div>
                                )}
                            </div>

                            {/* Info & Edit Section */}
                            <div className="p-6 flex-1 flex flex-col justify-between">
                                {editingId === scan._id ? (
                                    <div className="animate-fade-in bg-stone-50 p-4 rounded-lg border border-stone-200">
                                        <h3 className="font-bold text-nature-800 mb-4 flex items-center gap-2">
                                            <Edit2 size={18} /> Editing Scan Record
                                        </h3>

                                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="block text-xs font-bold text-stone-500 mb-1 uppercase">Detected Disease</label>
                                                <input
                                                    type="text"
                                                    value={editForm.detectedDisease}
                                                    onChange={e => setEditForm({ ...editForm, detectedDisease: e.target.value })}
                                                    className="w-full p-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-nature-500 focus:border-transparent outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-stone-500 mb-1 uppercase">Admin Comment</label>
                                                <input
                                                    type="text"
                                                    value={editForm.adminComment}
                                                    onChange={e => setEditForm({ ...editForm, adminComment: e.target.value })}
                                                    className="w-full p-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-nature-500 focus:border-transparent outline-none"
                                                    placeholder="Add context or advice..."
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <h4 className="font-bold text-nature-800 mt-2 mb-2 flex items-center gap-2"><AlertCircle size={16} /> Expert Details (Optional)</h4>
                                                <p className="text-xs text-stone-500 mb-2">Each line will be a separate bullet point.</p>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-stone-500 mb-1 uppercase">Symptoms</label>
                                                <textarea
                                                    value={editForm.symptoms || ''}
                                                    onChange={e => setEditForm({ ...editForm, symptoms: e.target.value })}
                                                    className="w-full p-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-nature-500 h-24 text-sm"
                                                    placeholder="Yellow spots on leaves..."
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-stone-500 mb-1 uppercase">Causes</label>
                                                <textarea
                                                    value={editForm.causes || ''}
                                                    onChange={e => setEditForm({ ...editForm, causes: e.target.value })}
                                                    className="w-full p-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-nature-500 h-24 text-sm"
                                                    placeholder="Fungal infection due to humidity..."
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-stone-500 mb-1 uppercase">Organic Treatment</label>
                                                <textarea
                                                    value={editForm.organicTreatment || ''}
                                                    onChange={e => setEditForm({ ...editForm, organicTreatment: e.target.value })}
                                                    className="w-full p-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-nature-500 h-24 text-sm"
                                                    placeholder="Neem oil spray..."
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-stone-500 mb-1 uppercase">Chemical Treatment</label>
                                                <textarea
                                                    value={editForm.chemicalTreatment || ''}
                                                    onChange={e => setEditForm({ ...editForm, chemicalTreatment: e.target.value })}
                                                    className="w-full p-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-nature-500 h-24 text-sm"
                                                    placeholder="Copper fungicide..."
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-xs font-bold text-stone-500 mb-1 uppercase">Prevention</label>
                                                <textarea
                                                    value={editForm.prevention || ''}
                                                    onChange={e => setEditForm({ ...editForm, prevention: e.target.value })}
                                                    className="w-full p-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-nature-500 h-20 text-sm"
                                                    placeholder="Crop rotation, proper spacing..."
                                                />
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-3 mt-4">
                                            <button
                                                onClick={handleCancel}
                                                className="px-4 py-2 text-stone-600 hover:bg-stone-200 rounded-lg text-sm font-medium transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => handlePublish(scan._id)}
                                                className="px-6 py-2 bg-nature-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-nature-700 transition-colors flex items-center gap-2"
                                            >
                                                <Save size={16} /> Update & Publish
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div>
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full uppercase tracking-wide">
                                                            {scan.status}
                                                        </span>
                                                        <span className="text-sm text-stone-400 font-mono">
                                                            {new Date(scan.date).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <h2 className="text-2xl font-bold text-stone-800">{scan.cropType}</h2>
                                                    <p className="text-stone-600 mt-1">
                                                        Current Diagnosis: <span className="font-semibold text-nature-700">{scan.detectedDisease}</span>
                                                        <span className="text-stone-400 text-sm ml-2">({scan.confidenceScore}%)</span>
                                                    </p>
                                                    <p className="text-xs text-stone-500 mt-2">User ID: {scan.userId?._id || scan.userId}</p>
                                                </div>

                                                <button
                                                    onClick={() => handleEdit(scan)}
                                                    className="p-2 text-stone-400 hover:text-nature-600 hover:bg-nature-50 rounded-full transition-colors"
                                                    title="Edit Record"
                                                >
                                                    <Edit2 size={20} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="mt-6 flex justify-end">
                                            <button
                                                onClick={() => {
                                                    // Quick publish without edit if needed, or force edit
                                                    // Let's force edit to confirm
                                                    handleEdit(scan);
                                                }}
                                                className="px-5 py-2.5 bg-nature-600 text-white rounded-lg text-sm font-bold shadow hover:bg-nature-700 transition-all transform hover:-translate-y-0.5"
                                            >
                                                Review & Publish
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminScanManager;
