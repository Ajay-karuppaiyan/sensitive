import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../../assets/logo light.png";
import { sendOTP, verifyOTP } from "../../api/services/projectServices";
import { AlertCircle, Loader, Copy, Check } from "lucide-react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [displayOtp, setDisplayOtp] = useState(""); // Store OTP from backend
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.sessionExpired) {
      setError("Your session has expired. Please login again.");
    }

    localStorage.removeItem("empId");
    localStorage.removeItem("role");
    localStorage.removeItem("tokenExpiration");
  }, [location.state]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Auto-hide OTP display after 60 seconds
  useEffect(() => {
    if (displayOtp) {
      const timer = setTimeout(() => {
        setDisplayOtp("");
      }, 60000); // Hide after 60 seconds
      return () => clearTimeout(timer);
    }
  }, [displayOtp]);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (error) setError("");
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
    if (error) setError("");
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setDisplayOtp(""); // Clear previous OTP

    try {
      const response = await sendOTP({ email });

      if (response.status === 200) {
        setOtpSent(true);
        setCountdown(60);

        // Extract OTP from backend response
        // Adjust this based on your actual API response structure
        if (response.data.otp) {
          setDisplayOtp(response.data.otp);
        }
      }
    } catch (error) {
      console.error("OTP Send Error:", error);
      if (error.response) {
        if (error.response.status === 404) {
          setError("Email not found. Please check your email address.");
        } else {
          setError("Failed to send OTP. Please try again later.");
        }
      } else {
        setError("Network error. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
    const response = await verifyOTP({ email, otp });

    if (response.status === 200) {
      const employeeData = response.data.employee || response.data.admin;

      // ❌ BLOCK INACTIVE EMPLOYEES
      if (employeeData.status === "Inactive") {
        setError("Your account is inactive. Contact admin.");
        return;
      }

      // ✅ Store info for active employees
      const { _id, role } = employeeData;
      localStorage.setItem("empId", _id);
      localStorage.setItem("role", role);

      const expirationTime = new Date().getTime() + 10 * 60 * 1000;
      localStorage.setItem("tokenExpiration", expirationTime.toString());

      const from =
        location.state?.from ||
        (role === "employee"
          ? "/attendance-form"
          : role === "Superadmin" || role === "Lead"
          ? "/dashboard"
          : "/attendance-form");

      navigate(from, { replace: true });
    }
  } catch (error) {
    console.error("OTP Verification Error:", error);
    if (error.response) {
      if (error.response.status === 401) {
        setError("Invalid OTP. Please try again.");
      } else if (error.response.status === 400) {
        setError("OTP expired. Please request a new one.");
      } else {
        setError("An unexpected error occurred. Please try again later.");
      }
    } else {
      setError("Network error. Please check your connection.");
    }
  } finally {
    setLoading(false);
  }
};


  const handleResendOTP = async () => {
    if (countdown > 0) return;

    setLoading(true);
    setError("");
    setDisplayOtp("");

    try {
      const response = await sendOTP({ email });

      if (response.status === 200) {
        setCountdown(60);

        // Extract OTP from backend response
        if (response.data.otp) {
          setDisplayOtp(response.data.otp);
        }
      }
    } catch (error) {
      console.error("Resend OTP Error:", error);
      setError("Failed to resend OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyOtp = () => {
    setOtp(displayOtp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 relative">
      <div className="w-full max-w-sm p-6 bg-blue-500 rounded-lg shadow-md">
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Logo" className="w-auto h-auto" />
        </div>

        <form
          onSubmit={otpSent ? handleVerifyOTP : handleSendOTP}
          className="space-y-4"
        >
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md">
              <div className="flex">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* OTP Display Box - Only for development */}
          {displayOtp && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-900 p-4 rounded shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold mb-1">
                    Your OTP (Dev Mode):
                  </p>
                  <p className="text-lg font-bold tracking-wider">
                    {displayOtp}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyOtp}
                  className="ml-3 p-2 bg-yellow-200 hover:bg-yellow-300 rounded transition-colors"
                  title="Copy OTP to input"
                >
                  {copied ? (
                    <Check className="h-5 w-5 text-green-600" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </button>
              </div>
              <p className="text-xs mt-2 opacity-75">
                Click the icon to auto-fill
              </p>
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block mb-2 text-sm font-medium text-white"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="Enter your email"
              className="w-full px-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 border-gray-300"
              required
              disabled={otpSent}
            />
          </div>

          {otpSent && (
            <div>
              <label
                htmlFor="otp"
                className="block mb-2 text-sm font-medium text-white"
              >
                OTP (Check your email)
              </label>
              <input
                type="text"
                id="otp"
                name="otp"
                value={otp}
                onChange={handleOtpChange}
                placeholder="Enter 6-digit OTP"
                className="w-full px-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 border-gray-300"
                required
                maxLength={6}
                pattern="\d{6}"
                title="Please enter a 6-digit OTP"
              />
              <div className="mt-2 text-right">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={countdown > 0}
                  className={`text-xs ${
                    countdown > 0
                      ? "text-gray-400"
                      : "text-white hover:underline"
                  }`}
                >
                  {countdown > 0 ? `Resend OTP in ${countdown}s` : "Resend OTP"}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-300 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <Loader className="animate-spin mr-2 h-4 w-4" />
                {otpSent ? "Verifying..." : "Sending OTP..."}
              </span>
            ) : otpSent ? (
              "Verify OTP"
            ) : (
              "Send OTP"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
