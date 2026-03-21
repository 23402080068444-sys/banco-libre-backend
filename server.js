const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const brevo = require("@getbrevo/brevo");

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
let apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

// ===============================
//   CREAR CUENTA
// ===============================
app.post("/crear-cuenta", async (req, res) => {
  const { correo, password, cuenta } = req.body;

  // Validar cuenta
  if (!/^\d{10}$/.test(cuenta)) {
    return res.json({ ok: false, mensaje: "El número de cuenta debe tener exactamente 10 dígitos" });
  }

  // Validar duplicados
  const existeCorreo = await Usuario.findOne({ correo });
  if (existeCorreo) return res.json({ ok: false, mensaje: "Correo ya registrado" });

  const existeCuenta = await Usuario.findOne({ cuenta });
  if (existeCuenta) return res.json({ ok: false, mensaje: "Número de cuenta ya registrado" });

  // Crear usuario
  const nuevo = new Usuario({ correo, password, cuenta, saldo: 10000, movimientos: [] });
  await nuevo.save();

  // Enviar correo de bienvenida
  await apiInstance.sendTransacEmail({
    sender: { email: "noreply@bancolibre.com", name: "Banco Libre" },
    to: [{ email: correo }],
    subject: "Bienvenido a Banco Libre",
    htmlContent: `<h1>Bienvenido</h1><p>Tu cuenta ${cuenta} ha sido creada exitosamente con saldo inicial de $10000.</p>`
  });

  res.json({ ok: true, mensaje: "Cuenta creada correctamente" });
});

// ===============================
//   LOGIN
// ===============================
app.post("/login", async (req, res) => {
  const { cuenta, password } = req.body;
  const user = await Usuario.findOne({ cuenta, password });
  if (!user) return res.json({ ok: false, mensaje: "Credenciales inválidas" });

  res.json({ ok: true, cuenta: user.cuenta, correo: user.correo, saldo: user.saldo });
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

  // Ticket por correo
  await apiInstance.sendTransacEmail({
    sender: { email: "noreply@bancolibre.com", name: "Banco Libre" },
    to: [{ email: userOrigen.correo }],
    subject: "Ticket de depósito enviado",
    htmlContent: `<p>Has realizado un depósito:</p>
                  <p>Origen: ${origen}</p>
                  <p>Destino: ${destino}</p>
                  <p>Monto: $${monto}</p>
                  <p>Hora: ${hora}</p>`
  });

  await apiInstance.sendTransacEmail({
    sender: { email: "noreply@bancolibre.com", name: "Banco Libre" },
    to: [{ email: userDestino.correo }],
    subject: "Ticket de depósito recibido",
    htmlContent: `<p>Has recibido un depósito:</p>
                  <p>Origen: ${origen}</p>
                  <p>Destino: ${destino}</p>
                  <p>Monto: $${monto}</p>
                  <p>Hora: ${hora}</p>`
  });

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

  await apiInstance.sendTransacEmail({
    sender: { email: "noreply@bancolibre.com", name: "Banco Libre" },
    to: [{ email: correo }],
    subject: "PIN de recuperación",
    htmlContent: `<p>Cuenta: ${user.cuenta}</p><p>PIN: <strong>${pin}</strong></p>`
  });

  res.json({ ok: true, mensaje: "PIN enviado", pin, cuenta: user.cuenta });
});

// ===============================
//   CAMBIAR PASSWORD
// ===============================
app.post("/cambiar-password", async (req, res) => {
  const { correo, nuevaPassword } = req.body;
  const user = await Usuario.findOne({ correo });
  if (!user) return res.json({ ok: false, mensaje: "Correo no encontrado" });

  user.password = nuevaPassword;
  await user.save();
  res.json({ ok: true, mensaje: "Contraseña actualizada" });
});

// ===============================
//   Servidor
// ===============================
app.listen(3000, () => console.log("Servidor Banco Libre en puerto 3000"));
