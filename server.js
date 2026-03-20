const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const SibApiV3Sdk = require("sib-api-v3-sdk");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Usuario = require("./models/Usuario");
const Compra = require("./models/Compra"); // nuevo modelo para compras

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Conexión MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB conectado"))
  .catch(err => console.error("Error MongoDB:", err));

// Servir archivos estáticos desde la carpeta views
app.use(express.static(path.join(__dirname, "views")));


// Ruta principal (login)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "1pag.html"));
});




// Configuración Brevo API
let defaultClient = SibApiV3Sdk.ApiClient.instance;
let apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY;
let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

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

  const nuevo = new Usuario({
    correo,
    password: hash,
    cuenta,
    saldo: 10000,
    movimientos: []
  });

  await nuevo.save();

  res.json({
    ok: true,
    correo: nuevo.correo,
    cuenta: nuevo.cuenta,
    saldo: nuevo.saldo,
    mensaje: "Cuenta creada con saldo inicial de $10000"
  });
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

  res.json({
    ok: true,
    correo: user.correo,
    cuenta: user.cuenta,
    saldo: user.saldo
  });
});

// ===============================
//   DEPOSITAR ENTRE CUENTAS + Ticket
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

  // Ticket para ambos
  let ticketOrigen = new SibApiV3Sdk.SendSmtpEmail();
  ticketOrigen.sender = { email: "mg307966@gmail.com" };
  ticketOrigen.to = [{ email: userOrigen.correo }];
  ticketOrigen.subject = "Ticket de depósito enviado - Banco Libre";
  ticketOrigen.textContent = `Has realizado un depósito:\n\nOrigen: ${origen}\nDestino: ${destino}\nMonto: $${monto}\nHora: ${hora}`;

  let ticketDestino = new SibApiV3Sdk.SendSmtpEmail();
  ticketDestino.sender = { email: "mg307966@gmail.com" };
  ticketDestino.to = [{ email: userDestino.correo }];
  ticketDestino.subject = "Ticket de depósito recibido - Banco Libre";
  ticketDestino.textContent = `Has recibido un depósito:\n\nOrigen: ${origen}\nDestino: ${destino}\nMonto: $${monto}\nHora: ${hora}`;

  try {
    await apiInstance.sendTransacEmail(ticketOrigen);
    await apiInstance.sendTransacEmail(ticketDestino);
    res.json({ ok: true, mensaje: "Depósito realizado " });
  } catch (error) {
    res.json({ ok: true, mensaje: "Depósito realizado, pero error al enviar tickets: " + error.toString() });
  }
});

// ===============================
//   CONSULTAR CUENTA
// ===============================
app.get("/cuenta/:cuenta", async (req, res) => {
  const user = await Usuario.findOne({ cuenta: req.params.cuenta });
  if (!user) return res.json({ ok: false, mensaje: "Cuenta no encontrada" });

  res.json({
    ok: true,
    correo: user.correo,
    cuenta: user.cuenta,
    saldo: user.saldo,
    movimientos: user.movimientos
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

  let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendSmtpEmail.sender = { email: "mg307966@gmail.com" };
  sendSmtpEmail.to = [{ email: correo }];
  sendSmtpEmail.subject = "PIN de restablecimiento - Banco Libre";
  sendSmtpEmail.textContent = `Cuenta: ${user.cuenta}\nPIN: ${pin}`;

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    res.json({ ok: true, mensaje: "PIN enviado", pin, cuenta: user.cuenta });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: error.toString() });
  }
});

// ===============================
//   CAMBIAR PASSWORD
// ===============================
app.post("/cambiar-password", async (req, res) => {
  const { correo, nuevaPassword } = req.body;

  const user = await Usuario.findOne({ correo });
  if (!user) return res.json({ ok: false, mensaje: "Correo no registrado" });

  const hash = await bcrypt.hash(nuevaPassword, 10);
  user.password = hash;
  await user.save();

  res.json({ ok: true, mensaje: "Contraseña cambiada" });
}); 
// ===============================
//   CRIPTOMONEDAS: Carrito y Compras
// ===============================

// Carritos por usuario (clave = correo)
let carritos = {};

// Agregar al carrito
app.post("/carrito/add", (req, res) => {
  const { userEmail, crypto, cantidad } = req.body;
  if (!carritos[userEmail]) carritos[userEmail] = [];
  carritos[userEmail].push({ crypto, cantidad });
  res.json({ ok: true, mensaje: `${crypto} agregado al carrito` });
});

// Ver carrito del usuario
app.get("/carrito/:userEmail", (req, res) => {
  const { userEmail } = req.params;
  res.json({ ok: true, carrito: carritos[userEmail] || [] });
});

// Eliminar del carrito
app.post("/carrito/remove", (req, res) => {
  const { userEmail, crypto } = req.body;
  if (carritos[userEmail]) {
    carritos[userEmail] = carritos[userEmail].filter(item => item.crypto !== crypto);
  }
  res.json({ ok: true, mensaje: `${crypto} eliminado del carrito` });
});

// Checkout del carrito
app.post("/carrito/checkout", async (req, res) => {
  const { userEmail } = req.body;

  const ticketId = Date.now().toString();
  const fecha = new Date().toLocaleString();
  const items = [...(carritos[userEmail] || [])];

  // Calcular total
  let total = 0;
  items.forEach(i => total += i.cantidad * i.precioUnitario);

  // Guardar compra en DB
  await Compra.create({ ticketId, fecha, items, userEmail, total });

  // Actualizar saldo y movimientos
  const user = await Usuario.findOne({ correo: userEmail });
  if (user) {
    user.saldo -= total;
    user.movimientos.push(
      `Compra de ${items.map(i => `${i.crypto} x${i.cantidad}`).join(", ")} | $${total} | ${fecha}`
    );
    await user.save();
  }

  // Vaciar carrito
  carritos[userEmail] = [];

  res.json({ ok: true, mensaje: "Compra registrada correctamente." });
});


// ===============================
//   MIS CRIPTOS (solo compras)
// ===============================
app.get("/mis-criptos/:userEmail", async (req, res) => {
  const compras = await Compra.find({ userEmail: req.params.userEmail });
  res.json({ ok: true, compras });
});

// ===============================
//   API Historial de Compras
// ===============================
app.get("/api/compras", async (req, res) => {
  const compras = await Compra.find();
  res.json(compras);
});
// Puerto Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});