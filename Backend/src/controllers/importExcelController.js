import { createRequire } from "module";
const require = createRequire(import.meta.url);
const xlsx = require("xlsx");
import Sale from "../models/Sale.js";
import Attendee from "../models/Attendee.js";
import TicketType from "../models/TicketType.js";
import WristbandCheckIn from "../models/WristbandCheckIn.js";

const parseRowText = (text) => {
  if (!text || typeof text !== "string") return null;
  const trimmed = text.trim();

  // Omitir cabeceras o filas de totales
  if (
    trimmed.toUpperCase().includes("CANCELADO") && !trimmed.match(/^\d+/) ||
    trimmed.toUpperCase().includes("TOTAL")
  ) {
    return null;
  }

  // Capturar: Número, Nombre, Método de Pago y Monto
  const match = trimmed.match(/^(\d+)[\s.-]+(.+?)\s+(TRASNFERENCIA|TRANSFERENCIA|EFECTIVO)\s*\$?(\d+(?:\.\d+)?)/i);

  if (match) {
    const ticketNumber = parseInt(match[1], 10);
    const customerName = match[2].trim();
    let paymentMethod = match[3].toUpperCase();
    if (paymentMethod === "TRASNFERENCIA") paymentMethod = "TRANSFERENCIA";
    const amount = parseFloat(match[4]);

    return {
      ticketNumber,
      customerName,
      paymentMethod,
      amount: isNaN(amount) ? 15 : amount,
      paymentStatus: "CANCELADO",
      notes: "Importado desde archivo Excel",
    };
  }

  return null;
};

// Importar Excel subido por el usuario desde su PC (vía Base64)
export const importFromExcel = async (req, res) => {
  try {
    const { fileBase64, fileName = "archivo.xlsx", clearExisting = false } = req.body;

    if (!fileBase64) {
      return res.status(400).json({
        success: false,
        message: "Por favor selecciona un archivo Excel (.xlsx o .xls) desde tu PC.",
      });
    }

    // Si el usuario eligió borrar los datos anteriores antes de subir el nuevo Excel
    if (clearExisting) {
      await Sale.deleteMany({});
      await Attendee.deleteMany({});
      await WristbandCheckIn.deleteMany({});
    }

    // Leer el archivo directamente de memoria
    const buffer = Buffer.from(fileBase64, "base64");
    const workbook = xlsx.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

    const importedSales = [];
    const skippedRows = [];

    const defaultType = await TicketType.findOne({ code: "PROMO_PREVENTA" });

    for (let rowIndex = 0; rowIndex < rawData.length; rowIndex++) {
      const row = rawData[rowIndex];
      if (!row || row.length === 0) continue;

      // Buscar celda que contenga la línea de venta
      let cellText = "";
      for (const cell of row) {
        if (cell && typeof cell === "string" && (cell.includes("EFECTIVO") || cell.includes("TRANSFERENCIA") || cell.includes("TRASNFERENCIA"))) {
          cellText = cell;
          break;
        }
      }
      if (!cellText && row[0]) cellText = String(row[0]);

      const parsed = parseRowText(cellText);

      if (parsed) {
        const exists = await Sale.findOne({ ticketNumber: parsed.ticketNumber });
        if (!exists) {
          // 1. Guardar en colección ATTENDEES
          let attendee = await Attendee.findOne({ fullName: parsed.customerName });
          if (!attendee) {
            attendee = await Attendee.create({
              fullName: parsed.customerName,
              notes: `Importado de ${fileName}`,
            });
          }

          // 2. Guardar en colección SALES
          const newSale = new Sale({
            ticketNumber: parsed.ticketNumber,
            attendee: attendee._id,
            customerName: attendee.fullName,
            ticketTypeRef: defaultType ? defaultType._id : null,
            ticketType: "Promo 2026 - Preventa ($15)",
            quantity: 1,
            unitPrice: parsed.amount,
            amount: parsed.amount,
            paymentMethod: parsed.paymentMethod,
            paymentStatus: "CANCELADO",
            notes: parsed.notes,
            registeredBy: "Importación Excel",
          });
          await newSale.save();

          // 3. Guardar en colección WRISTBAND_CHECKINS
          const checkIn = await WristbandCheckIn.create({
            sale: newSale._id,
            ticketNumber: parsed.ticketNumber,
            attendeeName: attendee.fullName,
            isDelivered: false,
          });

          newSale.wristbandCheckIn = checkIn._id;
          await newSale.save();

          importedSales.push(newSale);
        } else {
          skippedRows.push({ text: cellText, reason: "Ticket ya registrado" });
        }
      }
    }

    return res.json({
      success: true,
      message: `¡Importación exitosa de '${fileName}'! Se registraron ${importedSales.length} ventas en la base de datos.`,
      importedCount: importedSales.length,
      skippedCount: skippedRows.length,
    });
  } catch (error) {
    console.error("Error al procesar Excel:", error);
    return res.status(500).json({
      success: false,
      message: "Error al procesar el archivo Excel: " + error.message,
    });
  }
};

// Vaciar todas las ventas y asistentes a cero
export const clearAllData = async (req, res) => {
  try {
    await Sale.deleteMany({});
    await Attendee.deleteMany({});
    await WristbandCheckIn.deleteMany({});

    return res.json({
      success: true,
      message: "Todas las ventas, asistentes y pulseras han sido eliminados de la base de datos.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error al limpiar la base de datos" });
  }
};
