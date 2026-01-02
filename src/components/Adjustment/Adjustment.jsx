import React, { useState, useEffect } from "react";
import { createPayroll, employeename } from "../../api/services/projectServices";
import { useNavigate } from "react-router-dom";

function Adjustment() {
    const navigate = useNavigate();
    const [payrolls, setPayrolls] = useState([
        {
            empId: "",
            type: "",
            month: "",
            amount: "",
            note: "",
        },
    ]);
    const empid = localStorage.getItem("empId");
    const [role, setRole] = useState(localStorage.getItem("role") || "Superadmin");

    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                setLoading(true);
                const employeesResponse = await employeename(`${empid}`);
                setEmployees(employeesResponse.data);
                setError(null);
            } catch (error) {
                console.error("Error fetching employees:", error);
                setError("Failed to fetch employees. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchEmployees();
    }, []);

    const handleChange = (index, e) => {
        const { name, value } = e.target;
        setPayrolls((prev) => {
            const updatedPayrolls = [...prev];
            updatedPayrolls[index][name] = value;
            return updatedPayrolls;
        });
    };

    const handleAddFields = () => {
        setPayrolls((prev) => [...prev, { empId: "", type: "", month: "", amount: "", note: "" }]);
    };

    const handleRemoveFields = (index) => {
        setPayrolls((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(payrolls);

        try {
            for (const formData of payrolls) {
                const response = await createPayroll(formData);

                if (response.status === 201) {
                    alert("Payroll entry created successfully!");
                    navigate("/adjustment-table");
                } else {
                    alert("Failed to create payroll entry.");
                }
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred while submitting the payroll data.");
        }
    };

    if (loading) {
        return <p className="text-xl text-center mt-20">Loading...</p>;
    }

    if (error) {
        return <p className="text-xl text-center mt-20 text-red-600">{error}</p>;
    }

    return (
        <div className="container mx-auto p-8 mt-20">
            <h2 className="text-4xl font-bold mb-8 text-center text-gray-800">Adjustments Form</h2>
            <form onSubmit={handleSubmit} className="bg-white p-8 border rounded-lg shadow-lg max-w-4xl mx-auto">
                {payrolls.map((payroll, index) => (
                    <div key={index} className="space-y-4 border-b pb-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium pb-2 text-gray-600">Employee:</label>
                            <select
                                name="empId"
                                value={payroll.empId}
                                onChange={(e) => handleChange(index, e)}
                                required
                                className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select Employee</option>
                                {employees.map((employee) => (
                                    <option key={employee.id} value={employee.id}>
                                        {employee.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium pb-2 text-gray-600">Type:</label>
                            <select
                                name="type"
                                value={payroll.type}
                                onChange={(e) => handleChange(index, e)}
                                required
                                className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select Type</option>
                                <option value="Allowances">Allowances</option>
                                <option value="Deductions">Deductions</option>
                                <option value="Advance">Advance</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium pb-2 text-gray-600">Month:</label>
                            <select
                                name="month"
                                value={payroll.month}
                                onChange={(e) => handleChange(index, e)}
                                required
                                className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select Month</option>
                                {[
                                    "January", "February", "March", "April", "May", "June",
                                    "July", "August", "September", "October", "November", "December"
                                ].map((month) => (
                                    <option key={month} value={month}>{month}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium pb-2 text-gray-600">Amount:</label>
                            <input
                                type="number"
                                name="amount"
                                value={payroll.amount}
                                onChange={(e) => handleChange(index, e)}
                                required
                                className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium pb-2 text-gray-600">Note:</label>
                            <textarea
                                name="note"
                                value={payroll.note}
                                onChange={(e) => handleChange(index, e)}
                                className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500"
                                rows="4"
                            />
                        </div>
                        {payrolls.length > 1 && (
                            <div className="flex justify-end mt-4">
                                <button
                                    type="button"
                                    onClick={() => handleRemoveFields(index)}
                                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-300"
                                >
                                    Remove
                                </button>
                            </div>
                        )}
                    </div>
                ))}
                <div className="flex justify-center mt-8">
                    <button
                        type="button"
                        onClick={handleAddFields}
                        className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition duration-300"
                    >
                        Add More
                    </button>
                </div>
                <div className="flex justify-center mt-8">
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition duration-300"
                    >
                        Submit
                    </button>
                </div>
            </form>
        </div>
    );
}

export default Adjustment;
