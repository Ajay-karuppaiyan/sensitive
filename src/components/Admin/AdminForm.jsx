import React, { useState } from 'react';
import axios from 'axios';

const AdminForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    officeEmail: '',
    password: '',
    adminType: '', 
  });

  const [loading, setLoading] = useState(false); 
  const [message, setMessage] = useState(''); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    if (!formData.name || !formData.officeEmail || !formData.password || !formData.adminType) {
      setMessage('Please fill all the fields');
      return;
    }
    setLoading(true);
    setMessage('');

    try {
      const response = await axios.post('https://sensitivetechcrm.onrender.com/super-admin/createsuperadmin', formData);
      console.log('Response:', response.data);
      setMessage('Admin form submitted successfully!');
      setFormData({
        name: '',
        officeEmail: '',
        password: '',
        adminType: '',
      }); 
    } catch (error) {
      console.error('Error:', error);
      setMessage('Failed to submit the form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 mt-20">
      <h2 className="text-4xl font-bold mb-8 text-center">Admin Form</h2>
      <div className="border border-gray-300 p-6 rounded-lg shadow-lg">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block font-semibold">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block font-semibold">Official Email</label>
              <input
                type="email"
                name="officeEmail"
                value={formData.officeEmail}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block font-semibold">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block font-semibold">Admin Type</label>
              <select
                name="adminType"
                value={formData.adminType}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
                required
              >
                <option value="">Select Admin Type</option>
                <option value="Superadmin">Superadmin</option>
                <option value="HR Admin">HR Admin</option>
              </select>
            </div>

            <div className="col-span-2 flex justify-center">
              <button
                type="submit"
                className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-md"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </form>

        {message && (
          <div
            className={`mt-4 p-4 rounded-md ${
              message.includes('successfully') ? 'bg-green-200' : 'bg-red-200'
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminForm;
