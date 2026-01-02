import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createQuotation } from '../../api/services/projectServices';

const QuotationForm = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        contact: '',
        requirement: '',
        techStack: '',
        company: '',
        quote: '',
        note: '',
        quotation: null,
        status: 'Pending',
        quotationDate: new Date().toISOString().split('T')[0],
        updateLog: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };
    const handleFileChange = (e) => {
        setFormData({
            ...formData,
            quotation: e.target.files[0]
        });
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formDataToSubmit = new FormData();
        for (const key in formData) {
            formDataToSubmit.append(key, formData[key]);
        }

        try {
            const response = await createQuotation(formDataToSubmit);

            if (response.status === 201 || response.status === 200) {
                alert('Quotation created successfully!');
                navigate('/quotation-table');
            } else {
                alert('Failed to create quotation. Please try again.');
            }
        } catch (error) {
            console.error('Error creating quotation:', error);
            alert('An error occurred while creating the quotation.');
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="max-w-4xl mx-auto p-4 mt-24">
            <h2 className="text-4xl font-bold mb-10 text-center">Create New Quotation</h2>

            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                            Name
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="name"
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter client name"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="contact">
                            Contact
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="contact"
                            type="text"
                            name="contact"
                            required
                            value={formData.contact}
                            onChange={handleChange}
                            placeholder="Email or phone number"
                        />
                    </div>
                    <div className="mb-4 md:col-span-2">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="requirement">
                            Requirements
                        </label>
                        <textarea
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
                            id="requirement"
                            name="requirement"
                            required
                            value={formData.requirement}
                            onChange={handleChange}
                            placeholder="Describe the project requirements"
                        ></textarea>
                    </div>

                    <div className="mb-4 md:col-span-2">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="techStack">
                            Tech Stack
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-14"
                            id="techStack"
                            type="text"
                            name="techStack"
                            value={formData.techStack}
                            onChange={handleChange}
                            placeholder="List the required technologies"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="company">
                            Company Details
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="company"
                            type="text"
                            name="company"
                            value={formData.company}
                            onChange={handleChange}
                            placeholder="Company name and details"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="quote">
                            Quote
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="quote"
                            type="text"
                            name="quote"
                            required
                            value={formData.quote}
                            onChange={handleChange}
                            placeholder="Enter quote"
                        />
                    </div>

                    <div className="mb-4 md:col-span-2">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="note">
                            Note
                        </label>
                        <textarea
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-24"
                            id="note"
                            name="note"
                            value={formData.note}
                            onChange={handleChange}
                            placeholder="Additional notes about the quotation"
                        ></textarea>
                    </div>
                    <div className="mb-4 md:col-span-2">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="quotation">Upload Quotation</label>
                        <input className="shadow border rounded w-full py-2 px-3" id="quotation" type="file" name="quotation" accept=".pdf,.jpg,.png" onChange={handleFileChange} />
                    </div>

                    <div className="mb-4 md:col-span-2">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="updateLog">
                            Update Log
                        </label>
                        <textarea
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-24"
                            id="updateLog"
                            name="updateLog"
                            value={formData.updateLog}
                            onChange={handleChange}
                            placeholder="Log any changes or updates to the quotation"
                        ></textarea>
                    </div>


                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="status">
                            Status
                        </label>
                        <select
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                        >
                            <option value="Pending">Pending</option>
                            <option value="Sent">Sent</option>
                            <option value="Accepted">Accepted</option>
                            <option value="Rejected">Rejected</option>
                            <option value="In Negotiation">In Negotiation</option>
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="quotationDate">
                            Quotation Date
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="quotationDate"
                            type="date"
                            name="quotationDate"
                            value={formData.quotationDate}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between mt-6">
                    <button
                        type="button"
                        onClick={() => navigate('/quotation-table')}
                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Submitting...' : 'Create Quotation'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default QuotationForm;