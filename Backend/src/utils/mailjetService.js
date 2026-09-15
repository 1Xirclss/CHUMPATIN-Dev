import Mailjet from "node-mailjet";
import nodemailer from "nodemailer";
import { config } from "../../config.js";

let mailjetClient = null;

if (config.mailjet.apiKey && config.mailjet.secretKey && !config.mailjet.apiKey.startsWith("tu_") && !config.mailjet.apiKey.startsWith("demo")) {
  mailjetClient = new Mailjet({
    apiKey: config.mailjet.apiKey,
    apiSecret: config.mailjet.secretKey,
  });
}

// Configuración de Nodemailer como transporte directo
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.email.user,
    pass: config.email.password,
  },
});

/**
 * Enviar correo administrativo utilizando Mailjet o Nodemailer Gmail
 */
export const sendEmail = async ({ toEmail, toName, subject, htmlContent, textContent }) => {
  // 1. Intentar con Mailjet si hay llaves válidas configuradas
  if (mailjetClient) {
    try {
      const result = await mailjetClient.post("send", { version: "v3.1" }).request({
        Messages: [
          {
            From: {
              Email: config.mailjet.fromEmail,
              Name: config.mailjet.fromName,
            },
            To: [
              {
                Email: toEmail,
                Name: toName || "Usuario CHUMPATIN",
              },
            ],
            Subject: subject,
            TextPart: textContent || "",
            HTMLPart: htmlContent,
          },
        ],
      });
      console.log(`✉️ [Mailjet] Correo enviado exitosamente a ${toEmail}`);
      return { success: true, provider: "mailjet", data: result.body };
    } catch (error) {
      console.warn("⚠️ Error en Mailjet, probando transporte Nodemailer:", error.message);
    }
  }

  // 2. Usar Nodemailer Gmail
  if (config.email.user && config.email.password) {
    try {
      const info = await transporter.sendMail({
        from: `"CHUMPATIN Oficial" <${config.email.user}>`,
        to: toEmail,
        subject,
        text: textContent || "",
        html: htmlContent,
      });
      console.log(`✉️ [Gmail/Nodemailer] Correo enviado exitosamente a ${toEmail} (ID: ${info.messageId})`);
      return { success: true, provider: "nodemailer", data: info };
    } catch (mailError) {
      console.error("❌ Error enviando correo vía Nodemailer:", mailError.message);
    }
  }

  // 3. Respaldo en consola para desarrollo
  console.log(`📨 [Dev Log] Código/Correo simulado para: ${toEmail} | Asunto: ${subject}`);
  return { success: true, simulated: true };
};

/**
 * Plantilla de correo para código OTP o recuperación de contraseña
 */
export const sendOtpEmail = async (email, code, name = "Administrador") => {
  const htmlContent = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #0d0e15; color: #ffffff; padding: 30px; border-radius: 12px; max-width: 520px; margin: 0 auto; border: 1px solid #232738;">
      <div style="text-align: center; margin-bottom: 25px;">
        <h1 style="color: #ffffff; letter-spacing: 2px; margin: 0; font-size: 26px;">CHUMPATIN ®</h1>
        <p style="color: #00f2fe; margin-top: 5px; font-weight: bold; font-size: 13px; letter-spacing: 1px;">LAST DANCE 2026</p>
      </div>
      <div style="background-color: #161824; padding: 25px; border-radius: 10px; border: 1px solid #2a2e45;">
        <h2 style="font-size: 18px; margin-top: 0; color: #e2e8f0;">Código de Verificación</h2>
        <p style="color: #94a3b8; font-size: 14px; line-height: 1.5;">
          Hola <strong>${name}</strong>, usa el siguiente código para iniciar sesión o restablecer tu contraseña en el sistema de ventas:
        </p>
        <div style="text-align: center; margin: 25px 0;">
          <span style="display: inline-block; background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%); color: #090a0f; font-size: 28px; font-weight: 800; letter-spacing: 6px; padding: 12px 30px; border-radius: 8px;">
            ${code}
          </span>
        </div>
        <p style="color: #64748b; font-size: 12px; margin-bottom: 0;">
          Este código expirará en 15 minutos. Si tú no solicitaste este acceso, puedes ignorar este mensaje.
        </p>
      </div>
    </div>
  `;

  return await sendEmail({
    toEmail: email,
    toName: name,
    subject: `🔐 Tu código de acceso CHUMPATIN: ${code}`,
    htmlContent,
    textContent: `Tu código de verificación CHUMPATIN es: ${code}`,
  });
};
