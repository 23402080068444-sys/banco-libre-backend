const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 👉 Servir archivos estáticos (HTML, CSS, imágenes, etc.)
app.use(express.static(path.join(__dirname)));

// 👉 Ruta raíz que abre 1pag.html como principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "1pag.html"));
});

// 👉 Ruta para paginapr.html
app.get("/paginapr.html", (req, res) => {
  res.sendFile(path.join(__dirname, "paginapr.html"));
});

// ⚠️ Configuración de transporte SMTP con Gmail (credenciales directas)
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "mg307966@gmail.com",              // tu correo
    pass: "vmuc blcu yczg wjyd"              // tu contraseña de aplicación
  }
});

// Endpoint para enviar ticket de depósito
app.post("/enviar-correo", (req, res) => {
  console.log("Datos recibidos en /enviar-correo:", req.body);
  const { destino, monto, correo, origen, hora } = req.body;

  if (!correo) {
    console.error("Error: correo destino vacío o inválido");
    return res.status(400).json({ success: false, message: "Correo destino inválido" });
  }

  let mailOptions = {
    from: "mg307966@gmail.com",
    to: correo,
    subject: "Ticket de depósito - Banco Libre",
    text: `Se ha realizado un depósito:\n\nOrigen: ${origen}\nDestino: ${destino}\nMonto: $${monto}\nHora: ${hora}\n\nGracias por usar Banco Libre.`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error al enviar correo:", error);
      return res.status(500).json({ success: false, message: error.toString() });
    }
    console.log("Correo enviado:", info.response);
    res.json({ success: true, message: "Correo enviado", data: info.response });
  });
});

// Endpoint para enviar PIN de restablecimiento
app.post("/enviar-pin", (req, res) => {
  console.log("Datos recibidos en /enviar-pin:", req.body);
  const { correo, pin, cuenta } = req.body;

  if (!correo) {
    console.error("Error: correo vacío o inválido");
    return res.status(400).json({ success: false, message: "Correo inválido" });
  }

  let mailOptions = {
    from: "mg307966@gmail.com",
    to: correo,
    subject: "PIN de restablecimiento - Banco Libre",
    text: `Hola, se solicitó un restablecimiento de contraseña.\n\nCuenta: ${cuenta}\nPIN de verificación: ${pin}\n\nIngresa este PIN en la aplicación para cambiar tu contraseña.`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error al enviar PIN:", error);
      return res.status(500).json({ success: false, message: error.toString() });
    }
    console.log("PIN enviado:", info.response);
    res.json({ success: true, message: "PIN enviado", data: info.response });
  });
});

// Puerto dinámico para despliegue en la nube (Render)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
