import mongoose from "mongoose";

const attendeeSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "El nombre del asistente es obligatorio"],
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },
    category: {
      type: String,
      enum: ["PROMO", "GENERAL"],
      default: "PROMO",
      index: true,
    },
    schoolPromo: {
      type: String,
      trim: true,
      default: "", // Ej: "Champagnat Promo 2026", "Liceo Salvadoreño" o "Público General"
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: "attendees", // Colección dedicada separada
  }
);

attendeeSchema.index({ fullName: "text", phone: "text", schoolPromo: "text" });

export default mongoose.model("Attendee", attendeeSchema);
