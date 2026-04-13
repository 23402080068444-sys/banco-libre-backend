
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
  movimientos: [String],
  criptomonedas: { type: Map, of: Number, default: {} }
}));
 
// ===============================
//   Modelo de Precios de Criptos
// ===============================
const PrecioCripto = mongoose.model("PrecioCripto", new mongoose.Schema({
  simbolo: { type: String, unique: true },
  precio: Number
}));
 
// Precios por defecto si no existen en DB
const CRIPTOS_DEFAULT = [
  { simbolo: "BLC", precio: 1200 },
  { simbolo: "LBX", precio: 850  },
  { simbolo: "NVX", precio: 3200 },
  { simbolo: "ZRO", precio: 450  },
  { simbolo: "QNT", precio: 5600 },
  { simbolo: "SLX", precio: 980  },
  { simbolo: "DRK", precio: 2100 },
  { simbolo: "AQX", precio: 670  },
  { simbolo: "FNX", precio: 4300 },
  { simbolo: "LNR", precio: 1550 }
];
 
async function inicializarPrecios() {
  for (let c of CRIPTOS_DEFAULT) {
    const existe = await PrecioCripto.findOne({ simbolo: c.simbolo });
    if (!existe) await PrecioCripto.create({ simbolo: c.simbolo, precio: c.precio });
  }
  console.log("Precios de criptos inicializados");
}
 
mongoose.connection.once("open", () => { inicializarPrecios(); });
 
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
const ADMIN_TOKEN = "pqrb728px";
 
function verificarAdmin(req, res, next) {
  const token = req.headers["x-admin-token"];
  if (token !== ADMIN_TOKEN) return res.json({ ok: false, mensaje: "Acceso denegado" });
  next();
}
 
// ===============================
//   Rutas Frontend
// ===============================
app.use(express.static(__dirname));
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "1pag.html")));
app.get("/paginapr", (req, res) => res.sendFile(path.join(__dirname, "paginapr.html")));
 
// ===============================
//   CREAR CUENTA
// ===============================
app.post("/crear-cuenta", async (req, res) => {
  const { correo, password, cuenta } = req.body;
 
  if (!/^\d{10}$/.test(cuenta))
    return res.json({ ok: false, mensaje: "El número de cuenta debe tener exactamente 10 dígitos" });
 
  const existeCorreo = await Usuario.findOne({ correo });
  if (existeCorreo) return res.json({ ok: false, mensaje: "Correo ya registrado" });
 
  const existeCuenta = await Usuario.findOne({ cuenta });
  if (existeCuenta) return res.json({ ok: false, mensaje: "Número de cuenta ya registrado" });
 
  const hash = await bcrypt.hash(password, 10);
  const nuevo = new Usuario({ correo, password: hash, cuenta, saldo: 10000, movimientos: [], criptomonedas: {} });
  await nuevo.save();
 
  try {
    let sendEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendEmail.sender = { email: "mg307966@gmail.com", name: "Banco Libre" };
    sendEmail.to = [{ email: correo }];
    sendEmail.subject = "Bienvenido a Banco Libre";
    sendEmail.htmlContent = `<h1>Bienvenido</h1><p>Tu cuenta ${cuenta} ha sido creada exitosamente con saldo inicial de $10000.</p>`;
    await apiInstance.sendTransacEmail(sendEmail);
  } catch (err) { console.error("Error enviando correo:", err); }
 
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
//   DEPOSITAR
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
    let t1 = new SibApiV3Sdk.SendSmtpEmail();
    t1.sender = { email: "mg307966@gmail.com", name: "Banco Libre" };
    t1.to = [{ email: userOrigen.correo }];
    t1.subject = "Ticket de depósito enviado";
    t1.htmlContent = `<p>Origen: ${origen}</p><p>Destino: ${destino}</p><p>Monto: $${monto}</p><p>Hora: ${hora}</p>`;
    await apiInstance.sendTransacEmail(t1);
 
    let t2 = new SibApiV3Sdk.SendSmtpEmail();
    t2.sender = { email: "mg307966@gmail.com", name: "Banco Libre" };
    t2.to = [{ email: userDestino.correo }];
    t2.subject = "Ticket de depósito recibido";
    t2.htmlContent = `<p>Origen: ${origen}</p><p>Destino: ${destino}</p><p>Monto: $${monto}</p><p>Hora: ${hora}</p>`;
    await apiInstance.sendTransacEmail(t2);
  } catch (err) { console.error("Error enviando tickets:", err); }
 
  res.json({ ok: true, mensaje: "Depósito realizado" });
});
 
// ===============================
//   CONSULTAR CUENTA
// ===============================
app.get("/cuenta/:id", async (req, res) => {
  const user = await Usuario.findOne({ cuenta: req.params.id });
  if (!user) return res.json({ ok: false, mensaje: "Cuenta no encontrada" });
 
  // Convertir Map a objeto plano
  const criptos = {};
  if (user.criptomonedas) {
    user.criptomonedas.forEach((val, key) => { criptos[key] = val; });
  }
 
  res.json({ ok: true, correo: user.correo, cuenta: user.cuenta, saldo: user.saldo, movimientos: user.movimientos, criptomonedas: criptos });
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
  } catch (err) { console.error("Error enviando PIN:", err); return res.json({ ok: false, mensaje: "Error al enviar correo" }); }
 
  res.json({ ok: true, mensaje: "PIN enviado", pin, cuenta: user.cuenta });
});
 
// ===============================
//   CAMBIAR PASSWORD
// ===============================
app.post("/cambiar-password", async (req, res) => {
  const { correo, nuevaPassword } = req.body;
  const user = await Usuario.findOne({ correo });
  if (!user) return res.json({ ok: false, mensaje: "Correo no encontrado" });
 
  user.password = await bcrypt.hash(nuevaPassword, 10);
  await user.save();
  res.json({ ok: true, mensaje: "Contraseña actualizada" });
});
 
// ===============================
//   PRECIOS DE CRIPTOS (público)
// ===============================
app.get("/criptos/precios", async (req, res) => {
  try {
    const precios = await PrecioCripto.find({});
    const obj = {};
    precios.forEach(p => { obj[p.simbolo] = p.precio; });
    res.json({ ok: true, precios: obj });
  } catch (err) { res.json({ ok: false, mensaje: "Error al obtener precios" }); }
});
 
// ===============================
//   COMPRAR CRIPTOS
// ===============================
app.post("/comprar-criptos", async (req, res) => {
  const { cuenta, items, total } = req.body;
  // items = { simbolo: cantidad, ... }
 
  if (!cuenta || !items || typeof total !== "number")
    return res.json({ ok: false, mensaje: "Datos inválidos" });
 
  const user = await Usuario.findOne({ cuenta });
  if (!user) return res.json({ ok: false, mensaje: "Cuenta no encontrada" });
 
  if (user.saldo < total)
    return res.json({ ok: false, mensaje: "Saldo insuficiente para completar la compra" });
 
  // Verificar precios actuales del backend
  const preciosDB = await PrecioCripto.find({});
  const preciosObj = {};
  preciosDB.forEach(p => { preciosObj[p.simbolo] = p.precio; });
 
  let totalReal = 0;
  for (let [sim, qty] of Object.entries(items)) {
    let precio = preciosObj[sim];
    if (!precio) return res.json({ ok: false, mensaje: "Cripto no reconocida: " + sim });
    totalReal += precio * qty;
  }
 
  // Pequeña tolerancia por redondeo (1%)
  if (Math.abs(totalReal - total) / totalReal > 0.01)
    return res.json({ ok: false, mensaje: "El precio cambió, por favor recarga e intenta de nuevo" });
 
  user.saldo -= totalReal;
 
  const hora = new Date().toLocaleString();
  const resumen = [];
 
  for (let [sim, qty] of Object.entries(items)) {
    let actual = user.criptomonedas.get(sim) || 0;
    user.criptomonedas.set(sim, actual + qty);
    resumen.push(`${qty} ${sim}`);
  }
 
  user.movimientos.push(`Compra de criptos: ${resumen.join(", ")} | -$${totalReal.toLocaleString()} | ${hora}`);
  user.markModified("criptomonedas");
  await user.save();
 
  res.json({ ok: true, mensaje: `Compra realizada: ${resumen.join(", ")}` });
});
 
// ===============================
//   RUTAS ADMIN — Listar cuentas
// ===============================
app.get("/admin/cuentas", verificarAdmin, async (req, res) => {
  try {
    const cuentas = await Usuario.find({}, { correo: 1, cuenta: 1, saldo: 1, movimientos: 1, criptomonedas: 1, _id: 0 });
    res.json({ ok: true, cuentas });
  } catch (err) { res.json({ ok: false, mensaje: "Error del servidor" }); }
});
 
// ===============================
//   RUTAS ADMIN — Editar saldo
// ===============================
app.post("/admin/editar-saldo", verificarAdmin, async (req, res) => {
  const { cuenta, nuevoSaldo } = req.body;
  if (typeof nuevoSaldo !== "number" || nuevoSaldo < 0)
    return res.json({ ok: false, mensaje: "Saldo inválido" });
 
  const user = await Usuario.findOne({ cuenta });
  if (!user) return res.json({ ok: false, mensaje: "Cuenta no encontrada" });
 
  const saldoAnterior = user.saldo;
  user.saldo = nuevoSaldo;
  const hora = new Date().toLocaleString();
  user.movimientos.push(`[ADMIN] Saldo ajustado de $${saldoAnterior} a $${nuevoSaldo} | ${hora}`);
  await user.save();
 
  res.json({ ok: true, mensaje: `Saldo actualizado a $${nuevoSaldo}` });
});
 
// ===============================
//   RUTAS ADMIN — Borrar cuenta
// ===============================
app.post("/admin/borrar-cuenta", verificarAdmin, async (req, res) => {
  const { cuenta } = req.body;
  if (!cuenta) return res.json({ ok: false, mensaje: "Cuenta requerida" });
 
  const result = await Usuario.deleteOne({ cuenta });
  if (result.deletedCount === 0) return res.json({ ok: false, mensaje: "Cuenta no encontrada" });
 
  res.json({ ok: true, mensaje: `Cuenta ${cuenta} eliminada correctamente` });
});
 
// ===============================
//   RUTAS ADMIN — Editar precio cripto
// ===============================
app.post("/admin/editar-precio-cripto", verificarAdmin, async (req, res) => {
  const { simbolo, precio } = req.body;
  if (!simbolo || typeof precio !== "number" || precio <= 0)
    return res.json({ ok: false, mensaje: "Datos inválidos" });
 
  await PrecioCripto.findOneAndUpdate({ simbolo }, { precio }, { upsert: true });
  res.json({ ok: true, mensaje: `Precio de ${simbolo} actualizado a $${precio}` });
});
 
// ===============================
//   RUTAS ADMIN — Quitar cripto a usuario
// ===============================
app.post("/admin/quitar-cripto", verificarAdmin, async (req, res) => {
  const { cuenta, simbolo } = req.body;
  if (!cuenta || !simbolo) return res.json({ ok: false, mensaje: "Datos incompletos" });
 
  const user = await Usuario.findOne({ cuenta });
  if (!user) return res.json({ ok: false, mensaje: "Cuenta no encontrada" });
 
  const cantAntes = user.criptomonedas.get(simbolo) || 0;
  if (cantAntes === 0) return res.json({ ok: false, mensaje: "El usuario no tiene esa cripto" });
 
  user.criptomonedas.delete(simbolo);
  user.markModified("criptomonedas");
 
  const hora = new Date().toLocaleString();
  user.movimientos.push(`[ADMIN] ${simbolo} removido de la cuenta | ${hora}`);
  await user.save();
 
  res.json({ ok: true, mensaje: `${simbolo} eliminado de la cuenta ${cuenta}` });
});
 
// ===============================
//   Servidor
// ===============================
app.listen(3000, () => console.log("Servidor Banco Libre en puerto 3000"));
 
