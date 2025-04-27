import React, { useState, useRef, useEffect } from "react";
import { io } from "socket.io-client";
import "./Filecrypto.css";

const Filecrypto = () => {
  const [activeTab, setActiveTab] = useState("encrypt");
  const [encryptFile, setEncryptFile] = useState(null);
  const [decryptFile, setDecryptFile] = useState(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isAutoPassword, setIsAutoPassword] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordGenerated, setPasswordGenerated] = useState(false);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [encryptionProgress, setEncryptionProgress] = useState(0);
  const [decryptionProgress, setDecryptionProgress] = useState(0);
  const [encryptionResult, setEncryptionResult] = useState(null);
  const [decryptionResult, setDecryptionResult] = useState(null);
  const encryptFileRef = useRef(null);
  const decryptFileRef = useRef(null);
  const socketRef = useRef(null);

  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB (adjusted to match server capabilities)
  const API_URL = "http://localhost:5000"; // Updated to match your server port

  // Initialize socket connection when component mounts
  useEffect(() => {
    // Clean up socket connection when component unmounts
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const connectSocket = () => {
    if (!socketRef.current) {
      socketRef.current = io(API_URL);

      socketRef.current.on("connect", () => {
        console.log(
          "Connected to server with socket ID:",
          socketRef.current.id
        );
      });

      socketRef.current.on("encryption-progress", (data) => {
        setEncryptionProgress(data.percent);
      });

      socketRef.current.on("decryption-progress", (data) => {
        setDecryptionProgress(data.percent);
      });

      socketRef.current.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        setError("Failed to establish connection for progress tracking");
      });
    }

    return socketRef.current.id;
  };

  const handleEncryptFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setError(`File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`);
      return;
    }

    setEncryptFile(file);
    setError("");

    // Reset any previous encryption results
    setEncryptionResult(null);
  };

  const handleDecryptFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setError(`File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`);
      return;
    }

    setDecryptFile(file);
    setError("");

    // Reset any previous decryption results
    setDecryptionResult(null);
  };

  const deriveKeyFromPassword = async (password, salt = null, iterations = 100000) => {
    try {
      // Create a salt if not provided
      let saltBuffer;
      if (salt) {
        const encoder = new TextEncoder();
        saltBuffer = encoder.encode(salt);
      } else {
        saltBuffer = window.crypto.getRandomValues(new Uint8Array(16));
      }
      
      // Convert password to key material
      const encoder = new TextEncoder();
      const passwordBuffer = encoder.encode(password);
      
      // Import password as key material
      const passwordKey = await window.crypto.subtle.importKey(
        'raw',
        passwordBuffer,
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
      );
      
      // Derive the actual key using PBKDF2
      const derivedKey = await window.crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: saltBuffer,
          iterations: iterations,
          hash: 'SHA-256'
        },
        passwordKey,
        {
          name: 'AES-GCM',
          length: 256
        },
        true, // extractable
        ['encrypt', 'decrypt']
      );
      
      // Export the key to raw format
      const exportedKey = await window.crypto.subtle.exportKey('raw', derivedKey);
      
      // Include salt in the result so it can be used for decryption later
      const keyData = new Uint8Array(exportedKey.byteLength + saltBuffer.byteLength + 2);
      keyData[0] = saltBuffer.byteLength;
      keyData[1] = 0; // reserved for future use
      keyData.set(saltBuffer, 2);
      keyData.set(new Uint8Array(exportedKey), 2 + saltBuffer.byteLength);
      
      return keyData;
    } catch (error) {
      console.error('Error deriving key from password:', error);
      throw new Error('Failed to derive key from password');
    }
  };


  const handleEncryptTab=()=>{
    setActiveTab("encrypt")
    setPassword("");
    setConfirmPassword("");
    setGeneratedPassword("");
  

  }
  const handleDecryptTab=()=>{
    setActiveTab("decrypt")
    setPassword("");
    setConfirmPassword("");
    setGeneratedPassword("");
  

  }
  const generateStrongPassword = async () => {
    try {
      // Generate a random 256-bit key (32 bytes)
      const key = await window.crypto.subtle.generateKey(
        {
          name: "AES-GCM",
          length: 256,
        },
        true, // extractable
        ["encrypt", "decrypt"]
      );

      // Export the key to raw format
      const exportedKey = await window.crypto.subtle.exportKey("raw", key);

      // Convert to a format suitable for download
      const keyBuffer = new Uint8Array(exportedKey);
      return keyBuffer;
    } catch (error) {
      console.error("Error generating random key:", error);
      throw new Error("Failed to generate random key");
    }
  };

  const handleAutoGeneratePass = async () => {
    try {
      const keyBuffer = await generateStrongPassword();
      
      // Convert the Uint8Array to a base64 string for display
      const base64String = btoa(String.fromCharCode.apply(null, keyBuffer));
      
      setGeneratedPassword(base64String);
      setPassword(base64String);
      setConfirmPassword(base64String);
      setShowPassword(true);
      setPasswordGenerated(true);
    } catch (err) {
      console.log(err);
      setError("Failed to generate password: " + err.message);
    }
  };

  const handlePasswordModeChange = (mode) => {
    const isAuto = mode === "auto";
    setIsAutoPassword(isAuto);

    if (isAuto) {
      setPassword("");
      setConfirmPassword("");
      setGeneratedPassword("");
      setPasswordGenerated(false);
    } else {
      setPassword("");
      setConfirmPassword("");
      setGeneratedPassword("");
      setPasswordGenerated(false);
      setShowPassword(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPassword);
    setSuccess("Password copied to clipboard!");
    setTimeout(() => setSuccess(""), 2000);
  };

  // New function to download the key as a file
  const downloadKey = () => {
    try {
      // Create a Blob containing the password
      const blob = new Blob([generatedPassword], { type: 'text/plain' });
      
      // Create a URL for the blob
      const url = URL.createObjectURL(blob);
      
      // Create a link element to trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.download = 'encryption-key.txt';
      document.body.appendChild(link);
      
      // Trigger the download
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setSuccess("Key file downloaded successfully!");
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      setError(`Failed to download key: ${err.message}`);
    }
  };
  
  // Function to load key from file
  const handleLoadKeyFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const keyContent = event.target.result;
        setPassword(keyContent);
        setConfirmPassword(keyContent);
        setSuccess("Key loaded successfully!");
        setTimeout(() => setSuccess(""), 2000);
      } catch (err) {
        setError(`Failed to load key: ${err.message}`);
      }
    };
    reader.readAsText(file);
    
    // Reset file input for reuse
    e.target.value = "";
  };

  const handleEncrypt = async () => {
    if (!encryptFile) {
      setError("Please select a file to encrypt");
      return;
    }

    if (!isAutoPassword && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!isAutoPassword && !validatePassword(password).valid) {
      setError("Password doesn't meet requirements");
      return;
    }

    try {
      setIsEncrypting(true);
      setError("");
      setEncryptionProgress(0);

      // Connect to socket for real-time progress
      const socketId = connectSocket();

      // Create form data for API request
      const formData = new FormData();
      formData.append("file", encryptFile);
      formData.append("password", password);
      formData.append("socketId", socketId);
      const token=localStorage.getItem('token')
      // Make API request to encrypt the file
      const response = await fetch(`${API_URL}/fileencrypt/api/encrypt`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`, // Add your token here
        },
        body: formData,
      });
      

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Server responded with status ${response.status}`
        );
      }

      const result = await response.json();
      setEncryptionResult(result);
      setSuccess("File encrypted successfully!");

      // Reset file selection but keep the password
      setEncryptFile(null);
      if (encryptFileRef.current) encryptFileRef.current.value = "";
    } catch (error) {
      setError(`Encryption failed: ${error.message}`);
    } finally {
      setIsEncrypting(false);
    }
  };

  const handleDecrypt = async () => {
    if (!decryptFile) {
      setError("Please select a file to decrypt");
      return;
    }

    if (!password) {
      setError("Please enter the decryption password");
      return;
    }

    try {
      setIsDecrypting(true);
      setError("");
      setDecryptionProgress(0);
      
      // Connect to socket for real-time progress
      const socketId = connectSocket();

      // Create form data for API request
      const formData = new FormData();
      formData.append("file", decryptFile);
      formData.append("password", password);
      formData.append("socketId", socketId);

      const token=localStorage.getItem('token')
     
      // Make API request to decrypt the file
      const response = await fetch(`${API_URL}/api/decrypt`, {
        method: "POST",
        body: formData,
        headers: {
          "Authorization": `Bearer ${token}`, // Add your token here
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || errorData.message || `Server responded with status ${response.status}`
        );
      }

      const result = await response.json();
      setDecryptionResult(result);
      setSuccess("File decrypted successfully!");

      // Reset file selection but keep the password
      setDecryptFile(null);
      if (decryptFileRef.current) decryptFileRef.current.value = "";
    } catch (error) {
      setError(`Decryption failed: ${error.message}`);
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleDownloadEncrypted = async () => {
    if (!encryptionResult?.fileId) {
      setError("No encrypted file available for download");
      return;
    }

    try {
      // Create a hidden anchor to trigger file download
      const downloadUrl = `${API_URL}/fileencrypt/api/download/${encryptionResult.fileId}`;

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", ""); // Let the server set the filename
      document.body.appendChild(link);

      // Start download by simulating click
      link.click();

      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
      }, 100);
    } catch (err) {
      setError(`Download failed: ${err.message}`);
    }
  };

  const handleDownloadDecrypted = async () => {
    if (!decryptionResult?.fileId) {
      setError("No decrypted file available for download");
      return;
    }

    try {
      // Create a hidden anchor to trigger file download
      const downloadUrl = `${API_URL}/api/decrypt/download-decrypted/${decryptionResult.fileId}`;

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", ""); // Let the server set the filename
      document.body.appendChild(link);

      // Start download by simulating click
      link.click();

      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
      }, 100);
    } catch (err) {
      setError(`Download failed: ${err.message}`);
    }
  };

  // Add validation for manual password entry
  const validatePassword = (value) => {
    const hasMinLength = value.length >= 8;
    const hasNumber = /\d/.test(value);
    const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value);

    return {
      valid: hasMinLength && hasNumber && hasSpecial,
      minLength: hasMinLength,
      hasNumber: hasNumber,
      hasSpecial: hasSpecial,
    };
  };

  const validation = validatePassword(password);

  return (
    <div className="form-container">
      <div className="tabs">
        <button
          className={`tab ${activeTab === "encrypt" ? "active" : ""}`}
          onClick={handleEncryptTab}
        >
          Encryption
        </button>
        <button
          className={`tab ${activeTab === "decrypt" ? "active" : ""}`}
          onClick={handleDecryptTab}
        >
          Decryption
        </button>
      </div>

      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">{success}</div>}

      {activeTab === "encrypt" ? (
        <div className="page">
          <h2>Encrypt File</h2>

          {/* Password Mode Selector */}
          <div className="password-toggle-container">
            <div className="password-toggle-options">
              <span
                className={`toggle-option ${!isAutoPassword ? "active" : ""}`}
                onClick={() => handlePasswordModeChange("manual")}
              >
                <i className="icon-lock"></i>
                Enter Your Password
              </span>

              <span
                className={`toggle-option ${isAutoPassword ? "active" : ""}`}
                onClick={() => handlePasswordModeChange("auto")}
              >
                <i className="icon-key"></i>
                Auto-Generate Password
              </span>
            </div>
          </div>

          {!isAutoPassword ? (
            <div className="password-group">
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={password && !validation.valid ? "invalid" : ""}
                  disabled={isEncrypting}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={togglePasswordVisibility}
                  disabled={isEncrypting}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={
                    confirmPassword && password !== confirmPassword
                      ? "invalid"
                      : ""
                  }
                  disabled={isEncrypting}
                />
              </div>

              {/* Password validation feedback */}
              {password && (
                <div className="password-validation">
                  <p className={validation.minLength ? "valid" : "invalid"}>
                    {validation.minLength ? "✓" : "✗"} At least 8 characters
                  </p>
                  <p className={validation.hasNumber ? "valid" : "invalid"}>
                    {validation.hasNumber ? "✓" : "✗"} Contains at least one
                    number
                  </p>
                  <p className={validation.hasSpecial ? "valid" : "invalid"}>
                    {validation.hasSpecial ? "✓" : "✗"} Contains at least one
                    special character
                  </p>
                </div>
              )}
              
              {/* Add option to load key from file for manual mode */}
              <div className="load-key-container">
                <input
                  type="file"
                  id="keyFileInput"
                  accept=".txt"
                  onChange={handleLoadKeyFile}
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  className="load-key-btn"
                  onClick={() => document.getElementById('keyFileInput').click()}
                  disabled={isEncrypting}
                >
                  Load Key from File
                </button>
              </div>
            </div>
          ) : (
            <div className="auto-password-container">
              <button
                type="button"
                className="generate-btn"
                onClick={handleAutoGeneratePass}
                disabled={isEncrypting}
              >
                <i className="icon-key"></i>
                Generate Secure Password
              </button>

              {passwordGenerated && (
                <div className="generated-password-container">
                  <p className="generated-password-label">
                    Your generated password:
                  </p>
                  <div className="generated-password-display">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={generatedPassword}
                      readOnly
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={togglePasswordVisibility}
                      disabled={isEncrypting}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  <div className="password-actions">
                    <button
                      type="button"
                      className="regenerate-btn"
                      onClick={handleAutoGeneratePass}
                      disabled={isEncrypting}
                    >
                      Regenerate
                    </button>
                    <button
                      type="button"
                      className="copy-btn"
                      onClick={copyToClipboard}
                      disabled={isEncrypting}
                    >
                      Copy Password
                    </button>
                    {/* Add download key button */}
                    <button
                      type="button"
                      className="download-key-btn"
                      onClick={downloadKey}
                      disabled={isEncrypting}
                    >
                      Download Key File
                    </button>
                  </div>
                  <p className="password-note">
                    Make sure to save this password securely. You'll need it to
                    decrypt the file later.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="file-upload">
            <input
              type="file"
              ref={encryptFileRef}
              onChange={handleEncryptFileSelect}
              disabled={isEncrypting}
            />
            <button
              onClick={() => encryptFileRef.current?.click()}
              disabled={isEncrypting}
            >
              Browse Files
            </button>
          </div>
          {encryptFile && (
            <div className="file-info">
              <p>Selected File: {encryptFile.name}</p>
              <p>Size: {(encryptFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          )}

          {/* Progress bar for encryption */}
          {isEncrypting && (
            <div className="progress-container">
              <div
                className="progress-bar"
                style={{ width: `${encryptionProgress}%` }}
              ></div>
              <span className="progress-text">{encryptionProgress}%</span>
            </div>
          )}

          {/* Encryption result and download button */}
          {encryptionResult && (
            <div className="encryption-result">
              <h3>File Encrypted Successfully!</h3>
              <p>Original filename: {encryptionResult.originalName}</p>
              <p>Encrypted filename: {encryptionResult.encryptedName}</p>
              <p>
                Available until:{" "}
                {new Date(encryptionResult.expiresAt).toLocaleString()}
                <br />
                <small>(Files are automatically deleted after 24 hours)</small>
              </p>
              <button
                onClick={handleDownloadEncrypted}
                className="download-btn"
              >
                Download Encrypted File
              </button>
            </div>
          )}

          <button
            className="encrypt-btn"
            onClick={handleEncrypt}
            disabled={
              isEncrypting ||
              !encryptFile ||
              !password ||
              (!isAutoPassword &&
                (!validation.valid || password !== confirmPassword)) ||
              (isAutoPassword && !passwordGenerated)
            }
          >
            {isEncrypting ? "Encrypting..." : "Encrypt File"}
          </button>
        </div>
      ) : (
        <div className="page">
          <h2>Decrypt File</h2>
          <div className="password-group">
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter decryption password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isDecrypting}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={togglePasswordVisibility}
                disabled={isDecrypting}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            
            {/* Add load key file option for decryption */}
            <div className="load-key-container">
              <input
                type="file"
                id="decryptKeyFileInput"
                accept=".txt"
                onChange={handleLoadKeyFile}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                className="load-key-btn"
                onClick={() => document.getElementById('decryptKeyFileInput').click()}
                disabled={isDecrypting}
              >
                Load Key from File
              </button>
            </div>
          </div>
          
          <div className="file-upload">
            <input
              type="file"
              ref={decryptFileRef}
              onChange={handleDecryptFileSelect}
              disabled={isDecrypting}
            />
            <button
              onClick={() => decryptFileRef.current?.click()}
              disabled={isDecrypting}
            >
              Browse Encrypted Files
            </button>
          </div>
          {decryptFile && (
            <div className="file-info">
              <p>Selected File: {decryptFile.name}</p>
              <p>Size: {(decryptFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          )}

          {/* Progress bar for decryption */}
          {isDecrypting && (
            <div className="progress-container">
              <div
                className="progress-bar"
                style={{ width: `${decryptionProgress}%` }}
              ></div>
              <span className="progress-text">{decryptionProgress}%</span>
            </div>
          )}

          {/* Decryption result and download button */}
          {decryptionResult && (
            <div className="decryption-result">
              <h3>File Decrypted Successfully!</h3>
              <p>Original filename: {decryptionResult.originalName}</p>
              <p>
                Available until:{" "}
                {new Date(decryptionResult.expiresAt).toLocaleString()}
                <br />
                <small>(Decrypted files are automatically deleted after 1 hour for security)</small>
              </p>
              <button
                onClick={handleDownloadDecrypted}
                className="download-btn"
              >
                Download Decrypted File
              </button>
            </div>
          )}

          <button
            className="decrypt-btn"
            onClick={handleDecrypt}
            disabled={!decryptFile || !password || isDecrypting}
          >
            {isDecrypting ? "Decrypting..." : "Decrypt File"}
          </button>
        </div>
      )}
    </div>
  );

  function togglePasswordVisibility() {
    setShowPassword(!showPassword);
  }
};

export default Filecrypto;