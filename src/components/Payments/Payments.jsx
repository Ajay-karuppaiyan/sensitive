import React, { useState, useEffect } from "react";
import { createPayment, projectname } from "../../api/services/projectServices";
import { useNavigate } from "react-router-dom";
function Payments() {
    const [payment, setPayment] = useState({
        project: "",
        amount: "",
        mode: "",
        date: "",
        tdsApplicable: "",
        taxApplicable: "",
    });
    const navigate = useNavigate(); 
    const [projects, setprojects] = useState([]);
    const [loading, setLoading] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
    
                // Fetch project names
                const response = await projectname();
                console.log("project fetched:", response);
    
                if (response && response.data) {
                    const flattenedProjects = response.data.flatMap(project =>
                        project.projectDetails.map(detail => ({
                            _id: project._id,
                            projectName: detail.projectName // Flatten and extract project name
                        }))
                    );
                    setprojects(flattenedProjects); // Set project names
                    setError(null);
                } else {
                    throw new Error("Failed to fetch projects.");
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                setError("Failed to fetch data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
    
        fetchData();
    }, []);
    


    const handleChange = (e) => {
        const { name, value } = e.target;
        setPayment((prev) => ({ ...prev, [name]: value }));
    };
    const handleFileChange = (e) => {
        const { name, files } = e.target;
        setPayment((prev) => ({ ...prev, [name]: files[0] })); // Save the first file from the input
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.keys(payment).forEach((key) => {
            formData.append(key, payment[key]);
        });
    
        try {
            const response = await createPayment(formData);
            if (response.status === 201) {
                alert("Payment data submitted successfully!");
                setPayment({
                    project: "",
                    amount: "",
                    mode: "",
                    date: "",
                    tdsApplicable: "",
                    taxApplicable: "",
                });
                navigate("/payments-table");
            } else {
                alert("There was an issue with the submission.");
            }
        } catch (error) {
            console.error("Error submitting data:", error);
            alert("There was an error submitting the data.");
        }
    };
    
      

    if (loading) {
        return (
            <div className="container mx-auto p-8 mt-20 text-center">
                <p className="text-xl">Loading</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-8 mt-20 text-center">
                <p className="text-xl text-red-600">{error}</p>
            </div>
        );
    }


    return (
        <div className="container mx-auto p-6 mt-12">
            <h2 className="text-4xl font-bold mb-10 text-center mt-20">Payments Form</h2>
            <form
                onSubmit={handleSubmit}
                className="grid grid-cols-2 gap-6 p-4 rounded bg-[#eff6ff] shadow-lg border border-gray-300 hover:border-gray-500 transition-all"
            >
                {/* Left Column */}
                <div className="flex flex-col space-y-4">
                    {/* Select Project */}
                    <div className="flex flex-col">
                        <label className="block text-sm font-medium pb-1">Select Project:</label>
                        <select
                            name="project"
                            value={payment.project}
                            onChange={ handleChange}
                            required
                            className="border border-blue-300 p-2 rounded"
                        >
                            <option value="">-- Select a Project --</option>
                            {projects.map((project) => (
                                <option
                                    key={project._id}
                                    value={project.projectName}
                                >
                                    {project.projectName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Payment Type */}
                    <div className="flex flex-col">
                        <label className="block text-sm font-medium pb-1">Payment Type:</label>
                        <input
                            type="text"
                            name="paymentType"
                            value={payment.paymentType}
                            onChange={handleChange}
                            required
                            className="border border-blue-300 p-2 rounded"
                        />
                    </div>

                    {/* Amount */}
                    <div className="flex flex-col">
                        <label className="block text-sm font-medium pb-1">Amount:</label>
                        <input
                            type="number"
                            name="amount"
                            value={payment.amount}
                            onChange={handleChange}
                            required
                            className="border border-blue-300 p-2 rounded"
                        />
                    </div>

                    {/* Payment Mode */}
                    <div className="flex flex-col">
                        <label className="block text-sm font-medium pb-1">Payment Mode:</label>
                        <select
                            name="mode"
                            value={payment.mode}
                            onChange={handleChange}
                            required
                            className="border border-blue-300 p-2 rounded"
                        >
                            <option value="">-- Select Payment Mode --</option>
                            <option value="UPI / QR">UPI / QR</option>
                            <option value="Cash">Cash</option>
                            <option value="IMPS / NEFT / Bank Transfer">
                                IMPS / NEFT / Bank Transfer
                            </option>
                            <option value="Cheque">Cheque</option>
                            <option value="Payment Gateway">Payment Gateway</option>
                            <option value="Others">Others</option>
                        </select>
                        {payment.mode === "Others" && (
                            <input
                                type="text"
                                name="otherMode"
                                value={payment.otherMode || ""}
                                onChange={handleChange}
                                placeholder="Specify payment mode"
                                required
                                className="border border-blue-300 p-2 mt-2 rounded"
                            />
                        )}
                    </div>

                    {/* Date */}
                    <div className="flex flex-col">
                        <label className="block text-sm font-medium pb-1">Date:</label>
                        <input
                            type="date"
                            name="date"
                            value={payment.date}
                            onChange={handleChange}
                            required
                            className="border border-blue-300 p-2 rounded"
                        />
                    </div>
                </div>

                {/* Right Column */}
                <div className="flex flex-col space-y-4 lg:mt-6"> {/* Add margin-top to align */}
                    {/* TDS Applicable */}
                    <div className="flex flex-col">
                        <label className="block text-sm font-medium pb-1">TDS Applicable:</label>
                        <div className="flex items-center gap-4">
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    name="tdsApplicable"
                                    value="Yes"
                                    checked={payment.tdsApplicable === "Yes"}
                                    onChange={handleChange}
                                    className="mr-1"
                                />
                                Yes
                            </label>
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    name="tdsApplicable"
                                    value="No"
                                    checked={payment.tdsApplicable === "No"}
                                    onChange={handleChange}
                                    className="mr-1"
                                />
                                No
                            </label>
                        </div>
                    </div>

                    {/* Tax Applicable */}
                    <div className="flex flex-col">
                        <label className="block text-sm font-medium pb-1">Tax Applicable:</label>
                        <div className="flex items-center gap-4">
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    name="taxApplicable"
                                    value="Yes"
                                    checked={payment.taxApplicable === "Yes"}
                                    onChange={handleChange}
                                    className="mr-1"
                                />
                                Yes
                            </label>
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    name="taxApplicable"
                                    value="No"
                                    checked={payment.taxApplicable === "No"}
                                    onChange={handleChange}
                                    className="mr-1"
                                />
                                No
                            </label>
                        </div>
                    </div>

                    {/* Payment Reference Number */}
                    <div className="flex flex-col">
                        <label className="block text-sm font-medium pb-1">
                            Payment Reference Number:
                        </label>
                        <input
                            type="text"
                            name="paymentReferenceNumber"
                            value={payment.paymentReferenceNumber}
                            onChange={handleChange}
                            required
                            className="border border-blue-300 p-2 rounded"
                        />
                    </div>

                    {/* Payment Quotation */}
                    <div className="flex flex-col">
                        <label className="block text-sm font-medium pb-1">
                            Payment Quotation (Optional):
                        </label>
                        <input
                            type="file"
                            name="paymentQuotation"
                            onChange={handleFileChange}
                            className="border border-blue-300 p-2 rounded"
                        />
                    </div>

                    {/* Payment Proof */}
                    <div className="flex flex-col">
                        <label className="block text-sm font-medium pb-1">
                            Payment Proof (Optional):
                        </label>
                        <input
                            type="file"
                            name="paymentProof"
                            onChange={handleFileChange}
                            className="border border-blue-300 p-2 rounded"
                        />
                    </div>
                </div>

                {/* Notes - Single Row */}
                <div className="col-span-2 flex flex-col">
                    <label className="block text-sm font-medium pb-1">Notes:</label>
                    <textarea
                        name="notes"
                        value={payment.notes}
                        onChange={handleChange}
                        rows="3"
                        className="border border-blue-300 p-2 rounded"
                    />
                </div>

                {/* Submit Button */}
                <div className="col-span-2 text-right">
                    <button
                        type="submit"
                        className="bg-blue-500 text-white font-bold py-2 px-4 rounded"
                    >
                        Submit
                    </button>
                </div>
            </form>
        </div>
    );
}

export default Payments;
