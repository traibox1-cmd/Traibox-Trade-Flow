import { useState } from "react";
import { Link, useLocation } from "wouter";

export default function ResetPasswordPage({ token }: { token?: string }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError("Las contraseñas no coinciden");
    }
    
    // Si wouter no pasa el token via props, asume que está en query param: ?token=xxx
    const searchParams = new URLSearchParams(window.location.search);
    const resetToken = token || searchParams.get("token");

    if (!resetToken) {
      return setError("Token en enlace de recuperación es inválido");
    }

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: resetToken, newPassword: password }),
    });

    const data = await res.json();
    if (res.ok) {
      setMessage("¡Contraseña restablecida correctamente!");
      setTimeout(() => setLocation("/login"), 3000);
    } else {
      setError(data.error || "Error reseteando tu contraseña");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-zinc-900 px-4">
      <div className="bg-white dark:bg-zinc-800 p-8 rounded-lg shadow-lg w-full max-w-sm">
        <h1 className="text-xl font-bold mb-4 text-center dark:text-zinc-100">Restablecer Contraseña</h1>
        
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {message ? (
          <div className="text-green-600 mb-4 text-center">
            {message} <br/><br/>
            Redirigiendo al Login...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input 
              type="password" 
              placeholder="Nueva Contraseña" 
              className="border p-2 focus:ring-primary rounded dark:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-100" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required
            />
            <input 
              type="password" 
              placeholder="Confirmar Contraseña" 
              className="border p-2 focus:ring-primary rounded dark:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-100" 
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)} 
              required
            />
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium p-2 rounded transition-colors mt-2">
              Actualizar Contraseña
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
