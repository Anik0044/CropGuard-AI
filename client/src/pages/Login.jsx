import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { Sprout } from 'lucide-react';

const Login = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await login(formData.username, formData.password);
        if (result.success) {
            // Role-based redirection
            switch (result.user.role) {
                case 'admin':
                    navigate('/admin-dashboard');
                    break;
                case 'farmer':
                    navigate('/farmer-dashboard');
                    break;
                case 'guest':
                    navigate('/guest-dashboard');
                    break;
                default:
                    navigate('/farmer-dashboard');
            }
        } else {
            setError(result.error);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-gradient-to-br from-nature-50 via-emerald-50/40 to-green-50/30">
            <div className="card w-full max-w-md bg-white/95 backdrop-blur-md shadow-2xl border border-green-100/60 hover:shadow-nature-300/30">
                <div className="text-center mb-8">
                    <Sprout className="mx-auto h-12 w-12 text-nature-600 mb-2" />
                    <h2 className="text-3xl font-extrabold text-nature-900">Welcome Back</h2>
                    <p className="text-stone-500">Login to access your farm dashboard</p>
                </div>

                {error && <div className="bg-red-100 border border-red-200 text-red-700 p-3 rounded-lg mb-4 text-sm font-medium">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-2">Username</label>
                        <input
                            type="text"
                            required
                            className="input-field"
                            placeholder="Enter your username"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-2">Password</label>
                        <input
                            type="password"
                            required
                            className="input-field"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>
                    <button type="submit" className="btn-primary w-full shadow-lg hover:shadow-nature-500/30">Login</button>
                </form>
                <p className="mt-4 text-center text-sm text-stone-600">
                    Don't have an account? <Link to="/register" className="text-green-600 hover:underline">Register here</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
