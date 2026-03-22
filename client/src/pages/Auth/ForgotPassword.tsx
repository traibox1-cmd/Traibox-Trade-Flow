import { useState } from "react";
import { Link } from "wouter";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    setMessage(data.message || "Se han enviado instrucciones a tu correo.");
    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-zinc-900 px-4">
      <div className="bg-white dark:bg-zinc-800 p-8 rounded-lg shadow-lg w-full max-w-sm">
        <h1 className="text-xl font-bold mb-4 text-center dark:text-white">Recuperar Contraseña</h1>
        
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6 text-center">
          Ingresa tu correo para enviarte un enlace de recuperación.
        </p>

        {message && (
          <div className="bg-blue-50 text-blue-800 p-3 rounded mb-4 text-sm dark:bg-zinc-700 dark:text-blue-300">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input 
            type="email" 
            placeholder="Correo institucional" 
            className="border p-2 focus:ring-primary rounded dark:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-100" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required
            disabled={loading}
          />
          <button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium p-2 rounded transition-colors"
            disabled={loading}
          >
            {loading ? "Enviando..." : "Enviar Enlace"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/login" className="text-sm text-blue-500 hover:underline">
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
