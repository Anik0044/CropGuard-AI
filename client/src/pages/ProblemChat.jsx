import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { MessageSquare, Send, CheckCircle, Lock, AlertCircle, ChevronRight, User } from 'lucide-react';

const ProblemChat = () => {
    const { user } = useContext(AuthContext);
    const [authenticated, setAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [authError, setAuthError] = useState('');
    const [problems, setProblems] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [responseText, setResponseText] = useState('');
    const [markAsSolution, setMarkAsSolution] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchProblems = async () => {
        try {
            const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('http://localhost:5000/api/problems', config);
            setProblems(data);
        } catch (error) {
            console.error('Error fetching problems:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSecondaryAuth = async (e) => {
        e.preventDefault();
        try {
            const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.post('http://localhost:5000/api/problems/auth', { password }, config);
            if (data.success) {
                setAuthenticated(true);
                fetchProblems();
            }
        } catch (error) {
            setAuthError('Incorrect password. Access denied.');
        }
    };

    const handleSendResponse = async (e) => {
        e.preventDefault();
        if (!responseText.trim()) return;

        try {
            const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const selectedProblem = problems.find(p => p._id === selectedId);

            const payload = {
                text: responseText,
                markAsSolution,
                cropDetails: markAsSolution ? {
                    cropName: selectedProblem.cropName,
                    diseaseName: selectedProblem.diseaseName,
                    organicTreatment: [responseText], // Direct capture
                } : null
            };

            const { data } = await axios.post(`http://localhost:5000/api/problems/${selectedId}/respond`, payload, config);

            setProblems(problems.map(p => p._id === selectedId ? data : p));
            setResponseText('');
            setMarkAsSolution(false);
        } catch (error) {
            console.error('Error sending response:', error);
        }
    };

    if (!authenticated) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center bg-stone-50 px-4">
                <div className="card max-w-md w-full p-10 text-center shadow-2xl">
                    <div className="w-20 h-20 bg-nature-100 rounded-full flex items-center justify-center mx-auto mb-6 text-nature-600">
                        <Lock size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-nature-900 mb-2">Secondary Authentication</h2>
                    <p className="text-stone-500 mb-8">Accessing the Research Module requires you to verify your identity again.</p>

                    <form onSubmit={handleSecondaryAuth} className="space-y-4">
                        <input
                            type="password"
                            className="input-field text-center text-lg tracking-widest"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoFocus
                        />
                        {authError && <p className="text-red-500 text-sm font-medium">{authError}</p>}
                        <button type="submit" className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                            Unlock Module
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    const activeProblem = problems.find(p => p._id === selectedId);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 min-h-[80vh]">
            <div className="flex flex-col lg:flex-row gap-8 h-[75vh]">
                {/* Sidebar: Issues List */}
                <div className="w-full lg:w-1/3 bg-white rounded-2xl shadow-lg border border-stone-200 overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-stone-100 bg-nature-50">
                        <h2 className="text-xl font-bold text-nature-900 flex items-center gap-2">
                            <AlertCircle size={20} className="text-nature-600" />
                            Problem Issues
                        </h2>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="p-10 text-center text-stone-400">Loading issues...</div>
                        ) : problems.length === 0 ? (
                            <div className="p-10 text-center text-stone-400">No active problems reported.</div>
                        ) : (
                            problems.map(prob => (
                                <button
                                    key={prob._id}
                                    onClick={() => setSelectedId(prob._id)}
                                    className={`w-full p-5 text-left border-b border-stone-50 transition-colors hover:bg-stone-50 flex items-center justify-between group ${selectedId === prob._id ? 'bg-nature-50 border-l-4 border-l-nature-600' : ''}`}
                                >
                                    <div>
                                        <h4 className="font-bold text-stone-800">{prob.cropName} - {prob.diseaseName || 'Unidentified'}</h4>
                                        <p className="text-sm text-stone-500 truncate max-w-[200px]">{prob.description}</p>
                                    </div>
                                    <ChevronRight className={`text-stone-300 group-hover:text-nature-600 ${selectedId === prob._id ? 'text-nature-600' : ''}`} size={20} />
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Main: Chat Window */}
                <div className="flex-1 bg-white rounded-2xl shadow-lg border border-stone-200 overflow-hidden flex flex-col">
                    {activeProblem ? (
                        <>
                            <div className="p-6 border-b border-stone-100 bg-white flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-bold text-stone-800">{activeProblem.cropName}</h2>
                                    <p className="text-sm text-stone-400">Status: <span className={`font-bold ${activeProblem.status === 'Resolved' ? 'text-green-600' : 'text-amber-500'}`}>{activeProblem.status}</span></p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-stone-400 uppercase tracking-tighter">Origin</p>
                                    <p className="font-medium text-stone-700">{activeProblem.senderName || 'Anonymous'}</p>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 bg-stone-50/50 space-y-6">
                                {/* Initial Problem Description */}
                                <div className="flex flex-col items-start mb-10">
                                    <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-stone-200 shadow-sm max-w-[80%]">
                                        <p className="text-xs font-bold text-nature-600 mb-1 uppercase tracking-wider underline">Problem Statement</p>
                                        <p className="text-stone-800 leading-relaxed font-medium">{activeProblem.description}</p>
                                    </div>
                                    <span className="text-[10px] text-stone-400 mt-1 ml-2 italic">Reported on {new Date(activeProblem.date).toLocaleString()}</span>
                                </div>

                                {activeProblem.messages.map((msg, idx) => (
                                    <div key={idx} className={`flex flex-col ${msg.senderId === user._id ? 'items-end' : 'items-start'}`}>
                                        <div className={`p-4 rounded-2xl ${msg.senderId === user._id ? 'bg-nature-600 text-white rounded-tr-none shadow-nature-200 shadow-md' : 'bg-white text-stone-800 rounded-tl-none border border-stone-200 shadow-sm'} max-w-[80%]`}>
                                            <p className="text-xs opacity-70 mb-1 font-bold">{msg.senderName}</p>
                                            <p className="leading-relaxed">{msg.text}</p>
                                        </div>
                                        <span className="text-[10px] text-stone-400 mt-1 mx-2">{new Date(msg.createdAt).toLocaleTimeString()}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="p-6 bg-white border-t border-stone-100">
                                <form onSubmit={handleSendResponse}>
                                    <textarea
                                        className="input-field mb-4 h-24 resize-none focus:ring-2 focus:ring-nature-500"
                                        placeholder="Write your response or professional solution..."
                                        value={responseText}
                                        onChange={(e) => setResponseText(e.target.value)}
                                    ></textarea>
                                    <div className="flex items-center justify-between">
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                className="w-5 h-5 rounded border-stone-300 text-nature-600 focus:ring-nature-500 cursor-pointer"
                                                checked={markAsSolution}
                                                onChange={(e) => setMarkAsSolution(e.target.checked)}
                                            />
                                            <span className="text-sm font-bold text-stone-600 group-hover:text-nature-700 transition-colors">Mark as Professional Solution & Sync to Database</span>
                                        </label>
                                        <button type="submit" className="btn-primary flex items-center gap-2 px-8 py-3 transform transition-transform active:scale-95 shadow-lg shadow-nature-200">
                                            <Send size={18} />
                                            Submit Response
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-stone-400 p-10">
                            <MessageSquare size={64} className="opacity-20 mb-4" />
                            <p className="text-xl font-medium">Select an issue from the sidebar to start researching</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProblemChat;
