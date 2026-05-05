const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const bcrypt = require("bcryptjs");

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "10mb" }));
app.use(express.static(__dirname)); // <--- Sirve archivos estáticos

// ===============================
//   CONEXIÓN A MONGODB
// ===============================
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/banco-libre")
  .then(() => console.log("MongoDB conectado"))
  .catch(err => console.error("Error MongoDB:", err));

// ===============================
//   MODELOS
// ===============================
const UsuarioSchema = new mongoose.Schema({
  correo: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  cuenta: { type: String, required: true, unique: true },
  saldo: { type: Number, default: 10000 },
  movimientos: [String],
  criptomonedas: { type: Map, of: Number, default: {} },
  nombre: { type: String, default: "" },
  foto: { type: String, default: "" },
  fechaRegistro: { type: String, default: () => new Date().toLocaleDateString("es-MX") }
});

const Usuario = mongoose.model("Usuario", UsuarioSchema);

const PrecioCriptoSchema = new mongoose.Schema({
  simbolo: { type: String, unique: true },
  precio: Number,
  historial: [Number]
});

const PrecioCripto = mongoose.model("PrecioCripto", PrecioCriptoSchema);

const ComentarioSchema = new mongoose.Schema({
  cuenta: String,
  nombre: String,
  foto: String,
  estrellas: Number,
  texto: String,
  fecha: { type: String, default: () => new Date().toLocaleString() }
});

const Comentario = mongoose.model("Comentario", ComentarioSchema);

// ===============================
//   PRECIOS POR DEFECTO
// ===============================
const CRIPTOS_DEFAULT = [
  { simbolo: "BLC", precio: 1200 }, { simbolo: "LBX", precio: 850 },
  { simbolo: "NVX", precio: 3200 }, { simbolo: "ZRO", precio: 450 },
  { simbolo: "QNT", precio: 5600 }, { simbolo: "SLX", precio: 980 },
  { simbolo: "DRK", precio: 2100 }, { simbolo: "AQX", precio: 670 },
  { simbolo: "FNX", precio: 4300 }, { simbolo: "LNR", precio: 1550 }
];

async function inicializarPrecios() {
  for (let c of CRIPTOS_DEFAULT) {
    const existe = await PrecioCripto.findOne({ simbolo: c.simbolo });
    if (!existe) {
      const historial = [];
      for (let i = 0; i < 20; i++) {
        historial.push(c.precio + (Math.random() - 0.5) * 100);
      }
      await PrecioCripto.create({ simbolo: c.simbolo, precio: c.precio, historial });
    }
  }
  console.log("Precios inicializados");
}

mongoose.connection.once("open", () => { inicializarPrecios(); });

// ===============================
//   MIDDLEWARE ADMIN
// ===============================
const ADMIN_TOKEN = "pqrb728px";
function verificarAdmin(req, res, next) {
  const token = req.headers["x-admin-token"];
  if (token !== ADMIN_TOKEN) return res.json({ ok: false, mensaje: "Acceso denegado" });
  next();
}

// ===============================
//   RUTAS DE API
// ===============================

app.post("/crear-cuenta", async (req, res) => {
  const { correo, password, cuenta } = req.body;
  if (!/^\d{10}$/.test(cuenta))
    return res.json({ ok: false, mensaje: "Cuenta debe tener 10 dígitos" });
  const existeCorreo = await Usuario.findOne({ correo });
  if (existeCorreo) return res.json({ ok: false, mensaje: "Correo ya registrado" });
  const existeCuenta = await Usuario.findOne({ cuenta });
  if (existeCuenta) return res.json({ ok: false, mensaje: "Cuenta ya registrada" });
  const hash = await bcrypt.hash(password, 10);
  const nuevo = new Usuario({ correo, password: hash, cuenta, saldo: 10000 });
  await nuevo.save();
  res.json({ ok: true, mensaje: "Cuenta creada" });
});

app.post("/login", async (req, res) => {
  const { cuenta, password } = req.body;
  const user = await Usuario.findOne({ cuenta });
  if (!user) return res.json({ ok: false, mensaje: "Cuenta no encontrada" });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.json({ ok: false, mensaje: "Contraseña incorrecta" });
  res.json({ ok: true, cuenta: user.cuenta, correo: user.correo, saldo: user.saldo, nombre: user.nombre || "", foto: user.foto || "", fechaRegistro: user.fechaRegistro || "" });
});

app.post("/depositar", async (req, res) => {
  const { origen, destino, monto } = req.body;
  const userOrigen = await Usuario.findOne({ cuenta: origen });
  const userDestino = await Usuario.findOne({ cuenta: destino });
  if (!userOrigen || !userDestino) return res.json({ ok: false, mensaje: "Cuenta no encontrada" });
  if (userOrigen.saldo < monto) return res.json({ ok: false, mensaje: "Saldo insuficiente" });
  userOrigen.saldo -= monto;
  userDestino.saldo += monto;
  const hora = new Date().toLocaleString();
  userOrigen.movimientos.push(`Enviado a ${destino} | $${monto} | ${hora}`);
  userDestino.movimientos.push(`Recibido de ${origen} | $${monto} | ${hora}`);
  await userOrigen.save();
  await userDestino.save();
  res.json({ ok: true, mensaje: "Transferencia realizada" });
});

app.get("/cuenta/:id", async (req, res) => {
  const user = await Usuario.findOne({ cuenta: req.params.id });
  if (!user) return res.json({ ok: false, mensaje: "Cuenta no encontrada" });
  const criptos = {};
  if (user.criptomonedas) user.criptomonedas.forEach((val, key) => { criptos[key] = val; });
  res.json({ ok: true, correo: user.correo, cuenta: user.cuenta, saldo: user.saldo, movimientos: user.movimientos, criptomonedas: criptos, nombre: user.nombre, foto: user.foto, fechaRegistro: user.fechaRegistro || "" });
});

const pinsTemporales = new Map();
app.post("/enviar-pin", async (req, res) => {
  const { correo } = req.body;
  const user = await Usuario.findOne({ correo });
  if (!user) return res.json({ ok: false, mensaje: "Correo no registrado" });
  const pin = Math.floor(100000 + Math.random() * 900000);
  pinsTemporales.set(correo, pin);
  setTimeout(() => pinsTemporales.delete(correo), 600000);
  res.json({ ok: true, mensaje: "PIN enviado", pin });
});

app.post("/cambiar-password", async (req, res) => {
  const { correo, nuevaPassword } = req.body;
  const user = await Usuario.findOne({ correo });
  if (!user) return res.json({ ok: false, mensaje: "Correo no encontrado" });
  user.password = await bcrypt.hash(nuevaPassword, 10);
  await user.save();
  res.json({ ok: true, mensaje: "Contraseña actualizada" });
});

app.post("/perfil/guardar", async (req, res) => {
  const { cuenta, nombre, foto } = req.body;
  const user = await Usuario.findOne({ cuenta });
  if (!user) return res.json({ ok: false, mensaje: "Cuenta no encontrada" });
  if (nombre !== undefined) user.nombre = nombre;
  if (foto !== undefined) user.foto = foto;
  await user.save();
  res.json({ ok: true, mensaje: "Perfil actualizado" });
});

app.get("/criptos/precios", async (req, res) => {
  try {
    const precios = await PrecioCripto.find({});
    const obj = {};
    const historial = {};
    precios.forEach(p => { obj[p.simbolo] = p.precio; historial[p.simbolo] = p.historial || [p.precio]; });
    res.json({ ok: true, precios: obj, historial });
  } catch (err) { res.json({ ok: false, mensaje: "Error" }); }
});

app.post("/comprar-criptos", async (req, res) => {
  const { cuenta, items, total } = req.body;
  const user = await Usuario.findOne({ cuenta });
  if (!user) return res.json({ ok: false, mensaje: "Cuenta no encontrada" });
  if (user.saldo < total) return res.json({ ok: false, mensaje: "Saldo insuficiente" });
  const preciosDB = await PrecioCripto.find({});
  const preciosObj = {};
  preciosDB.forEach(p => { preciosObj[p.simbolo] = p.precio; });
  let totalReal = 0;
  for (let [sim, qty] of Object.entries(items)) {
    totalReal += preciosObj[sim] * qty;
  }
  user.saldo -= totalReal;
  const hora = new Date().toLocaleString();
  const resumen = [];
  for (let [sim, qty] of Object.entries(items)) {
    let actual = user.criptomonedas.get(sim) || 0;
    user.criptomonedas.set(sim, actual + qty);
    resumen.push(`${qty} ${sim}`);
  }
  user.movimientos.push(`Compra: ${resumen.join(", ")} | -$${totalReal} | ${hora}`);
  user.markModified("criptomonedas");
  await user.save();
  res.json({ ok: true, mensaje: `Compra realizada` });
});

// VENDER CRIPTO
app.post("/vender-cripto", async (req, res) => {
  const { cuenta, simbolo, cantidad, precio } = req.body;
  const user = await Usuario.findOne({ cuenta });
  if (!user) return res.json({ ok: false, mensaje: "Cuenta no encontrada" });
  const disponible = user.criptomonedas.get(simbolo) || 0;
  if (disponible < cantidad) return res.json({ ok: false, mensaje: "No tienes suficientes" });
  const precioDB = await PrecioCripto.findOne({ simbolo });
  const precioActual = precioDB ? precioDB.precio : precio;
  const monto = precioActual * cantidad;
  user.saldo += monto;
  const nuevaCantidad = disponible - cantidad;
  if (nuevaCantidad === 0) user.criptomonedas.delete(simbolo);
  else user.criptomonedas.set(simbolo, nuevaCantidad);
  const hora = new Date().toLocaleString();
  user.movimientos.push(`Venta: ${cantidad} ${simbolo} | +$${monto} | ${hora}`);
  user.markModified("criptomonedas");
  await user.save();
  res.json({ ok: true, mensaje: `Vendiste ${cantidad} ${simbolo} por $${monto}` });
});

// COMENTARIOS
app.post("/comentarios/nuevo", async (req, res) => {
  const { cuenta, estrellas, texto, nombre, foto } = req.body;
  if (!cuenta || !estrellas || !texto) return res.json({ ok: false, mensaje: "Datos incompletos" });
  const nuevo = new Comentario({ cuenta, nombre: nombre || "", foto: foto || "", estrellas, texto });
  await nuevo.save();
  res.json({ ok: true, mensaje: "Reseña publicada" });
});

app.get("/comentarios", async (req, res) => {
  try {
    const comentarios = await Comentario.find({}).sort({ _id: -1 });
    res.json({ ok: true, comentarios });
  } catch (err) { res.json({ ok: false, mensaje: "Error" }); }
});

app.get("/comentarios/usuario/:cuenta", async (req, res) => {
  try {
    const comentarios = await Comentario.find({ cuenta: req.params.cuenta });
    res.json({ ok: true, comentarios });
  } catch (err) { res.json({ ok: false, mensaje: "Error" }); }
});

// ADMIN
app.get("/admin/cuentas", verificarAdmin, async (req, res) => {
  const cuentas = await Usuario.find({}, { correo: 1, cuenta: 1, saldo: 1, movimientos: 1, criptomonedas: 1, nombre: 1, foto: 1, fechaRegistro: 1, _id: 0 });
  res.json({ ok: true, cuentas });
});

app.post("/admin/editar-saldo", verificarAdmin, async (req, res) => {
  const { cuenta, nuevoSaldo } = req.body;
  const user = await Usuario.findOne({ cuenta });
  if (!user) return res.json({ ok: false, mensaje: "Cuenta no encontrada" });
  user.saldo = nuevoSaldo;
  await user.save();
  res.json({ ok: true, mensaje: `Saldo actualizado` });
});

app.post("/admin/borrar-cuenta", verificarAdmin, async (req, res) => {
  const { cuenta } = req.body;
  await Usuario.deleteOne({ cuenta });
  res.json({ ok: true, mensaje: `Cuenta eliminada` });
});

app.post("/admin/editar-precio-cripto", verificarAdmin, async (req, res) => {
  const { simbolo, precio } = req.body;
  await PrecioCripto.findOneAndUpdate({ simbolo }, { precio }, { upsert: true });
  res.json({ ok: true, mensaje: `Precio actualizado` });
});

app.post("/admin/quitar-cripto", verificarAdmin, async (req, res) => {
  const { cuenta, simbolo } = req.body;
  const user = await Usuario.findOne({ cuenta });
  if (!user) return res.json({ ok: false, mensaje: "Cuenta no encontrada" });
  user.criptomonedas.delete(simbolo);
  user.markModified("criptomonedas");
  await user.save();
  res.json({ ok: true, mensaje: `Cripto eliminada` });
});

app.post("/admin/borrar-opinion", verificarAdmin, async (req, res) => {
  const { id } = req.body;
  await Comentario.deleteOne({ _id: id });
  res.json({ ok: true, mensaje: `Reseña eliminada` });
});

// ===============================
//   SERVIR EL HTML (IMPORTANTE!)
// ===============================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "paginapr.html"));
});

app.get("/paginapr", (req, res) => {
  res.sendFile(path.join(__dirname, "paginapr.html"));
});

// ===============================
//   INICIAR SERVIDOR
// ===============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
