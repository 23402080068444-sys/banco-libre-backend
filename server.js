
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const bcrypt = require("bcryptjs");
const SibApiV3Sdk = require("sib-api-v3-sdk");

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "5mb" }));

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
  criptomonedas: { type: Map, of: Number, default: {} },
  nombre: { type: String, default: "" },
  foto: { type: String, default: "" },
  fechaRegistro: { type: String, default: "" }
}));

// ===============================
//   Modelo de Precios de Criptos
// ===============================
const PrecioCripto = mongoose.model("PrecioCripto", new mongoose.Schema({
  simbolo: { type: String, unique: true },
  precio: Number
}));

// ===============================
//   Modelo de Comentarios
// ===============================
const Comentario = mongoose.model("Comentario", new mongoose.Schema({
  cuenta: String,
  nombre: String,
  foto: String,
  estrellas: Number,
  texto: String,
  fecha: String
}));

// Precios por defecto
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

async function enviarCorreo(para, asunto, html) {
  try {
    let email = new SibApiV3Sdk.SendSmtpEmail();
    email.sender = { email: "mg307966@gmail.com", name: "Banco Libre" };
    email.to = [{ email: para }];
    email.subject = asunto;
    email.htmlContent = html;
    await apiInstance.sendTransacEmail(email);
  } catch (err) {
    console.error("Error enviando correo a " + para + ":", err.message);
  }
}

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
  const fechaRegistro = new Date().toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" });
  const nuevo = new Usuario({ correo, password: hash, cuenta, saldo: 10000, movimientos: [], criptomonedas: {}, fechaRegistro });
  await nuevo.save();

  await enviarCorreo(correo, "Bienvenido a Banco Libre",
    `<h1>Bienvenido</h1><p>Tu cuenta <b>${cuenta}</b> fue creada con saldo inicial de <b>$10,000</b>.</p>`);

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

  const hora = new Date().toLocaleString();
  await enviarCorreo(user.correo, "Inicio de sesión detectado - Banco Libre",
    `<p>Hola${user.nombre ? " " + user.nombre : ""},</p>
     <p>Se detectó un inicio de sesión en tu cuenta <b>${cuenta}</b> el <b>${hora}</b>.</p>
     <p>Si no fuiste tú, cambia tu contraseña de inmediato.</p>`);

  res.json({
    ok: true, cuenta: user.cuenta, correo: user.correo, saldo: user.saldo,
    nombre: user.nombre || "", foto: user.foto || "", fechaRegistro: user.fechaRegistro || ""
  });
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

  await enviarCorreo(userOrigen.correo, "Ticket: Depósito enviado - Banco Libre",
    `<h2>Ticket de depósito enviado</h2>
     <p><b>Origen:</b> ${origen}</p><p><b>Destino:</b> ${destino}</p>
     <p><b>Monto:</b> $${monto}</p><p><b>Hora:</b> ${hora}</p>
     <p>Tu nuevo saldo es: <b>$${userOrigen.saldo}</b></p>`);

  await enviarCorreo(userDestino.correo, "Ticket: Depósito recibido - Banco Libre",
    `<h2>Ticket de depósito recibido</h2>
     <p><b>Origen:</b> ${origen}</p><p><b>Destino:</b> ${destino}</p>
     <p><b>Monto:</b> $${monto}</p><p><b>Hora:</b> ${hora}</p>
     <p>Tu nuevo saldo es: <b>$${userDestino.saldo}</b></p>`);

  res.json({ ok: true, mensaje: "Depósito realizado" });
});

// ===============================
//   CONSULTAR CUENTA
// ===============================
app.get("/cuenta/:id", async (req, res) => {
  const user = await Usuario.findOne({ cuenta: req.params.id });
  if (!user) return res.json({ ok: false, mensaje: "Cuenta no encontrada" });

  const criptos = {};
  if (user.criptomonedas) {
    user.criptomonedas.forEach((val, key) => { criptos[key] = val; });
  }

  res.json({
    ok: true, correo: user.correo, cuenta: user.cuenta,
    saldo: user.saldo, movimientos: user.movimientos,
    criptomonedas: criptos, nombre: user.nombre, foto: user.foto,
    fechaRegistro: user.fechaRegistro || ""
  });
});

// ===============================
//   ENVIAR PIN
// ===============================
app.post("/enviar-pin", async (req, res) => {
  const { correo } = req.body;
  const user = await Usuario.findOne({ correo });
  if (!user) return res.json({ ok: false, mensaje: "Correo no registrado" });

  const pin = Math.floor(100000 + Math.random() * 900000);
  await enviarCorreo(correo, "PIN de recuperación - Banco Libre",
    `<p>Cuenta: <b>${user.cuenta}</b></p><p>Tu PIN es: <h2>${pin}</h2></p><p>Expira en 10 minutos.</p>`);

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
//   PERFIL — Guardar nombre y foto
// ===============================
app.post("/perfil/guardar", async (req, res) => {
  const { cuenta, nombre, foto } = req.body;
  const user = await Usuario.findOne({ cuenta });
  if (!user) return res.json({ ok: false, mensaje: "Cuenta no encontrada" });

  if (nombre !== undefined) user.nombre = nombre;
  if (foto !== undefined) user.foto = foto;
  await user.save();

  res.json({ ok: true, mensaje: "Perfil actualizado" });
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

  if (!cuenta || !items || typeof total !== "number")
    return res.json({ ok: false, mensaje: "Datos inválidos" });

  const user = await Usuario.findOne({ cuenta });
  if (!user) return res.json({ ok: false, mensaje: "Cuenta no encontrada" });

  if (user.saldo < total)
    return res.json({ ok: false, mensaje: "Saldo insuficiente para completar la compra" });

  const preciosDB = await PrecioCripto.find({});
  const preciosObj = {};
  preciosDB.forEach(p => { preciosObj[p.simbolo] = p.precio; });

  let totalReal = 0;
  for (let [sim, qty] of Object.entries(items)) {
    let precio = preciosObj[sim];
    if (!precio) return res.json({ ok: false, mensaje: "Cripto no reconocida: " + sim });
    totalReal += precio * qty;
  }

  if (Math.abs(totalReal - total) / totalReal > 0.01)
    return res.json({ ok: false, mensaje: "El precio cambió, recarga e intenta de nuevo" });

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

  await enviarCorreo(user.correo, "Confirmación de compra de criptos - Banco Libre",
    `<h2>Compra realizada</h2>
     <p>Has comprado: <b>${resumen.join(", ")}</b></p>
     <p>Total descontado: <b>$${totalReal.toLocaleString()}</b></p>
     <p>Saldo restante: <b>$${user.saldo.toLocaleString()}</b></p>
     <p>Fecha: ${hora}</p>`);

  res.json({ ok: true, mensaje: `Compra realizada: ${resumen.join(", ")}` });
});

// ===============================
//   COMENTARIOS — Nuevo
// ===============================
app.post("/comentarios/nuevo", async (req, res) => {
  const { cuenta, estrellas, texto, nombre, foto } = req.body;
  if (!cuenta || !estrellas || !texto)
    return res.json({ ok: false, mensaje: "Datos incompletos" });
  if (estrellas < 1 || estrellas > 5)
    return res.json({ ok: false, mensaje: "Puntuación inválida" });

  const fecha = new Date().toLocaleString();
  const nuevo = new Comentario({ cuenta, nombre: nombre || "", foto: foto || "", estrellas, texto, fecha });
  await nuevo.save();

  res.json({ ok: true, mensaje: "Reseña publicada" });
});

// ===============================
//   COMENTARIOS — Listar todos
// ===============================
app.get("/comentarios", async (req, res) => {
  try {
    const comentarios = await Comentario.find({}).sort({ _id: 1 });
    res.json({ ok: true, comentarios });
  } catch (err) { res.json({ ok: false, mensaje: "Error" }); }
});

// ===============================
//   COMENTARIOS — Por usuario
// ===============================
app.get("/comentarios/usuario/:cuenta", async (req, res) => {
  try {
    const comentarios = await Comentario.find({ cuenta: req.params.cuenta });
    res.json({ ok: true, comentarios });
  } catch (err) { res.json({ ok: false, mensaje: "Error" }); }
});

// ===============================
//   RUTAS ADMIN — Listar cuentas
// ===============================
app.get("/admin/cuentas", verificarAdmin, async (req, res) => {
  try {
    const cuentas = await Usuario.find({}, { correo: 1, cuenta: 1, saldo: 1, movimientos: 1, criptomonedas: 1, nombre: 1, foto: 1, fechaRegistro: 1, _id: 0 });
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

  await enviarCorreo(user.correo, "Tu saldo fue modificado - Banco Libre",
    `<p>Un administrador ajustó tu saldo.</p>
     <p>Saldo anterior: <b>$${saldoAnterior}</b> → Nuevo saldo: <b>$${nuevoSaldo}</b></p>
     <p>Fecha: ${hora}</p>`);

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
//   RUTAS ADMIN — Borrar opinión
// ===============================
app.post("/admin/borrar-opinion", verificarAdmin, async (req, res) => {
  const { id } = req.body;
  if (!id) return res.json({ ok: false, mensaje: "ID requerido" });

  const result = await Comentario.deleteOne({ _id: id });
  if (result.deletedCount === 0) return res.json({ ok: false, mensaje: "Reseña no encontrada" });

  res.json({ ok: true, mensaje: "Reseña eliminada" });
});

// ===============================
//   Servidor
// ===============================
app.listen(3000, () => console.log("Servidor Banco Libre en puerto 3000"));
