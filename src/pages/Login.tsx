import React from "react";
import { useNavigate } from "react-router-dom";
import LoginScreen from "../components/LoginScreen";

export default function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate(-1); // Voltar para onde o usuário estava
  };

  const handleClose = () => {
    navigate("/"); // Ir para a home se cancelar
  };

  return (
    <div className="min-h-screen bg-black">
      <LoginScreen onLogin={handleLogin} onClose={handleClose} />
    </div>
  );
}
