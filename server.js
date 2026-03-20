const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const SibApiV3Sdk = require("sib-api-v3-sdk");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 👉 Servir archivos estáticos
app.use(express.static(path.join(__dirname)));

// 👉 Ruta raíz
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "1pag.html"));
});

// 👉 Ruta secundaria
app.get("/paginapr.html", (req, res) => {
  res.sendFile(path.join(__dirname, "paginapr.html"));
});

// ⚠️ Configuración Brevo API
let defaultClient = SibApiV3Sdk.ApiClient.instance;
let apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY;
let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

// Endpoint para enviar ticket de depósito
app.post("/enviar-correo", async (req, res) => {
  console.log("Datos recibidos en /enviar-correo:", req.body);
  const { destino, monto, correo, origen, hora } = req.body;

  if (!correo) {
    return res.status(400).json({ success: false, message: "Correo destino inválido" });
  }

  let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendSmtpEmail.sender = { email: "tu-correo-verificado@dominio.com" }; // remitente verificado en Brevo
  sendSmtpEmail.to = [{ email: correo }];
  sendSmtpEmail.subject = "Ticket de depósito - Banco Libre";
  sendSmtpEmail.textContent = `Se ha realizado un depósito:\n\nOrigen: ${origen}\nDestino: ${destino}\nMonto: $${monto}\nHora: ${hora}\n\nGracias por usar Banco Libre.`;

  try {
    let data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("Correo enviado:", data);
    res.json({ success: true, message: "Correo enviado", data });
  } catch (error) {
    console.error("Error al enviar correo:", error);
    res.status(500).json({ success: false, message: error.toString() });
  }
});

// Endpoint para enviar PIN de restablecimiento
app.post("/enviar-pin", async (req, res) => {
  console.log("Datos recibidos en /enviar-pin:", req.body);
  const { correo, pin, cuenta } = req.body;

  if (!correo) {
    return res.status(400).json({ success: false, message: "Correo inválido" });
  }

  let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendSmtpEmail.sender = { email: "tu-correo-verificado@dominio.com" }; // remitente verificado en Brevo
  sendSmtpEmail.to = [{ email: correo }];
  sendSmtpEmail.subject = "PIN de restablecimiento - Banco Libre";
  sendSmtpEmail.textContent = `Hola, se solicitó un restablecimiento de contraseña.\n\nCuenta: ${cuenta}\nPIN de verificación: ${pin}\n\nIngresa este PIN en la aplicación para cambiar tu contraseña.`;

  try {
    let data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("PIN enviado:", data);
    res.json({ success: true, message: "PIN enviado", data });
  } catch (error) {
    console.error("Error al enviar PIN:", error);
    res.status(500).json({ success: false, message: error.toString() });
  }
});

// Puerto dinámico
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
