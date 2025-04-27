import { useState } from 'react';
import { Lock, Key } from 'lucide-react';

export default function PasswordToggle() {
  const [useAutoGenerate, setUseAutoGenerate] = useState(true);
  const [password, setPassword] = useState('');
  const [passwordGenerated, setPasswordGenerated] = useState(false);
  
  const generatePassword = () => {
    // Password generation logic - creates strong password with special chars, numbers, etc.
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+';
    let generatedPassword = '';
    
    // Generate 12 character password
    for (let i = 0; i < 12; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      generatedPassword += chars[randomIndex];
    }
    
    setPassword(generatedPassword);
    setPasswordGenerated(true);
    return generatedPassword;
  };
  
  const handleToggleChange = () => {
    setUseAutoGenerate(!useAutoGenerate);
    setPasswordGenerated(false);
    setPassword('');
  };
  
  const validatePassword = (value) => {
    // Basic password validation - at least 8 chars, includes number and special char
    const hasMinLength = value.length >= 8;
    const hasNumber = /\d/.test(value);
    const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value);
    
    return {
      valid: hasMinLength && hasNumber && hasSpecial,
      minLength: hasMinLength,
      hasNumber: hasNumber,
      hasSpecial: hasSpecial
    };
  };
  
  const validation = validatePassword(password);
  
  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Password Setup</h2>
      
      {/* Toggle Switch */}
      <div className="flex items-center justify-between mb-6 p-3 bg-gray-100 rounded-lg">
        <div className="flex gap-3">
          <span className={`cursor-pointer px-3 py-2 rounded-md flex items-center gap-2 ${useAutoGenerate ? 'bg-blue-500 text-white' : 'text-gray-700'}`} 
                onClick={() => setUseAutoGenerate(true)}>
            <Key size={16} />
            <span>Auto-generate key</span>
          </span>
          
          <span className={`cursor-pointer px-3 py-2 rounded-md flex items-center gap-2 ${!useAutoGenerate ? 'bg-blue-500 text-white' : 'text-gray-700'}`}
                onClick={() => setUseAutoGenerate(false)}>
            <Lock size={16} />
            <span>Enter your password</span>
          </span>
        </div>
      </div>
      
      {/* Auto-generate key option */}
      {useAutoGenerate && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <button 
              onClick={generatePassword}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md flex items-center gap-2">
              <Key size={16} />
              Generate Secure Key
            </button>
          </div>
          
          {passwordGenerated && (
            <div className="mt-3">
              <p className="text-gray-700 mb-2">Your generated password:</p>
              <div className="bg-gray-100 p-3 rounded-md font-mono break-all">
                {password}
              </div>
              <p className="text-green-600 text-sm mt-2">✓ Strong, secure key generated</p>
            </div>
          )}
        </div>
      )}
      
      {/* Manual password entry option */}
      {!useAutoGenerate && (
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Enter your password</label>
          <input 
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full p-2 border rounded-md ${password && !validation.valid ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Enter at least 8 characters"
          />
          
          {/* Password validation feedback */}
          {password && (
            <div className="mt-2 text-sm">
              <p className={validation.minLength ? 'text-green-600' : 'text-red-500'}>
                {validation.minLength ? '✓' : '✗'} At least 8 characters
              </p>
              <p className={validation.hasNumber ? 'text-green-600' : 'text-red-500'}>
                {validation.hasNumber ? '✓' : '✗'} Contains at least one number
              </p>
              <p className={validation.hasSpecial ? 'text-green-600' : 'text-red-500'}>
                {validation.hasSpecial ? '✓' : '✗'} Contains at least one special character
              </p>
            </div>
          )}
        </div>
      )}
      
      <button 
        className={`w-full py-2 px-4 rounded-md text-white ${(useAutoGenerate && passwordGenerated) || (!useAutoGenerate && validation.valid) ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400 cursor-not-allowed'}`}
        disabled={!(useAutoGenerate && passwordGenerated) && !(!useAutoGenerate && validation.valid)}
      >
        Continue
      </button>
    </div>
  );
}