const mongoose = require("mongoose");

const UsuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  correo: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  cuenta: { type: String, required: true, unique: true },
  saldo: { type: Number, default: 0 },
  movimientos: { type: [String], default: [] }
});

module.exports = mongoose.model("Usuario", UsuarioSchema);
