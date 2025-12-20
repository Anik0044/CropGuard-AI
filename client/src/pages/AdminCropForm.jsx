import { useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminCropForm = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        cropName: '',
        diseaseName: '',
        symptoms: '',
        causes: '',
        organicTreatment: '',
        chemicalTreatment: '',
        prevention: '',
        imageUrl: '',
        researchLinks: '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };

            // Structure data to match Schema (simplified for this demo: adding 1 disease to a new crop)
            const payload = {
                cropName: formData.cropName,
                diseases: [{
                    name: formData.diseaseName,
                    symptoms: formData.symptoms.split(','),
                    causes: formData.causes.split(','),
                    organicTreatment: formData.organicTreatment.split(','),
                    chemicalTreatment: formData.chemicalTreatment.split(',').map(s => s.trim()),
                    prevention: formData.prevention.split(',').map(s => s.trim()),
                    imageUrl: formData.imageUrl,
                    researchLinks: formData.researchLinks.split(',').map(s => s.trim()).filter(s => s !== '')
                }]
            };

            await axios.post('/api/crops', payload, config);
            alert('Crop Data Added Successfully');
            navigate('/dashboard');
        } catch (error) {
            console.error(error);
            alert('Failed to add crop');
        }
    };

    if (!user || user.role !== 'admin') {
        return <div className="p-20 text-center font-bold text-red-600">Unauthorized Access</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow mt-10">
            <h2 className="text-2xl font-bold mb-6 text-nature-800">Research Data Management</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium mb-1">Crop Name</label>
                    <input required className="input-field" value={formData.cropName} onChange={e => setFormData({ ...formData, cropName: e.target.value })} placeholder="e.g. Corn" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Disease Name</label>
                    <input required className="input-field" value={formData.diseaseName} onChange={e => setFormData({ ...formData, diseaseName: e.target.value })} placeholder="e.g. Corn Smut" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Symptoms (comma separated)</label>
                        <textarea className="input-field" value={formData.symptoms} onChange={e => setFormData({ ...formData, symptoms: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Causes (comma separated)</label>
                        <textarea className="input-field" value={formData.causes} onChange={e => setFormData({ ...formData, causes: e.target.value })} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Organic Treatment (comma separated)</label>
                        <textarea className="input-field" value={formData.organicTreatment} onChange={e => setFormData({ ...formData, organicTreatment: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Chemical Treatment (comma separated)</label>
                        <textarea className="input-field" value={formData.chemicalTreatment} onChange={e => setFormData({ ...formData, chemicalTreatment: e.target.value })} />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Research Links (comma separated Google links)</label>
                    <textarea
                        className="input-field"
                        value={formData.researchLinks}
                        onChange={e => setFormData({ ...formData, researchLinks: e.target.value })}
                        placeholder="e.g. https://google.com/search?q=tomato+blight"
                        rows="3"
                    />
                </div>
                <button type="submit" className="btn-primary w-full">Save Data</button>
            </form>
        </div>
    );
};

export default AdminCropForm;
