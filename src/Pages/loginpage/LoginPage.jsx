import React, { useState, useEffect } from "react";
import "./LoginPage.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const LoginPage = () => {
  const [email, setemail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // Added error message state
  const navigate = useNavigate();

  const mockUsers = [
    { id: 1, email: "user1", password: "password123" },
    { id: 2, email: "user2", password: "securepass" },
  ];

  useEffect(() => {
    document.body.classList.add("login-page");
    return () => {
      document.body.classList.remove("login-page");
    };
  }, []);

  // useEffect(() => {
  //   const storedUser = localStorage.getItem("currentUser");
  //   if (storedUser) {
  //     window.location.href = "/dashboard";
  //   }
  // }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!email.trim()) newErrors.email = "email is required";
    if (!password.trim()) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});
    setSuccessMessage("");
    setErrorMessage(""); // Clear any previous error messages

    const formData = {
      email: email,
      password: password,
    };
    console.log(formData);

    try {
      const response = await axios.post(
        "https://fet-backend.onrender.com/api/users/login",
        formData
      );
      console.log(response);
      if (response.status === 200) {
        setSuccessMessage("Login Successful");
        localStorage.setItem("currentUser", JSON.stringify(response.data));
        localStorage.setItem("token", response.data.token);
        setIsLoading(false);
        navigate("/dashboard");
      }
    } catch (error) {
      setIsLoading(false);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setErrorMessage(
          error.response.data.message ||
            "Invalid email or password. Please try again."
        );
      } else if (error.request) {
        // The request was made but no response was received
        setErrorMessage("Server not responding. Please try again later.");
      } else {
        // Something happened in setting up the request that triggered an Error
        setErrorMessage("An error occurred. Please try again.");
      }
    }
  };

  const handleForgotPassword = () => {
    navigate("/forget-password");
  };

  return (
    <div className="login-page">
      <form onSubmit={handleSubmit} className="login-form" noValidate>
        <h1 className="text-center text-2xl font-bold font-mono">
          File Encryption Tool
        </h1>
        <h2>Login</h2>

        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}

        {errorMessage && <div className="error-message">{errorMessage}</div>}

        {errors.general && (
          <div className="error-message">{errors.general}</div>
        )}

        <div className="form-group">
          <label htmlFor="email">email:</label>
          <input
            type="text"
            id="email"
            value={email}
            onChange={(e) => setemail(e.target.value)}
            className={errors.email ? "error" : ""}
            disabled={isLoading}
          />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={errors.password ? "error" : ""}
            disabled={isLoading}
          />
          {errors.password && (
            <span className="field-error">{errors.password}</span>
          )}
        </div>

        <button type="submit" className="submit-btn" disabled={isLoading}>
          {isLoading ? (
            <>
              <span className="spinner"></span>
              Authenticating...
            </>
          ) : (
            "Sign In"
          )}
        </button>

        <button
          type="button"
          onClick={handleForgotPassword}
          className="forgot-password"
          disabled={isLoading}
        >
          Forgot Password?
        </button>
        <p className="text-center">
          Don't Have An Account ?
          <Link to="/register" className="text-blue-500">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
