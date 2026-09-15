import mongoose from "mongoose";

const wristbandCheckInSchema = new mongoose.Schema(
  {
    sale: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sale",
      required: true,
      index: true,
    },
    ticketNumber: {
      type: Number,
      required: true,
      index: true,
    },
    attendeeName: {
      type: String,
      required: true,
      trim: true,
    },
    isDelivered: {
      type: Boolean,
      default: false,
      index: true,
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
    deliveredBy: {
      type: String,
      default: null,
      trim: true,
    },
    wristbandCode: {
      type: String,
      default: "",
      trim: true, // Código o color de pulsera física
    },
    doorLocation: {
      type: String,
      default: "Puerta Principal - Eventos Kaizen",
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: "wristband_checkins", // Colección separada para control de acceso en puerta
  }
);

export default mongoose.model("WristbandCheckIn", wristbandCheckInSchema);
