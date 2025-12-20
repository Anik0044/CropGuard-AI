import { Navigate, Outlet } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

const ResearchRoute = () => {
    const { user, loading } = useContext(AuthContext);

    if (loading) return <div>Loading...</div>;

    // Strict check: Authorized admins can access the Research Module
    const isAuthorized = user && user.role === 'admin';

    return isAuthorized ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

export default ResearchRoute;
