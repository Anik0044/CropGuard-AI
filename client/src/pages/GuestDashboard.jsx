import { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { BookOpen, UserPlus } from 'lucide-react';

const GuestDashboard = () => {
    const { user } = useContext(AuthContext);

    return (
        <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="bg-nature-100 p-6 rounded-full mb-6 animate-pulse-slow">
                <UserPlus size={48} className="text-nature-600" />
            </div>
            <h1 className="text-4xl font-bold text-nature-900 mb-4">Welcome, Guest!</h1>
            <p className="text-xl text-stone-600 max-w-2xl mb-8">
                You are currently logged in as a guest. To save your scan history and access personalized farm management features, please register for a full account.
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
                <Link to="/education" className="btn-primary flex items-center gap-2">
                    <BookOpen size={20} /> Browse Crop Database
                </Link>
                <Link to="/register" className="btn-secondary flex items-center gap-2">
                    <UserPlus size={20} /> Create Farmer Account
                </Link>
            </div>
        </div>
    );
};

export default GuestDashboard;
