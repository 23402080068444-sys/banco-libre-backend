const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const SibApiV3Sdk = require("sib-api-v3-sdk");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Usuario = require("./models/Usuario");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Conexión MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB conectado"))
  .catch(err => console.error("Error MongoDB:", err));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname)));

// Rutas HTML
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "1pag.html"));
});

app.get("/paginapr.html", (req, res) => {
  res.sendFile(path.join(__dirname, "paginapr.html"));
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
  const { nombre, correo, password } = req.body;

  const existe = await Usuario.findOne({ correo });
  if (existe) return res.json({ success: false, message: "Correo ya registrado" });

  const cuenta = Math.floor(100000 + Math.random() * 900000).toString();
  const hash = await bcrypt.hash(password, 10);

  const nuevo = new Usuario({
    nombre,
    correo,
    password: hash,
    cuenta,
    saldo: 0
  });

  await nuevo.save();

  res.json({ success: true, cuenta });
});


// ===============================
//   LOGIN
// ===============================
app.post("/login", async (req, res) => {
  const { correo, password } = req.body;

  const user = await Usuario.findOne({ correo });
  if (!user) return res.json({ success: false, message: "Usuario no encontrado" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.json({ success: false, message: "Contraseña incorrecta" });

  res.json({
    success: true,
    nombre: user.nombre,
    cuenta: user.cuenta,
    saldo: user.saldo
  });
});


// ===============================
//   DEPOSITAR ENTRE CUENTAS
// ===============================
app.post("/depositar", async (req, res) => {
  const { origen, destino, monto } = req.body;

  const userOrigen = await Usuario.findOne({ cuenta: origen });
  const userDestino = await Usuario.findOne({ cuenta: destino });

  if (!userOrigen || !userDestino)
    return res.json({ success: false, message: "Cuenta no encontrada" });

  if (userOrigen.saldo < monto)
    return res.json({ success: false, message: "Saldo insuficiente" });

  userOrigen.saldo -= monto;
  userDestino.saldo += monto;

  await userOrigen.save();
  await userDestino.save();

  res.json({ success: true, message: "Depósito realizado" });
});


// ===============================
//   CONSULTAR SALDO
// ===============================
app.get("/saldo/:cuenta", async (req, res) => {
  const user = await Usuario.findOne({ cuenta: req.params.cuenta });
  if (!user) return res.json({ success: false, message: "Cuenta no encontrada" });

  res.json({ success: true, saldo: user.saldo });
});


// ===============================
//   ENVIAR CORREO
// ===============================
app.post("/enviar-correo", async (req, res) => {
  const { destino, monto, correo, origen, hora } = req.body;

  let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendSmtpEmail.sender = { email: "mg307966@gmail.com" };
  sendSmtpEmail.to = [{ email: correo }];
  sendSmtpEmail.subject = "Ticket de depósito - Banco Libre";
  sendSmtpEmail.textContent = `Se ha realizado un depósito:\n\nOrigen: ${origen}\nDestino: ${destino}\nMonto: $${monto}\nHora: ${hora}`;

  try {
    let data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    res.json({ success: true, message: "Correo enviado", data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.toString() });
  }
});


// ===============================
//   ENVIAR PIN
// ===============================
app.post("/enviar-pin", async (req, res) => {
  const { correo, pin, cuenta } = req.body;

  let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendSmtpEmail.sender = { email: "mg307966@gmail.com" };
  sendSmtpEmail.to = [{ email: correo }];
  sendSmtpEmail.subject = "PIN de restablecimiento - Banco Libre";
  sendSmtpEmail.textContent = `Cuenta: ${cuenta}\nPIN: ${pin}`;

  try {
    let data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    res.json({ success: true, message: "PIN enviado", data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.toString() });
  }
});


// Puerto Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
