import Sale from "../models/Sale.js";
import Attendee from "../models/Attendee.js";
import TicketType from "../models/TicketType.js";
import WristbandCheckIn from "../models/WristbandCheckIn.js";

// Formateador estándar de teléfono para El Salvador (XXXX-XXXX)
export const formatSVPhone = (val) => {
  if (!val) return "";
  let digits = String(val).replace(/\D/g, "");
  if (digits.startsWith("503") && digits.length > 8) {
    digits = digits.slice(3);
  }
  digits = digits.slice(0, 8);
  if (digits.length <= 4) return digits;
  return `${digits.slice(0, 4)}-${digits.slice(4)}`;
};

// Siguiente número correlativo de ticket
const getNextTicketNumber = async () => {
  const lastSale = await Sale.findOne().sort({ ticketNumber: -1 }).select("ticketNumber");
  return lastSale && lastSale.ticketNumber ? lastSale.ticketNumber + 1 : 1;
};

// Listar ventas con búsqueda y filtros
export const getSales = async (req, res) => {
  try {
    const {
      search = "",
      paymentMethod,
      paymentStatus,
      wristbandDelivered,
      sortBy = "ticketNumber",
      sortOrder = "asc",
      limit = 500,
      page = 1,
    } = req.query;

    const query = {};

    if (search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      query.$or = [
        { customerName: regex },
        { phone: regex },
        { schoolPromo: regex },
        { transferReference: regex },
        { notes: regex },
      ];
      if (!isNaN(search.trim())) {
        query.$or.push({ ticketNumber: Number(search.trim()) });
      }
    }

    if (paymentMethod && ["EFECTIVO", "TRANSFERENCIA"].includes(paymentMethod.toUpperCase())) {
      query.paymentMethod = paymentMethod.toUpperCase();
    }

    if (paymentStatus && ["CANCELADO", "PENDIENTE"].includes(paymentStatus.toUpperCase())) {
      query.paymentStatus = paymentStatus.toUpperCase();
    }

    if (wristbandDelivered !== undefined && wristbandDelivered !== "") {
      query.wristbandDelivered = wristbandDelivered === "true" || wristbandDelivered === true;
    }

    const sortOption = {};
    sortOption[sortBy] = sortOrder === "desc" ? -1 : 1;

    const skip = (Number(page) - 1) * Number(limit);
    const totalRecords = await Sale.countDocuments(query);
    const sales = await Sale.find(query)
      .populate("attendee")
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    return res.json({
      success: true,
      total: totalRecords,
      page: Number(page),
      totalPages: Math.ceil(totalRecords / Number(limit)) || 1,
      data: sales,
    });
  } catch (error) {
    console.error("Error al obtener ventas:", error);
    return res.status(500).json({ success: false, message: "Error al obtener lista de ventas" });
  }
};

// Obtener detalle de venta por ID o ticket
export const getSaleById = async (req, res) => {
  try {
    const { id } = req.params;
    let sale = null;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      sale = await Sale.findById(id).populate("attendee").populate("wristbandCheckIn");
    } else if (!isNaN(id)) {
      sale = await Sale.findOne({ ticketNumber: Number(id) }).populate("attendee").populate("wristbandCheckIn");
    }

    if (!sale) {
      return res.status(404).json({ success: false, message: "Venta no encontrada" });
    }

    return res.json({ success: true, data: sale });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error al buscar la venta" });
  }
};

// Registrar nueva venta guardando en las colecciones correspondientes: attendees, sales y wristband_checkins
export const createSale = async (req, res) => {
  try {
    const {
      customerName,
      phone = "",
      schoolPromo = "",
      ticketType = "Promo 2026 - Preventa ($15)",
      quantity = 1,
      unitPrice = 15,
      amount,
      paymentMethod,
      paymentStatus = "CANCELADO",
      transferBank = "",
      transferReference = "",
      notes = "",
      customTicketNumber,
    } = req.body;

    if (!customerName || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "El nombre del comprador y el método de pago son obligatorios.",
      });
    }

    const finalTicketNumber = customTicketNumber ? Number(customTicketNumber) : await getNextTicketNumber();

    const existingTicket = await Sale.findOne({ ticketNumber: finalTicketNumber });
    if (existingTicket) {
      return res.status(400).json({
        success: false,
        message: `El número de ticket #${finalTicketNumber} ya existe.`,
      });
    }

    const cleanPhone = formatSVPhone(phone);

    // 1. Colección ATTENDEES: Buscar o crear el asistente
    let attendee = await Attendee.findOne({
      fullName: { $regex: new RegExp(`^${customerName.trim()}$`, "i") },
    });

    if (!attendee) {
      attendee = await Attendee.create({
        fullName: customerName.trim(),
        phone: cleanPhone,
        schoolPromo: schoolPromo ? schoolPromo.trim() : "",
        notes: notes.trim(),
      });
    } else {
      if (cleanPhone && !attendee.phone) attendee.phone = cleanPhone;
      if (schoolPromo && !attendee.schoolPromo) attendee.schoolPromo = schoolPromo.trim();
      await attendee.save();
    }

    // 2. Colección TICKET_TYPES: Relacionar si existe
    const ticketTypeDoc = await TicketType.findOne({
      name: { $regex: new RegExp(ticketType.split("(")[0].trim(), "i") },
    });

    const calculatedAmount = amount !== undefined ? Number(amount) : Number(quantity) * Number(unitPrice);
    const registeredByName = req.user ? req.user.name : "Administrador";

    // 3. Colección SALES: Crear la venta
    const newSale = new Sale({
      ticketNumber: finalTicketNumber,
      attendee: attendee._id,
      customerName: attendee.fullName,
      phone: attendee.phone,
      schoolPromo: attendee.schoolPromo,
      ticketTypeRef: ticketTypeDoc ? ticketTypeDoc._id : null,
      ticketType: ticketType.trim(),
      quantity: Number(quantity) || 1,
      unitPrice: Number(unitPrice) || 15,
      amount: calculatedAmount,
      paymentMethod: paymentMethod.toUpperCase(),
      paymentStatus: paymentStatus.toUpperCase(),
      transferBank: transferBank.trim(),
      transferReference: transferReference.trim(),
      notes: notes.trim(),
      registeredBy: registeredByName,
    });

    await newSale.save();

    // 4. Colección WRISTBAND_CHECKINS: Crear registro de control en puerta
    const checkIn = await WristbandCheckIn.create({
      sale: newSale._id,
      ticketNumber: finalTicketNumber,
      attendeeName: attendee.fullName,
      isDelivered: false,
    });

    newSale.wristbandCheckIn = checkIn._id;
    await newSale.save();

    return res.status(201).json({
      success: true,
      message: `Venta #${newSale.ticketNumber} para ${newSale.customerName} registrada con éxito.`,
      data: newSale,
    });
  } catch (error) {
    console.error("Error al registrar venta:", error);
    return res.status(500).json({ success: false, message: error.message || "Error al registrar venta" });
  }
};

// Modificar datos de una venta
export const updateSale = async (req, res) => {
  try {
    const { id } = req.params;
    const sale = await Sale.findById(id);

    if (!sale) {
      return res.status(404).json({ success: false, message: "Venta no encontrada" });
    }

    const {
      customerName,
      phone,
      schoolPromo,
      ticketType,
      quantity,
      unitPrice,
      amount,
      paymentMethod,
      paymentStatus,
      transferBank,
      transferReference,
      notes,
    } = req.body;

    if (customerName) sale.customerName = customerName.trim();
    if (phone !== undefined) sale.phone = formatSVPhone(phone);
    if (schoolPromo !== undefined) sale.schoolPromo = schoolPromo.trim();
    if (ticketType) sale.ticketType = ticketType.trim();
    if (quantity !== undefined) sale.quantity = Number(quantity);
    if (unitPrice !== undefined) sale.unitPrice = Number(unitPrice);
    if (amount !== undefined) sale.amount = Number(amount);
    if (paymentMethod) sale.paymentMethod = paymentMethod.toUpperCase();
    if (paymentStatus) sale.paymentStatus = paymentStatus.toUpperCase();
    if (transferBank !== undefined) sale.transferBank = transferBank.trim();
    if (transferReference !== undefined) sale.transferReference = transferReference.trim();
    if (notes !== undefined) sale.notes = notes.trim();

    await sale.save();

    // Actualizar también en colección attendees
    if (sale.attendee) {
      await Attendee.findByIdAndUpdate(sale.attendee, {
        fullName: sale.customerName,
        phone: sale.phone,
        schoolPromo: sale.schoolPromo,
      });
    }

    // Actualizar nombre en colección wristband_checkins
    await WristbandCheckIn.findOneAndUpdate(
      { sale: sale._id },
      { attendeeName: sale.customerName }
    );

    return res.json({
      success: true,
      message: "Venta actualizada correctamente en todas las colecciones",
      data: sale,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error al actualizar venta" });
  }
};

// Alternar estado de pago (CANCELADO <-> PENDIENTE)
export const togglePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const sale = await Sale.findById(id);

    if (!sale) {
      return res.status(404).json({ success: false, message: "Venta no encontrada" });
    }

    sale.paymentStatus = sale.paymentStatus === "CANCELADO" ? "PENDIENTE" : "CANCELADO";
    await sale.save();

    return res.json({
      success: true,
      message: `Estado cambiado a ${sale.paymentStatus}`,
      data: sale,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error al alternar estado" });
  }
};

// Control de Puerta: Entregar Pulsera actualizando wristband_checkins y sales
export const deliverWristband = async (req, res) => {
  try {
    const { id } = req.params;
    const { wristbandCode = "" } = req.body;
    const sale = await Sale.findById(id);

    if (!sale) {
      return res.status(404).json({ success: false, message: "Registro no encontrado" });
    }

    if (sale.paymentStatus !== "CANCELADO") {
      return res.status(400).json({
        success: false,
        message: "No se puede entregar pulsera: el boleto está PENDIENTE de pago.",
      });
    }

    if (sale.wristbandDelivered) {
      return res.status(400).json({
        success: false,
        message: `⚠️ Esta pulsera ya fue entregada el ${sale.wristbandDeliveredAt?.toLocaleTimeString()} por ${sale.wristbandDeliveredBy}.`,
      });
    }

    const staffName = req.user ? req.user.name : "Staff de Puerta";
    const now = new Date();

    // Actualizar en colección Sales
    sale.wristbandDelivered = true;
    sale.wristbandDeliveredAt = now;
    sale.wristbandDeliveredBy = staffName;
    await sale.save();

    // Actualizar en colección WristbandCheckIn
    await WristbandCheckIn.findOneAndUpdate(
      { sale: sale._id },
      {
        isDelivered: true,
        deliveredAt: now,
        deliveredBy: staffName,
        wristbandCode,
      },
      { upsert: true }
    );

    return res.json({
      success: true,
      message: `✅ ¡Pulsera entregada a ${sale.customerName}! Acceso permitido.`,
      data: sale,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error al registrar entrega de pulsera" });
  }
};

// Eliminar venta de la base de datos
export const deleteSale = async (req, res) => {
  try {
    const { id } = req.params;
    const sale = await Sale.findByIdAndDelete(id);

    if (!sale) {
      return res.status(404).json({ success: false, message: "Venta no encontrada" });
    }

    // Eliminar también de colección wristband_checkins
    await WristbandCheckIn.findOneAndDelete({ sale: id });

    return res.json({
      success: true,
      message: `Venta #${sale.ticketNumber} de ${sale.customerName} eliminada correctamente.`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error al eliminar venta" });
  }
};
