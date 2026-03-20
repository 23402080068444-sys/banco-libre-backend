// models/Cuenta.js
const mongoose = require("mongoose");
const CuentaSchema = new mongoose.Schema({
  usuario: String,
  password: String,
  correo: String,
  saldo: Number,
  movimientos: [String]
});
module.exports = mongoose.model("Cuenta", CuentaSchema);

// server.js
app.post("/crear-cuenta", async (req, res) => {
  const { usuario, password, correo } = req.body;
  const existe = await Cuenta.findOne({ usuario });
  if(existe) return res.json({ ok:false, mensaje:"La cuenta ya existe" });

  const nueva = new Cuenta({ usuario, password, correo, saldo:10000, movimientos:[] });
  await nueva.save();
  res.json({ ok:true, mensaje:"Cuenta creada con saldo inicial de $10000" });
});
