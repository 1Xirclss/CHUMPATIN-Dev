import Sale from "../models/Sale.js";

// Obtener estadísticas y resumen general para el Dashboard
export const getDashboardStats = async (req, res) => {
  try {
    const totalSalesCount = await Sale.countDocuments();
    const paidSalesCount = await Sale.countDocuments({ paymentStatus: "CANCELADO" });
    const pendingSalesCount = await Sale.countDocuments({ paymentStatus: "PENDIENTE" });

    // Pulseras entregadas
    const wristbandsDelivered = await Sale.countDocuments({ wristbandDelivered: true });
    const wristbandsPending = await Sale.countDocuments({
      paymentStatus: "CANCELADO",
      wristbandDelivered: false,
    });

    // Totales de dinero
    const moneyStats = await Sale.aggregate([
      {
        $group: {
          _id: null,
          totalMoney: {
            $sum: {
              $cond: [{ $eq: ["$paymentStatus", "CANCELADO"] }, "$amount", 0],
            },
          },
          pendingMoney: {
            $sum: {
              $cond: [{ $eq: ["$paymentStatus", "PENDIENTE"] }, "$amount", 0],
            },
          },
          cashMoney: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$paymentStatus", "CANCELADO"] },
                    { $eq: ["$paymentMethod", "EFECTIVO"] },
                  ],
                },
                "$amount",
                0,
              ],
            },
          },
          transferMoney: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$paymentStatus", "CANCELADO"] },
                    { $eq: ["$paymentMethod", "TRANSFERENCIA"] },
                  ],
                },
                "$amount",
                0,
              ],
            },
          },
          totalTicketsCount: {
            $sum: {
              $cond: [{ $eq: ["$paymentStatus", "CANCELADO"] }, "$quantity", 0],
            },
          },
        },
      },
    ]);

    const resultMoney = moneyStats[0] || {
      totalMoney: 0,
      pendingMoney: 0,
      cashMoney: 0,
      transferMoney: 0,
      totalTicketsCount: 0,
    };

    // Ventas agrupadas por fecha (para gráfico de evolución de ventas)
    const salesByDate = await Sale.aggregate([
      { $match: { paymentStatus: "CANCELADO" } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$saleDate" } },
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
          cash: {
            $sum: {
              $cond: [{ $eq: ["$paymentMethod", "EFECTIVO"] }, "$amount", 0],
            },
          },
          transfer: {
            $sum: {
              $cond: [{ $eq: ["$paymentMethod", "TRANSFERENCIA"] }, "$amount", 0],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Desglose por método de pago para gráfico circular
    const paymentMethodsBreakdown = [
      { name: "Efectivo", value: resultMoney.cashMoney, color: "#10b981" },
      { name: "Transferencia", value: resultMoney.transferMoney, color: "#00f2fe" },
    ];

    return res.json({
      success: true,
      stats: {
        totalMoney: resultMoney.totalMoney,
        pendingMoney: resultMoney.pendingMoney,
        cashMoney: resultMoney.cashMoney,
        transferMoney: resultMoney.transferMoney,
        totalSalesCount,
        paidSalesCount,
        pendingSalesCount,
        totalTicketsCount: resultMoney.totalTicketsCount,
        wristbandsDelivered,
        wristbandsPending,
      },
      charts: {
        salesByDate,
        paymentMethodsBreakdown,
      },
    });
  } catch (error) {
    console.error("Error al generar reporte de estadísticas:", error);
    return res.status(500).json({ success: false, message: "Error al generar reporte" });
  }
};
