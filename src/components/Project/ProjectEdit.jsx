import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, X } from "lucide-react";
import { employeename, getTheProject, updatetheProject } from "../../api/services/projectServices";

const ProjectEdit = () => {
    const navigate = useNavigate();
    const { projectId } = useParams();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const id = localStorage.getItem("empId");
    const [role, setRole] = useState(localStorage.getItem("role") || "Superadmin");
    const statuses = ["Pending", "In Progress", "Completed", "On Hold"];
    const [projects, setProjects] = useState([]);
    const [projectDetails, setProjectDetails] = useState([{
        projectName: "",
        type: "",
        requirements: "",
        description: "",
        category: "",
        techStack: "",
        domain: "",
        designation: "",
        addOnServices: "",
        duration: "",
        dependencies: "",
        companyName: "",
        task: "",
    }]);

    const [financialDetails, setFinancialDetails] = useState([{
        quotedValue: "",
        approvedValue: "",
        paymentTerms: "",
        finalQuotation: "",
        taxTerms: "",
    }]);

    const [additionalDetails, setAdditionalDetails] = useState([{
        projectDocument: null,
        nda: null,
        msa: null,
        assignedTo: "",
        status: "",
        createdDate: new Date().toISOString().split("T")[0],
    }]);

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                setLoading(true);


                const response = await employeename(`${id}`);
                console.log("Employees fetched:", response);

                if (response) {
                    setEmployees(response.data);
                    setError(null);
                } else {
                    throw new Error("Failed to fetch employees.");
                }
            } catch (error) {
                console.error("Error fetching employees:", error);
                setError("Failed to fetch employees. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchEmployees();
    }, [role, id]);

    useEffect(() => {
        const fetchProjectDetails = async () => {
            try {
                const response = await getTheProject(projectId);
                console.log(response)
                if (response) {
                    setProjectDetails(response.data.projectDetails || []);
                    setFinancialDetails(response.data.financialDetails || []);

                    const transformedAdditionalDetails = response.data.additionalDetails.map(detail => ({
                        ...detail,
                        projectDocument: detail.projectDocument ? detail.projectDocument[0] : null,
                        createdDate: detail.createdDate.split('T')[0]
                    }));
                    setAdditionalDetails(transformedAdditionalDetails || []);
                }
            } catch (error) {
                console.error("Error fetching project:", error);
                alert("Failed to fetch project details");
            }
        };

        if (projectId) {
            fetchProjectDetails();
        }
    }, [projectId]);

    const handleUpdateProject = async () => {
        if (validateForm()) {
            const projectData = {
                projectDetails,
                financialDetails,
                additionalDetails,
            };

            try {
                const response = await updatetheProject(projectId, projectData);
                if (response) {
                    alert("Project updated successfully!");
                    navigate("/project");
                } else {
                    alert("Failed to update project. Please try again.");
                }
            } catch (error) {
                console.error("Error:", error);
                alert("An error occurred while updating the project.");
            }
        } else {
            alert("Please fill out all mandatory fields!");
        }
    };


    const validateForm = () => {
        const projectValidation = projectDetails.every(
            (detail) =>
                detail.projectName &&
                detail.type &&
                detail.description &&
                detail.category &&
                detail.techStack &&
                detail.companyName &&
                detail.task
        );

        const financialValidation = financialDetails.every(
            (detail) => detail.quotedValue && detail.approvedValue && detail.paymentTerms
        );

        const additionalValidation = additionalDetails.every(
            (detail) => detail.assignedTo && detail.status
        );

        return projectValidation && financialValidation && additionalValidation;
    };

    const handleInputChange = (index, section, field, value) => {
        const sectionState =
            section === "projectDetails"
                ? projectDetails
                : section === "financialDetails"
                    ? financialDetails
                    : additionalDetails;

        const updatedDetails = [...sectionState];
        updatedDetails[index][field] = value;

        if (section === "projectDetails") setProjectDetails(updatedDetails);
        if (section === "financialDetails") setFinancialDetails(updatedDetails);
        if (section === "additionalDetails") setAdditionalDetails(updatedDetails);
    };

    const handleFileChange = (index, field, e) => {
        const file = e.target.files[0];
        const updatedDetails = [...additionalDetails];
        updatedDetails[index][field] = file;
        setAdditionalDetails(updatedDetails);
    };

    const addSection = (section) => {
        const defaultValue =
            section === "projectDetails"
                ? {
                    projectName: "",
                    type: "",
                    requirements: "",
                    description: "",
                    category: "",
                    techStack: "",
                    domain: "",
                    designation: "",
                    addOnServices: "",
                    duration: "",
                    dependencies: "",
                    companyName: "",
                    task: "",
                }
                : section === "financialDetails"
                    ? {
                        quotedValue: "",
                        approvedValue: "",
                        paymentTerms: "",
                        finalQuotation: "",
                        taxTerms: "",
                    }
                    : {
                        projectDocument: null,
                        nda: null,
                        msa: null,
                        assignedTo: "",
                        status: "",
                        createdDate: new Date().toISOString().split("T")[0],
                    };

        if (section === "projectDetails")
            setProjectDetails((prevDetails) => [...prevDetails, defaultValue]);
        if (section === "financialDetails")
            setFinancialDetails((prevDetails) => [...prevDetails, defaultValue]);
        if (section === "additionalDetails")
            setAdditionalDetails((prevDetails) => [...prevDetails, defaultValue]);
    };

    const removeSection = (section, index) => {
        const sectionState =
            section === "projectDetails"
                ? projectDetails
                : section === "financialDetails"
                    ? financialDetails
                    : additionalDetails;

        if (sectionState.length > 1) {
            const updatedDetails = sectionState.filter((_, i) => i !== index);

            if (section === "projectDetails") setProjectDetails(updatedDetails);
            if (section === "financialDetails") setFinancialDetails(updatedDetails);
            if (section === "additionalDetails") setAdditionalDetails(updatedDetails);
        }
    };


    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <p className="text-xl">Loading...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <p className="text-xl text-red-600">{error}</p>
            </div>
        );
    }
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 p-6 flex justify-center items-center mt-24">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-7xl w-full space-y-6">
                <h1 className="text-3xl font-semibold text-gray-800 mb-6 text-center w-full">
                    Edit Project
                </h1>

                <form className="space-y-6">
                    {[
                        ["Project Details", projectDetails, "projectDetails"],
                        ["Financial Details", financialDetails, "financialDetails"],
                        ["Additional Details", additionalDetails, "additionalDetails"]
                    ].map(([title, details, section]) => (
                        <section key={section} className="border-2 border-blue-300 rounded-lg p-6">
                            <h2 className="text-2xl font-semibold text-gray-700 mb-4">{title}</h2>

                            {details.map((detail, index) => (
                                <div key={index} className="rounded-lg p-6 mb-4 relative">
                                    {details.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeSection(section, index)}
                                            className="absolute top-2 right-2 text-red-500 hover:text-red-600"
                                        >
                                            <X />
                                        </button>
                                    )}

                                    <div className="grid grid-cols-3 gap-6">
                                        {Object.keys(detail).map((field) => (
                                            field !== "task" && (
                                                <div key={field}>
                                                    <label className="block text-gray-600 mb-1 font-medium">
                                                        {field.replace(/([A-Z])/g, " $1")}
                                                    </label>
                                                    {field === "assignedTo" ? (
                                                        <select
                                                            value={detail[field]}
                                                            onChange={(e) =>
                                                                handleInputChange(index, section, field, e.target.value)
                                                            }
                                                            className="w-full border rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                        >
                                                            <option value="">Select User</option>
                                                            {employees.map((employee) => (
                                                                <option key={employee._id} value={employee.name}>
                                                                    {employee.name}  {/* Adjust the property name based on your API response */}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    ) : field === "status" ? (
                                                        <select
                                                            value={detail[field]}
                                                            onChange={(e) =>
                                                                handleInputChange(index, section, field, e.target.value)
                                                            }
                                                            className="w-full border rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                        >
                                                            <option value="">Select Status</option>
                                                            {statuses.map((status) => (
                                                                <option key={status} value={status}>
                                                                    {status}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    ) : field.includes("Document") ? (
                                                        <input
                                                            type="file"
                                                            onChange={(e) => handleFileChange(index, field, e)}
                                                            className="w-full border rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                        />
                                                    ) : (
                                                        <input
                                                            type={field.includes("Date") ? "date" : "text"}
                                                            value={detail[field] || ''}
                                                            onChange={(e) =>
                                                                handleInputChange(index, section, field, e.target.value)
                                                            }
                                                            className="w-full border rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                        />
                                                    )}
                                                </div>
                                            )
                                        ))}

                                        {section === "projectDetails" && (
                                            <div className="col-span-3">
                                                <label className="block text-gray-600 mb-1 font-medium">Task</label>
                                                <textarea
                                                    value={detail["task"] || ''}
                                                    onChange={(e) =>
                                                        handleInputChange(index, section, "task", e.target.value)
                                                    }
                                                    className="w-full border rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                    rows="4"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={() => addSection(section)}
                                className="flex items-center text-blue-500 hover:text-blue-600 bg-blue-100 px-4 py-2 rounded-lg"
                            >
                                <Plus className="mr-2" /> Add More {title}
                            </button>
                        </section>
                    ))}

                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={() => navigate("/project")}
                            className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleUpdateProject}
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-200"
                        >
                            Update Project
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProjectEdit;