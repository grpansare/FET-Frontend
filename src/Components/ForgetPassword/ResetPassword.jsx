import React, { useState } from "react";
import axios from "axios";
import "./ResetPassword.css";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const location = useLocation();
  const { email, token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate password and confirm password
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    try {
      // Send request to the backend to update the password
      const response = await axios.post(
        `https://fet-backend.onrender.com/user/resetpassword/${token}`,
        {
          password,
        }
      );
      setSuccess(response.data.message || "Password changed successfully!");
      navigate("/");
    } catch (err) {
      console.log(err);
      setError(
        err.response && err.response.data.message
          ? err.response.data.message
          : "Something went wrong!"
      );
    }
  };

  return (
    <div className="change-password-container ">
      <h2 className="text-center text-2xl font-mono font-bol text-blue-500 mb-4">
        {" "}
        Password Reset{" "}
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="password">New Password</label>
          <input
            type="password"
            id="password"
            placeholder="Enter your new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            placeholder="Confirm your new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn-submit">
          Update Password
        </button>
      </form>
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}
    </div>
  );
};

export default ResetPassword;
