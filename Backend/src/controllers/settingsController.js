import Setting from "../models/Setting.js";
import TicketType from "../models/TicketType.js";

// Inicializar configuración y tipos de entrada en MongoDB
export const ensureInitialSettings = async () => {
  try {
    // 1. Colección SETTINGS
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({
        eventName: "⚡ CHUMPATIN XXL · SENIOR SEND-OFF PROMO 2026",
        eventDate: "10/10/2026",
        eventTime: "7:00 PM – 12:00 AM",
        venueName: "Eventos Kaizen",
        venueAddress: "Calle al Boquerón, Km 13 #25, Santa Tecla",
        securityInfo: "Papás y adultos responsables presentes durante el evento",
        maxCapacity: 400,
        bankTransferInfo: {
          bankName: "Banco Agrícola / BAC / Cuscatlán / Chivo Wallet",
          accountNumber: "",
          accountHolder: "CHUMPATIN EVENTOS",
          whatsappSupport: "",
        },
      });
      console.log("⚙️ [Settings] Colección 'settings' inicializada en MongoDB.");
    }

    // 2. Colección TICKET_TYPES (Colección dedicada separada)
    const countTypes = await TicketType.countDocuments();
    if (countTypes === 0) {
      await TicketType.insertMany([
        {
          code: "PROMO_PREVENTA",
          name: "Promo 2026 - Preventa",
          price: 15,
          targetAudience: "Seniors",
          description: "Válido con comprobante de promoción senior",
          isActive: true,
        },
        {
          code: "PROMO_PUERTA",
          name: "Promo 2026 - Puerta",
          price: 20,
          targetAudience: "Seniors Puerta",
          description: "Cobro directo en puerta de Kaizen",
          isActive: true,
        },
        {
          code: "GENERAL_PREVENTA",
          name: "General - Preventa",
          price: 20,
          targetAudience: "General",
          description: "Público general anticipada",
          isActive: true,
        },
        {
          code: "GENERAL_PUERTA",
          name: "General - Puerta",
          price: 25,
          targetAudience: "General Puerta",
          description: "Público general en taquilla",
          isActive: true,
        },
      ]);
      console.log("🎟️ [TicketTypes] Colección 'ticket_types' inicializada en MongoDB.");
    }

    return settings;
  } catch (error) {
    console.error("Error asegurando configuración:", error.message);
  }
};

// Obtener configuración activa con sus tipos de entrada
export const getSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await ensureInitialSettings();
    }
    const ticketTiers = await TicketType.find({ isActive: true });

    return res.json({
      success: true,
      data: {
        ...settings.toObject(),
        ticketTiers,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error al obtener configuración" });
  }
};

// Actualizar configuración
export const updateSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = new Setting(req.body);
    } else {
      Object.assign(settings, req.body);
    }
    await settings.save();

    // Si se enviaron actualizaciones de precios de boletos, actualizarlos en la colección ticket_types
    if (req.body.ticketTiers && Array.isArray(req.body.ticketTiers)) {
      for (const tier of req.body.ticketTiers) {
        if (tier.code) {
          await TicketType.findOneAndUpdate(
            { code: tier.code },
            { price: tier.price, name: tier.name },
            { upsert: true }
          );
        }
      }
    }

    return res.json({
      success: true,
      message: "Configuración actualizada en MongoDB",
      data: settings,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error al guardar configuración" });
  }
};
