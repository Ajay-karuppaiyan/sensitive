// import React, { useState, useEffect } from 'react';

// const DispositionForm = ({ dispositionId }) => {
//     const [formData, setFormData] = useState({
//         disposition: '',
//         notes: ''
//     });

//     const [isUpdating, setIsUpdating] = useState(false); // To track if we are updating

//     // Dropdown values for disposition
//     const dispositionOptions = [
//         'No requirements', 
//         'Callback', 
//         'Busy', 
//         'Disconnected', 
//         'RNR / Voicemail', 
//         'Not interested', 
//         'Request Quote', 
//         'Quotation Sent', 
//         'Follow up', 
//         'Invalid Number', 
//         'Taken outside', 
//         'Requirement on hold', 
//         'Escalated', 
//         'Schedule Meeting', 
//         'Deal Closed', 
//         'Others'
//     ];

//     // Fetch data for updating (if `dispositionId` is passed)
//     useEffect(() => {
//         if (dispositionId) {
//             setIsUpdating(true);
//             fetchDispositionById(dispositionId);
//         }
//     }, [dispositionId]);

//     const fetchDispositionById = async (id) => {
//         try {
//             const response = await fetch(`/api/disposition/${id}`);
//             if (response.ok) {
//                 const data = await response.json();
//                 setFormData({
//                     disposition: data.disposition,
//                     notes: data.notes
//                 });
//             } else {
//                 console.error('Disposition not found');
//             }
//         } catch (error) {
//             console.error('Error fetching disposition:', error);
//         }
//     };

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData((prevData) => ({
//             ...prevData,
//             [name]: value
//         }));
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
        
//         const method = isUpdating ? 'PUT' : 'POST';
//         const url = isUpdating ? `/api/disposition/${dispositionId}` : '/api/disposition';
        
//         try {
//             const response = await fetch(url, {
//                 method,
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify(formData)
//             });

//             const data = await response.json();
//             if (response.ok) {
//                 console.log('Form Data Submitted:', data);
//                 // Reset form or show success message
//                 setFormData({ disposition: '', notes: '' });
//             } else {
//                 console.error('Error submitting form:', data.message);
//             }
//         } catch (error) {
//             console.error('Error:', error);
//         }
//     };

//     return (
//         <div className="container mx-auto p-6">
//             <h2 className="text-4xl font-bold mb-10 text-center mt-24">
//                 {isUpdating ? 'Update' : 'Create'} Disposition
//             </h2>

//             <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded-lg">
//                 {/* Disposition Dropdown */}
//                 <div className="mb-4">
//                     <label htmlFor="disposition" className="block text-lg font-semibold mb-2">Disposition</label>
//                     <select
//                         id="disposition"
//                         name="disposition"
//                         value={formData.disposition}
//                         onChange={handleChange}
//                         className="border border-blue-500 p-3 w-full rounded"
//                     >
//                         <option value="">Select Disposition</option>
//                         {dispositionOptions.map((option, index) => (
//                             <option key={index} value={option}>{option}</option>
//                         ))}
//                     </select>
//                 </div>

//                 {/* Notes Textarea */}
//                 <div className="mb-4">
//                     <label htmlFor="notes" className="block text-lg font-semibold mb-2">Notes</label>
//                     <textarea
//                         id="notes"
//                         name="notes"
//                         value={formData.notes}
//                         onChange={handleChange}
//                         className="border border-blue-500 p-3 w-full rounded"
//                         rows="4"
//                         placeholder="Enter notes here..."
//                     />
//                 </div>

//                 {/* Submit Button */}
//                 <div className="mb-4">
//                     <button
//                         type="submit"
//                         className="bg-blue-500 text-white px-6 py-2 rounded-full w-full hover:bg-blue-600"
//                     >
//                         {isUpdating ? 'Update' : 'Submit'}
//                     </button>
//                 </div>
//             </form>
//         </div>
//     );
// };

// export default DispositionForm;
// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { useParams } from "react-router-dom";

// function LeadEdit() {
//   const { id } = useParams();
//   console.log(id);

//   const [lead, setLead] = useState({
//     name: "",
//     contact: "",
//     email: "",
//     requirements: "",
//     company: "",
//     location: "",
//     links: "",
//     comments: "",
//     status: "",
//   });

//   // Fetch lead data when component mounts or ID changes
//   useEffect(() => {
//     if (!id) return;

//     const fetchLeadData = async () => {
//       try {
//         const response = await axios.get(https://sensitivetechcrm.onrender.com/leads/getlead/${id});
//         console.log(response);
//         if (response.status === 200) {
//           setLead(response.data);
//         } else {
//           console.error("Failed to fetch lead details:", response.status);
//         }
//       } catch (error) {
//         console.error("Error fetching lead details:", error);
//       }
//     };

//     fetchLeadData();
//   }, [id]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setLead((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       const response = id
//         ? await axios.put(https://sensitivetechcrm.onrender.com/leads/update/${id}, lead)
//         : await axios.post(https://sensitivetechcrm.onrender.com/leads/create, lead);

//       if (response.status === 200 || response.status === 201) {
//         alert("Lead data submitted successfully!");
//         setLead({
//           name: "",
//           contact: "",
//           email: "",
//           requirements: "",
//           company: "",
//           location: "",
//           links: "",
//           comments: "",
//           status: "",
//         });
//       } else {
//         alert(Error: ${response.statusText});
//       }
//     } catch (error) {
//       console.error("Error submitting lead data:", error);
//       alert(Submission failed: ${error.message});
//     }
//   };

//   return (
//     <div className="container mx-auto p-6 mt-12">
//       <h2 className="text-4xl font-bold mb-10 text-center mt-20">Edit Lead Details</h2>
//       <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
//         {/* First Column */}
//         <div className="border border-blue-500 p-6 rounded-lg">
//           <div className="space-y-8 pb-4">
//             <div>
//               <label className="block text-sm font-medium pb-4">Name:</label>
//               <input
//                 type="text"
//                 name="name"
//                 value={lead.name}
//                 onChange={handleChange}
//                 required
//                 className="border border-blue-300 p-2 w-full rounded"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium pb-4">Contact:</label>
//               <input
//                 type="tel"
//                 name="contact"
//                 value={lead.contact}
//                 onChange={handleChange}
//                 required
//                 className="border border-blue-300 p-2 w-full rounded"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium pb-4">Email:</label>
//               <input
//                 type="email"
//                 name="email"
//                 value={lead.email}
//                 onChange={handleChange}
//                 required
//                 className="border border-blue-300 p-2 w-full rounded"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium pb-4">Company:</label>
//               <input
//                 type="text"
//                 name="company"
//                 value={lead.company}
//                 onChange={handleChange}
//                 required
//                 className="border border-blue-300 p-2 w-full rounded"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium pb-4">Location:</label>
//               <input
//                 type="text"
//                 name="location"
//                 value={lead.location}
//                 onChange={handleChange}
//                 className="border border-blue-300 p-2 w-full rounded"
//               />
//             </div>
//           </div>
//         </div>

//         {/* Second Column */}
//         <div className="border border-blue-500 p-6 rounded-lg">
//           <div className="space-y-8 pb-4">
//             <div>
//               <label className="block text-sm font-medium pb-4">Requirements:</label>
//               <textarea
//                 name="requirements"
//                 value={lead.requirements}
//                 onChange={handleChange}
//                 required
//                 className="border border-blue-300 p-2 w-full rounded h-24"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium pb-4">Links:</label>
//               <input
//                 type="text"
//                 name="links"
//                 value={lead.links}
//                 onChange={handleChange}
//                 className="border border-blue-300 p-2 w-full rounded"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium pb-4">Comments:</label>
//               <textarea
//                 name="comments"
//                 value={lead.comments}
//                 onChange={handleChange}
//                 className="border border-blue-300 p-2 w-full rounded h-24"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium pb-4">Status:</label>
//               <select
//                 name="status"
//                 value={lead.status}
//                 onChange={handleChange}
//                 required
//                 className="border border-blue-300 p-2 w-full rounded"
//               >
//                 <option value="">Select Status</option>
//                 <option value="new">New</option>
//                 <option value="in-progress">In Progress</option>
//                 <option value="qualified">Qualified</option>
//                 <option value="unqualified">Unqualified</option>
//                 <option value="converted">Converted</option>
//               </select>
//             </div>
//             <div className="flex justify-center mt-6">
//               <button
//                 type="submit"
//                 className="bg-blue-500 text-white font-bold py-2 px-4 rounded"
//               >
//                 Submit
//               </button>
//             </div>
//           </div>
//         </div>
//       </form>
//     </div>
//   );
// }

// export default LeadEdit;
