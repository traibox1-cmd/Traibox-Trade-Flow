import { NextRequest, NextResponse } from "next/server";
import { storage } from "@server/storage";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json();
    
    if (!token || !newPassword) {
      return NextResponse.json({ error: "Token y nueva contraseña son requeridos" }, { status: 400 });
    }

    const user = await storage.getUserByResetToken(token);
    
    if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      return NextResponse.json({ error: "Token inválido o expirado" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await storage.updateUser(user.id, { 
      passwordHash: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null 
    });

    return NextResponse.json({ message: "Contraseña actualizada satisfactoriamente. Ahora puedes iniciar sesión con tu nueva contraseña." });
  } catch (error) {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
