import React, { useState, useEffect } from "react";
import {
  getTotalEmployees,
  getTotalProjects,
  getProjectsByEmployee,
  getTasks,
  getClients,
  getLeave,
  getTotalLeads,
  getTotalPayrolls,
  getTodayPresentCount,
  getMyMonthlyAttendance,
  getMonthlyLeaveByEmpId,
  getTodayLeaves,
  getMyTasks
} from "../../api/services/projectServices";

export default function Dashboard() {
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [attendance, setAttendance] = useState(0); // today
  const [monthlyAttendance, setMonthlyAttendance] = useState(0); // current employee monthly
  const [totalProjects, setTotalProjects] = useState(0);
  const [tasks, setTasks] = useState(0);
  const [myTaskCount, setMyTaskCount] = useState(0);
  const [clients, setClients] = useState(0);
  const [leave, setLeave] = useState(0);
  const [monthlyLeave, setMonthlyLeave] = useState(0);
  const [todayLeave, setTodayLeave] = useState(0);
  const [totalLeads, setTotalLeads] = useState(0);
  const [totalPayrolls, setTotalPayrolls] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const role = localStorage.getItem("role"); // "Superadmin" | "employee"
  const empId = localStorage.getItem("empId");

  useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);

      // Today attendance (Superadmin)
if (role === "Superadmin") {

  const projRes = await getTotalProjects();
  if (projRes.status === 200) {
    setTotalProjects(projRes.data.TotalProjects);
  }

  const todayRes = await getTodayPresentCount();
  if (todayRes.status === 200) setAttendance(todayRes.data.presentToday);

  // Today leave for Superadmin
  const todayLeaveRes = await getTodayLeaves();
  if (todayLeaveRes.status === 200) setTodayLeave(todayLeaveRes.data.length);
}

// Monthly attendance, leave & tasks for employee
if (role === "employee") {
  const stid = localStorage.getItem("stid"); // employee ID

  if (stid) {
    // Monthly attendance
    const monthRes = await getMyMonthlyAttendance(stid);
    if (monthRes?.status === 200) {
      setMonthlyAttendance(monthRes.data.totalAttendance || 0);
    }

    // Monthly leave
    const leaveRes = await getMonthlyLeaveByEmpId(stid);
    if (leaveRes?.status === 200) {
      setMonthlyLeave(leaveRes.data.length || 0);
    }

    // Employee task count
    const taskRes = await getMyTasks(stid);
    if (taskRes?.status === 200) {setMyTaskCount(taskRes.data.totalTasks || 0);  
    }

    // ✅ Get assigned projects count for employee
    // const projRes = await getProjectsByEmployee(stid);
    // if (projRes?.status === 200 && projRes.data.success) {
    //   setTotalProjects(projRes.data.count);
    // } else {
    //   setTotalProjects(0);
    // }

    
  }
}

      // Other API calls (Superadmin)
      const [
        empRes,
        projRes,
        taskRes,
        clientRes,
        totalLeaveRes,
        leadsRes,
        payrollRes,
      ] = await Promise.all([
        getTotalEmployees(),
        getTotalProjects(),
        getTasks(),
        getClients(),
        getLeave(),
        getTotalLeads(),
        getTotalPayrolls(),
      ]);

      if (empRes.status === 200) setTotalEmployees(empRes.data.TotalEmployee);
      if (projRes.status === 200) setTotalProjects(projRes.data.TotalProjects);
      if (taskRes.status === 200) setTasks(taskRes.data.TotalTasks);
      if (clientRes.status === 200) setClients(clientRes.data.TotalClients);
      if (totalLeaveRes.status === 200) setLeave(totalLeaveRes.data.TotalLeaveRequests);
      if (leadsRes.status === 200) setTotalLeads(leadsRes.data.TotalLeads);
      if (payrollRes.status === 200) setTotalPayrolls(payrollRes.data.TotalPayrolls);

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [role, empId]);


  const cardsData = [
    { title: "Total Employee", value: totalEmployees, visible: role === "Superadmin", iconColor: "green" },
    { title: "Employees Present", value: attendance, visible: role === "Superadmin", iconColor: "blue" },
    { title: "Monthly Attendance", value: monthlyAttendance, visible: role === "employee", iconColor: "teal" },
    { title: "Total Projects", value: totalProjects, iconColor: "red" },
    { title: "Tasks", value: role === "employee" ? myTaskCount : tasks, iconColor: "yellow" },
    { title: "Clients", value: clients, visible: role === "Superadmin", iconColor: "orange" },
    { title: "Leave", value: role === "employee" ? monthlyLeave : todayLeave, iconColor: "purple",},
    { title: "Total Leads", value: totalLeads, iconColor: "brown" },
    { title: "Total Payrolls", value: totalPayrolls, iconColor: "pink" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-32 px-28">
      {cardsData
        .filter(card => card.visible !== false)
        .map((card, index) => (
          <Card
            key={index}
            title={card.title}
            value={card.value}
            loading={loading}
            error={error}
            iconColor={card.iconColor}
            icon={iconMap[card.title]}
          />
        ))}
    </div>
  );
}

/* ===================== CARD COMPONENT ===================== */
const Card = ({ title, value, loading, error, iconColor, icon }) => {
  const colorMap = {
    green: "bg-green-500",
    blue: "bg-blue-500",
    orange: "bg-orange-500",
    purple: "bg-purple-500",
    pink: "bg-pink-500",
    red: "bg-red-500",
    yellow: "bg-yellow-500",
    brown: "bg-amber-600",
    teal: "bg-teal-500",
  };

  return (
    <div className="bg-white rounded-xl shadow-2xl p-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-gray-800">{title}</h3>
          {loading ? (
            <p className="text-2xl mt-4">Loading...</p>
          ) : error ? (
            <p className="text-2xl text-red-500 mt-4">{error}</p>
          ) : (
            <p className="text-2xl font-bold mt-4">{value}</p>
          )}
        </div>
        <div
          className={`p-5 ${
            colorMap[iconColor]
          } rounded-full shadow-lg transition-all duration-300 hover:scale-125 hover:-translate-y-1 hover:rotate-[360deg]`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

/* ===================== ICONS ===================== */
const iconMap = {
  "Total Employee": (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
  ),
  "Employees Present": (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 2a1 1 0 0 0-1 1v1H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1V3a1 1 0 1 0-2 0v1H7V3a1 1 0 0 0-1-1H6zM4 8h16v12H4V8zm6 8.59L8.41 15 7 16.41l3 3 7-7-1.41-1.41L10 16.59z" />
    </svg>
  ),
  "Monthly Attendance": (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3h-1V1h-2v2H8V1H6v2H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM5 21V8h14v13H5zm2-9h5v5H7v-5z" />
    </svg>
  ),
  "Total Projects": (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 3h18v18H3V3zm4 4v2h10V7H7zm0 4v2h10v-2H7zm0 4v2h10v-2H7z" />
    </svg>
  ),
  Tasks: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 2a1 1 0 0 0-1 1v1H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-3V3a1 1 0 0 0-1-1H9zm0 2h6v1H9V4zm-4 5h6v2H5V9zm0 4h6v2H5v-2zm8-4h6v2h-6V9zm0 4h6v2h-6v-2z" />
    </svg>
  ),
  Clients: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 14c-2.21 0-4 1.79-4 4v1h8v-1c0-2.21-1.79-4-4-4zm0-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-8 2c-2.21 0-4 1.79-4 4v1h8v-1c0-2.21-1.79-4-4-4zm0-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
    </svg>
  ),
  Leave: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3h-2V2H7v1H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM7 3h10V2H7v1zM5 19V8h14v11H5zm12-5h-3v-2h3v2zm0-4h-3V8h3v2z" />
    </svg>
  ),
  "Total Leads": (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 16C9.79 16 8 14.21 8 12C8 9.79 9.79 8 12 8C14.21 8 16 9.79 16 12C16 14.21 14.21 16 12 16ZM12 4C13.1 4 14 4.9 14 6H10C10 4.9 10.9 4 12 4ZM6 18V6H18V18H6Z" />
    </svg>
  ),
  "Total Payrolls": (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 6H21C21.5523 6 22 6.44772 22 7V17C22 17.5523 21.5523 18 21 18H3C2.44772 18 2 17.5523 2 17V7C2 6.44772 2.44772 6 3 6ZM3 7V9H21V7H3ZM3 15V13H21V15H3ZM3 17H21C21.5523 17 22 17.4477 22 18H2C2 17.4477 2.44772 17 3 17Z" />
    </svg>
  ),
};
