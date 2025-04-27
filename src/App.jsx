import React from "react";
import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ForgetPassword from "./Components/ForgetPassword/ForgetPassword";
import ResetPassword from "./Components/ForgetPassword/ResetPassword";
import LoginPage from "./Pages/loginpage/LoginPage";
import RegistrationForm from "./Pages/Register/Registration";
import Filecrypto from "./Pages/Encryption/Filecrypto";
import PasswordToggle from "./Components/ForgetPassword/PasswordToggle/PasswordToggle";
import Dashboard from "./Pages/Dashboard/Dashboard";
import DecryptionForm from "./Components/InputKeyPassword/InputKeyPassword";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/forget-password" element={<ForgetPassword />} />
        <Route path="/" element={<LoginPage />} />
        <Route path="/Register" element={<RegistrationForm />} />

        <Route path="/dashboard" element={<Dashboard />} >
        <Route path="" element={<Filecrypto />} />
        <Route path="decryption" element={<DecryptionForm/>}></Route>
        </Route>

       

        <Route path="/password-toggle" element={<PasswordToggle />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
