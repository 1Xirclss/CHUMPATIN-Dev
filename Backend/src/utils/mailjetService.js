import Mailjet from "node-mailjet";
import nodemailer from "nodemailer";
import { config } from "../../config.js";

// Conexión con Mailjet idéntica a ProNatural
let mailjetClient = null;

const getMailjetClient = () => {
  if (
    !mailjetClient &&
    config.mailjet.apiKey &&
    config.mailjet.secretKey &&
    config.mailjet.apiKey !== "tu_api_key_aqui" &&
    !config.mailjet.secretKey.startsWith("tu_")
  ) {
    mailjetClient = Mailjet.apiConnect(
      config.mailjet.apiKey,
      config.mailjet.secretKey
    );
  }
  return mailjetClient;
};

// Configuración de Nodemailer como transporte directo de respaldo
const transporter = nodemailer.createTransport({
  service: "gmail",
  connectionTimeout: 4000,
  greetingTimeout: 4000,
  socketTimeout: 4000,
  auth: {
    user: config.email.user,
    pass: config.email.password,
  },
});

/**
 * Enviar correo administrativo utilizando Mailjet (con fallback de Nodemailer y registro en consola)
 */
export const sendEmail = async (params, subjectParam, htmlParam) => {
  // Soporta tanto objeto ({ toEmail, toName, subject, htmlContent }) como parámetros sueltos (to, subject, html) estilo ProNatural
  let toEmail, toName, subject, htmlContent, textContent;
  if (typeof params === "string") {
    toEmail = params;
    subject = subjectParam;
    htmlContent = htmlParam;
    toName = "Usuario";
  } else {
    toEmail = params.toEmail;
    toName = params.toName || "Usuario CHUMPATIN";
    subject = params.subject;
    htmlContent = params.htmlContent;
    textContent = params.textContent;
  }

  // 1. Intentar con Mailjet vía API HTTP (Recomendado para Render y producción)
  const client = getMailjetClient();
  if (client) {
    try {
      const messagePayload = {
        From: {
          Email: config.mailjet.fromEmail || "mam270508@gmail.com",
          Name: config.mailjet.fromName || "CHUMPATIN Oficial",
        },
        To: [
          {
            Email: toEmail,
            Name: toName,
          },
        ],
        Subject: subject,
        HTMLPart: htmlContent,
      };

      if (textContent) {
        messagePayload.TextPart = textContent;
      }

      const result = await client
        .post("send", { version: "v3.1" })
        .request({
          Messages: [messagePayload],
        });

      console.log(`✉️ [MAILJET ÉXITO] Correo enviado exitosamente a ${toEmail}`);
      return { success: true, provider: "mailjet", data: result.body };
    } catch (error) {
      console.warn(`⚠️ [MAILJET AVISO] Error al enviar con Mailjet (${error.message}), intentando respaldo...`);
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
    <div style="font-family: Arial, sans-serif; text-align: center; background-color: #f4f4f9; padding: 25px; border: 1px solid #ddd; border-radius: 12px; max-width: 550px; margin: 0 auto;">
      <h1 style="color: #2c3e50; font-size: 24px; margin-bottom: 5px;">CHUMPATIN XXL 2026</h1>
      <p style="color: #0088cc; font-weight: bold; margin-top: 0; font-size: 14px;">SENIOR SEND-OFF PROMO</p>
      <p style="font-size: 16px; color: #555; line-height: 1.5;">
        Hola <strong>${name}</strong>, usa el siguiente código de verificación de 6 dígitos para activar tu cuenta en el sistema de ventas:
      </p>
      <div style="display: inline-block; padding: 14px 28px; margin: 20px 0; font-size: 28px; font-weight: bold; color: #ffffff; background-color: #0088cc; border-radius: 8px; letter-spacing: 6px;">
        ${code}
      </div>
      <p style="font-size: 14px; color: #777; line-height: 1.5;">
        Este código es válido durante los próximos <strong>15 minutos</strong>. Si no solicitaste este código, puedes ignorar este mensaje.
      </p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <footer style="font-size: 12px; color: #aaa;">
        CHUMPATIN XXL &bull; Sistema Oficial de Ventas y Accesos 2026
      </footer>
    </div>
  `;

  return await sendEmail({
    toEmail: email,
    toName: name,
    subject: `Código de Verificación: ${code} - CHUMPATIN XXL`,
    htmlContent,
    textContent: `Tu código de verificación para CHUMPATIN XXL es: ${code}. Válido por 15 minutos.`,
  });
};
