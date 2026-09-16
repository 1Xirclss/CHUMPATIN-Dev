import mongoose from "mongoose";

const saleSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    // Referencia a la colección de Asistentes
    attendee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Attendee",
      required: true,
      index: true,
    },
    // Copia rápida de datos de lectura para alto rendimiento
    customerName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      default: "",
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
      default: "",
    },
    // Referencia al Tipo de Entrada
    ticketTypeRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TicketType",
    },
    ticketType: {
      type: String,
      default: "Promo 2026 - Preventa ($15)",
      trim: true,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
      default: 15,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
      default: 15,
    },
    // Método de Pago (Estricto: EFECTIVO o TRANSFERENCIA)
    paymentMethod: {
      type: String,
      enum: ["EFECTIVO", "TRANSFERENCIA"],
      required: true,
      uppercase: true,
      index: true,
    },
    // Estado de la Venta (CANCELADO = Pagado, PENDIENTE = Por Cobrar)
    paymentStatus: {
      type: String,
      enum: ["CANCELADO", "PENDIENTE"],
      default: "CANCELADO",
      uppercase: true,
      index: true,
    },
    // Datos de Transferencia
    transferBank: {
      type: String,
      trim: true,
      default: "",
    },
    transferReference: {
      type: String,
      trim: true,
      default: "",
    },
    // Referencia a la entrega de pulsera
    wristbandCheckIn: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WristbandCheckIn",
    },
    wristbandDelivered: {
      type: Boolean,
      default: false,
      index: true,
    },
    wristbandDeliveredAt: {
      type: Date,
      default: null,
    },
    wristbandDeliveredBy: {
      type: String,
      default: null,
    },
    registeredBy: {
      type: String,
      default: "Administrador",
    },
    saleDate: {
      type: Date,
      default: Date.now,
      index: true,
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
    collection: "sales", // Colección dedicada para transacciones de ventas
  }
);

saleSchema.index({ customerName: "text", phone: "text", transferReference: "text", notes: "text" });

export default mongoose.model("Sale", saleSchema);
