import React, { useState, useEffect } from "react";
import { createPayment, getPaymentById, projectname, updatePaymentById } from "../../api/services/projectServices";
import { useParams, Link, useNavigate } from "react-router-dom";

function PaymentEdit() {
    const { id } = useParams();
    console.log("Payment ID from URL:", id);
    const navigate = useNavigate();

    const [payment, setPayment] = useState({
        project: "",
        amount: "",
        mode: "",
        date: "",
        tdsApplicable: "",
        taxApplicable: "",
        paymentType: "",
        paymentReferenceNumber: "",
        paymentQuotation: "",
        paymentProof: "",
        notes: "",
    });
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const projectResponse = await projectname();
                console.log("Projects Response:", projectResponse);
                if (projectResponse?.data) {
                    const flattenedProjects = projectResponse.data.flatMap(project =>
                        project.projectDetails.map(detail => ({
                            _id: project._id,
                            projectName: detail.projectName
                        }))
                    );
                    setProjects(flattenedProjects);
                    setError(null);
                } else {
                    throw new Error("Failed to fetch projects.");
                }
                if (id) {
                    const paymentResponse = await getPaymentById(id);
                    console.log("Payment Response:", paymentResponse);
                    if (paymentResponse?.data) {
                        setPayment({
                            project: paymentResponse.data.payment.project || "",
                            amount: paymentResponse.data.payment.amount || "",
                            mode: paymentResponse.data.payment.mode || "",
                            date: paymentResponse.data.payment.date || "",
                            tdsApplicable: paymentResponse.data.payment.tdsApplicable || "",
                            taxApplicable: paymentResponse.data.payment.taxApplicable || "",
                            paymentType: paymentResponse.data.payment.paymentType || "",
                            paymentReferenceNumber: paymentResponse.data.payment.paymentReferenceNumber || "",
                            paymentQuotation: paymentResponse.data.payment.paymentQuotation || "",
                            paymentProof: paymentResponse.data.payment.paymentProof || "",
                            notes: paymentResponse.data.payment.notes || "",
                        });
                        let fetchedPayment = paymentResponse.data.payment
                        if (fetchedPayment.date) {
                            let dateObj = new Date(fetchedPayment.date);
                            let day = String(dateObj.getDate()).padStart(2, "0");
                            let month = String(dateObj.getMonth() + 1).padStart(2, "0");
                            let year = String(dateObj.getFullYear()).slice(-2);

                            fetchedPayment.dateFormatted = `${day}/${month}/${year}`;
                            fetchedPayment.date = dateObj.toISOString().split("T")[0];
                        }

                        setPayment(fetchedPayment);
                        console.log("Payment state set to:", payment);
                    } else {
                        throw new Error("Failed to fetch payment data.");
                    }
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                setError("Failed to fetch data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "date") {
            let dateObj = new Date(value);
            let day = String(dateObj.getDate()).padStart(2, "0");
            let month = String(dateObj.getMonth() + 1).padStart(2, "0");
            let year = String(dateObj.getFullYear()).slice(-2);
            setPayment((prev) => ({
                ...prev,
                date: value,
                dateFormatted: `${day}/${month}/${year}`,
            }));
        } else {
            setPayment((prev) => ({ ...prev, [name]: value }));
        }

    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        setPayment((prev) => ({ ...prev, [name]: files[0] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.keys(payment).forEach((key) => {
            console.log(`${key}:`, payment[key]);
            formData.append(key, payment[key]);
        });

        try {
            const response = await updatePaymentById(id, formData);
            if (response.status === 200 || response.status === 201) {
                alert("Payment updated successfully!");
                navigate("/payments-table");
            } else {
                console.error("Failed to update payment", response);
                alert("Failed to update payment. Please try again.");
            }
        } catch (error) {
            console.error("Error updating payment:", error);
            alert("An error occurred while updating. Please try again.");
        }
    };


    if (loading) {
        return (
            <div className="container mx-auto p-8 mt-20 text-center">
                <p className="text-xl">Loading...</p>
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
                <div className="flex flex-col space-y-4">
                    <div className="flex flex-col">
                        <label className="block text-sm font-medium pb-1">Select Project:</label>
                        <select
                            name="project"
                            value={payment.project}
                            onChange={handleChange}
                            required
                            className="border border-blue-300 p-2 rounded"
                        >
                            <option value="">-- Select a Project --</option>
                            {projects.map((project) => (
                                <option key={project._id} value={project.projectName}>
                                    {project.projectName}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col">
                        <label className="block text-sm font-medium pb-1">Payment Type:</label>
                        <input
                            type="text"
                            name="paymentType"
                            value={payment.paymentType || ""}
                            onChange={handleChange}
                            required
                            className="border border-blue-300 p-2 rounded"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="block text-sm font-medium pb-1">Amount:</label>
                        <input
                            type="number"
                            name="amount"
                            value={payment.amount || ""}
                            onChange={handleChange}
                            required
                            className="border border-blue-300 p-2 rounded"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="block text-sm font-medium pb-1">Payment Mode:</label>
                        <select
                            name="mode"
                            value={payment.mode || ""}
                            onChange={handleChange}
                            required
                            className="border border-blue-300 p-2 rounded"
                        >
                            <option value="">-- Select Payment Mode --</option>
                            <option value="UPI / QR">UPI / QR</option>
                            <option value="Cash">Cash</option>
                            <option value="IMPS / NEFT / Bank Transfer">IMPS / NEFT / Bank Transfer</option>
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
                    <div className="flex flex-col">
                        <label className="block text-sm font-medium pb-1">Date:</label>
                        <input
                            type="date"
                            name="date"
                            value={payment.date || ""}
                            onChange={handleChange}
                            required
                            className="border border-blue-300 p-2 rounded"
                        />
                    </div>
                </div>
                <div className="flex flex-col space-y-4 lg:mt-6">
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
                    <div className="flex flex-col">
                        <label className="block text-sm font-medium pb-1">
                            Payment Reference Number:
                        </label>
                        <input
                            type="text"
                            name="paymentReferenceNumber"
                            value={payment.paymentReferenceNumber || ""}
                            onChange={handleChange}
                            required
                            className="border border-blue-300 p-2 rounded"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="block text-sm font-medium pb-1">
                            Payment Quotation (Optional):
                        </label>
                        {payment.paymentQuotation && (
                            <Link
                                to={payment.paymentQuotation}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 underline"
                            >
                                View Payment Quotation
                            </Link>
                        )}
                        <input
                            type="file"
                            name="paymentQuotation"
                            onChange={handleFileChange}
                            className="border border-blue-300 p-2 rounded"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="block text-sm font-medium pb-1">
                            Payment Proof (Optional):
                        </label>
                        {payment.paymentProof && (
                            <Link to={payment.paymentProof}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 underline">
                                View Payment Proof
                            </Link>
                        )}
                        <input
                            type="file"
                            name="paymentProof"
                            onChange={handleFileChange}
                            className="border border-blue-300 p-2 rounded"
                        />
                    </div>
                </div>
                <div className="col-span-2 flex flex-col">
                    <label className="block text-sm font-medium pb-1">Notes:</label>
                    <textarea
                        name="notes"
                        value={payment.notes || ""}
                        onChange={handleChange}
                        rows="3"
                        className="border border-blue-300 p-2 rounded"
                    />
                </div>
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

export default PaymentEdit;
