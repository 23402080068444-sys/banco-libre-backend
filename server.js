const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const bcrypt = require("bcryptjs");
const SibApiV3Sdk = require("sib-api-v3-sdk");
 
const app = express();
app.use(cors());
app.use(bodyParser.json());
 
// ===============================
//   Conexión a MongoDB
// ===============================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB conectado"))
  .catch(err => console.error("Error MongoDB:", err));
 
// ===============================
//   Modelo de Usuario
// ===============================
const Usuario = mongoose.model("Usuario", new mongoose.Schema({
  correo: String,
  password: String,
  cuenta: String,
  saldo: { type: Number, default: 0 },
  movimientos: [String]
}));
 
// ===============================
//   Configuración Brevo
// ===============================
let defaultClient = SibApiV3Sdk.ApiClient.instance;
let apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY;
let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
 
// ===============================
//   Middleware Admin
// ===============================
const ADMIN_TOKEN = "pqrb728px"; // Mismo que la contraseña del admin
 
function verificarAdmin(req, res, next) {
  const token = req.headers["x-admin-token"];
  if (token !== ADMIN_TOKEN) {
    return res.json({ ok: false, mensaje: "Acceso denegado" });
  }
  next();
}
 
// ===============================
//   Rutas Frontend (HTML)
// ===============================
app.use(express.static(__dirname));
 
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "1pag.html"));
});
 
app.get("/paginapr", (req, res) => {
  res.sendFile(path.join(__dirname, "paginapr.html"));
});
 
// ===============================
//   CREAR CUENTA
// ===============================
app.post("/crear-cuenta", async (req, res) => {
  const { correo, password, cuenta } = req.body;
 
  if (!/^\d{10}$/.test(cuenta)) {
    return res.json({ ok: false, mensaje: "El número de cuenta debe tener exactamente 10 dígitos" });
  }
 
  const existeCorreo = await Usuario.findOne({ correo });
  if (existeCorreo) return res.json({ ok: false, mensaje: "Correo ya registrado" });
 
  const existeCuenta = await Usuario.findOne({ cuenta });
  if (existeCuenta) return res.json({ ok: false, mensaje: "Número de cuenta ya registrado" });
 
  const hash = await bcrypt.hash(password, 10);
  const nuevo = new Usuario({ correo, password: hash, cuenta, saldo: 10000, movimientos: [] });
  await nuevo.save();
 
  try {
    let sendEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendEmail.sender = { email: "mg307966@gmail.com", name: "Banco Libre" };
    sendEmail.to = [{ email: correo }];
    sendEmail.subject = "Bienvenido a Banco Libre";
    sendEmail.htmlContent = `<h1>Bienvenido</h1><p>Tu cuenta ${cuenta} ha sido creada exitosamente con saldo inicial de $10000.</p>`;
    await apiInstance.sendTransacEmail(sendEmail);
  } catch (err) {
    console.error("Error enviando correo:", err);
  }
 
  res.json({ ok: true, mensaje: "Cuenta creada correctamente" });
});
 
// ===============================
//   LOGIN
// ===============================
app.post("/login", async (req, res) => {
  const { cuenta, password } = req.body;
  const user = await Usuario.findOne({ cuenta });
  if (!user) return res.json({ ok: false, mensaje: "Cuenta no encontrada" });
 
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.json({ ok: false, mensaje: "Contraseña incorrecta" });
 
  res.json({ ok: true, cuenta: user.cuenta, correo: user.correo, saldo: user.saldo });
});
 
// ===============================
//   DEPOSITAR ENTRE CUENTAS
// ===============================
app.post("/depositar", async (req, res) => {
  const { origen, destino, monto } = req.body;
 
  const userOrigen = await Usuario.findOne({ cuenta: origen });
  const userDestino = await Usuario.findOne({ cuenta: destino });
 
  if (!userOrigen || !userDestino)
    return res.json({ ok: false, mensaje: "Cuenta no encontrada" });
 
  if (userOrigen.saldo < monto)
    return res.json({ ok: false, mensaje: "Saldo insuficiente" });
 
  userOrigen.saldo -= monto;
  userDestino.saldo += monto;
 
  const hora = new Date().toLocaleString();
  userOrigen.movimientos.push(`Depósito enviado a ${destino} | $${monto} | ${hora}`);
  userDestino.movimientos.push(`Depósito recibido de ${origen} | $${monto} | ${hora}`);
 
  await userOrigen.save();
  await userDestino.save();
 
  try {
    let ticketOrigen = new SibApiV3Sdk.SendSmtpEmail();
    ticketOrigen.sender = { email: "mg307966@gmail.com", name: "Banco Libre" };
    ticketOrigen.to = [{ email: userOrigen.correo }];
    ticketOrigen.subject = "Ticket de depósito enviado";
    ticketOrigen.htmlContent = `<p>Has realizado un depósito:</p>
                                <p>Origen: ${origen}</p>
                                <p>Destino: ${destino}</p>
                                <p>Monto: $${monto}</p>
                                <p>Hora: ${hora}</p>`;
    await apiInstance.sendTransacEmail(ticketOrigen);
 
    let ticketDestino = new SibApiV3Sdk.SendSmtpEmail();
    ticketDestino.sender = { email: "mg307966@gmail.com", name: "Banco Libre" };
    ticketDestino.to = [{ email: userDestino.correo }];
    ticketDestino.subject = "Ticket de depósito recibido";
    ticketDestino.htmlContent = `<p>Has recibido un depósito:</p>
                                 <p>Origen: ${origen}</p>
                                 <p>Destino: ${destino}</p>
                                 <p>Monto: $${monto}</p>
                                 <p>Hora: ${hora}</p>`;
    await apiInstance.sendTransacEmail(ticketDestino);
  } catch (err) {
    console.error("Error enviando tickets:", err);
  }
 
  res.json({ ok: true, mensaje: "Depósito realizado" });
});
 
// ===============================
//   CONSULTAR CUENTA
// ===============================
app.get("/cuenta/:id", async (req, res) => {
  const cuenta = req.params.id;
  const user = await Usuario.findOne({ cuenta });
  if (!user) return res.json({ ok: false, mensaje: "Cuenta no encontrada" });
 
  res.json({ ok: true, correo: user.correo, cuenta: user.cuenta, saldo: user.saldo, movimientos: user.movimientos });
});
 
// ===============================
//   ENVIAR PIN
// ===============================
app.post("/enviar-pin", async (req, res) => {
  const { correo } = req.body;
  const user = await Usuario.findOne({ correo });
  if (!user) return res.json({ ok: false, mensaje: "Correo no registrado" });
 
  const pin = Math.floor(100000 + Math.random() * 900000);
 
  try {
    let sendEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendEmail.sender = { email: "mg307966@gmail.com", name: "Banco Libre" };
    sendEmail.to = [{ email: correo }];
    sendEmail.subject = "PIN de recuperación";
    sendEmail.htmlContent = `<p>Cuenta: ${user.cuenta}</p><p>PIN: <strong>${pin}</strong></p>`;
    await apiInstance.sendTransacEmail(sendEmail);
  } catch (err) {
    console.error("Error enviando PIN:", err);
    return res.json({ ok: false, mensaje: "Error al enviar correo" });
  }
 
  res.json({ ok: true, mensaje: "PIN enviado", pin, cuenta: user.cuenta });
});
 
// ===============================
//   CAMBIAR PASSWORD
// ===============================
app.post("/cambiar-password", async (req, res) => {
  const { correo, nuevaPassword } = req.body;
  const user = await Usuario.findOne({ correo });
  if (!user) return res.json({ ok: false, mensaje: "Correo no encontrado" });
 
  const hash = await bcrypt.hash(nuevaPassword, 10);
  user.password = hash;
  await user.save();
  res.json({ ok: true, mensaje: "Contraseña actualizada" });
});
 
// ===============================
//   RUTAS DE ADMINISTRADOR
// ===============================
 
// GET /admin/cuentas — Lista todas las cuentas
app.get("/admin/cuentas", verificarAdmin, async (req, res) => {
  try {
    const cuentas = await Usuario.find({}, {
      correo: 1,
      cuenta: 1,
      saldo: 1,
      movimientos: 1,
      _id: 0
    });
    res.json({ ok: true, cuentas });
  } catch (err) {
    console.error("Error al obtener cuentas:", err);
    res.json({ ok: false, mensaje: "Error del servidor" });
  }
});
 
// POST /admin/editar-saldo — Modifica el saldo de una cuenta
app.post("/admin/editar-saldo", verificarAdmin, async (req, res) => {
  const { cuenta, nuevoSaldo } = req.body;
 
  if (typeof nuevoSaldo !== "number" || nuevoSaldo < 0) {
    return res.json({ ok: false, mensaje: "Saldo inválido" });
  }
 
  const user = await Usuario.findOne({ cuenta });
  if (!user) return res.json({ ok: false, mensaje: "Cuenta no encontrada" });
 
  const saldoAnterior = user.saldo;
  user.saldo = nuevoSaldo;
 
  const hora = new Date().toLocaleString();
  user.movimientos.push(`[ADMIN] Saldo ajustado de $${saldoAnterior} a $${nuevoSaldo} | ${hora}`);
 
  await user.save();
  res.json({ ok: true, mensaje: `Saldo actualizado a $${nuevoSaldo}` });
});
 
// POST /admin/borrar-cuenta — Elimina una cuenta por número
app.post("/admin/borrar-cuenta", verificarAdmin, async (req, res) => {
  const { cuenta } = req.body;
 
  if (!cuenta) return res.json({ ok: false, mensaje: "Cuenta requerida" });
 
  const result = await Usuario.deleteOne({ cuenta });
  if (result.deletedCount === 0) {
    return res.json({ ok: false, mensaje: "Cuenta no encontrada" });
  }
 
  res.json({ ok: true, mensaje: `Cuenta ${cuenta} eliminada correctamente` });
});
 
// ===============================
//   Servidor
// ===============================
app.listen(3000, () => console.log("Servidor Banco Libre en puerto 3000"));
 
