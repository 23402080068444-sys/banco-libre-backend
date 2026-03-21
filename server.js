const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const bcrypt = require("bcryptjs");              // 👈 añadimos bcrypt
const SibApiV3Sdk = require("sib-api-v3-sdk");   // SDK correcto

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
  password: String, // almacenada en hash
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

  // 👇 encriptamos la contraseña
  const hash = await bcrypt.hash(password, 10);

  const nuevo = new Usuario({ correo, password: hash, cuenta, saldo: 10000, movimientos: [] });
  await nuevo.save();

  // Enviar correo de bienvenida
  let sendEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendEmail.sender = { email: "noreply@bancolibre.com", name: "Banco Libre" };
  sendEmail.to = [{ email: correo }];
  sendEmail.subject = "Bienvenido a Banco Libre";
  sendEmail.htmlContent = `<h1>Bienvenido</h1><p>Tu cuenta ${cuenta} ha sido creada exitosamente con saldo inicial de $10000.</p>`;

  await apiInstance.sendTransacEmail(sendEmail);

  res.json({ ok: true, mensaje: "Cuenta creada correctamente" });
});

// ===============================
//   LOGIN
// ===============================
app.post("/login", async (req, res) => {
  const { cuenta, password } = req.body;

  // 👇 buscamos solo por cuenta
  const user = await Usuario.findOne({ cuenta });
  if (!user) return res.json({ ok: false, mensaje: "Cuenta no encontrada" });

  // 👇 comparamos hash con bcrypt
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.json({ ok: false, mensaje: "Contraseña incorrecta" });

  res.json({ ok: true, cuenta: user.cuenta, correo: user.correo, saldo: user.saldo });
});

// ===============================
//   (resto de tus APIs: depositar, consultar cuenta, enviar pin, cambiar password)
// ===============================

// Servidor
app.listen(3000, () => console.log("Servidor Banco Libre en puerto 3000"));
