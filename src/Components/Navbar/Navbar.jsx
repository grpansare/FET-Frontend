import React, { useState } from "react";
import {
  Lock,
  Unlock,
  Upload,
  Download,
  Settings,
  Menu,
  X,
  Shield,
  HelpCircle,
  User,
} from "lucide-react";
import Swal from 'sweetalert2';
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate=useNavigate()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'Logout',
      text: 'Are you sure you want to logout?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10B981', // green-500
      cancelButtonColor: '#6B7280', // gray-500
      confirmButtonText: 'Yes, logout'
    }).then((result) => {
      if (result.isConfirmed) {
        // Remove token from localStorage
        localStorage.removeItem('token');
        
        Swal.fire(
          'Logged Out!',
          'You have been successfully logged out.',
          'success'
        ).then(() => {
          // Redirect to login page or refresh
        navigate("/")// Change this to your login route
        });
      }
    });
  };

  return (
    <nav className="bg-slate-800 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand Name */}
          <div className="flex items-center space-x-2">
            <Shield className="text-green-400" size={24} />
            <span className="font-bold text-lg">CryptoSafe</span>
          </div>

          {/* Desktop Navigation */}
          {/* <div className="hidden md:flex items-center space-x-6">
            <NavItem icon={<Lock size={18} />} text="Encrypt" />
            <NavItem icon={<Unlock size={18} />} text="Decrypt" />
            <NavItem icon={<Upload size={18} />} text="Upload" />
            <NavItem icon={<Download size={18} />} text="Download" />
          </div> */}

          {/* User Profile */}
          <div className="hidden md:flex items-center">
            <button 
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-slate-700 py-2 px-4 rounded-full hover:bg-slate-600 transition-colors"
            >
              <User size={18} />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={toggleMenu} className="p-2">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-slate-700 px-4 py-2">
          <div className="flex flex-col space-y-3 pb-3">
            <MobileNavItem icon={<Lock size={18} />} text="Encrypt" />
            <MobileNavItem icon={<Unlock size={18} />} text="Decrypt" />
            <MobileNavItem icon={<Upload size={18} />} text="Upload" />
            <MobileNavItem icon={<Download size={18} />} text="Download" />
            <MobileNavItem icon={<Settings size={18} />} text="Settings" />
            <MobileNavItem icon={<HelpCircle size={18} />} text="Help" />
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 py-2 hover:text-green-400 transition-colors"
            >
              <User size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

// Component for desktop navigation items
const NavItem = ({ icon, text }) => (
  <a
    href="#"
    className="flex items-center space-x-1 hover:text-green-400 transition-colors"
  >
    {icon}
    <span>{text}</span>
  </a>
);

// Component for mobile navigation items
const MobileNavItem = ({ icon, text }) => (
  <a
    href="#"
    className="flex items-center space-x-2 py-2 hover:text-green-400 transition-colors"
  >
    {icon}
    <span>{text}</span>
  </a>
);