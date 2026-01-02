import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Client() {
  const [client, setClient] = useState({
    organization: "",
    contactPerson: "",
    contactNumber: "",
    alternateContact: "",
    emailId: "",
    alternateMailId: "",
    businessCategory: "",
    officeLocation: {
      addressLine: "",
      area: "",
      city: "",
      state: "",
      pincode: "",
      landmark: "",
    },
    registeredAddress: {
      addressLine: "",
      area: "",
      city: "",
      state: "",
      pincode: "",
      landmark: "",
    },
    status: "",
  });
  const navigate = useNavigate();
  const [isAddressSame, setIsAddressSame] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes("officeLocation") || name.includes("registeredAddress")) {
      const [field, subfield] = name.split(".");
      setClient((prev) => ({
        ...prev,
        [field]: {
          ...prev[field],
          [subfield]: value,
        },
      }));
    } else {
      setClient((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckboxChange = () => {
    setIsAddressSame((prev) => {
      if (!prev) {
        setClient((prevClient) => ({
          ...prevClient,
          registeredAddress: { ...prevClient.officeLocation },
        }));
      } else {
        setClient((prevClient) => ({
          ...prevClient,
          registeredAddress: {
            addressLine: "",
            area: "",
            city: "",
            state: "",
            pincode: "",
            landmark: "",
          },
        }));
      }
      return !prev;
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await axios.post('https://sensitivetechcrm.onrender.com/clients/create', client);
      console.log('Response Status:', response.status); 
      console.log('Response Data:', response.data);
  
      if (response.status === 201) {
        alert('Client data submitted successfully!');
        setClient({
          organization: "",
          contactPerson: "",
          contactNumber: "",
          alternateContact: "",
          emailId: "",
          alternateMailId: "",
          businessCategory: "",
          officeLocation: {
            addressLine: "",
            area: "",
            city: "",
            state: "",
            pincode: "",
            landmark: "",
          },
          registeredAddress: {
            addressLine: "",
            area: "",
            city: "",
            state: "",
            pincode: "",
            landmark: "",
          },
          status: "",
        });
        navigate("/client-table");
      } else {
        console.error('Unexpected response status:', response.status);
        alert('There was an issue with the submission.');
      }
    } catch (error) {
      console.error('Error submitting data:', error);
      alert('There was an error submitting the data');
    }
  };
  
  return (
    <div className="container mx-auto p-6 mt-12">
      <h2 className="text-4xl font-bold mb-10 text-center mt-20">Client Form</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
        <div className="border border-blue-500 p-6 rounded-lg">
          <div className="space-y-8 pb-4">
            <div>
              <label className="block text-sm font-medium pb-4">Organization:</label>
              <input
                type="text"
                name="organization"
                value={client.organization}
                onChange={handleChange}
                required
                className="border border-blue-300 p-2 w-full rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium pb-4">Contact Person:</label>
              <input
                type="text"
                name="contactPerson"
                value={client.contactPerson}
                onChange={handleChange}
                required
                className="border border-blue-300 p-2 w-full rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium pb-4">Contact Number:</label>
              <input
                type="tel"
                name="contactNumber"
                value={client.contactNumber}
                onChange={handleChange}
                required
                className="border border-blue-300 p-2 w-full rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium pb-4">Alternate Contact:</label>
              <input
                type="tel"
                name="alternateContact"
                value={client.alternateContact}
                onChange={handleChange}
                required
                className="border border-blue-300 p-2 w-full rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium pb-4">Email ID:</label>
              <input
                type="email"
                name="emailId"
                value={client.emailId}
                onChange={handleChange}
                required
                className="border border-blue-300 p-2 w-full rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium pb-4">Alternate Email ID:</label>
              <input
                type="email"
                name="alternateMailId"
                value={client.alternateMailId}
                onChange={handleChange}
                required
                className="border border-blue-300 p-2 w-full rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium pb-4">Business Category:</label>
              <input
                type="text"
                name="businessCategory"
                value={client.businessCategory}
                onChange={handleChange}
                required
                className="border border-blue-300 p-2 w-full rounded"
              />
            </div>
          </div>
        </div>
        <div className="border border-blue-500 p-6 rounded-lg">
          <div className="space-y-8 pb-4">
            <div>
              <label className="block text-sm font-medium pb-4">Office Location:</label>
              <input
                type="text"
                name="officeLocation.addressLine"
                value={client.officeLocation.addressLine}
                onChange={handleChange}
                required
                className="border border-blue-300 p-2 mb-2 w-full rounded"
                placeholder="Address Line"
              />
              <input
                type="text"
                name="officeLocation.area"
                value={client.officeLocation.area}
                onChange={handleChange}
                required
                className="border border-blue-300 p-2 mb-2 w-full rounded"
                placeholder="Area"
              />
              <input
                type="text"
                name="officeLocation.city"
                value={client.officeLocation.city}
                onChange={handleChange}
                required
                className="border border-blue-300 p-2 mb-2 w-full rounded"
                placeholder="City"
              />
              <input
                type="text"
                name="officeLocation.state"
                value={client.officeLocation.state}
                onChange={handleChange}
                required
                className="border border-blue-300 p-2 mb-2 w-full rounded"
                placeholder="State"
              />
              <input
                type="text"
                name="officeLocation.pincode"
                value={client.officeLocation.pincode}
                onChange={handleChange}
                required
                className="border border-blue-300 p-2 mb-2 w-full rounded"
                placeholder="Pincode"
              />
              <input
                type="text"
                name="officeLocation.landmark"
                value={client.officeLocation.landmark}
                onChange={handleChange}
                required
                className="border border-blue-300 p-2 w-full rounded"
                placeholder="Landmark"
              />
            </div>
            <div>
            <label className="block text-sm font-medium pb-4">Registered Address:</label>
              <input
                type="checkbox"
                checked={isAddressSame}
                onChange={handleCheckboxChange}
                className="mb-4"
              /> Office Location is same as Registered Address
             <input
                type="text"
                name="registeredAddress.addressLine"
                value={client.registeredAddress.addressLine}
                onChange={handleChange}
                required
                className="border border-blue-300 p-2 mb-2 w-full rounded"
                placeholder="Address Line"
                disabled={isAddressSame}
              />
               <input
                type="text"
                name="registeredAddress.area"
                value={client.registeredAddress.area}
                onChange={handleChange}
                required
                className="border border-blue-300 p-2 mb-2 w-full rounded"
                placeholder="Area"
                disabled={isAddressSame}
              />
              <input
                type="text"
                name="registeredAddress.city"
                value={client.registeredAddress.city}
                onChange={handleChange}
                required
                className="border border-blue-300 p-2 mb-2 w-full rounded"
                placeholder="City"
                disabled={isAddressSame}
              />
              <input
                type="text"
                name="registeredAddress.state"
                value={client.registeredAddress.state}
                onChange={handleChange}
                required
                className="border border-blue-300 p-2 mb-2 w-full rounded"
                placeholder="State"
                disabled={isAddressSame}
              />
              <input
                type="text"
                name="registeredAddress.pincode"
                value={client.registeredAddress.pincode}
                onChange={handleChange}
                required
                className="border border-blue-300 p-2 mb-2 w-full rounded"
                placeholder="Pincode"
                disabled={isAddressSame}
              />
              <input
                type="text"
                name="registeredAddress.landmark"
                value={client.registeredAddress.landmark}
                onChange={handleChange}
                required
                className="border border-blue-300 p-2 w-full rounded"
                placeholder="Landmark"
                disabled={isAddressSame}
              />
            </div>

            <div className="flex justify-center mt-6">
              <button
                type="submit"
                className="bg-blue-500 text-white font-bold py-2 px-4 rounded"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default Client;
