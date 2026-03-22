// Aquí creamos una pantalla simple que el App Router renderizará
import { useState } from "react";
import { Link, useLocation } from "wouter";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [needs2FA, setNeeds2FA] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [errorMsg, setError] = useState("");
  const [, setLocation] = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    
    if (res.status === 403 && data.requires2FA) {
      setNeeds2FA(true);
    } else if (res.ok) {
      setLocation("/space");
    } else {
      setError(data.error || "Datos incorrectos.");
    }
  };

  const handle2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/auth/verify-2fa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, token: otpCode }),
    });
    
    if (res.ok) {
      setLocation("/space");
    } else {
      setError("Código 2FA inválido.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-zinc-900">
      <div className="bg-white dark:bg-zinc-800 p-8 rounded-lg shadow-lg w-full max-w-sm">
        <h1 className="text-2xl font-semibold mb-6 text-center text-zinc-800 dark:text-zinc-100">
          Entrar a Traibox
        </h1>
        
        {errorMsg && <p className="text-red-500 text-sm text-center mb-4">{errorMsg}</p>}

        {!needs2FA ? (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input 
              type="email" 
              placeholder="Correo" 
              className="border p-2 focus:ring-primary rounded dark:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-100" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required
            />
            <input 
              type="password" 
              placeholder="Contraseña" 
              className="border p-2 focus:ring-primary rounded dark:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-100" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required
            />
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium p-2 rounded transition-colors mt-2">
              Iniciar Sesión
            </button>
            
            <div className="flex items-center justify-between mt-2 text-sm text-blue-500">
              <Link href="/forgot-password" className="hover:underline">Olvidé mi contraseña</Link>
            </div>
          </form>
        ) : (
          <form onSubmit={handle2FA} className="flex flex-col gap-4">
            <p className="text-sm dark:text-zinc-300">Ingresa tu código de autenticación (2FA):</p>
            <input 
              type="text" 
              maxLength={6}
              placeholder="Ej: 123456" 
              className="border p-2 text-center tracking-widest text-lg rounded focus:ring-primary dark:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-100" 
              value={otpCode} 
              onChange={e => setOtpCode(e.target.value)} 
            />
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white p-2 rounded transition-colors mt-2 font-medium">
              Verificar
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
          ¿No tienes una cuenta?{' '}
          <Link href="/signup" className="text-blue-500 hover:underline font-medium">
            Regístrate
          </Link>
        </div>
      </div>
    </div>
  );
}
