import React from 'react';

export default function ProfileModal({ userProfile, onClose }) {
  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
        <h2 className="text-xl font-bold text-blue-600 mb-4">Profile Details</h2>
        <p><strong>Name:</strong> {userProfile.name}</p>
        <p><strong>Email:</strong> {userProfile.email}</p>
        <p><strong>Position:</strong> {userProfile.position}</p>
        <div className="flex justify-end mt-4">
          <button 
            onClick={onClose} 
            className="bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
