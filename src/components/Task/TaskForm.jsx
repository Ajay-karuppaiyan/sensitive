
import axios from "axios";
import React, { useState, useEffect } from "react";
import { createTask, employeename, projectname } from "../../api/services/projectServices";
import { useNavigate } from "react-router-dom";

function TaskForm() {
  const [tasks, setTasks] = useState([
    {
      project: "",
      task: "",
      empId: "",
      description: "",
      timeline: "",
      status: "Pending",
      date: "",
      attachments: null,
    },

  ]);
  const navigate = useNavigate();
  const id = localStorage.getItem("empId");
  const [role, setRole] = useState(localStorage.getItem("role") || "Superadmin");
  const [projects, setprojects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [employeesResponse, projectsResponse] = await Promise.all([
          employeename(`${id}`),
          projectname()
        ]);

        console.log("Employees fetched:", employeesResponse);
        console.log("Projects fetched:", projectsResponse);

        if (employeesResponse && projectsResponse) {
          setEmployees(employeesResponse.data); 
          const flattenedProjects = projectsResponse.data.flatMap(project =>
            project.projectDetails.map(detail => ({
              _id: project._id,
              projectName: detail.projectName 
            }))
          );
          setprojects(flattenedProjects); 
          setError(null);
        } else {
          throw new Error("Failed to fetch employees or projects.");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to fetch data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [role, id]);




  const handleChange = (index, e) => {
    const { name, value } = e.target;
    setTasks((prev) => {
      const updatedTasks = [...prev];
      updatedTasks[index][name] = value;
      return updatedTasks;
    });
  };

  const handleFileChange = (index, e) => {
    const files = e.target.files;
    setTasks((prev) => {
      const updatedTasks = [...prev];
      updatedTasks[index].attachments = files;
      return updatedTasks;
    });
  };

  const handleAddFields = () => {
    setTasks((prev) => [
      ...prev,
      {
        project: "",
        task: "",
        empId: "",
        description: "",
        timeline: "",
        status: "Pending",
        date: "",
        attachments: null,
      },
    ]);
  };

  const handleRemoveFields = (index) => {
    setTasks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      for (const formTask of tasks) {
        const formData = new FormData();
        formData.append("project", formTask.project);
        formData.append("task", formTask.task);
        formData.append("empId", formTask.empId);
        formData.append("description", formTask.description);
        formData.append("timeline", formTask.timeline);
        formData.append("status", formTask.status);
        formData.append("date", formTask.date);
        if (formTask.attachments) {
          Array.from(formTask.attachments).forEach((file) => {
            formData.append("attachments", file); 
          });
        } else {
          formData.append("attachments", ""); 
        }

        const response = await createTask(formData);

        if (response.status === 201) {
          alert("Task created successfully!");
          navigate("/task");
        } else {
          alert("Failed to create task.");
        }
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while creating the tasks.");
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
    <div className="container mx-auto p-8 mt-20">
      <h2 className="text-4xl font-bold mb-8 text-center text-gray-800">Task Form</h2>
      <form
        onSubmit={handleSubmit}
        className="space-y-8 bg-white p-8 border rounded-lg shadow-lg max-w-4xl mx-auto"
      >
        {tasks.map((task, index) => (
          <div key={index} className="space-y-8 border-b pb-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

              <div>
                <label className="block text-sm font-medium pb-2 text-gray-600">Project:</label>
                <select
                  name="project"
                  value={task.project}
                  onChange={(e) => handleChange(index, e)}
                  required
                  className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Project</option>
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
              <div>
                <label className="block text-sm font-medium pb-2 text-gray-600">Task:</label>
                <input
                  type="text"
                  name="task"
                  value={task.task}
                  onChange={(e) => handleChange(index, e)}
                  required
                  className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>

                <label className="block text-sm font-medium pb-2 text-gray-600">Employee:</label>
                <select
                  name="empId"
                  value={task.empId}
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
                <label className="block text-sm font-medium pb-2 text-gray-600">Description:</label>
                <textarea
                  name="description"
                  value={task.description}
                  onChange={(e) => handleChange(index, e)}
                  required
                  className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="4"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium pb-2 text-gray-600">Timeline:</label>
                <input
                  type="text"
                  name="timeline"
                  value={task.timeline}
                  onChange={(e) => handleChange(index, e)}
                  className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium pb-2 text-gray-600">Status:</label>
                <select
                  name="status"
                  value={task.status}
                  onChange={(e) => handleChange(index, e)}
                  required
                  className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium pb-2 text-gray-600">Date:</label>
                <input
                  type="date"
                  name="date"
                  value={task.date}
                  onChange={(e) => handleChange(index, e)}
                  required
                  min={new Date().toISOString().split("T")[0]} // <-- prevents past dates
                  className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium pb-2 text-gray-600">Attachments:</label>
                <input
                  type="file"
                  name="attachments"
                  onChange={(e) => handleFileChange(index, e)}
                  multiple
                  className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            {tasks.length > 1 && (
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

export default TaskForm;