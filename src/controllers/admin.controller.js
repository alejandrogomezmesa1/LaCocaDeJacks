const Cliente = require("../models/Cliente");
const Subscription = require("../models/Subscription");
const Comprobante = require("../models/Comprobante");
const Config = require("../models/Config");
const { Op } = require("sequelize");
let ExcelJS;
let PDFDocument;
let hasExcel = true;
let hasPdf = true;
try {
  ExcelJS = require("exceljs");
} catch (err) {
  hasExcel = false;
  console.warn("Module exceljs not installed. Excel export disabled.");
}
try {
  PDFDocument = require("pdfkit");
} catch (err) {
  hasPdf = false;
  console.warn("Module pdfkit not installed. PDF export disabled.");
}

// Obtener estadísticas para el dashboard
const getStats = async (req, res) => {
  try {
    const totalClientesActivos = await Cliente.count({
      where: { is_active: true },
    });
    const pendingComprobantes = await Comprobante.count({
      where: { status: "Pendiente" },
    });

    // Sumar ventas de suscripciones activas
    const activas = await Subscription.findAll({ where: { status: "Activo" } });
    const weeklySales = activas.reduce(
      (acc, sub) => acc + Number(sub.total_price),
      0,
    );

    res.json({
      success: true,
      stats: {
        totalClientesActivos,
        pendingComprobantes,
        weeklySales: `$${weeklySales.toLocaleString("es-CO")}`,
      },
    });
  } catch (error) {
    console.error("Error obteniendo stats:", error);
    res
      .status(500)
      .json({ success: false, message: "Error obteniendo estadísticas" });
  }
};

// Obtener todos los comprobantes con información de la suscripción y cliente
const getComprobantes = async (req, res) => {
  try {
    const comprobantes = await Comprobante.findAll({
      include: [
        {
          model: Subscription,
          include: [Cliente],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Mapear para devolver un formato amigable para el frontend
    const result = comprobantes.map((comp) => {
      const sub = comp.Subscription;
      const cli = sub ? sub.Cliente : null;
      return {
        id: comp.id,
        imageUrl: comp.image_url,
        status: comp.status,
        createdAt: comp.createdAt,
        subscriptionId: sub ? sub.id : null,
        plan: sub ? sub.plan : "N/A",
        amount: sub ? sub.total_price : 0,
        clienteNombre: cli ? cli.nombre : "Desconocido",
        clienteCedula: cli ? cli.cedula : "N/A",
      };
    });

    res.json({
      success: true,
      comprobantes: result,
    });
  } catch (error) {
    console.error("Error obteniendo comprobantes:", error);
    res
      .status(500)
      .json({ success: false, message: "Error obteniendo comprobantes" });
  }
};

// Aprobar o rechazar un comprobante
const updateComprobanteStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'Aprobado' o 'Rechazado'

    const comprobante = await Comprobante.findByPk(id, {
      include: [
        {
          model: Subscription,
          include: [Cliente],
        },
      ],
    });

    if (!comprobante) {
      return res
        .status(404)
        .json({ success: false, message: "Comprobante no encontrado" });
    }

    comprobante.status = status;
    await comprobante.save();

    const sub = comprobante.Subscription;
    const cli = sub ? sub.Cliente : null;

    if (status === "Aprobado") {
      if (sub) {
        sub.status = "Activo";
        await sub.save();
      }
      if (cli) {
        cli.is_active = true;
        await cli.save();
      }
    } else if (status === "Rechazado") {
      if (sub) {
        sub.status = "Cancelado";
        await sub.save();
      }
      // Mantenemos is_active del cliente como esté, no se activa.
    }

    res.json({
      success: true,
      message: `Comprobante ${status.toLowerCase()} exitosamente`,
    });
  } catch (error) {
    console.error("Error actualizando comprobante:", error);
    res
      .status(500)
      .json({ success: false, message: "Error actualizando comprobante" });
  }
};

// Desactivar a un cliente
const deactivateCliente = async (req, res) => {
  try {
    const { cedula } = req.params;
    const cliente = await Cliente.findByPk(cedula);

    if (!cliente) {
      return res
        .status(404)
        .json({ success: false, message: "Cliente no encontrado" });
    }

    cliente.is_active = false;
    await cliente.save();

    // También cancelar su suscripción activa
    const sub = await Subscription.findOne({
      where: { cliente_cedula: cedula, status: "Activo" },
    });
    if (sub) {
      sub.status = "Cancelado";
      await sub.save();
    }

    res.json({
      success: true,
      message: "Cliente desactivado exitosamente",
    });
  } catch (error) {
    console.error("Error desactivando cliente:", error);
    res
      .status(500)
      .json({ success: false, message: "Error desactivando cliente" });
  }
};

// Obtener resumen de cupos (max, reservados, disponibles)
const getCupos = async (req, res) => {
  try {
    const maxCuposConfig = await Config.findByPk("max_cupos");
    const maxCupos = maxCuposConfig ? parseInt(maxCuposConfig.value, 10) : null;

    // Reservados: status Pendiente o Activo
    const reserved = await Subscription.count({
      where: { status: ["Pendiente", "Activo"] },
    });
    const available =
      maxCupos !== null ? Math.max(0, maxCupos - reserved) : null;

    res.json({ success: true, cupos: { maxCupos, reserved, available } });
  } catch (error) {
    console.error("Error obteniendo cupos:", error);
    res.status(500).json({ success: false, message: "Error obteniendo cupos" });
  }
};

// Obtener todos los clientes con sus suscripciones y comprobantes
const getClientes = async (req, res) => {
  try {
    const clientes = await Cliente.findAll({
      include: [
        {
          model: Subscription,
          include: [Comprobante],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({ success: true, clientes });
  } catch (error) {
    console.error("Error obteniendo clientes:", error);
    res
      .status(500)
      .json({ success: false, message: "Error obteniendo clientes" });
  }
};

// Obtener todas las suscripciones con cliente y comprobantes
const getSubscriptions = async (req, res) => {
  try {
    const subs = await Subscription.findAll({
      include: [Cliente, Comprobante],
      order: [["createdAt", "DESC"]],
    });
    res.json({ success: true, subscriptions: subs });
  } catch (error) {
    console.error("Error obteniendo suscripciones:", error);
    res
      .status(500)
      .json({ success: false, message: "Error obteniendo suscripciones" });
  }
};

// Obtener un comprobante por id con su suscripción y cliente
const getComprobanteById = async (req, res) => {
  try {
    const { id } = req.params;
    const comprobante = await Comprobante.findByPk(id, {
      include: [{ model: Subscription, include: [Cliente] }],
    });
    if (!comprobante)
      return res
        .status(404)
        .json({ success: false, message: "Comprobante no encontrado" });
    res.json({ success: true, comprobante });
  } catch (error) {
    console.error("Error obteniendo comprobante:", error);
    res
      .status(500)
      .json({ success: false, message: "Error obteniendo comprobante" });
  }
};

// Obtener una suscripción por id con cliente y comprobantes
const getSubscriptionById = async (req, res) => {
  try {
    const { id } = req.params;
    const subscription = await Subscription.findByPk(id, {
      include: [Cliente, Comprobante],
    });
    if (!subscription)
      return res
        .status(404)
        .json({ success: false, message: "Suscripción no encontrada" });
    res.json({ success: true, subscription });
  } catch (error) {
    console.error("Error obteniendo suscripción:", error);
    res
      .status(500)
      .json({ success: false, message: "Error obteniendo suscripción" });
  }
};

// Exportar datos diarios a Excel
const exportDailyExcel = async (req, res) => {
  if (!hasExcel) {
    return res.status(501).json({
      success: false,
      message: "Dependencia exceljs no instalada. Ejecuta: npm install exceljs",
    });
  }
  try {
    const date = req.query.date || new Date().toISOString().slice(0, 10);
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const subs = await Subscription.findAll({
      where: { createdAt: { [Op.between]: [start, end] } },
      include: [Cliente, Comprobante],
      order: [["createdAt", "ASC"]],
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Registros");

    sheet.columns = [
      { header: "ID", key: "id", width: 8 },
      { header: "Nombre", key: "nombre", width: 30 },
      { header: "Cedula", key: "cedula", width: 18 },
      { header: "Email", key: "email", width: 30 },
      { header: "Celular", key: "celular", width: 18 },
      { header: "Plan", key: "plan", width: 12 },
      { header: "Total", key: "total", width: 12 },
      { header: "Estado", key: "status", width: 12 },
      { header: "Fecha", key: "fecha", width: 22 },
    ];

    subs.forEach((s) => {
      const c = s.Cliente || {};
      sheet.addRow({
        id: s.id,
        nombre: c.nombre || "",
        cedula: c.cedula || s.cliente_cedula,
        email: c.email || "",
        celular: c.celular || "",
        plan: s.plan,
        total: s.total_price,
        status: s.status,
        fecha: s.createdAt.toISOString(),
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="registros-${date}.xlsx"`,
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.send(buffer);
  } catch (error) {
    console.error("Error exportando Excel:", error);
    res.status(500).json({ success: false, message: "Error generando Excel" });
  }
};

// Exportar datos diarios a PDF (texto simple)
const exportDailyPdf = async (req, res) => {
  if (!hasPdf) {
    return res.status(501).json({
      success: false,
      message: "Dependencia pdfkit no instalada. Ejecuta: npm install pdfkit",
    });
  }
  try {
    const date = req.query.date || new Date().toISOString().slice(0, 10);
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const subs = await Subscription.findAll({
      where: { createdAt: { [Op.between]: [start, end] } },
      include: [Cliente, Comprobante],
      order: [["createdAt", "ASC"]],
    });

    const doc = new PDFDocument({ margin: 40 });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => {
      const result = Buffer.concat(chunks);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="registros-${date}.pdf"`,
      );
      res.send(result);
    });

    doc
      .fontSize(18)
      .text(`Reportes de registros - ${date}`, { align: "center" });
    doc.moveDown();

    subs.forEach((s, idx) => {
      const c = s.Cliente || {};
      doc
        .fontSize(12)
        .fillColor("black")
        .text(
          `${idx + 1}. ID: ${s.id} — ${c.nombre || "Sin nombre"} (${c.cedula || s.cliente_cedula})`,
        );
      doc
        .fontSize(10)
        .text(
          `   Email: ${c.email || "-"}  Celular: ${c.celular || "-"}  Plan: ${s.plan}  Total: ${s.total_price}  Estado: ${s.status}`,
        );
      doc.text(
        `   Dirección 1: ${s.address_1 || "-"}  Barrio: ${s.barrio_1 || "-"}`,
      );
      if (s.delivery_type === "Hibrida")
        doc.text(
          `   Dirección 2: ${s.address_2 || "-"}  Barrio2: ${s.barrio_2 || "-"}`,
        );
      if (s.Comprobantes && s.Comprobantes.length) {
        doc.text(
          `   Comprobantes: ${s.Comprobantes.map((cmp) => `${cmp.id}(${cmp.status})`).join(", ")}`,
        );
      }
      doc.moveDown(0.5);
      // Add a horizontal line
      doc
        .moveTo(doc.x, doc.y)
        .lineTo(doc.page.width - doc.page.margins.right, doc.y)
        .strokeOpacity(0.05)
        .stroke();
      doc.moveDown(0.5);
    });

    doc.end();
  } catch (error) {
    console.error("Error exportando PDF:", error);
    res.status(500).json({ success: false, message: "Error generando PDF" });
  }
};

// Re-export con nuevos endpoints
module.exports = {
  getStats,
  getComprobantes,
  getCupos,
  getComprobanteById,
  getClientes,
  getSubscriptions,
  getSubscriptionById,
  updateComprobanteStatus,
  deactivateCliente,
  exportDailyExcel,
  exportDailyPdf,
};
