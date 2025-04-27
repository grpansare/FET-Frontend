import React, { useState } from "react";
import axios from "axios";
import styles from "./ForgetPassword.module.css";
import { FiSend } from "react-icons/fi";

import {
  Box,
  Button,
  Typography,
  Modal,
  Alert,
  TextField,
} from "@mui/material";
import { ClipLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 5,
  borderRadius: "10px",
};

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setIsLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [resentLink, setResetLink] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage("Please enter registered email  address");
      return;
    }
    setMessage("");
    setError("");
    setErrorMessage("");
    setIsLoading(true);

    try {
      const response = await axios.post(
        `https://fet-backend.onrender.com/api/users/sendemail`,
        { email }
      );

      if (response.status === 200) {
        setMessage(response.data.message || "Password reset link sent.");
        setOpenModal(true);
      } else {
        setErrorMessage(response.data.message);
      }

      setIsLoading(false);
    } catch (err) {
      console.log(err);
      setIsLoading(false);
      setError(
        err.response && err.response.data
          ? err.response.data.message
          : "Something went wrong!"
      );
    }
  };

  const handleResend = async () => {
    try {
      const response = await axios.post(
        `https://fet-backend.onrender.com/user/sendemail`,
        { email }
      );
      if (response.status === 200) {
        setMessage("Password reset link resent.");
        setResetLink(true);
      }
    } catch (err) {
      console.log(err);
      setErrorMessage("Failed to resend email.");
    } finally {
      // Re-enable after 10s
    }
  };

  return (
    <>
      <div className={styles["forgot-password-container"]}>
        <h1 className="flex font-sm flex-col items-center justify-center font-bold ">
          <img src="logo.png" alt="" className="max-h-10" />
          File Encryption Tool
        </h1>
        <h1 className="font-mono">Forgot Password</h1>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "16px" }}>
            <TextField
              label="Enter Registered Email Address"
              variant="outlined"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            variant="contained"
            startIcon={!loading && <FiSend />}
          >
            {loading ? (
              <ClipLoader color="white" loading={loading} size={30} />
            ) : (
              "Send Password Reset Link"
            )}
          </Button>
        </form>
        {message && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {message}
          </Alert>
        )}
        {errorMessage && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {errorMessage}
          </Alert>
        )}
        {error && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </div>

      {/* Success Modal */}
      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="modal-title" variant="h6" component="h2" gutterBottom>
            Success
          </Typography>

          <Alert severity="success" sx={{ mb: 2 }}>
            📩 {message}. Please check your email inbox to reset your password.
          </Alert>
          {resentLink ? (
            <Alert severity="success" sx={{ mt: 2 }}>
              Password Reset Link Resent
            </Alert>
          ) : (
            <div className="fw-normal text-muted mb-2">
              Didn’t get the link?{" "}
              <button
                type="button"
                className="btn btn-link text-blue-700 fw-bold text-decoration-none p-0"
                onClick={handleResend}
              >
                Resend
              </button>
            </div>
          )}

          <Button
            onClick={() => setOpenModal(false)}
            sx={{ mt: 2 }}
            variant="contained"
            color="primary"
            fullWidth
          >
            Close
          </Button>
        </Box>
      </Modal>
    </>
  );
};

export default ForgotPassword;
