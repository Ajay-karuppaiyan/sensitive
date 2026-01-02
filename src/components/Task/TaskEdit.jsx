import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { employeename, getTheTask, projectname } from "../../api/services/projectServices";
import axios from "axios";

function TaskEdit() {
  const { taskId } = useParams();
  const [task, setTask] = useState({
    project: "",
    task: "",
    empId: "",
    description: "",
    timeline: "",
    status: "Pending",
    date: "",
    attachments: "",
  });
  const navigate = useNavigate();
  const id = localStorage.getItem("empId");
  const [role, setRole] = useState(localStorage.getItem("role") || "Superadmin");
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [employeesResponse, projectsResponse] = await Promise.all([
          employeename(`${id}`),
          projectname(),
        ]);

        if (employeesResponse && projectsResponse) {
          setEmployees(employeesResponse.data);
          const flattenedProjects = projectsResponse.data.flatMap(project =>
            project.projectDetails.map(detail => ({
              _id: project._id,
              projectName: detail.projectName
            }))
          );
          setProjects(flattenedProjects);
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

  useEffect(() => {
    const fetchTaskData = async () => {
      try {
        const response = await getTheTask(taskId);
        if (response.status === 200) {
          let fetchedTask = response.data.task;

          console.log("Fetched Task Data:", fetchedTask);

          if (fetchedTask.date) {
            let dateObj = new Date(fetchedTask.date);
            let day = String(dateObj.getDate()).padStart(2, "0");
            let month = String(dateObj.getMonth() + 1).padStart(2, "0"); 
            let year = String(dateObj.getFullYear()).slice(-2); 

            fetchedTask.dateFormatted = `${day}/${month}/${year}`; 
            fetchedTask.date = dateObj.toISOString().split("T")[0]; 
          }

          setTask(fetchedTask);
        } else {
          console.error("Failed to fetch task data. Response status:", response.status);
          alert("Failed to fetch task data.");
        }
      } catch (error) {
        console.error("Error fetching task data:", error);
        alert("An error occurred while fetching task data.");
      }
    };

    if (taskId) {
      fetchTaskData();
    }
  }, [taskId]);


  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "date") {
      let dateObj = new Date(value);
      let day = String(dateObj.getDate()).padStart(2, "0");
      let month = String(dateObj.getMonth() + 1).padStart(2, "0");
      let year = String(dateObj.getFullYear()).slice(-2);

      setTask((prev) => ({
        ...prev,
        date: value,
        dateFormatted: `${day}/${month}/${year}`, 
      }));
    } else {
      setTask((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };


  const handleFileChange = (e) => {
    const file = e.target.files[0]; 
    if (file) {
      setTask((prev) => ({
        ...prev,
        attachments: URL.createObjectURL(file), 
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    Object.keys(task).forEach((key) => {
      formData.append(key, task[key]); 
    });

    try {
      console.log(taskId, task);
      const result = await getTheTask(taskId, task);
      console.log("Task updated:", result);
      alert("Task updated successfully!");
      navigate("/task");
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while updating the task.");
    }
  };

  if (loading) {
    return <div className="container mx-auto p-8 mt-20 text-center"><p className="text-xl">Loading...</p></div>;
  }

  if (error) {
    return <div className="container mx-auto p-8 mt-20 text-center"><p className="text-xl text-red-600">{error}</p></div>;
  }

  return (
    <div className="container mx-auto p-8 mt-20">
      <h2 className="text-4xl font-bold mb-8 text-center text-gray-800">Task Form</h2>
      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 border rounded-lg shadow-lg max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-medium pb-2 text-gray-600">Project:</label>
            <select name="project" value={task.project} onChange={handleChange} required className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="">Select Project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>{project.projectName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium pb-2 text-gray-600">Task:</label>
            <input type="text" name="task" value={task.task} onChange={handleChange} required className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium pb-2 text-gray-600">Employee:</label>
            <select name="empId" value={task.empId} onChange={handleChange} required className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="">Select Employee</option>
              {employees.map((employee) => (
                <option key={employee._id} value={employee.name}>{employee.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium pb-2 text-gray-600">Description:</label>
            <textarea name="description" value={task.description} onChange={handleChange} required className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500" rows="4" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-medium pb-2 text-gray-600">Timeline:</label>
            <input type="text" name="timeline" value={task.timeline} onChange={handleChange} className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium pb-2 text-gray-600">Status:</label>
            <select name="status" value={task.status} onChange={handleChange} required className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium pb-2 text-gray-600">Date:</label>
            <input type="date" name="date" value={task.date} onChange={handleChange} required className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium pb-2 text-gray-600">Attachments:</label>
            {task.attachments && (
              <div className="mb-4">
                <p className="text-gray-600">Existing Attachment:</p>
                <Link to={task.attachments} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View Attachment</Link>
              </div>
            )}
            <input type="file" name="attachments" onChange={handleFileChange} className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <button type="submit" className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition duration-300">Submit</button>
        </div>
      </form>
    </div>
  );
}

export default TaskEdit;
