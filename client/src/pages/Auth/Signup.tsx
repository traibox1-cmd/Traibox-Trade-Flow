import { useState } from "react";
import { Link, useLocation } from "wouter";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    companyName: "",
    email: "",
    password: "",
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup-quick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok) {
        // Redirige al dashboard tal como indica la API o a /space
        setLocation(data.redirectTo || "/space");
      } else {
        // Formatear error de validación si existe
        if (data.details) {
          const firstError = Object.values(data.details)[0];
          setErrorMsg(Array.isArray(firstError) ? firstError[0] : "Revisa los campos del formulario.");
        } else {
          setErrorMsg(data.error || "Error al crear la cuenta.");
        }
      }
    } catch (err) {
      setErrorMsg("Error de conexión al servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-zinc-900 px-4 py-8">
      <div className="bg-white dark:bg-zinc-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-6 text-center text-zinc-800 dark:text-zinc-100">
          Crea tu cuenta en Traibox
        </h1>
        
        {errorMsg && <p className="text-red-500 text-sm text-center mb-4 bg-red-50 dark:bg-red-900/20 p-2 rounded">{errorMsg}</p>}

        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <div className="flex gap-4">
            <input 
              type="text" 
              name="firstName"
              placeholder="Nombre" 
              className="w-full border p-2 focus:ring-primary rounded dark:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-100" 
              value={formData.firstName} 
              onChange={handleChange} 
              required
            />
            <input 
              type="text" 
              name="lastName"
              placeholder="Apellido" 
              className="w-full border p-2 focus:ring-primary rounded dark:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-100" 
              value={formData.lastName} 
              onChange={handleChange} 
              required
            />
          </div>
          
          <input 
            type="text" 
            name="companyName"
            placeholder="Nombre de la Empresa (Opcional)" 
            className="border p-2 focus:ring-primary rounded dark:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-100" 
            value={formData.companyName} 
            onChange={handleChange} 
          />

          <input 
            type="email" 
            name="email"
            placeholder="Correo electrónico" 
            className="border p-2 focus:ring-primary rounded dark:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-100" 
            value={formData.email} 
            onChange={handleChange} 
            required
          />

          <input 
            type="password" 
            name="password"
            placeholder="Contraseña (mín. 8 caracteres)" 
            className="border p-2 focus:ring-primary rounded dark:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-100" 
            value={formData.password} 
            onChange={handleChange} 
            required
            minLength={8}
          />

          <button 
            type="submit" 
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium p-2 rounded transition-colors mt-2"
          >
            {loading ? "Creando cuenta..." : "Registrarse"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-blue-500 hover:underline font-medium">
            Inicia sesión aquí
          </Link>
        </div>
      </div>
    </div>
  );
}
