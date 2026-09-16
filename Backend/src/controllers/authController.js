import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { config } from "../../config.js";
import { sendOtpEmail } from "../utils/mailjetService.js";

// Generar Token JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role, name: user.name },
    config.jwt.secret,
    { expiresIn: "7d" }
  );
};

// Registro de nuevo Administrador / Staff
export const register = async (req, res) => {
  try {
    const { name, email, password, role = "admin" } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Por favor proporciona nombre, correo y contraseña.",
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Este correo ya está registrado en el sistema.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      role: role || "admin",
    });

    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: `¡Usuario ${newUser.name} registrado exitosamente como Administrador!`,
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    return res.status(500).json({ success: false, message: "Error al registrar usuario" });
  }
};

// Login de Usuario
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Por favor proporciona correo y contraseña.",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas. Verifica tu correo o contraseña.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas. Verifica tu correo o contraseña.",
      });
    }

    const token = generateToken(user);

    // Configurar cookie httpOnly
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      message: "Sesión iniciada correctamente",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).json({
      success: false,
      message: "Error en el servidor al intentar iniciar sesión.",
    });
  }
};

// Cerrar Sesión
export const logout = async (req, res) => {
  res.clearCookie("token");
  return res.json({ success: true, message: "Sesión cerrada exitosamente" });
};

// Obtener perfil actual
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }
    return res.json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error al obtener perfil" });
  }
};

// Solicitar código de recuperación vía Mailjet
export const requestRecoveryCode = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase().trim() });

    if (!user) {
      // Por seguridad responder éxito genérico
      return res.json({
        success: true,
        message: "Si el correo está registrado, recibirás un código de acceso.",
      });
    }

    // Generar código numérico de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.recoveryCode = code;
    user.recoveryCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos
    await user.save();

    await sendOtpEmail(user.email, code, user.name);

    return res.json({
      success: true,
      message: "Código de verificación enviado al correo electrónico.",
    });
  } catch (error) {
    console.error("Error solicitando código:", error);
    return res.status(500).json({ success: false, message: "Error al enviar código" });
  }
};

// Restablecer contraseña con código
export const resetPasswordWithCode = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    const user = await User.findOne({
      email: email?.toLowerCase().trim(),
      recoveryCode: code,
      recoveryCodeExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Código inválido o expirado. Por favor solicita uno nuevo.",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.recoveryCode = null;
    user.recoveryCodeExpires = null;
    await user.save();

    return res.json({
      success: true,
      message: "Contraseña actualizada exitosamente. Ya puedes iniciar sesión.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error al restablecer contraseña" });
  }
};
