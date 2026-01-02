import React, { useState, useRef, useEffect } from 'react';
import { Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; 

const EmployeeAttendance = () => {
  const navigate = useNavigate();
  const employeeId = localStorage.getItem("empId");
  const [photo, setPhoto] = useState(null);
  const [attendanceDetails] = useState({
    employeeId: "",
    employeeName: "",
    date: new Date().toLocaleDateString('en-GB'),
    status: "Present",
    logintime: "",
  });
  const [submittedData, setSubmittedData] = useState(null);
  const [cameraState, setCameraState] = useState({
    isActive: false,
    isLoading: false,
    error: null
  });
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject = null;
    }
    
    setCameraState(prev => ({
      ...prev,
      isActive: false,
      isLoading: false
    }));
  };

  const initializeCamera = async () => {
    if (cameraState.isLoading || cameraState.isActive || !isMounted) return;
    if (!videoRef.current) {
      console.error("Video element not available");
      setCameraState({
        isActive: false,
        isLoading: false,
        error: "Camera not ready. Please try again."
      });
      return;
    }
    
    setCameraState({
      isActive: false,
      isLoading: true,
      error: null
    });
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await new Promise((resolve) => {
          videoRef.current.onloadedmetadata = resolve;
        });
        
        setCameraState({
          isActive: true,
          isLoading: false,
          error: null
        });
      }
    } catch (error) {
      console.error("Camera initialization error:", error);
      stopCamera();
      setCameraState({
        isActive: false,
        isLoading: false,
        error: error.message || "Failed to access camera"
      });
    }
  };
  useEffect(() => {
    if (isMounted && !photo && !submittedData) {
      initializeCamera();
    }
  }, [isMounted, photo, submittedData]);
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopCamera();
      } else if (isMounted && !photo && !submittedData && !cameraState.isActive && !cameraState.isLoading) {
        initializeCamera();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isMounted, photo, submittedData, cameraState.isActive, cameraState.isLoading]);
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current && cameraState.isActive) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      const width = 320;
      const height = 240;
      
      canvas.width = width;
      canvas.height = height;
      context.drawImage(videoRef.current, 0, 0, width, height);
      const dataURL = canvas.toDataURL("image/jpeg", 0.7); 
      setPhoto(dataURL);
      stopCamera();
    }
  };

  const recapturePhoto = () => {
    setPhoto(null);
    initializeCamera();
  };

  const handleSubmit = async () => {
    if (!photo) {
      alert("Please capture a photo before submitting.");
      return;
    }
    
    setIsSubmitting(true);
  
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0];
    const formattedTime = currentDate.toLocaleTimeString();
  
    const submissionData = {
      photo,
      employeeId: employeeId || "Unknown", 
      employeeName: attendanceDetails.employeeName || "Unknown", 
      date: formattedDate, 
      status: "Present", 
      logintime: formattedTime,
    };
  
    try {
      const response = await fetch("https://sensitivetechcrm.onrender.com/attendance/create", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        mode: 'cors', 
        credentials: 'same-origin', 
        body: JSON.stringify(submissionData),
      });
  
      if (response.ok) {
        const result = await response.json();
        alert("Attendance submitted successfully!");
        setSubmittedData(result.attendance);
        setTimeout(() => {
          navigate('/attendance-table');
        }, 1500);
      } else {
        const errorText = await response.text();
        let errorMessage;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || "Unknown server error";
        } catch (e) {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        alert(`Failed to submit attendance: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Error submitting attendance:", error);
      alert("Error submitting attendance. Please try again or contact support.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 mt-20">
      <h2 className="text-4xl font-bold mb-6">Employee Attendance</h2>

      {!submittedData && (
        <div>
          <div className="flex justify-center mb-6 space-x-4">
            {!photo && cameraState.isActive && (
              <button
                onClick={capturePhoto}
                className="bg-blue-500 text-white p-4 rounded-full flex items-center justify-center"
              >
                <Camera className="mr-2" size={20} />
                Capture Photo
              </button>
            )}
            {photo && (
              <button
                onClick={recapturePhoto}
                className="bg-yellow-500 text-white p-4 rounded-full flex items-center justify-center"
              >
                <Camera className="mr-2" size={20} />
                Recapture
              </button>
            )}
            
            {(cameraState.error || cameraState.isLoading) && (
              <button
                onClick={initializeCamera}
                className="bg-red-500 text-white p-4 rounded-full flex items-center justify-center"
              >
                {cameraState.error ? "Retry Camera" : "Initializing..."}
              </button>
            )}
          </div>

          {cameraState.error && (
            <div className="text-center p-4 text-red-500">
              <p>Camera Error: {cameraState.error}</p>
            </div>
          )}

          <div className="flex justify-center">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline
              muted
              className={`fullscreen-video ${!cameraState.isActive ? 'hidden' : ''}`}
            ></video>
          </div>
          
          {cameraState.isLoading && (
            <div className="text-center p-4">
              <p>Initializing camera...</p>
            </div>
          )}
          
          <canvas ref={canvasRef} className="hidden"></canvas>
          
          {photo && (
            <div className="flex justify-center mt-6">
              <img src={photo} alt="Captured" className="w-64 h-64 rounded-full object-cover shadow-lg" />
            </div>
          )}
          
          {photo && (
            <div className="flex justify-center mt-6">
              <button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className={`${isSubmitting ? 'bg-gray-400' : 'bg-green-500'} text-white p-4 rounded-md`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Details'}
              </button>
            </div>
          )}
        </div>
      )}

      {submittedData && (
        <div className="mt-6 p-6 border rounded-md">
          <h3 className="text-2xl font-semibold">Submitted Attendance Details</h3>
          <div className="flex justify-center mt-6">
            <img
              src={submittedData.photo}
              alt="Captured"
              className="w-64 h-64 rounded-full object-cover shadow-lg"
            />
          </div>
          <ul className="mt-4">
            <li><strong>Employee ID:</strong> {submittedData.employeeId}</li>
            <li><strong>Name:</strong> {submittedData.employeeName}</li>
            <li><strong>Date:</strong> {submittedData.date}</li>
            <li><strong>Status:</strong> {submittedData.status}</li>
            <li><strong>Login Time:</strong> {submittedData.logintime}</li>
          </ul>
          <div className="flex justify-center mt-6">
            {/* <button 
              onClick={() => navigate('/attendance-table')}
              className="bg-blue-500 text-white p-4 rounded-md"
            >
              View Attendance Table
            </button> */}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeAttendance;