import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { UserPlus } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        mobileNumber: '',
        password: '',
        location: '',
        farmSize: '',
    });
    const [error, setError] = useState('');
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await register(formData);
        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.error);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-gradient-to-br from-nature-50 via-emerald-50/40 to-green-50/30 py-10">
            <div className="card w-full max-w-lg bg-white/95 backdrop-blur-md shadow-2xl border border-green-100/60 hover:shadow-nature-300/30">
                <div className="text-center mb-8">
                    <UserPlus className="mx-auto h-12 w-12 text-nature-600 mb-2" />
                    <h2 className="text-3xl font-extrabold text-nature-900">Join CropGuard</h2>
                    <p className="text-stone-500">Start protecting your crops today</p>
                </div>

                {error && <div className="bg-red-100 border border-red-200 text-red-700 p-3 rounded-lg mb-4 text-sm font-medium">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-2">Full Name</label>
                        <input
                            type="text"
                            required
                            className="input-field"
                            placeholder="Your Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-2">Username</label>
                        <input
                            type="text"
                            required
                            className="input-field"
                            placeholder="Choose a username (e.g. farmer123)"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-2">Mobile Number (Optional)</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Mobile Number"
                            value={formData.mobileNumber}
                            onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            className="input-field"
                            placeholder="Choose a password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-1">Location</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Village/City"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-1">Farm Size (Acres)</label>
                            <input
                                type="number"
                                className="input-field"
                                placeholder="e.g. 5"
                                value={formData.farmSize}
                                onChange={(e) => setFormData({ ...formData, farmSize: e.target.value })}
                            />
                        </div>
                    </div>
                    <button type="submit" className="btn-primary w-full">Create Account</button>
                </form>
                <p className="mt-4 text-center text-sm text-stone-600">
                    Already have an account? <Link to="/login" className="text-green-600 hover:underline">Login here</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
