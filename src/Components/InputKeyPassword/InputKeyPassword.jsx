
import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Upload, Download, Settings, Menu, X, Shield, HelpCircle, User, Key, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';


export default function DecryptionForm() {
  const [inputMethod, setInputMethod] = useState("password"); // 'password' or 'key'
  const [password, setPassword] = useState("");
  const [key, setKey] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordValid, setPasswordValid] = useState(null);
  const [derivedKey, setDerivedKey] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // Handle FET-61: Validate input
  useEffect(() => {
    if (password === "") {
      setPasswordValid(null);
      return;
    }

    setPasswordValid(password.length >= 8);

    // Handle FET-62: Derive key from password if selected
    if (inputMethod === "password" && password.length >= 8) {
      // This is a simplified mock of key derivation
      // In a real app, you'd use a proper key derivation function like PBKDF2
      deriveKeyFromPassword(password);
    }
  }, [password, inputMethod]);

  // Mock function to derive key from password
  const deriveKeyFromPassword = (pwd) => {
    // Simulate key derivation (in real app use a proper key derivation function)
    setTimeout(() => {
      // This is just for demonstration - not actual key derivation
      const mockDerivedKey = Array.from(pwd)
        .map((char) => char.charCodeAt(0).toString(16))
        .join("");

      setDerivedKey(mockDerivedKey);
    }, 100);
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDecrypt = (e) => {
    e.preventDefault();
    // Decryption logic would go here
    console.log(
      "Decrypting with:",
      inputMethod === "password" ? derivedKey : key
    );
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 mt-8">
      <h2 className="text-2xl font-bold mb-6 text-slate-800 flex items-center">
        <Unlock className="mr-2 text-blue-500" /> File Decryption
      </h2>

      <form onSubmit={handleDecrypt}>
        {/* FET-60: Provide option to paste key or enter password */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Decryption Method
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="inputMethod"
                checked={inputMethod === "password"}
                onChange={() => setInputMethod("password")}
                className="mr-2"
              />
              <span>Use Password</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="inputMethod"
                checked={inputMethod === "key"}
                onChange={() => setInputMethod("key")}
                className="mr-2"
              />
              <span>Paste Key</span>
            </label>
          </div>
        </div>

        {/* Password Input */}
        {inputMethod === "password" && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 
                    ${
                      passwordValid === false
                        ? "border-red-500 focus:ring-red-200"
                        : passwordValid === true
                        ? "border-green-500 focus:ring-green-200"
                        : "border-slate-300 focus:ring-blue-200"
                    }`}
                placeholder="Enter password (min 8 characters)"
              />
              <button
                type="button"
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Password validation message */}
            {passwordValid === false && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertCircle size={16} className="mr-1" />
                Password must be at least 8 characters
              </p>
            )}

            {passwordValid === true && (
              <p className="mt-2 text-sm text-green-600 flex items-center">
                <CheckCircle size={16} className="mr-1" />
                Password meets requirements
              </p>
            )}

            {/* Display derived key (FET-62) */}
            {derivedKey && (
              <div className="mt-3 p-2 bg-slate-50 border border-slate-200 rounded">
                <p className="text-xs text-slate-500">Derived Key:</p>
                <p className="text-sm font-mono break-all">{derivedKey}</p>
              </div>
            )}
          </div>
        )}

        {/* Key Input */}
        {inputMethod === "key" && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <div className="flex items-center">
                <Key size={16} className="mr-1" />
                <span>Decryption Key</span>
              </div>
            </label>
            <textarea
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 font-mono"
              placeholder="Paste your decryption key"
              rows={3}
            />
          </div>
        )}

        {/* File Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Select Encrypted File
          </label>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col w-full h-32 border-2 border-dashed border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all cursor-pointer">
              <div className="flex flex-col items-center justify-center pt-7">
                <Upload className="w-8 h-8 text-slate-400" />
                <p className="pt-1 text-sm text-slate-400">
                  {selectedFile
                    ? selectedFile.name
                    : "Drag & drop encrypted file or click to select"}
                </p>
                {selectedFile && (
                  <p className="text-xs text-slate-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                )}
              </div>
              <input
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>
        </div>

        {/* Decrypt Button */}
        <button
          type="submit"
          className={`w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md font-medium flex items-center justify-center
              ${
                (!passwordValid && inputMethod === "password") ||
                (!key && inputMethod === "key") ||
                !selectedFile
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
          disabled={
            (!passwordValid && inputMethod === "password") ||
            (!key && inputMethod === "key") ||
            !selectedFile
          }
        >
          <Unlock className="mr-2" size={18} />
          Decrypt File
        </button>
      </form>
    </div>
  );
}
