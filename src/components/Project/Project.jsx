import React, { useEffect, useState, useMemo } from "react";
import { Eye, ChevronLeft, ChevronRight, Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FaFileDownload, FaFilter } from "react-icons/fa";
import { deletetheProject } from "../../api/services/projectServices";

const ProjectDetailsModal = ({ project, onClose, onEdit }) => {
  const renderArrayData = (array, field) => {
    if (!array || !Array.isArray(array) || array.length === 0) return "N/A";
    return array.map((item) => item[field]).filter(Boolean).join(", ");
  };

  const [role, setRole] = useState(localStorage.getItem("role") || "Superadmin");

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center mt-20">
      <div className="bg-white rounded-lg p-4 w-full sm:w-2/3 md:w-1/2 lg:w-1/3 max-h-[500px] overflow-auto flex flex-col">
        <h2 className="text-2xl font-semibold mb-4">Project Details</h2>
        <div className="flex flex-row justify-between">
          <div className="w-1/2 pr-4">
            <section>
              <h3 className="text-lg font-semibold mb-2">Project Information:</h3>
              <div className="space-y-2">
                <p><strong>Project Name:</strong> {renderArrayData(project.projectDetails, "projectName")}</p>
                <p><strong>Tech Stack:</strong> {renderArrayData(project.projectDetails, "techStack")}</p>
                <p><strong>Type:</strong> {renderArrayData(project.projectDetails, "type")}</p>
                <p><strong>Category:</strong> {renderArrayData(project.projectDetails, "category")}</p>
                <p><strong>Domain:</strong> {renderArrayData(project.projectDetails, "domain")}</p>
                <p><strong>Requirements:</strong> {renderArrayData(project.projectDetails, "requirements")}</p>
                <p><strong>Description:</strong> {renderArrayData(project.projectDetails, "description")}</p>
                <p><strong>Designation:</strong> {renderArrayData(project.projectDetails, "designation")}</p>
              </div>
            </section>
          </div>
          <div className="w-1/2 pl-4">
            <section>
              <h3 className="text-lg font-semibold mb-2">Additional Details:</h3>
              <div className="space-y-2">
                <p><strong>AddOnServices:</strong> {renderArrayData(project.projectDetails, "addOnServices")}</p>
                <p><strong>Duration:</strong> {renderArrayData(project.projectDetails, "duration")}</p>
                <p><strong>Dependencies:</strong> {renderArrayData(project.projectDetails, "dependencies")}</p>
                <p><strong>Company Name:</strong> {renderArrayData(project.projectDetails, "companyName")}</p>
                <p><strong>Task:</strong> {renderArrayData(project.projectDetails, "task")}</p>
                <p><strong>Quoted Value:</strong> {renderArrayData(project.financialDetails, "quotedValue")}</p>
                <p><strong>Approved Value:</strong> {renderArrayData(project.financialDetails, "approvedValue")}</p>
                <p><strong>Payment Terms:</strong> {renderArrayData(project.financialDetails, "paymentTerms")}</p>
                <p><strong>Assigned To:</strong> {renderArrayData(project.additionalDetails, "assignedTo")}</p> {/* Added field */}
              </div>
            </section>
          </div>
        </div>
        <div className="mt-4 flex justify-between">
          <button
            onClick={() => onEdit(project)}
            className={`bg-blue-500 text-white px-4 py-2 rounded ${role !== "Superadmin" ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
            disabled={role !== "Superadmin"}
          >
            Edit
          </button>
          <button
            onClick={onClose}
            className="bg-red-500 text-white px-6 py-2 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};


const ProjectManager = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const ITEMS_PER_PAGE = 10; 
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [role, setRole] = useState(localStorage.getItem("role") || "Superadmin");
  const id = localStorage.getItem("empId");
  const navigate = useNavigate();


  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(`https://sensitivetechcrm.onrender.com/project/getallprojects/${id}`);
        const data = await response.json();
        if (response.status === 200) {
          setProjects(data);
        } else {
          throw new Error("Failed to fetch projects");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [id]);

  const getLatestValue = (array, field) => {
    if (!array || !Array.isArray(array) || array.length === 0) return "N/A";
    const uniqueValues = [...new Set(array.map(item => item[field]).filter(Boolean))];
    return uniqueValues.join(", ") || "N/A";
  };

  const processedProjects = useMemo(() => {
    return projects?.map(project => ({
      ...project,
      displayData: {
        projectName: getLatestValue(project.projectDetails, 'projectName'),
        techStack: getLatestValue(project.projectDetails, 'techStack'),
        companyName: getLatestValue(project.projectDetails, 'companyName'),
        assignedTo: getLatestValue(project.additionalDetails, 'assignedTo'),
        duration: getLatestValue(project.projectDetails, 'duration'),
        task: getLatestValue(project.projectDetails, 'task'),
        status: getLatestValue(project.additionalDetails, 'status'),
        createdDate: project.additionalDetails?.[0]?.createdDate
          ? new Date(project.additionalDetails[0].createdDate).toLocaleString()
          : "N/A"
      }
    }))
      .filter(project =>
        role === "Superadmin" || project.displayData.status.toLowerCase() === "pending"
      );
  }, [projects, role]);

  const handleAddProject = () => {
    navigate('/add-project');
  };

  const handleDelete = async (projectId) => {
    if (!projectId) {
      alert("Invalid project ID. Unable to delete.");
      return;
    }

    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        const response = await deletetheProject(projectId);

        if (response?.status === 200) {
          setProjects((prevProjects) =>
            prevProjects.filter((project) => project._id !== projectId)
          );
          alert("Project deleted successfully!");
        } else {
          alert("Failed to delete project. Please try again.");
        }
      } catch (error) {
        console.error("Error deleting project:", error);
        alert(
          error.response?.data?.message ||
          "An error occurred while deleting the project."
        );
      }
    }
  };

  const handleExportData = () => {
    const csvRows = [];
    const headers = [
      "Project Name",
      "Tech Stack",
      "Client Company",
      "Assigned To",
      "Duration",
      "Tasks",
      "Status",
      "Created Date",
    ];
    csvRows.push(headers.join(","));

    processedProjects.forEach((project) => {
      const row = [
        project.displayData.projectName,
        project.displayData.techStack,
        project.displayData.companyName,
        project.displayData.assignedTo,
        project.displayData.duration,
        project.displayData.task,
        project.displayData.status,
        project.displayData.createdDate,
      ];
      csvRows.push(row.map((value) => `"${value}"`).join(","));
    });

    const csvContent = `data:text/csv;charset=utf-8,${csvRows.join("\n")}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "projects.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const applyDateFilter = () => {
    if (!startDate || !endDate) {
      alert('Please select both start and end dates.');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const filteredProjects = projects.filter((project) => {
      const projectDate = new Date(project.additionalDetails?.[0]?.createdDate);
      return projectDate >= start && projectDate <= end;
    });

    setProjects(filteredProjects);
  };

  const handleView = (project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  const handleEdit = (project) => {
    navigate(`/edit-project/${project._id}`);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedProjects = useMemo(() => {
    let filtered = [...processedProjects];

    if (searchTerm) {
      filtered = filtered.filter((project) => {
        const searchString = searchTerm.toLowerCase();
        return (
          project.displayData.projectName.toLowerCase().includes(searchString) ||
          project.displayData.techStack.toLowerCase().includes(searchString) ||
          project.displayData.companyName.toLowerCase().includes(searchString) ||
          project.displayData.assignedTo.toLowerCase().includes(searchString)
        );
      });
    }

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a.displayData[sortConfig.key] || '';
        const bValue = b.displayData[sortConfig.key] || '';

        if (sortConfig.key === 'createdDate') {
          return sortConfig.direction === 'asc'
            ? new Date(aValue) - new Date(bValue)
            : new Date(bValue) - new Date(aValue);
        }

        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      });
    }

    return filtered;
  }, [processedProjects, searchTerm, sortConfig]);

  const paginatedProjects = useMemo(() => {
    const startIndex = currentPage * ITEMS_PER_PAGE;
    return filteredAndSortedProjects.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAndSortedProjects, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedProjects.length / ITEMS_PER_PAGE);

  return (
    <div className="mx-auto p-4 mt-12">
      <h2 className="text-4xl font-bold mb-10 text-center mt-24">
        Project List
      </h2>
      <div className="mt-12">
        <div className="flex justify-between items-center mb-6">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search projects..."
              className="border border-blue-500 p-2 rounded w-64 pl-8"
            />
            <FaFilter className="absolute left-2 top-3 text-blue-500" />
          </div>

          <div className="flex space-x-4 items-center -mt-6">
            {role === "Superadmin" && (
              <>
                <div>
                  <label htmlFor="startDate" className="block">Start Date</label>
                  <input
                    type="date"
                    id="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border border-blue-500 p-2 rounded w-32"
                  />
                </div>
                <div>
                  <label htmlFor="endDate" className="block">End Date</label>
                  <input
                    type="date"
                    id="endDate"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border border-blue-500 p-2 rounded w-32"
                  />
                </div>
                <button
                  onClick={applyDateFilter}
                  className="bg-blue-500 text-white px-6 py-2 rounded h-10 w-auto text-sm mt-6"
                >
                  Apply Filter
                </button>
              </>
            )}
          </div>
          <div className="flex space-x-4">
          {role === "Superadmin" && (
            <button
              onClick={handleAddProject}
              className="bg-blue-500 text-white px-6 py-2 rounded flex items-center hover:bg-blue-600"
            >
              Add Project
            </button>
             )}
            {role === "Superadmin" && (
              <button
                onClick={handleExportData}
                className="bg-green-500 text-white px-6 py-2 rounded flex items-center hover:bg-green-600"
              >
                <FaFileDownload className="mr-2" /> Export Data
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          {paginatedProjects.length === 0 ? (
            <p className="text-center p-4">No project records found.</p>
          ) : loading ? (
            <p className="text-center p-4">Loading...</p>
          ) : error ? (
            <p className="text-center p-4 text-red-500">{error}</p>
          ) : (
            <>
              <table className="w-full">
                <thead className="bg-[#2563eb] text-white border-b">
                  <tr>
                    <th className="p-4 text-left cursor-pointer whitespace-nowrap">
                      <div className="flex items-center">
                        S.No
                      </div>
                    </th>
                    <th className="p-4 text-left cursor-pointer whitespace-nowrap" onClick={() => handleSort('projectName')}>
                      <div className="flex items-center">
                        Project Name
                        <span>{sortConfig.key === 'projectName' ? (sortConfig.direction === 'asc' ? ' 🔼' : ' 🔽') : ''}</span>
                      </div>
                    </th>
                    <th className="p-4 text-left cursor-pointer whitespace-nowrap" onClick={() => handleSort('techStack')}>
                      <div className="flex items-center">
                        Tech Stack
                        <span>{sortConfig.key === 'techStack' ? (sortConfig.direction === 'asc' ? ' 🔼' : ' 🔽') : ''}</span>
                      </div>
                    </th>
                    <th className="p-4 text-left cursor-pointer whitespace-nowrap" onClick={() => handleSort('companyName')}>
                      <div className="flex items-center">
                        Client Company
                        <span>{sortConfig.key === 'companyName' ? (sortConfig.direction === 'asc' ? ' 🔼' : ' 🔽') : ''}</span>
                      </div>
                    </th>
                    <th className="p-4 text-left cursor-pointer whitespace-nowrap" onClick={() => handleSort('assignedTo')}>
                      <div className="flex items-center">
                        Assigned To
                        <span>{sortConfig.key === 'assignedTo' ? (sortConfig.direction === 'asc' ? ' 🔼' : ' 🔽') : ''}</span>
                      </div>
                    </th>
                    <th className="p-4 text-left cursor-pointer whitespace-nowrap" onClick={() => handleSort('duration')}>
                      <div className="flex items-center">
                        Duration
                        <span>{sortConfig.key === 'duration' ? (sortConfig.direction === 'asc' ? ' 🔼' : ' 🔽') : ''}</span>
                      </div>
                    </th>
                    <th className="p-4 text-left cursor-pointer whitespace-nowrap">
                      <div className="flex items-center">
                        Tasks
                      </div>
                    </th>
                    <th className="p-4 text-left cursor-pointer whitespace-nowrap" onClick={() => handleSort('status')}>
                      <div className="flex items-center">
                        Status
                        <span>{sortConfig.key === 'status' ? (sortConfig.direction === 'asc' ? ' 🔼' : ' 🔽') : ''}</span>
                      </div>
                    </th>
                    <th className="p-4 text-left cursor-pointer whitespace-nowrap" onClick={() => handleSort('createdDate')}>
                      <div className="flex items-center">
                        Created Date
                        <span>{sortConfig.key === 'createdDate' ? (sortConfig.direction === 'asc' ? ' 🔼' : ' 🔽') : ''}</span>
                      </div>
                    </th>
                    <th className="p-4 text-left cursor-pointer whitespace-nowrap">
                      <div className="flex items-center">
                        Actions
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProjects.map((project, index) => (
                    <tr key={project._id} className="border-b hover:bg-gray-50 transition-colors whitespace-nowrap">
                      <td className="p-4">{currentPage * ITEMS_PER_PAGE + index + 1}</td>
                      <td className="p-4">{project.displayData.projectName}</td>
                      <td className="p-4">{project.displayData.techStack}</td>
                      <td className="p-4">{project.displayData.companyName}</td>
                      <td className="p-4">{project.displayData.assignedTo}</td>
                      <td className="p-4">{project.displayData.duration}</td>
                      <td className="p-4">{project.displayData.task}</td>
                      <td className="p-4">{project.displayData.status}</td>
                      <td className="p-4">{project.displayData.createdDate}</td>
                      <td className="p-4">
                        <div className="flex justify-center space-x-2">
                          <button
                            className="text-blue-500 hover:bg-blue-100 p-2 rounded-full"
                            title="View Project"
                            onClick={() => handleView(project)}
                          >
                            <Eye size={20} />
                          </button>
                          <button
                            className="text-red-500 hover:bg-red-100 p-2 rounded-full"
                            title="Delete Project"
                            onClick={() => handleDelete(project._id)}
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-between items-center p-4">
                <div>
                  <span>
                    Page <strong>{currentPage + 1} of {totalPages}</strong>
                  </span>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                    disabled={currentPage === 0}
                    className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
                    disabled={currentPage + 1 === totalPages}
                    className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {isModalOpen && selectedProject && (
        <ProjectDetailsModal project={selectedProject} onClose={handleCloseModal} onEdit={handleEdit} />
      )}
    </div>
  );
};

export default ProjectManager;