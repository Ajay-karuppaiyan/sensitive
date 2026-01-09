import { projectServices } from "../axios/axiosInstance";
import axios from "axios";

// export const verifyLogin = async (formData) => {
//   try {
//     const response = await projectServices.post(`/employee-login/login`, formData);
//     return response;
//   } catch (err) {
//     throw err;
//   }
// };


export const verifyLogin = async (formData) => {
  try {
    const response = await projectServices.post(`/employee-login/login`, formData);

    // Store Mongo _id in empId (frontend uses this)
    localStorage.setItem("empId", response.data.employee._id);

    // Store actual employee ID (empId in DB) in userId
    localStorage.setItem("userId", response.data.employee.empId);

    localStorage.setItem("role", response.data.employee.role);

    // Set expiration 10 mins
    const expirationTime = new Date().getTime() + 600000;
    localStorage.setItem("tokenExpiration", expirationTime.toString());

    return response;
  } catch (err) {
    throw err;
  }
};


export const sendOTP = async (data) => {
  try {
    const response = await projectServices.post(`/email/send-otp`, data);
        const expirationTime = new Date().getTime() + 600000;
    localStorage.setItem("tokenExpiration", expirationTime.toString());
    return response;
  } catch (error) {
    throw error;
  }
};

export const verifyOTP = async (data) => {
  try {
    const response = await projectServices.post(`/email/verify-otp`, data);
        const expirationTime = new Date().getTime() + 600000;
    localStorage.setItem("tokenExpiration", expirationTime.toString());
    return response;
  } catch (error) {
    throw error;
  }
};


  export const getTheProject=async(projectId) => {
    try {
      const response = await projectServices.get(`/project/getprojectbyid/${projectId}` );
      return response;
    } catch (err) {
      return err;
    }
  };


  export const updatetheProject = async (projectId, projectData) => {
    try {
        const response = await projectServices.put(`/project/updateprojectby/${projectId}`, projectData, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        return response;
    } catch (err) {
      return err;
    }
};


export const deletetheProject = async (projectId) => {
  if (!projectId) throw new Error("Invalid project ID for deletion");

  try {
      const response = await projectServices.delete(`/project/deleteproject/${projectId}`);
      return response;
  }  catch (err) {
    return err;
  }
};

export const createProject=async(projectData) => {
  try {
    const response = await projectServices.post(`/project/createproject`, projectData, {
      headers: {
          "Content-Type": "application/json",
      },
  });
    return response;
  } catch (err) {
    return err;
  }
};


export const projectname=async() => {
  try {
    const responsename = await projectServices.get(`/project/projectname` );
    return responsename;
  } catch (err) {
    return err;
  }
};



// export const employeename=async() => {
//   try {
//     const response = await projectServices.get(`/employename` );
//     return response;
//   } catch (err) {
//     return err;
//   }
// };

export const employeename = async (id) => {
  try {
    const response = await projectServices.get(`/employename/${id}`);
    return response;
  } catch (err) {
    return err;
  }
};

export const createTask = async (formData) => {
  try {
    const response = await projectServices.post(`/task/createtask`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response;
  } catch (err) {
    console.error("Error creating task:", err);
    return err;
  }
};


export const getTheTask=async(taskId) => {
  try {
    console.log("edit task")
    const response = await projectServices.get(`/task/gettaskbyid/${taskId}` );
    return response;
  } catch (err) {
    return err;
  }
};


export const updateTheTask = async (taskId, formData) => {
  try {
    const response = await projectServices.put(`/task/updatetask/${taskId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data", 
      },
    });
    return response.data; 
  } catch (err) {
    return err;
  }
};

export const getTasks = async () => {
  try {
    const response = await projectServices.get(`/task/totaltasks`);
    return response;
  } catch (err) {
    return err;
  }
};

export const getMyTasks = async (stid) => {
  try {
    return await API.get(`/task/my-tasks/${stid}`);
  } catch (error) {
    return error.response;
  }
};

export const createPayroll=async(formData) => {
  try {
    const response = await projectServices.post(`/payroll/createpayroll`, formData, {
      headers: {
          "Content-Type": "application/json",
      },
  });
    return response;
  } catch (err) {
    return err;
  }
};


export const getAllPayroll=async() => {
  try {
    const response = await projectServices.get(`/payroll/getpayroll` );
    return response;
  } catch (err) {
    return err;
  }
};

export const getPayrollById = async (payrollId) => {
  try {
    const response = await projectServices.get(`/payroll/getpayrollbyid/${payrollId}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response;
  } catch (err) {
    return err;
  }
};


export const updatePayroll = async (payrollId, formData) => {
  try {
    const response = await projectServices.put(`/payroll/updatepayroll/${payrollId}`, formData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response;
  } catch (err) {
    return err;
  }
};

export const getTotalEmployees=async() => {
  try {
    const response = await projectServices.get(`/totalemployee` );
    return response;
  } catch (err) {
    return err;
  }
};

export const getTotalProjects = async () => {
  try {
    const response = await projectServices.get(`/project/totalprojects`);
    return response;
  } catch (err) {
    return err;
  }
};

export const getProjectsByEmployee = async (empId) => {
  try {
    const response = await projectAPI.get(`/assigned/${empId}`);
    return response;
  } catch (err) {
    console.error("Error fetching employee projects:", err);
    return err.response || err;
  }
};

export const getClients = async () => {
  try {
    const response = await projectServices.get(`/clients/totalclients`);
    return response;
  } catch (err) {
    return err;
  }
};

export const getLeave = async () => {
  try {
    const response = await projectServices.get(`/leaves/totalleaverequests`);
    return response;
  } catch (err) {
    return err;
  }
};

export const getTodayLeaves = async () => {
  try {
    const response = await projectServices.get("/leaves/today");
    return response;
  } catch (err) {
    return err;
  }
};


// ===================== ATTENDANCE FOR DASHBOARD =====================

// ========================= ATTENDANCE FUNCTIONS =========================

// export const getAttendance = async () => {
//   try {
//     const response = await projectServices.get(`/attendance/totalattendance`);
//     return response;
//   } catch (err) {
//     return err;
//   }
// };
// Get total attendance of all employees (all-time)

// Admin: Get total attendance of all employees
export const getAttendance = async () => {
  try {
    const response = await projectServices.get(`/attendance/totalattendance`);
    return response;
  } catch (err) {
    return err;
  }
};

// Admin: Get employees present today
export const getTodayPresentCount = async () => {
  try {
    const response = await axios.get("http://localhost:3000/api/attendance/present-today");
    return response;
  } catch (error) {
    console.error("Error fetching today present count:", error);
    throw error;
  }
};


// Employee: Get monthly attendance using userId
export const getMyMonthlyAttendance = async (stid) => {
  try {
    const response = await projectServices.get(`/api/attendance/employee/monthly-attendance/${stid}`);
    return response;
  } catch (err) {
    return err;
  }
};


export const getTotalPayrolls = async () => {
  try {
    const response = await projectServices.get(`/payroll/totalpayrolls`);
    return response;
  } catch (err) {
    return err;
  }
};

export const getTotalLeads = async () => {
  try {
    const response = await projectServices.get(`/leads/totalleads`);
    return response;
  } catch (err) {
    return err;
  }
};

export const getLeaveById = async (id) => {
  try {
    const response = await projectServices.get(`/leaves/get/${id}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response;
  } catch (err) {
    return err;
  }
};

export const getMonthlyLeaveByEmpId = async (stid) => {
  try {
    const response = await projectServices.get(`/leaves/employee/current-month/${stid}`);
    return response;
  } catch (err) {
    return err;
  }
};


export const createPayment = async (formData) => {
  try {
    const response = await projectServices.post(`/payments/createpayment`, formData, {
      headers: {
      },
    });
    return response;
  } catch (error) {
    console.error("Error in createPayment API:", error);
    throw error;
  }
};

export const getTotalPayments = async () => {
  try {
    const response = await projectServices.get(`/payments/getallpayments`);
    return response;
  } catch (err) {
    return err;
  }
};

export const updatePaymentById = async (paymentId, formData) => {
  try {
    const response = await projectServices.put(`/payments/updatepayment/${paymentId}`, formData);
    return response;
  } catch (err) {
    console.error("Error in updatePaymentById:", err);
    throw err;
  }
};


export const getPaymentById = async (paymentId) => {
  try {
    const response = await projectServices.get(`/payments/getpayment/${paymentId}`,  {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response;
  } catch (err) {
    return err;
  }
};

export const createExpense = async (formData) => {
  try {
    const response = await projectServices.post(`/expense/createexpense`, formData, {
      headers: {
      },
    });
    return response;
  } catch (error) {
    console.error("Error in createPayment API:", error);
    throw error;
  }
};

export const getTotalExpense = async () => {
  try {
    const response = await projectServices.get(`/expense/getallexpense`);
    return response;
  } catch (err) {
    return err;
  }
};


export const updateExpenseById = async (expenseId, formData) => {
  try {
    const response = await projectServices.put(`/expense/updateexpense/${expenseId}`, formData);
    return response;
  } catch (err) {
    console.error("Error in updateExpenseById:", err);
    throw err;
  }
};


export const getExpenseById = async (expenseId) => {
  try {
    const response = await projectServices.get(`/expense/getexpense/${expenseId}`,  {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response;
  } catch (err) {
    return err;
  }
};

export const createMoM = async (formData) => {
  try {
    const response = await projectServices.post(`/mom/mompage`, formData, {
      headers: { 
      },
    });
    return response;
  } catch (error) {
    console.error("Error in createPayment API:", error);
    throw error;
  }
};

export const getMoM = async () => {
  try {
    const response = await projectServices.get(`/mom/getallmom`);
    return response;
  } catch (err) {
    return err;
  }
};



export const getMoMById = async (id) => {
  if (!id || id === "undefined") {
    console.error("Invalid ID for getMoMById:", id);
    return { error: "Invalid ID provided" };
  }

  try {
    const response = await projectServices.get(`/mom/getmombyid/${id}`);
    return response;
  } catch (err) {
    console.error("Error in getMoMById:", err);
    return err;
  }
};

export const updateMoM = async (id, formData) => {
  try {
    const response = await projectServices.put(`/mom/updatemom/${id}`, formData);
    return response;
  } catch (err) {
    console.error("Error in updateExpenseById:", err);
    throw err;
  }
};

export const deleteMoM = async (id) => {
  try {
      const response = await projectServices.delete(`/mom/deletemom/${id}`);
      return response.data;
  } catch (err) {
      console.error('Error deleting MoM:', err);
      throw err;
  }
};

export const createQuotation = async (formData) => {
  try {
    const response = await projectServices.post(`/quotation/quotationcreate`, formData, {
      headers: {
      },
    });
    return response;
  } catch (error) {
    console.error("Error in createPayment API:", error);
    throw error;
  }
};

export const updateQuotation = async (quotationId, formData) => {
  try {
    const response = await projectServices.put(`/quotation/quotationupdate/${quotationId}`, formData);
    return response;
  } catch (err) {
    console.error("Error in updateExpenseById:", err);
    throw err;
  }
};

export const getTotalQuotations = async () => {
  try {
    const response = await projectServices.get(`/quotation/allquotation`);
    return response;
  } catch (err) {
    return err;
  }
};

export const deleteQuotations = async (id) => {
  try {
      const response = await projectServices.delete(`/quotation/quotationdelete/${id}`); 
      return response.data;
  } catch (err) {
      console.error('Error deleting MoM:', err);
      throw err;
  }
};

export const getQuotationsById = async (quotationId) => {
  try {
    const response = await projectServices.get(`/quotation/quotationbyid/${quotationId}`,  {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response;
  } catch (err) {
    return err;
  }
};


