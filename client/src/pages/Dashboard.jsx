import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { Plus, History, AlertTriangle, CheckCircle, Smartphone } from 'lucide-react';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                };
                const { data } = await axios.get('/api/detect/history', config);
                setHistory(data);
            } catch (error) {
                console.error('Error fetching history:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user && user.role !== 'admin') {
            fetchHistory();
        } else {
            setLoading(false);
        }
    }, [user]);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-extrabold text-nature-900 tracking-tight">
                        {user.role === 'admin' ? 'Admin Dashboard' : <span className="flex items-center gap-2">Hello, <span className="text-nature-600">{user.name}</span></span>}
                    </h1>
                    <p className="text-stone-500 mt-2 text-lg">
                        {user.role === 'admin' ? 'Manage global crop data' : 'Welcome to your farm management center'}
                    </p>
                </div>

                {user.role !== 'admin' && (
                    <Link to="/scan" className="btn-primary flex items-center gap-2 mt-6 md:mt-0 animate-fade-in">
                        <Plus size={20} /> New Scan
                    </Link>
                )}
            </div>

            {user.role === 'admin' ? (
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="card border-l-8 border-l-nature-600 transform hover:-translate-y-1">
                        <h3 className="text-stone-500 font-medium uppercase tracking-wider text-xs">Total Farmers</h3>
                        <p className="text-4xl font-extrabold text-nature-800 mt-2">124</p>
                    </div>
                    <div className="card border-l-8 border-l-earth-500 transform hover:-translate-y-1">
                        <h3 className="text-stone-500 font-medium uppercase tracking-wider text-xs">Reports Today</h3>
                        <p className="text-4xl font-extrabold text-earth-700 mt-2">15</p>
                    </div>
                    <Link to="/admin/add-crop" className="card cursor-pointer hover:bg-nature-50 block border-dashed border-2 border-nature-200 group">
                        <h3 className="text-nature-700 font-bold flex items-center gap-2 group-hover:scale-105 transition-transform"><Plus size={20} /> Add New Crop Data</h3>
                        <p className="text-sm text-stone-500 mt-1">Manage educational content</p>
                    </Link>
                </div>
            ) : (
                <div>
                    <h2 className="text-2xl font-bold text-stone-800 mb-6 flex items-center gap-3">
                        <div className="p-2 bg-nature-100 rounded-lg"><History className="text-nature-600" size={24} /></div>
                        Recent Scans
                    </h2>

                    {loading ? (
                        <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nature-600"></div></div>
                    ) : history.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-stone-200 shadow-sm">
                            <div className="bg-stone-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Smartphone className="h-10 w-10 text-stone-400" />
                            </div>
                            <p className="text-stone-500 font-medium text-lg">No scans yet.</p>
                            <Link to="/scan" className="text-nature-600 font-bold hover:underline mt-2 inline-block">Start your first scan</Link>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {history.map((scan) => (
                                <div key={scan._id} className="card relative overflow-hidden group hover:shadow-nature-200/50 p-0 border-0">
                                    <div className={`absolute top-4 right-4 px-3 py-1 text-xs font-bold text-white rounded-full shadow-md z-10 ${scan.detectedDisease === 'Healthy' ? 'bg-gradient-to-r from-nature-500 to-nature-600' : 'bg-gradient-to-r from-red-500 to-red-600'}`}>
                                        {scan.detectedDisease === 'Healthy' ? 'Healthy' : 'Infected'}
                                    </div>
                                    <div className="h-48 overflow-hidden relative">
                                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
                                        {/* Assuming inputImageUrl is relative path or full URL. For mock, might be empty or local path. */}
                                        {scan.inputImageUrl ? (
                                            <img src={`${scan.inputImageUrl}`} alt="Crop" className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-stone-100 text-stone-400">No Image</div>
                                        )}
                                    </div>
                                    <div className="p-6">
                                        <h3 className="font-bold text-xl text-stone-800 mb-1">{scan.cropType}</h3>
                                        <p className={`font-medium ${scan.detectedDisease === 'Healthy' ? 'text-nature-600' : 'text-red-500'}`}>{scan.detectedDisease}</p>

                                        <div className="flex justify-between items-center mt-6 pt-4 border-t border-stone-100">
                                            <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 bg-stone-100 px-2 py-1 rounded">
                                                {scan.detectedDisease === 'Healthy' ? <CheckCircle size={14} className="text-nature-500" /> : <AlertTriangle size={14} className="text-amber-500" />}
                                                <span>{scan.confidenceScore}% Confidence</span>
                                            </div>
                                            <span className="text-xs text-stone-400 font-medium">{new Date(scan.date).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
