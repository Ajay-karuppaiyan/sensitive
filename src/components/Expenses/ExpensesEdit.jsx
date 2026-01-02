import React, { useState, useEffect } from "react";
import { createExpense, projectname, updateExpenseById, getExpenseById } from "../../api/services/projectServices";
import { useParams,useNavigate } from "react-router-dom";

function ExpensesEdit() {
    const { id } = useParams();
    console.log(id);

    const [expenses, setExpenses] = useState({
        type: "",
        project: "",
        amount: "",
        attachments: null,
        notes: "",
    });
    const navigate = useNavigate(); 
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await projectname();
                console.log('Projects Response:', response);
                if (response && response.data) {
                    const flattenedProjects = response.data.flatMap(project =>
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
                    const expenseResponse = await getExpenseById(id, null);
                    console.log('Expense Response:', expenseResponse);
                    if (expenseResponse?.data) {
                        setExpenses(expenseResponse.data);
                    } else {
                        throw new Error("Failed to fetch expense data.");
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
        setExpenses((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        setExpenses((prev) => ({ ...prev, [name]: files[0] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();

        Object.keys(expenses).forEach((key) => {
            if (key === "attachments" && expenses.attachments instanceof File) {
                formData.append(key, expenses[key]);
            } else if (key !== "attachments") {
                formData.append(key, expenses[key]);
            }
        });

        try {
            let response;
            if (id) {
                response = await updateExpenseById(id, formData);
            } else {
                response = await createExpense(formData);
            }

            if (response.status === 200 || response.status === 201) {
                alert("Expense data submitted successfully!");
                navigate("/expense-table");
                setExpenses({
                    type: "",
                    project: "",
                    amount: "",
                    attachments: null,
                    notes: "",
                });
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
            <h2 className="text-4xl font-bold mb-10 text-center mt-20">Expenses Form</h2>
            <form
                onSubmit={handleSubmit}
                className="grid grid-cols-2 gap-6 p-4 rounded bg-[#eff6ff] shadow-lg border border-gray-300 hover:border-gray-500 transition-all"
            >
                <div className="flex flex-col">
                    <label className="block text-sm font-medium pb-1">Type:</label>
                    <select
                        name="type"
                        value={expenses.type}
                        onChange={handleChange}
                        required
                        className="border border-blue-300 p-2 rounded"
                    >
                        <option value="">-- Select Expense Type --</option>
                        <option value="Office Expenses">Office Expenses</option>
                        <option value="Rents">Rents</option>
                        <option value="Wages">Wages</option>
                        <option value="Project Expenses">Project Expenses</option>
                        <option value="Traveling Expenses">Traveling Expenses</option>
                        <option value="Others">Others</option>
                    </select>
                    {expenses.type === "Others" && (
                        <input
                            type="text"
                            name="otherType"
                            value={expenses.otherType || ""}
                            onChange={handleChange}
                            placeholder="Specify expense type"
                            required
                            className="border border-blue-300 p-2 mt-2 rounded"
                        />
                    )}
                </div>
                <div className="flex flex-col">
                    <label className="block text-sm font-medium pb-1">Select Project (Optional):</label>
                    <select
                        name="project"
                        value={expenses.project}
                        onChange={handleChange}
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
                <div className="flex flex-col">
                    <label className="block text-sm font-medium pb-1">Amount:</label>
                    <input
                        type="number"
                        name="amount"
                        value={expenses.amount}
                        onChange={handleChange}
                        required
                        className="border border-blue-300 p-2 rounded"
                    />
                </div>
                <div className="flex flex-col">
                    <label className="block text-sm font-medium pb-1">Attachments:</label>
                    {typeof expenses.attachments === "string" && (
                        <div className="mb-2">
                            <img
                                src={expenses.attachments}
                                alt="Attachment Preview"
                                className="w-32 h-32 object-cover border rounded"
                            />
                        </div>
                    )}
                    <input
                        type="file"
                        name="attachments"
                        onChange={handleFileChange}
                        className="border border-blue-300 p-2 rounded"
                    />
                </div>
                <div className="col-span-2 flex flex-col">
                    <label className="block text-sm font-medium pb-1">Notes:</label>
                    <textarea
                        name="notes"
                        value={expenses.notes}
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

export default ExpensesEdit;
