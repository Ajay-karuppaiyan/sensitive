import React, { useState } from 'react';
import axios from 'axios';
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

const EmployeeForm = () => {
  const navigate = useNavigate(); 
  const [isLoading, setIsLoading] = useState(false);
  const [isPermanentAddressSame, setIsPermanentAddressSame] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    role: '',
    empType: '',
    workMode: '',
    shiftType: '',
    salary: '',
    empId: '',
    name: '',
    gender: '',
    dob: '',
    email: '',
    officeEmail: '',
    alternateEmail: '',
    contactNumber: '',
    alternateContact: '',
    department: '',
    designation: '',
    idProofType: '',
    idProofNumber: '',
    idProofFile: null,
    qualification: '',
    expertise: '',
    experience: '',
    resume: null,
    doj: '',
    maritalStatus: '',
    presentAddress: {
      addressLine: '',
      area: '',
      city: '',
      state: '',
      pincode: '',
      landmark: ''
    },
    permanentAddress: {
      addressLine: '',
      area: '',
      city: '',
      state: '',
      pincode: '',
      landmark: ''
    },
    addressProofType: '',
    addressProofNumber: '',
    addressProofFile: null,
    password: '',
    profileImage: null,
    shiftStartTime: '',
    shiftEndTime: '',
    status: 'Active'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === 'profileImage') {
      const file = files[0];
      setFormData((prevData) => ({
        ...prevData,
        [name]: file
      }));
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setProfileImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setProfileImagePreview(null);
      }
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: files[0]
      }));
    }
  };

  const handleAddressChange = (e, type) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [type]: {
        ...prevData[type],
        [name]: value
      }
    }));
  };


  const fetchAddressDetails = async (pincode, addressType) => {
    if (!/^[1-9][0-9]{5}$/.test(pincode)) {
      alert('Please enter a valid 6-digit pincode.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.get(`https://sensitivetechcrm.onrender.com/getaddressbypincode/${pincode}`);
      console.log('API Response:', response.data);

      if (response.data.success && response.data.address) {
        const { area, city, state } = response.data.address;
        setFormData((prevData) => ({
          ...prevData,
          [addressType]: {
            ...prevData[addressType],
            area: area || '',
            city: city || '',
            state: state || ''
          }
        }));
      } else {
        alert('Invalid Pincode or API Error!');
      }
    } catch (error) {
      console.error('Error fetching address details:', error.response ? error.response.data : error.message);
      alert('Failed to fetch address details. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };


  const handlePincodeChange = (e, addressType) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [addressType]: {
        ...prevData[addressType],
        [name]: value,
      },
    }));
    if (value.length === 6) fetchAddressDetails(value, addressType);
  };

  const handlePermanentAddressToggle = (e) => {
    setIsPermanentAddressSame(e.target.checked);
    if (e.target.checked) {
      setFormData((prevData) => ({
        ...prevData,
        permanentAddress: { ...prevData.presentAddress }
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        permanentAddress: {
          addressLine: '',
          area: '',
          city: '',
          state: '',
          pincode: '',
          landmark: ''
        }
      }));
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSubmit = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'presentAddress' || key === 'permanentAddress') {
        Object.keys(formData[key]).forEach(addressKey => {
          formDataToSubmit.append(`${key}[${addressKey}]`, formData[key][addressKey]);
        });
      } else if (formData[key] instanceof File) {
        formDataToSubmit.append(key, formData[key]);
      } else {
        formDataToSubmit.append(key, formData[key]);
      }
    });

    try {
      const response = await axios.post(
        "https://sensitivetechcrm.onrender.com/createemployee",
        formDataToSubmit,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      console.log("Response:", response.data);
      alert("Form submitted successfully!");
      navigate("/employee-table");
      localStorage.setItem("empName", formData.name);
      localStorage.setItem("empEmail", formData.email);
      localStorage.setItem("empPassword", formData.password);
      localStorage.setItem("role", formData.role);

    } catch (error) {
      console.error("Error:", error.response ? error.response.data : error);
      alert(`Failed to submit the form: ${error.response ? error.response.data.error : 'Unknown error'}`);
    }
  };

  return (
    <div className="container mx-auto p-6 mt-20">
      <h2 className="text-4xl font-bold mb-8 text-center">Employee Form</h2>
      <div className="border border-gray-300 p-6 rounded-lg shadow-lg">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block font-semibold">Emp ID</label>
              <input
                type="text"
                name="empId"
                value={formData.empId}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block font-semibold">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block font-semibold">Gender</label>
              <div className="flex items-center">
                <label className="mr-4">
                  <input
                    type="radio"
                    name="gender"
                    value="Male"
                    checked={formData.gender === 'Male'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Male
                </label>
                <label className="mr-4">
                  <input
                    type="radio"
                    name="gender"
                    value="Female"
                    checked={formData.gender === 'Female'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Female
                </label>
                <label>
                  <input
                    type="radio"
                    name="gender"
                    value="Other"
                    checked={formData.gender === 'Other'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Other
                </label>
              </div>
            </div>

            <div>
              <label className="block font-semibold">DOB</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block font-semibold">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block font-semibold">Office Email</label>
              <input
                type="email"
                name="officeEmail"
                value={formData.officeEmail}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block font-semibold">Alternate Email</label>
              <input
                type="email"
                name="alternateEmail"
                value={formData.alternateEmail}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block font-semibold">Contact Number</label>
              <input
                type="text"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block font-semibold">Alternate Contact</label>
              <input
                type="text"
                name="alternateContact"
                value={formData.alternateContact}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block font-semibold">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
                required
              >
                <option value="">Select Role</option>
                <option value="employee">Employee</option>
                <option value="Superadmin">Superadmin</option>
                <option value="Lead">Lead</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold">Salary</label>
              <input
                type="text"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block font-semibold">Department</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block font-semibold">Employee Type</label>
              <select
                name="empType"
                value={formData.empType}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
                required
              >
                <option value="">Select Employee Type</option>
                <option value="Permanent">Permanent</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold">Work Mode</label>
              <select
                name="workMode"
                value={formData.workMode}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
                required
              >
                <option value="">Select Work Mode</option>
                <option value="Office">Office</option>
                <option value="Work From Home">Work From Home</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold">Shift Type</label>
              <select
                name="shiftType"
                value={formData.shiftType}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
                required
              >
                <option value="">Select Shift Type</option>
                <option value="FullTime">Full Time</option>
                <option value="PartTime">Part Time</option>
                <option value="HourlyBasis">Hourly Basis</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold">Designation</label>
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block font-semibold">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
                required
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold">ID Proof Type</label>
              <select
                name="idProofType"
                value={formData.idProofType}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
              >
                <option value="">Select ID Proof Type</option>
                <option value="Aadhar Card">Aadhar Card</option>
                <option value="PAN Card">PAN Card</option>
                <option value="Passport">Passport</option>
                <option value="Driving License">Driving License</option>
                <option value="Ration Card">Ration Card</option>
                <option value="Voter ID">Voter ID</option>
                <option value="Others">Others</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold">ID Proof Number</label>
              <input
                type="text"
                name="idProofNumber"
                value={formData.idProofNumber}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block font-semibold">Upload ID Proof</label>
              <input
                type="file"
                name="idProofFile"
                onChange={handleFileChange}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
            <div className="mb-6">
              <label className="block font-semibold mb-2">Profile Image</label>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  name="profileImage"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 border rounded-md"
                />
                {profileImagePreview && (
                  <div className="w-24 h-24 rounded-full overflow-hidden">
                    <img
                      src={profileImagePreview}
                      alt="Profile Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block font-semibold">Qualification</label>
              <input
                type="text"
                name="qualification"
                value={formData.qualification}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block font-semibold">Expertise In</label>
              <input
                type="text"
                name="expertise"
                value={formData.expertise}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block font-semibold">Experience</label>
              <input
                type="text"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block font-semibold">Upload Resume</label>
              <input
                type="file"
                name="resume"
                onChange={handleFileChange}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block font-semibold">DOJ</label>
              <input
                type="date"
                name="doj"
                value={formData.doj}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block font-semibold">Marital Status</label>
              <select
                name="maritalStatus"
                value={formData.maritalStatus}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
                required
              >
                <option value="">Select Status</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
              </select>
            </div>

            <div className="col-span-3">
              <label className="block font-semibold ">Shift Time</label>
              <div className="border border-gray-300 p-4 rounded-md mt-2 w-1/2">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <label className="block">Shift Time</label>
                    <div className="flex space-x-2">
                      <input
                        type="time"
                        name="shiftStartTime"
                        value={formData.shiftStartTime}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-md"
                        required
                      />
                      <span className="self-center">to</span>
                      <input
                        type="time"
                        name="shiftEndTime"
                        value={formData.shiftEndTime}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-md"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isPermanentAddressSame}
                  onChange={handlePermanentAddressToggle}
                  className="mr-2"
                />
                Permanent address is same as present address
              </label>
            </div>

            <div>
              <label className="block font-semibold">Present Address</label>
              <input
                type="text"
                name="addressLine"
                value={formData.presentAddress.addressLine}
                onChange={(e) => handleAddressChange(e, 'presentAddress')}
                className="w-full px-4 py-2 border rounded-md"
                placeholder="Address Line"
              />
              <input
                type="text"
                name="area"
                value={formData.presentAddress.area}
                onChange={(e) => handleAddressChange(e, 'presentAddress')}
                className="w-full px-4 py-2 border rounded-md"
                placeholder="Area"
              />
              <input
                type="text"
                name="city"
                value={formData.presentAddress.city}
                onChange={(e) => handleAddressChange(e, 'presentAddress')}
                className="w-full px-4 py-2 border rounded-md"
                placeholder="City"
                readOnly
              />
              <input
                type="text"
                name="state"
                value={formData.presentAddress.state}
                onChange={(e) => handleAddressChange(e, 'presentAddress')}
                className="w-full px-4 py-2 border rounded-md"
                placeholder="State"
                readOnly
              />
              <input
                type="text"
                name="pincode"
                value={formData.presentAddress.pincode}
                onChange={(e) => handlePincodeChange(e, 'presentAddress')}
                className="w-full px-4 py-2 border rounded-md"
                placeholder="Pincode"
              />
              <input
                type="text"
                name="landmark"
                value={formData.presentAddress.landmark}
                onChange={(e) => handleAddressChange(e, 'presentAddress')}
                className="w-full px-4 py-2 border rounded-md"
                placeholder="Landmark"
              />
            </div>

            <div>
              <label className="block font-semibold">Permanent Address</label>
              <input
                type="text"
                name="addressLine"
                value={formData.permanentAddress.addressLine}
                onChange={(e) => handleAddressChange(e, 'permanentAddress')}
                className="w-full px-4 py-2 border rounded-md"
                placeholder="Address Line"
                disabled={isPermanentAddressSame}
              />
              <input
                type="text"
                name="area"
                value={formData.permanentAddress.area}
                onChange={(e) => handleAddressChange(e, 'permanentAddress')}
                className="w-full px-4 py-2 border rounded-md"
                placeholder="Area"
                disabled={isPermanentAddressSame}
              />
              <input
                type="text"
                name="city"
                value={formData.permanentAddress.city}
                onChange={(e) => handleAddressChange(e, 'permanentAddress')}
                className="w-full px-4 py-2 border rounded-md"
                placeholder="City"
                readOnly
                disabled={isPermanentAddressSame}
              />
              <input
                type="text"
                name="state"
                value={formData.permanentAddress.state}
                onChange={(e) => handleAddressChange(e, 'permanentAddress')}
                className="w-full px-4 py-2 border rounded-md"
                placeholder="State"
                readOnly
                disabled={isPermanentAddressSame}
              />
              <input
                type="text"
                name="pincode"
                value={formData.permanentAddress.pincode}
                onChange={(e) => handlePincodeChange(e, 'permanentAddress')}
                className="w-full px-4 py-2 border rounded-md"
                placeholder="Pincode"
                disabled={isPermanentAddressSame}
              />
              <input
                type="text"
                name="landmark"
                value={formData.permanentAddress.landmark}
                onChange={(e) => handleAddressChange(e, 'permanentAddress')}
                className="w-full px-4 py-2 border rounded-md"
                placeholder="Landmark"
                disabled={isPermanentAddressSame}
              />
            </div>

            <div>
              <label className="block font-semibold">Address Proof Type</label>
              <select
                name="addressProofType"
                value={formData.addressProofType}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
              >
                <option value="">Select Address Proof Type</option>
                <option value="Aadhar Card">Aadhar Card</option>
                <option value="PAN Card">PAN Card</option>
                <option value="Passport">Passport</option>
                <option value="Driving License">Driving License</option>
                <option value="Ration Card">Ration Card</option>
                <option value="Utility Bill">Utility Bill</option>
                <option value="Voter ID">Voter ID</option>
                <option value="Others">Others</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold">Address Proof Number</label>
              <input
                type="text"
                name="addressProofNumber"
                value={formData.addressProofNumber}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block font-semibold">Upload Address Proof</label>
              <input
                type="file"
                name="addressProofFile"
                onChange={handleFileChange}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-md"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-3 text-gray-500"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="col-span-3 flex justify-center">
              <button type="submit" className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-md">Submit</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeForm;