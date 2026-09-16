import mongoose from "mongoose";

const ticketTierSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    target: { type: String, default: "General" },
    description: { type: String, default: "" },
  },
  { _id: false }
);

const settingSchema = new mongoose.Schema(
  {
    eventName: {
      type: String,
      default: "⚡ CHUMPATIN XXL · SENIOR SEND-OFF PROMO 2026",
    },
    eventDate: {
      type: String,
      default: "10/10/2026",
    },
    eventTime: {
      type: String,
      default: "7:00 PM – 12:00 AM",
    },
    venueName: {
      type: String,
      default: "Eventos Kaizen",
    },
    venueAddress: {
      type: String,
      default: "Calle al Boquerón, Km 13 #25, Santa Tecla",
    },
    securityInfo: {
      type: String,
      default: "Papás y adultos responsables presentes durante el evento",
    },
    experiences: {
      type: [String],
      default: [
        "DJ toda la noche",
        "Toro mecánico",
        "Tiburón XXL",
        "Fuegos artificiales",
      ],
    },
    ticketPricing: {
      promoPreventa: { type: Number, default: 15 },
      promoPuerta: { type: Number, default: 20 },
      generalPreventa: { type: Number, default: 20 },
      generalPuerta: { type: Number, default: 25 },
    },
    ticketTiers: {
      type: [ticketTierSchema],
      default: [
        { id: "promo_preventa", name: "Promo 2026 - Preventa", price: 15, target: "Seniors", description: "Válido con comprobante de promoción senior" },
        { id: "promo_puerta", name: "Promo 2026 - Puerta", price: 20, target: "Seniors Puerta", description: "Cobro directo en puerta de Kaizen" },
        { id: "general_preventa", name: "General - Preventa", price: 20, target: "General", description: "Público general preventa" },
        { id: "general_puerta", name: "General - Puerta", price: 25, target: "General Puerta", description: "Público general en taquilla" },
      ],
    },
    maxCapacity: {
      type: Number,
      default: 400,
    },
    bankTransferInfo: {
      bankName: { type: String, default: "Banco Promerica" },
      accountType: { type: String, default: "CUENTA DE AHORRO" },
      accountNumber: { type: String, default: "20000044022070" },
      accountHolder: { type: String, default: "Emanuel Alexander Benitez vides" },
      whatsappSupport: { type: String, default: "" },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model("Setting", settingSchema);
