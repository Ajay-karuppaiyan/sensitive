// import React, { useState, useEffect } from "react";
// import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
// import Dashboard from "./components/Dashboard/Dashboard";
// import Topbar from "./components/Topbar/Topbar";
// import EmployeeTable from "./components/Employee/EmployeeTable";
// import Employee from "./components/Employee/Employee";
// import LoginPage from "./components/Login/Login";
// import SignUp from "./assets/SignUp";
// import TaskList from "./components/Task/Task";
// import ProjectManager from "./components/Project/Project";
// import ClientTable from "./components/Client/ClientTable";
// import Client from "./components/Client/Client";
// import AttendanceTable from "./components/AttendanceTable/AttendanceTable";
// import EmployeeAttendance from "./components/AttendanceTable/EmployeeAttendance";
// import Leave from "./components/Leave/Leave";
// import LeaveTable from "./components/Leave/LeaveTable";
// import TaskForm from "./components/Task/TaskForm";
// import ProjectForm from "./components/Project/ProjectForm";
// import ClientEdit from "./components/Client/ClientEdit";
// import LeaveEdit from "./components/Leave/LeaveEdit";
// import EmployeeEdit from "./components/Employee/EmployeeEdit";
// import AdminForm from "./components/Admin/AdminForm";
// import TaskEdit from "./components/Task/TaskEdit";
// import ProjectEdit from "./components/Project/ProjectEdit";
// import LeadForm from "./components/Leads/Leads";
// import LeadTable from "./components/Leads/LeadTable";
// import Preloader from "./components/preloader/Preloader";
// import LeadEdit from "./components/Leads/LeadEdit";
// import Payments from "./components/Payments/Payments";
// import PaymentTable from "./components/Payments/PaymentTable";
// import Expenses from "./components/Expenses/Expenses";
// import ExpenseTable from "./components/Expenses/ExpensesTable";
// import ExpensesEdit from "./components/Expenses/ExpensesEdit";
// import PaymentEdit from "./components/Payments/PaymentEdit";
// import AdjustmentTable from "./components/Adjustment/AdjustmentTable";
// import Adjustment from "./components/Adjustment/Adjustment";
// import AdjustmentEdit from "./components/Adjustment/AdjustmentEdit";
// import MoM from "./components/MoM/MoM";
// import BlogPage from "./components/MoM/BlogPage";
// import MoMEdit from "./components/MoM/MoMEdit";
// import PayrollEmployee from "./components/PayrollEmployee/PayrollEmployee";
// import PayrollForm from "./components/PayrollEmployee/PayrollForm";
// import QuotationForm from "./components/Quotations/Quotations";
// import QuotationTable from "./components/Quotations/Quotationstable";
// import QuotationEdit from "./components/Quotations/QuotationsEdit";
// import SearchResults from "./components/SearchResults/SearchResults";
// import SearchLeads from "./components/SearchLeads/SearchLeads";

// const RouteTransition = ({ children }) => {
//   return <>{children}</>;
// };

// const checkTokenExpiration = () => {
//   const expirationTime = localStorage.getItem("tokenExpiration");
//   if (!expirationTime) return true; // No expiration time set, consider expired
  
//   const currentTime = new Date().getTime();
//   return currentTime > parseInt(expirationTime, 10);
// };

// const AdminLayout = ({ children, loading }) => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   useEffect(() => {
//     const checkAuth = () => {
//       const token = localStorage.getItem("empId");
//       const isExpired = checkTokenExpiration();
      
//       if ((!token || isExpired) && location.pathname !== "/login") {
//         // Clear all auth-related data
//         localStorage.removeItem("empId");
//         localStorage.removeItem("role");
//         localStorage.removeItem("tokenExpiration");
        
//         navigate("/login", { 
//           state: { 
//             sessionExpired: isExpired,
//             from: location.pathname 
//           } 
//         });
//       }
//     };

//     const authInterval = setInterval(checkAuth, 120000); // Check every 5 minutes
//     checkAuth(); // Initial check

//     return () => clearInterval(authInterval);
//   }, [navigate, location.pathname, location]);

//   return (
//     <div className="app">
//       {loading && <Preloader />} 
//       {!loading && <Topbar />}  
//       <div className="main-content">
//         {children}
//       </div>
//     </div>
//   );
// };

// function App() {
//   const role = localStorage.getItem("role");

//   return (
//     <Router>
//       <RoutesWithPreloader role={role} />
//     </Router>
//   );
// }

// const RoutesWithPreloader = ({ role }) => {
//   const location = useLocation();
//   const [loading, setLoading] = useState(true); 

//   useEffect(() => {
//     const loadingRoutes = [
//       '/dashboard',
//       '/employee-table',
//       '/attendance-table',
//       '/leave-table',
//       '/task',
//       '/project',
//       '/client-table',
//       '/lead-table',
//       '/adjustment-table',
//       '/payments-table',
//       '/payroll-table',
//       '/expense-table',
//       '/momdetails',
//       '/quotation-table',
//     ];

//     if (loadingRoutes.includes(location.pathname)) {
//       setLoading(true); 
//       setTimeout(() => {
//         setLoading(false);  
//       }, 2000);
//     } else {
//       setLoading(false); 
//     }
//   }, [location]);

//   const employeeRoutes = [
//     '/dashboard', 
//     '/attendance-table', 
//     '/attendance-form', 
//     '/leave-table', 
//     '/leave', 
//     '/leave-edit', 
//     '/task', 
//     '/task-form', 
//     '/task-edit', 
//     '/project', 
//     '/add-project', 
//     '/edit-project', 
//     '/mom', 
//     '/momdetails', 
//     '/mom-edit', 
//     '/search-results'
//   ];

//   const adminRoutes = [
//     '/admin',
//     '/dashboard',
//     '/employee-table',
//     '/employee-form',
//     '/employee-edit',
//     '/task',
//     '/project',
//     '/add-project',
//     '/edit-project',
//     '/client-table',
//     '/client-edit',
//     '/client-form',
//     '/attendance-table',
//     '/attendance-form',
//     '/leave',
//     '/leave-table',
//     '/leave-edit',
//     '/task-form',
//     '/task-edit',
//     '/lead-form',
//     '/lead-table',
//     '/lead-edit',
//     '/adjustment-form',
//     '/adjustment-table',
//     '/adjustment-edit',
//     '/payments-form',
//     '/payments-table',
//     '/payments-edit',
//     '/expense-form',
//     '/expense-table',
//     '/expense-edit',
//     '/mom',
//     '/momdetails',
//     '/mom-edit',
//     '/payroll-table',
//     '/payroll-form',
//     '/quotation-form',
//     '/quotation-table',
//     '/quotation-edit',
//     '/search-leads',
//     '/search-results'
//   ];

//   const isValidPath = (path) => {
//     if (role === "employee") {
//       return employeeRoutes.some(route => path.startsWith(route));
//     } else {
//       return adminRoutes.some(route => path.startsWith(route));
//     }
//   };

//   return (
//     <>
//       <Routes>
//         <Route path="/" element={<Navigate to="/login" />} />
//         <Route path="/login" element={<LoginPage />} />
//         <Route path="/signup" element={<SignUp />} />
//         <Route
//           path="/*"
//           element={
//             role === "employee" ? (
//               !isValidPath(location.pathname) ? (
//                 <Navigate to="/login" replace />
//               ) : (
//                 <AdminLayout loading={loading}>
//                   <Routes>
//                     <Route path="/dashboard" element={<Dashboard />} />
//                     <Route path="/attendance-table" element={<AttendanceTable />} />
//                     <Route path="/attendance-form" element={<EmployeeAttendance />} />
//                     <Route path="/leave-table" element={<LeaveTable />} />
//                     <Route path="/leave" element={<Leave />} />
//                     <Route path="/leave-edit/:id" element={<LeaveEdit />} />
//                     <Route path="/task" element={<TaskList />} />
//                     <Route path="/task-form" element={<TaskForm />} />
//                     <Route path="/task-edit/:taskId" element={<TaskEdit />} />
//                     <Route path="/project" element={<ProjectManager />} />
//                     <Route path="/add-project" element={<ProjectForm />} />
//                     <Route path="/edit-project/:projectId" element={<ProjectEdit />} />
//                     <Route path="/mom" element={<MoM />} />
//                     <Route path="/momdetails" element={<BlogPage />} />
//                     <Route path="/mom-edit/:id" element={<MoMEdit />} />
//                     <Route path="/search-results" element={<SearchResults />} />
//                     <Route path="*" element={<Navigate to="/login" replace />} />
//                   </Routes>
//                 </AdminLayout>
//               )
//             ) : (
//               !isValidPath(location.pathname) ? (
//                 <Navigate to="/login" replace />
//               ) : (
//                 <AdminLayout loading={loading}>
//                   <Routes>
//                     <Route path="/admin" element={<AdminForm />} />
//                     <Route path="/dashboard" element={<Dashboard />} />
//                     <Route path="/employee-table" element={<EmployeeTable />} />
//                     <Route path="/employee-form" element={<Employee />} />
//                     <Route path="/employee-edit/:id" element={<EmployeeEdit />} />
//                     <Route path="/task" element={<TaskList />} />
//                     <Route path="/project" element={<ProjectManager />} />
//                     <Route path="/add-project" element={<ProjectForm />} />
//                     <Route path="/edit-project/:projectId" element={<ProjectEdit />} />
//                     <Route path="/client-table" element={<ClientTable />} />
//                     <Route path="/client-edit/:id" element={<ClientEdit />} />
//                     <Route path="/client-form" element={<Client />} />
//                     <Route path="/attendance-table" element={<AttendanceTable />} />
//                     <Route path="/attendance-form" element={<EmployeeAttendance />} />
//                     <Route path="/leave" element={<Leave />} />
//                     <Route path="/leave-table" element={<LeaveTable />} />
//                     <Route path="/leave-edit/:id" element={<LeaveEdit />} />
//                     <Route path="/task-form" element={<TaskForm />} />
//                     <Route path="/task-edit/:taskId" element={<TaskEdit />} />
//                     <Route path="/lead-form" element={<LeadForm />} />
//                     <Route path="/lead-table" element={<LeadTable />} />
//                     <Route path="/lead-edit/:id" element={<LeadEdit />} />
//                     <Route path="/search-leads" element={<SearchLeads/>} />
//                     <Route path="/adjustment-form" element={<Adjustment />} />
//                     <Route path="/adjustment-table" element={<AdjustmentTable />} />
//                     <Route path="/adjustment-edit/:id" element={<AdjustmentEdit />} />
//                     <Route path="/payments-form" element={<Payments />} />
//                     <Route path="/payments-table" element={<PaymentTable />} />
//                     <Route path="/payments-edit/:id" element={<PaymentEdit />} />
//                     <Route path="/expense-form" element={<Expenses />} />
//                     <Route path="/expense-table" element={<ExpenseTable />} />
//                     <Route path="/expense-edit/:id" element={<ExpensesEdit />} />
//                     <Route path="/mom" element={<MoM />} />
//                     <Route path="/momdetails" element={<BlogPage />} />
//                     <Route path="/mom-edit/:id" element={<MoMEdit />} />
//                     <Route path="/payroll-table" element={<PayrollEmployee />} />
//                     <Route path="/payroll-form/:id" element={<PayrollForm />} />
//                     <Route path="/quotation-form" element={<QuotationForm />} />
//                     <Route path="/quotation-table" element={<QuotationTable />} />
//                     <Route path="/quotation-edit/:id" element={<QuotationEdit />} />
//                     <Route path="/search-results" element={<SearchResults />} />
//                     <Route path="*" element={<Navigate to="/login" replace />} />
//                   </Routes>
//                 </AdminLayout>
//               )
//             )
//           }
//         />
//       </Routes>
//     </>
//   );
// };

// export default App;


import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import Dashboard from "./components/Dashboard/Dashboard";
import Topbar from "./components/Topbar/Topbar";
import EmployeeTable from "./components/Employee/EmployeeTable";
import Employee from "./components/Employee/Employee";
import LoginPage from "./components/Login/Login";
import SignUp from "./assets/SignUp";
import TaskList from "./components/Task/Task";
import ProjectManager from "./components/Project/Project";
import ClientTable from "./components/Client/ClientTable";
import Client from "./components/Client/Client";
import AttendanceTable from "./components/AttendanceTable/AttendanceTable";
import EmployeeAttendance from "./components/AttendanceTable/EmployeeAttendance";
import Leave from "./components/Leave/Leave";
import LeaveTable from "./components/Leave/LeaveTable";
import TaskForm from "./components/Task/TaskForm";
import ProjectForm from "./components/Project/ProjectForm";
import ClientEdit from "./components/Client/ClientEdit";
import LeaveEdit from "./components/Leave/LeaveEdit";
import EmployeeEdit from "./components/Employee/EmployeeEdit";
import AdminForm from "./components/Admin/AdminForm";
import TaskEdit from "./components/Task/TaskEdit";
import ProjectEdit from "./components/Project/ProjectEdit";
import LeadForm from "./components/Leads/Leads";
import LeadTable from "./components/Leads/LeadTable";
import Preloader from "./components/preloader/Preloader";
import LeadEdit from "./components/Leads/LeadEdit";
import Payments from "./components/Payments/Payments";
import PaymentTable from "./components/Payments/PaymentTable";
import Expenses from "./components/Expenses/Expenses";
import ExpenseTable from "./components/Expenses/ExpensesTable";
import ExpensesEdit from "./components/Expenses/ExpensesEdit";
import PaymentEdit from "./components/Payments/PaymentEdit";
import AdjustmentTable from "./components/Adjustment/AdjustmentTable";
import Adjustment from "./components/Adjustment/Adjustment";
import AdjustmentEdit from "./components/Adjustment/AdjustmentEdit";
import MoM from "./components/MoM/MoM";
import BlogPage from "./components/MoM/BlogPage";
import MoMEdit from "./components/MoM/MoMEdit";
import PayrollEmployee from "./components/PayrollEmployee/PayrollEmployee";
import PayrollForm from "./components/PayrollEmployee/PayrollForm";
import QuotationForm from "./components/Quotations/Quotations";
import QuotationTable from "./components/Quotations/Quotationstable";
import QuotationEdit from "./components/Quotations/QuotationsEdit";
import SearchResults from "./components/SearchResults/SearchResults";
import SearchLeads from "./components/SearchLeads/SearchLeads";

const RouteTransition = ({ children }) => {
  return <>{children}</>;
};
// Add these utility functions at the top of App.jsx
const refreshSession = () => {
  const expirationTime = new Date().getTime() + 10 * 60 * 1000;
  localStorage.setItem("tokenExpiration", expirationTime.toString());
};

const checkTokenExpiration = () => {
  const expirationTime = localStorage.getItem("tokenExpiration");
  if (!expirationTime) return true;
  return new Date().getTime() > parseInt(expirationTime, 10);
};


const AdminLayout = ({ children, loading }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Check auth status
  const checkAuth = () => {
    const token = localStorage.getItem("empId");
    const isExpired = checkTokenExpiration();
    
    if ((!token || isExpired) && location.pathname !== "/login") {
      localStorage.removeItem("empId");
      localStorage.removeItem("role");
      localStorage.removeItem("tokenExpiration");
      
      navigate("/login", { 
        state: { 
          sessionExpired: isExpired,
          from: location.pathname 
        } 
      });
    }
  };

  useEffect(() => {
    // Refresh session on initial load and route changes
    refreshSession();
    
    // Set up activity listeners
    const handleActivity = () => refreshSession();
    const events = ['mousedown', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    // Check auth periodically
    const authInterval = setInterval(checkAuth, 60000);

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      clearInterval(authInterval);
    };
  }, [navigate, location.pathname]);

  // Refresh session on route changes
  useEffect(() => {
    refreshSession();
  }, [location.pathname]);

  return (
    <div className="app">
      {loading && <Preloader />} 
      {!loading && <Topbar />}  
      <div className="main-content">
        {children}
      </div>
    </div>
  );
};

function App() {
  const role = localStorage.getItem("role");

  return (
    <Router>
      <RoutesWithPreloader role={role} />
    </Router>
  );
}

const RoutesWithPreloader = ({ role }) => {
  const location = useLocation();
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const loadingRoutes = [
      '/dashboard',
      '/employee-table',
      '/attendance-table',
      '/leave-table',
      '/task',
      '/project',
      '/client-table',
      '/lead-table',
      '/search-leads',
      '/adjustment-table',
      '/payments-table',
      '/payroll-table',
      '/expense-table',
      '/momdetails',
      '/quotation-table',
    ];

    if (loadingRoutes.includes(location.pathname)) {
      setLoading(true); 
      setTimeout(() => {
        setLoading(false);  
      }, 2000);
    } else {
      setLoading(false); 
    }
  }, [location]);

  const employeeRoutes = [
    '/dashboard', 
    '/attendance-table', 
    '/attendance-form', 
    '/leave-table', 
    '/leave', 
    '/leave-edit', 
    '/task', 
    '/task-form', 
    '/task-edit', 
    '/project', 
    '/add-project', 
    '/edit-project', 
    '/mom', 
    '/momdetails', 
    '/mom-edit', 
    '/search-results'
  ];

  const adminRoutes = [
    '/admin',
    '/dashboard',
    '/employee-table',
    '/employee-form',
    '/employee-edit',
    '/task',
    '/project',
    '/add-project',
    '/edit-project',
    '/client-table',
    '/client-edit',
    '/client-form',
    '/attendance-table',
    '/attendance-form',
    '/leave',
    '/leave-table',
    '/leave-edit',
    '/task-form',
    '/task-edit',
    '/lead-form',
    '/lead-table',
    '/lead-edit',
    '/adjustment-form',
    '/adjustment-table',
    '/adjustment-edit',
    '/payments-form',
    '/payments-table',
    '/payments-edit',
    '/expense-form',
    '/expense-table',
    '/expense-edit',
    '/mom',
    '/momdetails',
    '/mom-edit',
    '/payroll-table',
    '/payroll-form',
    '/quotation-form',
    '/quotation-table',
    '/quotation-edit',
    '/search-leads',
    '/search-results'
  ];

  const isValidPath = (path) => {
    if (role === "employee") {
      return employeeRoutes.some(route => path.startsWith(route));
    } else {
      return adminRoutes.some(route => path.startsWith(route));
    }
  };

  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route
          path="/*"
          element={
            role === "employee" ? (
              !isValidPath(location.pathname) ? (
                <Navigate to="/login" replace />
              ) : (
                <AdminLayout loading={loading}>
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/attendance-table" element={<AttendanceTable />} />
                    <Route path="/attendance-form" element={<EmployeeAttendance />} />
                    <Route path="/leave-table" element={<LeaveTable />} />
                    <Route path="/leave" element={<Leave />} />
                    <Route path="/leave-edit/:id" element={<LeaveEdit />} />
                    <Route path="/task" element={<TaskList />} />
                    <Route path="/task-form" element={<TaskForm />} />
                    <Route path="/task-edit/:taskId" element={<TaskEdit />} />
                    <Route path="/project" element={<ProjectManager />} />
                    <Route path="/add-project" element={<ProjectForm />} />
                    <Route path="/edit-project/:projectId" element={<ProjectEdit />} />
                    <Route path="/mom" element={<MoM />} />
                    <Route path="/momdetails" element={<BlogPage />} />
                    <Route path="/mom-edit/:id" element={<MoMEdit />} />
                    <Route path="/search-results" element={<SearchResults />} />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                  </Routes>
                </AdminLayout>
              )
            ) : (
              !isValidPath(location.pathname) ? (
                <Navigate to="/login" replace />
              ) : (
                <AdminLayout loading={loading}>
                  <Routes>
                    <Route path="/admin" element={<AdminForm />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/employee-table" element={<EmployeeTable />} />
                    <Route path="/employee-form" element={<Employee />} />
                    <Route path="/employee-edit/:id" element={<EmployeeEdit />} />
                    <Route path="/task" element={<TaskList />} />
                    <Route path="/project" element={<ProjectManager />} />
                    <Route path="/add-project" element={<ProjectForm />} />
                    <Route path="/edit-project/:projectId" element={<ProjectEdit />} />
                    <Route path="/client-table" element={<ClientTable />} />
                    <Route path="/client-edit/:id" element={<ClientEdit />} />
                    <Route path="/client-form" element={<Client />} />
                    <Route path="/attendance-table" element={<AttendanceTable />} />
                    <Route path="/attendance-form" element={<EmployeeAttendance />} />
                    <Route path="/leave" element={<Leave />} />
                    <Route path="/leave-table" element={<LeaveTable />} />
                    <Route path="/leave-edit/:id" element={<LeaveEdit />} />
                    <Route path="/task-form" element={<TaskForm />} />
                    <Route path="/task-edit/:taskId" element={<TaskEdit />} />
                    <Route path="/lead-form" element={<LeadForm />} />
                    <Route path="/lead-table" element={<LeadTable />} />
                    <Route path="/lead-edit/:id" element={<LeadEdit />} />
                    <Route path="/search-leads" element={<SearchLeads/>} />
                    <Route path="/adjustment-form" element={<Adjustment />} />
                    <Route path="/adjustment-table" element={<AdjustmentTable />} />
                    <Route path="/adjustment-edit/:id" element={<AdjustmentEdit />} />
                    <Route path="/payments-form" element={<Payments />} />
                    <Route path="/payments-table" element={<PaymentTable />} />
                    <Route path="/payments-edit/:id" element={<PaymentEdit />} />
                    <Route path="/expense-form" element={<Expenses />} />
                    <Route path="/expense-table" element={<ExpenseTable />} />
                    <Route path="/expense-edit/:id" element={<ExpensesEdit />} />
                    <Route path="/mom" element={<MoM />} />
                    <Route path="/momdetails" element={<BlogPage />} />
                    <Route path="/mom-edit/:id" element={<MoMEdit />} />
                    <Route path="/payroll-table" element={<PayrollEmployee />} />
                    <Route path="/payroll-form/:id" element={<PayrollForm />} />
                    <Route path="/quotation-form" element={<QuotationForm />} />
                    <Route path="/quotation-table" element={<QuotationTable />} />
                    <Route path="/quotation-edit/:id" element={<QuotationEdit />} />
                    <Route path="/search-results" element={<SearchResults />} />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                  </Routes>
                </AdminLayout>
              )
            )
          }
        />
      </Routes>
    </>
  );
};

export default App;