import { NextRequest, NextResponse } from "next/server";
import { storage } from "@server/storage";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    const user = await storage.getUserByEmail(email);
    
    if (!user) {
      // Devolvemos success para evitar fuga de información de e-mails registrados
      return NextResponse.json({ message: "Si el correo existe, se enviarán las instrucciones." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000); // 1 hora
    
    await storage.updateUser(user.id, { 
      resetPasswordToken: resetToken, 
      resetPasswordExpires: expires 
    });

    // TODO: AQUI INTEGRAR UN SERVICIO DE MAILS POSTERIORMENTE (ej. Resend, SendGrid)
    console.log(`[DEV ENVIAR EMAIL LOG] - Reset Token para ${email}: ${resetToken}`);

    return NextResponse.json({ message: "Si el correo existe, se enviarán las instrucciones." });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
