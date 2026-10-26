import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatWidget from './components/ChatWidget';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/About';
import Contact from './pages/Contact';
import Pricing from './pages/Pricing';
import AdminDashboard from './pages/AdminDashboard';
import FarmerDashboard from './pages/FarmerDashboard';
import GuestDashboard from './pages/GuestDashboard';
import Scan from './pages/Scan';
import Education from './pages/Education';
import AdminCropForm from './pages/AdminCropForm';
import AdminTraining from './pages/AdminTraining';
import AdminScanManager from './pages/AdminScanManager';

import ProblemChat from './pages/ProblemChat';
import ProtectedRoute from './components/ProtectedRoute';
import ResearchRoute from './components/ResearchRoute';

function App() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/education" element={<Education />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/farmer-dashboard" element={<FarmerDashboard />} />
            <Route path="/guest-dashboard" element={<GuestDashboard />} />
            <Route path="/dashboard" element={<FarmerDashboard />} />
            <Route path="/scan" element={<Scan />} />

            {/* Hidden Research Module - Admin Only */}
            <Route element={<ResearchRoute />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/admin/training" element={<AdminTraining />} />
              <Route path="/admin/scans" element={<AdminScanManager />} />
              <Route path="/admin/add-crop" element={<AdminCropForm />} />
              <Route path="/admin/problems" element={<ProblemChat />} />
            </Route>
          </Route>
        </Routes>
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}

export default App;
