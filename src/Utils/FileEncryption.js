// Frontend API functions for file encryption service

/**
 * Upload and encrypt a file
 * @param {File} file - The file to encrypt
 * @param {string} password - Password for encryption
 * @param {function} onProgress - Progress callback function
 * @returns {Promise} Promise resolving to the encryption result
 */
export async function encryptFile(file, password, onProgress) {
  // Set up Socket.io connection for tracking progress
  const socket = io(process.env.REACT_APP_API_URL || "http://localhost:5000");

  return new Promise((resolve, reject) => {
    socket.on("connect", () => {
      console.log("Connected to server with socket ID:", socket.id);

      // Set up progress tracking
      socket.on("encryption-progress", (data) => {
        if (onProgress && typeof onProgress === "function") {
          onProgress(data.percent);
        }
      });

      // Create form data for file upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("password", password);
      formData.append("socketId", socket.id);

      // Make API request to encrypt the file
      fetch(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:5000"
        }/fileencrypt/api/encrypt`,
        {
          method: "POST",
          body: formData,
        }
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              `Server responded with ${response.status}: ${response.statusText}`
            );
          }
          return response.json();
        })
        .then((data) => {
          socket.disconnect();
          resolve(data);
        })
        .catch((error) => {
          socket.disconnect();
          reject(error);
        });
    });

    // Handle socket connection errors
    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      reject(
        new Error("Failed to establish socket connection for progress tracking")
      );
    });
  });
}

/**
 * Download an encrypted file
 * @param {string} fileId - The ID of the encrypted file to download
 * @returns {Promise} Promise resolving when download starts
 */
export function downloadEncryptedFile(fileId) {
  return new Promise((resolve, reject) => {
    // Create a hidden anchor to trigger file download
    const downloadUrl = `${
      process.env.REACT_APP_API_URL || "http://localhost:5000"
    }/fileencrypt/api/download/${fileId}`;

    // For triggering the browser's download functionality
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.setAttribute("download", ""); // Let the server set the filename
    document.body.appendChild(link);

    // Start download by simulating click
    link.click();

    // Clean up
    setTimeout(() => {
      document.body.removeChild(link);
      resolve();
    }, 100);
  });
}

/**
 * Check if a file is still available (not expired)
 * @param {string} fileId - The ID of the encrypted file to check
 * @returns {Promise<boolean>} Promise resolving to true if file exists
 */
export async function checkFileAvailability(fileId) {
  try {
    const response = await fetch(
      `${
        process.env.REACT_APP_API_URL || "http://localhost:5000"
      }/fileencrypt/api/download/${fileId}`,
      {
        method: "HEAD",
      }
    );

    return response.ok;
  } catch (error) {
    console.error("Error checking file availability:", error);
    return false;
  }
}
